// app/api/courses/[id]/quizzes/route.ts
// API-060 POST /admin/courses/{id}/quizzes (create quiz). GET (list) untuk
// pemilik course/staf/agent yang enrolled — RLS quizzes_select (0060) sudah
// menggerbangi (pemilik course/staf ATAU enrolled agent), route ini tidak
// menduplikasi pengecekan.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createQuizSchema } from "@/lib/validation/quizzes";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("course_id", ctx.params.id);

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createQuizSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .insert({ ...body, course_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
