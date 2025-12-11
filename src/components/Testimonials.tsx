import { Star, Quote } from "lucide-react";
import testimonialImage from "@/assets/testimonial-couple.jpg";
import { AnimatedSection } from "@/components/AnimatedSection";

const testimonials = [
  {
    quote: "Sutaupėme beveik 3000 eurų per paskolos laikotarpį. Konsultantė buvo labai profesionali ir padėjo išsirinkti tinkamiausią variantą mūsų situacijai.",
    author: "Mindaugas ir Laura K.",
    location: "Vilnius",
    rating: 5
  },
  {
    quote: "Neįtikėtina, kaip greitai gavome pasiūlymus. Per vieną dieną turėjome 4 skirtingus pasiūlymus ir išsirinkome geriausią. Labai rekomenduoju!",
    author: "Tomas V.",
    location: "Kaunas",
    rating: 5
  },
  {
    quote: "Maniau, kad man nepatvirtins paskolos dėl kredito istorijos, bet ekspertai surado tinkamą kreditorių. Esu labai dėkinga už profesionalią pagalbą!",
    author: "Rūta M.",
    location: "Klaipėda",
    rating: 5
  },
  {
    quote: "Skaidrus procesas nuo pradžios iki pabaigos. Jokių paslėptų mokesčių ar netikėtumų. Tikrai vertas pasitikėjimo.",
    author: "Jonas P.",
    location: "Šiauliai",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section id="atsiliepimai" className="py-24 bg-gradient-to-br from-muted/50 to-background" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-bold mb-4">
              Ką sako mūsų <span className="gradient-text">klientai</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tikri atsiliepimai iš mūsų patenkintų klientų
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12" role="list">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <article className="bg-card border-2 border-border rounded-2xl p-8 hover:border-primary/50 transition-all card-hover h-full relative" role="listitem">
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" aria-hidden="true" />
                  <div className="flex gap-1 mb-6" role="img" aria-label={`Įvertinimas: ${testimonial.rating} iš 5 žvaigždučių`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-base mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer>
                    <cite className="not-italic">
                      <div className="font-semibold text-primary">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </cite>
                  </footer>
                </article>
              </AnimatedSection>
            ))}
          </div>

          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 md:p-12 card-hover">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={testimonialImage} 
                  alt="Laimingi klientai su automobiliu"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="500"
                  height="400"
                />
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-bold gradient-text">4.9/5</div>
                <div className="flex gap-1" aria-label="Įvertinimas: 4.9 iš 5 žvaigždučių">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-primary text-primary" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-xl font-semibold">Vidutinis klientų įvertinimas</p>
                <p className="text-muted-foreground">Remiantis 1,240+ klientų atsiliepimais per pastaruosius metus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

