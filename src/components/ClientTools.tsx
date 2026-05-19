import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ScanLine,
  Upload,
  Loader2,
  FileText,
  FileSpreadsheet,
  Copy,
  X,
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

interface Comment {
  comment: string;
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  vardas: "Vardas",
  pavarde: "Pavardė",
  asmens_kodas: "Asmens kodas",
  gimimo_data: "Gimimo data",
  dokumento_numeris: "Dokumento Nr.",
  galioja_iki: "Galioja iki",
  adresas: "Adresas",
  telefonas: "Telefonas",
  el_pastas: "El. paštas",
  automobilio_marke: "Automobilio markė",
  automobilio_modelis: "Automobilio modelis",
  vin: "VIN",
  valstybinis_nr: "Valstybinis Nr.",
  kita_informacija: "Kita informacija",
  neapdorotas_tekstas: "Visas nuskaitytas tekstas",
};

export default function ClientTools() {
  const { toast } = useToast();

  // OCR state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState<Record<string, string> | null>(null);

  // Report state
  const [submissions, setSubmissions] = useState<SubmissionLite[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("id,name,email,phone,amount,loan_type,loan_period,status,source,created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setSubmissions(data as SubmissionLite[]);
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
    setExtracted(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setExtracted(null);
  };

  const scan = async () => {
    if (!preview) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { imageBase64: preview, mimeType: file?.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExtracted((data?.data || {}) as Record<string, string>);
      toast({ title: "Nuskaityta", description: "Duomenys ištraukti iš nuotraukos" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko nuskaityti";
      toast({ title: "Klaida", description: msg, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const copyAll = () => {
    if (!extracted) return;
    const text = Object.entries(extracted)
      .filter(([k, v]) => v && k !== "neapdorotas_tekstas")
      .map(([k, v]) => `${FIELD_LABELS[k] || k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Nukopijuota", description: "Duomenys nukopijuoti į iškarpinę" });
  };

  const fetchClientData = async (id: string) => {
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return null;
    const { data: comments } = await supabase
      .from("submission_comments")
      .select("comment,created_at")
      .eq("submission_id", id)
      .order("created_at", { ascending: true });
    return { submission, comments: (comments || []) as Comment[] };
  };

  const exportPDF = async () => {
    if (!selectedId) {
      toast({ title: "Pasirinkite klientą", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      const result = await fetchClientData(selectedId);
      if (!result) return;
      const { submission, comments } = result;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Kliento ataskaita", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Sugeneruota: ${new Date().toLocaleString("lt-LT")}`, 14, 27);
      doc.setTextColor(0);

      autoTable(doc, {
        startY: 35,
        head: [["Laukas", "Reikšmė"]],
        body: [
          ["Vardas", submission.name || "-"],
          ["El. paštas", submission.email],
          ["Telefonas", submission.phone],
          ["Suma", submission.amount || "-"],
          ["Paskolos tipas", submission.loan_type || "-"],
          ["Terminas", submission.loan_period || "-"],
          ["Statusas", submission.status],
          ["Saltinis", submission.source || "-"],
          ["Sukurta", new Date(submission.created_at).toLocaleString("lt-LT")],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 139, 34] },
      });

      if (comments.length > 0) {
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.text("Komentarai", 14, finalY + 12);
        autoTable(doc, {
          startY: finalY + 16,
          head: [["Data", "Komentaras"]],
          body: comments.map((c) => [
            new Date(c.created_at).toLocaleString("lt-LT"),
            c.comment,
          ]),
          styles: { fontSize: 9, cellWidth: "wrap" },
          headStyles: { fillColor: [34, 139, 34] },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: "auto" } },
        });
      }

      const filename = `klientas-${(submission.name || submission.email).replace(/[^a-z0-9]/gi, "_")}.pdf`;
      doc.save(filename);
      toast({ title: "PDF atsisiųsta" });
    } catch (e) {
      toast({ title: "Klaida", description: "Nepavyko sukurti PDF", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    if (!selectedId) {
      toast({ title: "Pasirinkite klientą", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      const result = await fetchClientData(selectedId);
      if (!result) return;
      const { submission, comments } = result;

      const wb = XLSX.utils.book_new();
      const info = [
        ["Laukas", "Reikšmė"],
        ["Vardas", submission.name || "-"],
        ["El. paštas", submission.email],
        ["Telefonas", submission.phone],
        ["Suma", submission.amount || "-"],
        ["Paskolos tipas", submission.loan_type || "-"],
        ["Terminas", submission.loan_period || "-"],
        ["Statusas", submission.status],
        ["Šaltinis", submission.source || "-"],
        ["Sukurta", new Date(submission.created_at).toLocaleString("lt-LT")],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(info);
      ws1["!cols"] = [{ wch: 20 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Klientas");

      if (comments.length > 0) {
        const cm = [["Data", "Komentaras"], ...comments.map((c) => [
          new Date(c.created_at).toLocaleString("lt-LT"),
          c.comment,
        ])];
        const ws2 = XLSX.utils.aoa_to_sheet(cm);
        ws2["!cols"] = [{ wch: 22 }, { wch: 80 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Komentarai");
      }

      const filename = `klientas-${(submission.name || submission.email).replace(/[^a-z0-9]/gi, "_")}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast({ title: "Excel atsisiųsta" });
    } catch (e) {
      toast({ title: "Klaida", description: "Nepavyko sukurti Excel", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {/* OCR card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Nuskaityti dokumentą
          </CardTitle>
          <CardDescription>
            Įkelkite nuotrauką – AI ištrauks asmens / automobilio duomenis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!preview ? (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/30 transition">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Spauskite ir pasirinkite nuotrauką</span>
              <span className="text-xs text-muted-foreground">JPG, PNG (iki 10MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img src={preview} alt="Peržiūra" className="w-full max-h-64 object-contain rounded-lg border" />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={scan} disabled={scanning} className="w-full">
                {scanning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Nuskaitoma...</>
                ) : (
                  <><ScanLine className="h-4 w-4 mr-2" /> Nuskaityti duomenis</>
                )}
              </Button>
            </div>
          )}

          {extracted && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Ištraukti duomenys</Label>
                <Button size="sm" variant="ghost" onClick={copyAll}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Kopijuoti
                </Button>
              </div>
              <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
                {Object.entries(extracted)
                  .filter(([, v]) => v && String(v).trim())
                  .map(([k, v]) =>
                    k === "neapdorotas_tekstas" ? (
                      <div key={k} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{FIELD_LABELS[k]}</Label>
                        <Textarea value={String(v)} readOnly rows={3} className="text-xs" />
                      </div>
                    ) : (
                      <div key={k} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{FIELD_LABELS[k] || k}</Label>
                        <Input value={String(v)} readOnly className="text-sm" />
                      </div>
                    )
                  )}
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
          <CardDescription>
            Pasirinkite klientą ir atsisiųskite ataskaitą PDF arba Excel formatu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Klientas</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Pasirinkite klientą..." />
              </SelectTrigger>
              <SelectContent>
                {submissions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {(s.name || s.email)} — {s.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Rodoma {submissions.length} klientų (paskutiniai 500)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={exportPDF} disabled={exporting || !selectedId} variant="default">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              PDF
            </Button>
            <Button onClick={exportExcel} disabled={exporting || !selectedId} variant="outline">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
