import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Statuses that mean "we're still waiting on the client" — adjust as needed
const STALE_STATUSES = ["waiting", "contacted", "in_progress", "laukiama", "laukiu_dokumentu"];
const STALE_DAYS = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the super-admin user to own the auto-created reminders
    const { data: adminUsers } = await admin.auth.admin.listUsers({ perPage: 200 });
    const superAdmin = adminUsers?.users?.find((u) => u.email === "autofinansavimas@gmail.com");
    if (!superAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "no admin user" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const staleBefore = new Date(Date.now() - STALE_DAYS * 24 * 3600 * 1000).toISOString();
    const today = new Date().toISOString().slice(0, 10);

    // Submissions not touched for 3+ days, not completed/deleted
    const { data: stale, error } = await admin
      .from("contact_submissions")
      .select("id, name, status, updated_at")
      .is("deleted_at", null)
      .neq("status", "completed")
      .lt("updated_at", staleBefore)
      .limit(100);

    if (error) throw error;

    let created = 0;
    for (const s of stale || []) {
      // Skip if there's already an incomplete reminder for this submission
      const { data: existing } = await admin
        .from("call_reminders")
        .select("id")
        .eq("submission_id", s.id)
        .eq("completed", false)
        .limit(1);
      if (existing && existing.length > 0) continue;

      const { error: insErr } = await admin.from("call_reminders").insert({
        submission_id: s.id,
        user_id: superAdmin.id,
        call_date: today,
        call_time: "10:00",
        notes: `[Sistema] Klientas ${STALE_DAYS}+ dienas be veiksmo (statusas: ${s.status}). Susisiekite.`,
      });
      if (!insErr) created++;
    }

    return new Response(JSON.stringify({ ok: true, checked: stale?.length || 0, created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
