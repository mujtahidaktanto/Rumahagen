// app/api/commercial/offers/route.ts
// API-177 GET /commercial/offers — Public/Auth. "Eligible offers" = addons
// aktif yang sedang terkait promotion (promotion_id NOT NULL). TIDAK
// menyertakan field promotions apa pun di respons — 0071 eksplisit:
// representasi publik promosi lewat public_announcement_promotion (M11),
// BUKAN mengekspos tabel promotions (staff-only) langsung dari sini.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { annotateAddonsWithPromotionOffers } from "@/lib/commercial/promotion-offers";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("addons")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .not("promotion_id", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  // Pengguna login: promotion_offer memuat kelayakan dan harga akhir untuk dirinya (migration 0134).
  const annotated = await annotateAddonsWithPromotionOffers(supabase, ctx.userId, data ?? []);
  return { data: annotated, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
