import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Grįžti į pradžią
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Naudojimosi sąlygos</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground font-medium">
            Paskutinį kartą atnaujinta: 2025 m. sausio mėn.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Bendrosios nuostatos</h2>
            <p>
              Šios naudojimosi sąlygos (toliau – „Sąlygos") reglamentuoja AUTOPASKOLOS.LT 
              svetainės (toliau – „Svetainė") naudojimą. Naudodamiesi Svetaine, Jūs sutinkate 
              su šiomis Sąlygomis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Paslaugų aprašymas</h2>
            <p>
              AUTOPASKOLOS.LT teikia paskolų palyginimo ir konsultavimo paslaugas. Mes padedame 
              klientams rasti geriausias paskolų sąlygas, palygindami pasiūlymus iš skirtingų 
              bankų ir kredito įstaigų.
            </p>
            <p className="mt-4">
              <strong>Svarbu:</strong> AUTOPASKOLOS.LT nėra kredito įstaiga ir neteikia paskolų 
              tiesiogiai. Mes veikiame kaip tarpininkas, padedantis susisiekti su kreditoriais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Naudotojo įsipareigojimai</h2>
            <p>Naudodamiesi Svetaine, Jūs įsipareigojate:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pateikti teisingą ir tikslią informaciją</li>
              <li>Nenaudoti Svetainės neteisėtais tikslais</li>
              <li>Nesiimti veiksmų, galinčių pakenkti Svetainės veikimui</li>
              <li>Nepažeisti kitų asmenų teisių</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Paslaugų kaina</h2>
            <p>
              Paskolų palyginimo paslauga klientams yra <strong>NEMOKAMA</strong>. Neimame 
              jokių mokesčių už konsultacijas ar pasiūlymų pateikimą. Mūsų paslaugos 
              finansuojamos iš partnerių komisinių.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Atsakomybės ribojimas</h2>
            <p>
              AUTOPASKOLOS.LT stengiasi užtikrinti, kad Svetainėje pateikiama informacija būtų 
              tiksli ir aktuali, tačiau negarantuojame jos išsamumo ar tikslumo.
            </p>
            <p className="mt-4">
              Mes neprisiimame atsakomybės už:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kreditorių sprendimus dėl paskolų suteikimo</li>
              <li>Paskolų sąlygų pokyčius</li>
              <li>Trečiųjų šalių svetainių turinį</li>
              <li>Technines klaidas ar svetainės veikimo sutrikimus</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Intelektinė nuosavybė</h2>
            <p>
              Visas Svetainės turinys, įskaitant tekstus, grafiką, logotipus ir programinę 
              įrangą, yra AUTOPASKOLOS.LT nuosavybė ir saugomas autorių teisių.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Sąlygų keitimas</h2>
            <p>
              Pasiliekame teisę bet kuriuo metu keisti šias Sąlygas. Apie esminius pakeitimus 
              informuosime Svetainėje. Toliau naudodamiesi Svetaine po pakeitimų, sutinkate 
              su naujomis Sąlygomis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Taikoma teisė</h2>
            <p>
              Šioms Sąlygoms taikoma Lietuvos Respublikos teisė. Visi ginčai sprendžiami 
              Lietuvos Respublikos teismuose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Kontaktai</h2>
            <p>Jei turite klausimų dėl šių Sąlygų, susisiekite su mumis:</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>El. paštas:</strong> info@autopaskolos.lt</li>
              <li><strong>Telefonas:</strong> +37062851439</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
