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

  // Triple the array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-secondary/10 overflow-hidden" aria-labelledby="partners-heading">
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
      </div>
      
      {/* Infinite scroll carousel */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex overflow-hidden">
          <div className="flex animate-scroll gap-8 py-4 items-center">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 min-w-[140px] md:min-w-[180px] h-[70px] md:h-[90px] flex-shrink-0"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="max-h-[40px] md:max-h-[50px] w-auto max-w-[110px] md:max-w-[140px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
