import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

import { ExpertSection } from "@/components/ExpertSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Benefits } from "@/components/Benefits";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Trust } from "@/components/Trust";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        
        <ExpertSection />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <FAQ />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
