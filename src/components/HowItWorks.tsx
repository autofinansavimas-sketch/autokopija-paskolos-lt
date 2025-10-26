import { FileText, Search, CheckCircle2, HandCoins } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Užpildykite paraišką",
    description: "Atsakykite į kelis klausimus apie norimą paskolą ir save. Užtruks tik 3 minutes.",
  },
  {
    number: "02",
    icon: Search,
    title: "Gausite pasiūlymus",
    description: "Per 1 valandą atrinksime 3 geriausius pasiūlymus iš 20+ kreditorių.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Pasirinkite geriausią",
    description: "Palyginkite sąlygas ir pasirinkite jums tinkamiausią variantą.",
  },
  {
    number: "04",
    icon: HandCoins,
    title: "Gaukite pinigus",
    description: "Pasirašykite sutartį ir gaukite pinigus į sąskaitą per 30 min.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Kaip tai veikia?
          </h2>
          <p className="text-base text-muted-foreground">
            4 paprasti žingsniai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
