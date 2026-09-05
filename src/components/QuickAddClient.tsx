import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Plus, X, ChevronDown, ChevronUp, AlertTriangle, Trash2 } from "lucide-react";
import { useOperator, tagCommentWithOperator } from "@/hooks/use-operator";

interface StatusOpt { value: string; label: string }

interface Parsed {
  name: string;
  phone: string;
  email: string;
  amount: string;
  loan_type: string;
  loan_period: string;
  notes: string;
  duplicate?: string | null;
}

interface Props {
  statusConfig: StatusOpt[];
  currentUserId: string | null;
  onCreated: () => void;
}

const digits = (s: string) => s.replace(/\D/g, "").slice(-8);

export default function QuickAddClient({ statusConfig, currentUserId, onCreated }: Props) {
  const { toast } = useToast();
  const { operator } = useOperator();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Parsed[]>([]);
  const [status, setStatus] = useState(statusConfig[0]?.value || "new");

  const checkDuplicates = async (list: Parsed[]) => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("name, phone, email, status")
      .is("deleted_at", null)
      .limit(3000);
    const existing = data || [];
    return list.map((r) => {
      const p = digits(r.phone || "");
      const hit = existing.find(
        (e) =>
          (p && p.length >= 7 && digits(e.phone || "") === p) ||
          (r.email && e.email && r.email.toLowerCase() === e.email.toLowerCase() && !e.email.includes("@import")),
      );
      return { ...r, duplicate: hit ? `${hit.name || hit.phone} (${hit.status || "—"})` : null };
    });
  };

  const parse = async () => {
    if (!raw.trim()) return;
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { mode: "text", text: raw },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const clients = (data?.clients || []) as Record<string, string>[];
      if (!clients.length) throw new Error("Nepavyko rasti kliento duomenų");
      const mapped: Parsed[] = clients.map((c) => ({
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        amount: c.amount || "",
        loan_type: c.loan_type || "",
        loan_period: c.loan_period || "",
        notes: c.notes || raw.trim(),
      }));
      setRows(await checkDuplicates(mapped));
    } catch (e) {
      toast({
        title: "Nepavyko atpažinti",
        description: e instanceof Error ? e.message : "Bandykite dar kartą",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const update = (i: number, key: keyof Parsed, value: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const save = async () => {
    const valid = rows.filter((r) => r.phone || r.email || r.name);
    if (!valid.length) {
      toast({ title: "Per mažai info", description: "Reikia bent vardo arba telefono", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let ok = 0;
      for (const r of valid) {
        const { data, error } = await supabase
          .from("contact_submissions")
          .insert({
            name: r.name || null,
            email: r.email || "no-email@import",
            phone: r.phone || "",
            amount: r.amount || null,
            loan_type: r.loan_type || null,
            loan_period: r.loan_period || null,
            status,
            source: "import",
          })
          .select("id")
          .single();
        if (error) throw error;
        ok++;

        const noteText = [r.notes, r.notes !== raw.trim() ? `Originalus tekstas: ${raw.trim()}` : ""]
          .filter(Boolean)
          .join("\n");
        if (noteText && currentUserId) {
          await supabase.from("submission_comments").insert({
            submission_id: data.id,
            comment: tagCommentWithOperator(noteText, operator),
            user_id: currentUserId,
          });
        }
      }

      toast({ title: ok > 1 ? `Pridėta klientų: ${ok}` : "Klientas pridėtas", description: valid[0].name || valid[0].phone });
      setRaw("");
      setRows([]);
      onCreated();
    } catch (e) {
      toast({
        title: "Klaida",
        description: e instanceof Error ? e.message : "Nepavyko išsaugoti",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (i: number, key: keyof Parsed, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        className="h-9 text-base"
        value={(rows[i]?.[key] as string) || ""}
        placeholder={placeholder}
        onChange={(e) => update(i, key, e.target.value)}
      />
    </div>
  );

  return (
    <Card className="mb-4 border-primary/30">
      <CardContent className="p-3 space-y-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Greitas įmetimas</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            įklijuok tekstą — info atsirinks pati
          </span>
          {open ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </button>

        {open && (
          <div className="space-y-3">
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); parse(); }
              }}
              rows={3}
              className="text-base"
              placeholder="Pvz.: Aistė, nori 15k. DU rašo 3000, bet įsipareigojimai 1000. Pabandysi susisiekti? +37060805545"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={parse} disabled={parsing || !raw.trim()}>
                {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Atrinkti info
              </Button>
              <span className="text-xs text-muted-foreground hidden sm:inline">Ctrl/⌘ + Enter</span>
              {(raw || rows.length > 0) && (
                <Button size="sm" variant="ghost" onClick={() => { setRaw(""); setRows([]); }}>
                  <X className="h-4 w-4 mr-1" />
                  Išvalyti
                </Button>
              )}
            </div>

            {rows.map((r, i) => (
              <div key={i} className="space-y-3 border-t pt-3">
                {rows.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Klientas {i + 1} iš {rows.length}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {r.duplicate && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      Toks klientas jau yra sistemoje: <strong>{r.duplicate}</strong>. Gali vis tiek pridėti arba pašalinti iš sąrašo.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {field(i, "name", "Vardas")}
                  {field(i, "phone", "Telefonas", "+3706...")}
                  {field(i, "email", "El. paštas")}
                  {field(i, "amount", "Suma €")}
                  {field(i, "loan_type", "Paskolos tipas")}
                  {field(i, "loan_period", "Terminas")}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Komentaras (išsaugomas kortelėje)</Label>
                  <Textarea
                    rows={3}
                    className="text-base"
                    value={r.notes}
                    onChange={(e) => update(i, "notes", e.target.value)}
                  />
                </div>
              </div>
            ))}

            {rows.length > 0 && (
              <div className="flex flex-wrap items-end gap-2 border-t pt-3">
                <div className="space-y-1">
                  <Label className="text-xs">Kortelė</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusConfig.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  {rows.length > 1 ? `Pridėti ${rows.length} klientus` : "Pridėti klientą"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
