// app/api/amenities/route.ts
// ADD-NEW — katalog referensi amenities (M03, migration 0047). Tidak ada
// literal endpoint di STEP11-B2, tapi tabel ini murni katalog publik
// (RLS amenities_select_public FOR SELECT USING (true)) yang dibutuhkan
// klien untuk memilih amenity saat menambah ke listing (listing_amenities)
// — tanpa GET ini, fitur amenity tidak bisa berfungsi lewat REST API sama
// sekali, pola sama seperti ref_provinces/dst.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAmenitySchema } from "@/lib/validation/listing-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("amenities").select("*").order("name");

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAmenitySchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("amenities").insert(body).select().single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
