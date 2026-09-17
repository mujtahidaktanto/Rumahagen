// app/api/learning/sessions/[id]/attendance/evaluate/route.ts
// API-105 POST .../attendance/evaluate. Otorisasi lewat RLS
// session_attendance_evaluations_manage (has_permission m04.attendance.manage,
// 0022) — Superadmin/Admin/Manager/Instructor, TIDAK PERNAH Agent (Gate §33
// tercermin di seed permission, ditegakkan RLS, bukan diduplikasi di sini).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { attendanceEvaluateSchema } from "@/lib/validation/learning-sessions";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, attendanceEvaluateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("session_attendance_evaluations").insert(body).select().single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
