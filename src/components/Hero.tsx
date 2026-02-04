import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-person.jpg";
import { ContactFormDialog } from "@/components/ContactFormDialog";

export const Hero = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <section className="relative min-h-[70vh] md:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background" aria-labelledby="hero-heading">
        {/* Decorative background elements - Hidden on mobile for performance */}
        <div className="hidden md:block absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" aria-hidden="true" />
        <div className="hidden md:block absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" aria-hidden="true" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid lg:grid-cols-[60%_40%] gap-8 md:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium uppercase">LAIMINGI 1000+ KLIENTŲ</span>
              </div>
              
              <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black leading-tight uppercase animate-slide-up tracking-tight">
                KODĖL RINKTIS <span className="gradient-text">MUS</span>?
              </h1>
              
              <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-foreground uppercase animate-slide-up" style={{ animationDelay: '0.1s' }}>
                PALYGINAME 20+ KREDITORIŲ IR RANDAME <span className="gradient-text">GERIAUSIĄ PASIŪLYMĄ</span>
              </h2>
              
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up hidden sm:block" style={{ animationDelay: '0.2s' }}>
                Užpildykite paraišką per 3 minutes ir sutaupykite tūkstančius eurų.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Button 
                  size="lg" 
                  className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 gap-2 group shadow-lg hover:shadow-glow transition-all duration-300 hover-lift w-full sm:w-auto"
                  onClick={() => setDialogOpen(true)}
                >
                  GAUTI PASIŪLYMĄ
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </div>

              {/* Stats - Compact on mobile */}
              <div className="grid grid-cols-3 gap-2 md:gap-6 pt-4 md:pt-8 border-t border-border/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center group p-2 md:p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 cursor-default">
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">3.9%</div>
                  <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground mt-1 uppercase font-medium">PALŪKANOS NUO</div>
                </div>
                <div className="text-center group p-2 md:p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 cursor-default">
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    <span className="inline-flex items-baseline">
                      10<span className="text-lg sm:text-xl md:text-3xl ml-0.5">min</span>
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground mt-1 uppercase font-medium">SPRENDIMAS</div>
                </div>
                <div className="text-center group p-2 md:p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 cursor-default">
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">0€</div>
                  <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground mt-1 uppercase font-medium">MOKESTIS</div>
                </div>
              </div>
            </div>

            {/* Right Image - Hidden on mobile */}
            <div className="relative lg:block hidden animate-slide-in-right">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl animate-float" aria-hidden="true"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-h-[500px] max-w-[400px] ml-auto card-hover">
                <img 
                  src={heroImage} 
                  alt="Profesionali paskolų konsultantė"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width="400"
                  height="500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

