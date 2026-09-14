// Single source of truth for the ONLY Facebook pages this integration may ever touch.
// Auto Kopers NL (or any other page) must never be stored, subscribed, imported or displayed.

export type AllowedPage = { pageId: string; brand: string; label: string };

export const ALLOWED_PAGES: AllowedPage[] = [
  { pageId: "106074400938363", brand: "autokopers", label: "Auto Kopers LT" },
  { pageId: "873404112522750", brand: "autopaskolos", label: "Autopaskolos.lt" },
];

export const ALLOWED_PAGE_IDS: string[] = ALLOWED_PAGES.map((p) => p.pageId);

export const isAllowedPage = (pageId: unknown): boolean =>
  ALLOWED_PAGE_IDS.includes(String(pageId ?? ""));

export const brandForPage = (pageId: unknown): string | null =>
  ALLOWED_PAGES.find((p) => p.pageId === String(pageId ?? ""))?.brand ?? null;

export const labelForPage = (pageId: unknown): string | null =>
  ALLOWED_PAGES.find((p) => p.pageId === String(pageId ?? ""))?.label ?? null;
