// One-time historical Facebook Lead Ads import.
// mode=preview -> read-only summary (count, date range, duplicates)
// mode=import  -> inserts ONLY new fb_lead_id rows; never updates existing status/comments.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPageRegistry, humanMetaError, logEvent } from "../_shared/metaPages.ts";
import { pickName, pickEmail, pickPhone, fieldNames } from "../_shared/leadFields.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function getField(fieldData: any[], name: string): string | null {
  const f = fieldData?.find((x: any) => x.name?.toLowerCase() === name.toLowerCase());
  return f?.values?.[0] || null;
}

async function fetchAll(url: string, cap = 20): Promise<any[]> {
  const out: any[] = [];
  let next: string | null = url;
  let pages = 0;
  while (next && pages < cap) {
    const res = await fetch(next);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    const parsed = JSON.parse(text);
    out.push(...(parsed?.data ?? []));
    next = parsed?.paging?.next ?? null;
    pages++;
  }
  return out;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (!isAdmin) return json({ error: "Tik administratorius gali importuoti senus lead'us." }, 403);

  let body: any = {};
  try {
    body = await req.json();
  } catch { /* default */ }
  const mode = body?.mode === "import" ? "import" : body?.mode === "backfill" ? "backfill" : "preview";
  const brandFilter = typeof body?.brand === "string" ? body.brand : null;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const pages = buildPageRegistry().filter((p) => !brandFilter || p.brand === brandFilter);

  const summary: any[] = [];

  for (const page of pages) {
    const entry: any = {
      brand: page.brand,
      pageId: page.pageId,
      total: 0,
      newCount: 0,
      duplicates: 0,
      oldest: null,
      newest: null,
      imported: 0,
      failed: 0,
      error: null,
    };
    try {
      const forms = await fetchAll(
        `https://graph.facebook.com/v21.0/${page.pageId}/leadgen_forms?fields=id,name&limit=50&access_token=${encodeURIComponent(page.token)}`
      );
      const leads: any[] = [];
      for (const form of forms) {
        const formLeads = await fetchAll(
          `https://graph.facebook.com/v21.0/${form.id}/leads?fields=id,created_time,field_data,form_id,ad_id,ad_name,adset_name,campaign_name,platform&limit=100&access_token=${encodeURIComponent(page.token)}`
        );
        for (const l of formLeads) {
          l.__formId = String(form.id);
          l.__formName = form.name ?? null;
        }
        leads.push(...formLeads);
      }

      entry.total = leads.length;

      const ids = leads.map((l) => String(l.id));
      const existingIds = new Set<string>();
      for (let i = 0; i < ids.length; i += 200) {
        const chunk = ids.slice(i, i + 200);
        if (!chunk.length) continue;
        const { data } = await admin.from("contact_submissions").select("fb_lead_id").in("fb_lead_id", chunk);
        for (const row of data ?? []) if (row.fb_lead_id) existingIds.add(String(row.fb_lead_id));
      }

      const fresh = leads.filter((l) => !existingIds.has(String(l.id)));
      entry.duplicates = entry.total - fresh.length;
      entry.newCount = fresh.length;
      const times = leads.map((l) => l.created_time).filter(Boolean).sort();
      entry.oldest = times[0] ?? null;
      entry.newest = times[times.length - 1] ?? null;

      await logEvent(admin, {
        page_id: page.pageId,
        brand: page.brand,
        event_type: mode === "import" ? "import_run" : "import_preview",
        status: "info",
        message: `Facebook rado ${entry.total} lead'ų, nauji: ${entry.newCount}, dublikatai: ${entry.duplicates}`,
      });

      if (mode === "backfill") {
        entry.updated = 0;
        entry.sampleFields = fieldNames(leads[0]?.field_data);
        for (const lead of leads) {
          const fields = lead.field_data || [];
          const phone = pickPhone(fields);
          const email = pickEmail(fields);
          const name = pickName(fields);
          const patch: Record<string, string> = {};
          if (phone) patch.phone = phone;
          if (email) patch.email = email;
          if (name) patch.name = name;
          if (!Object.keys(patch).length) continue;
          const { data: rows } = await admin
            .from("contact_submissions")
            .select("id, phone, email, name")
            .eq("fb_lead_id", String(lead.id));
          for (const row of rows ?? []) {
            const upd: Record<string, string> = {};
            if (phone && (!row.phone || row.phone === "N/A")) upd.phone = phone;
            if (email && (!row.email || row.email === "nera@fb.com")) upd.email = email;
            if (name && !row.name) upd.name = name;
            if (!Object.keys(upd).length) continue;
            const { error } = await admin.from("contact_submissions").update(upd).eq("id", row.id);
            if (error) entry.failed++;
            else entry.updated++;
          }
        }
        await logEvent(admin, {
          page_id: page.pageId, brand: page.brand, event_type: "import_backfill",
          status: "info", message: `Atnaujinta kontaktų: ${entry.updated}`,
        });
      }

      if (mode === "import") {
        for (const lead of fresh) {
          const fields = lead.field_data || [];
          const { data: inserted, error } = await admin
            .from("contact_submissions")
            .insert({
              name: pickName(fields) || getField(fields, "full_name"),
              email: pickEmail(fields) || "nera@fb.com",
              phone: pickPhone(fields) || "N/A",
              source: "facebook",
              status: "new",
              fb_lead_id: String(lead.id),
              page_id: page.pageId,
              brand: page.brand,
              created_at: lead.created_time || undefined,
            })
            .select("id")
            .single();
          if (error) {
            entry.failed++;
            await logEvent(admin, {
              page_id: page.pageId, brand: page.brand, event_type: "import_insert",
              status: "error", message: error.message, fb_lead_id: String(lead.id),
            });
          } else {
            entry.imported++;
            await logEvent(admin, {
              page_id: page.pageId, brand: page.brand, event_type: "import_insert",
              status: "success", message: "Įrašytas senas Facebook lead'as",
              fb_lead_id: String(lead.id), submission_id: inserted?.id ?? null,
            });
          }
        }
      }
    } catch (e) {
      entry.error = humanMetaError(e instanceof Error ? e.message : e);
      await logEvent(admin, {
        page_id: page.pageId, brand: page.brand,
        event_type: mode === "import" ? "import_run" : "import_preview",
        status: "error", message: entry.error,
      });
    }
    summary.push(entry);
  }

  return json({ mode, checkedAt: new Date().toISOString(), pages: summary });
});
