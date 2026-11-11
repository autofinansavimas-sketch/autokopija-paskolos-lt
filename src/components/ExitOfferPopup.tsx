import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { canShowExitOffer, EXIT_OFFER_KEY } from "@/lib/exitOffer";
import offerImage from "@/assets/exit-offer-loans.jpg";

export function ExitOfferPopup() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    let shown = false;
    try { shown = sessionStorage.getItem(EXIT_OFFER_KEY) === "1"; } catch { /* use in-memory fallback */ }
    const onLeave = (event: MouseEvent) => {
      let consent = false;
      try { consent = !!localStorage.getItem("cookie-consent"); } catch { return; }
      if (!canShowExitOffer({
        top: event.clientY, consent, shown,
        dialogOpen: !!document.querySelector('[role="dialog"], [role="alertdialog"]'),
        finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      })) return;
      shown = true;
      try { sessionStorage.setItem(EXIT_OFFER_KEY, "1"); } catch { /* still shown only once while mounted */ }
      setOpen(true);
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => document.documentElement.removeEventListener("mouseleave", onLeave);
  }, []);

  return <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-xl gap-0 overflow-hidden rounded-lg p-0 motion-reduce:animate-none">
        <img src={offerImage} alt="Monetos, dokumentai ir rašiklis ant šviesaus stalo" loading="lazy" width={1280} height={768} className="aspect-[5/2] w-full object-cover" />
        <div className="space-y-5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase text-primary">AUTOPASKOLOS.LT</p>
          <DialogTitle className="text-3xl font-bold leading-tight tracking-normal sm:text-4xl">Itin patrauklios<br />paskolų sąlygos</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">Prieš išeidami, gaukite jūsų poreikiams pritaikytą automobilio finansavimo pasiūlymą.</DialogDescription>
          <div className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 shrink-0 text-primary" />Palyginkite pasiūlymus ir pasirinkite sau tinkamą.</div>
          <Button size="lg" className="w-full" onClick={() => { setOpen(false); setContactOpen(true); }}>Gauti pasiūlymą<ArrowRight className="ml-2 h-4 w-4" /></Button>
          <p className="text-xs leading-relaxed text-muted-foreground">Finansavimo sąlygos priklauso nuo individualaus kreditingumo vertinimo.</p>
        </div>
      </DialogContent>
    </Dialog>
    <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
  </>;
}