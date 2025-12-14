-- Table for storing contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount TEXT,
  loan_type TEXT,
  loan_period TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing admin comments on submissions
CREATE TABLE public.submission_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'autofinansavimas@gmail.com'
  )
$$;

-- RLS policies for contact_submissions (only admin can read/update)
CREATE POLICY "Admin can view all submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin can update submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Allow edge function to insert (service role)
CREATE POLICY "Service role can insert submissions"
ON public.contact_submissions
FOR INSERT
TO service_role
WITH CHECK (true);

-- RLS policies for submission_comments
CREATE POLICY "Admin can view all comments"
ON public.submission_comments
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin can insert comments"
ON public.submission_comments
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete comments"
ON public.submission_comments
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();