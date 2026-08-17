import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactForm } from "@/components/ContactForm";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/vartojimo-paskola";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
        { "@type": "ListItem", position: 2, name: "Vartojimo paskola", item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Kas yra vartojimo paskola?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Vartojimo paskola – tai nekilnojamajam turtui neįsigyti skirta paskola, kurią galima panaudoti automobiliui, buities technikai, remontui, kelionėms, mokslams ar kitoms asmeninėms reikmėms. Ji paprastai suteikiama be užstato, o automobilis lieka Jūsų nuosavybe.",
          },
        },
        {
          "@type": "Question",
          name: "Kiek galiu pasiskolinti vartojimo paskolos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AUTOPASKOLOS.LT lygina vartojimo paskolos pasiūlymus nuo 1 000 € iki 30 000 €. Tikslų sumą ir palūkanas galite sužinoti per 30 minučių užpildę nemokamą paraišką.",
          },
        },
        {
          "@type": "Question",
          name: "Ar vartojimo paskola yra be užstato?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dažniausiai taip. Vartojimo paskola suteikiama be užstato ir be pradinio įnašo, todėl tinka įvairioms reikmėms, įskaitant automobilio įsigijimą, buities remontą ar netikėtas išlaidas.",
          },
        },
      ],
    },
  ],
};

const VartojimoPaskola = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Vartojimo paskola – iki 30 000 € be užstato | Autopaskolos.lt"
        description="Vartojimo paskola be užstato ir pradinio įnašo. Per 30 min. atrenkame 3 geriausius pasiūlymus iš 20+ bankų ir kreditorių. Nemokamai ir be įsipareigojimų."
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
            <span aria-current="page">Vartojimo paskola</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Vartojimo paskola – pinigai bet kokiai reikmbei
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Vartojimo paskola yra vienas lanksčiausių būdų pasiskolinti nuo 1 000 € iki 30 000 € be
            užstato. Užpildykite vieną paraišką – per 30 minučių atrinksime 3 geriausius vartojimo
            paskolos pasiūlymus iš daugiau nei 20 Lietuvos bankų ir kreditorių.
          </p>
        </section>

        <LoanCalculator />

        <section className="container mx-auto px-4 py-10 md:py-16 grid gap-8 md:grid-cols-2">
          <article>
            <h2 className="text-2xl font-bold mb-3">Kam tinka vartojimo paskola?</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Automobilio įsigijimui ar remontui</li>
              <li>Būsto remontui ir buities technikai</li>
              <li>Mokslams, kursams ar sveikatos priežiūrai</li>
              <li>Kelionėms, vestuvėms ar kitoms asmeninėms išlaidoms</li>
              <li>Esamų įsipareigojimų refinansavimui</li>
            </ul>
          </article>
          <article>
            <h2 className="text-2xl font-bold mb-3">Kodėl verta lyginti per AUTOPASKOLOS.LT?</h2>
            <p className="text-muted-foreground mb-3">
              Skirtingi bankai siūlo skirtingas palūkanas ir sąlygas. Mes palyginame pasiūlymus pagal
              Jūsų pajamas, kredito istoriją ir pageidaujamą terminą, todėl matote tik realius,
              Jums skirtus pasiūlymus.
            </p>
            <p className="text-muted-foreground">
              Paslauga nemokama ir be įsipareigojimų – sprendimą priimate tik pamatę konkrečius
              skaičius. Taip pat galite pasidomėti{" "}
              <Link to="/paskolu-refinansavimas" className="text-primary underline underline-offset-4">
                paskolų refinansavimu
              </Link>{" "}
              arba{" "}
              <Link to="/paskola-automobiliui" className="text-primary underline underline-offset-4">
                paskola automobiliui
              </Link>.
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

export default VartojimoPaskola;
