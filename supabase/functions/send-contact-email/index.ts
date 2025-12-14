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

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  amount: string;
  loanType?: string;
  loanPeriod?: string;
}

// Convert Lithuanian name to vocative case (šauksmininkas)
function toVocativeCase(name: string): string {
  if (!name || name.trim() === '') return name;
  
  const parts = name.trim().split(/\s+/);
  const convertedParts = parts.map(part => {
    const word = part.trim();
    if (word.length < 2) return word;
    
    // Preserve original capitalization
    const isCapitalized = word[0] === word[0].toUpperCase();
    const lowerWord = word.toLowerCase();
    
    let result = word;
    
    // Masculine endings
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
    }
    // Feminine endings
    else if (lowerWord.endsWith('ė')) {
      result = word.slice(0, -1) + 'e';
    } else if (lowerWord.endsWith('a')) {
      result = word.slice(0, -1) + 'a'; // stays the same or becomes -a
    }
    
    // Restore capitalization
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
    const { name, email, phone, amount, loanType, loanPeriod }: ContactEmailRequest = await req.json();

    console.log("Processing contact submission");
    console.log("Email:", email);
    console.log("Loan type:", loanType);
    console.log("Loan period:", loanPeriod);

    // Save submission to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { data: submissionData, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: name || null,
        email,
        phone,
        amount: amount || null,
        loan_type: loanType || null,
        loan_period: loanPeriod || null,
        status: "new"
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save submission to database:", dbError);
    } else {
      console.log("Submission saved to database with ID:", submissionData.id);
    }

    // Send notification email to admin
    const notificationEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AutoPaskolos <info@autopaskolos.lt>",
        to: ["autofinansavimas@gmail.com"],
        subject: `Nauja paskolos užklausa: ${loanType || 'Nenurodyta'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Nauja užklausa</h1>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Vardas:</strong> ${name}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos tipas:</strong> ${loanType || 'Nenurodyta'}</p>
              <p><strong>Paskolos suma:</strong> ${amount}€</p>
              <p><strong>Laikotarpis:</strong> ${loanPeriod || 'Nenurodyta'}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              <a href="https://autopaskolos.lt/admin" style="color: #2563eb;">Peržiūrėti admin panelėje →</a>
            </p>
          </div>
        `,
      }),
    });

    if (!notificationEmail.ok) {
      console.error("Failed to send notification email:", await notificationEmail.text());
    } else {
      console.log("Notification email sent to admin");
    }

    // Convert name to vocative case for greeting
    const vocativeName = toVocativeCase(name);
    
    // Try to send confirmation to client
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
            <h1 style="color: #2563eb;">Sveiki, ${vocativeName}!</h1>
            <p style="font-size: 16px; line-height: 1.5;">
              Gavome jūsų paskolos užklausą ir susisieksime su jumis artimiausiu metu.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937;">Jūsų užklausos detalės:</h2>
              <p><strong>Vardas:</strong> ${name}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos tipas:</strong> ${loanType || 'Nenurodyta'}</p>
              <p><strong>Paskolos suma:</strong> ${amount}€</p>
              <p><strong>Laikotarpis:</strong> ${loanPeriod || 'Nenurodyta'}</p>
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
      console.error("Failed to send client confirmation:", errorData);
    } else {
      console.log("Client confirmation sent successfully");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Užklausa gauta. Susisieksime su jumis greitai." 
    }), {
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
