ALTER TABLE public.meta_page_tokens
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS health_status TEXT,
  ADD COLUMN IF NOT EXISTS health_error TEXT,
  ADD COLUMN IF NOT EXISTS subscribed_fields TEXT[];

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS fb_ad_id TEXT,
  ADD COLUMN IF NOT EXISTS fb_adset_name TEXT,
  ADD COLUMN IF NOT EXISTS fb_field_data JSONB;