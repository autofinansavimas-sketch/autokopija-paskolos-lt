import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, name, id } = await req.json();
    if (action === "create") {
      const r = await fetch("https://api.resend.com/domains", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, region: "eu-central-1" }),
      });
      return new Response(JSON.stringify({ status: r.status, body: await r.text() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "get") {
      const r = await fetch(`https://api.resend.com/domains/${id}`, {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      return new Response(JSON.stringify({ status: r.status, body: await r.text() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "bad action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
