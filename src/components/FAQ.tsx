import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { analytics } from "@/lib/analytics";

const faqs = [
  {
    question: "Kas yra AUTOPASKOLOS.LT?",
    answer: "AUTOPASKOLOS.LT yra paskolų palyginimo platforma, kuri padeda klientams rasti geriausias paskolų sąlygas iš daugiau nei 20 bankų ir kreditorių. Mūsų ekspertai per 1 valandą atrinks 3 geriausius pasiūlymus, pritaikytus būtent Jums."
  },
  {
    question: "Ar galėsiu paskolą grąžinti anksčiau termino ir nemokėti palūkanų už likusį laiką?",
    answer: "Taip, dauguma mūsų partnerių leidžia grąžinti paskolą anksčiau termino be papildomų mokesčių. Tikslias sąlygas pamatysite gautame pasiūlyme."
  },
  {
    question: "Kiek laiko reikia dirbti vienoje įmonėje, kad galėčiau gauti paskolą?",
    answer: "Paprastai kredito įstaigos reikalauja bent 3-6 mėnesių darbo stažo dabartinėje darbovietėje. Tačiau kiekvienas atvejis vertinamas individualiai."
  },
  {
    question: "Ar kylant EURIBOR, padidės ir mano vartojimo paskolos įmokos?",
    answer: "Vartojimo paskolos paprastai suteikiamos su fiksuota palūkanų norma, todėl EURIBOR pokyčiai neturi įtakos Jūsų įmokoms. Tai skiriasi nuo būsto paskolų."
  },
  {
    question: "Ar galiu gauti paskolą, jeigu jau turiu kitų įsipareigojimų?",
    answer: "Taip, galite. Svarbu, kad Jūsų bendras skolų krūvis neviršytų leistinos normos. Mūsų ekspertai įvertins Jūsų finansinę situaciją ir pasiūlys tinkamiausius variantus."
  }
];

export const FAQ = () => {
  const handleAccordionChange = (value: string) => {
    if (value) {
      const index = parseInt(value.replace('item-', ''));
      const faq = faqs[index];
      if (faq) {
        analytics.faqOpened(faq.question);
      }
    }
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-secondary/20" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <span className="text-sm font-medium">DUK</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-slide-up">
            5 dažniausi <span className="gradient-text">klausimai</span>
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4" onValueChange={handleAccordionChange}>
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <AccordionItem 
                  value={`item-${index}`}
                  className="bg-card border-2 border-border/50 hover:border-primary/30 rounded-xl px-6 transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6 group">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </AnimatedSection>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
