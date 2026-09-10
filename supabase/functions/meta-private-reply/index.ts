import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const LEGACY_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || "";
const LEGACY_PAGE_ID = Deno.env.get("META_PAGE_ID") || "";
const AP_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOPASKOLOS") || "";
const AP_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOPASKOLOS") || "";
const AK_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOKOPERS") || "";
const AK_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOKOPERS") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PageConfig = { pageId: string; token: string; brand: string };

function buildPageRegistry(): PageConfig[] {
  const pages: PageConfig[] = [];
  if (AP_PAGE_ID && AP_TOKEN) pages.push({ pageId: AP_PAGE_ID, token: AP_TOKEN, brand: "autopaskolos" });
  if (AK_PAGE_ID && AK_TOKEN) pages.push({ pageId: AK_PAGE_ID, token: AK_TOKEN, brand: "autokopers" });
  if (LEGACY_PAGE_ID && LEGACY_TOKEN && !pages.some((p) => p.pageId === LEGACY_PAGE_ID)) {
    pages.push({ pageId: LEGACY_PAGE_ID, token: LEGACY_TOKEN, brand: "autopaskolos" });
  }
  return pages;
}

const PAGES = buildPageRegistry();

function resolveToken(pageId?: string | null, brand?: string | null): string | null {
  if (pageId) {
    const byPage = PAGES.find((p) => p.pageId === String(pageId));
    if (byPage) return byPage.token;
  }
  if (brand) {
    const byBrand = PAGES.find((p) => p.brand === brand);
    if (byBrand) return byBrand.token;
  }
  return LEGACY_TOKEN || PAGES[0]?.token || null;
}

// Strip operator tag prefix like "[Aivaras] " added by the admin UI
function cleanMessage(raw: string): string {
  return raw.replace(/^\s*\[[^\]]{1,40}\]\s*/, "").trim();
}

const skipped = (reason: string) =>
  new Response(JSON.stringify({ skipped: true, reason }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const record = payload?.record ?? payload;

    if (!record?.submission_id) return skipped("no submission_id");
    if (!record?.user_id) return skipped("system comment (no user_id)");
    const rawComment = String(record.comment ?? "");
    if (!rawComment.trim()) return skipped("empty comment");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: submission, error: subError } = await supabase
      .from("contact_submissions")
      .select("id, source, fb_lead_id, page_id, brand")
      .eq("id", record.submission_id)
      .maybeSingle();

    if (subError) {
      console.error("Failed to load submission", record.submission_id, subError.message);
      return skipped("submission lookup failed");
    }
    if (!submission) return skipped("submission not found");
    if (submission.source !== "facebook_comment") return skipped("not a facebook comment lead");

    const fbLeadId = String(submission.fb_lead_id ?? "");
    if (!fbLeadId.startsWith("fb_comment_")) return skipped("no fb comment id");

    const commentId = fbLeadId.replace(/^fb_comment_/, "");
    const token = resolveToken(submission.page_id, submission.brand);
    if (!token) {
      console.error("No Meta page token configured for page", submission.page_id, "brand", submission.brand);
      return skipped("no page token");
    }

    const message = cleanMessage(rawComment);
    if (!message) return skipped("empty message after cleanup");

    const res = await fetch(`https://graph.facebook.com/v21.0/${commentId}/private_replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token, message }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Private reply failed for comment ${commentId}: ${res.status} ${err}`);
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Private reply sent for comment ${commentId} (submission ${submission.id})`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("meta-private-reply error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
