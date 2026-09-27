// Matches active client car wishes against the public autokopers.lt catalogue
// and records new matches (shown as notifications in /admin).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const AK_URL = "https://vjdzzaerrxfctkkiwkmn.supabase.co";
const AK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZHp6YWVycnhmY3Rra2l3a21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDg0NTMsImV4cCI6MjA3NjEyNDQ1M30.GeSztoIRuyqxlAqp-PBSIRSlA3K8OzTPQmXjiwxcCJs";

const norm = (s: unknown) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const { data: wishes, error: wErr } = await admin
    .from("car_wishes")
    .select("id, submission_id, make, model")
    .eq("active", true);
  if (wErr) return json({ error: wErr.message }, 500);
  if (!wishes?.length) return json({ ok: true, matches: 0 });

  const res = await fetch(
    `${AK_URL}/rest/v1/cars?select=id,slug,make,model,year,price,image_url,is_sold&is_sold=eq.false&limit=2000`,
    { headers: { apikey: AK_ANON, Authorization: `Bearer ${AK_ANON}` } },
  );
  if (!res.ok) return json({ error: `autokopers ${res.status}` }, 502);
  const cars = (await res.json()) as Array<Record<string, unknown>>;

  const rows = [];
  for (const w of wishes) {
    const wm = norm(w.make);
    const wmod = norm(w.model);
    for (const c of cars) {
      if (norm(c.make) !== wm) continue;
      if (wmod && !norm(c.model).startsWith(wmod)) continue;
      rows.push({
        wish_id: w.id,
        submission_id: w.submission_id,
        car_id: String(c.id),
        title: `${c.make ?? ""} ${c.model ?? ""}`.trim(),
        year: typeof c.year === "number" ? c.year : null,
        price: c.price != null ? Number(c.price) : null,
        image_url: (c.image_url as string) ?? null,
        url: `https://www.autokopers.lt/automobiliai/${c.slug || c.id}`,
      });
    }
  }

  if (rows.length) {
    const { error } = await admin
      .from("car_matches")
      .upsert(rows, { onConflict: "wish_id,car_id", ignoreDuplicates: true });
    if (error) return json({ error: error.message }, 500);
  }
  return json({ ok: true, checked: cars.length, candidates: rows.length });
});
