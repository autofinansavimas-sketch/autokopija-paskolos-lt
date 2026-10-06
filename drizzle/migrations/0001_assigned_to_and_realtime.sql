ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS assigned_to text CHECK (assigned_to IS NULL OR assigned_to IN ('Aivaras','Paulina'));
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to ON public.contact_submissions (assigned_to) WHERE assigned_to IS NOT NULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_submissions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;