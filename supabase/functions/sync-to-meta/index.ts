import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_PAGE_ACCESS_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN")!;
const META_PAGE_ID = Deno.env.get("META_PAGE_ID")!;

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
async function postLeadComment(leadId: string, message: string) {
  const url = `https://graph.facebook.com/v21.0/${leadId}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: META_PAGE_ACCESS_TOKEN,
      message,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to post comment to lead ${leadId}: ${err}`);
    return false;
  }
  return true;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the user is authenticated and approved
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, submission_id, comment, new_status, reminder_info } = await req.json();

    // Get the submission to find fb_lead_id
    const { data: submission, error: subError } = await supabase
      .from("contact_submissions")
      .select("fb_lead_id, name")
      .eq("id", submission_id)
      .single();

    if (subError || !submission?.fb_lead_id) {
      // Not a Facebook lead, skip silently
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let message = "";

    switch (type) {
      case "comment":
        message = `💬 Komentaras: ${comment}`;
        break;
      case "status_change":
        const label = statusLabels[new_status] || new_status;
        message = `📋 Būsena pakeista → ${label}`;
        break;
      case "reminder_created":
        message = `🔔 Priminimas: ${reminder_info || "Suplanuotas skambutis"}`;
        break;
      case "reminder_completed":
        message = `✅ Priminimas atliktas: ${reminder_info || "Skambutis įvykdytas"}`;
        break;
      default:
        message = `ℹ️ Atnaujinimas: ${comment || type}`;
    }

    const posted = await postLeadComment(submission.fb_lead_id, message);

    return new Response(
      JSON.stringify({ success: posted }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing to Meta:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
