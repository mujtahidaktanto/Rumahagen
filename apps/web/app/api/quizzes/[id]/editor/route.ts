// app/api/quizzes/[id]/editor/route.ts
// ADD-NEW — GET data lengkap untuk editor kuis: soal beserta opsi (TERMASUK is_correct/kunci jawaban), masalah kesiapan (quiz_problems, migration 0135),
// dan has_attempts (struktur terkunci bila sudah dikerjakan). Hanya pengelola kursus/staf: pemeriksaan eksplisit m04.course.manage atas pemilik kursus,
// karena quizzes_select juga mengizinkan peserta terdaftar. Peserta memakai GET /quizzes/{id}/take (tanpa kunci jawaban).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const supabase = await createClient();

  const { data: quiz, error: quizError } = await supabase.from("quizzes").select("id, course_id, title").eq("id", ctx.params.id).maybeSingle();
  if (quizError) {
    throw quizError;
  }
  if (!quiz) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan atau Anda tidak punya akses.");
  }
  const { data: course, error: courseError } = await supabase.from("courses").select("created_by").eq("id", quiz.course_id).maybeSingle();
  if (courseError) {
    throw courseError;
  }
  const { data: canManage } = await supabase.rpc("has_permission", { p_action_code: "m04.course.manage", p_owner_id: course?.created_by ?? null });
  if (canManage !== true) {
    throw new ApiError("FORBIDDEN", "Hanya pengelola kursus yang boleh membuka editor kuis.");
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("id, question_text, question_type")
    .eq("quiz_id", ctx.params.id)
    .order("id");
  if (questionsError) {
    throw questionsError;
  }
  const ids = (questions ?? []).map((q) => q.id);
  const { data: options, error: optionsError } = ids.length
    ? await supabase.from("quiz_options").select("id, question_id, option_text, is_correct").in("question_id", ids).order("id")
    : { data: [], error: null };
  if (optionsError) {
    throw optionsError;
  }
  const { data: problems } = await supabase.rpc("quiz_problems", { p_quiz_id: ctx.params.id });
  const { data: hasAttempts } = await supabase.rpc("quiz_has_attempts", { p_quiz_id: ctx.params.id });

  const byQuestion = new Map<string, unknown[]>();
  for (const o of options ?? []) {
    const list = byQuestion.get(o.question_id) ?? [];
    list.push(o);
    byQuestion.set(o.question_id, list);
  }

  return {
    data: {
      quiz,
      questions: (questions ?? []).map((q) => ({ ...q, options: byQuestion.get(q.id) ?? [] })),
      problems: (problems as string[] | null) ?? [],
      ready: ((problems as string[] | null) ?? []).length === 0,
      has_attempts: hasAttempts === true,
    },
  };
});
