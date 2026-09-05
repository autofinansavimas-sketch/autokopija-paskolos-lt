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
import { Sparkles, Loader2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
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
}

const EMPTY: Parsed = {
  name: "", phone: "", email: "", amount: "", loan_type: "", loan_period: "", notes: "",
};

interface Props {
  statusConfig: StatusOpt[];
  currentUserId: string | null;
  onCreated: () => void;
}

export default function QuickAddClient({ statusConfig, currentUserId, onCreated }: Props) {
  const { toast } = useToast();
  const { operator } = useOperator();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [status, setStatus] = useState(statusConfig[0]?.value || "new");

  const parse = async () => {
    if (!raw.trim()) return;
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { mode: "text", text: raw },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const c = (data?.clients || [])[0] || {};
      setParsed({
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        amount: c.amount || "",
        loan_type: c.loan_type || "",
        loan_period: c.loan_period || "",
        notes: c.notes || raw.trim(),
      });
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

  const save = async () => {
    if (!parsed) return;
    if (!parsed.phone && !parsed.email && !parsed.name) {
      toast({ title: "Per mažai info", description: "Reikia bent vardo arba telefono", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert({
          name: parsed.name || null,
          email: parsed.email || "no-email@import",
          phone: parsed.phone || "",
          amount: parsed.amount || null,
          loan_type: parsed.loan_type || null,
          loan_period: parsed.loan_period || null,
          status,
          source: "import",
        })
        .select("id")
        .single();
      if (error) throw error;

      const noteText = [parsed.notes, parsed.notes !== raw.trim() ? `Originalus tekstas: ${raw.trim()}` : ""]
        .filter(Boolean)
        .join("\n");
      if (noteText && currentUserId) {
        await supabase.from("submission_comments").insert({
          submission_id: data.id,
          comment: tagCommentWithOperator(noteText, operator),
          user_id: currentUserId,
        });
      }

      toast({ title: "Klientas pridėtas", description: parsed.name || parsed.phone });
      setRaw("");
      setParsed(null);
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

  const field = (key: keyof Parsed, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        className="h-9 text-base"
        value={parsed?.[key] || ""}
        placeholder={placeholder}
        onChange={(e) => setParsed((p) => (p ? { ...p, [key]: e.target.value } : p))}
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
              rows={3}
              className="text-base"
              placeholder="Pvz.: Aistė, nori 15k. DU rašo 3000, bet įsipareigojimai 1000. Pabandysi susisiekti? +37060805545"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={parse} disabled={parsing || !raw.trim()}>
                {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Atrinkti info
              </Button>
              {(raw || parsed) && (
                <Button size="sm" variant="ghost" onClick={() => { setRaw(""); setParsed(null); }}>
                  <X className="h-4 w-4 mr-1" />
                  Išvalyti
                </Button>
              )}
            </div>

            {parsed && (
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {field("name", "Vardas")}
                  {field("phone", "Telefonas", "+3706...")}
                  {field("email", "El. paštas")}
                  {field("amount", "Suma €")}
                  {field("loan_type", "Paskolos tipas")}
                  {field("loan_period", "Terminas")}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Komentaras (išsaugomas kortelėje)</Label>
                  <Textarea
                    rows={3}
                    className="text-base"
                    value={parsed.notes}
                    onChange={(e) => setParsed((p) => (p ? { ...p, notes: e.target.value } : p))}
                  />
                </div>
                <div className="flex flex-wrap items-end gap-2">
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
                    Pridėti klientą
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
