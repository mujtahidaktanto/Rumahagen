// app/api/learning/session-enrollments/[id]/status/route.ts
// API-096 PATCH .../status — staf-only (RLS session_enrollments_manage_staff,
// 0021: is_superadmin() OR admin/manager langsung, Gate §26 "NO NEW
// PERMISSION" — enrolee TIDAK bisa mengubah status sendiri lewat sini).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { enrollmentStatusSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, enrollmentStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_enrollments")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Session enrollment tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
