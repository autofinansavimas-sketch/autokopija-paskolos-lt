CREATE TABLE IF NOT EXISTS public.meta_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  page_id TEXT,
  brand TEXT,
  field TEXT,
  leadgen_id TEXT,
  comment_id TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  last_error TEXT,
  submission_id UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS meta_webhook_events_leadgen_uidx ON public.meta_webhook_events (leadgen_id) WHERE leadgen_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS meta_webhook_events_comment_uidx ON public.meta_webhook_events (comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS meta_webhook_events_status_idx ON public.meta_webhook_events (status, received_at DESC);

GRANT SELECT ON public.meta_webhook_events TO authenticated;
GRANT ALL ON public.meta_webhook_events TO service_role;

ALTER TABLE public.meta_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read meta webhook events" ON public.meta_webhook_events;
CREATE POLICY "Admins can read meta webhook events"
ON public.meta_webhook_events FOR SELECT TO authenticated
USING (public.is_admin());