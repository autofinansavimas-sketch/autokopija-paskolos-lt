import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  amount: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, amount }: ContactEmailRequest = await req.json();

    console.log("Sending email to:", email);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AutoPaskolos <info@autopaskolos.lt>",
        to: [email],
        subject: "Gavome jūsų užklausą!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Sveiki, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.5;">
              Gavome jūsų paskolos užklausą ir susisieksime su jumis artimiausiu metu.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937;">Jūsų užklausos detales:</h2>
              <p><strong>Vardas:</strong> ${name}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos suma:</strong> ${amount}€</p>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">
              Mūsų specialistai peržiūrės jūsų užklausą ir susisieks su jumis per <strong>30 minučių</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.5;">
              Geriausios sėkmės,<br>
              <strong>AutoPaskolos komanda</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              Šis laiškas buvo išsiųstas, nes užpildėte paskolos užklausos formą adresu autopaskolos.lt
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
