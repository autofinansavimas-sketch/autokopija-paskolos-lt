import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/autopaskolos-logo.png";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { analytics } from "@/lib/analytics";

export const Header = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: "#kaip-veikia", label: "Kaip tai veikia" },
    { href: "#skaiciuokle", label: "Skaičiuoklė" },
    { href: "#atsiliepimai", label: "Atsiliepimai" },
    { href: "#duk", label: "DUK" },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl bg-background/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-14 md:h-20 items-center justify-between">
            <div className="flex items-center gap-12">
              <a href="/" className="flex items-center group" aria-label="Grįžti į pagrindinį puslapį">
                <img 
                  src={logo} 
                  alt="AUTOPASKOLOS.LT" 
                  className="h-16 md:h-28 transition-transform duration-300 group-hover:scale-105"
                  width="112"
                  height="112"
                />
              </a>
              
              <nav className="hidden lg:flex items-center gap-8" aria-label="Pagrindinė navigacija">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-primary/50 after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                className="hidden sm:flex text-sm md:text-base hover-lift"
                onClick={() => {
                  analytics.ctaClicked('Header CTA');
                  setDialogOpen(true);
                }}
              >
                Gauti pasiūlymą
              </Button>
              
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-smooth ${
            mobileMenuOpen ? 'max-h-80 border-t' : 'max-h-0'
          }`}
        >
          <nav className="container mx-auto px-4 py-4 space-y-2" aria-label="Mobilusis meniu">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="block py-3 px-4 text-base font-medium rounded-lg hover:bg-muted transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Button 
                className="w-full text-base h-12"
                onClick={() => {
                  analytics.ctaClicked('Mobile Header CTA');
                  setDialogOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                Gauti pasiūlymą
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
