import { Sparkles } from "lucide-react";
import inbankLogo from "@/assets/partners/inbank.png";
import bigbankLogo from "@/assets/partners/bigbank.png";
import arkuLogo from "@/assets/partners/arku.jpeg";
import currentLogo from "@/assets/partners/current.png";
import autokopersLogo from "@/assets/partners/autokopers.png";
import akuLogo from "@/assets/partners/aku.png";

export const Partners = () => {
  const partners = [
    { name: "Inbank", logo: inbankLogo },
    { name: "Bigbank", logo: bigbankLogo },
    { name: "ARKU", logo: arkuLogo },
    { name: "Current", logo: currentLogo },
    { name: "AutoKopers Finance", logo: autokopersLogo },
    { name: "AKU", logo: akuLogo },
  ];

  // Double the array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 relative overflow-hidden bg-secondary/20" aria-labelledby="partners-heading">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Mūsų partneriai</span>
          </div>
          <h2 id="partners-heading" className="text-2xl md:text-3xl font-bold">
            Palyginame geriausius kreditorius
          </h2>
        </div>
        
        {/* Infinite scroll container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll gap-8 py-4 items-center">
              {duplicatedPartners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center px-6 py-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 min-w-[160px] h-[80px] group"
                >
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="max-h-12 max-w-[120px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
