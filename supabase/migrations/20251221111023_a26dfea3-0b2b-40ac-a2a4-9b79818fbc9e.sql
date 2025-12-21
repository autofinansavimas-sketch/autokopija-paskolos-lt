-- Add source column to track where the submission came from
ALTER TABLE public.contact_submissions 
ADD COLUMN source text DEFAULT 'autopaskolos';