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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium uppercase">LAIMINGI 1000+ KLIENTŲ</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold leading-tight uppercase">
              AUTOPASKOLOS.LT -{" "}
              <span className="text-primary">PASKOLOS NE TIK AUTOMOBILIUI</span>
            </h1>
            
            <p className="text-lg md:text-2xl font-semibold text-foreground uppercase">
              GAUK GERIAUSIĄ PASKOLOS PASIŪLYMĄ VOS PER 30 MINUČIŲ
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 30 minučių. Palyginkite 20+ kreditorių pasiūlymus vienoje vietoje ir sutaupykite tūkstančius eurų.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg" 
                className="text-base md:text-lg h-16 md:h-14 px-8 gap-2 group shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                onClick={() => setDialogOpen(true)}
              >
                GAUTI PASIŪLYMĄ
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary">3.9%</div>
                <div className="text-base text-muted-foreground mt-2 uppercase">PALŪKANOS NUO</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary">10min</div>
                <div className="text-base text-muted-foreground mt-2 uppercase">SPRENDIMAS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary">0€</div>
                <div className="text-base text-muted-foreground mt-2 uppercase">MOKESTIS</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:block hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl max-h-[500px] max-w-[400px] ml-auto">
              <img 
                src={heroImage} 
                alt="Profesionali paskolų konsultantė"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};
