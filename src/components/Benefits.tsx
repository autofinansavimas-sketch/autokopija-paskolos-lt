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
    description: "Užpildykite paraišką per 3 minutes ir gaukite atsakymus per 1 valandą",
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
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Kodėl mes?
          </h2>
          <p className="text-base text-muted-foreground">
            Mes palengvinsime paskolos procesą
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-lg border"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
