
-- Add fb_lead_id column to track Facebook Lead Ads submissions
ALTER TABLE public.contact_submissions 
ADD COLUMN fb_lead_id text UNIQUE DEFAULT NULL;

-- Add index for faster lookups by fb_lead_id
CREATE INDEX idx_contact_submissions_fb_lead_id ON public.contact_submissions (fb_lead_id) WHERE fb_lead_id IS NOT NULL;
