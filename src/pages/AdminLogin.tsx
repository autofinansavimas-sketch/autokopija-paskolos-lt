import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail, Loader2, ArrowLeft, UserPlus } from "lucide-react";

type Mode = "login" | "signup" | "reset";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Check if user is approved or admin
        setTimeout(() => {
          checkUserAccess(session.user.id, session.user.email || "");
        }, 0);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserAccess(session.user.id, session.user.email || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserAccess = async (userId: string, email: string) => {
    // Admin always has access
    if (email === "autofinansavimas@gmail.com") {
      navigate("/admin");
      return;
    }

    // Check if user is approved
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("user_id", userId)
      .single();

    if (profile?.approved) {
      navigate("/admin");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        if (error.message === "Invalid login credentials") {
          message = "Neteisingas el. paštas arba slaptažodis";
        }
        toast({
          title: "Prisijungimo klaida",
          description: message,
          variant: "destructive",
        });
        return;
      }

      // Check if admin
      if (data.user?.email === "autofinansavimas@gmail.com") {
        toast({
          title: "Sėkmingai prisijungta!",
          description: "Nukreipiama į admin panelę...",
        });
        navigate("/admin");
        return;
      }

      // Check if approved user
      const { data: profile } = await supabase
        .from("profiles")
        .select("approved")
        .eq("user_id", data.user?.id)
        .single();

      if (!profile?.approved) {
        await supabase.auth.signOut();
        toast({
          title: "Laukiama patvirtinimo",
          description: "Jūsų paskyra dar nepatvirtinta. Palaukite kol administratorius patvirtins.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sėkmingai prisijungta!",
        description: "Nukreipiama į admin panelę...",
      });
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Įvyko nenumatyta klaida. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Klaida",
        description: "Slaptažodžiai nesutampa",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Klaida",
        description: "Slaptažodis turi būti bent 6 simbolių",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin-login`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        let message = error.message;
        if (error.message.includes("already registered")) {
          message = "Šis el. paštas jau užregistruotas";
        }
        toast({
          title: "Registracijos klaida",
          description: message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registracija sėkminga!",
        description: "Jūsų paskyra sukurta. Palaukite kol administratorius ją patvirtins.",
      });
      
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Įvyko nenumatyta klaida. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Klaida",
        description: "Įveskite el. pašto adresą",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin-login`,
      });

      if (error) {
        toast({
          title: "Klaida",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResetSent(true);
      toast({
        title: "Laiškas išsiųstas!",
        description: "Patikrinkite savo el. paštą ir sekite nuorodą slaptažodžio atstatymui.",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Įvyko nenumatyta klaida. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset password mode
  if (mode === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Slaptažodžio atstatymas</CardTitle>
            <CardDescription>
              {resetSent 
                ? "Patikrinkite savo el. paštą" 
                : "Įveskite savo el. pašto adresą"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSent ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Slaptažodžio atstatymo nuoroda išsiųsta į <strong>{email}</strong>
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMode("login");
                    setResetSent(false);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Grįžti į prisijungimą
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">El. paštas</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="jusu@email.lt"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Siunčiama...
                    </>
                  ) : (
                    "Siųsti atstatymo nuorodą"
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Grįžti į prisijungimą
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signup mode
  if (mode === "signup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Registracija</CardTitle>
            <CardDescription>
              Sukurkite naują paskyrą
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">El. paštas</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="jusu@email.lt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Slaptažodis</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Pakartokite slaptažodį</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registruojama...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registruotis
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Po registracijos administratorius turės patvirtinti jūsų paskyrą
              </p>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={() => setMode("login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Jau turite paskyrą? Prisijunkite
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login mode (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Prisijungimas</CardTitle>
          <CardDescription>
            Prisijunkite prie administravimo panelės
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jusu@email.lt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Slaptažodis</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Jungiamasi...
                </>
              ) : (
                "Prisijungti"
              )}
            </Button>
            <div className="flex flex-col gap-2">
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={() => setMode("signup")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registruotis
              </Button>
              <Button 
                type="button"
                variant="link" 
                className="w-full text-sm"
                onClick={() => setMode("reset")}
              >
                Pamiršote slaptažodį?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
