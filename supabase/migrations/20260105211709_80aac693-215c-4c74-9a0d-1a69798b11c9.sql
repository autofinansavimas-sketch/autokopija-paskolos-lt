-- Create work_hours table for tracking employee work hours
CREATE TABLE public.work_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    hours numeric(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.work_hours ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_hours
CREATE POLICY "Users can view own hours"
ON public.work_hours
FOR SELECT
USING (auth.uid() = user_id OR is_approved());

CREATE POLICY "Users can insert own hours"
ON public.work_hours
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_approved());

CREATE POLICY "Users can update own hours"
ON public.work_hours
FOR UPDATE
USING (auth.uid() = user_id AND is_approved());

CREATE POLICY "Users can delete own hours"
ON public.work_hours
FOR DELETE
USING (auth.uid() = user_id AND is_approved());

-- Add user_id to submission_comments to track who wrote the comment
ALTER TABLE public.submission_comments 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policy for comments to require user_id on insert
DROP POLICY IF EXISTS "Admin can insert comments" ON public.submission_comments;
CREATE POLICY "Approved users can insert comments"
ON public.submission_comments
FOR INSERT
WITH CHECK (is_approved() AND auth.uid() = user_id);

-- Trigger for updated_at on work_hours
CREATE TRIGGER update_work_hours_updated_at
BEFORE UPDATE ON public.work_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();