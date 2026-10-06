import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { OPERATORS } from "@/hooks/use-operator";

interface OpStats {
  operator: string;
  completedWeek: number;
  completedMonth: number;
  minutesWeek: number;
}

/** Per-operator productivity: completed deals + tracked online time. */
export default function OperatorStats() {
  const [rows, setRows] = useState<OpStats[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        const weekAgoDate = weekAgo.toISOString().slice(0, 10);

        const [subsRes, timeRes] = await Promise.all([
          supabase
            .from("contact_submissions")
            .select("assigned_to, updated_at")
            .eq("status", "completed")
            .is("deleted_at", null)
            .not("assigned_to", "is", null)
            .gte("updated_at", monthAgo.toISOString()),
          supabase
            .from("operator_time")
            .select("operator, seconds")
            .gte("date", weekAgoDate),
        ]);

        const stats: OpStats[] = OPERATORS.map((op) => {
          const subs = (subsRes.data || []).filter((s) => s.assigned_to === op);
          const seconds = (timeRes.data || [])
            .filter((t) => t.operator === op)
            .reduce((sum, t) => sum + (t.seconds || 0), 0);
          return {
            operator: op,
            completedWeek: subs.filter((s) => s.updated_at >= weekAgo.toISOString()).length,
            completedMonth: subs.length,
            minutesWeek: Math.round(seconds / 60),
          };
        });

        setRows(stats);
      } catch (e) {
        console.error("OperatorStats error:", e);
      }
    })();
  }, []);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Darbuotojų statistika
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.operator} className="rounded-lg border p-3 space-y-1.5">
              <p className="font-semibold text-sm">{r.operator}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold tabular-nums text-green-600">{r.completedWeek}</p>
                  <p className="text-[10px] text-muted-foreground">Užbaigta / 7 d.</p>
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums">{r.completedMonth}</p>
                  <p className="text-[10px] text-muted-foreground">Užbaigta / 30 d.</p>
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums text-primary">{r.minutesWeek}</p>
                  <p className="text-[10px] text-muted-foreground">Min. sistemoje / 7 d.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
