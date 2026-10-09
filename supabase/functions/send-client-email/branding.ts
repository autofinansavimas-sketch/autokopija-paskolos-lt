export const EMAIL_BRANDS = {
  autopaskolos: { from: "AutoPaskolos <info@autopaskolos.lt>", label: "AUTOPASKOLOS.LT" },
  autokopers: { from: "AutoKopers <info@autokopers.lt>", label: "AUTOKOPERS.LT" },
} as const;

export function resolveEmailBrand(brand: unknown) {
  if (brand === undefined || brand === "autopaskolos") return EMAIL_BRANDS.autopaskolos;
  if (brand === "autokopers") return EMAIL_BRANDS.autokopers;
  return null;
}