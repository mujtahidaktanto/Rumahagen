// app/api/quizzes/[id]/questions/route.ts
// ADD-NEW — GET (list question_text/question_type, TIDAK termasuk opsi
// jawaban — lihat quiz_options di bawah), POST (admin create question).
// Otorisasi lewat RLS quiz_questions_select/_manage (0060).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createQuizQuestionSchema } from "@/lib/validation/quizzes";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question_text, question_type")
    .eq("quiz_id", ctx.params.id);

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createQuizQuestionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({ ...body, quiz_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
