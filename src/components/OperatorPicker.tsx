import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, ArrowLeftRight } from "lucide-react";
import { OPERATORS, useOperator, type Operator } from "@/hooks/use-operator";
import { useToast } from "@/hooks/use-toast";

const COLOR_MAP: Record<string, string> = {
  Aivaras: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Paulina: "bg-pink-500/15 text-pink-700 border-pink-500/30",
};

export function OperatorBadge({ name, className = "" }: { name: string; className?: string }) {
  const color = COLOR_MAP[name] || "bg-muted text-foreground border-border";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color} ${className}`}
    >
      <UserCircle2 className="h-3 w-3" />
      {name}
    </span>
  );
}

export function OperatorPicker() {
  const { operator, setOperator } = useOperator();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!operator) setOpen(true);
  }, [operator]);

  const handlePick = (op: Operator) => {
    setOperator(op);
    setOpen(false);
    toast({ title: `Dirba: ${op}`, description: "Komentarai bus pažymėti tavo vardu." });
  };

  return (
    <>
      {/* Forced picker on first load */}
      <Dialog open={open && !operator} onOpenChange={() => { /* no close until picked */ }}>
        <DialogContent
          className="max-w-sm"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Kas šiandien dirba?</DialogTitle>
            <DialogDescription>
              Pasirink savo vardą — visi tavo komentarai bus pažymėti šiuo vardu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {OPERATORS.map((op) => (
              <Button
                key={op}
                size="lg"
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground"
                onClick={() => handlePick(op)}
              >
                <UserCircle2 className="h-7 w-7" />
                <span className="font-semibold">{op}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Switcher in header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5">
            <OperatorBadge name={operator || "?"} className="!px-1 !py-0" />
            <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Šiuo metu dirba</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {OPERATORS.map((op) => (
            <DropdownMenuItem
              key={op}
              onClick={() => handlePick(op)}
              className={op === operator ? "bg-muted font-semibold" : ""}
            >
              <UserCircle2 className="h-4 w-4 mr-2" />
              {op}
              {op === operator && <Badge variant="secondary" className="ml-auto text-[10px]">aktyvus</Badge>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
