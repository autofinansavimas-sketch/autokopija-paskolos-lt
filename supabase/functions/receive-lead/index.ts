// Public lead intake endpoint. Accepts unauthenticated JSON POSTs and writes
// straight into public.leads using the service role (bypasses RLS).
// Never logs PII or secrets.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const str = (v: unknown): string | null => {
  if (typeof v === "number") return String(v);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t.slice(0, 500) : null;
};

// Accepts several common key spellings for the same value.
const pick = (obj: Record<string, unknown>, keys: string[]): string | null => {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) lower[k.trim().toLowerCase()] = v;
  for (const key of keys) {
    const hit = str(lower[key.toLowerCase()]);
    if (hit) return hit;
  }
  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ error: "Body must be a JSON object" }, 400);
  }

  const body = payload as Record<string, unknown>;
  const email = pick(body, ["email", "e-mail", "el_pastas", "el. paštas"]);
  const full_name = pick(body, ["full_name", "fullname", "name", "vardas"]);
  const phone = pick(body, ["phone", "phone_number", "mobile_phone", "telefonas"]);
  const budget = pick(body, ["Biudžetas", "biudzetas", "budget", "amount"]);
  const adset_name = pick(body, ["adset_name", "adset", "ad_set_name"]);
  const source = pick(body, ["source"]) ?? "webhook";

  if (!email && !phone) {
    return json({ error: "At least one of email or phone is required" }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await admin
    .from("leads")
    .insert({ email, full_name, phone, budget, adset_name, source, raw: body })
    .select("id")
    .single();

  if (error) {
    console.error("receive-lead insert failed:", error.message);
    return json({ error: "Could not store lead" }, 500);
  }

  // Also create a CRM card in contact_submissions so the lead shows up in "Paraiškos".
  let submissionId: string | null = null;
  let duplicate = false;
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let dupQuery = admin
      .from("contact_submissions")
      .select("id")
      .gte("created_at", since)
      .is("deleted_at", null)
      .limit(1);

    // Only a real duplicate: same phone (when given) or same real email.
    if (phone) dupQuery = dupQuery.eq("phone", phone);
    else dupQuery = dupQuery.eq("email", email!);

    const { data: dup } = await dupQuery.maybeSingle();

    if (dup) {
      duplicate = true;
    } else {
      const { data: sub, error: subError } = await admin
        .from("contact_submissions")
        .insert({
          name: full_name,
          email: email ?? "nera@webhook.lt",
          phone: phone ?? "N/A",
          amount: budget,
          loan_type: adset_name,
          source: "webhook",
          status: "new",
        })
        .select("id")
        .single();

      if (subError) console.error("receive-lead submission insert failed:", subError.message);
      else submissionId = sub.id;
    }
  } catch (e) {
    console.error("receive-lead submission step failed:", e instanceof Error ? e.message : String(e));
  }

  return json({ ok: true, id: data.id, submission_id: submissionId, duplicate }, 201);
});
