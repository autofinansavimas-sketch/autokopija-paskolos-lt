export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">AUTOPASKOLOS.LT</h3>
            <p className="text-sm text-background/80">
              Powered by AUTOKOPERS
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Paskolos</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-background">Vartojimo paskola</a></li>
              <li><a href="#" className="hover:text-background">Paskola automobiliui</a></li>
              <li><a href="#" className="hover:text-background">Refinansavimas</a></li>
              <li><a href="#" className="hover:text-background">Paskola būsto remontui</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Informacija</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-background">Apie mus</a></li>
              <li><a href="#" className="hover:text-background">Kaip tai veikia</a></li>
              <li><a href="#" className="hover:text-background">DUK</a></li>
              <li><a href="#" className="hover:text-background">Kontaktai</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Teisinė informacija</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-background">Privatumo politika</a></li>
              <li><a href="#" className="hover:text-background">Naudojimosi taisyklės</a></li>
              <li><a href="#" className="hover:text-background">Slapukai</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/60">
          <p>© 2025 AUTOPASKOLOS.LT. Visos teisės saugomos. Powered by AUTOKOPERS.</p>
          <p className="mt-2">
            AUTOPASKOLOS.LT yra Lietuvos Banko prižiūrimas tarpininkas, veikiantis kaip priklausomas vartojimo kreditų tarpininkas bei kaip nepriklausomas kredito, susijusio su nekilnojamuoju turtu tarpininkas.
          </p>
        </div>
      </div>
    </footer>
  );
};
