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
    <section className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          5 dažniausi klausimai
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4" onValueChange={handleAccordionChange}>
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <AccordionItem 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
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
