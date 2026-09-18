// app/api/amenities/[id]/route.ts
// ADD-NEW — kelola satu baris amenities (Superadmin, RLS
// amenities_write_superadmin).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAmenitySchema } from "@/lib/validation/listing-media";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAmenitySchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("amenities")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Amenity tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .delete()
    .eq("id", ctx.params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Amenity tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
