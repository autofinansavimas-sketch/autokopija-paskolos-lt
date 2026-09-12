import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Connection = {
  pageId: string; brand: string | null; label: string | null; pageName: string | null;
  scopes: string[]; expiresAt: string | null; connectedAt: string | null; revoked: boolean;
};

type Status = {
  appConfigured: boolean; hasAppId: boolean; hasAppSecret: boolean;
  redirectUri: string; scopes: string[]; connections: Connection[]; message: string | null;
};

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleString("lt-LT", { dateStyle: "short", timeStyle: "short" }) : "—";

export function MetaConnectPanel() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth-start", {
        body: { action: "status" },
      });
      if (error) throw error;
      setStatus(data as Status);
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "Ryšio būsenos nepavyko nuskaityti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const connect = async () => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth-start", {
        body: { action: "start", redirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      const url = (data as { authorizeUrl?: string })?.authorizeUrl;
      if (!url) {
        toast.error("Reikalingi Meta APP_ID bei APP_SECRET");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      toast.info("Užbaikite autorizaciją naujame lange, tada paspauskite „Atnaujinti“.");
    } catch {
      toast.error("Nepavyko pradėti Meta prijungimo");
    } finally {
      setStarting(false);
    }
  };

  const ready = !!status?.appConfigured;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="text-xs" data-testid="meta-connect-toggle">
        <Link2 className="h-4 w-4 mr-1.5" />
        Prijungti Meta
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="meta-connect-dialog">
          <DialogHeader>
            <DialogTitle>Meta Login for Business</DialogTitle>
            <DialogDescription>
              Autorizuokite Auto Kopers LT ir Autopaskolos.lt puslapių lead'ų nuskaitymą. Prieigos raktai
              saugomi tik serveryje ir čia niekada nerodomi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={ready ? "default" : "secondary"} className="text-[11px]">
                {loading ? "Tikrinama…" : ready ? "Paruošta autorizacijai" : "Reikalingi Meta APP_ID bei APP_SECRET"}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-1.5 text-xs">Atnaujinti</span>
                </Button>
                <Button size="sm" onClick={connect} disabled={starting || !ready} data-testid="meta-connect-start">
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  <span className="ml-1.5 text-xs">Prijungti Meta</span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            {status && !status.appConfigured && (
              <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
                <div>Trūksta: {!status.hasAppId && "META_APP_ID"}{!status.hasAppId && !status.hasAppSecret && " ir "}{!status.hasAppSecret && "META_APP_SECRET"}</div>
                <div>Kol jų nėra, prijungimo mygtukas neaktyvus — jokio bandomojo ryšio nesimuliuojame.</div>
              </div>
            )}

            {status && (
              <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
                <div className="break-all">Callback URL, kurį reikia įrašyti Meta programėlėje: <span className="font-mono">{status.redirectUri}</span></div>
                <div>Prašomi leidimai: {status.scopes.join(", ")}</div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Prijungti puslapiai</div>
              {(status?.connections ?? []).length === 0 && (
                <div className="text-xs text-muted-foreground">Kol kas nė vienas puslapis nebuvo autorizuotas per Meta Login for Business.</div>
              )}
              {(status?.connections ?? []).map((c) => (
                <div key={c.pageId} className="rounded-md border p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c.label || c.pageName || c.pageId}</span>
                    <Badge variant={c.revoked ? "destructive" : "default"} className="text-[10px]">
                      {c.revoked ? "Atšaukta" : "Aktyvu"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Puslapio ID: {c.pageId}</div>
                    <div>Prijungta: {fmt(c.connectedAt)} · Galiojimas: {fmt(c.expiresAt)}</div>
                    <div>Leidimai: {c.scopes.length ? c.scopes.join(", ") : "nežinoma"}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Programėlės paslaptis ir prieigos raktai niekada nepatenka į naršyklę.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
