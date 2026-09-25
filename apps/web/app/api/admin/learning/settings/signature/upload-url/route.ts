// app/api/admin/learning/settings/signature/upload-url/route.ts
// POST /admin/learning/settings/signature/upload-url { content_type, size_bytes? } — signed upload URL untuk tanda tangan BAWAAN (migration 0150). Alur: (1) endpoint
// ini, (2) klien PUT gambar ke `upload_url` (Content-Type sama; PNG transparan disarankan agar tanpa latar), (3) PATCH /admin/learning/settings
// { default_signer_signature_path: path }. Bucket privat `certificate-assets`, PNG/JPEG/WebP maksimal 1 MB. Hanya yang boleh mengelola konfigurasi belajar.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/api/require-permission";
import { validateJsonBody } from "@/lib/api/validate";
import { certAssetUploadSchema } from "@/lib/validation/learning-settings";
import { MAX_CERT_ASSET_BYTES, createCertAssetUploadTarget, defaultSignaturePath } from "@/lib/storage/certificate-assets";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const body = await validateJsonBody(ctx.request, certAssetUploadSchema);
  const supabase = await createClient();
  await requirePermission(supabase, "m04.learning_economy_configuration.manage", "Anda tidak punya izin mengelola pengaturan belajar.");

  const path = defaultSignaturePath(body.content_type);
  const target = await createCertAssetUploadTarget(path);
  return {
    data: { path, upload_url: target.signedUrl, token: target.token, method: "PUT", content_type: body.content_type, max_bytes: MAX_CERT_ASSET_BYTES },
    status: 201,
  };
});
