ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS next_action text;