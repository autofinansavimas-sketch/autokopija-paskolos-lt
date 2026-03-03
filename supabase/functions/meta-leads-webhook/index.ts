import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_PAGE_ACCESS_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN")!;
const META_VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN")!;
const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;

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
async function fetchLeadData(leadId: string) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${leadId}?access_token=${META_PAGE_ACCESS_TOKEN}`
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
      for (const change of entry.changes || []) {
        if (change.field !== "leadgen") continue;

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
        const leadData = await fetchLeadData(leadgenId);
        const fields = leadData.field_data || [];

        const name = getField(fields, "full_name") || getField(fields, "first_name");
        const email = getField(fields, "email") || "nera@fb.com";
        const phone = getField(fields, "phone_number") || "N/A";

        // Insert into contact_submissions
        const { data: inserted, error } = await supabase
          .from("contact_submissions")
          .insert({
            name,
            email,
            phone,
            source: "facebook",
            status: "new",
            fb_lead_id: leadgenId,
          })
          .select()
          .single();

        if (error) {
          console.error("Error inserting lead:", error);
        } else {
          console.log(`Lead ${leadgenId} imported as submission ${inserted.id}`);
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
