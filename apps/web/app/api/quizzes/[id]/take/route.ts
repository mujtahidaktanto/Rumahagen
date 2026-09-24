// app/api/quizzes/[id]/take/route.ts
// ADD-NEW — realisasi HTTP untuk "Agent mengerjakan quiz" yang aman:
// mengembalikan question_text + opsi jawaban (option_text SAJA, TANPA
// is_correct) untuk Agent yang enrolled. RLS quiz_options_select (0060)
// SENGAJA hanya mengizinkan pemilik course/staf membaca tabel quiz_options
// mentah (supaya kunci jawaban tidak bocor lewat query langsung) — endpoint
// ini memakai ADMIN CLIENT untuk membaca quiz_options (bypass RLS), TAPI
// tetap mengecek ownership (enrollment) MANUAL sebelum bypass itu dipakai,
// lalu men-strip is_correct dari respons — pola sama seperti
// admin_force_provider_connection() route (M13) yang strip
// encrypted_api_key sebelum dikirim ke client.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengerjakan quiz.");
  }

  const supabase = await createClient();

  // quizzes_select RLS (0060) sudah memastikan hanya pemilik course/staf/
  // enrolled agent yang bisa lihat baris quiz ini sama sekali.
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, course_id, title")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (quizError) {
    throw quizError;
  }
  if (!quiz) {
    throw new ApiError("NOT_FOUND", "Quiz tidak ditemukan atau Anda tidak punya akses.");
  }

  // Pengecekan MANUAL eksplisit: HARUS enrolled ke course ini (bukan
  // sekadar staf) supaya endpoint "take" tidak dipakai staf untuk
  // membocorkan opsi lewat jalur ini juga secara tidak sengaja.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", quiz.course_id)
    .eq("agent_id", ctx.userId)
    .maybeSingle();

  if (!enrollment) {
    throw new ApiError("FORBIDDEN", "Anda harus enroll ke course ini sebelum mengerjakan quiz.");
  }

  // Kuis yang rusak (tanpa soal, soal tanpa jawaban benar, dst.; migration 0135) tidak boleh dikerjakan karena tidak bisa dinilai wajar.
  const { data: problems } = await supabase.rpc("quiz_problems", { p_quiz_id: ctx.params.id });
  if (Array.isArray(problems) && problems.length > 0) {
    throw new ApiError("CONFLICT", "Kuis ini belum siap dikerjakan.");
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("id, question_text, question_type")
    .eq("quiz_id", ctx.params.id);

  if (questionsError) {
    throw questionsError;
  }

  const questionIds = (questions ?? []).map((q) => q.id);
  const admin = createAdminClient();
  const { data: options, error: optionsError } = await fetchOptionsForQuestions(admin, questionIds);

  if (optionsError) {
    throw optionsError;
  }

  const optionsByQuestion = new Map<string, { id: string; option_text: string }[]>();
  for (const opt of options ?? []) {
    const list = optionsByQuestion.get(opt.question_id) ?? [];
    list.push({ id: opt.id, option_text: opt.option_text });
    optionsByQuestion.set(opt.question_id, list);
  }

  const data = (questions ?? []).map((q) => ({
    ...q,
    options: optionsByQuestion.get(q.id) ?? [],
  }));

  return { data: { enrollment_id: enrollment.id, questions: data } };
});

async function fetchOptionsForQuestions(
  admin: ReturnType<typeof createAdminClient>,
  questionIds: string[],
) {
  if (questionIds.length === 0) {
    return { data: [], error: null };
  }
  return admin
    .from("quiz_options")
    .select("id, question_id, option_text")
    .in("question_id", questionIds);
}
