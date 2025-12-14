import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  Car
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  amount: string | null;
  loan_type: string | null;
  loan_period: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  submission_id: string;
  comment: string;
  created_at: string;
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
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

      // Fetch comments for all submissions
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

      toast({
        title: "Statusas atnaujintas",
        description: `Užklausa pažymėta kaip "${newStatus}"`,
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti statuso",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (submissionId: string) => {
    const commentText = newComments[submissionId]?.trim();
    if (!commentText) return;

    setSubmittingComment(submissionId);
    try {
      const { data, error } = await supabase
        .from("submission_comments")
        .insert({ submission_id: submissionId, comment: commentText })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), data]
      }));
      setNewComments(prev => ({ ...prev, [submissionId]: "" }));

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500";
      case "contacted": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panelė</h1>
          <div className="flex items-center gap-2">
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

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Užklausų dar nėra</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Iš viso užklausų: <strong>{submissions.length}</strong>
            </p>
            
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.created_at)}
                      </span>
                    </div>
                    <Select
                      value={submission.status}
                      onValueChange={(value) => handleStatusChange(submission.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Naujas</SelectItem>
                        <SelectItem value="contacted">Susisiekta</SelectItem>
                        <SelectItem value="completed">Užbaigtas</SelectItem>
                        <SelectItem value="cancelled">Atšauktas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{submission.name || "Nenurodytas"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${submission.phone}`} className="text-primary hover:underline">
                          {submission.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                          {submission.email}
                        </a>
                      </div>
                    </div>

                    {/* Loan Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>Tipas: <strong>{submission.loan_type || "Nenurodyta"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span>Suma: <strong>{submission.amount || "Nenurodyta"}€</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Laikotarpis: <strong>{submission.loan_period || "Nenurodyta"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Komentarai ({comments[submission.id]?.length || 0})
                    </h4>

                    {/* Existing Comments */}
                    {comments[submission.id]?.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3 mb-2 group">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm">{comment.comment}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => handleDeleteComment(comment.id, submission.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2 mt-3">
                      <Textarea
                        placeholder="Rašyti komentarą..."
                        value={newComments[submission.id] || ""}
                        onChange={(e) => setNewComments(prev => ({ 
                          ...prev, 
                          [submission.id]: e.target.value 
                        }))}
                        className="min-h-[80px]"
                      />
                      <Button
                        onClick={() => handleAddComment(submission.id)}
                        disabled={!newComments[submission.id]?.trim() || submittingComment === submission.id}
                        className="shrink-0"
                      >
                        {submittingComment === submission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
