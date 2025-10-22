import { Button } from "@/components/ui/button";
import { TrendingDown, Gift, Zap, UserCheck } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "Sutaupoma iki 3.806 €",
    description: "Analizuojame daugelio kredito įstaigų pasiūlymus - paskolos kaina kartais skiriasi net iki 3.806 €."
  },
  {
    icon: Gift,
    title: "Paslauga nemokama",
    description: "Nesuklydote, mūsų paslaugos, iš tiesų, nieko nekainuoja."
  },
  {
    icon: Zap,
    title: "Dirbame greitai",
    description: "Paskolos pasiūlymą pateiksime per 1 valandą. Pinigai pervedami per 1 darbo valandą."
  },
  {
    icon: UserCheck,
    title: "Asmeninis konsultantas",
    description: "Suteikiame asmeninį konsultantą, kuris yra Jūsų, o ne banko pusėje. Jis padės viso proceso metu."
  }
];

export const Benefits = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            AUTOPASKOLOS.LT pasirinko daugiau nei 200.000 žmonių. Nenuostabu, nes:
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg px-8 py-6">
            Gauti pasiūlymą
          </Button>
        </div>
      </div>
    </section>
  );
};
