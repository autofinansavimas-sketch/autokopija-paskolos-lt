// Meta Login for Business — OAuth callback.
// Validates the one-time state (CSRF), exchanges the code for a long-lived user token,
// then stores each authorised page's access token server-side only.
// Nothing token-related is ever returned to the browser.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logEvent, humanMetaError } from "../_shared/metaPages.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_APP_ID = Deno.env.get("META_APP_ID") || "";
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") || "";
const AP_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOPASKOLOS") || "";
const AK_PAGE_ID = Deno.env.get("META_PAGE_ID_AUTOKOPERS") || "";

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
const GRAPH = "https://graph.facebook.com/v21.0";

const page = (title: string, body: string, back: string | null) => new Response(
  `<!doctype html><html lang="lt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:12vh auto;padding:0 1.25rem;line-height:1.6;color:#111}
h1{font-size:1.25rem}a{display:inline-block;margin-top:1.5rem}</style></head>
<body><h1>${title}</h1><p>${body}</p>${back ? `<a href="${back}">Grįžti į administravimą</a>` : ""}</body></html>`,
  { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
);

function brandFor(pageId: string, name: string | null): string | null {
  if (pageId === AP_PAGE_ID) return "autopaskolos";
  if (pageId === AK_PAGE_ID) return "autokopers";
  const n = (name || "").toLowerCase();
  if (n.includes("koper")) return "autokopers";
  if (n.includes("paskol")) return "autopaskolos";
  return null;
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error");

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  if (!state) return page("Neteisinga užklausa", "Trūksta saugumo patikros reikšmės.", null);

  const { data: stateRow } = await admin
    .from("meta_oauth_states")
    .select("state, redirect_to, used_at, expires_at")
    .eq("state", state)
    .maybeSingle();

  if (!stateRow || stateRow.used_at || new Date(stateRow.expires_at) < new Date()) {
    return page("Saugumo patikra nepavyko", "Prisijungimo nuoroda nebegalioja arba jau buvo panaudota. Pradėkite iš naujo.", null);
  }
  await admin.from("meta_oauth_states").update({ used_at: new Date().toISOString() }).eq("state", state);
  const back = stateRow.redirect_to || null;

  if (denied || !code) {
    return page("Prijungimas atšauktas", "Facebook autorizacija nebuvo užbaigta, todėl niekas nebuvo išsaugota.", back);
  }
  if (!META_APP_ID || !META_APP_SECRET) {
    return page("Trūksta konfigūracijos", "Reikalingi Meta APP_ID bei APP_SECRET.", back);
  }

  try {
    // 1. code -> user access token
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${encodeURIComponent(META_APP_ID)}` +
      `&client_secret=${encodeURIComponent(META_APP_SECRET)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${encodeURIComponent(code)}`,
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson?.access_token) throw new Error(JSON.stringify(tokenJson));
    const userToken: string = tokenJson.access_token;

    // 2. System-user tokens from a Login for Business configuration never expire —
    //    do NOT try to exchange them as if they were short-lived personal tokens.
    let longLived = userToken;
    let userExpires: number | null =
      typeof tokenJson.expires_in === "number" && tokenJson.expires_in > 0 ? tokenJson.expires_in : null;
    if (userExpires !== null) {
      const llRes = await fetch(
        `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(META_APP_ID)}` +
        `&client_secret=${encodeURIComponent(META_APP_SECRET)}&fb_exchange_token=${encodeURIComponent(userToken)}`,
      );
      const llJson = await llRes.json().catch(() => ({}));
      if (llRes.ok && llJson?.access_token) {
        longLived = llJson.access_token;
        userExpires = typeof llJson.expires_in === "number" && llJson.expires_in > 0 ? llJson.expires_in : null;
      }
    }

    // 3. granted scopes
    const permRes = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(longLived)}`);
    const permJson = await permRes.json().catch(() => ({}));
    const scopes: string[] = (permJson?.data ?? [])
      .filter((p: any) => p.status === "granted")
      .map((p: any) => String(p.permission));

    // 4. page tokens
    const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&limit=100&access_token=${encodeURIComponent(longLived)}`);
    const pagesJson = await pagesRes.json();
    if (!pagesRes.ok) throw new Error(JSON.stringify(pagesJson));
    const list = (pagesJson?.data ?? []) as { id: string; name?: string; access_token?: string }[];

    let stored = 0;
    let skipped = 0;
    for (const p of list) {
      if (!p.id || !p.access_token) continue;
      const pageId = String(p.id);
      const brand = brandFor(pageId, p.name ?? null);
      // Only the two real business pages are authorised; anything else is ignored.
      if (!brand) { skipped++; continue; }
      const { error } = await admin.from("meta_page_tokens").upsert({
        page_id: pageId,
        brand,
        page_name: p.name ?? null,
        access_token: p.access_token,
        token_type: "page",
        scopes,
        expires_at: userExpires ? new Date(Date.now() + Number(userExpires) * 1000).toISOString() : null,
        revoked_at: null,
        connected_at: new Date().toISOString(),
      }, { onConflict: "page_id" });
      if (!error) stored++;

      // Keep leadgen delivery active for this page.
      try {
        await fetch(`${GRAPH}/${pageId}/subscribed_apps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscribed_fields: "leadgen,feed",
            access_token: p.access_token,
          }),
        });
      } catch { /* subscription retried by health panel */ }

      await logEvent(admin, {
        page_id: pageId, brand, event_type: "oauth_connect", status: "success",
        message: `Puslapis prijungtas per Meta Login for Business (${p.name ?? pageId}).`,
      });
    }

    if (!stored) {
      return page("Puslapių nerasta", "Autorizacija sėkminga, bet nebuvo suteikta prieiga prie nė vieno Facebook puslapio. Pakartokite ir pažymėkite abu puslapius.", back);
    }
    return page("Meta prijungta", `Sėkmingai prijungti puslapiai: ${stored}. Prieigos raktai saugomi tik serveryje.`, back);
  } catch (e) {
    const msg = humanMetaError(e instanceof Error ? e.message : e);
    await logEvent(admin, { event_type: "oauth_connect", status: "error", message: msg });
    return page("Prijungti nepavyko", msg, back);
  }
});
