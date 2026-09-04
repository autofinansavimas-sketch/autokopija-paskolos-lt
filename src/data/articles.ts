export interface ArticleSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string; // ISO
  category: string;
  readMinutes: number;
  intro: string;
  sections: ArticleSection[];
  faq?: { q: string; a: string }[];
}

export const articles: Article[] = [
  {
    slug: "kaip-gauti-paskola-automobiliui",
    title: "Kaip gauti paskolą automobiliui: žingsnis po žingsnio",
    metaTitle: "Kaip gauti paskolą automobiliui 2026 m. | Autopaskolos.lt",
    metaDescription:
      "Paaiškiname, kaip gauti paskolą automobiliui: kokių dokumentų reikia, kaip vertinamos pajamos ir kaip palyginti pasiūlymus, kad palūkanos būtų mažesnės.",
    excerpt:
      "Kokių dokumentų reikia, kaip kreditoriai vertina pajamas ir kodėl vieną paraišką verta lyginti su keliais pasiūlymais.",
    date: "2026-08-18",
    category: "Autopaskola",
    readMinutes: 5,
    intro:
      "Automobilio pirkimas dažniausiai vyksta greitai – radus tinkamą variantą finansavimą reikia gauti per kelias dienas. Kad nereikėtų priimti pirmo pasitaikiusio pasiūlymo, verta iš anksto žinoti, ko klausia kreditoriai ir kokie dokumentai bus reikalingi.",
    sections: [
      {
        heading: "1. Įvertinkite realią mėnesinę įmoką",
        paragraphs: [
          "Prieš paraišką nuspręskite, kokią įmoką galite mokėti kiekvieną mėnesį net ir tada, kai atsiranda nenumatytų išlaidų. Skaičiuoklėje pasirinkite sumą ir terminą – ilgesnis terminas mažina įmoką, bet padidina bendrą kredito kainą.",
        ],
        bullets: [
          "Suma – tik tiek, kiek realiai reikia automobiliui ir registracijos išlaidoms.",
          "Terminas – trumpesnis terminas reiškia mažesnes bendras palūkanas.",
          "Atsargos – palikite rezervą techninei apžiūrai, draudimui ir galimam remontui.",
        ],
      },
      {
        heading: "2. Pasiruoškite dokumentus",
        paragraphs: [
          "Dokumentų sąrašas skiriasi pagal kreditorių, bet dažniausiai užtenka standartinio paketo, kurį galima paruošti per vieną vakarą.",
        ],
        bullets: [
          "Asmens dokumentas (pasas arba asmens tapatybės kortelė).",
          "Pajamų įrodymas – „Sodros“ išrašas arba banko sąskaitos išrašas.",
          "Informacija apie esamus kredito įsipareigojimus.",
          "Duomenys apie automobilį, jei jis jau pasirinktas.",
        ],
      },
      {
        heading: "3. Palyginkite kelis pasiūlymus, o ne vieną",
        paragraphs: [
          "Skirtingi kreditoriai tą patį klientą vertina nevienodai: vieni daugiau žiūri į pajamų stabilumą, kiti – į kredito istoriją. Todėl to paties žmogaus palūkanos gali skirtis keliais procentiniais punktais.",
          "Užpildę vieną paraišką AUTOPASKOLOS.LT, atrenkame tinkamiausius pasiūlymus iš bankų ir kreditorių tinklo, o Jūs matote konkrečius skaičius prieš bet kokį įsipareigojimą.",
        ],
      },
      {
        heading: "4. Perskaitykite sutartį prieš pasirašymą",
        bullets: [
          "BVKKMN (bendra vartojimo kredito kainos metinė norma) – rodo tikrąją kredito kainą su visais mokesčiais.",
          "Sutarties administravimo ar sutarties sudarymo mokesčiai.",
          "Ankstyvo grąžinimo sąlygos – ar galima grąžinti anksčiau ir kokia kaina.",
          "Draudimo reikalavimai, jei automobilis lieka įkeistas.",
        ],
      },
    ],
    faq: [
      {
        q: "Ar galima gauti paskolą automobiliui be pradinio įnašo?",
        a: "Taip, vartojimo paskola automobiliui dažniausiai suteikiama be pradinio įnašo ir be užstato – automobilis lieka Jūsų nuosavybe. Lizingo atveju pradinis įnašas gali būti reikalingas.",
      },
      {
        q: "Per kiek laiko gaunamas atsakymas?",
        a: "Pateikus paraišką darbo dienomis pirminius pasiūlymus paprastai pateikiame per 30 minučių, o galutinį sprendimą priima kreditorius.",
      },
    ],
  },
  {
    slug: "paskolu-refinansavimas-kada-verta",
    title: "Paskolų refinansavimas: kada jis tikrai apsimoka?",
    metaTitle: "Paskolų refinansavimas – kada apsimoka? | Autopaskolos.lt",
    metaDescription:
      "Kada verta refinansuoti paskolas: kaip sujungti kelis kreditus į vieną, ką patikrinti prieš sprendimą ir kokios klaidos padidina bendrą kainą.",
    excerpt:
      "Kelių kreditų sujungimas į vieną gali sumažinti mėnesio įmoką, bet ne visada – parodome, ką suskaičiuoti prieš sprendimą.",
    date: "2026-08-12",
    category: "Refinansavimas",
    readMinutes: 4,
    intro:
      "Refinansavimas – tai esamų kreditų grąžinimas nauja paskola, dažniausiai geresnėmis sąlygomis arba ilgesniam terminui. Didžiausia nauda atsiranda tada, kai turite kelis skirtingus įsipareigojimus su nevienodomis palūkanomis.",
    sections: [
      {
        heading: "Kada refinansavimas duoda naudos",
        bullets: [
          "Turite 2 ar daugiau kreditų su skirtingomis palūkanomis ir mokėjimo datomis.",
          "Dabartinės palūkanos yra didesnės nei tos, kurias galėtumėte gauti šiandien.",
          "Mėnesio įmokos suma tapo per didelė ir norite ją paskirstyti ilgesniam terminui.",
          "Norite vienos aiškios įmokos vietoj kelių atskirų mokėjimų.",
        ],
      },
      {
        heading: "Kada geriau nerefinansuoti",
        paragraphs: [
          "Jei iki esamos paskolos pabaigos liko nedaug ir didžiąją dalį palūkanų jau sumokėjote, naujas ilgesnis terminas gali padidinti bendrą sumokamą sumą. Taip pat įvertinkite sutarties sudarymo ar ankstyvo grąžinimo mokesčius.",
        ],
      },
      {
        heading: "Kaip suskaičiuoti naudą",
        bullets: [
          "Susumuokite visų esamų kreditų likučius ir mėnesines įmokas.",
          "Palyginkite bendrą sumokamą sumą dabar ir po refinansavimo, ne tik įmoką.",
          "Įtraukite visus vienkartinius mokesčius.",
          "Patikrinkite, ar naujoje sutartyje leidžiama grąžinti anksčiau be papildomos kainos.",
        ],
      },
    ],
    faq: [
      {
        q: "Ar galima refinansuoti kelias skirtingų kreditorių paskolas?",
        a: "Taip. Refinansavimo tikslas dažnai ir yra kelių skirtingų kreditorių įsipareigojimus sujungti į vieną paskolą su viena mėnesio įmoka.",
      },
      {
        q: "Ar refinansavimas kenkia kredito istorijai?",
        a: "Pati refinansavimo operacija nėra vėlavimas ir istorijos nepablogina. Svarbiausia – naują įmoką mokėti laiku.",
      },
    ],
  },
  {
    slug: "kaip-formuojamos-paskolos-palukanos",
    title: "Kas nustato Jūsų palūkanas: 6 pagrindiniai veiksniai",
    metaTitle: "Kaip nustatomos paskolos palūkanos? 6 veiksniai | Autopaskolos.lt",
    metaDescription:
      "Kodėl dviem žmonėms pasiūlomos skirtingos paskolos palūkanos? Aptariame pajamas, kredito istoriją, terminą, sumą ir kitus vertinimo veiksnius.",
    excerpt:
      "Kodėl du panašūs klientai gauna skirtingus pasiūlymus – ir ką galite pakeisti savo naudai dar prieš paraišką.",
    date: "2026-08-05",
    category: "Naudinga žinoti",
    readMinutes: 4,
    intro:
      "Palūkanos nėra atsitiktinis skaičius. Kreditorius vertina, kokia tikimybė, kad paskola bus grąžinta laiku, ir pagal tai formuoja kainą. Dalį veiksnių galite pagerinti pats.",
    sections: [
      {
        heading: "Veiksniai, kuriuos vertina kreditorius",
        bullets: [
          "Pajamų dydis ir jų stabilumas – kiek laiko dirbate ir ar pajamos reguliarios.",
          "Esami įsipareigojimai – kokią dalį pajamų jau sudaro kitos įmokos.",
          "Kredito istorija – ar būta vėlavimų per pastaruosius metus.",
          "Paskolos suma ir terminas – didesnė suma ilgesniam laikui yra didesnė rizika.",
          "Užstatas ar jo nebuvimas – paskolos be užstato paprastai kainuoja daugiau.",
          "Bendra finansinė elgsena – ar sąskaitos likutis nuolat nulinis prieš atlyginimą.",
        ],
      },
      {
        heading: "Ką galite padaryti prieš paraišką",
        bullets: [
          "Uždarykite nedidelius kreditus ar kredito limitus, kurių nenaudojate.",
          "Sutvarkykite vėlavimus ir įsiskolinimus.",
          "Neteikite daug paraiškų padrikai – geriau viena paraiška, kuri lyginama tarp kreditorių.",
          "Paprašykite realios sumos, o ne maksimalios galimos.",
        ],
      },
    ],
  },
  {
    slug: "lizingas-ar-vartojimo-paskola-automobiliui",
    title: "Lizingas ar vartojimo paskola automobiliui: ką rinktis?",
    metaTitle: "Lizingas ar vartojimo paskola automobiliui? | Autopaskolos.lt",
    metaDescription:
      "Lizingo ir vartojimo paskolos automobiliui palyginimas: nuosavybė, pradinis įnašas, draudimo reikalavimai ir kada kuris variantas patogesnis.",
    excerpt:
      "Pagrindiniai skirtumai tarp lizingo ir vartojimo paskolos – nuosavybė, pradinis įnašas ir laisvė disponuoti automobiliu.",
    date: "2026-07-29",
    category: "Autopaskola",
    readMinutes: 3,
    intro:
      "Automobilį galima finansuoti dviem populiariais būdais: lizingu arba vartojimo paskola. Skiriasi ne tik kaina, bet ir tai, kam automobilis priklauso sutarties metu.",
    sections: [
      {
        heading: "Vartojimo paskola",
        bullets: [
          "Automobilis iš karto registruojamas Jūsų vardu ir yra Jūsų nuosavybė.",
          "Dažniausiai nereikia pradinio įnašo ir užstato.",
          "Galite laisvai parduoti automobilį, kai norite.",
          "Kasko draudimas paprastai nėra privalomas.",
        ],
      },
      {
        heading: "Lizingas",
        bullets: [
          "Automobilis sutarties metu priklauso lizingo bendrovei.",
          "Gali būti reikalingas pradinis įnašas.",
          "Dažnai taikomas privalomas kasko draudimas.",
          "Automobilio pardavimas galimas tik su lizingo bendrovės sutikimu.",
        ],
      },
      {
        heading: "Kaip pasirinkti",
        paragraphs: [
          "Jei norite pilnos laisvės ir paprastesnių sąlygų – dažniau tinka vartojimo paskola. Jei planuojate keisti automobilį po kelerių metų arba pirkti naują iš atstovybės, verta įvertinti ir lizingą. Geriausia palyginti abu variantus su realiais skaičiais.",
        ],
      },
    ],
  },
  {
    slug: "5-klaidos-imant-paskola",
    title: "5 dažniausios klaidos imant paskolą",
    metaTitle: "5 klaidos imant paskolą – ko išvengti | Autopaskolos.lt",
    metaDescription:
      "Dažniausios klaidos imant vartojimo paskolą ar kreditą: per didelė suma, tik įmokos vertinimas, daug paraiškų iš karto ir neperskaityta sutartis.",
    excerpt:
      "Klaidos, kurios kainuoja daugiausiai – ir kaip jų išvengti dar prieš pasirašant sutartį.",
    date: "2026-07-22",
    category: "Naudinga žinoti",
    readMinutes: 3,
    intro:
      "Dauguma nesusipratimų su kreditais atsiranda ne dėl palūkanų, o dėl skubaus sprendimo. Šios penkios klaidos pasitaiko dažniausiai.",
    sections: [
      {
        heading: "1. Skolinamasi daugiau, nei reikia",
        paragraphs: [
          "Patvirtinta suma nėra rekomendacija. Kiekvienas papildomas tūkstantis didina įmoką ir bendrą palūkanų sumą.",
        ],
      },
      {
        heading: "2. Vertinama tik mėnesio įmoka",
        paragraphs: [
          "Maža įmoka dažnai reiškia ilgą terminą ir didesnę bendrą kredito kainą. Visada palyginkite bendrą sumokamą sumą ir BVKKMN.",
        ],
      },
      {
        heading: "3. Teikiama daug paraiškų vienu metu",
        paragraphs: [
          "Padrikos paraiškos keliose vietose nepadeda gauti geresnių sąlygų. Efektyviau vieną paraišką palyginti tarp kelių kreditorių.",
        ],
      },
      {
        heading: "4. Neperskaitoma sutartis",
        paragraphs: [
          "Sutarties mokesčiai, ankstyvo grąžinimo ir draudimo sąlygos dažnai turi didesnę įtaką galutinei kainai nei pačios palūkanos.",
        ],
      },
      {
        heading: "5. Nepasiliekama finansinės atsargos",
        paragraphs: [
          "Jei įmoka suplanuota „ties riba“, bet kokia netikėta išlaida sukelia vėlavimą. Palikite bent vienos įmokos rezervą.",
        ],
      },
    ],
  },
  {
    slug: "kaip-pagerinti-kredito-istorija",
    title: "Kaip pagerinti kredito istoriją prieš paskolą",
    metaTitle: "Kaip pagerinti kredito istoriją prieš paskolą | Autopaskolos.lt",
    metaDescription:
      "Praktiniai žingsniai, kaip pagerinti kredito istoriją prieš paraišką: įsiskolinimai, kredito limitai, pajamų įrodymas ir realus paskolos sumos pasirinkimas.",
    excerpt:
      "Ką galima pataisyti per 1–3 mėnesius, kad kreditorius pasiūlytų mažesnes palūkanas ir didesnę sumą.",
    date: "2026-09-02",
    category: "Naudinga žinoti",
    readMinutes: 4,
    intro:
      "Kredito istorija – tai Jūsų mokėjimų disciplinos įrašas. Ji nėra amžina: dalį rodiklių galima pagerinti per kelis mėnesius, o tai tiesiogiai atsispindi pasiūlytose palūkanose ir patvirtintoje sumoje.",
    sections: [
      {
        heading: "1. Uždarykite vėlavimus ir įsiskolinimus",
        paragraphs: [
          "Pirmiausia sutvarkykite tai, kas rodoma kaip aktyvus įsiskolinimas – net nedidelė nesumokėta suma gali blokuoti sprendimą. Sumokėję paprašykite kreditoriaus patvirtinimo, kad įrašas uždarytas.",
        ],
        bullets: [
          "Patikrinkite visus aktyvius įsiskolinimus ir jų likučius.",
          "Sumokėkite smulkius įsiskolinimus pirmiausia.",
          "Išsaugokite mokėjimo patvirtinimus – jų gali paprašyti kreditorius.",
        ],
      },
      {
        heading: "2. Sumažinkite nenaudojamus limitus",
        paragraphs: [
          "Kredito kortelės limitas ir sąskaitos kreditas vertinami kaip potenciali skola, net jei jų nenaudojate. Nenaudojamų limitų uždarymas dažnai padidina galimą paskolos sumą.",
        ],
      },
      {
        heading: "3. Rodykite stabilias pajamas",
        bullets: [
          "3–6 mėnesiai reguliarių pajamų į tą pačią sąskaitą atrodo geriausiai.",
          "Venkite, kad sąskaitos likutis prieš atlyginimą būtų nulinis.",
          "Papildomas pajamas (nuoma, individuali veikla) pasiruoškite pagrįsti dokumentais.",
        ],
      },
      {
        heading: "4. Neteikite daug paraiškų iš karto",
        paragraphs: [
          "Daug atskirų paraiškų per kelias dienas atrodo kaip skubus pinigų trūkumas. Efektyviau užpildyti vieną paraišką ir leisti ją palyginti tarp kelių kreditorių.",
        ],
      },
      {
        heading: "5. Prašykite realios sumos",
        paragraphs: [
          "Maksimali galima suma padidina riziką kreditoriaus akyse ir kainuoja daugiau. Suma, kuri realiai atitinka Jūsų tikslą ir pajamas, patvirtinama greičiau ir geresnėmis palūkanomis.",
        ],
      },
    ],
    faq: [
      {
        q: "Per kiek laiko pagerėja kredito istorija?",
        a: "Uždarius įsiskolinimus įrašai atnaujinami per kelias savaites, o stabilios mokėjimų disciplinos poveikis geriausiai matomas po 3–6 mėnesių.",
      },
      {
        q: "Ar galima gauti paskolą su bloga kredito istorija?",
        a: "Kai kuriais atvejais taip – sąlygos būna prastesnės. Užpildę vieną paraišką pamatysite, kurie kreditoriai realiai gali pasiūlyti finansavimą Jūsų situacijoje.",
      },
    ],
  },
];

export const getArticle = (slug?: string) => articles.find((a) => a.slug === slug);

export const formatArticleDate = (iso: string) =>
  new Date(iso).toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });
