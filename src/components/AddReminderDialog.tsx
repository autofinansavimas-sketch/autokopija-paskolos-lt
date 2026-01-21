import { useState } from "react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  submissionName: string | null;
  currentUserId: string | null;
  onReminderAdded?: () => void;
}

export default function AddReminderDialog({
  open,
  onOpenChange,
  submissionId,
  submissionName,
  currentUserId,
  onReminderAdded,
}: AddReminderDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [callTime, setCallTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const handleAddReminder = async () => {
    if (!selectedDate || !currentUserId) {
      toast({
        title: "Klaida",
        description: "Pasirinkite datą",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("call_reminders").insert({
        submission_id: submissionId,
        user_id: currentUserId,
        call_date: format(selectedDate, "yyyy-MM-dd"),
        call_time: callTime,
        notes: notes || null,
      });

      if (error) throw error;

      toast({ title: "Priminimas sukurtas" });
      
      // Reset form
      setSelectedDate(undefined);
      setCallTime("09:00");
      setNotes("");
      onOpenChange(false);
      onReminderAdded?.();
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti priminimo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Suplanuoti skambutį - {submissionName || "Klientas"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Date Picker */}
          <div>
            <label className="text-sm font-medium">Data</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "yyyy-MM-dd (EEEE)", { locale: lt })
                  ) : (
                    "Pasirinkite datą..."
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  locale={lt}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium">Laikas</label>
            <Input
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">Pastabos</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pvz.: Paklauti apie dokumentus, paskolos sąlygas..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button onClick={handleAddReminder} className="w-full" disabled={saving || !selectedDate}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Suplanuoti skambutį
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
