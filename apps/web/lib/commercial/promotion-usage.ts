// lib/commercial/promotion-usage.ts
// Jumlah pemakaian promosi untuk admin: pesanan berstatus pending dan confirmed yang membawa promosi (migration 0134,
// promotion_redemption_counts, hanya untuk staf configure). Pesanan cancelled/expired mengembalikan kuota.

import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function getRedemptionCounts(supabase: Supabase, promotionIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (promotionIds.length === 0) {
    return counts;
  }
  const { data, error } = await supabase.rpc("promotion_redemption_counts", { p_ids: promotionIds });
  if (error) {
    throw error;
  }
  for (const row of (data ?? []) as { promotion_id: string; redemptions: number | string }[]) {
    counts.set(row.promotion_id, Number(row.redemptions));
  }
  return counts;
}
