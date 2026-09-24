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

// Jumlah add-on dan paket langganan yang merujuk tiap promosi (addons.promotion_id, subscription_plans.promotion_id: 0133/0143). Dipakai daftar
// Promosi admin ("Dipakai oleh"). RLS: staf configure melihat semua status; bukan staf hanya melihat yang aktif.
export interface LinkedCounts {
  addons: number;
  plans: number;
}

export async function getLinkedCounts(supabase: Supabase, promotionIds: string[]): Promise<Map<string, LinkedCounts>> {
  const result = new Map<string, LinkedCounts>();
  if (promotionIds.length === 0) {
    return result;
  }
  for (const id of promotionIds) {
    result.set(id, { addons: 0, plans: 0 });
  }
  const [addons, plans] = await Promise.all([
    supabase.from("addons").select("promotion_id").in("promotion_id", promotionIds),
    supabase.from("subscription_plans").select("promotion_id").in("promotion_id", promotionIds),
  ]);
  if (addons.error) {
    throw addons.error;
  }
  if (plans.error) {
    throw plans.error;
  }
  for (const row of (addons.data ?? []) as { promotion_id: string | null }[]) {
    if (row.promotion_id) result.get(row.promotion_id)!.addons += 1;
  }
  for (const row of (plans.data ?? []) as { promotion_id: string | null }[]) {
    if (row.promotion_id) result.get(row.promotion_id)!.plans += 1;
  }
  return result;
}
