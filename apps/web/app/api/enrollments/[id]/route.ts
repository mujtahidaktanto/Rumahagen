// app/api/enrollments/[id]/route.ts
// ADD-NEW — GET satu enrollment, PATCH progress_percent/status milik
// sendiri. RLS enrollments_select/_update (0059) — m04.course_enrollment.view,
// Agent=own. Completion sesungguhnya (grant reward/certificate) tetap TIDAK
// otoritatif dari sini — lihat catatan learning_activity_completions/0058.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { enrollmentProgressSchema } from "@/lib/validation/course-enrollments";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Enrollment tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const PATCH = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, enrollmentProgressSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Enrollment tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
