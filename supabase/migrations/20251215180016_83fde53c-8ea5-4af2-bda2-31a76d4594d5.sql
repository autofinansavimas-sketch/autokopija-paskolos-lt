-- Allow admin to delete submissions
CREATE POLICY "Admin can delete submissions" 
ON public.contact_submissions 
FOR DELETE 
USING (is_admin());