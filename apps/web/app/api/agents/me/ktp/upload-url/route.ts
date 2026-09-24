// app/api/agents/me/ktp/upload-url/route.ts
// POST /agents/me/ktp/upload-url { content_type, size_bytes? } — meminta signed upload URL untuk foto KTP (migration 0149). Alur: (1) endpoint ini,
// (2) klien PUT gambar ke `upload_url` (Content-Type sama), (3) PUT /agents/me/ktp { ktp_number, photo_path } mengirim nomor KTP + path dan langsung
// memverifikasi akun. Bucket privat `agent-ktp`, JPEG/PNG/WebP maksimal 5 MB. Profil Agent harus sudah ada.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { ktpUploadUrlSchema } from "@/lib/validation/agent-ktp";
import { MAX_KTP_BYTES, createKtpUploadTarget, ktpPhotoPath } from "@/lib/storage/agent-ktp";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengunggah foto KTP.");
  }
  const body = await validateJsonBody(ctx.request, ktpUploadUrlSchema);
  const supabase = await createClient();

  const { data: profile, error } = await supabase.from("agent_profiles").select("id").eq("user_id", ctx.userId).maybeSingle();
  if (error) {
    throw error;
  }
  if (!profile) {
    throw new ApiError("CONFLICT", "Lengkapi profil Agent lebih dulu sebelum mengunggah KTP.");
  }

  const path = ktpPhotoPath(ctx.userId, body.content_type);
  const target = await createKtpUploadTarget(path);
  return {
    data: { path, upload_url: target.signedUrl, token: target.token, method: "PUT", content_type: body.content_type, max_bytes: MAX_KTP_BYTES },
    status: 201,
  };
});
