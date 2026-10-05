CREATE TABLE public.verified_razorpay_payments (
  payment_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly', 'annual')),
  applied_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON TABLE public.verified_razorpay_payments TO service_role;
ALTER TABLE public.verified_razorpay_payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.activate_verified_premium(
  _user_id uuid,
  _payment_id text,
  _plan text,
  _expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_payment_id text;
BEGIN
  IF _plan NOT IN ('monthly', 'annual') OR _payment_id = '' OR _expires_at <= now() THEN
    RAISE EXCEPTION 'Invalid verified payment activation';
  END IF;
  INSERT INTO public.verified_razorpay_payments (payment_id, user_id, plan)
  VALUES (_payment_id, _user_id, _plan)
  ON CONFLICT (payment_id) DO NOTHING
  RETURNING payment_id INTO inserted_payment_id;
  IF inserted_payment_id IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.profiles
  SET is_premium = true,
      premium_plan = _plan,
      premium_expires_at = _expires_at,
      razorpay_payment_id = _payment_id,
      updated_at = now()
  WHERE id = _user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_verified_premium(uuid, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_verified_premium(uuid, text, text, timestamptz) TO service_role;