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
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Patikima platforma</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-5 animate-slide-up">
            Kodėl rinktis <span className="gradient-text">AUTOPASKOLOS.LT</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Padedame tūkstančiams žmonių rasti geriausias paskolų sąlygas Lietuvoje
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="group relative bg-card p-7 md:p-8 rounded-2xl border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl h-full overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 md:mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <benefit.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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