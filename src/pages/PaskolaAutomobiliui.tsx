import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactForm } from "@/components/ContactForm";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/paskola-automobiliui";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
        { "@type": "ListItem", position: 2, name: "Paskola automobiliui", item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Kokia paskola automobiliui yra pigiausia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pigiausias variantas priklauso nuo Jūsų pajamų, kredito istorijos ir termino. Vartojimo paskola dažnai išeina pigiau nei lizingas, nes automobilis iš karto tampa Jūsų nuosavybe. Mes palyginame pasiūlymus iš daugiau nei 20 bankų ir kreditorių ir atrenkame 3 geriausius.",
          },
        },
        {
          "@type": "Question",
          name: "Ar galiu gauti paskolą automobiliui be pradinio įnašo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Taip. Vartojimo paskola automobiliui paprastai neturi pradinio įnašo reikalavimo – gaunate visą sumą ir automobilį įsigyjate savo vardu.",
          },
        },
        {
          "@type": "Question",
          name: "Kiek laiko užtrunka gauti sprendimą?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pirminį atsakymą gaunate per 30 minučių darbo dienomis, o pinigai dažniausiai pervedami tą pačią arba kitą darbo dieną.",
          },
        },
      ],
    },
  ],
};

const PaskolaAutomobiliui = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Paskola automobiliui – palyginkite 20+ pasiūlymų | Autopaskolos.lt"
        description="Paskola automobiliui be pradinio įnašo. Per 30 min. atrenkame 3 geriausius pasiūlymus iš 20+ bankų ir kreditorių. Nemokamai ir be įsipareigojimų."
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
            <span aria-current="page">Paskola automobiliui</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Paskola automobiliui – palyginkite 20+ pasiūlymų vienoje vietoje
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Norite įsigyti automobilį, bet nežinote, kuris kreditorius pasiūlys mažiausias palūkanas?
            Užpildykite vieną paraišką – mūsų ekspertai per 30 minučių atrinks 3 geriausius paskolos
            pasiūlymus automobiliui pagal Jūsų pajamas ir norimą terminą. Paslauga nemokama ir be
            jokių įsipareigojimų.
          </p>
        </section>

        <LoanCalculator />

        <section className="container mx-auto px-4 py-10 md:py-16 grid gap-8 md:grid-cols-2">
          <article>
            <h2 className="text-2xl font-bold mb-3">Vartojimo paskola ar lizingas automobiliui?</h2>
            <p className="text-muted-foreground mb-3">
              Su vartojimo paskola automobilis iš karto registruojamas Jūsų vardu, todėl galite jį
              laisvai perleisti ar perparduoti. Lizingo atveju transporto priemonė lieka finansuotojo
              nuosavybe iki paskutinės įmokos, dažnai reikalingas pradinis įnašas ir KASKO draudimas.
            </p>
            <p className="text-muted-foreground">
              Daugumai klientų, įsigyjančių naudotą automobilį iki 30 000 €, vartojimo paskola yra
              paprastesnis ir pigesnis sprendimas.
            </p>
          </article>
          <article>
            <h2 className="text-2xl font-bold mb-3">Ko reikia paraiškai?</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Būti 18–75 metų Lietuvos rezidentu</li>
              <li>Nuolatinės, oficialiai deklaruojamos pajamos</li>
              <li>Bent 3–6 mėnesių darbo stažas dabartinėje darbovietėje</li>
              <li>Neturėti reikšmingų vėluojančių įsipareigojimų</li>
            </ul>
            <h2 className="text-2xl font-bold mt-6 mb-3">Kaip vyksta procesas?</h2>
            <ol className="space-y-2 text-muted-foreground list-decimal pl-5">
              <li>Užpildote trumpą paraišką arba paskaičiuojate įmoką skaičiuoklėje</li>
              <li>Per 30 min. susisiekiame ir patikslinam poreikį</li>
              <li>Gaunate 3 geriausius pasiūlymus ir pasirenkate tinkamiausią</li>
            </ol>
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

export default PaskolaAutomobiliui;
