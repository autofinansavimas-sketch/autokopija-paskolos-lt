CREATE TABLE public.admin_status_config (
  id TEXT NOT NULL DEFAULT 'global' PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT admin_status_config_singleton CHECK (id = 'global'),
  CONSTRAINT admin_status_config_array CHECK (jsonb_typeof(config) = 'array')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_status_config TO authenticated;
GRANT ALL ON public.admin_status_config TO service_role;

ALTER TABLE public.admin_status_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view admin status config"
  ON public.admin_status_config
  FOR SELECT
  TO authenticated
  USING (public.is_approved() OR public.is_admin());

CREATE POLICY "Approved users can create admin status config"
  ON public.admin_status_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved() OR public.is_admin());

CREATE POLICY "Approved users can update admin status config"
  ON public.admin_status_config
  FOR UPDATE
  TO authenticated
  USING (public.is_approved() OR public.is_admin())
  WITH CHECK (public.is_approved() OR public.is_admin());

CREATE TRIGGER update_admin_status_config_updated_at
BEFORE UPDATE ON public.admin_status_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.admin_status_config (id, config)
VALUES (
  'global',
  '[
    {"value":"new","label":"Nauji","color":"bg-blue-500","borderColor":"border-blue-500"},
    {"value":"contacted","label":"Susisiekta","color":"bg-yellow-500","borderColor":"border-yellow-500"},
    {"value":"completed","label":"Užbaigti","color":"bg-green-500","borderColor":"border-green-500"},
    {"value":"not_financed","label":"Nefinansuojami","color":"bg-orange-500","borderColor":"border-orange-500"},
    {"value":"ateityje","label":"Ateityje","color":"bg-purple-500","borderColor":"border-purple-500"},
    {"value":"cancelled","label":"Atšaukti","color":"bg-red-500","borderColor":"border-red-500"},
    {"value":"outsource_","label":"Outsource","color":"bg-teal-500","borderColor":"border-teal-500"},
    {"value":"outsource_susisiekta","label":"Outsource susisiekta","color":"bg-cyan-500","borderColor":"border-cyan-500"},
    {"value":"outsource_nekelia","label":"Outsource nekelia","color":"bg-pink-500","borderColor":"border-pink-500"},
    {"value":"nekelia","label":"Nekelia","color":"bg-pink-500","borderColor":"border-pink-500"},
    {"value":"nekelia_ragelio","label":"Nekelia ragelio","color":"bg-pink-500","borderColor":"border-pink-500"},
    {"value":"nusiusta_paraiska_","label":"Nusiųsta paraiška","color":"bg-indigo-500","borderColor":"border-indigo-500"},
    {"value":"out_neaktualu","label":"Out neaktualu","color":"bg-orange-500","borderColor":"border-orange-500"},
    {"value":"outsource_completed","label":"Outsource užbaigti","color":"bg-green-500","borderColor":"border-green-500"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;