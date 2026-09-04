import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { articles } from "@/data/articles";
import { getArticleImage } from "@/data/articleImages";

export const LatestArticles = () => {
  const latest = [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Naudinga žinoti</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            Praktiniai patarimai apie paskolas, lizingą, refinansavimą ir palūkanas – be smulkaus šrifto.
          </p>
        </div>
        <Link to="/naujienos" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
          Visi straipsniai <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {latest.map((a) => (
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
            <CardContent className="p-5 flex flex-col">
              <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {a.readMinutes} min. skaitymo
              </span>
              <h3 className="text-lg font-semibold mb-2 leading-snug">
                <Link to={`/naujienos/${a.slug}`} className="group-hover:text-primary transition-colors">
                  {a.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{a.excerpt}</p>
              <Link
                to={`/naujienos/${a.slug}`}
                className="text-sm text-primary inline-flex items-center gap-1 hover:underline self-start"
              >
                Skaityti <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
