ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_extractions_used INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_razorpay_payment_id_idx
  ON public.profiles (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;