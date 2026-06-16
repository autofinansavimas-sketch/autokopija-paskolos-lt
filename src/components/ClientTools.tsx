import { useState, useEffect, useMemo } from "react";
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
  Sparkles, Facebook, Plus, CheckCircle2, LayoutGrid, Calendar,
  MessageSquare, Mail, Copy, Send, AlertTriangle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { applyLtFont, PDF_FONT } from "@/lib/pdfFont";

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
  status?: string;
  notes?: string;
}

interface StatusOpt { value: string; label: string }

interface Props {
  statusConfig: StatusOpt[];
}

const normalizeEmail = (value?: string | null) => (value || "").trim().toLowerCase();

const normalizePhone = (value?: string | null) => {
  let digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("8") && digits.length === 9) digits = `370${digits.slice(1)}`;
  if (digits.startsWith("6") && digits.length === 8) digits = `370${digits}`;
  return digits;
};

const readAsDataUrl = (f: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error("Nepavyko nuskaityti failo"));
  reader.readAsDataURL(f);
});

export default function ClientTools({ statusConfig }: Props) {
  const { toast } = useToast();
  const defaultStatus = statusConfig[0]?.value || "new";

  // Extract state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedClient[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>(defaultStatus);

  // Meta sync state
  const [metaSyncing, setMetaSyncing] = useState(false);
  const [metaHours, setMetaHours] = useState("168");
  const [metaResult, setMetaResult] = useState<{ inserted: number; skipped: number; forms: number } | null>(null);

  // Report state
  const [submissions, setSubmissions] = useState<SubmissionLite[]>([]);
  const [reportMode, setReportMode] = useState<"client" | "category" | "day" | "comments">("client");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultStatus);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [commentsDate, setCommentsDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [commentRows, setCommentRows] = useState<Array<{ submission: SubmissionLite; comments: { comment: string; created_at: string }[] }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Bulk messaging state
  const [msgFilter, setMsgFilter] = useState<string>("all"); // "all" | status value
  const [msgSelected, setMsgSelected] = useState<Set<string>>(new Set());
  const [msgText, setMsgText] = useState<string>("Sveiki, {vardas}! Skambinome dėl Jūsų paskolos užklausos. Susisiekite su mumis. AutoPaskolos");
  const [msgSearch, setMsgSearch] = useState("");

  const duplicateInfo = useMemo(() => {
    const existingPhones = new Map<string, string>();
    const existingEmails = new Map<string, string>();
    submissions.forEach((s) => {
      const phone = normalizePhone(s.phone);
      const email = normalizeEmail(s.email);
      const label = s.name || s.phone || s.email || "esamas klientas";
      if (phone) existingPhones.set(phone, label);
      if (email && !email.includes("no-email@")) existingEmails.set(email, label);
    });

    const seenPhones = new Map<string, number>();
    const seenEmails = new Map<string, number>();
    const result = new Map<number, string>();

    extracted.forEach((c, i) => {
      const phone = normalizePhone(c.phone);
      const email = normalizeEmail(c.email);
      if (email && existingEmails.has(email)) result.set(i, `Jau sistemoje: ${existingEmails.get(email)}`);
      else if (phone && existingPhones.has(phone)) result.set(i, `Jau sistemoje: ${existingPhones.get(phone)}`);
      else if (email && seenEmails.has(email)) result.set(i, `Dublis šiame importe (#${seenEmails.get(email)! + 1})`);
      else if (phone && seenPhones.has(phone)) result.set(i, `Dublis šiame importe (#${seenPhones.get(phone)! + 1})`);

      if (!result.has(i)) {
        if (email) seenEmails.set(email, i);
        if (phone) seenPhones.set(phone, i);
      }
    });

    return result;
  }, [extracted, submissions]);

  const importableIndexes = useMemo(
    () => extracted.map((_, i) => i).filter((i) => !duplicateInfo.has(i)),
    [extracted, duplicateInfo],
  );

  useEffect(() => {
    if (duplicateInfo.size === 0) return;
    setSelected((prev) => {
      const next = new Set(Array.from(prev).filter((i) => !duplicateInfo.has(i)));
      return next.size === prev.size ? prev : next;
    });
  }, [duplicateInfo]);


  useEffect(() => { void loadSubmissions(); }, []);

  useEffect(() => {
    if (reportMode !== "comments") return;
    let cancelled = false;
    (async () => {
      setLoadingComments(true);
      const start = `${commentsDate}T00:00:00`;
      const end = `${commentsDate}T23:59:59.999`;
      const { data } = await supabase
        .from("submission_comments")
        .select("submission_id,comment,created_at")
        .gte("created_at", start).lte("created_at", end)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const grouped = new Map<string, { comment: string; created_at: string }[]>();
      (data || []).forEach((c) => {
        const arr = grouped.get(c.submission_id) || [];
        arr.push({ comment: c.comment, created_at: c.created_at });
        grouped.set(c.submission_id, arr);
      });
      const ids = Array.from(grouped.keys());
      let subs: SubmissionLite[] = [];
      if (ids.length > 0) {
        const { data: subData } = await supabase
          .from("contact_submissions")
          .select("id,name,email,phone,amount,loan_type,loan_period,status,source,created_at")
          .in("id", ids);
        subs = (subData || []) as SubmissionLite[];
      }
      const rows = ids.map((id) => {
        const submission = subs.find((s) => s.id === id) || {
          id, name: "(ištrintas)", email: "-", phone: "-", amount: null,
          loan_type: null, loan_period: null, status: "new", source: null,
          created_at: new Date().toISOString(),
        } as SubmissionLite;
        return { submission, comments: grouped.get(id)! };
      });
      setCommentRows(rows);
      setLoadingComments(false);
    })();
    return () => { cancelled = true; };
  }, [reportMode, commentsDate]);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id,name,email,phone,amount,loan_type,loan_period,status,source,created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (data) setSubmissions(data as SubmissionLite[]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    if (selectedFiles.some((f) => !f.type.startsWith("image/"))) {
      toast({ title: "Klaida", description: "Įkelkite nuotrauką (JPG/PNG)", variant: "destructive" });
      return;
    }
    if (selectedFiles.some((f) => f.size > 10 * 1024 * 1024)) {
      toast({ title: "Per didelis failas", description: "Maks. 10MB vienam failui", variant: "destructive" });
      return;
    }
    try {
      const dataUrls = await Promise.all(selectedFiles.map(readAsDataUrl));
      setFiles(selectedFiles);
      setPreviews(dataUrls);
      setExtracted([]);
      setSelected(new Set());
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko nuskaityti failų", variant: "destructive" });
    }
  };

  const clearImage = () => {
    setFiles([]); setPreviews([]); setExtracted([]); setSelected(new Set());
  };

  const ingestExtracted = (clients: ExtractedClient[]) => {
    const withStatus = clients.map((c) => ({ ...c, status: c.status || bulkStatus }));
    setExtracted(withStatus);
    setSelected(new Set(withStatus.map((_, i) => i)));
  };

  const scanImage = async (mode: "single" | "bulk") => {
    if (previews.length === 0) return;
    setScanning(true);
    try {
      const clients: ExtractedClient[] = [];
      for (let i = 0; i < previews.length; i += 1) {
        const { data, error } = await supabase.functions.invoke("extract-document", {
          body: { mode, imageBase64: previews[i], mimeType: files[i]?.type },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        clients.push(...((data?.clients || []) as ExtractedClient[]));
      }
      ingestExtracted(clients);
      toast({ title: "Nuskaityta", description: `Failų: ${previews.length}. Rasta ${clients.length} klientas(-ų)` });
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally { setScanning(false); }
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
      ingestExtracted(clients);
      toast({ title: "Atpažinta", description: `Rasta ${clients.length} klientas(-ų)` });
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally { setScanning(false); }
  };

  const toggleRow = (i: number) => {
    if (duplicateInfo.has(i)) return;
    const s = new Set(selected);
    if (s.has(i)) s.delete(i); else s.add(i);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === importableIndexes.length) setSelected(new Set());
    else setSelected(new Set(importableIndexes));
  };

  const updateField = (i: number, field: keyof ExtractedClient, value: string) => {
    const next = [...extracted];
    next[i] = { ...next[i], [field]: value };
    setExtracted(next);
  };

  const applyBulkStatus = () => {
    const next = extracted.map((c, i) => selected.has(i) ? { ...c, status: bulkStatus } : c);
    setExtracted(next);
    toast({ title: "Priskirta", description: `${selected.size} klientas(-ų) priskirta kortelei „${statusConfig.find(s => s.value === bulkStatus)?.label}"` });
  };

  const applyStatusToAll = () => {
    const next = extracted.map((c) => ({ ...c, status: bulkStatus }));
    setExtracted(next);
    setSelected(new Set(importableIndexes));
    toast({ title: "Priskirta visiems", description: `${extracted.length} klientas(-ų) priskirta kortelei „${statusConfig.find(s => s.value === bulkStatus)?.label}"` });
  };

  const importSelected = async () => {
    const toInsert = extracted
      .filter((_, i) => selected.has(i) && !duplicateInfo.has(i))
      .filter((c) => (c.email || c.phone || c.name))
      .map((c) => ({
        name: c.name || null,
        email: c.email || "no-email@import",
        phone: c.phone || "",
        amount: c.amount || null,
        loan_type: c.loan_type || null,
        loan_period: c.loan_period || null,
        status: c.status || bulkStatus,
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
      setExtracted([]); setSelected(new Set());
      setFiles([]); setPreviews([]); setFreeText("");
      void loadSubmissions();
    } catch (e) {
      toast({ title: "Klaida", description: e instanceof Error ? e.message : "Nepavyko išsaugoti", variant: "destructive" });
    } finally { setImporting(false); }
  };

  const syncMeta = async () => {
    setMetaSyncing(true); setMetaResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("meta-leads-sync", {
        body: { hours: Number(metaHours) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMetaResult({ inserted: data.inserted, skipped: data.skipped, forms: data.forms });
      toast({ title: "Sinchronizuota", description: `Pridėta ${data.inserted}, praleista ${data.skipped}` });
      void loadSubmissions();
    } catch (e) {
      toast({ title: "Meta klaida", description: e instanceof Error ? e.message : "Nepavyko", variant: "destructive" });
    } finally { setMetaSyncing(false); }
  };

  // ============ REPORTS ============

  const reportRows = useMemo(() => {
    if (reportMode === "category") {
      return submissions.filter((s) => s.status === selectedCategory);
    }
    if (reportMode === "day") {
      return submissions.filter((s) => s.created_at.slice(0, 10) === selectedDate);
    }
    return [];
  }, [submissions, reportMode, selectedCategory, selectedDate]);

  const statusLabel = (v: string) => statusConfig.find((s) => s.value === v)?.label || v;

  // Build a PDF list (category or day) with each client's comments included.
  const buildListPDF = async (
    title: string,
    rows: SubmissionLite[],
    filename: string,
    commentsBySubmission: Record<string, { comment: string; created_at: string }[]>,
  ) => {
    const doc = new jsPDF();
    await applyLtFont(doc);
    const tableStyles = { font: PDF_FONT, fontSize: 8 } as const;
    const headStyles = { fillColor: [34, 139, 34] as [number, number, number], font: PDF_FONT, fontStyle: "bold" as const };

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(16);
    doc.text(title, 14, 18);
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Sugeneruota: ${new Date().toLocaleString("lt-LT")}  •  Viso: ${rows.length}`, 14, 25);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 32,
      head: [["Vardas", "Telefonas", "El. paštas", "Suma", "Tipas", "Statusas", "Data"]],
      body: rows.map((s) => [
        s.name || "-", s.phone, s.email, s.amount || "-",
        s.loan_type || "-", statusLabel(s.status),
        new Date(s.created_at).toLocaleDateString("lt-LT"),
      ]),
      styles: tableStyles,
      headStyles,
    });

    // Append per-client comments
    const withComments = rows.filter((r) => (commentsBySubmission[r.id] || []).length > 0);
    if (withComments.length > 0) {
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
      doc.setFont(PDF_FONT, "bold");
      doc.setFontSize(14);
      doc.text("Pastabos apie klientus", 14, finalY + 12);
      const body: string[][] = [];
      withComments.forEach((s) => {
        const cs = commentsBySubmission[s.id] || [];
        cs.forEach((c, idx) => {
          body.push([
            idx === 0 ? (s.name || s.email) : "",
            idx === 0 ? s.phone : "",
            new Date(c.created_at).toLocaleString("lt-LT"),
            c.comment,
          ]);
        });
      });
      autoTable(doc, {
        startY: finalY + 16,
        head: [["Klientas", "Telefonas", "Data", "Pastaba"]],
        body,
        styles: { ...tableStyles, fontSize: 9, cellPadding: 2 },
        headStyles,
        columnStyles: { 3: { cellWidth: "auto" } },
      });
    }

    doc.save(filename);
  };

  const buildListExcel = (sheetName: string, rows: SubmissionLite[], filename: string) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["Vardas", "Telefonas", "El. paštas", "Suma", "Paskolos tipas", "Terminas", "Statusas", "Šaltinis", "Sukurta"],
      ...rows.map((s) => [
        s.name || "-", s.phone, s.email, s.amount || "-",
        s.loan_type || "-", s.loan_period || "-",
        statusLabel(s.status), s.source || "-",
        new Date(s.created_at).toLocaleString("lt-LT"),
      ]),
    ]);
    ws["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, filename);
  };

  // Fetch comments for many submission IDs at once.
  const fetchCommentsFor = async (ids: string[]) => {
    const map: Record<string, { comment: string; created_at: string }[]> = {};
    if (ids.length === 0) return map;
    const { data } = await supabase
      .from("submission_comments")
      .select("submission_id,comment,created_at")
      .in("submission_id", ids)
      .order("created_at", { ascending: true });
    (data || []).forEach((c) => {
      const key = c.submission_id as string;
      (map[key] ||= []).push({ comment: c.comment, created_at: c.created_at });
    });
    return map;
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      if (reportMode === "client") {
        if (!selectedId) { toast({ title: "Pasirinkite klientą", variant: "destructive" }); return; }
        const s = submissions.find((x) => x.id === selectedId)!;
        const { data: comments } = await supabase
          .from("submission_comments").select("comment,created_at")
          .eq("submission_id", selectedId).order("created_at", { ascending: true });
        const doc = new jsPDF();
        await applyLtFont(doc);
        const tableStyles = { font: PDF_FONT, fontSize: 10 } as const;
        const headStyles = { fillColor: [34, 139, 34] as [number, number, number], font: PDF_FONT, fontStyle: "bold" as const };

        doc.setFont(PDF_FONT, "bold");
        doc.setFontSize(18);
        doc.text("Kliento ataskaita", 14, 20);
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Sugeneruota: ${new Date().toLocaleString("lt-LT")}`, 14, 27);
        doc.setTextColor(0);
        autoTable(doc, {
          startY: 35,
          head: [["Laukas", "Reikšmė"]],
          body: [
            ["Vardas", s.name || "-"], ["El. paštas", s.email], ["Telefonas", s.phone],
            ["Suma", s.amount || "-"], ["Paskolos tipas", s.loan_type || "-"],
            ["Terminas", s.loan_period || "-"], ["Statusas", statusLabel(s.status)],
            ["Šaltinis", s.source || "-"],
            ["Sukurta", new Date(s.created_at).toLocaleString("lt-LT")],
          ],
          styles: tableStyles,
          headStyles,
        });
        if (comments && comments.length > 0) {
          const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
          doc.setFont(PDF_FONT, "bold");
          doc.setFontSize(14);
          doc.text("Komentarai", 14, finalY + 12);
          autoTable(doc, {
            startY: finalY + 16,
            head: [["Data", "Komentaras"]],
            body: comments.map((c) => [new Date(c.created_at).toLocaleString("lt-LT"), c.comment]),
            styles: { ...tableStyles, fontSize: 9 },
            headStyles,
          });
        }
        doc.save(`klientas-${(s.name || s.email).replace(/[^a-z0-9]/gi, "_")}.pdf`);
      } else if (reportMode === "category") {
        const map = await fetchCommentsFor(reportRows.map((r) => r.id));
        await buildListPDF(`Kategorija: ${statusLabel(selectedCategory)}`, reportRows, `kategorija-${selectedCategory}.pdf`, map);
      } else if (reportMode === "day") {
        const map = await fetchCommentsFor(reportRows.map((r) => r.id));
        await buildListPDF(`Dienos ataskaita: ${selectedDate}`, reportRows, `diena-${selectedDate}.pdf`, map);
      } else if (reportMode === "comments") {
        const doc = new jsPDF();
        await applyLtFont(doc);
        const tableStyles = { font: PDF_FONT, fontSize: 9, cellPadding: 2 } as const;
        const headStyles = { fillColor: [34, 139, 34] as [number, number, number], font: PDF_FONT, fontStyle: "bold" as const };

        doc.setFont(PDF_FONT, "bold");
        doc.setFontSize(16);
        doc.text(`Pridėtos pastabos ${commentsDate}`, 14, 18);
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Sugeneruota: ${new Date().toLocaleString("lt-LT")}  •  Klientų: ${commentRows.length}`, 14, 25);
        doc.setTextColor(0);
        const body: string[][] = [];
        commentRows.forEach(({ submission: s, comments }) => {
          comments.forEach((c, idx) => {
            body.push([
              idx === 0 ? (s.name || s.email) : "",
              idx === 0 ? s.phone : "",
              idx === 0 ? statusLabel(s.status) : "",
              new Date(c.created_at).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" }),
              c.comment,
            ]);
          });
        });
        autoTable(doc, {
          startY: 32,
          head: [["Klientas", "Telefonas", "Kortelė", "Laikas", "Pastaba"]],
          body,
          styles: tableStyles,
          headStyles,
          columnStyles: { 4: { cellWidth: "auto" } },
        });
        doc.save(`pastabos-${commentsDate}.pdf`);
      }
      toast({ title: "PDF atsisiųsta" });
    } catch (e) {
      console.error(e);
      toast({ title: "Klaida generuojant PDF", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally { setExporting(false); }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      if (reportMode === "client") {
        if (!selectedId) { toast({ title: "Pasirinkite klientą", variant: "destructive" }); return; }
        const s = submissions.find((x) => x.id === selectedId)!;
        const { data: comments } = await supabase
          .from("submission_comments").select("comment,created_at")
          .eq("submission_id", selectedId).order("created_at", { ascending: true });
        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet([
          ["Laukas", "Reikšmė"],
          ["Vardas", s.name || "-"], ["El. paštas", s.email], ["Telefonas", s.phone],
          ["Suma", s.amount || "-"], ["Paskolos tipas", s.loan_type || "-"],
          ["Terminas", s.loan_period || "-"], ["Statusas", statusLabel(s.status)],
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
      } else if (reportMode === "category") {
        buildListExcel(statusLabel(selectedCategory), reportRows, `kategorija-${selectedCategory}.xlsx`);
      } else if (reportMode === "day") {
        buildListExcel(selectedDate, reportRows, `diena-${selectedDate}.xlsx`);
      } else if (reportMode === "comments") {
        const wb = XLSX.utils.book_new();
        const rows: (string | number)[][] = [["Klientas", "Telefonas", "El. paštas", "Kortelė", "Laikas", "Pastaba"]];
        commentRows.forEach(({ submission: s, comments }) => {
          comments.forEach((c) => {
            rows.push([
              s.name || "-", s.phone, s.email, statusLabel(s.status),
              new Date(c.created_at).toLocaleString("lt-LT"), c.comment,
            ]);
          });
        });
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(wb, ws, `Pastabos ${commentsDate}`.slice(0, 31));
        XLSX.writeFile(wb, `pastabos-${commentsDate}.xlsx`);
      }
      toast({ title: "Excel atsisiųsta" });
    } finally { setExporting(false); }
  };

  // ===== Bulk messaging =====
  const msgRecipients = useMemo(() => {
    const q = msgSearch.trim().toLowerCase();
    return submissions.filter((s) => {
      if (msgFilter !== "all" && s.status !== msgFilter) return false;
      if (q && !((s.name || "").toLowerCase().includes(q) || s.phone.includes(q) || s.email.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [submissions, msgFilter, msgSearch]);

  const msgChosen = useMemo(
    () => msgRecipients.filter((s) => msgSelected.has(s.id)),
    [msgRecipients, msgSelected]
  );

  const firstName = (full: string | null) => (full || "").trim().split(/\s+/)[0] || "";

  const renderMessage = (s: SubmissionLite) =>
    msgText.replace(/\{vardas\}/gi, firstName(s.name) || "kliente");

  const toggleMsg = (id: string) => {
    const n = new Set(msgSelected);
    n.has(id) ? n.delete(id) : n.add(id);
    setMsgSelected(n);
  };
  const toggleMsgAll = () => {
    if (msgChosen.length === msgRecipients.length) setMsgSelected(new Set());
    else setMsgSelected(new Set(msgRecipients.map((s) => s.id)));
  };

  const sendBulkSMS = () => {
    if (msgChosen.length === 0) return;
    // If message contains personalization, send one-by-one (open sequentially)
    const personalized = /\{vardas\}/i.test(msgText);
    if (personalized && msgChosen.length > 1) {
      toast({
        title: "Asmeniniai SMS",
        description: `Bus atidaryta ${msgChosen.length} SMS langų po vieną — paspauskite „Siųsti" kiekvienam.`,
      });
      msgChosen.forEach((s, idx) => {
        setTimeout(() => {
          const body = encodeURIComponent(renderMessage(s));
          const phone = s.phone.replace(/\s+/g, "");
          window.location.href = `sms:${phone}?body=${body}`;
        }, idx * 800);
      });
      return;
    }
    // Same message to all — comma-separated numbers
    const phones = msgChosen.map((s) => s.phone.replace(/\s+/g, "")).join(",");
    const body = encodeURIComponent(msgText.replace(/\{vardas\}/gi, "kliente"));
    window.location.href = `sms:${phones}?body=${body}`;
  };

  const sendBulkEmail = () => {
    const withEmail = msgChosen.filter((s) => s.email && !s.email.includes("no-email@"));
    if (withEmail.length === 0) {
      toast({ title: "Nėra el. paštų", description: "Pažymėti klientai neturi el. pašto", variant: "destructive" });
      return;
    }
    const personalized = /\{vardas\}/i.test(msgText);
    if (personalized && withEmail.length > 1) {
      toast({
        title: "Asmeniniai laiškai",
        description: `Bus atidaryta ${withEmail.length} laiškų po vieną.`,
      });
      withEmail.forEach((s, idx) => {
        setTimeout(() => {
          const body = encodeURIComponent(renderMessage(s));
          window.location.href = `mailto:${s.email}?subject=AutoPaskolos&body=${body}`;
        }, idx * 800);
      });
      return;
    }
    const bcc = withEmail.map((s) => s.email).join(",");
    const body = encodeURIComponent(msgText.replace(/\{vardas\}/gi, "kliente"));
    window.location.href = `mailto:?bcc=${bcc}&subject=AutoPaskolos&body=${body}`;
  };

  const copyPhones = async () => {
    const phones = msgChosen.map((s) => s.phone).join(", ");
    await navigator.clipboard.writeText(phones);
    toast({ title: "Nukopijuota", description: `${msgChosen.length} telefono numerių` });
  };

  const copyEmails = async () => {
    const emails = msgChosen.filter((s) => s.email && !s.email.includes("no-email@")).map((s) => s.email).join(", ");
    await navigator.clipboard.writeText(emails);
    toast({ title: "Nukopijuota", description: `${emails.split(",").filter(Boolean).length} el. paštų` });
  };


  return (
    <div className="space-y-4 mb-6">
      {/* Import card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Pridėti klientus į sistemą
          </CardTitle>
          <CardDescription>
            Iš nuotraukos, laisvo teksto arba iš Meta — pasirinkite kuriai kortelei priskirti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="image"><ScanLine className="h-4 w-4 mr-1.5" />Nuotrauka</TabsTrigger>
              <TabsTrigger value="text"><FileText className="h-4 w-4 mr-1.5" />Tekstas</TabsTrigger>
              <TabsTrigger value="meta"><Facebook className="h-4 w-4 mr-1.5" />Meta leads</TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-3 mt-4">
              {previews.length === 0 ? (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/30 transition">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Spauskite ir įkelkite vieną arba kelias nuotraukas</span>
                  <span className="text-xs text-muted-foreground">
                    Klientų sąrašai, dokumentai ar kitos nuotraukos su tekstu (iki 10MB vienam failui)
                  </span>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {previews.map((src, i) => (
                      <img key={`${files[i]?.name || "foto"}-${i}`} src={src} alt={`Peržiūra ${i + 1}`} className="w-full h-32 object-contain rounded-lg border bg-muted/30" />
                    ))}
                    <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-7 w-7" onClick={clearImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Pasirinkta failų: {files.length}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => scanImage("bulk")} disabled={scanning}>
                      {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                      Lentelė / keli
                    </Button>
                    <Button onClick={() => scanImage("single")} disabled={scanning} variant="outline">
                      {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanLine className="h-4 w-4 mr-2" />}
                      Vienas klientas
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-3 mt-4">
              <Textarea
                placeholder="Įklijuokite kelių klientų sąrašą arba padrikai parašykite apie kiekvieną — vardas, telefonas, suma, ko nori..."
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

            <TabsContent value="meta" className="space-y-3 mt-4">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm text-muted-foreground">
                Paspaudus „Sinchronizuoti" sistema parsisiųs naujausius lead'us iš Facebook formų. Pasikartojantys praleidžiami.
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{extracted.length} klientas(-ų)</Badge>
                  <span className="text-xs text-muted-foreground">Pažymėta {selected.size}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg bg-muted/40 border">
                <div className="flex-1 min-w-[180px] space-y-1">
                  <Label className="text-xs flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> Priskirti kortelei</Label>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusConfig.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={applyBulkStatus} disabled={selected.size === 0}>
                  Priskirti pažymėtiems ({selected.size})
                </Button>
                <Button variant="secondary" size="sm" onClick={applyStatusToAll} disabled={extracted.length === 0}>
                  Priskirti VISIEMS ({extracted.length})
                </Button>
                <Button onClick={importSelected} disabled={importing || selected.size === 0} size="sm">
                  {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Pridėti į sistemą ({selected.size})
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg max-h-[460px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 w-8">
                        <Checkbox
                          checked={selected.size === extracted.length && extracted.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                      <th className="p-2 text-left font-medium">Vardas</th>
                      <th className="p-2 text-left font-medium">Telefonas</th>
                      <th className="p-2 text-left font-medium">El. paštas</th>
                      <th className="p-2 text-left font-medium">Suma</th>
                      <th className="p-2 text-left font-medium">Tipas</th>
                      <th className="p-2 text-left font-medium">Kortelė</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extracted.map((c, i) => (
                      <tr key={i} className="border-t hover:bg-muted/20">
                        <td className="p-2">
                          <Checkbox checked={selected.has(i)} onCheckedChange={() => toggleRow(i)} />
                        </td>
                        <td className="p-1"><Input value={c.name || ""} onChange={(e) => updateField(i, "name", e.target.value)} className="h-8 text-sm" /></td>
                        <td className="p-1"><Input value={c.phone || ""} onChange={(e) => updateField(i, "phone", e.target.value)} className="h-8 text-sm" /></td>
                        <td className="p-1"><Input value={c.email || ""} onChange={(e) => updateField(i, "email", e.target.value)} className="h-8 text-sm" /></td>
                        <td className="p-1"><Input value={c.amount || ""} onChange={(e) => updateField(i, "amount", e.target.value)} className="h-8 text-sm w-24" /></td>
                        <td className="p-1"><Input value={c.loan_type || ""} onChange={(e) => updateField(i, "loan_type", e.target.value)} className="h-8 text-sm" /></td>
                        <td className="p-1">
                          <Select value={c.status || bulkStatus} onValueChange={(v) => updateField(i, "status", v)}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statusConfig.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
            <FileText className="h-5 w-5 text-primary" /> Ataskaitos
          </CardTitle>
          <CardDescription>PDF arba Excel — pagal klientą, kortelę/kategoriją arba dieną</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Tabs value={reportMode} onValueChange={(v) => setReportMode(v as typeof reportMode)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="client"><Users className="h-3.5 w-3.5 mr-1" />Klientas</TabsTrigger>
              <TabsTrigger value="category"><LayoutGrid className="h-3.5 w-3.5 mr-1" />Kortelė</TabsTrigger>
              <TabsTrigger value="day"><Calendar className="h-3.5 w-3.5 mr-1" />Diena</TabsTrigger>
              <TabsTrigger value="comments"><FileText className="h-3.5 w-3.5 mr-1" />Pastabos</TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="mt-3">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Pasirinkite klientą..." /></SelectTrigger>
                <SelectContent>
                  {submissions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{(s.name || s.email)} — {s.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="category" className="mt-3 space-y-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusConfig.map((s) => {
                    const count = submissions.filter((x) => x.status === s.value).length;
                    return <SelectItem key={s.value} value={s.value}>{s.label} ({count})</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Bus eksportuota {reportRows.length} klientas(-ų)</div>
            </TabsContent>

            <TabsContent value="day" className="mt-3 space-y-2">
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <div className="text-xs text-muted-foreground">Bus eksportuota {reportRows.length} klientas(-ų) iš {selectedDate}</div>
            </TabsContent>

            <TabsContent value="comments" className="mt-3 space-y-2">
              <Input type="date" value={commentsDate} onChange={(e) => setCommentsDate(e.target.value)} />
              <div className="text-xs text-muted-foreground">
                {loadingComments
                  ? "Įkeliama..."
                  : `Tą dieną pastaba pridėta ${commentRows.length} klientui(-ams) (iš viso ${commentRows.reduce((n, r) => n + r.comments.length, 0)} pastabų)`}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={exportPDF}
              disabled={exporting || (reportMode === "client" ? !selectedId : reportMode === "comments" ? commentRows.length === 0 : reportRows.length === 0)}
            >
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} PDF
            </Button>
            <Button
              onClick={exportExcel}
              disabled={exporting || (reportMode === "client" ? !selectedId : reportMode === "comments" ? commentRows.length === 0 : reportRows.length === 0)}
              variant="outline"
            >
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />} Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk messaging card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Masinės žinutės
          </CardTitle>
          <CardDescription>
            Pažymėkite klientus, parašykite žinutę ir siųskite SMS arba el. paštu visiems iš karto.
            Naudokite <code className="px-1 rounded bg-muted">{"{vardas}"}</code> personalizacijai.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Filtruoti pagal kortelę</Label>
              <Select value={msgFilter} onValueChange={(v) => { setMsgFilter(v); setMsgSelected(new Set()); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visi ({submissions.length})</SelectItem>
                  {statusConfig.map((s) => {
                    const count = submissions.filter((x) => x.status === s.value).length;
                    return <SelectItem key={s.value} value={s.value}>{s.label} ({count})</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Paieška</Label>
              <Input placeholder="Vardas, telefonas, el. paštas..." value={msgSearch} onChange={(e) => setMsgSearch(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Greitas pasirinkimas — visa kategorija</Label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={msgFilter === "all" ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => {
                  setMsgFilter("all");
                  setMsgSelected(new Set(submissions.map((s) => s.id)));
                }}
              >
                Visi ({submissions.length})
              </Button>
              {statusConfig.map((s) => {
                const ids = submissions.filter((x) => x.status === s.value).map((x) => x.id);
                if (ids.length === 0) return null;
                return (
                  <Button
                    key={s.value}
                    type="button"
                    size="sm"
                    variant={msgFilter === s.value ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => {
                      setMsgFilter(s.value);
                      setMsgSelected(new Set(ids));
                    }}
                  >
                    {s.label} ({ids.length})
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <Badge variant="secondary">Pažymėta {msgChosen.length} iš {msgRecipients.length}</Badge>
            <Button size="sm" variant="outline" onClick={toggleMsgAll}>
              {msgChosen.length === msgRecipients.length && msgRecipients.length > 0 ? "Atžymėti visus" : "Pažymėti visus"}
            </Button>
          </div>

          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="p-2 w-8"></th>
                  <th className="p-2 text-left font-medium">Vardas</th>
                  <th className="p-2 text-left font-medium">Telefonas</th>
                  <th className="p-2 text-left font-medium hidden sm:table-cell">El. paštas</th>
                </tr>
              </thead>
              <tbody>
                {msgRecipients.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">Nėra klientų pagal filtrą</td></tr>
                ) : msgRecipients.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-muted/20 cursor-pointer" onClick={() => toggleMsg(s.id)}>
                    <td className="p-2"><Checkbox checked={msgSelected.has(s.id)} onCheckedChange={() => toggleMsg(s.id)} /></td>
                    <td className="p-2">{s.name || "-"}</td>
                    <td className="p-2 tabular-nums">{s.phone}</td>
                    <td className="p-2 hidden sm:table-cell text-muted-foreground truncate max-w-[200px]">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Žinutės tekstas</Label>
            <Textarea rows={4} value={msgText} onChange={(e) => setMsgText(e.target.value)} className="text-sm" />
            <div className="text-xs text-muted-foreground">
              {msgText.length} simb. {/\{vardas\}/i.test(msgText) && "· Personalizuota — bus atidaroma po vieną žinutę"}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button onClick={sendBulkSMS} disabled={msgChosen.length === 0}>
              <MessageSquare className="h-4 w-4 mr-1" /> SMS ({msgChosen.length})
            </Button>
            <Button onClick={sendBulkEmail} disabled={msgChosen.length === 0} variant="outline">
              <Mail className="h-4 w-4 mr-1" /> El. paštu
            </Button>
            <Button onClick={copyPhones} disabled={msgChosen.length === 0} variant="outline">
              <Copy className="h-4 w-4 mr-1" /> Tel. nr.
            </Button>
            <Button onClick={copyEmails} disabled={msgChosen.length === 0} variant="outline">
              <Copy className="h-4 w-4 mr-1" /> El. paštai
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border">
            💡 SMS atidaro telefono žinučių programą su jau įrašytais numeriais. El. paštas atidaro Jūsų pašto programą su BCC laukeliu (gavėjai nemato vienas kito).
          </div>
        </CardContent>
      </Card>
    </div>

  );
}
