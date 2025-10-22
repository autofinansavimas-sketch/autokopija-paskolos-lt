import { Button } from "@/components/ui/button";
import { Car, RefreshCw, Wrench, ShoppingCart, ChevronRight } from "lucide-react";

const loanTypes = [
  { icon: ShoppingCart, label: "Vartojimo paskola" },
  { icon: Car, label: "Paskola automobiliui" },
  { icon: RefreshCw, label: "Refinansavimas" },
  { icon: Wrench, label: "Paskola būsto remontui" },
];

export const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-background to-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Nemokamai palyginkite paskolas iki 30.000 €
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Per 1 valandą Jums atrinksime 3 geriausius paskolos pasiūlymus iš 20 bankų ir kreditorių. Nemokamai ir be įsipareigojimų.
            </p>
            
            <div className="space-y-3 mb-8">
              {loanTypes.map((type, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <type.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2">Klientų įvertinimas</span>
              <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-4 ml-1" />
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-full p-8 border border-primary/20">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">👨‍💼</div>
                    <p className="text-sm text-muted-foreground">Paskolos ekspertas</p>
                    <p className="text-xs text-muted-foreground mt-1">AUTOKOPERS rūpinamas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
