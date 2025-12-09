import { Facebook, Instagram, Mail, Phone, Shield, Lock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import autokopersLogo from "@/assets/autokopers-logo.png";
import { analytics } from "@/lib/analytics";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Apie mus</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AUTOPASKOLOS.LT padeda klientams rasti geriausias paskolų sąlygas Lietuvoje.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mb-4">
              <p className="font-medium text-foreground">Autodealeriai, MB</p>
              <p>Įmonės kodas: 305825810</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>SSL saugumas</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span>BDAR</span>
              </div>
            </div>
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
              <li><a href="#loan-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Paskolų refinansavimas</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontaktai</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="tel:+37062851439" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => analytics.phoneClicked()}
                >
                  <Phone className="h-4 w-4" />
                  <span>+370 628 51439</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@autopaskolos.lt" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => analytics.emailClicked()}
                >
                  <Mail className="h-4 w-4" />
                  <span>info@autopaskolos.lt</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Varduvos g. 2, Kaunas</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://www.facebook.com/Autopaskolos" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => analytics.socialClicked('Facebook')}
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/autopaskolos.lt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => analytics.socialClicked('Instagram')}
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 AUTOPASKOLOS.LT. Visos teisės saugomos.
              </p>
              <div className="flex gap-4">
                <Link to="/privatumo-politika" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privatumo politika
                </Link>
                <Link to="/salygos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sąlygos
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <a href="https://www.autokopers.lt" target="_blank" rel="noopener noreferrer">
                <img 
                  src={autokopersLogo} 
                  alt="Autokopers" 
                  className="h-8 hover:opacity-80 transition-opacity"
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
