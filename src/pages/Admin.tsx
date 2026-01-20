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
  GripVertical,
  Users,
  Copy,
  LayoutDashboard,
  Search,
  Clock,
  RotateCcw,
  Archive
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import UserManagement from "@/components/UserManagement";
import WorkHours from "@/components/WorkHours";
import CallCalendar from "@/components/CallCalendar";

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
  deleted_at?: string | null;
}

interface Comment {
  id: string;
  submission_id: string;
  comment: string;
  created_at: string;
  user_id: string | null;
  user_email?: string;
  user_display_name?: string;
}

const DEFAULT_STATUS_CONFIG = [
  { value: "new", label: "Nauji", color: "bg-blue-500", borderColor: "border-blue-500" },
  { value: "contacted", label: "Susisiekta", color: "bg-yellow-500", borderColor: "border-yellow-500" },
  { value: "completed", label: "Užbaigti", color: "bg-green-500", borderColor: "border-green-500" },
  { value: "not_financed", label: "Nefinansuojami", color: "bg-orange-500", borderColor: "border-orange-500" },
  { value: "cancelled", label: "Atšaukti", color: "bg-red-500", borderColor: "border-red-500" },
];

const AVAILABLE_COLORS = [
  { color: "bg-blue-500", borderColor: "border-blue-500" },
  { color: "bg-yellow-500", borderColor: "border-yellow-500" },
  { color: "bg-green-500", borderColor: "border-green-500" },
  { color: "bg-orange-500", borderColor: "border-orange-500" },
  { color: "bg-red-500", borderColor: "border-red-500" },
  { color: "bg-purple-500", borderColor: "border-purple-500" },
  { color: "bg-pink-500", borderColor: "border-pink-500" },
  { color: "bg-teal-500", borderColor: "border-teal-500" },
  { color: "bg-indigo-500", borderColor: "border-indigo-500" },
  { color: "bg-cyan-500", borderColor: "border-cyan-500" },
];

interface StatusConfig {
  value: string;
  label: string;
  color: string;
  borderColor: string;
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deletedSubmissions, setDeletedSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addingSubmission, setAddingSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [draggedSubmission, setDraggedSubmission] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [statusConfig, setStatusConfig] = useState<StatusConfig[]>(() => {
    const saved = localStorage.getItem("admin_status_config");
    return saved ? JSON.parse(saved) : DEFAULT_STATUS_CONFIG;
  });
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState(AVAILABLE_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<{ user_id: string; email: string; display_name?: string | null }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    if (!session) {
      navigate("/admin-login");
      return;
    }
    
    // Check if user is approved
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("user_id", session.user.id)
      .single();
    
    if (!profile?.approved) {
      navigate("/admin-login");
      return;
    }
    
    setCurrentUserId(session.user.id);
    
    // Fetch profiles for comment author display
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .eq("approved", true);
    
    // Cast to handle new column not yet in types
    const typedProfiles = (profilesData as unknown as { user_id: string; email: string; display_name?: string | null }[] | null) || [];
    setProfiles(typedProfiles);
    
    fetchSubmissions(typedProfiles);
  };

  const fetchSubmissions = async (profilesList?: { user_id: string; email: string; display_name?: string | null }[]) => {
    setLoading(true);
    try {
      // Fetch active submissions (not deleted)
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);

      // Fetch deleted submissions for trash
      const { data: deletedData } = await supabase
        .from("contact_submissions")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      
      setDeletedSubmissions(deletedData || []);

      const allSubmissions = [...(data || []), ...(deletedData || [])];

      if (allSubmissions.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from("submission_comments")
          .select("*")
          .in("submission_id", allSubmissions.map(s => s.id))
          .order("created_at", { ascending: true });

        if (commentsError) throw commentsError;

        const profilesToUse = profilesList || profiles;
        
        const groupedComments: Record<string, Comment[]> = {};
        commentsData?.forEach(comment => {
          const profile = profilesToUse.find(p => p.user_id === comment.user_id);
          const commentWithEmail: Comment = {
            ...comment,
            user_email: profile?.email || "Nežinomas",
            user_display_name: profile?.display_name || undefined
          };
          if (!groupedComments[comment.submission_id]) {
            groupedComments[comment.submission_id] = [];
          }
          groupedComments[comment.submission_id].push(commentWithEmail);
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

  // Soft delete - move to trash
  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", submissionId);

      if (error) throw error;

      const deletedSubmission = submissions.find(s => s.id === submissionId);
      if (deletedSubmission) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        setDeletedSubmissions(prev => [{ ...deletedSubmission, deleted_at: new Date().toISOString() }, ...prev]);
      }
      setSelectedSubmission(null);

      toast({
        title: "Perkelta į šiukšliadėžę",
        description: "Paraiška bus ištrinta po 3 mėnesių",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko perkelti į šiukšliadėžę",
        variant: "destructive",
      });
    }
  };

  // Restore from trash
  const handleRestoreSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ deleted_at: null } as any)
        .eq("id", submissionId);

      if (error) throw error;

      const restoredSubmission = deletedSubmissions.find(s => s.id === submissionId);
      if (restoredSubmission) {
        setDeletedSubmissions(prev => prev.filter(s => s.id !== submissionId));
        setSubmissions(prev => [{ ...restoredSubmission, deleted_at: null }, ...prev]);
      }

      toast({
        title: "Paraiška atkurta",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko atkurti paraiškos",
        variant: "destructive",
      });
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (submissionId: string) => {
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

      setDeletedSubmissions(prev => prev.filter(s => s.id !== submissionId));
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[submissionId];
        return newComments;
      });

      toast({
        title: "Ištrinta visam laikui",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti paraiškos",
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
    if (!commentText || !currentUserId) return;

    setSubmittingComment(submissionId);
    try {
      const { data, error } = await supabase
        .from("submission_comments")
        .insert({ 
          submission_id: submissionId, 
          comment: commentText,
          user_id: currentUserId
        })
        .select()
        .single();

      if (error) throw error;

      const profile = profiles.find(p => p.user_id === currentUserId);
      const commentWithEmail: Comment = {
        ...data,
        user_email: profile?.email || "Nežinomas",
        user_display_name: profile?.display_name || undefined
      };

      setComments((prev) => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), commentWithEmail],
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
    const query = searchQuery.toLowerCase().trim();
    return submissions.filter(s => {
      if (s.status !== status) return false;
      if (!query) return true;
      return (
        (s.name?.toLowerCase().includes(query)) ||
        (s.email?.toLowerCase().includes(query)) ||
        (s.phone?.toLowerCase().includes(query)) ||
        (s.loan_type?.toLowerCase().includes(query))
      );
    });
  };

  const handleDragStart = (e: React.DragEvent, submissionId: string) => {
    setDraggedSubmission(submissionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", submissionId);
  };

  const handleDragEnd = () => {
    setDraggedSubmission(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const submissionId = e.dataTransfer.getData("text/plain");
    setDragOverColumn(null);
    setDraggedSubmission(null);

    const submission = submissions.find(s => s.id === submissionId);
    if (!submission || submission.status === newStatus) return;

    await handleStatusChange(submissionId, newStatus);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      toast({
        title: "Klaida",
        description: "Įveskite kolonėlės pavadinimą",
        variant: "destructive",
      });
      return;
    }

    const value = newColumnName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    
    if (statusConfig.some(s => s.value === value)) {
      toast({
        title: "Klaida",
        description: "Tokia kolonėlė jau egzistuoja",
        variant: "destructive",
      });
      return;
    }

    const newStatus: StatusConfig = {
      value,
      label: newColumnName.trim(),
      color: newColumnColor.color,
      borderColor: newColumnColor.borderColor,
    };

    const updatedConfig = [...statusConfig, newStatus];
    setStatusConfig(updatedConfig);
    localStorage.setItem("admin_status_config", JSON.stringify(updatedConfig));
    
    setNewColumnName("");
    setNewColumnColor(AVAILABLE_COLORS[0]);
    setAddColumnDialogOpen(false);
    
    toast({
      title: "Kolonėlė pridėta",
    });
  };

  const handleDeleteColumn = (columnValue: string) => {
    const column = statusConfig.find(s => s.value === columnValue);
    const columnSubmissions = submissions.filter(s => s.status === columnValue);
    
    if (columnSubmissions.length > 0) {
      toast({
        title: "Negalima ištrinti",
        description: "Kolonėlėje yra paraiškų. Perkelkite jas į kitą kolonėlę.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfig = statusConfig.filter(s => s.value !== columnValue);
    setStatusConfig(updatedConfig);
    localStorage.setItem("admin_status_config", JSON.stringify(updatedConfig));
    
    toast({
      title: `Kolonėlė "${column?.label}" ištrinta`,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold truncate">Admin Panelė</h1>
            
            {/* Mobile: condensed actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Pridėti</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pridėti naują klientą</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
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
              
              {/* Add Column Dialog */}
              <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Kolonėlė</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pridėti naują kolonėlę</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium">Pavadinimas</label>
                      <Input
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Pvz.: Laukia dokumentų"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Spalva</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AVAILABLE_COLORS.map((colorOption, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`w-8 h-8 rounded-full ${colorOption.color} transition-all ${
                              newColumnColor.color === colorOption.color 
                                ? 'ring-2 ring-offset-2 ring-foreground' 
                                : 'hover:scale-110'
                            }`}
                            onClick={() => setNewColumnColor(colorOption)}
                          />
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddColumn} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Pridėti kolonėlę
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3" onClick={() => fetchSubmissions()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:flex">
            <TabsTrigger value="kanban" className="flex items-center justify-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden xs:inline">Paraiškos</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden xs:inline">Kalendorius</span>
            </TabsTrigger>
            <TabsTrigger value="trash" className="flex items-center justify-center gap-2">
              <Archive className="h-4 w-4" />
              <span className="hidden xs:inline">Šiukšliadėžė</span>
              {deletedSubmissions.length > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {deletedSubmissions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden xs:inline">Valandos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden xs:inline">Vartotojai</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban">
            {/* Search Bar */}
            <div className="mb-4 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ieškoti pagal vardą, el. paštą, telefoną..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:gap-4 lg:overflow-x-auto pb-4">
            {statusConfig.map(colConfig => {
              const statusSubmissions = getSubmissionsByStatus(colConfig.value);
              const isDropTarget = dragOverColumn === colConfig.value;
              return (
                <div 
                  key={colConfig.value} 
                  className={`flex-shrink-0 w-full lg:w-72 bg-muted/50 rounded-lg transition-all ${
                    isDropTarget ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, colConfig.value)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, colConfig.value)}
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b-2 ${colConfig.borderColor} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colConfig.color}`} />
                        <span className="font-semibold text-sm">{colConfig.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {statusSubmissions.length}
                        </Badge>
                        {statusSubmissions.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteColumn(colConfig.value)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="p-2 space-y-2 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                    {statusSubmissions.length === 0 ? (
                      <div className={`text-center py-4 lg:py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg ${
                        isDropTarget ? 'border-primary' : 'border-transparent'
                      }`}>
                        {isDropTarget ? 'Paleiskite čia' : 'Nėra paraiškų'}
                      </div>
                    ) : (
                      statusSubmissions.map(submission => (
                        <Card 
                          key={submission.id} 
                          className={`cursor-grab hover:shadow-md transition-all bg-card ${
                            draggedSubmission === submission.id 
                              ? 'opacity-50 scale-95 rotate-2' 
                              : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, submission.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                <span className="font-medium text-sm truncate">
                                  {submission.name || "Nežinomas"}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {submission.source === "autokopers" ? "AK" : "AP"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-xs text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${submission.phone}`;
                                }}
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                {submission.phone}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(submission.phone);
                                  toast({ title: "Nukopijuota!", description: submission.phone });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>

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
          </TabsContent>
          
          {/* Trash Tab */}
          <TabsContent value="trash">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Paraiškos automatiškai ištrinamos po 3 mėnesių
                </p>
              </div>
              
              {deletedSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Šiukšliadėžė tuščia</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {deletedSubmissions.map(submission => (
                    <Card key={submission.id} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{submission.name || "Nežinomas"}</span>
                          <Badge variant="outline" className="text-xs">
                            {submission.source === "autokopers" ? "AK" : "AP"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {submission.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {submission.email}
                          </div>
                        </div>
                        
                        {submission.deleted_at && (
                          <p className="text-xs text-muted-foreground">
                            Ištrinta: {formatDate(submission.deleted_at)}
                          </p>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRestoreSubmission(submission.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Atkurti
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ištrinti visam laikui?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ši paraiška ir visi jos komentarai bus ištrinti negrįžtamai.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handlePermanentDelete(submission.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Ištrinti
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <CallCalendar 
              submissions={submissions.map(s => ({ 
                id: s.id, 
                name: s.name, 
                email: s.email, 
                phone: s.phone 
              }))} 
              currentUserId={currentUserId} 
            />
          </TabsContent>
          
          <TabsContent value="hours">
            <WorkHours />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
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
                      {statusConfig.map(s => (
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-primary hover:bg-primary/10"
                        onClick={() => window.location.href = `tel:${selectedSubmission.phone}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedSubmission.phone}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSubmission.phone);
                          toast({ title: "Nukopijuota!", description: selectedSubmission.phone });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-primary hover:bg-primary/10"
                        onClick={() => window.location.href = `mailto:${selectedSubmission.email}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedSubmission.email}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSubmission.email);
                          toast({ title: "Nukopijuota!", description: selectedSubmission.email });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
                          <div className="flex-1">
                            <p className="text-sm">{comment.comment}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-primary">
                                {comment.user_display_name || comment.user_email || "Nežinomas"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {formatDate(comment.created_at)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
                            onClick={() => handleDeleteComment(comment.id, selectedSubmission.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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