import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const KEY = "admin_browser_notifications";
const VAPID_PUBLIC_KEY = "BIdspJkMXnwTkz3m0sFXgF4pqyjcRuaSJPAxLxWnUtDgNh7NyXdLq0nURez9Nl7qc3_Bh6TCwszXHXrI-k9-8VI";
const SW_URL = "/admin-push-sw.js";
const SW_SCOPE = "/admin-push/";

const b64ToUint8 = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function subscribePush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  await navigator.serviceWorker.ready.catch(() => undefined);
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(VAPID_PUBLIC_KEY) });
  }
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, user_agent: navigator.userAgent.slice(0, 300) },
    { onConflict: "endpoint" },
  );
  if (error) { console.error("push sub save failed", error); return false; }
  return true;
}

async function unsubscribePush() {
  const reg = await navigator.serviceWorker?.getRegistration(SW_SCOPE);
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
}

/** Makes the admin installable as its own app (separate manifest). */
export function useAdminManifest() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href") ?? null;
    if (!link) { link = document.createElement("link"); link.rel = "manifest"; document.head.appendChild(link); }
    link.href = "/admin-manifest.webmanifest";
    return () => { if (prev) link!.href = prev; };
  }, []);
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAdminAppButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const { toast } = useToast();
  const standalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (standalone) return null;
  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5" title="Įsidiegti admin kaip programėlę"
      onClick={async () => {
        if (evt) { await evt.prompt(); setEvt(null); return; }
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        toast({
          title: "Įdiegti programėlę",
          description: ios
            ? "Safari apačioje spauskite „Bendrinti“ → „Pridėti prie pradžios ekrano“."
            : "Naršyklės adreso juostoje spauskite diegimo piktogramą arba meniu → „Įdiegti programą“. Peržiūros lange neveikia — atidarykite www.autopaskolos.lt/admin.",
        });
      }}>
      <Download className="h-3.5 w-3.5" /> Programėlė
    </Button>
  );
}

/** Notifications for new applications: push (works even when admin is closed) + in-page toast. */
export function NewSubmissionNotifier({ onNew }: { onNew?: () => void }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(KEY) === "1" && typeof Notification !== "undefined" && Notification.permission === "granted",
  );
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  // Refresh the saved subscription silently (keys can rotate).
  useEffect(() => { if (enabled) subscribePush().catch(() => undefined); }, []);

  useEffect(() => {
    const ch = supabase
      .channel("new-submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_submissions" }, (payload) => {
        const s = payload.new as { name?: string | null; phone?: string; amount?: string | null };
        onNewRef.current?.();
        const body = [s.name || "Be vardo", s.phone, s.amount ? `${s.amount} €` : null].filter(Boolean).join(" · ");
        toast({ title: "🔔 Nauja paraiška", description: body });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const toggle = async () => {
    if (enabled) {
      await unsubscribePush().catch(() => undefined);
      localStorage.setItem(KEY, "0"); setEnabled(false); return;
    }
    if (typeof Notification === "undefined" || !("PushManager" in window)) {
      toast({ title: "Ši naršyklė nepalaiko pranešimų", description: "iPhone: pirma įsidiekite programėlę į pradžios ekraną.", variant: "destructive" }); return;
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
    const ok = await subscribePush().catch((e) => { console.error(e); return false; });
    if (!ok) { toast({ title: "Nepavyko įjungti pranešimų", variant: "destructive" }); return; }
    localStorage.setItem(KEY, "1"); setEnabled(true);
    toast({ title: "Pranešimai įjungti", description: "Gausite pranešimą net uždarius admin puslapį." });
  };

  return (
    <Button variant={enabled ? "default" : "outline"} size="sm" className="h-8 gap-1.5" onClick={toggle}
      title="Pranešimai apie naujas paraiškas">
      {enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
      Pranešimai
    </Button>
  );
}
