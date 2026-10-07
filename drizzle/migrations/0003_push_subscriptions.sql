CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage own push subs" ON public.push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND (public.is_approved() OR public.is_admin()));

CREATE OR REPLACE FUNCTION public.notify_new_submission_push()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://jwruubwnqwibbdwkpksz.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('record', jsonb_build_object('id', NEW.id, 'name', NEW.name, 'phone', NEW.phone, 'amount', NEW.amount, 'source', NEW.source))
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'push webhook failed: %', SQLERRM;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission_push() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_contact_submissions_push AFTER INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_submission_push();