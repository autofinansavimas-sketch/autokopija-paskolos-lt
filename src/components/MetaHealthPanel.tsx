import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ImportPage = {
  brand: string; pageId: string; total: number; newCount: number; duplicates: number;
  oldest: string | null; newest: string | null; imported: number; failed: number; error: string | null;
};

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleString("lt-LT", { dateStyle: "short", timeStyle: "short" }) : "nėra duomenų";

export function MetaHealthPanel({ onImportComplete }: { onImportComplete?: () => void | Promise<void> }) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPage[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runPreview = async () => {
    setImporting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("meta-import-leads", { body: { mode: "preview" } });
      if (error) throw error;
      setPreview((res as { pages: ImportPage[] }).pages);
      setConfirmOpen(true);
    } catch {
      toast.error("Nepavyko paruošti importo peržiūros");
    } finally {
      setImporting(false);
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("meta-import-leads", { body: { mode: "import" } });
      if (error) throw error;
      const pages = (res as { pages: ImportPage[] }).pages;
      const total = pages.reduce((s, p) => s + p.imported, 0);
      toast.success(`Importuota naujų lead'ų: ${total}`);
      setPreview(null);
      setConfirmOpen(false);
      await onImportComplete?.();
    } catch {
      toast.error("Importas nepavyko");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={runPreview} disabled={importing}>
        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span className="ml-1.5 text-xs">Importuoti senesnius</span>
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importuoti ankstesnius Facebook lead'us?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                {(preview ?? []).map((p) => (
                  <div key={p.brand} className="rounded-md border p-2">
                    <div className="font-medium">{p.brand === "autokopers" ? "Auto Kopers LT" : "Autopaskolos.lt"}</div>
                    {p.error ? (
                      <div className="text-destructive">{p.error}</div>
                    ) : (
                      <div className="text-muted-foreground">
                        Rasta: {p.total} · Nauji: {p.newCount} · Dublikatai (bus praleisti): {p.duplicates}
                        <br />
                        Periodas: {fmt(p.oldest)} – {fmt(p.newest)}
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-muted-foreground">
                  Esami įrašai, statusai ir komentarai nebus pakeisti — įrašomi tik nauji lead'ai.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); runImport(); }} disabled={importing}>
              {importing ? "Importuojama..." : "Patvirtinti importą"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
