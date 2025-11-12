import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/autopaskolos-logo.png";
import { ContactFormDialog } from "@/components/ContactFormDialog";

export const Header = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
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
            <Button 
              className="text-sm md:text-base"
              onClick={() => setDialogOpen(true)}
            >
              Gauti pasiūlymą
            </Button>
          </div>
        </div>

      </div>
    </header>
    <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
