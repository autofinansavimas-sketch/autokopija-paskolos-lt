// Manually pull recent leads from all Meta lead forms on the connected Page.
// Inserts new leads into contact_submissions (deduplicated by fb_lead_id).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const META_PAGE_ID = Deno.env.get("META_PAGE_ID");
const META_PAGE_ACCESS_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getField(fieldData: Array<{ name?: string; values?: string[] }>, names: string[]): string | null {
  for (const n of names) {
    const f = fieldData?.find((x) => x.name?.toLowerCase() === n.toLowerCase());
    if (f?.values?.[0]) return f.values[0];
  }
  return null;
}

function normPhone(p: string | null): string {
  if (!p) return "";
  const digits = p.replace(/\D/g, "");
  if (digits.startsWith("370")) return "+" + digits;
  if (digits.startsWith("8") && digits.length === 9) return "+370" + digits.slice(1);
  return p.startsWith("+") ? p : "+" + digits;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!META_PAGE_ID || !META_PAGE_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "META_PAGE_ID arba META_PAGE_ACCESS_TOKEN nesukonfigūruotas" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const sinceHours = Math.min(Number(body.hours) || 168, 720); // default 7d, max 30d
    const sinceTs = Math.floor((Date.now() - sinceHours * 3600 * 1000) / 1000);

    // 1. list all lead forms on the page
    const formsRes = await fetch(
      `https://graph.facebook.com/v21.0/${META_PAGE_ID}/leadgen_forms?fields=id,name&limit=100&access_token=${META_PAGE_ACCESS_TOKEN}`
    );
    if (!formsRes.ok) {
      const t = await formsRes.text();
      console.error("forms fetch failed", t);
      return new Response(JSON.stringify({ error: "Nepavyko gauti Meta formų sąrašo", details: t }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const formsJson = await formsRes.json();
    const forms: Array<{ id: string; name: string }> = formsJson.data || [];

    let totalFetched = 0;
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const form of forms) {
      let url: string | null =
        `https://graph.facebook.com/v21.0/${form.id}/leads?fields=id,created_time,field_data,form_id&filtering=[{"field":"time_created","operator":"GREATER_THAN","value":${sinceTs}}]&limit=100&access_token=${META_PAGE_ACCESS_TOKEN}`;

      while (url) {
        const leadsRes: Response = await fetch(url);
        if (!leadsRes.ok) {
          const t = await leadsRes.text();
          errors.push(`Forma ${form.name}: ${t.slice(0, 200)}`);
          break;
        }
        const leadsJson = await leadsRes.json();
        const leads: Array<{ id: string; created_time: string; field_data: Array<{ name?: string; values?: string[] }> }> = leadsJson.data || [];
        totalFetched += leads.length;

        for (const lead of leads) {
          const email = getField(lead.field_data, ["email", "el_pastas"]);
          const phone = normPhone(getField(lead.field_data, ["phone_number", "telefonas"]));
          const name = getField(lead.field_data, ["full_name", "vardas_pavarde", "first_name"]);
          const amount = getField(lead.field_data, ["amount", "suma", "paskolos_suma"]);
          const loanType = getField(lead.field_data, ["loan_type", "paskolos_tipas"]);

          if (!email && !phone) {
            skipped++;
            continue;
          }

          // Dedup by fb_lead_id
          const { data: existing } = await supabase
            .from("contact_submissions")
            .select("id")
            .eq("fb_lead_id", lead.id)
            .maybeSingle();

          if (existing) {
            skipped++;
            continue;
          }

          const { error: insErr } = await supabase.from("contact_submissions").insert({
            name: name || "Meta klientas",
            email: email || "no-email@meta.lead",
            phone: phone || "",
            amount: amount || null,
            loan_type: loanType || null,
            status: "new",
            source: "meta",
            fb_lead_id: lead.id,
          });

          if (insErr) {
            errors.push(`Insert ${lead.id}: ${insErr.message}`);
            skipped++;
          } else {
            inserted++;
          }
        }

        url = leadsJson.paging?.next || null;
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      forms: forms.length,
      totalFetched,
      inserted,
      skipped,
      errors: errors.slice(0, 5),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("meta-leads-sync error:", err);
    const message = err instanceof Error ? err.message : "Nežinoma klaida";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
