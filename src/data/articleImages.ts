import imgAuto from "@/assets/articles/paskola-automobiliui.jpg";
import imgRefi from "@/assets/articles/refinansavimas.jpg";
import imgRates from "@/assets/articles/palukanos.jpg";
import imgLease from "@/assets/articles/lizingas.jpg";
import imgMistakes from "@/assets/articles/klaidos.jpg";
import imgHistory from "@/assets/articles/kredito-istorija.jpg";

export const articleImages: Record<string, string> = {
  "kaip-gauti-paskola-automobiliui": imgAuto,
  "paskolu-refinansavimas-kada-verta": imgRefi,
  "kaip-formuojamos-paskolos-palukanos": imgRates,
  "lizingas-ar-vartojimo-paskola-automobiliui": imgLease,
  "5-klaidos-imant-paskola": imgMistakes,
  "kaip-pagerinti-kredito-istorija": imgHistory,
};

export const getArticleImage = (slug: string) => articleImages[slug] ?? imgAuto;
