import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ScanLine, Upload, Loader2, FileText, FileSpreadsheet, X, Users,
  Sparkles, Facebook, Plus, CheckCircle2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SubmissionLite {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  amount: string | null;
  loan_type: string | null;
  loan_period: string | null;
  status: string;
  source?: string | null;
  created_at: string;
}

interface ExtractedClient {
  name?: string;
  email?: string;
  phone?: string;
  amount?: string;
  loan_type?: string;
  loan_period?: string;
  notes?: string;
}

export default function ClientTools() {
  const { toast } = useToast();

  // Extract state (shared between image + text)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedClient[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  // Meta sync state
  const [metaSyncing, setMetaSyncing] = useState(false);
  const [metaHours, setMetaHours] = useState("168");
  const [metaResult, setMetaResult] = useState<{ inserted: number; skipped: number; forms: number } | null>(null);

  // Report state
  const [submissions, setSubmissions] = useState<SubmissionLite[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => { void loadSubmissions(); }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id,name,email,phone,amount,loan_type,loan_period,status,source,created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) setSubmissions(data as SubmissionLite[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Klaida", description: "Įkelkite nuotrauką (JPG/PNG)", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "Per didelis failas", description: "Maks. 10MB", variant: "destructive" });
      return;
    }
    setFile(f);
    setExtracted([]);
    setSelected(new Set());
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setExtracted([]);
    setSelected(new Set());
  };

  const scanImage = async (mode: "single" | "bulk") => {
    if (!preview) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { mode, imageBase64: preview, mimeType: file?.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const clients: ExtractedClient[] = data?.clients || [];
      setExtracted(clients);
      setSelected(new Set(clients.map((_, i) => i)));
      toast({ title: "Nuskaityta", description: `Rasta ${clients.length} klientas(-ų)` });
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const scanText = async () => {
    if (!freeText.trim()) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { mode: "text", text: freeText },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const clients: ExtractedClient[] = data?.clients || [];
      setExtracted(clients);
      setSelected(new Set(clients.map((_, i) => i)));
      toast({ title: "Atpažinta", description: `Rasta ${clients.length} klientas(-ų)` });
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const toggleRow = (i: number) => {
    const s = new Set(selected);
    if (s.has(i)) s.delete(i); else s.add(i);
    setSelected(s);
  };

  const updateField = (i: number, field: keyof ExtractedClient, value: string) => {
    const next = [...extracted];
    next[i] = { ...next[i], [field]: value };
    setExtracted(next);
  };

  const importSelected = async () => {
    const toInsert = extracted
      .filter((_, i) => selected.has(i))
      .filter((c) => (c.email || c.phone || c.name))
      .map((c) => ({
        name: c.name || null,
        email: c.email || "no-email@import",
        phone: c.phone || "",
        amount: c.amount || null,
        loan_type: c.loan_type || null,
        loan_period: c.loan_period || null,
        status: "new",
        source: "import",
      }));

    if (toInsert.length === 0) {
      toast({ title: "Nieko nepasirinkta", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert(toInsert);
      if (error) throw error;
      toast({ title: "Pridėta", description: `Sukurta ${toInsert.length} klientas(-ų) sistemoje` });
      setExtracted([]);
      setSelected(new Set());
      setFile(null); setPreview(null); setFreeText("");
      void loadSubmissions();
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko išsaugoti", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const syncMeta = async () => {
    setMetaSyncing(true);
    setMetaResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("meta-leads-sync", {
        body: { hours: Number(metaHours) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMetaResult({ inserted: data.inserted, skipped: data.skipped, forms: data.forms });
      toast({
        title: "Sinchronizuota",
        description: `Pridėta ${data.inserted}, praleista (jau yra) ${data.skipped}`,
      });
      void loadSubmissions();
    } catch (e) {
      toast({ title: "Meta klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally {
      setMetaSyncing(false);
    }
  };

  const exportPDF = async () => {
    if (!selectedId) { toast({ title: "Pasirinkite klientą", variant: "destructive" }); return; }
    setExporting(true);
    try {
      const s = submissions.find((x) => x.id === selectedId)!;
      const { data: comments } = await supabase
        .from("submission_comments").select("comment,created_at")
        .eq("submission_id", selectedId).order("created_at", { ascending: true });

      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("Kliento ataskaita", 14, 20);
      doc.setFontSize(10); doc.setTextColor(120);
      doc.text(`Sugeneruota: ${new Date().toLocaleString("lt-LT")}`, 14, 27);
      doc.setTextColor(0);
      autoTable(doc, {
        startY: 35,
        head: [["Laukas", "Reikšmė"]],
        body: [
          ["Vardas", s.name || "-"],
          ["El. paštas", s.email],
          ["Telefonas", s.phone],
          ["Suma", s.amount || "-"],
          ["Paskolos tipas", s.loan_type || "-"],
          ["Terminas", s.loan_period || "-"],
          ["Statusas", s.status],
          ["Saltinis", s.source || "-"],
          ["Sukurta", new Date(s.created_at).toLocaleString("lt-LT")],
        ],
        styles: { fontSize: 10 }, headStyles: { fillColor: [34, 139, 34] },
      });
      if (comments && comments.length > 0) {
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
        doc.setFontSize(14); doc.text("Komentarai", 14, finalY + 12);
        autoTable(doc, {
          startY: finalY + 16,
          head: [["Data", "Komentaras"]],
          body: comments.map((c) => [new Date(c.created_at).toLocaleString("lt-LT"), c.comment]),
          styles: { fontSize: 9 }, headStyles: { fillColor: [34, 139, 34] },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: "auto" } },
        });
      }
      doc.save(`klientas-${(s.name || s.email).replace(/[^a-z0-9]/gi, "_")}.pdf`);
      toast({ title: "PDF atsisiųsta" });
    } finally { setExporting(false); }
  };

  const exportExcel = async () => {
    if (!selectedId) { toast({ title: "Pasirinkite klientą", variant: "destructive" }); return; }
    setExporting(true);
    try {
      const s = submissions.find((x) => x.id === selectedId)!;
      const { data: comments } = await supabase
        .from("submission_comments").select("comment,created_at")
        .eq("submission_id", selectedId).order("created_at", { ascending: true });
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.aoa_to_sheet([
        ["Laukas", "Reikšmė"],
        ["Vardas", s.name || "-"], ["El. paštas", s.email], ["Telefonas", s.phone],
        ["Suma", s.amount || "-"], ["Paskolos tipas", s.loan_type || "-"],
        ["Terminas", s.loan_period || "-"], ["Statusas", s.status],
        ["Šaltinis", s.source || "-"], ["Sukurta", new Date(s.created_at).toLocaleString("lt-LT")],
      ]);
      ws1["!cols"] = [{ wch: 20 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Klientas");
      if (comments && comments.length > 0) {
        const ws2 = XLSX.utils.aoa_to_sheet([["Data", "Komentaras"],
          ...comments.map((c) => [new Date(c.created_at).toLocaleString("lt-LT"), c.comment])]);
        ws2["!cols"] = [{ wch: 22 }, { wch: 80 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Komentarai");
      }
      XLSX.writeFile(wb, `klientas-${(s.name || s.email).replace(/[^a-z0-9]/gi, "_")}.xlsx`);
      toast({ title: "Excel atsisiųsta" });
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Import card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Pridėti klientus į sistemą
          </CardTitle>
          <CardDescription>
            Iš nuotraukos, laisvo teksto arba tiesiogiai iš Meta (Facebook) skelbimų
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="image"><ScanLine className="h-4 w-4 mr-1.5" />Nuotrauka</TabsTrigger>
              <TabsTrigger value="text"><FileText className="h-4 w-4 mr-1.5" />Tekstas</TabsTrigger>
              <TabsTrigger value="meta"><Facebook className="h-4 w-4 mr-1.5" />Meta leads</TabsTrigger>
            </TabsList>

            {/* Image tab */}
            <TabsContent value="image" className="space-y-3 mt-4">
              {!preview ? (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/30 transition">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Spauskite ir įkelkite nuotrauką</span>
                  <span className="text-xs text-muted-foreground">
                    Ekrano nuotrauka su klientų sąrašu, dokumentas ar bet kokia kita nuotrauka su tekstu (iki 10MB)
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img src={preview} alt="Peržiūra" className="w-full max-h-72 object-contain rounded-lg border bg-muted/30" />
                    <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-7 w-7" onClick={clearImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => scanImage("bulk")} disabled={scanning}>
                      {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                      Lentelė / sąrašas
                    </Button>
                    <Button onClick={() => scanImage("single")} disabled={scanning} variant="outline">
                      {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanLine className="h-4 w-4 mr-2" />}
                      Vienas klientas
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Text tab */}
            <TabsContent value="text" className="space-y-3 mt-4">
              <Textarea
                placeholder="Padrikai parašykite viską apie klientą - vardas, telefonas, el. paštas, ko nori, kiek nori... AI sutvarkys ir sukurs kortelę."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={6}
                className="text-sm"
              />
              <Button onClick={scanText} disabled={scanning || !freeText.trim()} className="w-full">
                {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Atpažinti ir paruošti
              </Button>
            </TabsContent>

            {/* Meta tab */}
            <TabsContent value="meta" className="space-y-3 mt-4">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm text-muted-foreground">
                Paspaudus „Sinchronizuoti" sistema parsisiųs naujausius lead'us iš visų jūsų Facebook lead'ų formų ir įkels į CRM. Pasikartojantys lead'ai (pagal Meta ID) bus praleisti.
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Laikotarpis</Label>
                  <Select value={metaHours} onValueChange={setMetaHours}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">Paskutinės 24 val.</SelectItem>
                      <SelectItem value="72">Paskutinės 3 d.</SelectItem>
                      <SelectItem value="168">Paskutinė savaitė</SelectItem>
                      <SelectItem value="720">Paskutinis mėnuo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={syncMeta} disabled={metaSyncing}>
                  {metaSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Facebook className="h-4 w-4 mr-2" />}
                  Sinchronizuoti
                </Button>
              </div>
              {metaResult && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Formų: <strong>{metaResult.forms}</strong> · Pridėta: <strong>{metaResult.inserted}</strong> · Praleista: <strong>{metaResult.skipped}</strong></span>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Extracted preview & import */}
          {extracted.length > 0 && (
            <div className="mt-5 pt-5 border-t space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{extracted.length} klientas(-ų)</Badge>
                  <span className="text-xs text-muted-foreground">
                    Pažymėta {selected.size}. Patikrinkite ir, jei reikia, pataisykite.
                  </span>
                </div>
                <Button onClick={importSelected} disabled={importing || selected.size === 0} size="sm">
                  {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Pridėti į sistemą ({selected.size})
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 w-8"></th>
                      <th className="p-2 text-left font-medium">Vardas</th>
                      <th className="p-2 text-left font-medium">Telefonas</th>
                      <th className="p-2 text-left font-medium">El. paštas</th>
                      <th className="p-2 text-left font-medium">Suma</th>
                      <th className="p-2 text-left font-medium">Tipas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extracted.map((c, i) => (
                      <tr key={i} className="border-t hover:bg-muted/20">
                        <td className="p-2">
                          <Checkbox checked={selected.has(i)} onCheckedChange={() => toggleRow(i)} />
                        </td>
                        <td className="p-1">
                          <Input value={c.name || ""} onChange={(e) => updateField(i, "name", e.target.value)} className="h-8 text-sm" />
                        </td>
                        <td className="p-1">
                          <Input value={c.phone || ""} onChange={(e) => updateField(i, "phone", e.target.value)} className="h-8 text-sm" />
                        </td>
                        <td className="p-1">
                          <Input value={c.email || ""} onChange={(e) => updateField(i, "email", e.target.value)} className="h-8 text-sm" />
                        </td>
                        <td className="p-1">
                          <Input value={c.amount || ""} onChange={(e) => updateField(i, "amount", e.target.value)} className="h-8 text-sm w-24" />
                        </td>
                        <td className="p-1">
                          <Input value={c.loan_type || ""} onChange={(e) => updateField(i, "loan_type", e.target.value)} className="h-8 text-sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report export card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Kliento ataskaita
          </CardTitle>
          <CardDescription>Pasirinkite klientą ir atsisiųskite PDF arba Excel ataskaitą</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger><SelectValue placeholder="Pasirinkite klientą..." /></SelectTrigger>
            <SelectContent>
              {submissions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {(s.name || s.email)} — {s.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportPDF} disabled={exporting || !selectedId}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} PDF
            </Button>
            <Button onClick={exportExcel} disabled={exporting || !selectedId} variant="outline">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />} Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
