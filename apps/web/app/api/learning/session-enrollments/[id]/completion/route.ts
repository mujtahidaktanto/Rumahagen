// app/api/learning/session-enrollments/[id]/completion/route.ts
// API-109 GET .../completion — completion outcome milik satu enrollment.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_completion_outcomes")
    .select("*")
    .eq("session_enrollment_id", ctx.params.id)
    .order("completed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
