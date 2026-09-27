CREATE INDEX IF NOT EXISTS idx_submission_comments_submission_created ON public.submission_comments (submission_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);

CREATE TABLE public.car_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  make text NOT NULL CHECK (char_length(make) BETWEEN 1 AND 60),
  model text CHECK (model IS NULL OR char_length(model) <= 60),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_wishes TO authenticated;
GRANT ALL ON public.car_wishes TO service_role;
ALTER TABLE public.car_wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage car wishes" ON public.car_wishes FOR ALL TO authenticated
  USING (public.is_approved() OR public.is_admin()) WITH CHECK (public.is_approved() OR public.is_admin());
CREATE INDEX idx_car_wishes_submission ON public.car_wishes (submission_id);

CREATE TABLE public.car_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid NOT NULL REFERENCES public.car_wishes(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  car_id text NOT NULL,
  title text NOT NULL,
  year integer,
  price numeric,
  image_url text,
  url text,
  seen boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wish_id, car_id)
);
GRANT SELECT, UPDATE, DELETE ON public.car_matches TO authenticated;
GRANT ALL ON public.car_matches TO service_role;
ALTER TABLE public.car_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read car matches" ON public.car_matches FOR SELECT TO authenticated USING (public.is_approved() OR public.is_admin());
CREATE POLICY "Staff update car matches" ON public.car_matches FOR UPDATE TO authenticated USING (public.is_approved() OR public.is_admin());
CREATE POLICY "Staff delete car matches" ON public.car_matches FOR DELETE TO authenticated USING (public.is_approved() OR public.is_admin());
CREATE INDEX idx_car_matches_seen ON public.car_matches (seen) WHERE seen = false;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('check-autokopers-cars-hourly', '0 * * * *', $$
  SELECT net.http_post(
    url := 'https://jwruubwnqwibbdwkpksz.supabase.co/functions/v1/check-autokopers-cars',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
$$);