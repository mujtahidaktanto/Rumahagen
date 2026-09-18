// app/api/listings/[id]/media/[mediaId]/set-cover/route.ts
// API-032 PUT /listings/{id}/media/{media_id}/set-cover — cover-management
// route (STEP11-B2). Hanya berlaku untuk listing_photos (is_cover tidak ada
// di listing_videos). Menjadikan satu foto sebagai cover berarti melepas
// status cover dari foto lain milik listing yang sama — bukan invarian yang
// dikunci CHECK/UNIQUE di DB (tidak dievidence eksplisit), tapi interpretasi
// paling wajar dari "set-cover" sebagai flag eksklusif (satu hero photo per
// listing), dilakukan di lapisan aplikasi lewat dua langkah UPDATE.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: target, error: findErr } = await supabase
    .from("listing_photos")
    .select("id")
    .eq("id", ctx.params.mediaId)
    .eq("listing_id", ctx.params.id)
    .maybeSingle();

  if (findErr) {
    throw findErr;
  }
  if (!target) {
    throw new ApiError("NOT_FOUND", "Foto tidak ditemukan atau Anda tidak punya akses.");
  }

  const { error: unsetErr } = await supabase
    .from("listing_photos")
    .update({ is_cover: false })
    .eq("listing_id", ctx.params.id)
    .neq("id", ctx.params.mediaId);

  if (unsetErr) {
    throw unsetErr;
  }

  const { data, error } = await supabase
    .from("listing_photos")
    .update({ is_cover: true })
    .eq("id", ctx.params.mediaId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data };
});
