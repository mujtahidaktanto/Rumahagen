// app/api/admin/banners/upload-url/route.ts
// POST /admin/banners/upload-url { content_type } — signed upload URL untuk gambar banner (migration 0166, bucket publik `announcement-media`, WebP/JPEG maks 3 MB).
// Otorisasi: permission m11.announcement_promotion.publish (sama seperti CRUD banner, RLS public_announcement_promotion_manage_m11, koreksi 0028). Setelah PUT
// berkas, pasang public_url yang dikembalikan ke image_reference lewat POST/PUT /admin/banners(/{id}).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/api/require-permission";
import { validateJsonBody } from "@/lib/api/validate";
import { imageUploadUrlSchema } from "@/lib/storage/public-images";
import { createAnnouncementMediaUpload } from "@/lib/storage/announcement-media";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, imageUploadUrlSchema);
  const supabase = await createClient();
  await requirePermission(supabase, "m11.announcement_promotion.publish", "Anda tidak punya izin mengelola banner.");
  return { data: { ...(await createAnnouncementMediaUpload(body.content_type)), method: "PUT" }, status: 201 };
});
