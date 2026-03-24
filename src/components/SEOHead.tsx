import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

const defaults = {
  title: "AUTOPASKOLOS.LT - Nemokamai palyginkite paskolas iki 30.000 €",
  description:
    "Per 30 minučių atrinksime 3 geriausius paskolos pasiūlymus iš 20 bankų ir kreditorių. Nemokamai ir be įsipareigojimų. Powered by AUTOKOPERS.",
};

export const SEOHead = ({
  title = defaults.title,
  description = defaults.description,
  canonical,
  noindex = false,
}: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {canonical && <link rel="canonical" href={canonical} />}
    {noindex && <meta name="robots" content="noindex, nofollow" />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
  </Helmet>
);
