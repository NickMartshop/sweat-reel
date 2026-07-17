CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    email = COALESCE(NULLIF(public.profiles.email, ''), EXCLUDED.email);
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;