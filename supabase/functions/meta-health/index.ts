// Read-only Facebook connection diagnostics for the admin panel.
// Never returns tokens or secrets.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPageRegistry, missingConfig, humanMetaError, logEvent, BRAND_LABELS } from "../_shared/metaPages.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

  const { data: approved } = await userClient.rpc("is_approved");
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (!approved && !isAdmin) return json({ error: "Forbidden" }, 403);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const pages = buildPageRegistry();
  const config = missingConfig();

  const results: any[] = [];

  for (const cfg of config) {
    const page = pages.find((p) => p.brand === cfg.brand);
    const base: any = {
      brand: cfg.brand,
      label: cfg.label,
      pageId: page?.pageId ?? null,
      configured: !!page,
      hasToken: cfg.hasToken,
      hasPageId: cfg.hasPageId,
      state: "unknown",
      pageName: null,
      tokenUsable: null,
      subscribedFields: null,
      subscriptionActive: null,
      error: null,
      leadCount: 0,
      commentCount: 0,
      lastStoredLeadAt: null,
      lastWebhookAt: null,
      lastErrorAt: null,
      lastErrorMessage: null,
    };

    // --- Stored data facts (always available) ---
    if (page) {
      const { count: leadCount } = await admin
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("source", "facebook")
        .eq("brand", cfg.brand);
      const { count: commentCount } = await admin
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("source", "facebook_comment")
        .eq("brand", cfg.brand);
      base.leadCount = leadCount ?? 0;
      base.commentCount = commentCount ?? 0;

      const { data: lastLead } = await admin
        .from("contact_submissions")
        .select("created_at")
        .in("source", ["facebook", "facebook_comment"])
        .eq("brand", cfg.brand)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      base.lastStoredLeadAt = lastLead?.created_at ?? null;

      const { data: lastHook } = await admin
        .from("meta_event_log")
        .select("created_at")
        .eq("page_id", page.pageId)
        .eq("event_type", "webhook_received")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      base.lastWebhookAt = lastHook?.created_at ?? null;

      const { data: lastErr } = await admin
        .from("meta_event_log")
        .select("created_at, message")
        .eq("page_id", page.pageId)
        .eq("status", "error")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      base.lastErrorAt = lastErr?.created_at ?? null;
      base.lastErrorMessage = lastErr?.message ?? null;
    }

    if (!page) {
      base.state = "error";
      base.error = !cfg.hasToken && !cfg.hasPageId
        ? "Nesukonfigūruotas nei puslapio ID, nei prieigos raktas."
        : !cfg.hasToken
        ? "Nėra puslapio prieigos rakto."
        : "Nėra puslapio ID.";
      results.push(base);
      await logEvent(admin, { brand: cfg.brand, event_type: "health_check", status: "error", message: base.error });
      continue;
    }

    // --- Live read-only Graph API checks ---
    try {
      const infoRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.pageId}?fields=name&access_token=${encodeURIComponent(page.token)}`
      );
      const infoBody = await infoRes.text();
      if (!infoRes.ok) {
        base.tokenUsable = false;
        base.state = "error";
        base.error = humanMetaError(infoBody);
        await logEvent(admin, { page_id: page.pageId, brand: cfg.brand, event_type: "health_check", status: "error", message: base.error });
        results.push(base);
        continue;
      }
      base.tokenUsable = true;
      try {
        base.pageName = JSON.parse(infoBody)?.name ?? null;
      } catch { /* ignore */ }

      const subRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.pageId}/subscribed_apps?access_token=${encodeURIComponent(page.token)}`
      );
      const subBody = await subRes.text();
      if (!subRes.ok) {
        base.state = "warning";
        base.error = humanMetaError(subBody);
        base.subscriptionActive = null;
      } else {
        let fields: string[] = [];
        try {
          const parsed = JSON.parse(subBody);
          for (const app of parsed?.data ?? []) {
            for (const f of app?.subscribed_fields ?? []) fields.push(String(f));
          }
        } catch { /* ignore */ }
        base.subscribedFields = fields;
        const hasLeadgen = fields.includes("leadgen");
        base.subscriptionActive = fields.length > 0;
        if (!fields.length) {
          base.state = "error";
          base.error = "Puslapis neprijungtas prie programėlės – Facebook nesiųs naujų lead'ų.";
        } else if (!hasLeadgen) {
          base.state = "warning";
          base.error = "Puslapis prijungtas, bet nėra 'leadgen' prenumeratos – paraiškų formos lead'ai neatkeliaus.";
        } else {
          base.state = "healthy";
        }
      }

      await logEvent(admin, {
        page_id: page.pageId,
        brand: cfg.brand,
        event_type: "health_check",
        status: base.state === "healthy" ? "success" : "info",
        message: base.error ?? `Būsena: ${base.state}`,
      });
    } catch (e) {
      base.state = "error";
      base.error = humanMetaError(e instanceof Error ? e.message : e);
      await logEvent(admin, { page_id: page.pageId, brand: cfg.brand, event_type: "health_check", status: "error", message: base.error });
    }

    results.push(base);
  }

  const { data: recentEvents } = await admin
    .from("meta_event_log")
    .select("id, created_at, page_id, brand, event_type, status, message, fb_lead_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: verifyTokenSet } = { data: !!Deno.env.get("META_VERIFY_TOKEN") };

  return json({
    checkedAt: new Date().toISOString(),
    verifyTokenConfigured: verifyTokenSet,
    appSecretConfigured: !!Deno.env.get("META_APP_SECRET"),
    brandLabels: BRAND_LABELS,
    pages: results,
    recentEvents: recentEvents ?? [],
  });
});
