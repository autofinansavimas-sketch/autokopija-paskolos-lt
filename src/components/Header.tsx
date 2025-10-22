import { Button } from "@/components/ui/button";
import { Menu, Phone } from "lucide-react";
import autopaskolosLogo from "@/assets/autokopers-logo.jpg";

export const Header = () => {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img src={autopaskolosLogo} alt="AUTOKOPERS" className="h-10" />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Skambinti</span>
          </Button>
          <Button size="sm">Prisijungti</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
