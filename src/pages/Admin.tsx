import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, 
  RefreshCw, 
  MessageSquare, 
  Phone, 
  Mail, 
  Euro, 
  Calendar,
  User,
  Loader2,
  Send,
  Trash2,
  Car,
  Plus,
  X,
  GripVertical
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Submission {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  amount: string | null;
  loan_type: string | null;
  loan_period: string | null;
  status: string;
  source?: string | null;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  submission_id: string;
  comment: string;
  created_at: string;
}

const STATUS_CONFIG = [
  { value: "new", label: "Nauji", color: "bg-blue-500", borderColor: "border-blue-500" },
  { value: "contacted", label: "Susisiekta", color: "bg-yellow-500", borderColor: "border-yellow-500" },
  { value: "completed", label: "Užbaigti", color: "bg-green-500", borderColor: "border-green-500" },
  { value: "not_financed", label: "Nefinansuojami", color: "bg-orange-500", borderColor: "border-orange-500" },
  { value: "cancelled", label: "Atšaukti", color: "bg-red-500", borderColor: "border-red-500" },
];

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addingSubmission, setAddingSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [newSubmission, setNewSubmission] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    loan_type: "",
    loan_period: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== "autofinansavimas@gmail.com") {
      navigate("/admin-login");
      return;
    }
    fetchSubmissions();
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);

      if (data && data.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from("submission_comments")
          .select("*")
          .in("submission_id", data.map(s => s.id))
          .order("created_at", { ascending: true });

        if (commentsError) throw commentsError;

        const groupedComments: Record<string, Comment[]> = {};
        commentsData?.forEach(comment => {
          if (!groupedComments[comment.submission_id]) {
            groupedComments[comment.submission_id] = [];
          }
          groupedComments[comment.submission_id].push(comment);
        });
        setComments(groupedComments);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko gauti užklausų sąrašo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status: newStatus })
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, status: newStatus } : s)
      );

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "Statusas atnaujintas",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti statuso",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await supabase
        .from("submission_comments")
        .delete()
        .eq("submission_id", submissionId);

      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[submissionId];
        return newComments;
      });
      setSelectedSubmission(null);

      toast({
        title: "Užklausa ištrinta",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti užklausos",
        variant: "destructive",
      });
    }
  };

  const handleAddSubmission = async () => {
    if (!newSubmission.email || !newSubmission.phone) {
      toast({
        title: "Klaida",
        description: "El. paštas ir telefonas yra privalomi",
        variant: "destructive",
      });
      return;
    }

    setAddingSubmission(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert({
          name: newSubmission.name || null,
          email: newSubmission.email,
          phone: newSubmission.phone,
          amount: newSubmission.amount || null,
          loan_type: newSubmission.loan_type || null,
          loan_period: newSubmission.loan_period || null,
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;

      setSubmissions(prev => [data, ...prev]);
      setNewSubmission({
        name: "",
        email: "",
        phone: "",
        amount: "",
        loan_type: "",
        loan_period: "",
      });
      setAddDialogOpen(false);

      toast({
        title: "Klientas pridėtas",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko pridėti kliento",
        variant: "destructive",
      });
    } finally {
      setAddingSubmission(false);
    }
  };

  const handleAddComment = async (submissionId: string, text?: string) => {
    const commentText = (text ?? newComments[submissionId] ?? "").trim();
    if (!commentText) return;

    setSubmittingComment(submissionId);
    try {
      const { data, error } = await supabase
        .from("submission_comments")
        .insert({ submission_id: submissionId, comment: commentText })
        .select()
        .single();

      if (error) throw error;

      setComments((prev) => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), data],
      }));
      setNewComments((prev) => ({ ...prev, [submissionId]: "" }));

      toast({
        title: "Komentaras pridėtas",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko pridėti komentaro",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleCommentChange = (submissionId: string, value: string) => {
    if (value.endsWith("\n")) {
      const cleaned = value.replace(/\n+$/g, "");
      setNewComments((prev) => ({ ...prev, [submissionId]: cleaned }));
      if (cleaned.trim()) {
        handleAddComment(submissionId, cleaned);
      }
      return;
    }

    setNewComments((prev) => ({ ...prev, [submissionId]: value }));
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent, submissionId: string) => {
    const code = (e as unknown as { code?: string }).code;
    if ((e.key === "Enter" || code === "NumpadEnter") && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(submissionId);
    }
  };

  const handleDeleteComment = async (commentId: string, submissionId: string) => {
    try {
      const { error } = await supabase
        .from("submission_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [submissionId]: prev[submissionId].filter(c => c.id !== commentId)
      }));

      toast({
        title: "Komentaras ištrintas",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti komentaro",
        variant: "destructive",
      });
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("lt-LT", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubmissionsByStatus = (status: string) => {
    return submissions.filter(s => s.status === status);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panelė</h1>
          <div className="flex items-center gap-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pridėti naują klientą</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Vardas</label>
                    <Input
                      value={newSubmission.name}
                      onChange={(e) => setNewSubmission(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Vardas Pavardė"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">El. paštas *</label>
                    <Input
                      type="email"
                      value={newSubmission.email}
                      onChange={(e) => setNewSubmission(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefonas *</label>
                    <Input
                      value={newSubmission.phone}
                      onChange={(e) => setNewSubmission(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+37061234567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Paskolos tipas</label>
                    <Select
                      value={newSubmission.loan_type}
                      onValueChange={(value) => setNewSubmission(prev => ({ ...prev, loan_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pasirinkite tipą" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Įprasta paskola">Įprasta paskola</SelectItem>
                        <SelectItem value="Autopaskola">Autopaskola</SelectItem>
                        <SelectItem value="Vartojimo paskola">Vartojimo paskola</SelectItem>
                        <SelectItem value="Paskolų refinansavimas">Paskolų refinansavimas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Suma (€)</label>
                    <Input
                      value={newSubmission.amount}
                      onChange={(e) => setNewSubmission(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Laikotarpis</label>
                    <Input
                      value={newSubmission.loan_period}
                      onChange={(e) => setNewSubmission(prev => ({ ...prev, loan_period: e.target.value }))}
                      placeholder="36 mėn."
                    />
                  </div>
                  <Button 
                    onClick={handleAddSubmission} 
                    className="w-full"
                    disabled={addingSubmission}
                  >
                    {addingSubmission ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Pridėti
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atnaujinti
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_CONFIG.map(statusConfig => {
              const statusSubmissions = getSubmissionsByStatus(statusConfig.value);
              return (
                <div 
                  key={statusConfig.value} 
                  className="flex-shrink-0 w-72 bg-muted/50 rounded-lg"
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b-2 ${statusConfig.borderColor} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                        <span className="font-semibold text-sm">{statusConfig.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {statusSubmissions.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {statusSubmissions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Nėra paraiškų
                      </div>
                    ) : (
                      statusSubmissions.map(submission => (
                        <Card 
                          key={submission.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow bg-card"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-sm truncate">
                                {submission.name || "Nežinomas"}
                              </span>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {submission.source === "autokopers" ? "AK" : "AP"}
                              </Badge>
                            </div>
                            
                            <a 
                              href={`tel:${submission.phone}`}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-3 w-3" />
                              {submission.phone}
                            </a>

                            {submission.amount && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Euro className="h-3 w-3" />
                                {submission.amount}€
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t">
                              <span className="text-xs text-muted-foreground">
                                {formatShortDate(submission.created_at)}
                              </span>
                              {(comments[submission.id]?.length || 0) > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="h-3 w-3" />
                                  {comments[submission.id]?.length}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Sheet */}
      <Sheet open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSubmission && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedSubmission.name || "Nežinomas klientas"}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statusas</label>
                  <Select
                    value={selectedSubmission.status}
                    onValueChange={(value) => handleStatusChange(selectedSubmission.id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_CONFIG.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s.color}`} />
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Kontaktai
                  </h4>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${selectedSubmission.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {selectedSubmission.phone}
                    </a>
                    <a 
                      href={`mailto:${selectedSubmission.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                {/* Loan Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Paskolos informacija
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipas:</span>
                      <p className="font-medium">{selectedSubmission.loan_type || "Nenurodyta"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suma:</span>
                      <p className="font-medium">{selectedSubmission.amount || "Nenurodyta"}€</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Laikotarpis:</span>
                      <p className="font-medium">{selectedSubmission.loan_period || "Nenurodyta"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Šaltinis:</span>
                      <p className="font-medium">
                        {selectedSubmission.source === "autokopers" ? "Autokopers" : "Autopaskolos"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Sukurta: {formatDate(selectedSubmission.created_at)}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Komentarai ({comments[selectedSubmission.id]?.length || 0})
                  </h4>

                  <div className="space-y-2">
                    {comments[selectedSubmission.id]?.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3 group">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm">{comment.comment}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
                            onClick={() => handleDeleteComment(comment.id, selectedSubmission.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Rašyti komentarą... (Enter išsaugoti)"
                      value={newComments[selectedSubmission.id] || ""}
                      onChange={(e) => handleCommentChange(selectedSubmission.id, e.target.value)}
                      onKeyDown={(e) => handleCommentKeyDown(e, selectedSubmission.id)}
                      className="min-h-[60px]"
                    />
                    <Button
                      onClick={() => handleAddComment(selectedSubmission.id)}
                      disabled={!newComments[selectedSubmission.id]?.trim() || submittingComment === selectedSubmission.id}
                      className="shrink-0"
                    >
                      {submittingComment === selectedSubmission.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Delete */}
                <div className="pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ištrinti užklausą
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ištrinti užklausą?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ši užklausa ir visi jos komentarai bus ištrinti negrįžtamai.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ištrinti
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}