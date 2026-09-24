// app/api/commercial/catalog/route.ts
// API-175 GET /commercial/catalog — Public/Auth. Katalog produk M14 = addons
// (satu-satunya tabel katalog harga yang benar-benar ada — subscriptions
// adalah catatan instance milik user, BUKAN katalog, lihat catatan scope di
// migration 0079). RLS addons_select (0071) yang menggerbangi: status=active
// publik, staf lihat semua.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { annotateAddonsWithPromotionOffers } from "@/lib/commercial/promotion-offers";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const offerScopeSchema = z.object({ organization_id: z.string().uuid().optional() });

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const scope = validateSearchParams(url.searchParams, offerScopeSchema);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("addons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  // Pengguna login: setiap addon berpromosi diberi promotion_offer (berlaku/tidak, alasan, harga akhir).
  const annotated = await annotateAddonsWithPromotionOffers(supabase, ctx.userId, data ?? [], scope.organization_id ?? null);
  return { data: annotated, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
