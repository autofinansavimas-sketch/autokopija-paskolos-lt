import { useState, useEffect, useRef, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, addMonths, subMonths } from "date-fns";
import { lt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Plus,
  Loader2,
  Bell,
  BellRing,
  Trash2,
  Volume2,
  VolumeX,
  User,
  Clock,
} from "lucide-react";

interface Submission {
  id: string;
  name: string | null;
  email: string;
  phone: string;
}

interface CallReminder {
  id: string;
  submission_id: string | null;
  user_id: string;
  call_date: string;
  call_time: string;
  notes: string | null;
  completed: boolean;
  created_at: string;
  submission?: Submission | null;
}

interface CallCalendarProps {
  submissions: Submission[];
  currentUserId: string | null;
}

// Notification sound - simple beep using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  } catch (e) {
    console.error("Could not play notification sound:", e);
  }
};

export default function CallCalendar({ submissions, currentUserId }: CallCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reminders, setReminders] = useState<CallReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("call_reminder_sound");
    return saved !== "false";
  });
  const [activeReminders, setActiveReminders] = useState<CallReminder[]>([]);
  const [newReminder, setNewReminder] = useState({
    submission_id: "",
    call_time: "09:00",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const checkedRemindersRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    try {
      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      // Query without join since we'll fetch submission data separately
      const { data, error } = await supabase
        .from("call_reminders")
        .select("*")
        .gte("call_date", startDate)
        .lte("call_date", endDate)
        .order("call_date", { ascending: true })
        .order("call_time", { ascending: true });

      if (error) throw error;

      // Map submission data from props
      const remindersWithSubmissions = (data || []).map(reminder => ({
        ...reminder,
        submission: submissions.find(s => s.id === reminder.submission_id) || null
      }));

      setReminders(remindersWithSubmissions);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, submissions]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Check for upcoming reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const currentTime = format(now, "HH:mm");

      const upcomingReminders = reminders.filter(r => {
        if (r.completed) return false;
        if (r.call_date !== today) return false;
        
        // Check if reminder time is within 1 minute of current time
        const [rHour, rMin] = r.call_time.split(":").map(Number);
        const [cHour, cMin] = currentTime.split(":").map(Number);
        const reminderMinutes = rHour * 60 + rMin;
        const currentMinutes = cHour * 60 + cMin;
        
        return reminderMinutes >= currentMinutes && reminderMinutes <= currentMinutes + 1;
      });

      // Filter out already notified reminders
      const newActiveReminders = upcomingReminders.filter(
        r => !checkedRemindersRef.current.has(r.id)
      );

      if (newActiveReminders.length > 0) {
        newActiveReminders.forEach(r => checkedRemindersRef.current.add(r.id));
        setActiveReminders(prev => [...prev, ...newActiveReminders]);
        
        if (soundEnabled) {
          playNotificationSound();
        }

        // Show toast notification
        newActiveReminders.forEach(r => {
          toast({
            title: "🔔 Laikas paskambinti!",
            description: r.submission?.name || r.submission?.phone || "Priminimas",
          });
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [reminders, soundEnabled, toast]);

  // Toggle sound
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("call_reminder_sound", String(newValue));
    
    // Play test sound when enabling
    if (newValue) {
      playNotificationSound();
    }
  };

  // Add reminder
  const handleAddReminder = async () => {
    if (!selectedDate || !currentUserId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("call_reminders")
        .insert({
          submission_id: newReminder.submission_id === "none" ? null : (newReminder.submission_id || null),
          user_id: currentUserId,
          call_date: format(selectedDate, "yyyy-MM-dd"),
          call_time: newReminder.call_time,
          notes: newReminder.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const reminderWithSubmission: CallReminder = {
        ...data,
        submission: submissions.find(s => s.id === data.submission_id) || null
      };

      setReminders(prev => [...prev, reminderWithSubmission].sort((a, b) => {
        if (a.call_date !== b.call_date) return a.call_date.localeCompare(b.call_date);
        return a.call_time.localeCompare(b.call_time);
      }));

      setNewReminder({ submission_id: "", call_time: "09:00", notes: "" });
      setAddDialogOpen(false);

      toast({ title: "Priminimas sukurtas" });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti priminimo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle completed
  const handleToggleCompleted = async (reminder: CallReminder) => {
    try {
      const { error } = await supabase
        .from("call_reminders")
        .update({ completed: !reminder.completed })
        .eq("id", reminder.id);

      if (error) throw error;

      setReminders(prev =>
        prev.map(r => r.id === reminder.id ? { ...r, completed: !r.completed } : r)
      );

      // Remove from active reminders if completed
      if (!reminder.completed) {
        setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      }
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti priminimo",
        variant: "destructive",
      });
    }
  };

  // Delete reminder
  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;

    try {
      const { error } = await supabase
        .from("call_reminders")
        .delete()
        .eq("id", reminderToDelete);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== reminderToDelete));
      setActiveReminders(prev => prev.filter(r => r.id !== reminderToDelete));
      setDeleteDialogOpen(false);
      setReminderToDelete(null);

      toast({ title: "Priminimas ištrintas" });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti priminimo",
        variant: "destructive",
      });
    }
  };

  // Get reminders for a specific date
  const getRemindersForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return reminders.filter(r => r.call_date === dateStr);
  };

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = monthStart.getDay();
  // Adjust for Monday start (European calendar)
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weekDays = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];

  return (
    <div className="space-y-4">
      {/* Active Reminders Banner */}
      {activeReminders.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/30 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BellRing className="h-6 w-6 text-orange-500 animate-bounce" />
              <div className="flex-1">
                <p className="font-semibold text-orange-700 dark:text-orange-300">
                  Laikas paskambinti!
                </p>
                <div className="space-y-1 mt-2">
                  {activeReminders.map(r => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">
                          {r.submission?.name || r.submission?.phone || "Priminimas"}
                        </span>
                        {r.submission?.phone && (
                          <a href={`tel:${r.submission.phone}`} className="text-primary hover:underline">
                            {r.submission.phone}
                          </a>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleCompleted(r)}
                      >
                        Atlikta
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Header with Quick Navigation */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Šiandien
            </Button>
          </div>
          
          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: lt })}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            title={soundEnabled ? "Išjungti garsą" : "Įjungti garsą"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {/* Quick Month Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
            const monthDate = addMonths(new Date(), offset);
            const isSelected = format(monthDate, "yyyy-MM") === format(currentMonth, "yyyy-MM");
            return (
              <Button
                key={offset}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={`shrink-0 ${isSelected ? "" : "text-muted-foreground"}`}
                onClick={() => setCurrentMonth(monthDate)}
              >
                {format(monthDate, "LLL", { locale: lt })}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month start */}
                {Array.from({ length: adjustedStartDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {calendarDays.map(day => {
                  const dayReminders = getRemindersForDate(day);
                  const hasReminders = dayReminders.length > 0;
                  const hasUncompleted = dayReminders.some(r => !r.completed);
                  const isPast = isBefore(day, new Date()) && !isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setAddDialogOpen(true);
                      }}
                      className={`
                        aspect-square p-1 rounded-lg border transition-all relative
                        hover:bg-accent hover:border-primary
                        ${isToday(day) ? "bg-primary/10 border-primary font-bold" : "border-transparent"}
                        ${isPast ? "opacity-50" : ""}
                      `}
                    >
                      <span className={`text-sm ${isToday(day) ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </span>
                      
                      {hasReminders && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayReminders.slice(0, 3).map((r, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                r.completed 
                                  ? "bg-green-500" 
                                  : "bg-orange-500"
                              }`}
                            />
                          ))}
                          {dayReminders.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{dayReminders.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      {hasUncompleted && isToday(day) && (
                        <Bell className="absolute top-1 right-1 h-3 w-3 text-orange-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Reminders List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Šiandienos priminimai
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getRemindersForDate(new Date()).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Šiandien priminimų nėra
            </p>
          ) : (
            <div className="space-y-2">
              {getRemindersForDate(new Date()).map(reminder => (
                <div
                  key={reminder.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    reminder.completed ? "bg-muted/50 opacity-60" : "bg-card"
                  }`}
                >
                  <Checkbox
                    checked={reminder.completed}
                    onCheckedChange={() => handleToggleCompleted(reminder)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {reminder.call_time}
                      </Badge>
                      {reminder.submission ? (
                        <span className={`font-medium truncate ${reminder.completed ? "line-through" : ""}`}>
                          {reminder.submission.name || reminder.submission.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Bendras priminimas</span>
                      )}
                    </div>
                    
                    {reminder.submission?.phone && (
                      <a
                        href={`tel:${reminder.submission.phone}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Phone className="h-3 w-3" />
                        {reminder.submission.phone}
                      </a>
                    )}
                    
                    {reminder.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {reminder.notes}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setReminderToDelete(reminder.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md pointer-events-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "yyyy MMMM d", { locale: lt })} d.
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            {/* Existing reminders for this day */}
            {selectedDate && getRemindersForDate(selectedDate).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Šios dienos priminimai:</h4>
                {getRemindersForDate(selectedDate).map(reminder => (
                  <div
                    key={reminder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      reminder.completed ? "bg-muted/50 opacity-60" : "bg-card"
                    }`}
                  >
                    <Checkbox
                      checked={reminder.completed}
                      onCheckedChange={() => handleToggleCompleted(reminder)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {reminder.call_time}
                        </Badge>
                        {reminder.submission ? (
                          <span className={`font-medium truncate ${reminder.completed ? "line-through" : ""}`}>
                            {reminder.submission.name || reminder.submission.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Bendras priminimas</span>
                        )}
                      </div>
                      
                      {reminder.submission?.phone && (
                        <a
                          href={`tel:${reminder.submission.phone}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <Phone className="h-3 w-3" />
                          {reminder.submission.phone}
                        </a>
                      )}
                      
                      {reminder.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {reminder.notes}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setReminderToDelete(reminder.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedDate && getRemindersForDate(selectedDate).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Šiai dienai priminimų nėra
              </p>
            )}

            {/* Divider */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Pridėti naują priminimą:</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Klientas (neprivaloma)</label>
                  <Select
                    value={newReminder.submission_id}
                    onValueChange={(value) => setNewReminder(prev => ({ ...prev, submission_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite klientą..." />
                    </SelectTrigger>
                    <SelectContent className="pointer-events-auto">
                      <SelectItem value="none">-- Bendras priminimas --</SelectItem>
                      {submissions.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{s.name || s.phone}</span>
                            {s.name && <span className="text-muted-foreground text-xs">({s.phone})</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Laikas</label>
                  <Input
                    type="time"
                    value={newReminder.call_time}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, call_time: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Pastabos</label>
                  <Textarea
                    value={newReminder.notes}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Pvz.: Paklauti apie dokumentus..."
                    rows={2}
                  />
                </div>
                
                <Button onClick={handleAddReminder} className="w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Pridėti priminimą
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti priminimą?</AlertDialogTitle>
            <AlertDialogDescription>
              Ar tikrai norite ištrinti šį priminimą? Šis veiksmas negrįžtamas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReminder}>
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
