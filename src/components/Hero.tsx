import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, TrendingDown, Clock, Shield } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <TrendingDown className="h-4 w-4" />
            Palyginkite paskolas per 1 minutę
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Raskite geriausią{" "}
            <span className="text-primary">paskolą</span>
            <br />iki 30.000 €
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Nemokamai palyginkite pasiūlymus iš 20+ bankų ir kreditorių. 
            Greitas atsakymas, be įsipareigojimų.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <Button size="lg" className="gap-2 group">
              Pradėti palyginimą
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Calculator className="h-5 w-5" />
              Skaičiuoklė
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Per 1 valandą</h3>
              <p className="text-sm text-muted-foreground">Gauti 3 geriausius pasiūlymus</p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Žemiausia palūkanų norma</h3>
              <p className="text-sm text-muted-foreground">Nuo 3.9% metinių</p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">100% nemokama</h3>
              <p className="text-sm text-muted-foreground">Be jokių paslėptų mokesčių</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
