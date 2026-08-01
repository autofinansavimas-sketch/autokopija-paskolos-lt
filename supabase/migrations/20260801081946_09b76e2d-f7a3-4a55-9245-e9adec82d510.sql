-- Trigger functions must never be callable directly by API roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Keep is_admin/is_approved usable by RLS policies but not by anonymous visitors
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_approved() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved() TO authenticated;

-- Time tracking helper: only signed-in staff may call it
REVOKE ALL ON FUNCTION public.increment_operator_time(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_operator_time(text, integer) TO authenticated;

-- Make the locked-down state of operator_time deletion explicit
REVOKE DELETE ON public.operator_time FROM anon, authenticated;
GRANT ALL ON public.operator_time TO service_role;