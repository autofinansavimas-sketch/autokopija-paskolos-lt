import { supabase } from "@/integrations/supabase/client";

type SyncType = "comment" | "status_change" | "reminder_created" | "reminder_completed";

interface SyncPayload {
  type: SyncType;
  submission_id: string;
  comment?: string;
  new_status?: string;
  reminder_info?: string;
}

export async function syncToMeta(payload: SyncPayload): Promise<void> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/sync-to-meta`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.warn("Meta sync failed:", await res.text());
    }
  } catch (err) {
    // Fire-and-forget, don't block admin workflow
    console.warn("Meta sync error:", err);
  }
}
