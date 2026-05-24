import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLOTS: Record<string, string> = {
  morning: "Rytas (9:00–12:00)",
  noon:    "Pietūs (12:00–15:00)",
  evening: "Vakaras (15:00–18:00)",
  anytime: "Bet kuriuo metu",
};

function htmlPage(title: string, body: string) {
  return `<!doctype html><html lang="lt"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f8fb;margin:0;padding:40px 20px;color:#0f172a}
  .card{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.06);padding:32px;text-align:center}
  h1{font-size:22px;margin:0 0 12px}
  p{font-size:16px;line-height:1.5;margin:0 0 8px;color:#334155}
  .ok{color:#16a34a;font-size:48px;line-height:1;margin-bottom:8px}
  .err{color:#dc2626}
</style></head><body><div class="card">${body}</div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const slot = url.searchParams.get("slot") || "";

  if (!id || !SLOTS[slot]) {
    return new Response(
      htmlPage("Klaida", `<h1 class="err">Nuoroda negalioja</h1><p>Pabandykite dar kartą arba susisiekite tiesiogiai.</p>`),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: sub, error: subErr } = await supabase
      .from("contact_submissions")
      .select("id,name,phone,status")
      .eq("id", id)
      .maybeSingle();
    if (subErr || !sub) throw new Error("Užklausa nerasta");

    const slotLabel = SLOTS[slot];
    const note = `📞 Klientas pageidauja skambučio: ${slotLabel} (pasirinkta el. laiške ${new Date().toLocaleString("lt-LT")})`;

    await supabase.from("submission_comments").insert({
      submission_id: id,
      comment: note,
      user_id: null,
    });

    if (sub.status === "new") {
      await supabase
        .from("contact_submissions")
        .update({ status: "skambinti", updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    return new Response(
      htmlPage(
        "Ačiū!",
        `<div class="ok">✓</div>
         <h1>Ačiū${sub.name ? `, ${sub.name}` : ""}!</h1>
         <p>Užfiksavome, kad Jums patogiausia skambinti:</p>
         <p style="font-weight:600;color:#16a34a;font-size:18px;margin:14px 0 20px">${slotLabel}</p>
         <p>Mūsų specialistas su Jumis susisieks šiuo metu.</p>`
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (e) {
    console.error("schedule-callback error", e);
    return new Response(
      htmlPage("Klaida", `<h1 class="err">Įvyko klaida</h1><p>${e instanceof Error ? e.message : "Bandykite vėliau."}</p>`),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
});
