CREATE TABLE public.admin_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  notes text,
  assignee text,
  due_date date,
  priority text NOT NULL DEFAULT 'normal',
  done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_by uuid,
  created_by_operator text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_tasks TO authenticated;
GRANT ALL ON public.admin_tasks TO service_role;

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view tasks" ON public.admin_tasks
  FOR SELECT TO authenticated USING (is_approved() OR is_admin());

CREATE POLICY "Approved users can create tasks" ON public.admin_tasks
  FOR INSERT TO authenticated WITH CHECK (is_approved() OR is_admin());

CREATE POLICY "Approved users can update tasks" ON public.admin_tasks
  FOR UPDATE TO authenticated USING (is_approved() OR is_admin()) WITH CHECK (is_approved() OR is_admin());

CREATE POLICY "Creator or admin can delete tasks" ON public.admin_tasks
  FOR DELETE TO authenticated USING (auth.uid() = created_by OR is_admin());

CREATE TRIGGER update_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();