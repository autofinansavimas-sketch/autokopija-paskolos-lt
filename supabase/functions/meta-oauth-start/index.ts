// Meta Login for Business — server-side OAuth start + connection status.
// Admin-only. Never returns app secret or any access token.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BRAND_LABELS } from "../_shared/metaPages.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const META_APP_ID = Deno.env.get("META_APP_ID") || "";
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") || "";
const META_CONFIG_ID = Deno.env.get("META_LOGIN_CONFIG_ID") || "";

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

// Must mirror the Meta Login for Business configuration (config_id) permissions.
const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_manage_ads",
  "leads_retrieval",
  "ads_read",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (!isAdmin) return json({ error: "Tik administratorius gali prijungti Meta." }, 403);

  const body = await req.json().catch(() => ({} as any));
  const action = body?.action === "start" ? "start" : "status";

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const appConfigured = !!META_APP_ID && !!META_APP_SECRET;

  if (action === "status") {
    const { data: rows } = await admin
      .from("meta_page_tokens")
      .select("page_id, brand, page_name, scopes, expires_at, connected_at, revoked_at")
      .order("connected_at", { ascending: false });
    return json({
      appConfigured,
      hasAppId: !!META_APP_ID,
      hasAppSecret: !!META_APP_SECRET,
      redirectUri: REDIRECT_URI,
      scopes: SCOPES,
      brandLabels: BRAND_LABELS,
      connections: (rows ?? []).map((r) => ({
        pageId: r.page_id,
        brand: r.brand,
        label: r.brand ? BRAND_LABELS[r.brand] ?? r.page_name : r.page_name,
        pageName: r.page_name,
        scopes: r.scopes ?? [],
        expiresAt: r.expires_at,
        connectedAt: r.connected_at,
        revoked: !!r.revoked_at,
      })),
      message: appConfigured
        ? null
        : "Reikalingi Meta APP_ID bei APP_SECRET",
    });
  }

  // action === "start"
  if (!appConfigured) {
    return json({ error: "Reikalingi Meta APP_ID bei APP_SECRET", appConfigured: false, redirectUri: REDIRECT_URI }, 400);
  }

  const state = crypto.randomUUID() + "." + crypto.randomUUID();
  const redirectTo = typeof body?.redirectTo === "string" && body.redirectTo.startsWith("http")
    ? String(body.redirectTo).slice(0, 500)
    : null;

  const { error: stateErr } = await admin
    .from("meta_oauth_states")
    .insert({ state, user_id: userData.user.id, redirect_to: redirectTo });
  if (stateErr) return json({ error: "Nepavyko paruošti saugaus prisijungimo." }, 500);

  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", META_APP_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  if (META_CONFIG_ID) url.searchParams.set("config_id", META_CONFIG_ID);
  else url.searchParams.set("scope", SCOPES.join(","));

  return json({ authorizeUrl: url.toString(), redirectUri: REDIRECT_URI });
});
