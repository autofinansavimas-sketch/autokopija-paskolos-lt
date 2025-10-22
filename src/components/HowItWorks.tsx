import { FileText, Search, Banknote } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: FileText,
    title: "Užpildykite paskolos anketą",
    description: "Užpildykite trumpą anketą ir patvirtinkite savo tapatybę atlikdami 1ct pavedimą."
  },
  {
    number: "2",
    icon: Search,
    title: "Pasirinkite geriausią paskolą",
    description: "Per 1 val. atrinksime Jums 3 geriausius paskolos pasiūlymus iš bankų ir kitų kredito įstaigų."
  },
  {
    number: "3",
    icon: Banknote,
    title: "Gaukite pinigus per 1 valandą",
    description: "Štai ir viskas! Pinigai į Jūsų nurodytą banko sąskaitą bus pervesti per 1 darbo valandą."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Gauti vartojimo paskolą lengva
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-xl p-8 border border-border h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
