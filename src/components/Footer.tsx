import { Facebook, Instagram, Mail, Phone, Shield, Lock, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import autokopersLogo from "@/assets/autokopers-logo.png";
import { analytics } from "@/lib/analytics";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50 overflow-hidden" role="contentinfo">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
      
      <div className="container mx-auto px-3 md:px-4 py-8 md:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Apie mus
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
              AUTOPASKOLOS.LT padeda klientams rasti geriausias paskolų sąlygas Lietuvoje.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>SSL</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>BDAR</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Nuorodos</h3>
            <nav aria-label="Footer nuorodos">
              <ul className="space-y-2">
                <li><a href="#kaip-veikia" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kaip tai veikia</a></li>
                <li><a href="#duk" className="text-sm text-muted-foreground hover:text-primary transition-colors">DUK</a></li>
                <li><a href="#skaiciuokle" className="text-sm text-muted-foreground hover:text-primary transition-colors">Skaičiuoklė</a></li>
                <li><a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kontaktai</a></li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Paskolos</h3>
            <nav aria-label="Paskolų tipai">
              <ul className="space-y-2">
                <li><a href="#skaiciuokle" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vartojimo paskola</a></li>
                <li><a href="#skaiciuokle" className="text-sm text-muted-foreground hover:text-primary transition-colors">Automobilio lizingas</a></li>
                <li><a href="#skaiciuokle" className="text-sm text-muted-foreground hover:text-primary transition-colors">Būsto remontas</a></li>
                <li><a href="#skaiciuokle" className="text-sm text-muted-foreground hover:text-primary transition-colors">Paskolų refinansavimas</a></li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontaktai</h3>
            <address className="not-italic">
              <ul className="space-y-2">
                <li>
                  <a 
                    href="tel:+37062851439" 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => analytics.phoneClicked()}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>+370 628 51439</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:info@autopaskolos.lt" 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => analytics.emailClicked()}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>info@autopaskolos.lt</span>
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Varduvos g. 2, Kaunas</span>
                </li>
              </ul>
            </address>
            <div className="flex gap-3 mt-4">
              <a 
                href="https://www.facebook.com/Autopaskolos" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110"
                onClick={() => analytics.socialClicked('Facebook')}
                aria-label="Sekite mus Facebook"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://www.instagram.com/autopaskolos.lt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110"
                onClick={() => analytics.socialClicked('Instagram')}
                aria-label="Sekite mus Instagram"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                © 2026 AUTOPASKOLOS.LT. Visos teisės saugomos.
              </p>
              <Link to="/privatumo-politika" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:underline underline-offset-4">
                Privatumo politika
              </Link>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 border border-border/50">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <a 
                href="https://www.autokopers.lt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-300 hover:scale-105"
              >
                <img 
                  src={autokopersLogo} 
                  alt="Autokopers" 
                  className="h-8 w-auto"
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

