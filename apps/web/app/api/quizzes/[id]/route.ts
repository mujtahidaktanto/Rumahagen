// app/api/quizzes/[id]/route.ts
// ADD-NEW — GET satu kuis (dengan jumlah soal dan status percobaan), PUT ubah judul, DELETE hapus kuis. Otorisasi lewat RLS quizzes_select/
// quizzes_manage (m04.course.manage: pemilik kursus/staf). Migration 0135: kuis yang sudah dikerjakan peserta tidak bisa dihapus dan kuis tidak
// bisa dipindah kursus; pelanggaran dikembalikan sebagai 409.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateQuizSchema } from "@/lib/validation/quizzes";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quizzes").select("id, course_id, title").eq("id", ctx.params.id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan atau Anda tidak punya akses.");
  }
  const { count } = await supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", ctx.params.id);
  const { data: hasAttempts } = await supabase.rpc("quiz_has_attempts", { p_quiz_id: ctx.params.id });
  return { data: { ...data, question_count: count ?? 0, has_attempts: hasAttempts === true } };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateQuizSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .update({ title: body.title ?? null })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quizzes").delete().eq("id", ctx.params.id).select("id").maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
