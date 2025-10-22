import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Esate tikri paskolų ekspertai! Nesitikėjau paskolos tokiomis puikiomis sąlygomis",
    author: "Radvilė K.",
    source: "Google Reviews"
  },
  {
    quote: "Suderėjote geresnes paskolos sąlygas, negu anksčiau gavau pati. Ačiū jums!",
    author: "Agnė K.",
    source: "Google Reviews"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
              <Quote className="h-10 w-10 text-primary mb-4" />
              <blockquote className="text-lg mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
