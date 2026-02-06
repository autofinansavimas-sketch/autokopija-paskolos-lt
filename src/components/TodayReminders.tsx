import { useState, useEffect } from "react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { Bell, Phone, Mail, X, Clock, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TodayReminder {
  id: string;
  submission_id: string | null;
  call_date: string;
  call_time: string;
  notes: string | null;
  completed: boolean;
  submission?: {
    name: string | null;
    phone: string;
    email: string;
  };
}

const FOLLOW_UP_MESSAGE = `Sveiki,

Gavome jūsų užklausą ir nekantraujame jums padėti.

Bandėme su jumis susisiekti, tačiau nesėkmingai.

Labai lauksime jūsų skambučio arba žinutės kada galime jums paskambinti.

"AUTOPASKOLOS.LT" komanda`;

export default function TodayReminders() {
  const [reminders, setReminders] = useState<TodayReminder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchTodayReminders();
  }, []);

  const fetchTodayReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("call_reminders")
        .select("*")
        .eq("call_date", today)
        .eq("completed", false)
        .order("call_time", { ascending: true });

      if (error) throw error;

      // Fetch submission details for each reminder
      const remindersWithSubmissions: TodayReminder[] = [];
      
      for (const reminder of data || []) {
        if (reminder.submission_id) {
          const { data: submission } = await supabase
            .from("contact_submissions")
            .select("name, phone, email")
            .eq("id", reminder.submission_id)
            .single();
          
          remindersWithSubmissions.push({
            ...reminder,
            submission: submission || undefined,
          });
        } else {
          remindersWithSubmissions.push(reminder);
        }
      }

      setReminders(remindersWithSubmissions);
    } catch (error) {
      console.error("Error fetching today reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (reminderId: string) => {
    try {
      await supabase
        .from("call_reminders")
        .update({ completed: true })
        .eq("id", reminderId);

      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Error marking reminder complete:", error);
    }
  };

  const getSmsLink = (phone: string) => {
    const encodedMessage = encodeURIComponent(FOLLOW_UP_MESSAGE);
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    return `sms:${cleanPhone}?body=${encodedMessage}`;
  };

  const getMailtoLink = (email: string) => {
    const subject = encodeURIComponent("Jūsų užklausa - AUTOPASKOLOS.LT");
    const body = encodeURIComponent(FOLLOW_UP_MESSAGE);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (loading || dismissed || reminders.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent animate-fade-in overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block">Šiandienos priminimai</span>
              <span className="text-xs font-normal text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d", { locale: lt })}
              </span>
            </div>
            <Badge variant="default" className="ml-2 shadow-sm">
              {reminders.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex flex-col gap-2 p-3 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm">
                    {reminder.submission?.name || "Klientas"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  <Clock className="h-3 w-3 mr-1" />
                  {reminder.call_time}
                </Badge>
              </div>

              {reminder.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 pl-9">
                  {reminder.notes}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t">
                {reminder.submission?.phone && (
                  <a href={`tel:${reminder.submission.phone}`} className="flex-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                      <Phone className="h-3 w-3 mr-1" />
                      Skambinti
                    </Button>
                  </a>
                )}
                {reminder.submission?.phone && (
                  <a href={getSmsLink(reminder.submission.phone)}>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                {reminder.submission?.email && (
                  <a href={getMailtoLink(reminder.submission.email)}>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
                  onClick={() => handleMarkComplete(reminder.id)}
                >
                  ✓ Atlikta
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
