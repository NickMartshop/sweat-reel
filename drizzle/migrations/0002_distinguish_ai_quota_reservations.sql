CREATE OR REPLACE FUNCTION public.reserve_ai_extraction_v2(_user_id uuid)
RETURNS integer
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
    RETURN 0;
  END IF;
  IF profile_row.ai_extractions_used >= 3 THEN
    RETURN -1;
  END IF;
  UPDATE public.profiles SET ai_extractions_used = ai_extractions_used + 1 WHERE id = _user_id;
  RETURN 1;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_ai_extraction_v2(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_extraction_v2(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.release_ai_extraction_v2(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET ai_extractions_used = GREATEST(ai_extractions_used - 1, 0)
  WHERE id = _user_id AND ai_extractions_used > 0;
$$;
REVOKE ALL ON FUNCTION public.release_ai_extraction_v2(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_ai_extraction_v2(uuid) TO service_role;