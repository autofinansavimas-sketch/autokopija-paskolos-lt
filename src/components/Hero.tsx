import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-person.jpg";

export const Hero = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Gauk <span className="text-primary">paskolą</span> per 30 minučių
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Užpildyk paraišką per 3 minutes. Palygink 20+ kreditorių. Gauk pinigus greitai.
            </p>

            <div className="flex justify-center pt-2">
              <Button 
                size="lg" 
                className="text-lg h-14 px-10"
                onClick={() => {
                  document.querySelector('#loan-calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pradėti dabar
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 pt-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">3.9%</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Palūkanos</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">10min</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Atsakymas</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">0€</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Mokestis</div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};
