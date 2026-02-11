import { CheckCircle, Award, TrendingDown, Phone, Mail, Star, Users } from "lucide-react";
import expertImage from "@/assets/expert-person.jpg";
import { analytics } from "@/lib/analytics";

export const ExpertSection = () => {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden" aria-labelledby="expert-heading">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
      <div className="hidden md:block absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-3 md:px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative order-2 lg:order-1 hidden md:block">
              {/* Decorative elements behind image */}
              <div className="absolute -top-6 -left-6 w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary/20 rounded-3xl" />
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-lg mx-auto group">
                <img 
                  src={expertImage} 
                  alt="Paskolų ekspertas"
                  className="w-full h-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width="512"
                  height="683"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Floating badges */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 rounded-2xl shadow-xl animate-float">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-sm mt-0.5 opacity-90">Metų patirtis</div>
              </div>
              
              <div className="absolute top-8 -left-4 bg-card border border-border/50 p-4 rounded-xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">4.9/5</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">500+ atsiliepimų</div>
              </div>
              
              <div className="absolute top-1/2 -right-8 bg-card border border-border/50 p-3 rounded-xl shadow-lg animate-float hidden lg:flex items-center gap-2" style={{ animationDelay: '1s' }}>
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">2000+ klientų</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20">
                <Award className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium">Sertifikuoti ekspertai</span>
              </div>

              <h2 id="expert-heading" className="text-2xl md:text-5xl font-bold leading-tight">
                Profesionalūs konsultantai –{" "}
                <span className="gradient-text">jūsų pusėje</span>
              </h2>
              
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                Mūsų ekspertai išanalizuos jūsų situaciją ir atrinksime geriausias sąlygas iš 20+ kreditorių. Sutaupykite laiką ir pinigus – mes žinome, kaip gauti geriausią pasiūlymą.
              </p>

              <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
                <div className="flex gap-3 p-3 md:p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base mb-0.5 md:mb-1">Individualus vertinimas</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Kiekvienam klientui parengiame individualų planą</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 md:p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base mb-0.5 md:mb-1">Žemesnės palūkanos</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Vidutiniškai 1.5% mažesnės nei tiesioginiai pasiūlymai</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 md:p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base mb-0.5 md:mb-1">Skaidrus procesas</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Be paslėptų mokesčių ir netikėtumų</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-8 p-4 md:p-6 bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 rounded-2xl space-y-3 md:space-y-4 shadow-lg">
                <p className="font-semibold text-base md:text-lg">Susisiekite su mumis:</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a 
                    href="tel:+37062851439" 
                    className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl hover:from-primary/25 hover:to-primary/10 transition-all group border border-primary/20"
                    onClick={() => analytics.phoneClicked()}
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-primary">+370 628 51439</span>
                  </a>
                  <a 
                    href="mailto:info@autopaskolos.lt" 
                    className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl hover:from-primary/25 hover:to-primary/10 transition-all group border border-primary/20"
                    onClick={() => analytics.emailClicked()}
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-primary">info@autopaskolos.lt</span>
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
