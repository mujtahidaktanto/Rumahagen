// app/api/quiz-questions/[id]/route.ts
// ADD-NEW — PUT ubah soal (teks, jenis) dan DELETE hapus soal. RLS quiz_questions_manage (m04.course.manage). Migration 0135: pada kuis yang sudah
// dikerjakan peserta soal tidak bisa dihapus dan jenisnya tidak bisa diubah (teks tetap bisa diperbaiki); pelanggaran dikembalikan sebagai 409.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateQuizQuestionSchema } from "@/lib/validation/quizzes";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateQuizQuestionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .update(body)
    .eq("id", ctx.params.id)
    .select("id, quiz_id, question_text, question_type")
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Soal tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quiz_questions").delete().eq("id", ctx.params.id).select("id").maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Soal tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
