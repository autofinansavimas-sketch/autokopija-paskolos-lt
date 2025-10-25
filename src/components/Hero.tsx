import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-person.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Patikima 10,000+ klientų</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Gauk geriausią{" "}
              <span className="text-primary">paskolos pasiūlymą</span>{" "}
              vos per 30 minučių
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 1 valandą. Palyginkite 20+ kreditorių pasiūlymus vienoje vietoje ir sutaupykite tūkstančius eurų.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 gap-2 group shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  document.querySelector('#loan-calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Gauti paskolos pasiūlymą
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pt-8 border-t">
              <div className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-bold text-primary">3.9%</div>
                <div className="text-base text-muted-foreground mt-2">Palūkanos nuo</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-bold text-primary">10min</div>
                <div className="text-base text-muted-foreground mt-2">Sprendimas</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-bold text-primary">0€</div>
                <div className="text-base text-muted-foreground mt-2">Mokestis</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:block hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
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
  );
};
