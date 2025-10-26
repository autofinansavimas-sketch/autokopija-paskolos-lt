import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Pradėk taupyti šiandien
          </h2>

          <p className="text-lg text-white/90">
            Greitas, paprastas ir nemokamas procesas.
          </p>

          <div className="flex justify-center pt-2">
            <Button 
              size="lg" 
              variant="secondary"
              className="h-14 px-10 text-lg"
              onClick={() => {
                document.querySelector('#contact-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Gauti paskolą
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Saugus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Nemokamas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Greitas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
