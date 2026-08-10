import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OPERATORS, useOperator } from "@/hooks/use-operator";
import { CheckSquare, Plus, Trash2, User, CalendarDays, Flag } from "lucide-react";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: string;
  done: boolean;
  created_by_operator: string | null;
  created_at: string;
};

const PRIORITIES = [
  { value: "high", label: "Aukštas", cls: "bg-red-100 text-red-700 border-red-200" },
  { value: "normal", label: "Normalus", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "low", label: "Žemas", cls: "bg-muted text-muted-foreground border-border" },
];

export const TodoList = () => {
  const { operator } = useOperator();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [assignee, setAssignee] = useState<string>(operator ?? OPERATORS[0]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("normal");
  const [view, setView] = useState<"mine" | "all">("mine");
  const [showDone, setShowDone] = useState(false);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Nepavyko užkrauti darbų", description: error.message, variant: "destructive" });
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (operator) setAssignee(operator);
  }, [operator]);

  const addTask = async () => {
    if (!title.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("admin_tasks").insert({
      title: title.trim(),
      notes: notes.trim() || null,
      assignee,
      due_date: dueDate || null,
      priority,
      created_by: userData.user?.id ?? null,
      created_by_operator: operator ?? null,
    });
    if (error) {
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setNotes("");
    setDueDate("");
    setPriority("normal");
    toast({ title: "Darbas pridėtas", description: `Priskirta: ${assignee}` });
    fetchTasks();
  };

  const toggleDone = async (task: Task) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, done: !t.done } : t)));
    const { error } = await supabase
      .from("admin_tasks")
      .update({ done: !task.done, completed_at: !task.done ? new Date().toISOString() : null })
      .eq("id", task.id);
    if (error) {
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
      fetchTasks();
    }
  };

  const reassign = async (task: Task, who: string) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, assignee: who } : t)));
    const { error } = await supabase.from("admin_tasks").update({ assignee: who }).eq("id", task.id);
    if (error) {
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
      fetchTasks();
    }
  };

  const removeTask = async (id: string) => {
    const { error } = await supabase.from("admin_tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Negalima ištrinti", description: error.message, variant: "destructive" });
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const visible = useMemo(() => {
    return tasks.filter(t => {
      if (!showDone && t.done) return false;
      if (view === "mine" && operator && t.assignee !== operator) return false;
      return true;
    });
  }, [tasks, view, showDone, operator]);

  const openCount = (who: string) => tasks.filter(t => !t.done && t.assignee === who).length;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-primary" />
            Naujas darbas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Ką reikia padaryti?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) addTask();
            }}
            className="text-base"
          />
          <Textarea
            placeholder="Pastabos (nebūtina)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="text-base"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Darbuotojas" />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map(op => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioritetas" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="text-base" />
          </div>
          <Button onClick={addTask} disabled={!title.trim()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Pridėti darbą
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={view === "mine" ? "default" : "outline"} onClick={() => setView("mine")}>
          <User className="h-3.5 w-3.5 mr-1" />
          Mano darbai {operator ? `(${operator})` : ""}
        </Button>
        <Button size="sm" variant={view === "all" ? "default" : "outline"} onClick={() => setView("all")}>
          Visi darbai
        </Button>
        <Button size="sm" variant={showDone ? "default" : "outline"} onClick={() => setShowDone(v => !v)}>
          Rodyti atliktus
        </Button>
        <div className="ml-auto flex gap-2">
          {OPERATORS.map(op => (
            <Badge key={op} variant="outline" className="text-xs">
              {op}: {openCount(op)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Kraunama…</p>}
        {!loading && visible.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">Darbų nėra 🎉</p>
        )}
        {visible.map(task => {
          const p = PRIORITIES.find(x => x.value === task.priority) ?? PRIORITIES[1];
          const overdue = !task.done && task.due_date && task.due_date < todayStr;
          return (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border bg-card ${
                overdue ? "border-red-300 bg-red-50/50" : "border-border"
              }`}
            >
              <Checkbox checked={task.done} onCheckedChange={() => toggleDone(task)} className="mt-1" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium break-words ${task.done ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                {task.notes && <p className="text-xs text-muted-foreground mt-0.5 break-words">{task.notes}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-[10px] ${p.cls}`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {p.label}
                  </Badge>
                  {task.due_date && (
                    <Badge variant="outline" className={`text-[10px] ${overdue ? "text-red-600 border-red-300" : ""}`}>
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {task.due_date}
                    </Badge>
                  )}
                  {task.created_by_operator && (
                    <span className="text-[10px] text-muted-foreground">sukūrė {task.created_by_operator}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Select value={task.assignee ?? ""} onValueChange={v => reassign(task, v)}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Priskirti" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
