import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // First, get IDs of submissions to delete
    const { data: submissionsToDelete, error: selectError } = await supabase
      .from("contact_submissions")
      .select("id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", threeMonthsAgo.toISOString());

    if (selectError) {
      throw selectError;
    }

    if (!submissionsToDelete || submissionsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: "No old submissions to delete", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ids = submissionsToDelete.map((s) => s.id);

    // Delete related comments first
    const { error: commentsError } = await supabase
      .from("submission_comments")
      .delete()
      .in("submission_id", ids);

    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
    }

    // Delete the submissions
    const { error: deleteError } = await supabase
      .from("contact_submissions")
      .delete()
      .in("id", ids);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Deleted ${ids.length} old submissions`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully deleted ${ids.length} old submissions`,
        deleted: ids.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
