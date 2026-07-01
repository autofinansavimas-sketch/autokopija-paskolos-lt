import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPERATORS, type Operator } from "@/hooks/use-operator";
import { format, subDays } from "date-fns";
import { lt } from "date-fns/locale";

interface Row {
  operator: string;
  seconds: number;
  date: string;
}

const formatDuration = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h === 0 && m === 0) return "—";
  if (h === 0) return `${m} min`;
  return `${h} val ${m.toString().padStart(2, "0")} min`;
};

const operatorColor: Record<Operator, string> = {
  Aivaras: "text-blue-500 bg-blue-500/10",
  Paulina: "text-pink-500 bg-pink-500/10",
};

type RangeKey = "today" | "7d";

export default function OperatorTimeStats() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<RangeKey>("today");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const from = range === "today" ? today : subDays(today, 6);
      const fromStr = format(from, "yyyy-MM-dd");
      const toStr = format(today, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("operator_time")
        .select("operator, seconds, date")
        .gte("date", fromStr)
        .lte("date", toStr)
        .order("date", { ascending: false });
      if (error) throw error;
      setRows((data as Row[]) || []);
    } catch (err) {
      console.warn("Failed to load operator time", err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void fetchData();
    const onUpdate = () => void fetchData();
    window.addEventListener("operator-time-updated", onUpdate);
    const interval = setInterval(fetchData, 60_000);
    return () => {
      window.removeEventListener("operator-time-updated", onUpdate);
      clearInterval(interval);
    };
  }, [fetchData]);

  const totalsByOperator = useMemo(
    () =>
      OPERATORS.map((op) => ({
        operator: op,
        seconds: rows
          .filter((r) => r.operator === op)
          .reduce((sum, r) => sum + (r.seconds || 0), 0),
      })),
    [rows]
  );

  // Per-day breakdown (only for 7d)
  const perDay = useMemo(() => {
    if (range !== "7d") return [];
    const today = new Date();
    const days: { date: string; label: string; totals: Record<string, number> }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const totals: Record<string, number> = {};
      OPERATORS.forEach((op) => {
        totals[op] = rows
          .filter((r) => r.date === dateStr && r.operator === op)
          .reduce((s, r) => s + (r.seconds || 0), 0);
      });
      days.push({
        date: dateStr,
        label: format(d, "EEE d", { locale: lt }),
        totals,
      });
    }
    return days;
  }, [rows, range]);

  return (
    <Card className="mt-6 border-0 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {range === "today" ? "Šiandien online sistemoje" : "Paskutinės 7 dienos"}
        </CardTitle>
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-md border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setRange("today")}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                range === "today" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Šiandien
            </button>
            <button
              type="button"
              onClick={() => setRange("7d")}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                range === "7d" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              7 dienos
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-7 w-7 p-0"
            title="Atnaujinti"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {totalsByOperator.map(({ operator, seconds }) => {
            const color = operatorColor[operator as Operator] || "text-primary bg-primary/10";
            return (
              <div
                key={operator}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${color}`}>
                  {operator[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{operator}</p>
                  <p className="text-lg font-bold tabular-nums">{formatDuration(seconds)}</p>
                  {range === "7d" && (
                    <p className="text-[11px] text-muted-foreground">Viso per 7 d.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {range === "7d" && perDay.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="py-1.5 pr-2 font-medium">Diena</th>
                  {OPERATORS.map((op) => (
                    <th key={op} className="py-1.5 px-2 font-medium text-right">{op}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perDay.map((d) => (
                  <tr key={d.date} className="border-t border-muted/50">
                    <td className="py-1.5 pr-2 capitalize">{d.label}</td>
                    {OPERATORS.map((op) => (
                      <td key={op} className="py-1.5 px-2 text-right tabular-nums">
                        {formatDuration(d.totals[op] || 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-3">
          Skaičiuojama tik kai admin langas atidarytas ir aktyvus. Atnaujinama kas minutę.
        </p>
      </CardContent>
    </Card>
  );
}
