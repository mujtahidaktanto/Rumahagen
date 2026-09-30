// app/api/courses/[id]/lessons/upload-url/route.ts
// POST /courses/{id}/lessons/upload-url { file_name, content_type } — signed upload URL untuk materi PDF/Slide pelajaran (migration 0168, bucket publik
// `course-materials`, PDF maks 20 MB). Video TIDAK lewat sini (tetap tautan URL). Otorisasi: has_permission('m04.course.manage', course.created_by) — sama
// seperti RLS course_lessons_manage (0056): pemilik course (Instruktur) atau staf.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { createCourseMaterialUploadSchema } from "@/lib/validation/courses";
import { createCourseMaterialUpload } from "@/lib/storage/course-materials";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, createCourseMaterialUploadSchema);
  const supabase = await createClient();

  const { data: course, error } = await supabase.from("courses").select("id, created_by").eq("id", ctx.params.id).maybeSingle<{ id: string; created_by: string | null }>();
  if (error) throw error;
  if (!course) throw new ApiError("NOT_FOUND", "Kursus tidak ditemukan.");

  const { data: allowed, error: permError } = await supabase.rpc("has_permission", { p_action_code: "m04.course.manage", p_owner_id: course.created_by });
  if (permError) throw permError;
  if (!allowed) throw new ApiError("FORBIDDEN", "Anda tidak berhak mengunggah materi untuk kursus ini.");

  return { data: { ...(await createCourseMaterialUpload(course.id, body.file_name)), method: "PUT", content_type: body.content_type }, status: 201 };
});
