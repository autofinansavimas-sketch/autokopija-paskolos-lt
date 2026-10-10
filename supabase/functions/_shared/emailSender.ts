// Unified email sender for both brands.
// - autopaskolos.lt: Resend account with the autopaskolos.lt domain (raw API key).
// - autokopers.lt: Resend account with the autokopers.lt domain, linked as a
//   Lovable connector — requests go through the connector gateway.

export interface SendEmailResult {
  ok: boolean;
  status: number;
  error?: string;
}

const AP_KEY = Deno.env.get("RESEND_API_KEY_AUTOPIASKOLOS");
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
// The connector-linked Resend connection exposes its connection key under RESEND_API_KEY.
// It is only valid via the gateway, never against api.resend.com directly.
const AK_CONN_KEY = Deno.env.get("RESEND_API_KEY");

const RESEND_URL = "https://api.resend.com/emails";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend/emails";

export async function sendEmail(
  from: string,
  to: string[],
  payload: Record<string, unknown>,
): Promise<SendEmailResult> {
  const at = from.indexOf("@");
  const domain = at === -1 ? "" : from.slice(at + 1).trim().toLowerCase();

  if (domain === "autokopers.lt") {
    if (!LOVABLE_KEY || !AK_CONN_KEY) {
      return { ok: false, status: 500, error: "missing gateway credentials for autokopers.lt" };
    }
    try {
      const r = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_KEY}`,
          "X-Connection-Api-Key": AK_CONN_KEY,
        },
        body: JSON.stringify({ from, to, ...payload }),
      });
      const text = await r.text();
      return { ok: r.ok, status: r.status, error: r.ok ? undefined : text };
    } catch (e) {
      return { ok: false, status: 500, error: String(e) };
    }
  }

  // Default: autopaskolos.lt (and any other sender) via the direct Resend API.
  if (!AP_KEY) {
    return { ok: false, status: 500, error: "missing RESEND_API_KEY_AUTOPIASKOLOS" };
  }
  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AP_KEY}`,
      },
      body: JSON.stringify({ from, to, ...payload }),
    });
    const text = await r.text();
    return { ok: r.ok, status: r.status, error: r.ok ? undefined : text };
  } catch (e) {
    return { ok: false, status: 500, error: String(e) };
  }
}
