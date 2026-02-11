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
  source?: string;
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
    const { name, email, phone, amount, loanType, loanPeriod, source = "autopaskolos" }: ContactEmailRequest = await req.json();

    // Get brand configuration
    const brand = brandConfig[source as keyof typeof brandConfig] || brandConfig.autopaskolos;

    console.log("Processing contact submission");
    console.log("Email:", email);
    console.log("Source:", source);
    console.log("Brand:", brand.name);

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
        status: "new",
        source: source || "autopaskolos"
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
        from: brand.fromEmail,
        to: ["autofinansavimas@gmail.com"],
        subject: `[${brand.name}] Nauja paskolos užklausa: ${loanType || 'Nenurodyta'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${brand.primaryColor};">Nauja užklausa (${brand.name})</h1>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Šaltinis:</strong> ${brand.website}</p>
              <p><strong>Vardas:</strong> ${name}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              <p><strong>Telefonas:</strong> ${phone}</p>
              <p><strong>Paskolos tipas:</strong> ${loanType || 'Nenurodyta'}</p>
              <p><strong>Paskolos suma:</strong> ${amount}€</p>
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
        from: brand.fromEmail,
        to: [email],
        subject: "Gavome jūsų užklausą! ✅",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${brand.primaryColor}, ${brand.primaryColor}dd); padding: 36px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: 2px;">${brand.name.toUpperCase()}</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px; letter-spacing: 0.5px;">Geriausios paskolos sąlygos Lietuvoje</p>
            </div>

            <!-- Success banner -->
            <div style="background-color: #ecfdf5; padding: 16px 40px; text-align: center; border-bottom: 1px solid #d1fae5;">
              <p style="margin: 0; font-size: 15px; color: #065f46; font-weight: 600;">✅ Jūsų užklausa sėkmingai gauta!</p>
            </div>

            <!-- Main content -->
            <div style="padding: 32px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 6px; font-size: 22px; font-weight: 700;">Sveiki, ${vocativeName}! 👋</h2>
              <p style="font-size: 15px; line-height: 1.7; color: #4b5563; margin: 0 0 28px;">
                Dėkojame, kad pasirinkote <strong>${brand.name}</strong>! Mūsų specialistai jau pradėjo ieškoti geriausio pasiūlymo būtent jums.
              </p>

              <!-- Details card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; margin: 0 0 28px;">
                <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Jūsų užklausos detalės</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Paskolos tipas</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${loanType || 'Nenurodyta'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Norima suma</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${amount}€</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Laikotarpis</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">${loanPeriod || 'Nenurodyta'}</td>
                  </tr>
                </table>
              </div>

              <!-- Steps -->
              <div style="margin: 0 0 28px;">
                <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Kas vyks toliau?</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 16px; vertical-align: top; width: 40px;">
                      <div style="width: 32px; height: 32px; background: ${brand.primaryColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px;">1</div>
                    </td>
                    <td style="padding: 12px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                      <strong style="color: #1e293b;">Analizuojame</strong> — Palyginame 20+ kreditorių pasiūlymus
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; vertical-align: top;">
                      <div style="width: 32px; height: 32px; background: ${brand.primaryColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px;">2</div>
                    </td>
                    <td style="padding: 12px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                      <strong style="color: #1e293b;">Skambiname</strong> — Susisieksime per <strong style="color: ${brand.primaryColor};">30 min</strong> darbo metu
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; vertical-align: top;">
                      <div style="width: 32px; height: 32px; background: ${brand.primaryColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px;">3</div>
                    </td>
                    <td style="padding: 12px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                      <strong style="color: #1e293b;">Pasiūlome</strong> — Pateikiame geriausią variantą jums
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Call button -->
              <div style="text-align: center; margin: 0 0 28px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">Negalite laukti? Paskambinkite mums dabar:</p>
                <a href="tel:+37062851439" style="display: inline-block; background: ${brand.primaryColor}; color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.5px;">📞 +370 628 51439</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #1e293b;">${brand.name} komanda</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                <a href="https://${brand.website}" style="color: ${brand.primaryColor}; text-decoration: none; font-weight: 600;">${brand.website}</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="tel:+37062851439" style="color: ${brand.primaryColor}; text-decoration: none; font-weight: 600;">+370 628 51439</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Šis laiškas išsiųstas, nes užpildėte užklausos formą adresu ${brand.website}
              </p>
            </div>
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