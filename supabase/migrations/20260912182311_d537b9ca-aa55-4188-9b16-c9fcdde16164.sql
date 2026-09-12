CREATE TABLE public.meta_page_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL UNIQUE,
  brand TEXT,
  page_name TEXT,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'page',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.meta_page_tokens TO service_role;
ALTER TABLE public.meta_page_tokens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meta_oauth_states (
  state TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_to TEXT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '15 minutes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.meta_oauth_states TO service_role;
ALTER TABLE public.meta_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_meta_page_tokens_updated_at
BEFORE UPDATE ON public.meta_page_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();