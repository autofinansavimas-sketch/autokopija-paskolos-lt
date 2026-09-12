// Manual, admin-only replay of Facebook webhook events that could not be processed
// (usually because a page access token had expired). Reads pending rows from
// meta_webhook_events and re-fetches each lead with the current server-side token.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPageRegistry, logEvent, BRAND_LABELS } from "../_shared/metaPages.ts";
import { ingestLeadgen } from "../_shared/leadIngest.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
  if (!isAdmin) return json({ error: "Tik administratorius gali perimti praleistus lead'us." }, 403);

  const body = await req.json().catch(() => ({}));
  const mode = body?.mode === "run" ? "run" : "preview";
  const limit = Math.min(Number(body?.limit) || 100, 300);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const pages = buildPageRegistry();

  const { data: pending, error: qErr } = await admin
    .from("meta_webhook_events")
    .select("id, page_id, brand, leadgen_id, attempts, last_error, received_at")
    .eq("status", "pending")
    .not("leadgen_id", "is", null)
    .order("received_at", { ascending: true })
    .limit(limit);

  if (qErr) return json({ error: qErr.message }, 500);

  const queue = pending ?? [];

  if (mode === "preview") {
    const byBrand: Record<string, number> = {};
    for (const row of queue) byBrand[row.brand ?? "unknown"] = (byBrand[row.brand ?? "unknown"] ?? 0) + 1;
    return json({
      mode,
      pending: queue.length,
      byBrand,
      brandLabels: BRAND_LABELS,
      oldest: queue[0]?.received_at ?? null,
      lastError: queue.find((r) => r.last_error)?.last_error ?? null,
    });
  }

  let recovered = 0, duplicates = 0, failed = 0;
  let lastError: string | null = null;

  for (const row of queue) {
    const page = pages.find((p) => p.pageId === String(row.page_id));
    if (!page) {
      failed++;
      lastError = `Nėra sukonfigūruoto prieigos rakto puslapiui ${row.page_id}.`;
      await admin.from("meta_webhook_events")
        .update({ attempts: (row.attempts ?? 0) + 1, last_error: lastError, last_attempt_at: new Date().toISOString() })
        .eq("id", row.id);
      continue;
    }

    const result = await ingestLeadgen(admin, page, String(row.leadgen_id));
    const now = new Date().toISOString();

    if (result.outcome === "inserted" || result.outcome === "duplicate") {
      if (result.outcome === "inserted") recovered++;
      else duplicates++;
      await admin.from("meta_webhook_events")
        .update({
          status: "processed",
          processed_at: now,
          last_attempt_at: now,
          attempts: (row.attempts ?? 0) + 1,
          last_error: null,
          submission_id: result.outcome === "inserted" ? result.submissionId : null,
        })
        .eq("id", row.id);
    } else {
      failed++;
      lastError = result.message;
      await admin.from("meta_webhook_events")
        .update({ attempts: (row.attempts ?? 0) + 1, last_error: result.message, last_attempt_at: now })
        .eq("id", row.id);
    }
  }

  await logEvent(admin, {
    event_type: "recover_run",
    status: failed && !recovered ? "error" : "info",
    message: `Perimta: ${recovered}, dublikatai: ${duplicates}, nepavyko: ${failed}`,
  });

  return json({ mode, processed: queue.length, recovered, duplicates, failed, lastError });
});
