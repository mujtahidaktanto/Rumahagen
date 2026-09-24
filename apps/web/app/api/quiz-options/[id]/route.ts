// app/api/quiz-options/[id]/route.ts
// ADD-NEW — PUT ubah opsi (teks, kunci jawaban) dan DELETE hapus opsi. Sengaja tanpa GET (kunci jawaban tidak boleh terbaca peserta; pengelola membaca
// lewat GET /quizzes/{id}/editor). RLS quiz_options_manage (m04.course.manage). Migration 0135: pada kuis yang sudah dikerjakan peserta opsi tidak
// bisa dihapus dan kunci jawaban tidak bisa diubah (teks tetap bisa diperbaiki); pelanggaran dikembalikan sebagai 409.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateQuizOptionSchema } from "@/lib/validation/quizzes";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateQuizOptionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_options")
    .update(body)
    .eq("id", ctx.params.id)
    .select("id, question_id, option_text, is_correct")
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Opsi tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_options").delete().eq("id", ctx.params.id).select("id").maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Opsi tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
