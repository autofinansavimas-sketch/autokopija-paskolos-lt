/**
 * Viešai bankų / kreditorių paskelbtos vartojimo paskolų sąlygos.
 * Šaltiniai nurodyti prie kiekvieno įrašo – reikia atnaujinti, kai bankai paskelbia naujas normas.
 * `rate` – viešai skelbiama metinė palūkanų norma "nuo" (%), `aprFrom`/`aprTo` – BVKKMN (%).
 * Jei banko norma nustatoma tik individualiai, `rate` yra null.
 */

export type Lender = {
  name: string;
  /** Viešai skelbiama metinė palūkanų norma "nuo" (%). null – tik individuali. */
  rate: number | null;
  /** BVKKMN nuo (%) */
  aprFrom: number | null;
  /** BVKKMN iki (%) */
  aprTo: number | null;
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
  contractFeeNote: string;
  source: string;
  sourceLabel: string;
};

export const RATES_UPDATED = "2026-09-06";

export const lenders: Lender[] = [
  {
    name: "SEB",
    rate: null,
    aprFrom: 9.26,
    aprTo: null,
    minAmount: 500,
    maxAmount: 40000,
    minMonths: 12,
    maxMonths: 84,
    contractFeeNote: "Sutarties mokestis pagal banko įkainius",
    source: "https://www.seb.lt/privatiems/kreditai/vartojimo-kreditas",
    sourceLabel: "seb.lt",
  },
  {
    name: "Fjord Bank",
    rate: 8.9,
    aprFrom: 7.9,
    aprTo: 38,
    minAmount: 600,
    maxAmount: 30000,
    minMonths: 12,
    maxMonths: 120,
    contractFeeNote: "Sutarties sudarymo mokestis netaikomas",
    source: "https://lendly.lt/pigiausios-paskolos/",
    sourceLabel: "paskelbtos sąlygos",
  },
  {
    name: "Swedbank",
    rate: null,
    aprFrom: 19.55,
    aprTo: null,
    minAmount: 500,
    maxAmount: 20000,
    minMonths: 12,
    maxMonths: 84,
    contractFeeNote: "Sutarties mokestis pagal banko įkainius",
    source: "https://www.swedbank.lt/private/credit/loans/newSmall?language=LIT",
    sourceLabel: "swedbank.lt",
  },
  {
    name: "Luminor",
    rate: null,
    aprFrom: null,
    aprTo: null,
    minAmount: 2000,
    maxAmount: 25000,
    minMonths: 12,
    maxMonths: 84,
    contractFeeNote: "Norma nustatoma individualiai",
    source: "https://www.luminor.lt/lt/privatiems/vartojimo-paskola",
    sourceLabel: "luminor.lt",
  },
  {
    name: "Bigbank",
    rate: null,
    aprFrom: null,
    aprTo: null,
    minAmount: 1000,
    maxAmount: 30000,
    minMonths: 6,
    maxMonths: 120,
    contractFeeNote: "Fiksuotos palūkanos, norma individuali",
    source: "https://www.bigbank.lt/vartojimo-paskola/",
    sourceLabel: "bigbank.lt",
  },
  {
    name: "Inbank",
    rate: null,
    aprFrom: null,
    aprTo: null,
    minAmount: 500,
    maxAmount: 20000,
    minMonths: 12,
    maxMonths: 84,
    contractFeeNote: "Sutarties ir administravimo mokesčiai pagal sutartį",
    source: "https://inbank.lt/paskola/paskola-vartojimo",
    sourceLabel: "inbank.lt",
  },
];
