import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactForm } from "@/components/ContactForm";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { SocialProofPopup } from "@/components/SocialProofPopup";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Kas yra AUTOPASKOLOS.LT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AUTOPASKOLOS.LT yra paskolų palyginimo platforma, kuri padeda klientams rasti geriausias paskolų sąlygas iš daugiau nei 20 bankų ir kreditorių. Mūsų ekspertai per 1 valandą atrinks 3 geriausius pasiūlymus, pritaikytus būtent Jums.",
      },
    },
    {
      "@type": "Question",
      name: "Ar galėsiu paskolą grąžinti anksčiau termino ir nemokėti palūkanų už likusį laiką?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Taip, dauguma mūsų partnerių leidžia grąžinti paskolą anksčiau termino be papildomų mokesčių. Tikslias sąlygas pamatysite gautame pasiūlyme.",
      },
    },
    {
      "@type": "Question",
      name: "Kiek laiko reikia dirbti vienoje įmonėje, kad galėčiau gauti paskolą?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paprastai kredito įstaigos reikalauja bent 3-6 mėnesių darbo stažo dabartinėje darbovietėje. Tačiau kiekvienas atvejis vertinamas individualiai.",
      },
    },
    {
      "@type": "Question",
      name: "Ar kylant EURIBOR, padidės ir mano vartojimo paskolos įmokos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vartojimo paskolos paprastai suteikiamos su fiksuota palūkanų norma, todėl EURIBOR pokyčiai neturi įtakos Jūsų įmokoms. Tai skiriasi nuo būsto paskolų.",
      },
    },
    {
      "@type": "Question",
      name: "Ar galiu gauti paskolą, jeigu jau turiu kitų įsipareigojimų?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Taip, galite. Svarbu, kad Jūsų bendras skolų krūvis neviršytų leistinos normos. Mūsų ekspertai įvertins Jūsų finansinę situaciją ir pasiūlys tinkamiausius variantus.",
      },
    },
  ],
};

// Lazy load below-the-fold sections
const ExpertSection = lazy(() => import("@/components/ExpertSection").then(m => ({ default: m.ExpertSection })));
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const Benefits = lazy(() => import("@/components/Benefits").then(m => ({ default: m.Benefits })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const CTA = lazy(() => import("@/components/CTA").then(m => ({ default: m.CTA })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const SectionFallback = () => <div className="py-16" />;

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead canonical="https://autopaskolos.lt/" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <AnnouncementBanner />
      <Header />
      <main id="main-content">
        <LoanCalculator />
        <Hero />
        <ContactForm />
        <Suspense fallback={<SectionFallback />}>
          <ExpertSection />
          <HowItWorks />
          <Benefits />
          <Testimonials />
          <FAQ />
          <CTA />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyMobileCTA />
      <SocialProofPopup />
    </div>
  );
};

export default Index;

