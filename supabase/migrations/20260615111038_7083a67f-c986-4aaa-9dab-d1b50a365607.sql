
-- contact_submissions: leisti patvirtintiems naudotojams matyti/keisti
DROP POLICY IF EXISTS "Admin can view all submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can delete submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can insert submissions" ON public.contact_submissions;

CREATE POLICY "Approved users can view all submissions"
  ON public.contact_submissions FOR SELECT
  USING (is_approved() OR is_admin());

CREATE POLICY "Approved users can update submissions"
  ON public.contact_submissions FOR UPDATE
  USING (is_approved() OR is_admin());

CREATE POLICY "Approved users can insert submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (is_approved() OR is_admin());

CREATE POLICY "Admin can delete submissions"
  ON public.contact_submissions FOR DELETE
  USING (is_admin());

-- submission_comments: leisti patvirtintiems matyti komentarus
DROP POLICY IF EXISTS "Admin can view all comments" ON public.submission_comments;

CREATE POLICY "Approved users can view all comments"
  ON public.submission_comments FOR SELECT
  USING (is_approved() OR is_admin());
