-- Add deleted_at column for soft delete functionality
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add display_name column to profiles for employee names
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL;

-- Create index for efficient deleted submissions queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_deleted_at 
ON public.contact_submissions (deleted_at) 
WHERE deleted_at IS NOT NULL;