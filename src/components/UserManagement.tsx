import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Trash2, 
  Loader2, 
  RefreshCw,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko gauti vartotojų sąrašo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true })
        .eq("user_id", userId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => p.user_id === userId ? { ...p, approved: true } : p)
      );

      toast({
        title: "Vartotojas patvirtintas",
        description: "Vartotojas dabar gali naudotis sistema",
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko patvirtinti vartotojo",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: false })
        .eq("user_id", userId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => p.user_id === userId ? { ...p, approved: false } : p)
      );

      toast({
        title: "Vartotojas atmestas",
        description: "Vartotojas nebegali naudotis sistema",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko atmesti vartotojo",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (email === "autofinansavimas@gmail.com") {
      toast({
        title: "Negalima ištrinti",
        description: "Negalite ištrinti savo paskyros",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(userId);
    try {
      // Delete profile (user will be deleted via CASCADE)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.user_id !== userId));

      toast({
        title: "Vartotojas ištrintas",
        description: "Paskyra buvo sėkmingai ištrinta",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti vartotojo. Gali reikėti ištrinti per Supabase.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("lt-LT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingUsers = profiles.filter(p => !p.approved && p.email !== "autofinansavimas@gmail.com");
  const approvedUsers = profiles.filter(p => p.approved);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Vartotojų valdymas</h2>
        <Button variant="outline" size="sm" onClick={fetchProfiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atnaujinti</span>
        </Button>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <UserX className="h-5 w-5 text-yellow-500" />
              Laukia patvirtinimo ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Mobile view - cards */}
            <div className="space-y-3 sm:hidden">
              {pendingUsers.map(profile => (
                <div key={profile.id} className="bg-card border rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(profile.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => handleApprove(profile.user_id)}
                      disabled={actionLoading === profile.user_id}
                    >
                      {actionLoading === profile.user_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Patvirtinti
                        </>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === profile.user_id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ištrinti vartotoją?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ar tikrai norite ištrinti vartotoją {profile.email}? Šis veiksmas negrįžtamas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(profile.user_id, profile.email)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Ištrinti
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop view - table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>El. paštas</TableHead>
                    <TableHead>Registracijos data</TableHead>
                    <TableHead className="text-right">Veiksmai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map(profile => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {profile.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(profile.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(profile.user_id)}
                            disabled={actionLoading === profile.user_id}
                          >
                            {actionLoading === profile.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Patvirtinti
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoading === profile.user_id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ištrinti vartotoją?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ar tikrai norite ištrinti vartotoją {profile.email}? Šis veiksmas negrįžtamas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(profile.user_id, profile.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Ištrinti
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Patvirtinti vartotojai ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {approvedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nėra patvirtintų vartotojų
            </p>
          ) : (
            <>
              {/* Mobile view - cards */}
              <div className="space-y-3 sm:hidden">
                {approvedUsers.map(profile => (
                  <div key={profile.id} className="bg-muted/30 border rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm truncate">{profile.email}</span>
                      {profile.email === "autofinansavimas@gmail.com" && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Patvirtintas
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(profile.created_at)}
                    </div>
                    {profile.email !== "autofinansavimas@gmail.com" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReject(profile.user_id)}
                          disabled={actionLoading === profile.user_id}
                        >
                          {actionLoading === profile.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Atmesti
                            </>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionLoading === profile.user_id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ištrinti vartotoją?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ar tikrai norite ištrinti vartotoją {profile.email}? Šis veiksmas negrįžtamas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(profile.user_id, profile.email)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Ištrinti
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Desktop view - table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>El. paštas</TableHead>
                      <TableHead>Statusas</TableHead>
                      <TableHead>Registracijos data</TableHead>
                      <TableHead className="text-right">Veiksmai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map(profile => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {profile.email}
                            {profile.email === "autofinansavimas@gmail.com" && (
                              <Badge variant="secondary" className="text-xs">Admin</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Patvirtintas
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(profile.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {profile.email !== "autofinansavimas@gmail.com" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(profile.user_id)}
                                disabled={actionLoading === profile.user_id}
                              >
                                {actionLoading === profile.user_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Atmesti
                                  </>
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actionLoading === profile.user_id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ištrinti vartotoją?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Ar tikrai norite ištrinti vartotoją {profile.email}? Šis veiksmas negrįžtamas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(profile.user_id, profile.email)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Ištrinti
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
