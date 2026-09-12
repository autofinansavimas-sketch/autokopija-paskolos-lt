import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Loader2, Activity, ChevronDown, RefreshCw, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

type ImportPage = {
  brand: string; pageId: string; total: number; newCount: number; duplicates: number;
  oldest: string | null; newest: string | null; imported: number; failed: number; error: string | null;
};

type HealthPage = {
  brand: string; label: string; pageId: string | null; configured: boolean;
  hasToken: boolean; hasPageId: boolean; state: string; pageName: string | null;
  tokenUsable: boolean | null; subscribedFields: string[] | null; subscriptionActive: boolean | null;
  error: string | null; leadCount: number; commentCount: number;
  lastStoredLeadAt: string | null; lastWebhookAt: string | null;
  lastErrorAt: string | null; lastErrorMessage: string | null;
  pendingEvents: number; failedEvents: number; lastSuccessfulImportAt: string | null;
};

type Health = {
  checkedAt: string; verifyTokenConfigured: boolean; appSecretConfigured: boolean;
  pages: HealthPage[]; pendingTotal: number;
};

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleString("lt-LT", { dateStyle: "short", timeStyle: "short" }) : "nėra duomenų";

const stateLabel: Record<string, string> = {
  healthy: "Veikia",
  warning: "Įspėjimas",
  error: "Klaida",
  unknown: "Nežinoma",
};

export function MetaHealthPanel({ onImportComplete }: { onImportComplete?: () => void | Promise<void> }) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPage[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [checking, setChecking] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const loadHealth = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-health");
      if (error) throw error;
      setHealth(data as Health);
    } catch {
      toast.error("Nepavyko nuskaityti Facebook integracijos būsenos");
    } finally {
      setChecking(false);
    }
  };

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !health) await loadHealth();
  };

  const recoverMissed = async () => {
    setRecovering(true);
    try {
      const { data: prev, error: pErr } = await supabase.functions.invoke("meta-recover-leads", {
        body: { mode: "preview" },
      });
      if (pErr) throw pErr;
      const pending = (prev as { pending: number }).pending;
      if (!pending) {
        toast.info("Praleistų Facebook įvykių eilėje nėra");
        return;
      }
      const { data, error } = await supabase.functions.invoke("meta-recover-leads", { body: { mode: "run" } });
      if (error) throw error;
      const r = data as { recovered: number; duplicates: number; failed: number; lastError: string | null };
      if (r.recovered) toast.success(`Perimta praleistų lead'ų: ${r.recovered}`);
      else if (r.failed) toast.error(r.lastError || "Nepavyko perimti – patikrinkite prieigos raktus");
      else toast.info("Naujų lead'ų nerasta (visi jau sistemoje)");
      await loadHealth();
      await onImportComplete?.();
    } catch {
      toast.error("Praleistų lead'ų perėmimas nepavyko");
    } finally {
      setRecovering(false);
    }
  };

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
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" onClick={toggle} className="text-xs">
        <Activity className="h-4 w-4 mr-1.5" />
        Integracijos būsena
        <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <Button size="sm" variant="outline" onClick={runPreview} disabled={importing}>
        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span className="ml-1.5 text-xs">Importuoti senesnius</span>
      </Button>

      {open && (
        <div className="w-full mt-2 rounded-lg border bg-card p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Patikrinta: {health ? fmt(health.checkedAt) : "—"}
              {health && <> · Eilėje neapdorotų įvykių: {health.pendingTotal}</>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={loadHealth} disabled={checking}>
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1.5 text-xs">Atnaujinti</span>
              </Button>
              <Button size="sm" variant="outline" onClick={recoverMissed} disabled={recovering}>
                {recovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}
                <span className="ml-1.5 text-xs">Perimti praleistus lead'us</span>
              </Button>
            </div>
          </div>

          {health && (
            <div className="text-xs text-muted-foreground">
              Webhook patvirtinimo reikšmė: {health.verifyTokenConfigured ? "nustatyta" : "nenustatyta"} ·
              {" "}Programėlės parašo paslaptis: {health.appSecretConfigured ? "nustatyta" : "nenustatyta"}
            </div>
          )}

          <div className="grid gap-2 md:grid-cols-2">
            {(health?.pages ?? []).map((p) => (
              <div key={p.brand} className="rounded-md border p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{p.label}</span>
                  <Badge
                    variant={p.state === "healthy" ? "default" : p.state === "warning" ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {stateLabel[p.state] ?? p.state}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Puslapis: {p.pageName || p.pageId || "nesukonfigūruota"}</div>
                  <div>Prieigos raktas: {p.hasToken ? (p.tokenUsable ? "galioja" : "negalioja") : "nenustatytas"}</div>
                  <div>Leadgen prenumerata: {p.subscriptionActive == null ? "nežinoma" : p.subscribedFields?.includes("leadgen") ? "aktyvi" : "neaktyvi"}</div>
                  <div>Paskutinis webhookas: {fmt(p.lastWebhookAt)}</div>
                  <div>Paskutinis sėkmingas importas: {fmt(p.lastSuccessfulImportAt)}</div>
                  <div>Lead'ai sistemoje: {p.leadCount} · komentarai: {p.commentCount}</div>
                  <div>Eilėje: {p.pendingEvents} neapdoroti · {p.failedEvents} nepavyko</div>
                </div>
                {p.error && <div className="text-xs text-destructive">{p.error}</div>}
                {!p.error && p.lastErrorMessage && (
                  <div className="text-xs text-muted-foreground">
                    Paskutinė klaida ({fmt(p.lastErrorAt)}): {p.lastErrorMessage}
                  </div>
                )}
              </div>
            ))}
            {!health && !checking && <div className="text-xs text-muted-foreground">Būsena dar neįkelta.</div>}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Prieigos raktai saugomi tik serverio pusėje ir čia niekada nerodomi.
          </p>
        </div>
      )}

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
    </div>
  );
}
