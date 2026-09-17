// app/api/learning/session-enrollments/[id]/attendance/route.ts
// API-106 GET .../attendance — attendance milik satu enrollment.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_attendance_evaluations")
    .select("*")
    .eq("session_enrollment_id", ctx.params.id)
    .order("evaluated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
