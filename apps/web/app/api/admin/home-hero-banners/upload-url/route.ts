// app/api/admin/home-hero-banners/upload-url/route.ts
// POST /admin/home-hero-banners/upload-url { content_type } — signed upload URL untuk gambar slide banner hero (migration 0167, bucket publik `home-hero-media`,
// WebP/JPEG maks 3 MB). Otorisasi: permission m11.static_public_content.publish (sama seperti CRUD slide, RLS home_hero_banners_manage). Setelah PUT berkas,
// pasang public_url yang dikembalikan ke image_reference lewat POST/PUT /admin/home-hero-banners(/{id}).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/api/require-permission";
import { validateJsonBody } from "@/lib/api/validate";
import { imageUploadUrlSchema } from "@/lib/storage/public-images";
import { createHomeHeroMediaUpload } from "@/lib/storage/home-hero-media";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, imageUploadUrlSchema);
  const supabase = await createClient();
  await requirePermission(supabase, "m11.static_public_content.publish", "Anda tidak punya izin mengelola banner hero.");
  return { data: { ...(await createHomeHeroMediaUpload(body.content_type)), method: "PUT" }, status: 201 };
});
