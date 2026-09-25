// app/api/quizzes/[id]/attempt-status/route.ts
// GET /quizzes/{id}/attempt-status?enrollment_id=... — status percobaan kuis untuk satu enrollment (migration 0150): jumlah percobaan terpakai, batas, jeda
// (menit), waktu boleh mencoba lagi, dan apakah sekarang boleh mencoba. Kursus internal (organizer_type = rumahagen) tanpa batas dan tanpa jeda; kursus
// partner/instructor memakai batas/jeda kursus atau pengaturan global. Hanya pemilik enrollment atau staf (m04.course_enrollment.view).

import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({ enrollment_id: z.string().uuid() });

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const { enrollment_id } = validateSearchParams(new URL(ctx.request.url).searchParams, querySchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("quiz_attempt_status", { p_enrollment_id: enrollment_id, p_quiz_id: ctx.params.id });
  if (error) {
    if (error.code === "42501") {
      throw new ApiError("NOT_FOUND", "Enrollment tidak ditemukan atau bukan milik Anda.");
    }
    throwIntegrityError(error);
  }

  return { data };
});
