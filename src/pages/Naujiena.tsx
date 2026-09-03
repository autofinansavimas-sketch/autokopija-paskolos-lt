import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import { articles, getArticle, formatArticleDate } from "@/data/articles";
import { getArticleImage } from "@/data/articleImages";
import NotFound from "./NotFound";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const Naujiena = () => {
  const { slug } = useParams();
  const article = getArticle(slug);

  if (!article) return <NotFound />;

  const url = `https://autopaskolos.lt/naujienos/${article.slug}`;
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.date,
      dateModified: article.date,
      articleSection: article.category,
      inLanguage: "lt-LT",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "AUTOPASKOLOS.LT" },
      publisher: { "@type": "Organization", name: "AUTOPASKOLOS.LT" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
        { "@type": "ListItem", position: 2, name: "Naujienos", item: "https://autopaskolos.lt/naujienos" },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  if (article.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: article.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <div className="min-h-screen">
      <SEOHead title={article.metaTitle} description={article.metaDescription} canonical={url} />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}
        </script>
      </Helmet>
      <Header />
      <main id="main-content">
        <article className="container mx-auto px-4 pt-8 pb-12 md:pb-20 max-w-3xl">
          <nav aria-label="Naršymo kelias" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Pradžia</Link>
            <span className="mx-2">/</span>
            <Link to="/naujienos" className="hover:text-primary">Naujienos</Link>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {article.readMinutes} min. skaitymo
            </span>
            <time dateTime={article.date} className="text-xs text-muted-foreground">
              {formatArticleDate(article.date)}
            </time>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">{article.title}</h1>

          <figure className="mb-8 -mx-4 md:mx-0">
            <img
              src={getArticleImage(article.slug)}
              alt={article.title}
              width={1280}
              height={720}
              className="w-full aspect-[16/9] object-cover md:rounded-2xl shadow-lg"
            />
          </figure>

          <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed border-l-2 border-primary pl-4">
            {article.intro}
          </p>

          <div className="space-y-8">
            {article.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-xl md:text-2xl font-semibold mb-3">{s.heading}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="text-sm md:text-base text-muted-foreground mb-3 leading-relaxed">{p}</p>
                ))}
                {s.bullets && (
                  <ul className="space-y-2 mt-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="text-sm md:text-base text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h2 className="text-xl font-semibold mb-2">Pasiskaičiuokite savo įmoką</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pasirinkite sumą ir terminą skaičiuoklėje – pasiūlymą paruošiame per 30 min.
            </p>
            <Button asChild>
              <Link to="/#skaiciuokle">
                <Calculator className="h-4 w-4 mr-2" aria-hidden="true" />
                Atidaryti skaičiuoklę
              </Link>
            </Button>
          </div>

          {article.faq?.length ? (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">Dažniausi klausimai</h2>
              <div className="space-y-4">
                {article.faq.map((f) => (
                  <div key={f.q} className="p-4 rounded-xl border border-border/60">
                    <h3 className="font-medium mb-1">{f.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Kiti straipsniai</h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    to={`/naujienos/${a.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={getArticleImage(a.slug)}
                        alt={a.title}
                        width={1280}
                        height={720}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{a.title}</span>
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <Link to="/naujienos" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Visos naujienos
            </Link>
          </div>
        </article>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyMobileCTA />
    </div>
  );
};

export default Naujiena;
