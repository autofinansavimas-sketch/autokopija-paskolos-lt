import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Legacy single-page setup (fallback)
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Status labels in Lithuanian
const statusLabels: Record<string, string> = {
  new: "Nauja",
  contacted: "Susisiekta",
  in_progress: "Vykdoma",
  approved: "Patvirtinta",
  rejected: "Atmesta",
  completed: "Užbaigta",
};

// Post a comment to a Facebook lead
async function postLeadComment(leadId: string, message: string, token: string) {
  const url = `https://graph.facebook.com/v21.0/${leadId}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: token, message }),
  });
  if (!res.ok) {
    console.error(`Failed to post comment to lead ${leadId}: ${await res.text()}`);
    return false;
  }
  return true;
}

// Send a Private Reply (Messenger DM) to the author of a Facebook comment
async function sendPrivateReply(commentId: string, message: string, token: string) {
  const url = `https://graph.facebook.com/v21.0/${commentId}/private_replies`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: token, message }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to send private reply for comment ${commentId}: ${err}`);
    return { ok: false, error: err };
  }
  return { ok: true };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, submission_id, comment, new_status, reminder_info } = await req.json();

    const { data: submission, error: subError } = await supabase
      .from("contact_submissions")
      .select("fb_lead_id, name, source, page_id, brand")
      .eq("id", submission_id)
      .single();

    if (subError || !submission?.fb_lead_id) {
      // Not a Facebook lead, skip silently
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pageToken = resolveToken(submission.page_id, submission.brand);
    if (!pageToken) {
      console.error("No Meta page token configured for submission", submission_id);
      return new Response(JSON.stringify({ success: false, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isCommentLead =
      submission.source === "facebook_comment" ||
      String(submission.fb_lead_id).startsWith("fb_comment_");

    // Facebook comment lead: admin's comment goes back as a Private Reply
    if (isCommentLead) {
      if (type !== "comment" || !comment?.trim()) {
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Skip internal/system notes
      if (/^(📞|🔔|✅|📋)/.test(comment.trim())) {
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const commentId = String(submission.fb_lead_id).replace(/^fb_comment_/, "");
      const result = await sendPrivateReply(commentId, comment.trim(), pageToken);

      if (!result.ok) {
        await supabase.from("submission_comments").insert({
          submission_id,
          comment: `⚠️ Nepavyko išsiųsti Private Reply į Facebook (galimai pasibaigęs 7 d. langas).`,
        });
      }

      return new Response(JSON.stringify({ success: result.ok, private_reply: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let message = "";

    switch (type) {
      case "comment":
        message = `💬 Komentaras: ${comment}`;
        break;
      case "status_change": {
        const label = statusLabels[new_status] || new_status;
        message = `📋 Būsena pakeista → ${label}`;
        break;
      }
      case "reminder_created":
        message = `🔔 Priminimas: ${reminder_info || "Suplanuotas skambutis"}`;
        break;
      case "reminder_completed":
        message = `✅ Priminimas atliktas: ${reminder_info || "Skambutis įvykdytas"}`;
        break;
      default:
        message = `ℹ️ Atnaujinimas: ${comment || type}`;
    }

    const posted = await postLeadComment(submission.fb_lead_id, message, pageToken);

    return new Response(JSON.stringify({ success: posted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error syncing to Meta:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
