import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Phone, ArrowLeft, Facebook } from "lucide-react";

type DemoStatus = "new" | "contacted" | "done";

const STATUS_LABELS: Record<DemoStatus, string> = {
  new: "Nauja",
  contacted: "Susisiekta",
  done: "Užbaigta",
};

const STATUS_CLASSES: Record<DemoStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/30",
  contacted: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

type DemoComment = { id: string; text: string; at: string };

type DemoLead = {
  id: string;
  brand: "autokopers" | "autopaskolos";
  pageName: string;
  name: string;
  phone: string;
  email: string;
  formName: string;
  campaign: string;
  ad: string;
  platform: string;
  createdAt: string;
  status: DemoStatus;
  comments: DemoComment[];
};

const DEMO_LEADS: DemoLead[] = [
  {
    id: "demo-1",
    brand: "autokopers",
    pageName: "Auto Kopers LT (DEMO)",
    name: "DEMO Jonas Pavyzdinis",
    phone: "+370 600 00001 (DEMO)",
    email: "demo.jonas@example.com",
    formName: "DEMO – Automobilio finansavimas",
    campaign: "DEMO kampanija – Rugsėjis",
    ad: "DEMO reklama – Vaizdo įrašas A",
    platform: "Facebook",
    createdAt: "2026-09-10 10:12",
    status: "new",
    comments: [{ id: "c1", text: "DEMO komentaras: bandomasis įrašas.", at: "2026-09-10 10:20" }],
  },
  {
    id: "demo-2",
    brand: "autopaskolos",
    pageName: "Autopaskolos.lt (DEMO)",
    name: "DEMO Rasa Testinė",
    phone: "+370 600 00002 (DEMO)",
    email: "demo.rasa@example.com",
    formName: "DEMO – Vartojimo paskola",
    campaign: "DEMO kampanija – Refinansavimas",
    ad: "DEMO reklama – Karuselė B",
    platform: "Instagram",
    createdAt: "2026-09-11 09:03",
    status: "contacted",
    comments: [],
  },
  {
    id: "demo-3",
    brand: "autokopers",
    pageName: "Auto Kopers LT (DEMO)",
    name: "DEMO Petras Bandomasis",
    phone: "+370 600 00003 (DEMO)",
    email: "demo.petras@example.com",
    formName: "DEMO – Lizingas",
    campaign: "DEMO kampanija – Lizingas",
    ad: "DEMO reklama – Nuotrauka C",
    platform: "Facebook",
    createdAt: "2026-09-11 15:41",
    status: "done",
    comments: [{ id: "c2", text: "DEMO komentaras: byla uždaryta (testas).", at: "2026-09-11 16:00" }],
  },
  {
    id: "demo-4",
    brand: "autopaskolos",
    pageName: "Autopaskolos.lt (DEMO)",
    name: "DEMO Eglė Demonstracinė",
    phone: "+370 600 00004 (DEMO)",
    email: "demo.egle@example.com",
    formName: "DEMO – Paskola automobiliui",
    campaign: "DEMO kampanija – Rugsėjis",
    ad: "DEMO reklama – Vaizdo įrašas D",
    platform: "Facebook",
    createdAt: "2026-09-12 08:15",
    status: "new",
    comments: [],
  },
];

const MetaReview = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [brandFilter, setBrandFilter] = useState<"all" | "autokopers" | "autopaskolos">("all");
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin-login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("approved")
        .eq("user_id", session.user.id)
        .single();
      if (!profile?.approved) {
        navigate("/admin-login");
        return;
      }
      if (active) setAuthorized(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const filtered = useMemo(
    () => (brandFilter === "all" ? leads : leads.filter((l) => l.brand === brandFilter)),
    [leads, brandFilter]
  );

  const openLead = leads.find((l) => l.id === openId) || null;

  const setStatus = (id: string, status: DemoStatus) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

  const addComment = (id: string) => {
    const text = commentDraft.trim();
    if (!text) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              comments: [
                ...l.comments,
                { id: `${Date.now()}`, text: `DEMO: ${text}`, at: new Date().toISOString().slice(0, 16).replace("T", " ") },
              ],
            }
          : l
      )
    );
    setCommentDraft("");
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Kraunama…</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <Helmet>
        <title>Meta App Review demo | Autopaskolos.lt</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Atgal į admin
          </Link>
          <Badge variant="outline" className="gap-1">
            <Facebook className="h-3.5 w-3.5" /> Meta App Review
          </Badge>
        </div>

        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex gap-3 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Saugi Meta peržiūros demonstracija</p>
              <p className="text-muted-foreground">
                Visi čia rodomi vardai, telefonai, formos, kampanijos ir komentarai yra išgalvoti DEMO duomenys.
                Tikrų klientų, paraiškų ar Facebook lead'ų informacija šiame ekrane nerodoma ir nekeičiama.
                Statuso keitimai ir komentarai išlieka tik šioje naršyklės sesijoje.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {([
            ["all", "Visi"],
            ["autokopers", "Auto Kopers LT"],
            ["autopaskolos", "Autopaskolos.lt"],
          ] as const).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={brandFilter === key ? "default" : "outline"}
              onClick={() => setBrandFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((lead) => (
            <Card key={lead.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenId(lead.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{lead.name}</CardTitle>
                  <Badge variant="outline" className={STATUS_CLASSES[lead.status]}>
                    {STATUS_LABELS[lead.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{lead.pageName} · Facebook Lead Ads (DEMO)</p>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="tabular-nums">{lead.phone}</span>
                </p>
                <p className="text-muted-foreground">Forma: {lead.formName}</p>
                <p className="text-muted-foreground">
                  Kilmė: {lead.campaign} · {lead.ad} · {lead.platform}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lead.createdAt} · komentarų: {lead.comments.length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!openLead} onOpenChange={(o) => !o && setOpenId(null)}>
          <DialogContent className="max-w-lg">
            {openLead && (
              <>
                <DialogHeader>
                  <DialogTitle>{openLead.name} · DEMO</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="rounded-md border p-3 space-y-1">
                    <p><span className="text-muted-foreground">Puslapis: </span>{openLead.pageName}</p>
                    <p><span className="text-muted-foreground">Forma: </span>{openLead.formName}</p>
                    <p><span className="text-muted-foreground">Telefonas: </span>{openLead.phone}</p>
                    <p><span className="text-muted-foreground">El. paštas: </span>{openLead.email}</p>
                    <p><span className="text-muted-foreground">Kampanija: </span>{openLead.campaign}</p>
                    <p><span className="text-muted-foreground">Reklama: </span>{openLead.ad}</p>
                    <p><span className="text-muted-foreground">Platforma: </span>{openLead.platform}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Statusas (tik demonstracinis)</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(STATUS_LABELS) as DemoStatus[]).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={openLead.status === s ? "default" : "outline"}
                          onClick={() => setStatus(openLead.id, s)}
                        >
                          {STATUS_LABELS[s]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Komentarai (tik demonstraciniai)</p>
                    <div className="space-y-2">
                      {openLead.comments.length === 0 && (
                        <p className="text-muted-foreground">Kol kas nėra demonstracinių komentarų.</p>
                      )}
                      {openLead.comments.map((c) => (
                        <div key={c.id} className="rounded-md bg-muted/50 p-2">
                          <p>{c.text}</p>
                          <p className="text-xs text-muted-foreground">{c.at}</p>
                        </div>
                      ))}
                    </div>
                    <Textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Įrašykite demonstracinį komentarą…"
                      className="text-base"
                    />
                    <Button size="sm" onClick={() => addComment(openLead.id)}>
                      Pridėti demonstracinį komentarą
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Šie veiksmai nieko neišsaugo duomenų bazėje ir neturi įtakos tikriems klientams.
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MetaReview;
