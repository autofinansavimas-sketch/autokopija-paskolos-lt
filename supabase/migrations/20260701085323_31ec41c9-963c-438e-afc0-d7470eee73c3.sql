
-- Convert trigger-only utility to SECURITY INVOKER (does not need elevated privs)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Lock down EXECUTE on SECURITY DEFINER functions to only the roles that actually need them.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_approved() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_operator_time(text, integer) FROM PUBLIC, anon, authenticated;

-- Signed-in users need to call these from the app / RLS policies
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_operator_time(text, integer) TO authenticated;

-- Triggers execute as table owner, so no role grants are required for handle_new_user / update_updated_at_column
