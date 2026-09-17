// app/api/course-lessons/[id]/route.ts
// ADD-NEW — PUT update, DELETE hapus lesson. RLS course_lessons_manage
// (FOR ALL) sudah mencakup keduanya sejak 0056.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateCourseLessonSchema } from "@/lib/validation/courses";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateCourseLessonSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lessons")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Lesson tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_lessons")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Lesson tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
