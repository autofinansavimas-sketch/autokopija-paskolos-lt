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
    <section id="atsiliepimai" className="py-24 md:py-32 relative overflow-hidden" aria-labelledby="testimonials-heading">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium">1000+ patenkintų klientų</span>
            </div>
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold mb-5 animate-slide-up">
              Ką sako mūsų <span className="gradient-text">klientai</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Tikri atsiliepimai iš mūsų patenkintų klientų
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12" role="list">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <article className="group bg-card border-2 border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-xl h-full relative overflow-hidden" role="listitem">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" aria-hidden="true" />
                  <div className="flex gap-1 mb-6" role="img" aria-label={`Įvertinimas: ${testimonial.rating} iš 5 žvaigždučių`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-base md:text-lg mb-6 leading-relaxed relative z-10">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer className="relative z-10">
                    <cite className="not-italic">
                      <div className="font-bold text-primary text-lg">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </cite>
                  </footer>
                </article>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={400}>
            <div className="bg-card border-2 border-primary/30 rounded-3xl p-8 md:p-12 overflow-hidden relative group hover:border-primary/50 transition-all duration-500 hover:shadow-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={testimonialImage} 
                    alt="Laimingi klientai su automobiliu"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width="500"
                    height="400"
                  />
                </div>
                <div className="space-y-5">
                  <div className="text-6xl md:text-7xl font-black gradient-text">4.9/5</div>
                  <div className="flex gap-1" aria-label="Įvertinimas: 4.9 iš 5 žvaigždučių">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-7 w-7 fill-primary text-primary" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-2xl font-bold">Vidutinis klientų įvertinimas</p>
                  <p className="text-lg text-muted-foreground">Remiantis 1,240+ klientų atsiliepimais per pastaruosius metus</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

