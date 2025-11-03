import { Shield, TrendingDown, Zap, Users, BadgeCheck, FileCheck } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "100% Saugumas",
    description: "Jūsų duomenys apsaugoti banko lygio saugumo standartais",
  },
  {
    icon: TrendingDown,
    title: "Geriausios sąlygos",
    description: "Palyginkime 20+ kreditorių ir atrinksime jums tinkamiausius",
  },
  {
    icon: Zap,
    title: "Greitas procesas",
    description: "Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 30 minučių",
  },
  {
    icon: Users,
    title: "Asmeninė pagalba",
    description: "Mūsų ekspertai konsultuoja kiekviename žingsnyje",
  },
  {
    icon: BadgeCheck,
    title: "Be jokių mokesčių",
    description: "Mūsų paslauga visiškai nemokama - mokame tik kreditoriai",
  },
  {
    icon: FileCheck,
    title: "Skaidrus procesas",
    description: "Matote visus mokesčius ir sąlygas prieš pasirašydami",
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Kodėl rinktis <span className="text-primary">AUTOPASKOLOS.LT</span>?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Padedame tūkstančiams žmonių rasti geriausias paskolų sąlygas Lietuvoje
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card p-6 md:p-8 rounded-xl border hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{benefit.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
