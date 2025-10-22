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
    description: "Pasirašykite sutartį ir gaukite pinigus į sąskaitą per 1-2 darbo dienas.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kaip tai <span className="text-primary">veikia</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paprastas ir greitas procesas nuo paraiškos iki pinigų gavimo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card p-8 rounded-xl border hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {step.number}
                </div>
                
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
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
