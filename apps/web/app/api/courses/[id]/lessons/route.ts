// app/api/courses/[id]/lessons/route.ts
// API-059 POST /admin/courses/{id}/lessons (create lesson). GET (list)
// ADD-NEW pelengkap wajar untuk menampilkan daftar lesson course. Otorisasi
// lewat RLS course_lessons_select/_manage (0056) — join ke courses.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createCourseLessonSchema } from "@/lib/validation/courses";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", ctx.params.id)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createCourseLessonSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lessons")
    .insert({ ...body, course_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
