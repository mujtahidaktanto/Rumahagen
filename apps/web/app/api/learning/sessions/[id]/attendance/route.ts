// app/api/learning/sessions/[id]/attendance/route.ts
// API-104 GET /learning/sessions/{id}/attendance — attendance dihubungkan
// lewat session_enrollment_id, di-join ke session_enrollments untuk scoping
// per session. Otorisasi lewat RLS session_attendance_evaluations_select (0022).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_attendance_evaluations")
    .select("*, session_enrollments!inner(session_id)")
    .eq("session_enrollments.session_id", ctx.params.id)
    .order("evaluated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
