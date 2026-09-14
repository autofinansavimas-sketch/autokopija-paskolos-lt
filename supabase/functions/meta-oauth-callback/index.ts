// Meta Login for Business — OAuth callback.
// 1. Validates the one-time state (CSRF) issued by meta-oauth-start.
// 2. Exchanges the code for a SHORT-LIVED USER token, then server-side exchanges it for a
//    LONG-LIVED USER token (grant_type=fb_exchange_token).
// 3. Reads /me/accounts (paginated, fields id,name,access_token,tasks), keeps ONLY the two
//    allow-listed pages, validates + subscribes each derived Page token, and upserts it.
// A page is only written when its replacement token validated — a partial failure leaves the
// previously working connection untouched.
// Tokens, codes, the app secret and PII are never returned or logged.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logEvent, humanMetaError } from "../_shared/metaPages.ts";
import { ALLOWED_PAGES, isAllowedPage, brandForPage, labelForPage } from "../_shared/metaAllowlist.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_APP_ID = Deno.env.get("META_APP_ID") || "";
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") || "";

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
const GRAPH = "https://graph.facebook.com/v21.0";
const SUBSCRIBED_FIELDS = "leadgen,feed";

const page = (title: string, body: string, back: string | null) =>
  new Response(
    `<!doctype html><html lang="lt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:12vh auto;padding:0 1.25rem;line-height:1.6;color:#111}
h1{font-size:1.25rem}a{display:inline-block;margin-top:1.5rem}</style></head>
<body><h1>${title}</h1><p>${body}</p>${back ? `<a href="${back}">Grįžti į administravimą</a>` : ""}</body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

type MetaPage = { id: string; name?: string | null; access_token?: string | null; tasks?: string[] };

/** Reads every page of /me/accounts. Never logs the token. */
async function fetchAllAccounts(userToken: string): Promise<MetaPage[]> {
  const out: MetaPage[] = [];
  let next: string | null =
    `${GRAPH}/me/accounts?fields=id,name,access_token,tasks&limit=100&access_token=${encodeURIComponent(userToken)}`;
  let guard = 0;
  while (next && guard < 20) {
    const res = await fetch(next);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    const parsed = JSON.parse(text);
    for (const p of parsed?.data ?? []) out.push(p as MetaPage);
    next = parsed?.paging?.next ?? null;
    guard++;
  }
  return out;
}

/** Explicit expiry of a page token, when Meta reports one. Otherwise no expiry. */
async function explicitExpiry(pageToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GRAPH}/debug_token?input_token=${encodeURIComponent(pageToken)}` +
        `&access_token=${encodeURIComponent(`${META_APP_ID}|${META_APP_SECRET}`)}`,
    );
    if (!res.ok) return null;
    const at = (await res.json())?.data?.expires_at;
    return typeof at === "number" && at > 0 ? new Date(at * 1000).toISOString() : null;
  } catch {
    return null;
  }
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
    return page(
      "Saugumo patikra nepavyko",
      "Prisijungimo nuoroda nebegalioja arba jau buvo panaudota. Pradėkite iš naujo.",
      null,
    );
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
    // 1. code -> short-lived USER access token
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${encodeURIComponent(META_APP_ID)}` +
        `&client_secret=${encodeURIComponent(META_APP_SECRET)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${encodeURIComponent(code)}`,
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson?.access_token) throw new Error(JSON.stringify(tokenJson));
    const shortLived: string = tokenJson.access_token;

    // 2. short-lived USER token -> long-lived USER token (server-side only)
    let userToken = shortLived;
    let userTokenLongLived = false;
    const llRes = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(META_APP_ID)}` +
        `&client_secret=${encodeURIComponent(META_APP_SECRET)}&fb_exchange_token=${encodeURIComponent(shortLived)}`,
    );
    const llJson = await llRes.json().catch(() => ({}));
    if (llRes.ok && llJson?.access_token) {
      userToken = llJson.access_token;
      userTokenLongLived = true;
    } else {
      await logEvent(admin, {
        event_type: "oauth_exchange",
        status: "info",
        message: "Ilgo galiojimo vartotojo rakto gauti nepavyko – naudojamas pradinis raktas puslapių raktams išduoti.",
      });
    }

    // 3. granted scopes
    const permRes = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(userToken)}`);
    const permJson = await permRes.json().catch(() => ({}));
    const scopes: string[] = (permJson?.data ?? [])
      .filter((p: any) => p.status === "granted")
      .map((p: any) => String(p.permission));

    // 4. page tokens (paginated) filtered strictly to the allow-list
    const accounts = await fetchAllAccounts(userToken);
    const allowed = accounts.filter((p) => isAllowedPage(p?.id) && !!p?.access_token);
    const ignored = accounts.length - allowed.length;

    let stored = 0;
    let preserved = 0;
    const failures: string[] = [];
    const nowIso = new Date().toISOString();

    for (const p of allowed) {
      const pageId = String(p.id);
      const brand = brandForPage(pageId)!;
      const label = labelForPage(pageId) ?? pageId;
      const pageToken = String(p.access_token);

      // 5a. validate the replacement token before touching the stored one
      const checkRes = await fetch(`${GRAPH}/${pageId}?fields=id,name&access_token=${encodeURIComponent(pageToken)}`);
      const checkBody = await checkRes.text();
      if (!checkRes.ok) {
        const msg = humanMetaError(checkBody);
        preserved++;
        failures.push(`${label}: ${msg}`);
        await logEvent(admin, {
          page_id: pageId,
          brand,
          event_type: "oauth_connect",
          status: "error",
          message: `Naujas ${label} raktas nepasitvirtino – esamas veikiantis ryšys paliktas nepakeistas. ${msg}`,
        });
        continue;
      }
      let pageName: string | null = null;
      try {
        pageName = JSON.parse(checkBody)?.name ?? null;
      } catch {
        /* ignore */
      }

      // 5b. keep leadgen delivery active, then verify the real subscription state
      let subscribedFields: string[] = [];
      let healthStatus = "active";
      let healthError: string | null = null;
      try {
        const subPost = await fetch(`${GRAPH}/${pageId}/subscribed_apps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscribed_fields: SUBSCRIBED_FIELDS, access_token: pageToken }),
        });
        if (!subPost.ok) healthError = humanMetaError(await subPost.text());

        const subGet = await fetch(`${GRAPH}/${pageId}/subscribed_apps?access_token=${encodeURIComponent(pageToken)}`);
        const subBody = await subGet.text();
        if (subGet.ok) {
          const parsed = JSON.parse(subBody);
          for (const app of parsed?.data ?? []) {
            for (const f of app?.subscribed_fields ?? []) subscribedFields.push(String(f));
          }
        } else if (!healthError) {
          healthError = humanMetaError(subBody);
        }
      } catch (e) {
        healthError = humanMetaError(e instanceof Error ? e.message : e);
      }
      if (!subscribedFields.includes("leadgen")) {
        healthStatus = "error";
        healthError = healthError ?? "Puslapio 'leadgen' prenumerata neaktyvi – Facebook nesiųs naujų lead'ų.";
      }

      // 5c. atomic, idempotent upsert of the validated page token
      const { error } = await admin.from("meta_page_tokens").upsert(
        {
          page_id: pageId,
          brand,
          page_name: pageName ?? p.name ?? null,
          access_token: pageToken,
          token_type: "page",
          scopes,
          // Page tokens derived from a long-lived user token have no expiry unless Meta says otherwise.
          expires_at: await explicitExpiry(pageToken),
          revoked_at: null,
          connected_at: nowIso,
          last_verified_at: nowIso,
          health_status: healthStatus,
          health_error: healthError,
          subscribed_fields: subscribedFields,
        },
        { onConflict: "page_id" },
      );

      if (error) {
        preserved++;
        failures.push(`${label}: nepavyko išsaugoti prieigos.`);
        await logEvent(admin, {
          page_id: pageId,
          brand,
          event_type: "oauth_connect",
          status: "error",
          message: `Nepavyko išsaugoti ${label} prieigos – esamas ryšys nepakeistas.`,
        });
        continue;
      }

      stored++;
      await logEvent(admin, {
        page_id: pageId,
        brand,
        event_type: "oauth_connect",
        status: healthStatus === "active" ? "success" : "info",
        message:
          `${label} prijungtas (ilgo galiojimo puslapio raktas${userTokenLongLived ? "" : ", be ilgo vartotojo rakto"}). ` +
          `Prenumeratos laukai: ${subscribedFields.join(", ") || "nėra"}.` +
          (healthError ? ` ${healthError}` : ""),
      });
    }

    if (ignored > 0) {
      await logEvent(admin, {
        event_type: "oauth_connect",
        status: "skipped",
        message: `Neleistini puslapiai praleisti: ${ignored}. Leidžiami tik ${ALLOWED_PAGES.map((a) => a.label).join(" ir ")}.`,
      });
    }

    if (!stored) {
      return page(
        "Puslapių nepavyko prijungti",
        failures.length
          ? `Nauji raktai nepasitvirtino, todėl esami ryšiai palikti nepakeisti. ${failures.join(" ")}`
          : "Autorizacija sėkminga, bet nebuvo suteikta prieiga prie nė vieno leidžiamo puslapio. Pakartokite ir pažymėkite Auto Kopers LT bei Autopaskolos.lt.",
        back,
      );
    }

    return page(
      "Meta prijungta",
      `Sėkmingai prijungti puslapiai: ${stored}${preserved ? `, palikti nepakeisti: ${preserved}` : ""}. ` +
        `Prieigos raktai saugomi tik serveryje.` +
        (failures.length ? ` ${failures.join(" ")}` : ""),
      back,
    );
  } catch (e) {
    const msg = humanMetaError(e instanceof Error ? e.message : e);
    await logEvent(admin, { event_type: "oauth_connect", status: "error", message: msg });
    return page("Prijungti nepavyko", msg, back);
  }
});
