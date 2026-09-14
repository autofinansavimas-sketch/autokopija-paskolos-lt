// Shared multi-brand Meta page registry + durable event logging helpers.
// Never log or return access tokens.
// Every page that leaves this module is checked against the strict allow-list
// (Auto Kopers LT + Autopaskolos.lt only) — no other page can ever be used.
import { isAllowedPage, brandForPage } from "./metaAllowlist.ts";

export type PageConfig = { pageId: string; token: string; brand: string; label: string };

const LEGACY_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN") || "";
const LEGACY_PAGE_ID = Deno.env.get("META_PAGE_ID") || "";
const AP_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOPASKOLOS") || "";
const AP_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOPASKOLOS") || "";
const AK_TOKEN = Deno.env.get("META_PAGE_ACCESS_TOKEN_AUTOKOPERS") || "";
const AK_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOKOPERS") || "";

export const BRAND_LABELS: Record<string, string> = {
  autopaskolos: "Autopaskolos.lt",
  autokopers: "Auto Kopers LT",
};

export function buildPageRegistry(): PageConfig[] {
  const pages: PageConfig[] = [];
  if (AP_PAGE_ID && AP_TOKEN)
    pages.push({ pageId: AP_PAGE_ID, token: AP_TOKEN, brand: "autopaskolos", label: BRAND_LABELS.autopaskolos });
  if (AK_PAGE_ID && AK_TOKEN)
    pages.push({ pageId: AK_PAGE_ID, token: AK_TOKEN, brand: "autokopers", label: BRAND_LABELS.autokopers });
  if (LEGACY_PAGE_ID && LEGACY_TOKEN && !pages.some((p) => p.pageId === LEGACY_PAGE_ID)) {
    pages.push({ pageId: LEGACY_PAGE_ID, token: LEGACY_TOKEN, brand: "autopaskolos", label: BRAND_LABELS.autopaskolos });
  }
  return pages.filter((p) => isAllowedPage(p.pageId));
}

export function missingConfig(): { brand: string; label: string; hasToken: boolean; hasPageId: boolean }[] {
  return [
    { brand: "autopaskolos", label: BRAND_LABELS.autopaskolos, hasToken: !!(AP_TOKEN || LEGACY_TOKEN), hasPageId: !!(AP_PAGE_ID || LEGACY_PAGE_ID) },
    { brand: "autokopers", label: BRAND_LABELS.autokopers, hasToken: !!AK_TOKEN, hasPageId: !!AK_PAGE_ID },
  ];
}

/** Turns a raw Meta Graph API error into plain Lithuanian for operators. */
export function humanMetaError(raw: unknown): string {
  let code: number | undefined;
  let sub: number | undefined;
  let msg = "";
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw as any);
    const err = parsed?.error ?? parsed;
    code = err?.code;
    sub = err?.error_subcode;
    msg = String(err?.message ?? "");
  } catch {
    msg = String(raw ?? "");
  }
  if (code === 190 && sub === 467) return "Puslapio prieigos raktas nebegalioja (sesija pasibaigė) – reikia išduoti naują.";
  if (code === 190) return "Puslapio prieigos raktas netinkamas arba atšauktas – reikia išduoti naują.";
  if (code === 200 || code === 10) return "Nepakanka leidimų (leads_retrieval / pages_manage_metadata) šiam puslapiui.";
  if (code === 100) return "Facebook nerado nurodyto puslapio arba lauko – patikrinkite puslapio ID.";
  if (code === 4 || code === 17 || code === 32) return "Facebook laikinai apribojo užklausų kiekį – pabandykite vėliau.";
  if (!msg) return "Nežinoma Facebook klaida.";
  return `Facebook klaida: ${msg.slice(0, 300)}`;
}

export async function logEvent(
  supabase: any,
  entry: {
    page_id?: string | null;
    brand?: string | null;
    event_type: string;
    status: "success" | "error" | "skipped" | "info";
    message?: string | null;
    fb_lead_id?: string | null;
    submission_id?: string | null;
  }
) {
  try {
    await supabase.from("meta_event_log").insert({
      page_id: entry.page_id ?? null,
      brand: entry.brand ?? null,
      event_type: entry.event_type,
      status: entry.status,
      message: entry.message ? String(entry.message).slice(0, 1000) : null,
      fb_lead_id: entry.fb_lead_id ?? null,
      submission_id: entry.submission_id ?? null,
    });
  } catch (e) {
    console.error("meta_event_log insert failed:", e);
  }
}

/**
 * DB-first page registry. Tokens authorised through Meta Login for Business are stored
 * server-side in public.meta_page_tokens and take precedence over static secrets.
 * Falls back to the env-secret registry so nothing breaks if OAuth was never run.
 */
export async function resolvePages(admin: any): Promise<PageConfig[]> {
  const envPages = buildPageRegistry();
  const merged = new Map<string, PageConfig>();
  for (const p of envPages) merged.set(p.pageId, p);
  try {
    const { data } = await admin
      .from("meta_page_tokens")
      .select("page_id, brand, page_name, access_token, revoked_at")
      .is("revoked_at", null);
    for (const row of data ?? []) {
      if (!row.page_id || !row.access_token) continue;
      if (!isAllowedPage(row.page_id)) continue;
      const brand = brandForPage(row.page_id)
        || row.brand
        || envPages.find((p) => p.pageId === String(row.page_id))?.brand
        || "autopaskolos";
      merged.set(String(row.page_id), {
        pageId: String(row.page_id),
        token: row.access_token,
        brand,
        label: BRAND_LABELS[brand] ?? row.page_name ?? brand,
      });
    }
  } catch (e) {
    console.error("meta_page_tokens read failed:", e);
  }
  return [...merged.values()].filter((p) => isAllowedPage(p.pageId));
}

/** Config completeness that also counts OAuth-stored tokens. */
export async function configStatus(admin: any) {
  const pages = await resolvePages(admin);
  return ["autopaskolos", "autokopers"].map((brand) => {
    const page = pages.find((p) => p.brand === brand);
    return {
      brand,
      label: BRAND_LABELS[brand],
      hasToken: !!page?.token,
      hasPageId: !!page?.pageId,
    };
  });
}
