// Shared Meta lead ingestion used by both the webhook and the manual recovery function.
// Never logs or returns access tokens.
import { logEvent, humanMetaError, type PageConfig } from "./metaPages.ts";
import { pickName, pickEmail, pickPhone, fieldNames } from "./leadFields.ts";

const GRAPH = "https://graph.facebook.com/v21.0";
const LEAD_FIELDS = "id,created_time,field_data,form_id,ad_id,ad_name,adset_name,campaign_name,platform";

export type IngestResult =
  | { outcome: "inserted"; submissionId: string }
  | { outcome: "duplicate" }
  | { outcome: "error"; message: string; retryable: boolean };

async function fetchLead(leadId: string, token: string) {
  const res = await fetch(`${GRAPH}/${leadId}?fields=${LEAD_FIELDS}&access_token=${encodeURIComponent(token)}`);
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text) as Error & { metaBody?: string };
    err.metaBody = text;
    throw err;
  }
  return JSON.parse(text);
}

async function fetchFormName(formId: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`${GRAPH}/${formId}?fields=name&access_token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return (await res.json())?.name ?? null;
  } catch {
    return null;
  }
}

/** Fetches a leadgen id from Meta and stores it, deduplicated by fb_lead_id. */
export async function ingestLeadgen(
  admin: any,
  page: PageConfig,
  leadgenId: string
): Promise<IngestResult> {
  const { data: existing } = await admin
    .from("contact_submissions")
    .select("id")
    .eq("fb_lead_id", String(leadgenId))
    .maybeSingle();

  if (existing) {
    await logEvent(admin, {
      page_id: page.pageId, brand: page.brand, event_type: "lead_dedup",
      status: "skipped", message: "Toks Facebook lead'as jau yra sistemoje.", fb_lead_id: String(leadgenId),
    });
    return { outcome: "duplicate" };
  }

  let leadData: any;
  try {
    leadData = await fetchLead(String(leadgenId), page.token);
  } catch (e) {
    const raw = (e as { metaBody?: string })?.metaBody ?? (e instanceof Error ? e.message : String(e));
    const message = humanMetaError(raw);
    await logEvent(admin, {
      page_id: page.pageId, brand: page.brand, event_type: "lead_fetch",
      status: "error", message, fb_lead_id: String(leadgenId),
    });
    // Token / rate limit / network problems are retryable — keep the event in the queue.
    return { outcome: "error", message, retryable: true };
  }

  const fields = leadData.field_data || [];
  const phone = pickPhone(fields) || "N/A";
  if (phone === "N/A") {
    await logEvent(admin, {
      page_id: page.pageId, brand: page.brand, event_type: "lead_fields",
      status: "info", fb_lead_id: String(leadgenId),
      message: `Telefono laukas neatpažintas. Formos laukai: ${fieldNames(fields).join(", ")}`,
    });
  }

  const formId = leadData.form_id ? String(leadData.form_id) : null;
  const formName = formId ? await fetchFormName(formId, page.token) : null;

  const { data: inserted, error } = await admin
    .from("contact_submissions")
    .insert({
      name: pickName(fields),
      email: pickEmail(fields) || "nera@fb.com",
      phone,
      source: "facebook",
      status: "new",
      fb_lead_id: String(leadgenId),
      page_id: page.pageId,
      brand: page.brand,
      created_at: leadData.created_time || undefined,
      fb_form_id: formId,
      fb_form_name: formName,
      fb_campaign_name: leadData.campaign_name ?? null,
      fb_ad_name: leadData.ad_name ?? null,
      fb_platform: leadData.platform ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    await logEvent(admin, {
      page_id: page.pageId, brand: page.brand, event_type: "lead_insert",
      status: "error", message: error?.message ?? "Nepavyko įrašyti lead'o.", fb_lead_id: String(leadgenId),
    });
    return { outcome: "error", message: error?.message ?? "Nepavyko įrašyti lead'o.", retryable: true };
  }

  await logEvent(admin, {
    page_id: page.pageId, brand: page.brand, event_type: "lead_insert",
    status: "success", message: "Naujas Facebook lead'as įrašytas.",
    fb_lead_id: String(leadgenId), submission_id: inserted.id,
  });
  return { outcome: "inserted", submissionId: inserted.id };
}
