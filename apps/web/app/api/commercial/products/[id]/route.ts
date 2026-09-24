// app/api/commercial/products/[id]/route.ts
// API-176 GET /commercial/products/{product_id} — Public/Auth. Product =
// satu baris addons (lihat catatan di commercial/catalog/route.ts).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { annotateAddonsWithPromotionOffers } from "@/lib/commercial/promotion-offers";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Produk tidak ditemukan atau Anda tidak punya akses.");
  }

  const [annotated] = await annotateAddonsWithPromotionOffers(supabase, ctx.userId, [data]);
  return { data: annotated };
});
