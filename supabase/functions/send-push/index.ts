import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  "mailto:autofinansavimas@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body?.record?.id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: "bad id" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    // Re-read from the DB: only real, freshly created submissions trigger a push.
    const { data: sub } = await admin
      .from("contact_submissions")
      .select("id, name, phone, amount, created_at")
      .eq("id", id)
      .maybeSingle();
    if (!sub) return json({ ok: false, error: "not found" }, 404);
    if (Date.now() - new Date(sub.created_at).getTime() > 3 * 60 * 1000) {
      return json({ ok: true, skipped: "old" });
    }

    const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    const payload = JSON.stringify({
      title: "🔔 Nauja paraiška",
      body: [sub.name || "Be vardo", sub.phone, sub.amount ? `${sub.amount} €` : null].filter(Boolean).join(" · "),
      url: "/admin",
      tag: `sub-${sub.id}`,
    });

    let sent = 0;
    await Promise.all((subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
        sent++;
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        } else console.error("push failed", e?.statusCode, e?.body);
      }
    }));
    return json({ ok: true, sent });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
