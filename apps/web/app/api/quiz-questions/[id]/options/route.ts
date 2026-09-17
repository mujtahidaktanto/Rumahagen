// app/api/quiz-questions/[id]/options/route.ts
// ADD-NEW — POST (admin/pemilik course create option, termasuk is_correct).
// SENGAJA TIDAK ADA GET di sini — quiz_options TIDAK BOLEH dibaca mentah
// oleh Agent yang mengerjakan quiz (kunci jawaban), lihat
// GET /quizzes/{id}/take untuk versi tersanitasi yang dipakai Agent.
// Otorisasi lewat RLS quiz_options_manage (0060) — pemilik course/staf saja.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createQuizOptionSchema } from "@/lib/validation/quizzes";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createQuizOptionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_options")
    .insert({ ...body, question_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
