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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background" aria-labelledby="hero-heading">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" aria-hidden="true" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" aria-hidden="true" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
                <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium uppercase">LAIMINGI 1000+ KLIENTŲ</span>
              </div>
              
              <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight uppercase animate-slide-up">
                AUTOPASKOLOS.LT - <span className="gradient-text">PASKOLOS NE TIK AUTOMOBILIUI</span>
              </h1>
              
              <p className="text-base md:text-xl font-semibold text-foreground uppercase animate-slide-up" style={{ animationDelay: '0.1s' }}>
                GAUK GERIAUSIĄ PASKOLOS PASIŪLYMĄ VOS PER 30 MINUČIŲ
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Palyginame 20+ kreditorių pasiūlymus vienoje vietoje. Užpildykite paraišką per 3 minutes ir sutaupykite tūkstančius eurų.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Button 
                  size="lg" 
                  className="text-base md:text-lg h-16 md:h-14 px-8 gap-2 group shadow-lg hover:shadow-glow transition-all duration-300 hover-lift w-full sm:w-auto"
                  onClick={() => setDialogOpen(true)}
                >
                  GAUTI PASIŪLYMĄ
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center group p-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-transform group-hover:scale-110 duration-300">3.9%</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase font-medium">PALŪKANOS NUO</div>
                </div>
                <div className="text-center group p-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-transform group-hover:scale-110 duration-300">10min</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase font-medium">SPRENDIMAS</div>
                </div>
                <div className="text-center group p-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-transform group-hover:scale-110 duration-300">0€</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase font-medium">MOKESTIS</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
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

