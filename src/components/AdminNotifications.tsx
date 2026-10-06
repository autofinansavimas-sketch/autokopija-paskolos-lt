import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const KEY = "admin_browser_notifications";

/** Shows a browser notification whenever a new application arrives (while admin is open in some tab). */
export function NewSubmissionNotifier({ onNew }: { onNew?: () => void }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(KEY) === "1" && typeof Notification !== "undefined" && Notification.permission === "granted",
  );

  useEffect(() => {
    const ch = supabase
      .channel("new-submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_submissions" }, (payload) => {
        const s = payload.new as { name?: string | null; phone?: string; amount?: string | null; source?: string | null };
        onNew?.();
        const body = [s.name || "Be vardo", s.phone, s.amount ? `${s.amount} €` : null].filter(Boolean).join(" · ");
        toast({ title: "🔔 Nauja paraiška", description: body });
        if (enabled && Notification.permission === "granted") {
          const n = new Notification("Nauja paraiška", { body, icon: "/pwa-512x512.png", tag: "new-sub" });
          n.onclick = () => { window.focus(); n.close(); };
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [enabled, onNew]);

  const toggle = async () => {
    if (enabled) { localStorage.setItem(KEY, "0"); setEnabled(false); return; }
    if (typeof Notification === "undefined") {
      toast({ title: "Ši naršyklė nepalaiko pranešimų", variant: "destructive" }); return;
    }
    if (window.top !== window.self) {
      toast({ title: "Atidarykite admin atskirame skirtuke", description: "Pranešimų leidimas veikia tik ne peržiūros lange." });
      return;
    }
    const p = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (p !== "granted") {
      toast({ title: "Pranešimai užblokuoti", description: "Leiskite pranešimus naršyklės svetainės nustatymuose.", variant: "destructive" });
      return;
    }
    localStorage.setItem(KEY, "1"); setEnabled(true);
    new Notification("Pranešimai įjungti", { body: "Gausite pranešimą apie kiekvieną naują paraišką." });
  };

  return (
    <Button variant={enabled ? "default" : "outline"} size="sm" className="h-8 gap-1.5" onClick={toggle}
      title="Naršyklės pranešimai apie naujas paraiškas">
      {enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
      Pranešimai
    </Button>
  );
}
