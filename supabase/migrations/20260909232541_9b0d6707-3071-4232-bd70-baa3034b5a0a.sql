ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS page_id text,
  ADD COLUMN IF NOT EXISTS brand text;

CREATE INDEX IF NOT EXISTS contact_submissions_page_id_idx ON public.contact_submissions (page_id);