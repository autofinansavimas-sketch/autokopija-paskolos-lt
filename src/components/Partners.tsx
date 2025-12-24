import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import inbankLogo from "@/assets/partners/inbank.png";
import bigbankLogo from "@/assets/partners/bigbank.png";
import arkuLogo from "@/assets/partners/arku.jpeg";
import currentLogo from "@/assets/partners/current.png";
import akuLogo from "@/assets/partners/aku.png";
import revolutLogo from "@/assets/partners/revolut.png";
import autokopersLogo from "@/assets/autokopers-logo.png";

type PartnerItem = {
  name: string;
  logo?: string;
  logoClassName?: string;
};

export const Partners = () => {
  const partners: PartnerItem[] = [
    { name: "Inbank", logo: inbankLogo },
    { name: "Bigbank", logo: bigbankLogo },
    { name: "ARKU", logo: arkuLogo, logoClassName: "scale-125" },
    { name: "Current", logo: currentLogo, logoClassName: "scale-90" },
    { name: "AKU", logo: akuLogo, logoClassName: "scale-125" },
    { name: "Revolut", logo: revolutLogo },
    { name: "AutoKopers Finance", logo: autokopersLogo },

    // papildomi partneriai (logotipus galėsim įkelti vėliau)
    { name: "GF bankas" },
    { name: "TF Bank" },
    { name: "Fjord Bank" },
    { name: "URBO" },
    { name: "Citadele" },
    { name: "Lizis" },
    { name: "go4rent" },
    { name: "autofino.lt" },
  ];

  // Keep exactly x2 for the CSS animation (-50%)
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 bg-secondary/10 overflow-hidden" aria-labelledby="partners-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">Mūsų partneriai</span>
          </div>
          <h2 id="partners-heading" className="text-2xl md:text-3xl font-bold">
            Palyginame geriausius kreditorius
          </h2>
        </div>
      </div>

      {/* Infinite scroll carousel */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div className="flex animate-scroll gap-6 md:gap-8 py-4 items-center">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center justify-center p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 min-w-[150px] md:min-w-[190px] h-[76px] md:h-[92px] flex-shrink-0"
                aria-label={partner.name}
              >
                {partner.logo ? (
                  <div className="h-10 md:h-12 w-[120px] md:w-[140px] flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logotipas`}
                      className={cn(
                        "h-full w-full object-contain",
                        partner.logoClassName
                      )}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <span className="font-semibold text-foreground/90 whitespace-nowrap">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
