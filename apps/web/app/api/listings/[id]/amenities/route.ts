// app/api/listings/[id]/amenities/route.ts
// ADD-NEW — kelola listing_amenities (junction N:N, M03 migration 0047).
// GET (list amenity milik listing), POST (attach) — pemilik listing lewat
// m03.listing.update.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { attachAmenitySchema } from "@/lib/validation/listing-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_amenities")
    .select("amenity_id, amenities(id, name)")
    .eq("listing_id", ctx.params.id);

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, attachAmenitySchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_amenities")
    .insert({ listing_id: ctx.params.id, amenity_id: body.amenity_id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
