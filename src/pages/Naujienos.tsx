import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { articles, formatArticleDate } from "@/data/articles";
import { getArticleImage } from "@/data/articleImages";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/naujienos";

const Naujienos = () => {
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = sorted;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
          { "@type": "ListItem", position: 2, name: "Naudinga žinoti", item: url },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: sorted.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.title,
          url: `${url}/${a.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Naudinga žinoti: patarimai apie paskolas ir lizingą | Autopaskolos.lt"
        description="Straipsniai apie paskolas automobiliui, vartojimo paskolas, refinansavimą ir palūkanas. Praktiniai patarimai, kaip pasiskolinti pigiau ir saugiau."
        canonical={url}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main id="main-content">
        <section className="container mx-auto px-4 pt-8 pb-8">
          <nav aria-label="Naršymo kelias" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Pradžia</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">Naudinga žinoti</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Naudinga žinoti</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Praktiniai straipsniai apie paskolas automobiliui, vartojimo paskolas, kreditus ir
            refinansavimą. Rašome apie tai, ko klausia mūsų klientai kasdien – be smulkaus šrifto.
          </p>
        </section>

        {/* Featured article */}
        {featured && (
          <section className="container mx-auto px-4 pb-10">
            <Link
              to={`/naujienos/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
                <img
                  src={getArticleImage(featured.slug)}
                  alt={featured.title}
                  width={1280}
                  height={720}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" aria-hidden="true" />
                <Badge className="absolute top-4 left-4">Naujausia</Badge>
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{featured.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {featured.readMinutes} min.
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-5 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <time dateTime={featured.date} className="text-xs text-muted-foreground">
                    {formatArticleDate(featured.date)}
                  </time>
                  <span className="text-sm text-primary inline-flex items-center gap-1">
                    Skaityti <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="container mx-auto px-4 pb-12 md:pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <Card key={a.slug} className="h-full overflow-hidden group border-border/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link to={`/naujienos/${a.slug}`} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={getArticleImage(a.slug)}
                      alt={a.title}
                      width={1280}
                      height={720}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur-sm">
                      {a.category}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-5 md:p-6 flex flex-col">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {a.readMinutes} min. skaitymo
                  </span>
                  <h2 className="text-lg md:text-xl font-semibold mb-2 leading-snug">
                    <Link to={`/naujienos/${a.slug}`} className="group-hover:text-primary transition-colors">
                      {a.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{a.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <time dateTime={a.date} className="text-xs text-muted-foreground">
                      {formatArticleDate(a.date)}
                    </time>
                    <Link
                      to={`/naujienos/${a.slug}`}
                      className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Skaityti <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyMobileCTA />
    </div>
  );
};

export default Naujienos;
