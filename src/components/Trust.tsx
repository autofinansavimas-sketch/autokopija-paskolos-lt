import { Shield, Lock, Award } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const Trust = () => {
  const trustItems = [
    {
      icon: Shield,
      title: "Lietuvos Banko priežiūra",
      description: "Reguliuojama veikla"
    },
    {
      icon: Lock,
      title: "2048-bit SSL",
      description: "Aukščiausio lygio saugumas"
    },
    {
      icon: Award,
      title: "VDAI sertifikuota",
      description: "Duomenų apsauga"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="container mx-auto px-4 relative">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Saugi ir patikima paslauga</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            AUTOPASKOLOS.LT veikla prižiūrima{" "}
            <span className="gradient-text">Lietuvos Banko</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            AUTOPASKOLOS.LT veiklą prižiūri Lietuvos bankas, Valstybinė duomenų apsaugos inspekcija ir kitos institucijos. Visi duomenys yra koduojami 2048-bit SSL sertifikatu.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {trustItems.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 100}>
                <div className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
