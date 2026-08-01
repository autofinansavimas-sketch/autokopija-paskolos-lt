import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactForm } from "@/components/ContactForm";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/paskolu-refinansavimas";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
        { "@type": "ListItem", position: 2, name: "Paskolų refinansavimas", item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Kas yra paskolų refinansavimas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Refinansavimas – kai visos esamos paskolos, kredito kortelės ir lizingai sujungiami į vieną paskolą su viena mėnesio įmoka ir dažnai mažesnėmis palūkanomis bei ilgesniu terminu.",
          },
        },
        {
          "@type": "Question",
          name: "Kiek galiu sutaupyti refinansuodamas paskolas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sutaupoma suma priklauso nuo esamų palūkanų. Klientai, turintys kredito kortelių ar greitųjų kreditų, dažnai sumažina mėnesio įmoką 30–50 %. Tikslų skaičių pamatysite skaičiuoklėje.",
          },
        },
        {
          "@type": "Question",
          name: "Ar galima refinansuoti kelias skirtingas paskolas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Taip. Į vieną paskolą galima sujungti vartojimo paskolas, kredito korteles, greituosius kreditus, lizingą ir sąskaitų kreditus.",
          },
        },
      ],
    },
  ],
};

const PaskoluRefinansavimas = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Paskolų refinansavimas – viena įmoka, mažesnės palūkanos"
        description="Sujunkite visas paskolas ir kredito korteles į vieną įmoką. Palyginame 20+ kreditorių ir per 30 min. pateikiame 3 geriausius refinansavimo pasiūlymus."
        canonical={url}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main id="main-content">
        <section className="container mx-auto px-4 pt-8 pb-4">
          <nav aria-label="Naršymo kelias" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Pradžia</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">Paskolų refinansavimas</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Paskolų refinansavimas – viena įmoka vietoje kelių
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Jei kas mėnesį mokate kelias skirtingas įmokas, jas galima sujungti į vieną paskolą su
            mažesnėmis palūkanomis. Paskaičiuokite savo naują įmoką skaičiuoklėje – per 30 minučių
            pateiksime 3 geriausius refinansavimo pasiūlymus iš 20+ bankų ir kreditorių.
          </p>
        </section>

        <LoanCalculator />

        <section className="container mx-auto px-4 py-10 md:py-16 grid gap-8 md:grid-cols-2">
          <article>
            <h2 className="text-2xl font-bold mb-3">Kada refinansavimas apsimoka?</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Turite kredito kortelę ar greitąjį kreditą su didelėmis palūkanomis</li>
              <li>Mokate 2 ir daugiau atskirų įmokų per mėnesį</li>
              <li>Norite sumažinti mėnesio įmoką pratęsdami terminą</li>
              <li>Reikia papildomos sumos, o nauja paskola būtų dar viena įmoka</li>
            </ul>
          </article>
          <article>
            <h2 className="text-2xl font-bold mb-3">Ką gaunate refinansavus</h2>
            <p className="text-muted-foreground mb-3">
              Viena data, viena įmoka ir aiškus grafikas – lengviau planuoti biudžetą ir nebekyla
              rizikos praleisti mokėjimą. Daugelis kreditorių leidžia paskolą grąžinti anksčiau
              termino be papildomų mokesčių, todėl sumokate mažiau palūkanų.
            </p>
            <p className="text-muted-foreground">
              Peržiūrą atliekame nemokamai ir be įsipareigojimų – sprendžiate tik pamatę konkrečius
              skaičius. Taip pat galite pasidomėti{" "}
              <Link to="/paskola-automobiliui" className="text-primary underline underline-offset-4">
                paskola automobiliui
              </Link>
              .
            </p>
          </article>
        </section>

        <ContactForm />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyMobileCTA />
    </div>
  );
};

export default PaskoluRefinansavimas;
