import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Grįžti į pradžią
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privatumo politika</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground font-medium">
            Paskutinį kartą atnaujinta: 2025 m. sausio mėn.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Bendrosios nuostatos</h2>
            <p>
              AUTOPASKOLOS.LT (toliau – „mes", „mūsų" arba „Svetainė") gerbia Jūsų privatumą ir 
              įsipareigoja saugoti Jūsų asmens duomenis. Ši privatumo politika paaiškina, kaip 
              renkame, naudojame ir saugome Jūsų informaciją.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Kokie duomenys renkami</h2>
            <p>Mes galime rinkti šiuos asmens duomenis:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vardas ir pavardė</li>
              <li>Telefono numeris</li>
              <li>El. pašto adresas</li>
              <li>Pageidaujama paskolos suma</li>
              <li>IP adresas ir naršymo duomenys (per slapukus)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Duomenų naudojimo tikslai</h2>
            <p>Jūsų duomenis naudojame šiais tikslais:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Paskolų pasiūlymų paruošimui ir pateikimui</li>
              <li>Susisiekimui su Jumis dėl užklausų</li>
              <li>Svetainės tobulinimui ir analitikai</li>
              <li>Teisinių įsipareigojimų vykdymui</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Duomenų saugojimas</h2>
            <p>
              Jūsų asmens duomenys saugomi saugiuose serveriuose ir yra apsaugoti nuo 
              neteisėtos prieigos. Duomenis saugome tik tiek, kiek būtina nurodytiems tikslams pasiekti, 
              bet ne ilgiau kaip 2 metus nuo paskutinio kontakto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Slapukai</h2>
            <p>
              Svetainėje naudojami slapukai, kurie padeda užtikrinti tinkamą svetainės veikimą 
              ir analizuoti lankomumą. Naudojame šiuos slapukų tipus:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Būtinieji slapukai:</strong> reikalingi svetainės funkcionalumui</li>
              <li><strong>Analitiniai slapukai:</strong> padeda suprasti, kaip lankytojai naudojasi svetaine</li>
              <li><strong>Rinkodaros slapukai:</strong> naudojami reklamai pritaikyti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Jūsų teisės</h2>
            <p>Pagal BDAR (GDPR), Jūs turite teisę:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gauti informaciją apie savo duomenis</li>
              <li>Prašyti ištaisyti netikslius duomenis</li>
              <li>Prašyti ištrinti savo duomenis</li>
              <li>Apriboti duomenų tvarkymą</li>
              <li>Perkelti duomenis</li>
              <li>Nesutikti su duomenų tvarkymu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Kontaktai</h2>
            <p>
              Jei turite klausimų dėl privatumo politikos arba norite pasinaudoti savo teisėmis, 
              susisiekite su mumis:
            </p>
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

export default PrivacyPolicy;
