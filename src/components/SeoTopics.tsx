import { Link } from "react-router-dom";

const topics = [
  {
    title: "Vartojimo paskola",
    text: "Vartojimo paskola iki 30 000 € be užstato – automobiliui, remontui, mokslams ar netikėtoms išlaidoms. Fiksuotos palūkanos, aiškus grafikas.",
  },
  {
    title: "Autopaskola ir paskola automobiliui",
    text: "Autopaskola be pradinio įnašo: automobilis registruojamas Jūsų vardu, todėl galite jį laisvai perleisti ar perparduoti.",
    to: "/paskola-automobiliui",
    linkLabel: "Paskola automobiliui",
  },
  {
    title: "Lizingas ir automobilio lizingas",
    text: "Lyginame ir lizingo pasiūlymus – tinka naujesniems automobiliams. Parodome, kada lizingas pigiau už paskolą ir kada ne.",
  },
  {
    title: "Kreditas ir kreditai",
    text: "Kreditas gyventojams, kredito linijos ir kredito kortelių pakeitimas viena paskola su mažesnėmis palūkanomis.",
  },
  {
    title: "Greitas kreditas alternatyva",
    text: "Greitas kreditas dažnai kainuoja daugiausia. Parodome pigesnę alternatyvą su tokiu pat greitu sprendimu – per 30 minučių.",
  },
  {
    title: "Paskolų refinansavimas",
    text: "Sujunkite paskolas, lizingus ir kredito korteles į vieną įmoką – mažiau datų, mažesnės palūkanos.",
    to: "/paskolu-refinansavimas",
    linkLabel: "Paskolų refinansavimas",
  },
];

export const SeoTopics = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30" aria-labelledby="seo-topics-title">
      <div className="container mx-auto px-4">
        <h2 id="seo-topics-title" className="text-2xl md:text-3xl font-bold mb-3">
          Paskolos, kreditai ir lizingas – viskas vienoje vietoje
        </h2>
        <p className="text-muted-foreground max-w-3xl mb-8">
          AUTOPASKOLOS.LT lygina paskolų, autopaskolų, kreditų ir lizingo pasiūlymus iš daugiau nei
          20 Lietuvos bankų bei kreditorių. Užpildote vieną paraišką – gaunate 3 geriausius
          pasiūlymus be įsipareigojimų.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <article key={t.title} className="rounded-xl border bg-card p-5 card-hover">
              <h3 className="font-semibold mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.text}</p>
              {t.to && (
                <Link
                  to={t.to}
                  className="mt-3 inline-block text-sm text-primary underline underline-offset-4"
                >
                  {t.linkLabel}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
