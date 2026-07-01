-- Add is_pro column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false NOT NULL;