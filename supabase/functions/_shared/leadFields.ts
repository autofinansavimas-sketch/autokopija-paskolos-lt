// Robust extraction of contact details from Meta Lead Ads field_data.
// Meta form field names are author-defined (often Lithuanian), so we match
// loosely by name and fall back to value shape detection.

type Field = { name?: string; values?: string[] };

const norm = (s: unknown) =>
  String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_");

function values(fieldData: Field[] | undefined | null): { key: string; value: string }[] {
  return (fieldData ?? [])
    .map((f) => ({ key: norm(f?.name), value: String(f?.values?.[0] ?? "").trim() }))
    .filter((f) => f.value.length > 0);
}

const PHONE_HINTS = ["phone", "telef", "mobil", "numeris", "number", "tel"];
const EMAIL_HINTS = ["email", "e_mail", "pastas", "mail"];
const NAME_HINTS = ["full_name", "name", "vardas", "first_name", "last_name", "pavarde"];

const looksLikePhone = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && !v.includes("@");
};

export function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  let v = raw.replace(/[^\d+]/g, "");
  if (!v) return null;
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (!v.startsWith("+")) {
    if (v.startsWith("370")) v = "+" + v;
    else if (v.startsWith("8") && v.length === 9) v = "+370" + v.slice(1);
    else if (v.length === 8) v = "+370" + v;
  }
  return v;
}

export function pickPhone(fieldData: Field[] | undefined | null): string | null {
  const vals = values(fieldData);
  const byName = vals.find((f) => PHONE_HINTS.some((h) => f.key.includes(h)) && looksLikePhone(f.value));
  const byShape = vals.find((f) => looksLikePhone(f.value));
  return normalizePhone(byName?.value ?? byShape?.value ?? null);
}

export function pickEmail(fieldData: Field[] | undefined | null): string | null {
  const vals = values(fieldData);
  const byName = vals.find((f) => EMAIL_HINTS.some((h) => f.key.includes(h)) && f.value.includes("@"));
  const byShape = vals.find((f) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
  return (byName?.value ?? byShape?.value ?? null)?.toLowerCase() ?? null;
}

export function pickName(fieldData: Field[] | undefined | null): string | null {
  const vals = values(fieldData);
  const full = vals.find((f) => f.key.includes("full_name") || f.key === "name" || f.key.includes("vardas_pavarde"));
  if (full) return full.value;
  const first = vals.find((f) => f.key.includes("first_name") || f.key === "vardas");
  const last = vals.find((f) => f.key.includes("last_name") || f.key.includes("pavarde"));
  if (first || last) return [first?.value, last?.value].filter(Boolean).join(" ");
  const anyName = vals.find((f) => NAME_HINTS.some((h) => f.key.includes(h)));
  return anyName?.value ?? null;
}

export function fieldNames(fieldData: Field[] | undefined | null): string[] {
  return (fieldData ?? []).map((f) => String(f?.name ?? ""));
}
