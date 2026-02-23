import { useState } from "react";
import { Facebook, Instagram, Mail, Phone, Shield, Lock, MapPin, Heart, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import autokopersLogo from "@/assets/autokopers-logo.png";
import { analytics } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

const FooterAccordion = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </h3>
        {children}
      </div>
    );
  }

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-3' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  
  return (
    <footer className="relative bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50 overflow-hidden pb-16 md:pb-0" role="contentinfo">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
      
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-16 relative">
        <div className={isMobile ? "space-y-0" : "grid grid-cols-4 gap-8 mb-12"}>
          {/* Apie mus - always visible on mobile */}
          {isMobile ? (
            <div className="pb-4 mb-2 border-b border-border/30">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Apie mus
              </h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                AUTOPASKOLOS.LT padeda klientams rasti geriausias paskolų sąlygas Lietuvoje.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Shield className="h-3 w-3 text-primary" />
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Lock className="h-3 w-3 text-primary" />
                  <span>BDAR</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Apie mus
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                AUTOPASKOLOS.LT padeda klientams rasti geriausias paskolų sąlygas Lietuvoje.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span>BDAR</span>
                </div>
              </div>
            </div>
          )}
          
          <FooterAccordion title="Nuorodos" icon={null as any}>
            <nav aria-label="Footer nuorodos">
              <ul className="space-y-2">
                <li><a href="#kaip-veikia" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Kaip tai veikia</a></li>
                <li><a href="#duk" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">DUK</a></li>
                <li><a href="#skaiciuokle" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Skaičiuoklė</a></li>
                <li><a href="#contact" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Kontaktai</a></li>
              </ul>
            </nav>
          </FooterAccordion>
          
          <FooterAccordion title="Paskolos" icon={null as any}>
            <nav aria-label="Paskolų tipai">
              <ul className="space-y-2">
                <li><a href="#skaiciuokle" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Vartojimo paskola</a></li>
                <li><a href="#skaiciuokle" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Automobilio lizingas</a></li>
                <li><a href="#skaiciuokle" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Būsto remontas</a></li>
                <li><a href="#skaiciuokle" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Paskolų refinansavimas</a></li>
              </ul>
            </nav>
          </FooterAccordion>
          
          <FooterAccordion title="Kontaktai" icon={null as any}>
            <address className="not-italic">
              <ul className="space-y-2">
                <li>
                  <a 
                    href="tel:+37062851439" 
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => analytics.phoneClicked()}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>+370 628 51439</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:info@autopaskolos.lt" 
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => analytics.emailClicked()}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>info@autopaskolos.lt</span>
                  </a>
                </li>
                <li className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Varduvos g. 2, Kaunas</span>
                </li>
              </ul>
            </address>
            <div className="flex gap-3 mt-3">
              <a 
                href="https://www.facebook.com/Autopaskolos" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
                onClick={() => analytics.socialClicked('Facebook')}
                aria-label="Sekite mus Facebook"
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://www.instagram.com/autopaskolos.lt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
                onClick={() => analytics.socialClicked('Instagram')}
                aria-label="Sekite mus Instagram"
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              </a>
            </div>
          </FooterAccordion>
        </div>
        
        <div className="border-t border-border/50 pt-4 md:pt-8 mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-xs md:text-sm text-muted-foreground">
                © {currentYear} AUTOPASKOLOS.LT
              </p>
              <Link to="/privatumo-politika" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:underline underline-offset-4">
                Privatumo politika
              </Link>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-background/50 border border-border/50">
              <span className="text-xs md:text-sm text-muted-foreground">Powered by</span>
              <a 
                href="https://www.autokopers.lt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-300"
              >
                <img 
                  src={autokopersLogo} 
                  alt="Autokopers" 
                  className="h-6 md:h-8 w-auto"
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
