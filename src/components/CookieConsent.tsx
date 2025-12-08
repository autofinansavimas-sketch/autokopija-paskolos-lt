import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Slapukų nustatymai</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Naudojame slapukus, kad pagerintume jūsų naršymo patirtį ir analizuotume svetainės 
                lankomumą. Pasirinkite, kuriuos slapukus norite priimti.{" "}
                <Link to="/privatumo-politika" className="text-primary hover:underline">
                  Sužinoti daugiau
                </Link>
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAll} size="sm">
                  Priimti visus
                </Button>
                <Button onClick={acceptNecessary} variant="outline" size="sm">
                  Tik būtinieji
                </Button>
              </div>
            </div>
            <button
              onClick={acceptNecessary}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Uždaryti"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
