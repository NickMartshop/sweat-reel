
CREATE OR REPLACE FUNCTION public.prevent_client_billing_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role (used by supabaseAdmin server-side) is allowed to modify billing.
  -- Any other role (authenticated, anon) trying to change these columns is rejected.
  IF current_user <> 'service_role' THEN
    IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
       OR NEW.premium_plan IS DISTINCT FROM OLD.premium_plan
       OR NEW.premium_expires_at IS DISTINCT FROM OLD.premium_expires_at
       OR NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id THEN
      RAISE EXCEPTION 'Billing columns can only be modified by the server';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_client_billing_update ON public.profiles;
CREATE TRIGGER profiles_prevent_client_billing_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_client_billing_update();
