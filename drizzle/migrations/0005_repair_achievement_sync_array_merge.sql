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
  existing_ids text[] := ARRAY[]::text[];
  earned text[] := ARRAY[]::text[];
  newly_earned text[] := ARRAY[]::text[];
  achievement_id text;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO profile_row FROM public.profiles WHERE id = caller_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  SELECT COALESCE(array_agg(value), ARRAY[]::text[]) INTO existing_ids
  FROM jsonb_array_elements_text(COALESCE(profile_row.unlocked_achievements, '[]'::jsonb)) AS value;

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
    IF NOT achievement_id = ANY(existing_ids) THEN
      newly_earned := array_append(newly_earned, achievement_id);
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET unlocked_achievements = to_jsonb(ARRAY(
    SELECT DISTINCT achievement_id
    FROM unnest(existing_ids || earned) AS achievement_id
  ))
  WHERE id = caller_id;
  RETURN newly_earned;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_my_achievements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_my_achievements() TO authenticated;