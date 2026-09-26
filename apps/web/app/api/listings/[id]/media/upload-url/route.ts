// app/api/listings/[id]/media/upload-url/route.ts
// POST /listings/{id}/media/upload-url { content_type } — tiga signed upload URL (varian 400/1080/2048 px) untuk satu foto listing (migration 0158, bucket publik `listing-photos`). Alur:
// (1) endpoint ini, (2) klien PUT ketiga varian hasil pengecilan (WebP/JPEG, maks 3 MB per berkas) dengan Content-Type sama, (3) POST /listings/{id}/media { media_type: "photo", url: <public_url
// varian 2048> } yang memeriksa ketiganya sudah ada. Hanya pemilik listing; maksimal 20 foto per listing.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { MAX_LISTING_PHOTOS } from "@/lib/media/variants";
import { createListingPhotoUploads, imageUploadUrlSchema } from "@/lib/storage/public-images";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengunggah foto.");
  const body = await validateJsonBody(ctx.request, imageUploadUrlSchema);
  const supabase = await createClient();

  const { data: listing, error } = await supabase.from("listings").select("id, agent_id").eq("id", ctx.params.id).maybeSingle<{ id: string; agent_id: string }>();
  if (error) throw error;
  if (!listing || listing.agent_id !== ctx.userId) throw new ApiError("NOT_FOUND", "Listing tidak ditemukan atau bukan milik Anda.");

  const { count, error: cErr } = await supabase.from("listing_photos").select("id", { count: "exact", head: true }).eq("listing_id", listing.id);
  if (cErr) throw cErr;
  if ((count ?? 0) >= MAX_LISTING_PHOTOS) throw new ApiError("CONFLICT", `Maksimal ${MAX_LISTING_PHOTOS} foto per listing.`);

  return { data: await createListingPhotoUploads(ctx.userId, listing.id, body.content_type), status: 201 };
});
