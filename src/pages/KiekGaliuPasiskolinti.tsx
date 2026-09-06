import { lazy, Suspense, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, Info, TrendingUp } from "lucide-react";

import inbank from "@/assets/partners/inbank.png";
import bigbank from "@/assets/partners/bigbank.png";
import aku from "@/assets/partners/aku.png";
import arku from "@/assets/partners/arku.jpeg";
import revolut from "@/assets/partners/revolut.png";
import current from "@/assets/partners/current.png";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

const url = "https://autopaskolos.lt/kiek-galiu-pasiskolinti";

const DTI_LIMIT = 0.4;

const lenders = [
  { name: "Inbank", logo: inbank, rate: 5.9, fee: 1.5 },
  { name: "Bigbank", logo: bigbank, rate: 6.4, fee: 1.8 },
  { name: "AKU", logo: aku, rate: 6.9, fee: 2.0 },
  { name: "ARKU", logo: arku, rate: 7.4, fee: 2.0 },
  { name: "Revolut", logo: revolut, rate: 7.9, fee: 1.0 },
  { name: "Current", logo: current, rate: 8.4, fee: 2.5 },
];

const eur = (n: number) =>
  new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const eur2 = (n: number) =>
  new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

/** Mėnesinė įmoka pagal anuiteto formulę */
const monthlyPayment = (principal: number, annualRate: number, months: number) => {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
};

/** Maksimali paskola pagal laisvą mėnesinį pajėgumą */
const maxPrincipal = (capacity: number, annualRate: number, months: number) => {
  if (capacity <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return capacity * months;
  return (capacity * (1 - Math.pow(1 + r, -months))) / r;
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pradžia", item: "https://autopaskolos.lt/" },
        { "@type": "ListItem", position: 2, name: "Kiek galiu pasiskolinti", item: url },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Kiek galiu pasiskolinti automobiliui – skaičiuoklė",
      url,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Kiek galiu pasiskolinti pagal savo pajamas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Lietuvoje atsakingojo skolinimosi nuostatai riboja visų kredito įmokų sumą iki 40 % mėnesio pajamų į rankas. Iš šios sumos atėmus jau esamas įmokas, gaunamas laisvas mėnesinis pajėgumas, pagal kurį apskaičiuojama maksimali paskolos suma pasirinktam terminui.",
          },
        },
        {
          "@type": "Question",
          name: "Ar rodomos palūkanos yra galutinės?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ne. Skaičiuoklė rodo orientacinius pasiūlymus pagal tipines partnerių palūkanas. Galutinę palūkanų normą bankas nustato individualiai, įvertinęs pajamas, kredito istoriją ir automobilį.",
          },
        },
        {
          "@type": "Question",
          name: "Ar reikia pradinio įnašo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pradinis įnašas nėra būtinas, tačiau kuo didesnis įnašas, tuo mažesnė paskolos suma, mėnesinė įmoka ir bendra palūkanų kaina.",
          },
        },
      ],
    },
  ],
};

const KiekGaliuPasiskolinti = () => {
  const [income, setIncome] = useState(1500);
  const [obligations, setObligations] = useState(200);
  const [carPrice, setCarPrice] = useState(12000);
  const [downPayment, setDownPayment] = useState(0);
  const [months, setMonths] = useState(60);
  const [dialogOpen, setDialogOpen] = useState(false);

  const capacity = useMemo(
    () => Math.max(0, income * DTI_LIMIT - obligations),
    [income, obligations]
  );

  const needed = Math.max(0, carPrice - downPayment);

  const offers = useMemo(() => {
    return lenders.map((l) => {
      const max = maxPrincipal(capacity, l.rate, months);
      const approved = Math.min(needed, Math.floor(max / 100) * 100);
      const payment = monthlyPayment(approved, l.rate, months);
      const total = payment * months;
      const contractFee = (approved * l.fee) / 100;
      const apr = approved > 0 ? l.rate + (l.fee / (months / 12)) * 0.9 : l.rate;
      return {
        ...l,
        max: Math.floor(max / 100) * 100,
        approved,
        payment,
        total,
        contractFee,
        apr,
        enough: approved >= needed && needed > 0,
      };
    }).sort((a, b) => b.approved - a.approved || a.payment - b.payment);
  }, [capacity, months, needed]);

  const best = offers[0];
  const bestMax = Math.max(...offers.map((o) => o.max));

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Kiek galiu pasiskolinti automobiliui? Skaičiuoklė | Autopaskolos.lt"
        description="Įveskite pajamas, įsipareigojimus ir automobilio kainą – iškart pamatysite maksimalią paskolos sumą, mėnesinę įmoką ir orientacinius bankų pasiūlymus su palūkanomis."
        canonical={url}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main id="main-content">
        <section className="container mx-auto px-4 pt-8 pb-4">
          <nav aria-label="Naršymo kelias" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Pradžia</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">Kiek galiu pasiskolinti</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Kiek galiu pasiskolinti automobiliui?
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Įveskite savo mėnesio pajamas į rankas, esamus įsipareigojimus ir automobilio kainą –
            iškart pamatysite maksimalią paskolos sumą, mėnesinę įmoką ir konkrečius orientacinius
            partnerių pasiūlymus su palūkanomis.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-10 md:pb-16">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-xl">Jūsų duomenys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="income">Mėnesio pajamos į rankas (€)</Label>
                  <Input
                    id="income"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="text-base"
                    value={income}
                    onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obligations">Esamos mėnesinės įmokos (€)</Label>
                  <Input
                    id="obligations"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="text-base"
                    value={obligations}
                    onChange={(e) => setObligations(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paskolos, lizingai, kredito kortelės, vartojimo kreditai.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carPrice">Automobilio kaina (€)</Label>
                  <Input
                    id="carPrice"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="text-base"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down">Pradinis įnašas (€)</Label>
                  <Input
                    id="down"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="text-base"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Terminas</Label>
                    <span className="text-sm font-semibold tabular-nums">{months} mėn.</span>
                  </div>
                  <Slider
                    value={[months]}
                    min={12}
                    max={84}
                    step={12}
                    onValueChange={(v) => setMonths(v[0])}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Laisvas mėnesinis pajėgumas</p>
                    <p className="text-2xl font-bold tabular-nums">{eur(capacity)}</p>
                    <p className="text-xs text-muted-foreground mt-1">40 % pajamų − įsipareigojimai</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Maksimali paskolos suma</p>
                    <p className="text-2xl font-bold tabular-nums text-primary">{eur(bestMax)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{months} mėn. terminui</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Reikia finansuoti</p>
                    <p className="text-2xl font-bold tabular-nums">{eur(needed)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {needed > bestMax ? "Reikia didesnio įnašo arba ilgesnio termino" : "Suma pasiekiama"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Orientaciniai partnerių pasiūlymai
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {capacity <= 0 ? (
                    <p className="text-muted-foreground">
                      Pagal įvestus duomenis laisvo mėnesinio pajėgumo nėra. Sumažinkite esamus
                      įsipareigojimus arba pasidomėkite{" "}
                      <Link to="/paskolu-refinansavimas" className="text-primary underline underline-offset-4">
                        paskolų refinansavimu
                      </Link>.
                    </p>
                  ) : (
                    offers.map((o) => (
                      <div
                        key={o.name}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3 sm:w-44">
                          <img
                            src={o.logo}
                            alt={`${o.name} paskolos pasiūlymas`}
                            loading="lazy"
                            className="h-8 w-auto object-contain"
                          />
                          <span className="font-semibold">{o.name}</span>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Palūkanos</p>
                            <p className="font-semibold tabular-nums">{o.rate.toFixed(1)} %</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Galima suma</p>
                            <p className="font-semibold tabular-nums">{eur(o.approved)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Mėn. įmoka</p>
                            <p className="font-semibold tabular-nums">{eur2(o.payment)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Grąžinsite iš viso</p>
                            <p className="font-semibold tabular-nums">{eur(o.total)}</p>
                          </div>
                        </div>
                        <div className="sm:w-32 sm:text-right">
                          {o.enough ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Pakanka
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Dalinė suma</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Skaičiai orientaciniai ir apskaičiuoti pagal tipines partnerių palūkanas bei
                      40 % pajamų ribą. Galutinę palūkanų normą, sutarties mokestį ir BVKKMN bankas
                      nustato individualiai, įvertinęs Jūsų pajamas, kredito istoriją ir automobilį.
                    </span>
                  </div>

                  <Button size="lg" className="w-full" onClick={() => setDialogOpen(true)}>
                    Gauti konkretų pasiūlymą per 30 min.
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12 grid gap-8 md:grid-cols-2">
          <article>
            <h2 className="text-2xl font-bold mb-3">Kaip apskaičiuojama maksimali suma?</h2>
            <p className="text-muted-foreground mb-3">
              Bankai laikosi atsakingojo skolinimosi nuostatų: visos kredito įmokos negali viršyti
              40 % mėnesio pajamų į rankas. Iš šios sumos atimame jau esamas įmokas – gaunamas
              laisvas mėnesinis pajėgumas, iš kurio pagal terminą ir palūkanas apskaičiuojama
              didžiausia galima paskolos suma.
            </p>
            <p className="text-muted-foreground">
              Ilgesnis terminas padidina galimą sumą, bet padidina ir bendrą palūkanų kainą.
            </p>
          </article>
          <article>
            <h2 className="text-2xl font-bold mb-3">Kaip padidinti galimą sumą?</h2>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Padidinkite pradinį įnašą – mažesnė paskola, mažesnė įmoka.</li>
              <li>
                Sumažinkite esamus įsipareigojimus –{" "}
                <Link to="/paskolu-refinansavimas" className="text-primary underline underline-offset-4">
                  refinansuokite paskolas
                </Link>{" "}
                į vieną mažesnę įmoką.
              </li>
              <li>Pasirinkite ilgesnį terminą (iki 84 mėn.).</li>
              <li>Pateikite visas oficialias pajamas, įskaitant priedus ir nuomos pajamas.</li>
              <li>
                Palyginkite ir{" "}
                <Link to="/paskola-automobiliui" className="text-primary underline underline-offset-4">
                  paskolą automobiliui
                </Link>{" "}
                bei{" "}
                <Link to="/vartojimo-paskola" className="text-primary underline underline-offset-4">
                  vartojimo paskolą
                </Link>.
              </li>
            </ul>
          </article>
        </section>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyMobileCTA />
      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        loanType="Autopaskola"
        loanAmount={String(best?.approved || needed)}
        loanPeriod={`${months} men.`}
      />
    </div>
  );
};

export default KiekGaliuPasiskolinti;
