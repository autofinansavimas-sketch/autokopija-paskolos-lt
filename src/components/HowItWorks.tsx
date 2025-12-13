import { useState } from "react";
import { FileText, Search, CheckCircle2, HandCoins } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { AnimatedSection } from "@/components/AnimatedSection";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "UŽPILDYKITE PARAIŠKĄ",
    description: "Atsakykite į kelis klausimus apie norimą paskolą ir save. Užtruks tik 3 minutes.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    number: "02",
    icon: Search,
    title: "GAUSITE PASIŪLYMUS",
    description: "Per 1 valandą atrinksime 3 geriausius pasiūlymus iš 20+ kreditorių.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "PASIRINKITE GERIAUSIĄ",
    description: "Palyginkite sąlygas ir pasirinkite jums tinkamiausią variantą.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    number: "04",
    icon: HandCoins,
    title: "GAUKITE PINIGUS",
    description: "Pasirašykite sutartį ir gaukite pinigus į sąskaitą per 30 min.",
    gradient: "from-purple-500 to-pink-600",
  },
];

export const HowItWorks = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Paprastas procesas</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 uppercase animate-slide-up">
              KAIP TAI <span className="gradient-text">VEIKIA</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Paprastas ir greitas procesas nuo paraiškos iki pinigų gavimo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="relative h-full">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
                  )}
                  
                  <div 
                    className={`group relative bg-card p-8 rounded-2xl border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl h-full overflow-hidden ${index === 0 ? 'cursor-pointer' : ''}`}
                    onClick={index === 0 ? () => setDialogOpen(true) : undefined}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    {/* Step number - large background */}
                    <div className={`absolute -top-4 -right-4 text-8xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-10 group-hover:opacity-20 transition-opacity`}>
                      {step.number}
                    </div>
                    
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    
                    {index === 0 && (
                      <div className="mt-4 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Spustelėkite pradėti →
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};