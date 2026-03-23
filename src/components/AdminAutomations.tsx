import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  Bell,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface Submission {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  source?: string | null;
}

interface Reminder {
  id: string;
  submission_id: string | null;
  completed: boolean;
}

interface AdminAutomationsProps {
  submissions: Submission[];
  reminders: Reminder[];
  currentUserId: string | null;
  onRefresh: () => void;
}

const FOLLOW_UP_SMS = `Sveiki,

Gavome jūsų užklausą ir nekantraujame jums padėti.

Bandėme su jumis susisiekti, tačiau nesėkmingai.

Labai lauksime jūsų skambučio arba žinutės kada galime jums paskambinti.

"AUTOPASKOLOS.LT" komanda`;

export default function AdminAutomations({ submissions, reminders, currentUserId, onRefresh }: AdminAutomationsProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoFollowUpEnabled, setAutoFollowUpEnabled] = useState(() => {
    return localStorage.getItem("auto_followup_enabled") === "true";
  });

  // Detect stale submissions (new status, no contact for 3+ days, no reminders)
  const staleSubmissions = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return submissions.filter(s => {
      if (s.status !== "new") return false;
      const created = new Date(s.created_at);
      if (created >= threeDaysAgo) return false;
      const hasReminder = reminders.some(r => r.submission_id === s.id && !r.completed);
      return !hasReminder;
    });
  }, [submissions, reminders]);

  // Detect submissions that have been "contacted" for more than 7 days without completion
  const longContactedSubmissions = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return submissions.filter(s => {
      if (s.status !== "contacted") return false;
      const created = new Date(s.created_at);
      return created < weekAgo;
    });
  }, [submissions]);

  // Today's unhandled new submissions
  const todayNewSubmissions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return submissions.filter(s => {
      if (s.status !== "new") return false;
      const created = new Date(s.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    });
  }, [submissions]);

  const handleAutoCreateReminders = async () => {
    if (!currentUserId || staleSubmissions.length === 0) return;
    setProcessing("auto-reminders");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const remindersToCreate = staleSubmissions.map((s, i) => ({
        submission_id: s.id,
        user_id: currentUserId,
        call_date: dateStr,
        call_time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15 || "00"}`,
        notes: `Auto: Nėra kontakto 3+ d. (${s.name || s.phone})`,
      }));

      const { error } = await supabase.from("call_reminders").insert(remindersToCreate);
      if (error) throw error;

      toast({
        title: `✅ Sukurta ${remindersToCreate.length} priminimai`,
        description: `Priminimai suplanuoti rytojui (${dateStr})`,
      });
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({ title: "Klaida", description: "Nepavyko sukurti priminimų", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    setProcessing("bulk-status");
    try {
      for (const id of ids) {
        await supabase.from("contact_submissions").update({ status: newStatus }).eq("id", id);
      }
      toast({ title: `✅ Atnaujinta ${ids.length} paraiškų`, description: `Būsena pakeista į "${newStatus}"` });
      onRefresh();
    } catch (error) {
      toast({ title: "Klaida", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const toggleAutoFollowUp = (enabled: boolean) => {
    setAutoFollowUpEnabled(enabled);
    localStorage.setItem("auto_followup_enabled", String(enabled));
    toast({
      title: enabled ? "✅ Auto follow-up įjungtas" : "Auto follow-up išjungtas",
      description: enabled
        ? "Kai užklausa neturi kontakto 3+ dienas, automatiškai bus sukurtas priminimas"
        : "Automatiniai priminimai išjungti",
    });
  };

  // Auto follow-up effect
  useEffect(() => {
    if (!autoFollowUpEnabled || !currentUserId || staleSubmissions.length === 0) return;

    const autoCreatedKey = "auto_followup_last_run";
    const lastRun = localStorage.getItem(autoCreatedKey);
    const today = new Date().toISOString().split("T")[0];

    if (lastRun === today) return; // Already ran today

    // Auto-create reminders for stale submissions
    const autoCreate = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const newReminders = staleSubmissions.slice(0, 10).map((s, i) => ({
        submission_id: s.id,
        user_id: currentUserId,
        call_date: dateStr,
        call_time: `${9 + Math.floor(i / 4)}:${String((i % 4) * 15).padStart(2, "0")}`,
        notes: `Auto follow-up: 3+ d. be kontakto`,
      }));

      const { error } = await supabase.from("call_reminders").insert(newReminders);
      if (!error) {
        localStorage.setItem(autoCreatedKey, today);
        toast({
          title: `🤖 Auto: Sukurta ${newReminders.length} priminimai`,
          description: "Automatiškai suplanuoti follow-up skambučiai rytojui",
        });
        onRefresh();
      }
    };

    autoCreate();
  }, [autoFollowUpEnabled, currentUserId, staleSubmissions]);

  const automationCards = [
    {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      title: "Nėra kontakto 3+ dienos",
      description: `${staleSubmissions.length} užklausa(-os) laukia dėmesio`,
      count: staleSubmissions.length,
      action: staleSubmissions.length > 0 ? (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={processing === "auto-reminders"}
          onClick={handleAutoCreateReminders}
        >
          {processing === "auto-reminders" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
          Sukurti priminimus rytojui
        </Button>
      ) : null,
    },
    {
      icon: Clock,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      title: 'Ilgai "Susisiekta" b\u016Bsenoje',
      description: `${longContactedSubmissions.length} užklausa(-os) jau 7+ dienos`,
      count: longContactedSubmissions.length,
      action: longContactedSubmissions.length > 0 ? (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={processing === "bulk-status"}
          onClick={() => handleBulkStatusChange(longContactedSubmissions.map(s => s.id), "completed")}
        >
          {processing === "bulk-status" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          Pažymėti kaip užbaigtas
        </Button>
      ) : null,
    },
    {
      icon: Zap,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Šiandienos naujos užklausos",
      description: `${todayNewSubmissions.length} nauja(-os) užklausa(-os) šiandien`,
      count: todayNewSubmissions.length,
      action: null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Auto Follow-Up Toggle */}
      <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Auto Follow-Up</h3>
                <p className="text-xs text-muted-foreground">
                  Automatiškai kurti priminimus kai nėra kontakto 3+ dienas
                </p>
              </div>
            </div>
            <Switch checked={autoFollowUpEnabled} onCheckedChange={toggleAutoFollowUp} />
          </div>
        </CardContent>
      </Card>

      {/* Automation Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {automationCards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}>
                    <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{card.title}</h4>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </div>
                {card.count > 0 && (
                  <Badge variant="secondary" className="text-xs font-bold">
                    {card.count}
                  </Badge>
                )}
              </div>
              {card.action && <div className="pt-1">{card.action}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stale Submissions List */}
      {staleSubmissions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Reikalauja dėmesio
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {staleSubmissions.map(s => {
                const daysAgo = Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{s.name || "Nežinomas"}</p>
                        <p className="text-xs text-muted-foreground">{s.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                        {daysAgo}d
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => window.location.href = `tel:${s.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          const encodedMessage = encodeURIComponent(FOLLOW_UP_SMS);
                          const cleanPhone = s.phone.replace(/[^\d+]/g, "");
                          window.location.href = `sms:${cleanPhone}?body=${encodedMessage}`;
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
