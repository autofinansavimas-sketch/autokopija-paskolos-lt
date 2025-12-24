import { Sparkles } from "lucide-react";
import inbankLogo from "@/assets/partners/inbank.png";
import bigbankLogo from "@/assets/partners/bigbank.png";
import arkuLogo from "@/assets/partners/arku.jpeg";
import currentLogo from "@/assets/partners/current.png";
import akuLogo from "@/assets/partners/aku.png";
import revolutLogo from "@/assets/partners/revolut.png";

export const Partners = () => {
  const partners = [
    { name: "Inbank", logo: inbankLogo },
    { name: "Bigbank", logo: bigbankLogo },
    { name: "ARKU", logo: arkuLogo },
    { name: "Current", logo: currentLogo },
    { name: "AKU", logo: akuLogo },
    { name: "Revolut", logo: revolutLogo },
  ];

  return (
    <section className="py-12 bg-secondary/10" aria-labelledby="partners-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Mūsų partneriai</span>
          </div>
          <h2 id="partners-heading" className="text-2xl md:text-3xl font-bold">
            Palyginame geriausius kreditorius
          </h2>
        </div>
        
        {/* Grid layout for uniform logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-20"
            >
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="h-10 w-auto max-w-[100px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
