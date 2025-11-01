import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import autokopersLogo from "@/assets/autokopers-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Apie mus</h3>
            <p className="text-sm text-muted-foreground">
              AUTOPASKOLOS.LT padeda klientams rasti geriausias paskolų sąlygas Lietuvoje.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Nuorodos</h3>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kaip tai veikia</a></li>
              <li><a href="#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">DUK</a></li>
              <li><a href="#loan-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Skaičiuoklė</a></li>
              <li><a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kontaktai</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Paskolos</h3>
            <ul className="space-y-2">
              <li><a href="#loan-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vartojimo paskola</a></li>
              <li><a href="#loan-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Automobilio lizingas</a></li>
              <li><a href="#loan-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Būsto remontas</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontaktai</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+370 600 00000</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@autopaskolos.lt</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 AUTOPASKOLOS.LT. Visos teisės saugomos.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <a href="https://www.autokopers.lt" target="_blank" rel="noopener noreferrer">
                <img 
                  src={autokopersLogo} 
                  alt="Autokopers" 
                  className="h-8 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
