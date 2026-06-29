import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPERATORS, type Operator } from "@/hooks/use-operator";
import { format } from "date-fns";

interface Row {
  operator: string;
  seconds: number;
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

export default function OperatorTimeStats() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("operator_time")
        .select("operator, seconds")
        .eq("date", today);
      if (error) throw error;
      setRows((data as Row[]) || []);
    } catch (err) {
      console.warn("Failed to load operator time", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchToday();
    const onUpdate = () => void fetchToday();
    window.addEventListener("operator-time-updated", onUpdate);
    const interval = setInterval(fetchToday, 60_000);
    return () => {
      window.removeEventListener("operator-time-updated", onUpdate);
      clearInterval(interval);
    };
  }, [fetchToday]);

  const totalsByOperator = OPERATORS.map((op) => ({
    operator: op,
    seconds: rows.find((r) => r.operator === op)?.seconds ?? 0,
  }));

  return (
    <Card className="mt-6 border-0 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Šiandien online sistemoje
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchToday}
          disabled={loading}
          className="h-7 w-7 p-0"
          title="Atnaujinti"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
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
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Skaičiuojama tik kai admin langas atidarytas ir aktyvus. Atnaujinama kas minutę.
        </p>
      </CardContent>
    </Card>
  );
}
