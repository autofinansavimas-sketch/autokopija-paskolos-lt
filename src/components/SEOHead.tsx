import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
}

const defaults = {
  title: "Autopaskolos.lt – paskolų palyginimas iki 30 000 €",
  description:
    "Per 30 minučių atrinksime 3 geriausius paskolos pasiūlymus iš 20 bankų ir kreditorių. Nemokamai ir be įsipareigojimų. Powered by AUTOKOPERS.",
};

export const SEOHead = ({
  title = defaults.title,
  description = defaults.description,
  canonical,
  noindex = false,
  ogTitle,
  ogDescription,
}: SEOHeadProps) => {
  const finalOgTitle = ogTitle ?? title;
  const finalOgDescription = ogDescription ?? description;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
    </Helmet>
  );
};
