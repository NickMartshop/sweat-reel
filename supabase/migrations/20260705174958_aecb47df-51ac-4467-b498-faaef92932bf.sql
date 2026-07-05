ALTER TABLE public.profiles
  ADD COLUMN fitness_goal text,
  ADD COLUMN default_difficulty text NOT NULL DEFAULT 'Medium',
  ADD COLUMN rest_timer_seconds integer NOT NULL DEFAULT 60,
  ADD COLUMN auto_advance_rest boolean NOT NULL DEFAULT false;

ALTER TABLE public.weekly_plans ALTER COLUMN workout_id DROP NOT NULL;
ALTER TABLE public.weekly_plans ADD COLUMN rest_type text;

CREATE TABLE public.body_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric,
  body_fat_pct numeric,
  notes text,
  logged_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_stats TO authenticated;
GRANT ALL ON public.body_stats TO service_role;
ALTER TABLE public.body_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own body_stats all" ON public.body_stats
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX body_stats_user_logged_idx ON public.body_stats(user_id, logged_at DESC);