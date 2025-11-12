import { Button } from "@/components/ui/button";
import { CheckCircle, Award, TrendingDown } from "lucide-react";
import expertImage from "@/assets/expert-person.jpg";

export const ExpertSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
                <img 
                  src={expertImage} 
                  alt="Paskolų ekspertas"
                  className="w-full h-full object-cover aspect-[3/4]"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-3 rounded-xl shadow-xl">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-xs mt-0.5">Metų patirtis</div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sertifikuoti ekspertai</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Profesionalūs konsultantai –{" "}
                <span className="text-primary">jūsų pusėje</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Mūsų ekspertai išanalizuos jūsų situaciją ir atrinksime geriausias sąlygas iš 20+ kreditorių. Sutaupykite laiką ir pinigus – mes žinome, kaip gauti geriausią pasiūlymą.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Individualus vertinimas</div>
                    <div className="text-sm text-muted-foreground">Kiekvienam klientui parengiame individualų planą</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TrendingDown className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Žemesnės palūkanos</div>
                    <div className="text-sm text-muted-foreground">Vidutiniškai 1.5% mažesnės nei tiesioginiai pasiūlymai</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Skaidrus procesas</div>
                    <div className="text-sm text-muted-foreground">Be paslėptų mokesčių ir netikėtumų</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-lg">
                  <span className="font-semibold">Skambinkite:</span>
                  <a href="tel:+37062851439" className="text-primary hover:underline font-bold">+370 628 51439</a>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <span className="font-semibold">El. paštas:</span>
                  <a href="mailto:info@autopaskolos.lt" className="text-primary hover:underline font-bold">info@autopaskolos.lt</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
