import { Building2, Sparkles } from "lucide-react";

export const Partners = () => {
  const partners = [
    "Citadele",
    "TF Bank",
    "Fjord Bank",
    "URBO",
    "SKU",
    "GF",
    "Inbank",
    "Bigbank",
    "Medicinos bankas",
    "+11 kitų"
  ];

  // Double the array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-20 relative overflow-hidden" aria-labelledby="partners-heading">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/10 to-secondary/30" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">20+ partnerių</span>
          </div>
          <h2 id="partners-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Geriausias pasiūlymas iš patikimų partnerių
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bendradarbiaujame su pirmaujančiais Lietuvos ir Europos finansiniais partneriais
          </p>
        </div>
        
        {/* Infinite scroll container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll gap-6 py-4">
              {duplicatedPartners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-8 py-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300 min-w-[180px] group cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground/90 whitespace-nowrap">
                    {partner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
