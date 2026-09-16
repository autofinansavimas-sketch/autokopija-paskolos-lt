CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  full_name text,
  phone text,
  budget text,
  adset_name text,
  source text NOT NULL DEFAULT 'webhook',
  raw jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view leads" ON public.leads FOR SELECT TO authenticated USING (is_approved() OR is_admin());
CREATE POLICY "Approved users can update leads" ON public.leads FOR UPDATE TO authenticated USING (is_approved() OR is_admin()) WITH CHECK (is_approved() OR is_admin());
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (is_admin());

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);