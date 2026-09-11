ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS fb_form_id text,
  ADD COLUMN IF NOT EXISTS fb_form_name text,
  ADD COLUMN IF NOT EXISTS fb_campaign_name text,
  ADD COLUMN IF NOT EXISTS fb_ad_name text,
  ADD COLUMN IF NOT EXISTS fb_platform text;