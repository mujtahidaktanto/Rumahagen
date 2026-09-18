// app/api/listings/[id]/amenities/[amenityId]/route.ts
// ADD-NEW — detach amenity dari listing (junction table, PK komposit
// listing_id+amenity_id, tidak ada kolom id sendiri).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_amenities")
    .delete()
    .eq("listing_id", ctx.params.id)
    .eq("amenity_id", ctx.params.amenityId)
    .select("amenity_id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Amenity tidak terpasang di listing ini atau Anda tidak punya akses.");
  }

  return { data };
});
