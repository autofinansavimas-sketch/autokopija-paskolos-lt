import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Plus, Trash2, Loader2, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

interface WorkHourEntry {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  notes: string | null;
  created_at: string;
  user_email?: string;
}

interface Profile {
  user_id: string;
  email: string;
}

export default function WorkHours() {
  const [entries, setEntries] = useState<WorkHourEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentMonth]);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setCurrentUserId(session.user.id);
    setIsAdmin(session.user.email === "autofinansavimas@gmail.com");
    
    await fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const { data: entriesData, error: entriesError } = await supabase
        .from("work_hours")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("date", { ascending: false });

      if (entriesError) throw entriesError;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("approved", true);

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);
      
      const entriesWithEmails = (entriesData || []).map(entry => {
        const profile = profilesData?.find(p => p.user_id === entry.user_id);
        return {
          ...entry,
          user_email: profile?.email || "Nežinomas"
        };
      });
      
      setEntries(entriesWithEmails);
    } catch (error) {
      console.error("Error fetching work hours:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko gauti darbo valandų",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!hours || parseFloat(hours) <= 0 || parseFloat(hours) > 24) {
      toast({
        title: "Klaida",
        description: "Įveskite teisingą valandų skaičių (1-24)",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) return;

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("work_hours")
        .upsert({
          user_id: currentUserId,
          date: selectedDate,
          hours: parseFloat(hours),
          notes: notes || null,
        }, { onConflict: "user_id,date" })
        .select()
        .single();

      if (error) throw error;

      const profile = profiles.find(p => p.user_id === currentUserId);
      const entryWithEmail = { ...data, user_email: profile?.email || "Nežinomas" };

      setEntries(prev => {
        const existing = prev.findIndex(e => e.user_id === currentUserId && e.date === selectedDate);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = entryWithEmail;
          return updated;
        }
        return [entryWithEmail, ...prev];
      });
      
      setHours("");
      setNotes("");
      
      toast({ title: "Valandos išsaugotos" });
    } catch (error) {
      console.error("Error adding work hours:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsaugoti valandų",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("work_hours")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Įrašas ištrintas" });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti įrašo",
        variant: "destructive",
      });
    }
  };

  const getTotalHoursForMonth = (userId?: string) => {
    const filtered = userId 
      ? entries.filter(e => e.user_id === userId)
      : entries;
    return filtered.reduce((sum, e) => sum + Number(e.hours), 0);
  };

  const getEntryForDate = (date: Date, userId: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries.find(e => e.date === dateStr && e.user_id === userId);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const uniqueUsers = [...new Set(entries.map(e => e.user_id))];

  return (
    <div className="space-y-6">
      {/* Add Hours Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Žymėti darbo valandas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valandos</label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="8"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pastabos (neprivaloma)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pvz.: Darbas iš namų"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEntry} disabled={adding} className="w-full">
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Išsaugoti
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          ← Ankstesnis
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "yyyy MMMM", { locale: lt })}
        </h3>
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
        >
          Sekantis →
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAdmin ? (
              profiles.filter(p => uniqueUsers.includes(p.user_id) || p.user_id === currentUserId).map(profile => (
                <Card key={profile.user_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <p className="text-2xl font-bold">{getTotalHoursForMonth(profile.user_id).toFixed(1)} val.</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mano valandos šį mėnesį</p>
                      <p className="text-2xl font-bold">{getTotalHoursForMonth(currentUserId || undefined).toFixed(1)} val.</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Entries List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Įrašai
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Šį mėnesį įrašų nėra</p>
              ) : (
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold">{format(parseISO(entry.date), "d")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(entry.date), "EEE", { locale: lt })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{Number(entry.hours).toFixed(1)} val.</p>
                          {isAdmin && (
                            <p className="text-xs text-muted-foreground">{entry.user_email}</p>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                      {(entry.user_id === currentUserId || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
