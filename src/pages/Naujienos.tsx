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

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/naujienos";

const Naujienos = () => {
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
          { "@type": "ListItem", position: 2, name: "Naujienos", item: url },
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
        title="Naujienos ir naudingi patarimai apie paskolas | Autopaskolos.lt"
        description="Straipsniai apie paskolas automobiliui, vartojimo paskolas, refinansavimą ir palūkanas. Praktiniai patarimai, kaip pasiskolinti pigiau ir saugiau."
        canonical={url}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main id="main-content">
        <section className="container mx-auto px-4 pt-8 pb-6">
          <nav aria-label="Naršymo kelias" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Pradžia</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">Naujienos</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Naujienos ir patarimai</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Praktiniai straipsniai apie paskolas automobiliui, vartojimo paskolas, kreditus ir
            refinansavimą. Rašome apie tai, ko klausia mūsų klientai kasdien – be smulkaus šrifto.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-12 md:pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((a) => (
              <Card key={a.slug} className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{a.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {a.readMinutes} min.
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 leading-snug">
                    <Link to={`/naujienos/${a.slug}`} className="hover:text-primary">
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
