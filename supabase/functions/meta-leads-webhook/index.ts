import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logEvent, humanMetaError } from "../_shared/metaPages.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN")!;
const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;

// Legacy single-page setup (kept as fallback so the existing autopaskolos flow keeps working)
const LEGACY_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || "";
const LEGACY_PAGE_ID = Deno.env.get("META_PAGE_ID") || "";

// Multi-brand setup
const AP_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOPASKOLOS") || "";
const AP_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOPASKOLOS") || "";
const AK_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOKOPERS") || "";
const AK_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOKOPERS") || "";

type PageConfig = { pageId: string; token: string; brand: string };

function buildPageRegistry(): PageConfig[] {
  const pages: PageConfig[] = [];
  if (AP_PAGE_ID && AP_TOKEN) pages.push({ pageId: AP_PAGE_ID, token: AP_TOKEN, brand: "autopaskolos" });
  if (AK_PAGE_ID && AK_TOKEN) pages.push({ pageId: AK_PAGE_ID, token: AK_TOKEN, brand: "autokopers" });
  // Fallback: legacy pair (only if that page id is not already registered)
  if (LEGACY_PAGE_ID && LEGACY_TOKEN && !pages.some((p) => p.pageId === LEGACY_PAGE_ID)) {
    pages.push({ pageId: LEGACY_PAGE_ID, token: LEGACY_TOKEN, brand: "autopaskolos" });
  }
  return pages;
}

const PAGES = buildPageRegistry();

function resolvePage(pageId: string | undefined | null): PageConfig | null {
  if (pageId) {
    const match = PAGES.find((p) => p.pageId === String(pageId));
    if (match) return match;
  }
  // Single-page installs historically did not have META_PAGE_ID configured at all.
  if (!LEGACY_PAGE_ID && LEGACY_TOKEN) {
    return { pageId: String(pageId || ""), token: LEGACY_TOKEN, brand: "autopaskolos" };
  }
  return null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify webhook signature from Meta
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
  const hexSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hexSig}` === signature;
}

// Fetch lead details from Meta Graph API
async function fetchLeadData(leadId: string, token: string) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${leadId}?access_token=${token}`
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch lead ${leadId}: ${err}`);
  }
  return await res.json();
}

// Extract field value from lead data
function getField(fieldData: any[], name: string): string | null {
  const field = fieldData?.find(
    (f: any) => f.name?.toLowerCase() === name.toLowerCase()
  );
  return field?.values?.[0] || null;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Webhook verification (GET request from Meta)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Handle incoming lead webhook (POST)
  try {
    const bodyText = await req.text();

    // Verify signature
    const signature = req.headers.get("x-hub-signature-256");
    if (signature) {
      const valid = await verifySignature(bodyText, signature);
      if (!valid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 403 });
      }
    }

    const body = JSON.parse(bodyText);
    console.log("Received Meta webhook:", JSON.stringify(body));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Process each entry
    for (const entry of body.entry || []) {
      const pageId = entry.id ? String(entry.id) : null;
      const page = resolvePage(pageId);

      if (!page) {
        console.error(`No page access token configured for page_id ${pageId} — skipping entry`);
        continue;
      }

      for (const change of entry.changes || []) {
        try {
          if (change.field === "leadgen") {
            const leadgenId = change.value?.leadgen_id;
            if (!leadgenId) continue;

            // Check if already imported
            const { data: existing } = await supabase
              .from("contact_submissions")
              .select("id")
              .eq("fb_lead_id", leadgenId)
              .maybeSingle();

            if (existing) {
              console.log(`Lead ${leadgenId} already exists, skipping`);
              continue;
            }

            // Fetch full lead data from Meta
            const leadData = await fetchLeadData(leadgenId, page.token);
            const fields = leadData.field_data || [];

            const name = getField(fields, "full_name") || getField(fields, "first_name");
            const email = getField(fields, "email") || "nera@fb.com";
            const phone = getField(fields, "phone_number") || "N/A";

            const { data: inserted, error } = await supabase
              .from("contact_submissions")
              .insert({
                name,
                email,
                phone,
                source: "facebook",
                status: "new",
                fb_lead_id: leadgenId,
                page_id: pageId,
                brand: page.brand,
              })
              .select()
              .single();

            if (error) {
              console.error("Error inserting lead:", error);
            } else {
              console.log(`Lead ${leadgenId} imported as submission ${inserted.id}`);
            }
            continue;
          }

          // Comments under posts / ads
          if (change.field === "feed") {
            const value = change.value || {};
            if (value.item !== "comment" || value.verb !== "add") continue;

            const commentId = value.comment_id;
            if (!commentId) continue;

            const dedupId = `fb_comment_${commentId}`;

            const { data: existing } = await supabase
              .from("contact_submissions")
              .select("id")
              .eq("fb_lead_id", dedupId)
              .maybeSingle();

            if (existing) {
              console.log(`Comment ${commentId} already imported, skipping`);
              continue;
            }

            const fromName = value.from?.name || "Facebook komentaras";
            const messageText = value.message || "(be teksto)";

            const { data: inserted, error } = await supabase
              .from("contact_submissions")
              .insert({
                name: fromName,
                email: "nera@fb.com",
                phone: "N/A",
                source: "facebook_comment",
                status: "new",
                fb_lead_id: dedupId,
                page_id: pageId,
                brand: page.brand,
              })
              .select()
              .single();

            if (error || !inserted) {
              console.error("Error inserting FB comment lead:", error);
              continue;
            }

            const { error: commentError } = await supabase
              .from("submission_comments")
              .insert({
                submission_id: inserted.id,
                comment: `💬 Facebook komentaras (${fromName}): ${messageText}`,
              });

            if (commentError) {
              console.error("Error inserting comment text:", commentError);
            }

            console.log(`FB comment ${commentId} imported as submission ${inserted.id}`);
          }
        } catch (changeError) {
          console.error("Error processing change, continuing:", changeError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
