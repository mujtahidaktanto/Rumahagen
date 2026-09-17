// app/api/learning/sessions/[id]/completion-outcomes/route.ts
// API-107 GET /learning/sessions/{id}/completion-outcomes.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_completion_outcomes")
    .select("*, session_enrollments!inner(session_id)")
    .eq("session_enrollments.session_id", ctx.params.id)
    .order("completed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
