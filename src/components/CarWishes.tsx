import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Car, Bell, Plus, X, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Wish = { id: string; make: string; model: string | null };
type Match = {
  id: string; submission_id: string; title: string; year: number | null;
  price: number | null; url: string | null; seen: boolean; created_at: string;
};

const runCheck = () => supabase.functions.invoke("check-autokopers-cars", { body: {} }).catch(() => {});

export function CarWishes({ submissionId }: { submissionId: string }) {
  const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [w, m] = await Promise.all([
      supabase.from("car_wishes").select("id, make, model").eq("submission_id", submissionId).eq("active", true),
      supabase.from("car_matches").select("*").eq("submission_id", submissionId).order("created_at", { ascending: false }),
    ]);
    setWishes((w.data as Wish[]) || []);
    setMatches((m.data as Match[]) || []);
  };

  useEffect(() => { setMake(""); setModel(""); load(); }, [submissionId]);

  const add = async () => {
    if (!make.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("car_wishes").insert({
      submission_id: submissionId, make: make.trim().slice(0, 60), model: model.trim().slice(0, 60) || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Nepavyko išsaugoti", variant: "destructive" }); return; }
    setMake(""); setModel("");
    await runCheck();
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("car_wishes").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Car className="h-4 w-4" /> Ieškomas automobilis (autokopers.lt)
      </div>
      {wishes.map((w) => (
        <div key={w.id} className="flex items-center justify-between text-sm">
          <span>{w.make} {w.model || "(bet koks modelis)"}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(w.id)}><X className="h-3 w-3" /></Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input className="h-9 text-base" placeholder="Markė (pvz. BMW)" value={make} onChange={(e) => setMake(e.target.value)} />
        <Input className="h-9 text-base" placeholder="Modelis" value={model} onChange={(e) => setModel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={add} disabled={saving || !make.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      {matches.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-xs text-muted-foreground">Rasta autokopers.lt:</p>
          {matches.map((m) => (
            <a key={m.id} href={m.url || "#"} target="_blank" rel="noreferrer"
              className="flex items-center justify-between rounded bg-muted px-2 py-1 text-sm hover:underline">
              <span>{m.title} {m.year ?? ""} {m.price ? `· ${Math.round(m.price)} €` : ""}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function CarMatchesBell({ onOpenSubmission }: { onOpenSubmission: (id: string) => void }) {
  const [matches, setMatches] = useState<Match[]>([]);

  const load = async () => {
    const { data } = await supabase.from("car_matches").select("*").eq("seen", false)
      .order("created_at", { ascending: false }).limit(50);
    setMatches((data as Match[]) || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const markSeen = async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from("car_matches").update({ seen: true }).in("id", ids);
    setMatches((prev) => prev.filter((m) => !ids.includes(m.id)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={matches.length ? "default" : "outline"} size="sm" className="h-8 gap-1.5" title="Rasti automobiliai autokopers.lt">
          <Bell className="h-3.5 w-3.5" /> Auto
          {matches.length > 0 && <Badge variant="secondary" className="h-5 px-1.5">{matches.length}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Nauji atitikmenys autokopers.lt</p>
          {matches.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markSeen(matches.map((m) => m.id))}>Pažymėti visus</Button>
          )}
        </div>
        {matches.length === 0 && <p className="text-sm text-muted-foreground">Naujų automobilių nėra.</p>}
        {matches.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 rounded bg-muted px-2 py-1.5 text-sm">
            <button type="button" className="text-left hover:underline" onClick={() => { onOpenSubmission(m.submission_id); markSeen([m.id]); }}>
              {m.title} {m.year ?? ""} {m.price ? `· ${Math.round(m.price)} €` : ""}
            </button>
            {m.url && <a href={m.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
