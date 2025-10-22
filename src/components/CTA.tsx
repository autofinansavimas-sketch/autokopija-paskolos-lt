import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">Pirmieji pasiūlymai vos per 5 min.</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Gaukite geresnį pasiūlymą paskolai per 1 valandą, nemokamai!
        </h2>
        
        <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
          Gauti pasiūlymą
        </Button>
      </div>
    </section>
  );
};
