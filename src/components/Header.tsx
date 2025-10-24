import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/autopaskolos-logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="/" className="flex items-center">
              <img 
                src={logo} 
                alt="AUTOPASKOLOS.LT" 
                className="h-24 md:h-28"
              />
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#kaip-veikia" className="text-sm font-medium hover:text-primary transition-colors">
                Kaip tai veikia
              </a>
              <a href="#skaiciuokle" className="text-sm font-medium hover:text-primary transition-colors">
                Skaičiuoklė
              </a>
              <a href="#atsiliepimai" className="text-sm font-medium hover:text-primary transition-colors">
                Atsiliepimai
              </a>
              <a href="#duk" className="text-sm font-medium hover:text-primary transition-colors">
                DUK
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button className="hidden md:inline-flex">
              Gauti paskolą
            </Button>
            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <a href="#kaip-veikia" className="text-sm font-medium hover:text-primary transition-colors">
                Kaip tai veikia
              </a>
              <a href="#skaiciuokle" className="text-sm font-medium hover:text-primary transition-colors">
                Skaičiuoklė
              </a>
              <a href="#atsiliepimai" className="text-sm font-medium hover:text-primary transition-colors">
                Atsiliepimai
              </a>
              <a href="#duk" className="text-sm font-medium hover:text-primary transition-colors">
                DUK
              </a>
              <Button className="w-full">
                Gauti paskolą
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
