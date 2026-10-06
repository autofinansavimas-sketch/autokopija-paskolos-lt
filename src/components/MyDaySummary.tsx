import { useEffect, useState } from "react";
import { format, subHours } from "date-fns";
import { lt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DayStats {
  newToday: number;
  remindersToday: number;
  stale: number;
  completedWeek: number;
}

/** "Mano diena" — quick morning overview at the top of the admin board. */
export default function MyDaySummary() {
  const [stats, setStats] = useState<DayStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const today = format(new Date(), "yyyy-MM-dd");
        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const dayAgo = subHours(new Date(), 24).toISOString();

        const [newRes, remRes, staleRes, doneRes] = await Promise.all([
          supabase
            .from("contact_submissions")
            .select("id", { count: "exact", head: true })
            .is("deleted_at", null)
            .gte("created_at", `${today}T00:00:00`),
          supabase
            .from("call_reminders")
            .select("id", { count: "exact", head: true })
            .eq("call_date", today)
            .eq("completed", false),
          supabase
            .from("contact_submissions")
            .select("id", { count: "exact", head: true })
            .is("deleted_at", null)
            .neq("status", "completed")
            .lt("updated_at", dayAgo),
          supabase
            .from("contact_submissions")
            .select("id", { count: "exact", head: true })
            .is("deleted_at", null)
            .eq("status", "completed")
            .gte("updated_at", weekAgo),
        ]);

        setStats({
          newToday: newRes.count ?? 0,
          remindersToday: remRes.count ?? 0,
          stale: staleRes.count ?? 0,
          completedWeek: doneRes.count ?? 0,
        });
      } catch (e) {
        console.error("MyDaySummary error:", e);
      }
    })();
  }, []);

  if (!stats) return null;

  const items = [
    {
      icon: Sparkles,
      label: "Naujos šiandien",
      value: stats.newToday,
      tone: stats.newToday > 0 ? "text-primary" : "text-muted-foreground",
    },
    {
      icon: Bell,
      label: "Priminimai šiandien",
      value: stats.remindersToday,
      tone: stats.remindersToday > 0 ? "text-amber-600" : "text-muted-foreground",
    },
    {
      icon: AlertTriangle,
      label: "Be veiksmo 24+ val.",
      value: stats.stale,
      tone: stats.stale > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      icon: CheckCircle2,
      label: "Užbaigta per 7 d.",
      value: stats.completedWeek,
      tone: "text-green-600",
    },
  ];

  return (
    <Card className="mb-4 animate-fade-in">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Mano diena</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d", { locale: lt })}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map((it) => (
            <div
              key={it.label}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
            >
              <it.icon className={`h-4 w-4 shrink-0 ${it.tone}`} />
              <div className="min-w-0">
                <p className={`text-lg font-bold leading-none tabular-nums ${it.tone}`}>
                  {it.value}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{it.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
