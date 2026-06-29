
CREATE TABLE public.operator_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator text NOT NULL,
  date date NOT NULL,
  seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (operator, date)
);

GRANT SELECT, INSERT, UPDATE ON public.operator_time TO authenticated;
GRANT ALL ON public.operator_time TO service_role;

ALTER TABLE public.operator_time ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view operator time"
  ON public.operator_time FOR SELECT
  TO authenticated
  USING (public.is_approved() OR public.is_admin());

CREATE POLICY "Approved users can insert operator time"
  ON public.operator_time FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved() OR public.is_admin());

CREATE POLICY "Approved users can update operator time"
  ON public.operator_time FOR UPDATE
  TO authenticated
  USING (public.is_approved() OR public.is_admin());

CREATE TRIGGER update_operator_time_updated_at
  BEFORE UPDATE ON public.operator_time
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_operator_time(_operator text, _seconds integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _operator NOT IN ('Aivaras', 'Paulina') THEN
    RAISE EXCEPTION 'Invalid operator';
  END IF;
  IF _seconds < 0 OR _seconds > 600 THEN
    RAISE EXCEPTION 'Invalid seconds value';
  END IF;

  INSERT INTO public.operator_time (operator, date, seconds)
  VALUES (_operator, CURRENT_DATE, _seconds)
  ON CONFLICT (operator, date)
  DO UPDATE SET seconds = public.operator_time.seconds + EXCLUDED.seconds,
                updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_operator_time(text, integer) TO authenticated;
