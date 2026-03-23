import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu esi AI asistentas administravimo panelėje, kuri valdo autopaskolų užklausas. Tu padedi darbuotojams:
- Analizuoti klientų užklausas ir siūlyti veiksmus
- Rašyti profesionalius atsakymus klientams (SMS, el. paštu)
- Prioritizuoti užklausas pagal skubumą
- Siūlyti geriausias paskolų strategijas
- Atsakyti į klausimus apie paskolų procesus

Visada atsakyk lietuviškai. Būk profesionalus, bet draugiškas. Jei gauni kontekstą apie konkrečias užklausas, naudok tą informaciją savo atsakymuose.

Kai rašai žinutes klientams, naudok šį formatą:
- Pradžia: "Sveiki/Laba diena"
- Pristatyk save kaip AUTOPASKOLOS.LT komandos narį
- Būk aiškus ir konkretus
- Pabaiga: kontaktinė info ir linkėjimai`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-enriched system prompt
    let enrichedPrompt = SYSTEM_PROMPT;
    if (context) {
      enrichedPrompt += `\n\nŠtai dabartinė statistika:\n${context}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enrichedPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Per daug užklausų, bandykite vėliau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Reikia papildyti kreditų." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI klaida" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
