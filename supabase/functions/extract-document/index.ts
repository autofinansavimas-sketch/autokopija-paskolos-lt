// Extract structured client data from an image, screenshot, or free text using Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mode = "single" | "bulk" | "text";

const SINGLE_SCHEMA = `Grąžink JSON: {"clients":[{ "name":"", "email":"", "phone":"", "amount":"", "loan_type":"", "loan_period":"", "notes":"" }]}`;

const SYSTEM_PROMPT = `Tu esi kliento duomenų atpažinimo asistentas paskolų tarpininkavimo CRM sistemai.
Iš pateikto įvesto (nuotrauka / ekrano nuotrauka / laisvas tekstas) ištrauk klientų informaciją.
Visada grąžink TIK JSON objektą tokios formos:
{
  "clients": [
    {
      "name": "Vardas Pavardė",
      "email": "el@pastas.lt",
      "phone": "+3706XXXXXXX",
      "amount": "5000",
      "loan_type": "Autopaskola | Įprasta paskola | Vartojimo paskola | Paskolų refinansavimas | Lizingas | ''",
      "loan_period": "12 men. / 60 men. / ''",
      "notes": "Papildoma info jei yra (statusas, šaltinis, automobilis, ir t.t.)"
    }
  ]
}
Taisyklės:
- Jei matai LENTELĘ ar sąrašą su keliais žmonėmis – grąžink VISUS klientus masyve.
- Jei matai tik vieną asmenį / dokumentą – masyve bus vienas elementas.
- Telefoną visada formatuok kaip +3706XXXXXXX (jei lietuviškas).
- Sumą tik skaičius (be € ir tarpų), pvz "13000".
- Jei lauko nematai – palik tuščią eilutę "".
- "loan_type" reikšmes mapink: "CAR LOAN"→"Autopaskola", "CAR LEASING"→"Lizingas", "Įprasta"→"Įprasta paskola".
- NEPRIDĖK jokio paaiškinimo, tik JSON.`;

async function callAI(messages: unknown[], apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  return response;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const mode: Mode = body.mode || "single";
    const imageBase64: string | undefined = body.imageBase64;
    const text: string | undefined = body.text;
    const mimeType: string = body.mimeType || "image/jpeg";

    let messages: unknown[];

    if (mode === "text") {
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ error: "text yra būtinas" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      messages = [
        { role: "system", content: SYSTEM_PROMPT + "\n" + SINGLE_SCHEMA },
        { role: "user", content: `Ištrauk klientą(-us) iš šio teksto:\n\n${text}` },
      ];
    } else {
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "imageBase64 yra būtinas" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const dataUrl = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:${mimeType};base64,${imageBase64}`;

      const userText = mode === "bulk"
        ? "Tai ekrano nuotrauka su klientų sąrašu/lentele. Ištrauk VISUS matomus klientus."
        : "Ištrauk vieno kliento / dokumento duomenis iš šios nuotraukos.";

      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ];
    }

    const response = await callAI(messages, LOVABLE_API_KEY);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Per daug užklausų. Bandykite vėliau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Pasibaigė AI kreditai." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI klaida: ${response.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed: { clients?: unknown[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { clients: [] };
    }

    const clients = Array.isArray(parsed.clients) ? parsed.clients : [];

    return new Response(JSON.stringify({ clients }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("extract-document error:", err);
    const message = err instanceof Error ? err.message : "Nežinoma klaida";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
