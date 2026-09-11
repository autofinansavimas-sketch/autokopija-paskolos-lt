import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, AlertTriangle, CheckCircle2, HelpCircle, XCircle, Download, ListFilter, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PageHealth = {
  brand: string;
  label: string;
  pageId: string | null;
  configured: boolean;
  state: "healthy" | "warning" | "error" | "unknown";
  pageName: string | null;
  tokenUsable: boolean | null;
  subscribedFields: string[] | null;
  subscriptionActive: boolean | null;
  error: string | null;
  leadCount: number;
  commentCount: number;
  lastStoredLeadAt: string | null;
  lastWebhookAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
};

type HealthResponse = {
  checkedAt: string;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  pages: PageHealth[];
  recentEvents: {
    id: string; created_at: string; page_id: string | null; brand: string | null;
    event_type: string; status: string; message: string | null; fb_lead_id: string | null;
  }[];
};

type ImportPage = {
  brand: string; pageId: string; total: number; newCount: number; duplicates: number;
  oldest: string | null; newest: string | null; imported: number; failed: number; error: string | null;
};

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleString("lt-LT", { dateStyle: "short", timeStyle: "short" }) : "nėra duomenų";

const stateMeta: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  healthy: { label: "Veikia", className: "bg-green-500/15 text-green-700 dark:text-green-400", Icon: CheckCircle2 },
  warning: { label: "Dalinis", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400", Icon: AlertTriangle },
  error: { label: "Klaida", className: "bg-destructive/15 text-destructive", Icon: XCircle },
  unknown: { label: "Nežinoma", className: "bg-muted text-muted-foreground", Icon: HelpCircle },
};

export function MetaHealthPanel() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPage[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("meta-health");
      if (error) throw error;
      setData(res as HealthResponse);
    } catch (e) {
      toast.error("Nepavyko patikrinti Facebook ryšio būsenos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      await refresh();
    } catch {
      toast.error("Importas nepavyko");
    } finally {
      setImporting(false);
    }
  };

  const errorEvents = (data?.recentEvents ?? []).filter((e) => e.status === "error");

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Facebook ryšys</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Tikrinta: {data ? fmt(data.checkedAt) : "—"}
            </span>
            <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-1 text-xs">Atnaujinti būseną</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowErrors((v) => !v)}>
              <ListFilter className="h-4 w-4" />
              <span className="ml-1 text-xs">Rodyti klaidas ({errorEvents.length})</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={runPreview} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="ml-1 text-xs">Importuoti ankstesnius Facebook lead'us</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {(data?.pages ?? []).map((p) => {
            const meta = stateMeta[p.state] ?? stateMeta.unknown;
            const Icon = meta.Icon;
            return (
              <div key={p.brand} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{p.label}</span>
                  <Badge className={`text-[10px] ${meta.className}`} variant="secondary">
                    <Icon className="h-3 w-3 mr-1" />
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Facebook puslapis: {p.pageName || (p.pageId ? p.pageId : "nesukonfigūruota")}</div>
                  <div>Prieiga: {p.tokenUsable === true ? "veikia" : p.tokenUsable === false ? "nebegalioja" : "nepatikrinta"}</div>
                  <div>
                    Prenumerata: {p.subscriptionActive === true
                      ? (p.subscribedFields?.join(", ") || "aktyvi")
                      : p.subscriptionActive === false ? "neaktyvi" : "nežinoma"}
                  </div>
                  <div>Facebook lead'ai sistemoje: {p.leadCount} (komentarai: {p.commentCount})</div>
                  <div>Paskutinis gautas signalas: {fmt(p.lastWebhookAt)}</div>
                  <div>Paskutinis įrašytas lead'as: {fmt(p.lastStoredLeadAt)}</div>
                  {p.lastErrorMessage && (
                    <div className="text-destructive">Paskutinė klaida ({fmt(p.lastErrorAt)}): {p.lastErrorMessage}</div>
                  )}
                </div>
                {p.error && (
                  <div className="text-xs rounded-md bg-destructive/10 text-destructive p-2">{p.error}</div>
                )}
              </div>
            );
          })}
          {!data && !loading && (
            <p className="text-sm text-muted-foreground">Būsena dar nepatikrinta.</p>
          )}
        </div>

        {data && (
          <p className="text-xs text-muted-foreground">
            Webhook patvirtinimo raktas: {data.verifyTokenConfigured ? "sukonfigūruotas" : "nesukonfigūruotas"} ·
            {" "}Programėlės paslaptis: {data.appSecretConfigured ? "sukonfigūruota" : "nesukonfigūruota"}
          </p>
        )}

        {showErrors && (
          <div className="rounded-lg border divide-y max-h-64 overflow-auto">
            {errorEvents.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground">Klaidų žurnale nėra.</p>
            ) : (
              errorEvents.map((e) => (
                <div key={e.id} className="p-2 text-xs">
                  <div className="text-muted-foreground">{fmt(e.created_at)} · {e.event_type}{e.brand ? ` · ${e.brand}` : ""}</div>
                  <div className="text-destructive break-words">{e.message}</div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>

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
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
