import { Shield, TrendingDown, Zap, Users, BadgeCheck, FileCheck } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

const benefits = [
  {
    icon: Shield,
    title: "100% Saugumas",
    description: "Jūsų duomenys apsaugoti banko lygio saugumo standartais",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingDown,
    title: "Geriausios sąlygos",
    description: "Palyginkime 20+ kreditorių ir atrinksime jums tinkamiausius",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Greitas procesas",
    description: "Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 30 minučių",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Asmeninė pagalba",
    description: "Mūsų ekspertai konsultuoja kiekviename žingsnyje",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: BadgeCheck,
    title: "Be jokių mokesčių",
    description: "Mūsų paslauga visiškai nemokama - mokame tik kreditoriai",
    gradient: "from-rose-500 to-red-600",
  },
  {
    icon: FileCheck,
    title: "Skaidrus procesas",
    description: "Matote visus mokesčius ir sąlygas prieš pasirašydami",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export const Benefits = () => {
  return (
    <section className="py-10 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
      <div className="hidden md:block absolute top-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-3 md:px-4 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 md:mb-6 animate-fade-in">
            <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            <span className="text-xs md:text-sm font-medium">Patikima platforma</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-5 animate-slide-up">
            Kodėl rinktis <span className="gradient-text">AUTOPASKOLOS.LT</span>?
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 animate-slide-up hidden sm:block" style={{ animationDelay: '0.1s' }}>
            Padedame tūkstančiams žmonių rasti geriausias paskolų sąlygas Lietuvoje
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="group relative bg-card p-4 md:p-8 rounded-xl md:rounded-2xl border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl h-full overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-3 md:mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <benefit.icon className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-3 group-hover:text-primary transition-colors leading-tight">{benefit.title}</h3>
                <p className="text-[11px] md:text-lg text-muted-foreground leading-snug md:leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};