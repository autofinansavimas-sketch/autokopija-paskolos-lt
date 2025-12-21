-- Drop the restrictive service role policy and create a permissive one for admin inserts
DROP POLICY IF EXISTS "Service role can insert submissions" ON public.contact_submissions;

-- Create permissive policy for admin to insert submissions
CREATE POLICY "Admin can insert submissions" 
ON public.contact_submissions 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Keep public insert for contact form (anonymous users via edge function)
CREATE POLICY "Anyone can insert submissions" 
ON public.contact_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);