-- Restrict profile writes to user-editable fields; protect server-derived counters and awards.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (name, email, notifications_enabled, reminder_time, referred_by, fitness_goal, default_difficulty, rest_timer_seconds, auto_advance_rest) ON TABLE public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_server_derived_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'service_role', 'supabase_admin') AND (
    NEW.streak_count IS DISTINCT FROM OLD.streak_count OR
    NEW.best_streak IS DISTINCT FROM OLD.best_streak OR
    NEW.last_workout_date IS DISTINCT FROM OLD.last_workout_date OR
    NEW.total_workouts IS DISTINCT FROM OLD.total_workouts OR
    NEW.ai_extractions_count IS DISTINCT FROM OLD.ai_extractions_count OR
    NEW.ai_extractions_used IS DISTINCT FROM OLD.ai_extractions_used OR
    NEW.unlocked_achievements IS DISTINCT FROM OLD.unlocked_achievements
  ) THEN
    RAISE EXCEPTION 'Progress and usage fields are server-managed';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_server_derived_profile_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS profiles_guard_server_derived_fields ON public.profiles;
CREATE TRIGGER profiles_guard_server_derived_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_server_derived_profile_fields();

-- The free AI quota and its achievement counter are changed only by trusted server calls.
CREATE OR REPLACE FUNCTION public.reserve_ai_extraction(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_row FROM public.profiles WHERE id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF profile_row.is_premium AND (profile_row.premium_expires_at IS NULL OR profile_row.premium_expires_at > now()) THEN
    RETURN true;
  END IF;
  IF profile_row.ai_extractions_used >= 3 THEN
    RETURN false;
  END IF;
  UPDATE public.profiles SET ai_extractions_used = ai_extractions_used + 1 WHERE id = _user_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_ai_extraction(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_extraction(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.release_ai_extraction(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET ai_extractions_used = GREATEST(ai_extractions_used - 1, 0)
  WHERE id = _user_id AND ai_extractions_used > 0;
$$;
REVOKE ALL ON FUNCTION public.release_ai_extraction(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_ai_extraction(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.record_ai_extraction_success(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET ai_extractions_count = ai_extractions_count + 1 WHERE id = _user_id;
$$;
REVOKE ALL ON FUNCTION public.record_ai_extraction_success(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ai_extraction_success(uuid) TO service_role;

-- Complete a workout and update streak metrics as one authenticated, atomic operation.
CREATE OR REPLACE FUNCTION public.complete_workout(_workout_id uuid, _duration_mins integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  profile_row public.profiles%ROWTYPE;
  today date := current_date;
  day_gap integer;
  next_streak integer;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _duration_mins < 1 OR _duration_mins > 600 THEN RAISE EXCEPTION 'Invalid duration'; END IF;
  IF _workout_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.workouts WHERE id = _workout_id AND user_id = caller_id
  ) THEN RAISE EXCEPTION 'Workout not found'; END IF;
  SELECT * INTO profile_row FROM public.profiles WHERE id = caller_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  INSERT INTO public.completed_workouts (user_id, workout_id, duration_mins)
  VALUES (caller_id, _workout_id, _duration_mins);

  IF profile_row.last_workout_date IS NULL THEN
    next_streak := 1;
  ELSE
    day_gap := today - profile_row.last_workout_date;
    IF day_gap = 0 THEN next_streak := profile_row.streak_count;
    ELSIF day_gap = 1 THEN next_streak := profile_row.streak_count + 1;
    ELSE next_streak := 1;
    END IF;
  END IF;

  UPDATE public.profiles SET
    streak_count = next_streak,
    best_streak = GREATEST(profile_row.best_streak, next_streak),
    last_workout_date = today,
    total_workouts = profile_row.total_workouts + 1,
    updated_at = now()
  WHERE id = caller_id;
  RETURN next_streak;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_workout(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_workout(uuid, integer) TO authenticated;

-- Only actual, database-backed milestones can be persisted as unlocked.
CREATE OR REPLACE FUNCTION public.sync_my_achievements()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  profile_row public.profiles%ROWTYPE;
  saved_count integer;
  planned_days integer;
  earned text[] := ARRAY[]::text[];
  newly_earned text[] := ARRAY[]::text[];
  achievement_id text;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO profile_row FROM public.profiles WHERE id = caller_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  SELECT count(*) INTO saved_count FROM public.workouts WHERE user_id = caller_id;
  SELECT count(DISTINCT day_of_week) INTO planned_days
  FROM public.weekly_plans
  WHERE user_id = caller_id AND week_start_date = date_trunc('week', current_date)::date;

  IF profile_row.total_workouts >= 1 THEN earned := array_append(earned, 'first_sweat'); END IF;
  IF planned_days >= 7 THEN earned := array_append(earned, 'week_warrior'); END IF;
  IF GREATEST(profile_row.best_streak, profile_row.streak_count) >= 7 THEN earned := array_append(earned, 'streak_7'); END IF;
  IF saved_count >= 10 THEN earned := array_append(earned, 'library_builder'); END IF;
  IF profile_row.ai_extractions_count >= 5 THEN earned := array_append(earned, 'ai_user'); END IF;
  IF GREATEST(profile_row.best_streak, profile_row.streak_count) >= 30 THEN earned := array_append(earned, 'streak_30'); END IF;

  FOREACH achievement_id IN ARRAY earned LOOP
    IF NOT achievement_id = ANY(profile_row.unlocked_achievements) THEN
      newly_earned := array_append(newly_earned, achievement_id);
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET unlocked_achievements = ARRAY(SELECT DISTINCT unnest(profile_row.unlocked_achievements || earned))::jsonb
  WHERE id = caller_id;
  RETURN newly_earned;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_my_achievements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_my_achievements() TO authenticated;

-- Enforce the advertised free workout-library and weekly planning limits at the database boundary.
CREATE OR REPLACE FUNCTION public.enforce_free_workout_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row public.profiles%ROWTYPE;
  existing_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.user_id <> auth.uid() THEN RAISE EXCEPTION 'Workout owner must match signed-in user'; END IF;
  SELECT * INTO profile_row FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF NOT (profile_row.is_premium AND (profile_row.premium_expires_at IS NULL OR profile_row.premium_expires_at > now())) THEN
    SELECT count(*) INTO existing_count FROM public.workouts WHERE user_id = NEW.user_id;
    IF existing_count >= 15 THEN RAISE EXCEPTION 'Free plan workout limit reached'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_free_workout_limit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS workouts_enforce_free_limit ON public.workouts;
CREATE TRIGGER workouts_enforce_free_limit
BEFORE INSERT ON public.workouts
FOR EACH ROW EXECUTE FUNCTION public.enforce_free_workout_limit();

CREATE OR REPLACE FUNCTION public.enforce_free_weekly_plan_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.user_id <> auth.uid() THEN RAISE EXCEPTION 'Plan owner must match signed-in user'; END IF;
  SELECT * INTO profile_row FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF NOT (profile_row.is_premium AND (profile_row.premium_expires_at IS NULL OR profile_row.premium_expires_at > now())) AND NEW.day_of_week > 2 THEN
    RAISE EXCEPTION 'Free plan supports planning the first three days';
  END IF;
  IF NEW.workout_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.workouts WHERE id = NEW.workout_id AND user_id = NEW.user_id
  ) THEN RAISE EXCEPTION 'Workout not found'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_free_weekly_plan_limit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS weekly_plans_enforce_free_limit ON public.weekly_plans;
CREATE TRIGGER weekly_plans_enforce_free_limit
BEFORE INSERT OR UPDATE ON public.weekly_plans
FOR EACH ROW EXECUTE FUNCTION public.enforce_free_weekly_plan_limit();

-- Completed history is inserted only by complete_workout; owners retain read/delete access.
DROP POLICY IF EXISTS "own completed all" ON public.completed_workouts;
CREATE POLICY "own completed select" ON public.completed_workouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own completed delete" ON public.completed_workouts FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE ON TABLE public.completed_workouts FROM authenticated;
GRANT SELECT, DELETE ON TABLE public.completed_workouts TO authenticated;
GRANT ALL ON TABLE public.completed_workouts TO service_role;