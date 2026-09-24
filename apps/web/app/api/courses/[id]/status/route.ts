// app/api/courses/[id]/status/route.ts
// ADD-NEW — transisi lifecycle draft/published/archived, pola sama seperti
// listings/status dan learning_sessions/status. Tidak ada API ID literal
// terpisah di STEP11-B4 (status transition digabung ke PUT /admin/courses/{id}
// di dokumen), tapi dipisah di sini konsisten dengan pola route status di
// seluruh repo — RLS courses_manage yang sama tetap menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { courseStatusSchema } from "@/lib/validation/courses";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, courseStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    // 23514 dari migration 0135: kursus tidak bisa diterbitkan bila ada kuis yang belum siap (pesan menyebut kuis dan masalah pertamanya).
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
