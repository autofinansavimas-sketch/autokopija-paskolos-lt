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
              
              <h2 id="hero-heading" className="text-3xl md:text-5xl font-bold leading-tight uppercase animate-slide-up">
                KODĖL <span className="gradient-text">RINKTIS MUS?</span>
              </h2>
              
              <p className="text-lg md:text-2xl font-semibold text-foreground uppercase animate-slide-up" style={{ animationDelay: '0.1s' }}>
                PALYGINAME 20+ KREDITORIŲ IR RANDAME GERIAUSIĄ PASIŪLYMĄ
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 30 minučių. Palyginkite 20+ kreditorių pasiūlymus vienoje vietoje ir sutaupykite tūkstančius eurų.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-primary transition-transform group-hover:scale-105">3.9%</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase">PALŪKANOS NUO</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-primary transition-transform group-hover:scale-105">10min</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase">SPRENDIMAS</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-primary transition-transform group-hover:scale-105">0€</div>
                  <div className="text-base text-muted-foreground mt-2 uppercase">MOKESTIS</div>
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

