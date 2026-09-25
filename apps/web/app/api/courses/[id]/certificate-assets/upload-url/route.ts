// app/api/courses/[id]/certificate-assets/upload-url/route.ts
// POST /courses/{id}/certificate-assets/upload-url { kind: "logo"|"signature", content_type, size_bytes? } — signed upload URL untuk logo mitra atau tanda tangan
// kursus (migration 0150). Alur: (1) endpoint ini, (2) klien PUT gambar ke `upload_url`, (3) PUT /courses/{id}/certificate-config yang memuat `path`.
// Hanya staf (m04.course.publish). Bucket privat `certificate-assets`, PNG/JPEG/WebP maksimal 1 MB; maksimal 2 logo mitra per kursus ditegakkan database.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/api/require-permission";
import { validateJsonBody } from "@/lib/api/validate";
import { courseCertAssetUploadSchema } from "@/lib/validation/learning-settings";
import { MAX_CERT_ASSET_BYTES, courseAssetPath, createCertAssetUploadTarget } from "@/lib/storage/certificate-assets";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const body = await validateJsonBody(ctx.request, courseCertAssetUploadSchema);
  const supabase = await createClient();
  await requirePermission(supabase, "m04.course.publish", "Hanya staf yang boleh mengatur logo dan tanda tangan sertifikat.");

  const { data: course, error } = await supabase.from("courses").select("id").eq("id", ctx.params.id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!course) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }

  const path = courseAssetPath(course.id, body.kind, body.content_type);
  const target = await createCertAssetUploadTarget(path);
  return {
    data: { path, upload_url: target.signedUrl, token: target.token, method: "PUT", content_type: body.content_type, max_bytes: MAX_CERT_ASSET_BYTES },
    status: 201,
  };
});
