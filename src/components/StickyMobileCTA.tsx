import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { analytics } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

export const StickyMobileCTA = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;
    
    const handleScroll = () => {
      // Show after scrolling past the first screen
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/90 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_-4px_hsl(var(--primary)/0.15)] transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <Button
          className="w-full h-12 text-base font-bold gap-2 group shadow-lg"
          onClick={() => {
            analytics.ctaClicked("Sticky Mobile CTA");
            setDialogOpen(true);
          }}
        >
          Gauti pasiūlymą
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </>
  );
};
