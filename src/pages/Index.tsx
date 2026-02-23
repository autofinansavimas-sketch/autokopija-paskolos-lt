import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LoanCalculator } from "@/components/LoanCalculator";
import { Partners } from "@/components/Partners";
import { ContactForm } from "@/components/ContactForm";
import { ExpertSection } from "@/components/ExpertSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Benefits } from "@/components/Benefits";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <LoanCalculator />
        {/* <Partners /> */}{/* TODO: grąžinti vėliau */}
        <Hero />
        <ContactForm />
        <ExpertSection />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;

