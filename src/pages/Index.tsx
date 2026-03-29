import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactForm } from "@/components/ContactForm";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { SocialProofPopup } from "@/components/SocialProofPopup";

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

