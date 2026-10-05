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
  IF NEW.day_of_week < 0 OR NEW.day_of_week > 6 THEN
    RAISE EXCEPTION 'Invalid plan day';
  END IF;
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