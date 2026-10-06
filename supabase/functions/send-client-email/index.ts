import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEMPLATES: Record<string, { subject: string; body: (name: string) => string }> = {
  follow_up: {
    subject: "Jūsų užklausa - AUTOPASKOLOS.LT",
    body: (name) => `Sveiki${name ? `, ${name}` : ""},

Gavome jūsų užklausą ir nekantraujame jums padėti.

Bandėme su jumis susisiekti, tačiau nesėkmingai.

Labai lauksime jūsų skambučio arba žinutės kada galime jums paskambinti.

"AUTOPASKOLOS.LT" komanda`,
  },
  documents: {
    subject: "Laukiame Jūsų dokumentų - AUTOPASKOLOS.LT",
    body: (name) => `Sveiki${name ? `, ${name}` : ""},

Norėdami paruošti jums geriausią pasiūlymą, laukiame jūsų dokumentų (asmens tapatybės dokumento ir pajamų įrodymo).

Atsiųskite juos atsakymu į šį laišką arba perduokite mums telefonu.

"AUTOPASKOLOS.LT" komanda`,
  },
  offer_ready: {
    subject: "Jūsų pasiūlymas paruoštas - AUTOPASKOLOS.LT",
    body: (name) => `Sveiki${name ? `, ${name}` : ""},

Geros naujienos — jūsų paskolos pasiūlymas jau paruoštas!

Susisiekime telefonu ir aptarsime visas detales.

"AUTOPASKOLOS.LT" komanda`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require an authenticated, approved staff member
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("approved")
      .eq("user_id", user.id)
      .single();
    const isAdmin = user.email === "autofinansavimas@gmail.com";
    if (!profile?.approved && !isAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { submission_id, template } = await req.json();
    const tpl = TEMPLATES[template];
    if (!submission_id || !tpl) {
      return new Response(JSON.stringify({ ok: false, error: "bad request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sub } = await admin
      .from("contact_submissions")
      .select("name, email")
      .eq("id", submission_id)
      .single();
    if (!sub?.email) {
      return new Response(JSON.stringify({ ok: false, error: "no email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = (sub.name || "").trim().split(/\s+/)[0] || "";
    const text = tpl.body(firstName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoPaskolos <info@autopaskolos.lt>",
        to: [sub.email],
        subject: tpl.subject,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the send as a comment on the submission
    await admin.from("submission_comments").insert({
      submission_id,
      user_id: user.id,
      comment: `📧 Išsiųstas el. laiškas klientui: „${tpl.subject}"`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
