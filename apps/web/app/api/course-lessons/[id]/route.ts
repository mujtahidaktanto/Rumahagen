// app/api/course-lessons/[id]/route.ts
// ADD-NEW — PUT update, DELETE hapus lesson. RLS course_lessons_manage
// (FOR ALL) sudah mencakup keduanya sejak 0056.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateCourseLessonSchema } from "@/lib/validation/courses";
import { ApiError } from "@/lib/api/errors";
import { removeCourseMaterialByUrl } from "@/lib/storage/course-materials";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateCourseLessonSchema);
  const supabase = await createClient();

  const { data: before } = await supabase.from("course_lessons").select("content_url").eq("id", ctx.params.id).maybeSingle<{ content_url: string | null }>();

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

  // Berkas materi lama dihapus dari storage setelah diganti atau dilepas (tautan Video/eksternal diabaikan).
  if (before && "content_url" in body && before.content_url && before.content_url !== data.content_url) {
    await removeCourseMaterialByUrl(before.content_url);
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
    .maybeSingle<{ content_url: string | null }>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Lesson tidak ditemukan atau Anda tidak punya akses.");
  }

  await removeCourseMaterialByUrl(data.content_url);

  return { data };
});
