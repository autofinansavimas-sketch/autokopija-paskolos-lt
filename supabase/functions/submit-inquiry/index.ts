import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  name: string;
  email: string;
  phone: string;
  amount?: string;
  loanType?: string;
  loanPeriod?: string;
  source: string;
  website?: string; // honeypot
}

// Brand configurations
const brandConfig = {
  autopaskolos: {
    name: "AutoPaskolos",
    fromEmail: "AutoPaskolos <info@autopaskolos.lt>",
    primaryColor: "#2563eb",
    website: "autopaskolos.lt",
    adminUrl: "https://autopaskolos.lt/admin",
  },
  autokopers: {
    name: "AutoKopers",
    fromEmail: "AutoKopers <info@autokopers.lt>",
    primaryColor: "#10b981",
    website: "autokopers.lt",
    adminUrl: "https://autopaskolos.lt/admin",
  },
};

// Convert Lithuanian name to vocative case (šauksmininkas)
function toVocativeCase(name: string): string {
  if (!name || name.trim() === '') return name;
  
  const parts = name.trim().split(/\s+/);
  const convertedParts = parts.map(part => {
    const word = part.trim();
    if (word.length < 2) return word;
    
    const isCapitalized = word[0] === word[0].toUpperCase();
    const lowerWord = word.toLowerCase();
    
    let result = word;
    
    if (lowerWord.endsWith('as')) {
      result = word.slice(0, -2) + 'ai';
    } else if (lowerWord.endsWith('is')) {
      result = word.slice(0, -2) + 'i';
    } else if (lowerWord.endsWith('us')) {
      result = word.slice(0, -2) + 'au';
    } else if (lowerWord.endsWith('ius')) {
      result = word.slice(0, -3) + 'iau';
    } else if (lowerWord.endsWith('ys')) {
      result = word.slice(0, -2) + 'y';
    } else if (lowerWord.endsWith('ė')) {
      result = word.slice(0, -1) + 'e';
    } else if (lowerWord.endsWith('a')) {
      result = word.slice(0, -1) + 'a';
    }
    
    if (isCapitalized && result.length > 0) {
      result = result[0].toUpperCase() + result.slice(1).toLowerCase();
    }
    
    return result;
  });
  
  return convertedParts.join(' ');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, amount, loanType, loanPeriod, source, website }: InquiryRequest = await req.json();

    // Honeypot check - bots fill hidden fields
    if (website && website.trim() !== '') {
      console.log('Bot detected via honeypot');
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Validate required fields
    if (!email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: "El. paštas ir telefonas yra privalomi" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate source
    const validSources = ["autopaskolos", "autokopers"];
    const normalizedSource = source?.toLowerCase() || "autopaskolos";
    
    if (!validSources.includes(normalizedSource)) {
      return new Response(
        JSON.stringify({ success: false, error: "Neteisingas šaltinis" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const brand = brandConfig[normalizedSource as keyof typeof brandConfig];

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ success: false, error: "Neteisingas el. pašto formatas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (phone.length > 20) {
      return new Response(
        JSON.stringify({ success: false, error: "Neteisingas telefono numeris" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (name && name.length > 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Per ilgas vardas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting - max 3 submissions per email in 5 minutes
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentSubs } = await supabase
      .from("contact_submissions")
      .select("id")
      .eq("email", email)
      .gte("created_at", fiveMinAgo);

    if (recentSubs && recentSubs.length >= 3) {
      return new Response(
        JSON.stringify({ success: false, error: "Per daug užklausų. Bandykite vėliau." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing inquiry from:", normalizedSource);

    // Save submission to database
    
    const { data: submissionData, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: name || null,
        email,
        phone,
        amount: amount || null,
        loan_type: loanType || null,
        loan_period: loanPeriod || null,
        status: "new",
        source: normalizedSource
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save submission to database:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "Nepavyko išsaugoti užklausos" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Submission saved with ID:", submissionData.id);

    // Send notification email to admin
    const notificationEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: brand.fromEmail,
        to: ["autofinansavimas@gmail.com"],
        subject: `[${brand.name}] Nauja paskolos užklausa: ${loanType || 'Nenurodyta'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${brand.primaryColor};">Nauja užklausa (${brand.name})</h1>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Šaltinis:</strong> ${brand.website}</p>
              <p><strong>Vardas:</strong> ${name || 'Nenurodyta'}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos tipas:</strong> ${loanType || 'Nenurodyta'}</p>
              <p><strong>Paskolos suma:</strong> ${amount || 'Nenurodyta'}€</p>
              <p><strong>Laikotarpis:</strong> ${loanPeriod || 'Nenurodyta'}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              <a href="${brand.adminUrl}" style="color: ${brand.primaryColor};">Peržiūrėti admin panelėje →</a>
            </p>
          </div>
        `,
      }),
    });

    if (!notificationEmail.ok) {
      console.error("Failed to send notification email:", await notificationEmail.text());
    }

    // Send confirmation to client
    const vocativeName = toVocativeCase(name);
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: brand.fromEmail,
        to: [email],
        subject: "Gavome jūsų užklausą!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${brand.primaryColor};">Sveiki, ${vocativeName || 'Kliente'}!</h1>
            <p style="font-size: 16px; line-height: 1.5;">
              Gavome jūsų paskolos užklausą ir susisieksime su jumis artimiausiu metu.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937;">Jūsų užklausos detalės:</h2>
              <p><strong>Vardas:</strong> ${name || 'Nenurodyta'}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos tipas:</strong> ${loanType || 'Nenurodyta'}</p>
              <p><strong>Paskolos suma:</strong> ${amount || 'Nenurodyta'}€</p>
              <p><strong>Laikotarpis:</strong> ${loanPeriod || 'Nenurodyta'}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">
              Mūsų specialistai peržiūrės jūsų užklausą ir susisieks su jumis per <strong>30 minučių</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.5;">
              Geriausios sėkmės,<br>
              <strong>${brand.name} komanda</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              Šis laiškas buvo išsiųstas, nes užpildėte paskolos užklausos formą adresu ${brand.website}
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Failed to send client confirmation:", await emailResponse.text());
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Užklausa gauta. Susisieksime su jumis greitai.",
      id: submissionData.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in submit-inquiry function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);