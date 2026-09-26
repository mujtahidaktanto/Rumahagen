// lib/admin/commercial-catalog-data.ts — Katalog Add-on, Promosi, Paket Langganan (M14). RLS: addons_select/subscription_plans_select mengizinkan SEMUA pengguna terautentikasi melihat baris
// 'active' (katalog publik) + staf (m14.commercial_administration.configure, HANYA Superadmin+Admin — Manager TIDAK diberi grant) melihat SEMUA status. promotions HANYA punya promotions_manage
// (FOR ALL, staf-only) — TIDAK ADA select policy terpisah, jadi Manager benar-benar tidak bisa melihat promosi sama sekali (beda dari addon/paket yang setidaknya lihat baris 'active').
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import { derivePromotionState } from "@/lib/commercial/promotion-state";
import { getLinkedCounts, getRedemptionCounts } from "@/lib/commercial/promotion-usage";

export type AddonStatus = "draft" | "active" | "inactive";
export type AddonValidityType = "days" | "unlimited";
export type AddonCapacityType = "listing_refresh" | "learning_point" | "listing_slot";
export type AdditionalCapacity = { capacity_type: AddonCapacityType; capacity_value: number };

export type AddonRow = {
  id: string;
  code: string;
  name: string;
  price: number | null;
  currency: string;
  validityType: AddonValidityType;
  validityDays: number | null;
  capacityType: AddonCapacityType | null;
  capacityValue: number | null;
  additionalCapacities: AdditionalCapacity[];
  promotionId: string | null;
  promotionName: string | null;
  status: AddonStatus;
  orderCount: number;
  termsLocked: boolean;
};

export async function getAddons(): Promise<Part<AddonRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addons")
    .select("id, code, name, price, currency, validity_type, validity_days, capacity_type, capacity_value, additional_capacities, promotion_id, status, promotions(name)")
    .order("created_at", { ascending: false })
    .returns<
      {
        id: string;
        code: string;
        name: string;
        price: number | null;
        currency: string;
        validity_type: AddonValidityType;
        validity_days: number | null;
        capacity_type: AddonCapacityType | null;
        capacity_value: number | null;
        additional_capacities: AdditionalCapacity[];
        promotion_id: string | null;
        status: AddonStatus;
        promotions: { name: string } | null;
      }[]
    >();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const addonIds = data.map((a) => a.id);
  const { data: orders, error: ordersErr } = await supabase.from("commercial_orders").select("addon_id").in("addon_id", addonIds).returns<{ addon_id: string | null }[]>();
  if (ordersErr) return { ok: false };
  const orderCountByAddon = new Map<string, number>();
  for (const o of orders ?? []) {
    if (!o.addon_id) continue;
    orderCountByAddon.set(o.addon_id, (orderCountByAddon.get(o.addon_id) ?? 0) + 1);
  }

  return {
    ok: true,
    data: data.map((a) => {
      const orderCount = orderCountByAddon.get(a.id) ?? 0;
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        price: a.price,
        currency: a.currency,
        validityType: a.validity_type,
        validityDays: a.validity_days,
        capacityType: a.capacity_type,
        capacityValue: a.capacity_value,
        additionalCapacities: a.additional_capacities ?? [],
        promotionId: a.promotion_id,
        promotionName: a.promotions?.name ?? null,
        status: a.status,
        orderCount,
        termsLocked: orderCount > 0,
      };
    }),
  };
}

export type PromotionStatus = "draft" | "active" | "inactive" | "expired";
export type PromotionEffectiveStatus = "draft" | "scheduled" | "active" | "expired" | "inactive";
export type PromotionRow = {
  id: string;
  code: string;
  name: string;
  percentOff: number | null;
  amountOff: number | null;
  validFrom: string | null;
  validTo: string | null;
  eligibilityRoles: string[] | null;
  maxRedemptions: number | null;
  status: PromotionStatus;
  effectiveStatus: PromotionEffectiveStatus;
  redemptionCount: number;
  linkedAddonCount: number;
  linkedPlanCount: number;
};

export async function getPromotions(): Promise<Part<PromotionRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("id, code, name, benefit_configuration, eligibility_configuration, valid_from, valid_to, status")
    .order("created_at", { ascending: false })
    .returns<
      {
        id: string;
        code: string;
        name: string;
        benefit_configuration: { percent_off?: number; amount_off?: number };
        eligibility_configuration: { roles?: string[]; max_redemptions?: number } | null;
        valid_from: string | null;
        valid_to: string | null;
        status: PromotionStatus;
      }[]
    >();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const promoIds = data.map((p) => p.id);
  const [redemptionCounts, linkedCounts] = await Promise.all([getRedemptionCounts(supabase, promoIds), getLinkedCounts(supabase, promoIds)]);

  return {
    ok: true,
    data: data.map((p) => {
      const { effective_status } = derivePromotionState(p);
      const linked = linkedCounts.get(p.id);
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        percentOff: p.benefit_configuration?.percent_off ?? null,
        amountOff: p.benefit_configuration?.amount_off ?? null,
        validFrom: p.valid_from,
        validTo: p.valid_to,
        eligibilityRoles: p.eligibility_configuration?.roles ?? null,
        maxRedemptions: p.eligibility_configuration?.max_redemptions ?? null,
        status: p.status,
        effectiveStatus: effective_status,
        redemptionCount: redemptionCounts.get(p.id) ?? 0,
        linkedAddonCount: linked?.addons ?? 0,
        linkedPlanCount: linked?.plans ?? 0,
      };
    }),
  };
}

export type PlanStatus = "draft" | "active" | "inactive";
export type PlanRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  durationMonths: number;
  pricePersonal: number | null;
  priceOrganization: number | null;
  currency: string;
  promotionId: string | null;
  promotionName: string | null;
  status: PlanStatus;
  orderCount: number;
  termsLocked: boolean;
};

export async function getPlans(): Promise<Part<PlanRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, code, name, description, duration_months, price_personal, price_organization, currency, promotion_id, status, promotions(name)")
    .order("duration_months", { ascending: true })
    .returns<
      {
        id: string;
        code: string;
        name: string;
        description: string | null;
        duration_months: number;
        price_personal: number | null;
        price_organization: number | null;
        currency: string;
        promotion_id: string | null;
        status: PlanStatus;
        promotions: { name: string } | null;
      }[]
    >();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const planIds = data.map((p) => p.id);
  const { data: orders, error: ordersErr } = await supabase.from("commercial_orders").select("subscription_plan_id").in("subscription_plan_id", planIds).returns<{ subscription_plan_id: string | null }[]>();
  if (ordersErr) return { ok: false };
  const orderCountByPlan = new Map<string, number>();
  for (const o of orders ?? []) {
    if (!o.subscription_plan_id) continue;
    orderCountByPlan.set(o.subscription_plan_id, (orderCountByPlan.get(o.subscription_plan_id) ?? 0) + 1);
  }

  return {
    ok: true,
    data: data.map((p) => {
      const orderCount = orderCountByPlan.get(p.id) ?? 0;
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        durationMonths: p.duration_months,
        pricePersonal: p.price_personal,
        priceOrganization: p.price_organization,
        currency: p.currency,
        promotionId: p.promotion_id,
        promotionName: p.promotions?.name ?? null,
        status: p.status,
        orderCount,
        termsLocked: orderCount > 0,
      };
    }),
  };
}

/** Promosi yang bisa dipilih pada dialog Add-on/Paket — status 'active' saja (sesuai wireframe: "Menampilkan promosi berstatus Aktif"). */
export async function getActivePromotionsForPicker(): Promise<Part<PromotionRow[]>> {
  const all = await getPromotions();
  if (!all.ok) return all;
  return { ok: true, data: all.data.filter((p) => p.status === "active") };
}
