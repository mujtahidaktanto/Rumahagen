// app/api/listings/[id]/media/route.ts
// API-030 POST /listings/{id}/media — media upload route (STEP11-B2).
// GET (ADD-NEW — wajib ada supaya klien bisa menemukan media_id untuk
// DELETE/set-cover sama sekali, pola sama seperti quizzes/{id}/take di M04:
// tanpa GET, POST/DELETE/set-cover tidak bisa dipakai lewat REST). `media_type`
// discriminator menentukan tabel tujuan (listing_photos vs listing_videos)
// — STEP10-D memisahkan kedua entity ini, STEP11-B2 menyatukannya sebagai
// satu konsep "media" di lapisan API.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createListingMediaSchema } from "@/lib/validation/listing-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const [{ data: photos, error: photoErr }, { data: videos, error: videoErr }] = await Promise.all([
    supabase.from("listing_photos").select("*").eq("listing_id", ctx.params.id).order("sort_order"),
    supabase.from("listing_videos").select("*").eq("listing_id", ctx.params.id),
  ]);

  if (photoErr) {
    throw photoErr;
  }
  if (videoErr) {
    throw videoErr;
  }

  return {
    data: {
      photos: photos ?? [],
      videos: videos ?? [],
    },
  };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createListingMediaSchema);
  const supabase = await createClient();

  if (body.media_type === "photo") {
    const { data, error } = await supabase
      .from("listing_photos")
      .insert({
        listing_id: ctx.params.id,
        url: body.url,
        alt_text: body.alt_text ?? null,
        is_cover: body.is_cover ?? false,
        sort_order: body.sort_order ?? 0,
        file_hash: body.file_hash ?? null,
        photo_hash: body.photo_hash ?? null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return { data: { media_type: "photo", ...data }, status: 201 };
  }

  const { data, error } = await supabase
    .from("listing_videos")
    .insert({
      listing_id: ctx.params.id,
      url: body.url,
      type: body.media_type,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return { data: { media_type: body.media_type, ...data }, status: 201 };
});
