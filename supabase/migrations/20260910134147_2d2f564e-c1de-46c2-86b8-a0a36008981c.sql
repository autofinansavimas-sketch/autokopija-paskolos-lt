CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_meta_private_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://jwruubwnqwibbdwkpksz.supabase.co/functions/v1/meta-private-reply',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'submission_comments',
      'record', to_jsonb(NEW)
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'meta-private-reply webhook failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_submission_comments_private_reply ON public.submission_comments;
CREATE TRIGGER trg_submission_comments_private_reply
AFTER INSERT ON public.submission_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_meta_private_reply();