
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time text,
  ADD COLUMN IF NOT EXISTS unlocked_achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_extractions_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by text;
