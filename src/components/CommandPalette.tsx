import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Phone, Mail, User as UserIcon, LayoutDashboard, Users, Calendar, Trash2, Zap } from "lucide-react";

interface Submission {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  loan_amount: number | null;
}

interface Props {
  submissions: Submission[];
  onOpenSubmission: (s: Submission) => void;
  onSwitchTab: (tab: string) => void;
  statusLabelFor: (status: string) => string;
}

export default function CommandPalette({ submissions, onOpenSubmission, onSwitchTab, statusLabelFor }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return submissions.slice(0, 8);
    const q = query.toLowerCase().trim();
    return submissions
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [submissions, query]);

  const handle = (fn: () => void) => {
    fn();
    setOpen(false);
    setQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Ieškoti kliento (vardas, telefonas, el. paštas)... arba komandos"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nieko nerasta.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading={query ? "Klientai" : "Naujausi klientai"}>
            {results.map((s) => (
              <CommandItem
                key={s.id}
                value={`${s.name || ""} ${s.phone || ""} ${s.email || ""} ${s.id}`}
                onSelect={() => handle(() => onOpenSubmission(s))}
              >
                <UserIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate font-medium">{s.name || "Be vardo"}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {s.phone || "—"} · {s.email || "—"} · {statusLabelFor(s.status || "")}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Greitos komandos">
          <CommandItem onSelect={() => handle(() => onSwitchTab("kanban"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Kanban lenta
          </CommandItem>
          <CommandItem onSelect={() => handle(() => onSwitchTab("automations"))}>
            <Zap className="mr-2 h-4 w-4" />
            Automatizacijos
          </CommandItem>
          <CommandItem onSelect={() => handle(() => onSwitchTab("calendar"))}>
            <Calendar className="mr-2 h-4 w-4" />
            Kalendorius
          </CommandItem>
          <CommandItem onSelect={() => handle(() => onSwitchTab("trash"))}>
            <Trash2 className="mr-2 h-4 w-4" />
            Šiukšlinė
          </CommandItem>
          <CommandItem onSelect={() => handle(() => onSwitchTab("users"))}>
            <Users className="mr-2 h-4 w-4" />
            Vartotojai / Statistika
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
