// app/api/courses/[id]/enroll/route.ts
// API-053 POST /courses/{id}/enroll — Course Enrollment, SECARA EKSPLISIT
// terpisah dari Session Enrollment (STEP11-B4 §8). Otorisasi lewat RLS
// enrollments_insert (0059) — m04.course_enrollment.create, Agent=own.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk enroll ke course.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ agent_id: ctx.userId, course_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Anda sudah enroll ke course ini.");
    }
    throw error;
  }

  return { data, status: 201 };
});
