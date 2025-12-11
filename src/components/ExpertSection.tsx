import { CheckCircle, Award, TrendingDown, Phone, Mail } from "lucide-react";
import expertImage from "@/assets/expert-person.jpg";
import { analytics } from "@/lib/analytics";

export const ExpertSection = () => {
  return (
    <section className="py-24 bg-muted/30" aria-labelledby="expert-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-lg mx-auto card-hover">
                <img 
                  src={expertImage} 
                  alt="Paskolų ekspertas"
                  className="w-full h-full object-cover aspect-[3/4]"
                  loading="lazy"
                  width="512"
                  height="683"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-xl animate-float">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm mt-0.5">Metų patirtis</div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Award className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">Sertifikuoti ekspertai</span>
              </div>

              <h2 id="expert-heading" className="text-4xl md:text-5xl font-bold leading-tight">
                Profesionalūs konsultantai –{" "}
                <span className="gradient-text">jūsų pusėje</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Mūsų ekspertai išanalizuos jūsų situaciją ir atrinksime geriausias sąlygas iš 20+ kreditorių. Sutaupykite laiką ir pinigus – mes žinome, kaip gauti geriausią pasiūlymą.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3 group">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <div>
                    <div className="font-semibold mb-1">Individualus vertinimas</div>
                    <div className="text-sm text-muted-foreground">Kiekvienam klientui parengiame individualų planą</div>
                  </div>
                </div>
                <div className="flex gap-3 group">
                  <TrendingDown className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <div>
                    <div className="font-semibold mb-1">Žemesnės palūkanos</div>
                    <div className="text-sm text-muted-foreground">Vidutiniškai 1.5% mažesnės nei tiesioginiai pasiūlymai</div>
                  </div>
                </div>
                <div className="flex gap-3 group">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <div>
                    <div className="font-semibold mb-1">Skaidrus procesas</div>
                    <div className="text-sm text-muted-foreground">Be paslėptų mokesčių ir netikėtumų</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-card border-2 border-border rounded-xl space-y-4">
                <p className="font-semibold text-lg">Susisiekite su mumis:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="tel:+37062851439" 
                    className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors group"
                    onClick={() => analytics.phoneClicked()}
                  >
                    <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span className="font-bold text-primary">+370 628 51439</span>
                  </a>
                  <a 
                    href="mailto:info@autopaskolos.lt" 
                    className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors group"
                    onClick={() => analytics.emailClicked()}
                  >
                    <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span className="font-bold text-primary">info@autopaskolos.lt</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

