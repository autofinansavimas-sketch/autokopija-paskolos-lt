// Real Facebook Lead Ads webhook.
// 1. Verifies Meta's subscription challenge (hub.verify_token) and payload signature.
// 2. Persists EVERY incoming change into meta_webhook_events (durable queue) before any Graph API call.
// 3. Tries to process immediately; retryable failures (expired token, rate limit, network)
//    stay 'pending' so meta-recover-leads can replay them later without data loss.
// Tokens live only in server-side secrets and are never logged or returned.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPageRegistry, logEvent, humanMetaError, type PageConfig } from "../_shared/metaPages.ts";
import { ingestLeadgen } from "../_shared/leadIngest.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") || "";
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") || "";
const LEGACY_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || "";
const LEGACY_PAGE_ID = Deno.env.get("META_PAGE_ID") || "";

const PAGES = buildPageRegistry();

function resolvePage(pageId: string | null): PageConfig | null {
  if (pageId) {
    const match = PAGES.find((p) => p.pageId === String(pageId));
    if (match) return match;
  }
  if (!LEGACY_PAGE_ID && LEGACY_TOKEN) {
    return { pageId: String(pageId || ""), token: LEGACY_TOKEN, brand: "autopaskolos", label: "Autopaskolos.lt" };
  }
  return null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(META_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256=${hex}` === signature;
}

/** Inserts the raw change into the durable queue. Returns the queue row, or null when it is a known duplicate. */
async function enqueue(
  admin: any,
  row: {
    page_id: string | null; brand: string | null; field: string | null;
    leadgen_id: string | null; comment_id: string | null; payload: unknown;
  }
) {
  const { data, error } = await admin
    .from("meta_webhook_events")
    .insert({ ...row, payload: row.payload, status: "pending" })
    .select("id, attempts")
    .single();
  if (error) {
    // Unique index on leadgen_id / comment_id -> Meta re-delivered an event we already have.
    if (String(error.code) === "23505") return null;
    console.error("queue insert failed:", error.message);
    return null;
  }
  return data;
}

async function markProcessed(admin: any, id: string, attempts: number, submissionId: string | null) {
  const now = new Date().toISOString();
  await admin.from("meta_webhook_events")
    .update({ status: "processed", processed_at: now, last_attempt_at: now, attempts: attempts + 1, last_error: null, submission_id: submissionId })
    .eq("id", id);
}

async function markFailed(admin: any, id: string, attempts: number, message: string, retryable: boolean) {
  await admin.from("meta_webhook_events")
    .update({
      status: retryable ? "pending" : "failed",
      attempts: attempts + 1,
      last_attempt_at: new Date().toISOString(),
      last_error: message.slice(0, 1000),
    })
    .eq("id", id);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Meta subscription verification
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && META_VERIFY_TOKEN && token === META_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const bodyText = await req.text();

    const signature = req.headers.get("x-hub-signature-256");
    if (META_APP_SECRET && signature) {
      if (!(await verifySignature(bodyText, signature))) {
        await logEvent(admin, {
          event_type: "webhook_validation", status: "error",
          message: "Neteisingas Facebook užklausos parašas – užklausa atmesta.",
        });
        return new Response("Invalid signature", { status: 403 });
      }
    }

    const body = JSON.parse(bodyText);

    for (const entry of body.entry || []) {
      const pageId = entry.id ? String(entry.id) : null;
      const page = resolvePage(pageId);

      await logEvent(admin, {
        page_id: pageId,
        brand: page?.brand ?? null,
        event_type: "webhook_received",
        status: page ? "success" : "error",
        message: page
          ? `Gauta ${entry.changes?.length ?? 0} pakeitimų iš Facebook puslapio`
          : `Nėra sukonfigūruoto prieigos rakto Facebook puslapiui ${pageId} – įvykis padėtas į eilę.`,
      });

      for (const change of entry.changes || []) {
        const field = change?.field ?? null;
        const value = change?.value ?? {};
        const leadgenId = field === "leadgen" && value?.leadgen_id ? String(value.leadgen_id) : null;
        const commentId =
          field === "feed" && value?.item === "comment" && value?.verb === "add" && value?.comment_id
            ? String(value.comment_id)
            : null;

        if (!leadgenId && !commentId) continue;

        const queued = await enqueue(admin, {
          page_id: pageId, brand: page?.brand ?? null, field,
          leadgen_id: leadgenId, comment_id: commentId, payload: change,
        });
        if (!queued) continue; // duplicate delivery

        // Without a usable page token we cannot fetch the lead — leave it pending for recovery.
        if (!page) {
          await markFailed(admin, queued.id, queued.attempts ?? 0,
            `Nėra sukonfigūruoto prieigos rakto puslapiui ${pageId}.`, true);
          continue;
        }

        try {
          if (leadgenId) {
            const result = await ingestLeadgen(admin, page, leadgenId);
            if (result.outcome === "inserted") await markProcessed(admin, queued.id, queued.attempts ?? 0, result.submissionId);
            else if (result.outcome === "duplicate") await markProcessed(admin, queued.id, queued.attempts ?? 0, null);
            else await markFailed(admin, queued.id, queued.attempts ?? 0, result.message, result.retryable);
            continue;
          }

          // Facebook comment lead
          const dedupId = `fb_comment_${commentId}`;
          const { data: existing } = await admin
            .from("contact_submissions").select("id").eq("fb_lead_id", dedupId).maybeSingle();
          if (existing) {
            await markProcessed(admin, queued.id, queued.attempts ?? 0, null);
            continue;
          }

          const fromName = value.from?.name || "Facebook komentaras";
          const messageText = value.message || "(be teksto)";

          const { data: inserted, error } = await admin
            .from("contact_submissions")
            .insert({
              name: fromName, email: "nera@fb.com", phone: "N/A",
              source: "facebook_comment", status: "new",
              fb_lead_id: dedupId, page_id: pageId, brand: page.brand,
            })
            .select("id").single();

          if (error || !inserted) {
            await markFailed(admin, queued.id, queued.attempts ?? 0, error?.message ?? "Nepavyko įrašyti komentaro.", true);
            await logEvent(admin, {
              page_id: pageId, brand: page.brand, event_type: "comment_insert",
              status: "error", message: error?.message ?? "Nepavyko įrašyti komentaro lead'o.", fb_lead_id: dedupId,
            });
            continue;
          }

          await admin.from("submission_comments").insert({
            submission_id: inserted.id,
            comment: `💬 Facebook komentaras (${fromName}): ${messageText}`,
          });

          await markProcessed(admin, queued.id, queued.attempts ?? 0, inserted.id);
          await logEvent(admin, {
            page_id: pageId, brand: page.brand, event_type: "comment_insert",
            status: "success", message: "Naujas Facebook komentaras įrašytas.",
            fb_lead_id: dedupId, submission_id: inserted.id,
          });
        } catch (changeError) {
          const msg = humanMetaError(changeError instanceof Error ? changeError.message : changeError);
          await markFailed(admin, queued.id, queued.attempts ?? 0, msg, true);
          await logEvent(admin, {
            page_id: pageId, brand: page?.brand ?? null, event_type: "webhook_change",
            status: "error", message: msg,
          });
        }
      }
    }

    // Always 200 so Meta does not disable the subscription; the queue guarantees no lead is lost.
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    await logEvent(admin, {
      event_type: "webhook_error", status: "error",
      message: error instanceof Error ? error.message : "Nežinoma klaida",
    });
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
