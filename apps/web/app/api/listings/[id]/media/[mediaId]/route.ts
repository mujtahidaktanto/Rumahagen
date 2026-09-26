// app/api/listings/[id]/media/[mediaId]/route.ts
// API-031 DELETE /listings/{id}/media/{media_id} — media removal (STEP11-B2).
// media_id bisa merujuk listing_photos ATAU listing_videos — coba hapus dari
// keduanya (UUID gen_random_uuid() dari 2 tabel terpisah, tabrakan id lintas
// tabel praktis mustahil), RLS listing_photos_manage/listing_videos_manage
// (pemilik listing/staf) tetap menggerbangi kedua percobaan.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { removeListingPhotoObjects } from "@/lib/storage/public-images";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: deletedPhoto, error: photoErr } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", ctx.params.mediaId)
    .eq("listing_id", ctx.params.id)
    .select("id, url")
    .maybeSingle<{ id: string; url: string }>();

  if (photoErr) {
    throw photoErr;
  }
  if (deletedPhoto) {
    await removeListingPhotoObjects(deletedPhoto.url); // varian 400/1080/2048 hasil unggah ikut dihapus (tautan eksternal lama diabaikan)
    return { data: { id: deletedPhoto.id, media_type: "photo" } };
  }

  const { data: deletedVideo, error: videoErr } = await supabase
    .from("listing_videos")
    .delete()
    .eq("id", ctx.params.mediaId)
    .eq("listing_id", ctx.params.id)
    .select("id")
    .maybeSingle();

  if (videoErr) {
    throw videoErr;
  }
  if (deletedVideo) {
    return { data: { id: deletedVideo.id, media_type: "video" } };
  }

  throw new ApiError("NOT_FOUND", "Media tidak ditemukan atau Anda tidak punya akses.");
});
