import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Sparkles } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactFormDialog";

export const CTA = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <section className="py-12 md:py-24 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90 animate-gradient"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" aria-hidden="true"></div>
        
        {/* Floating decorative elements */}
        <div className="hidden md:block absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" aria-hidden="true"></div>
        <div className="hidden md:block absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} aria-hidden="true"></div>
        
        <div className="container mx-auto px-3 md:px-4 relative">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3 mb-4 md:mb-8 animate-fade-in">
              <Clock className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              <span className="font-semibold text-sm md:text-base">Atsakymas per 1 valandą</span>
            </div>
            
            <h2 id="cta-heading" className="text-2xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight animate-slide-up">
              Pradėkite taupyti šiandien
            </h2>
            
            <p className="text-sm md:text-xl mb-6 md:mb-10 opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Užpildykite trumpą formą ir gaukite geriausius pasiūlymus iš 20+ kreditorių. Tai nieko nekainuoja ir užtruks tik 3 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 gap-2 group shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                onClick={() => setDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                Gauti paskolą
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs md:text-sm opacity-80 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
              <span>100% saugus procesas • Be įsipareigojimų • Nemokamai</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

