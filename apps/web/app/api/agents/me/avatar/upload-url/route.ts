// app/api/agents/me/avatar/upload-url/route.ts
// POST /agents/me/avatar/upload-url { content_type } — signed upload URL untuk foto profil (migration 0158, bucket publik `avatars`). Alur: (1) endpoint ini, (2) klien PUT gambar hasil
// pangkas 512x512 (WebP/JPEG, maks 3 MB) ke `upload_url` dengan Content-Type sama, (3) PUT /agents/me/avatar { path } memasang foto ke profil. Profil Agent harus sudah ada.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { createAvatarUpload, imageUploadUrlSchema } from "@/lib/storage/public-images";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengunggah foto profil.");
  const body = await validateJsonBody(ctx.request, imageUploadUrlSchema);
  const supabase = await createClient();
  const { data: profile, error } = await supabase.from("agent_profiles").select("id").eq("user_id", ctx.userId).maybeSingle();
  if (error) throw error;
  if (!profile) throw new ApiError("CONFLICT", "Lengkapi profil Agent lebih dulu sebelum mengunggah foto.");
  return { data: { ...(await createAvatarUpload(ctx.userId, body.content_type)), method: "PUT" }, status: 201 };
});
