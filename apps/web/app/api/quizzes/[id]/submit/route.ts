// app/api/quizzes/[id]/submit/route.ts
// API-055 POST /courses/{id}/quiz/submit — "PRESERVE; not Award issuance".
// DEVIASI PATH TERDOKUMENTASI: dokumen menulis path bernaung di bawah
// /courses/{id}/quiz/submit (tunggal, seolah 1 course = 1 quiz), TAPI skema
// fisik quizzes.course_id membolehkan BANYAK quiz per course — endpoint di
// sini di-key oleh quiz_id sungguhan (`/quizzes/{id}/submit`) supaya cocok
// dengan realisasi skema yang ada, pola sama seperti M15
// qualification-evidence/{id}/evaluate (deviasi serupa, dijelaskan di sana).
//
// PENILAIAN (grading) WAJIB server-side pakai ADMIN CLIENT untuk membaca
// quiz_options.is_correct (RLS sengaja menyembunyikannya dari Agent — lihat
// 0060) — client HANYA mengirim jawaban yang dipilih, TIDAK PERNAH kunci
// jawaban. INSERT hasil (quiz_attempts) tetap lewat client BIASA supaya RLS
// quiz_attempts_insert (kepemilikan enrollment) tetap menggerbangi normal.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { submitQuizAttemptSchema } from "@/lib/validation/quizzes";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk submit quiz.");
  }

  const body = await validateJsonBody(ctx.request, submitQuizAttemptSchema);
  const supabase = await createClient();

  // Kepemilikan enrollment dicek lewat RLS biasa (enrollments_select scope
  // own) — kalau bukan milik ctx.userId, baris ini tidak akan terlihat.
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, agent_id, course_id")
    .eq("id", body.enrollment_id)
    .maybeSingle();

  if (enrollmentError) {
    throw enrollmentError;
  }
  if (!enrollment || enrollment.agent_id !== ctx.userId) {
    throw new ApiError("FORBIDDEN", "Enrollment tidak ditemukan atau bukan milik Anda.");
  }

  const admin = createAdminClient();

  // Kuis yang rusak tidak bisa dinilai wajar (migration 0135).
  const { data: quizProblems } = await admin.rpc("quiz_problems", { p_quiz_id: ctx.params.id });
  if (Array.isArray(quizProblems) && quizProblems.length > 0) {
    throw new ApiError("CONFLICT", "Kuis ini belum siap dikerjakan.");
  }

  const { data: quiz, error: quizError } = await admin
    .from("quizzes")
    .select("id, course_id")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (quizError) {
    throw quizError;
  }
  if (!quiz || quiz.course_id !== enrollment.course_id) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan untuk course pada enrollment ini.");
  }

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("passing_grade")
    .eq("id", quiz.course_id)
    .maybeSingle();
  if (courseError) {
    throw courseError;
  }

  // Penilaian memakai SELURUH soal kuis (bukan hanya yang dijawab), dan jawaban hanya boleh untuk soal kuis ini.
  const { data: quizQuestions, error: questionsError } = await admin
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", ctx.params.id);
  if (questionsError) {
    throw questionsError;
  }
  const questionIds = new Set((quizQuestions ?? []).map((q) => q.id));
  if (questionIds.size === 0) {
    throw new ApiError("VALIDATION_ERROR", "Quiz ini belum memiliki soal.");
  }
  const answeredIds = body.answers.map((a) => a.question_id);
  if (answeredIds.some((id) => !questionIds.has(id)) || new Set(answeredIds).size !== answeredIds.length) {
    throw new ApiError("VALIDATION_ERROR", "Jawaban memuat soal yang bukan bagian dari quiz ini atau terduplikasi.");
  }

  const { data: options, error: optionsError } = await admin
    .from("quiz_options")
    .select("id, question_id, is_correct")
    .in(
      "question_id",
      body.answers.map((a) => a.question_id),
    );

  if (optionsError) {
    throw optionsError;
  }

  const correctByQuestion = new Map<string, Set<string>>();
  for (const opt of options ?? []) {
    if (!opt.is_correct) continue;
    const set = correctByQuestion.get(opt.question_id) ?? new Set<string>();
    set.add(opt.id);
    correctByQuestion.set(opt.question_id, set);
  }

  let correctCount = 0;
  for (const answer of body.answers) {
    const correctSet = correctByQuestion.get(answer.question_id) ?? new Set<string>();
    const selectedSet = new Set(answer.selected_option_ids);
    const isExactMatch =
      correctSet.size === selectedSet.size && [...correctSet].every((id) => selectedSet.has(id));
    if (isExactMatch) correctCount += 1;
  }

  const score = (correctCount / questionIds.size) * 100;
  const passingGrade = course?.passing_grade ?? 70;
  const passed = score >= passingGrade;

  // Insert lewat admin client: quiz_attempts tidak punya policy INSERT untuk pengguna (0130), agar skor tidak bisa dipalsukan.
  // Kepemilikan enrollment sudah diperiksa manual di atas.
  const { data: attempt, error: attemptError } = await admin
    .from("quiz_attempts")
    .insert({
      enrollment_id: body.enrollment_id,
      quiz_id: ctx.params.id,
      score: Math.round(score * 100) / 100,
      passed,
    })
    .select()
    .single();

  if (attemptError) {
    throw attemptError;
  }

  return { data: attempt, status: 201 };
});
