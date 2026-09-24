// lib/commercial/promotion-offers.ts
// Untuk aplikasi pembeli: menambahkan `promotion_offer` pada addon yang punya promosi, berdasarkan RPC my_addon_promotion_offers
// (migration 0134). Menjawab, untuk pengguna yang login, apakah promosi addon berlaku (status, masa berlaku, kelayakan, kuota),
// alasan bila tidak, dan harga akhir; tanpa membuka konfigurasi promosi. Pengguna anonim mendapat promotion_offer null
// (kelayakan tidak bisa dievaluasi tanpa login).

import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface PromotionOffer {
  promotion_id: string;
  eligible: boolean;
  reason: string | null;
  list_price: number;
  final_amount: number;
}

export async function annotateAddonsWithPromotionOffers<T extends { id: string; promotion_id?: string | null }>(
  supabase: Supabase,
  userId: string | null,
  addons: T[],
): Promise<(T & { promotion_offer: PromotionOffer | null })[]> {
  const withPromo = addons.filter((a) => a.promotion_id);
  const offers = new Map<string, PromotionOffer>();

  if (userId && withPromo.length > 0) {
    const { data, error } = await supabase.rpc("my_addon_promotion_offers", { p_addon_ids: withPromo.map((a) => a.id) });
    if (error) {
      throw error;
    }
    for (const row of (data ?? []) as {
      addon_id: string;
      promotion_id: string;
      eligible: boolean;
      reason: string | null;
      list_price: number | string;
      final_amount: number | string;
    }[]) {
      offers.set(row.addon_id, {
        promotion_id: row.promotion_id,
        eligible: row.eligible,
        reason: row.reason,
        list_price: Number(row.list_price),
        final_amount: Number(row.final_amount),
      });
    }
  }

  return addons.map((a) => ({ ...a, promotion_offer: offers.get(a.id) ?? null }));
}
