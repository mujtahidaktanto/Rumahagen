// app/api/courses/cover-upload-url/route.ts
// POST /courses/cover-upload-url { content_type } — signed upload URL untuk foto sampul kursus (migration 0170, bucket publik `course-covers`, WebP/JPEG 3 MB).
// TANPA course id di path — bisa dipanggil sebelum course dibuat (form "Buat Kursus"). Otorisasi: has_permission('m04.course.manage', auth.uid()) terhadap DIRI
// SENDIRI (bukan course tertentu) — lolos untuk Instruktur (own-scope, cocok otomatis) dan staf (all-scope); Agent biasa selalu ditolak.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { createCourseCoverUploadSchema } from "@/lib/validation/courses";
import { createCourseCoverUpload } from "@/lib/storage/course-covers";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, createCourseCoverUploadSchema);
  const supabase = await createClient();

  const { data: allowed, error: permError } = await supabase.rpc("has_permission", { p_action_code: "m04.course.manage", p_owner_id: ctx.userId });
  if (permError) throw permError;
  if (!allowed) throw new ApiError("FORBIDDEN", "Anda tidak berhak mengunggah foto sampul kursus.");

  return { data: { ...(await createCourseCoverUpload(ctx.userId, body.content_type)), method: "PUT" }, status: 201 };
});
