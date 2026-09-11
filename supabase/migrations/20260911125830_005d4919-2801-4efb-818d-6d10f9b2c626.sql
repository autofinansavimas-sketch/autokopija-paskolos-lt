CREATE TABLE public.meta_event_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id text,
  brand text,
  event_type text NOT NULL,
  status text NOT NULL,
  message text,
  fb_lead_id text,
  submission_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.meta_event_log TO authenticated;
GRANT ALL ON public.meta_event_log TO service_role;

ALTER TABLE public.meta_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view meta event log"
ON public.meta_event_log
FOR SELECT
TO authenticated
USING (public.is_approved() OR public.is_admin());

CREATE INDEX idx_meta_event_log_created_at ON public.meta_event_log (created_at DESC);
CREATE INDEX idx_meta_event_log_page ON public.meta_event_log (page_id, created_at DESC);