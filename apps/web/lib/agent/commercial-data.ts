// lib/agent/commercial-data.ts — data layar Komersial Agent (M14), dibaca di server dengan RLS pemanggil: Katalog add-on (addons aktif + penawaran promosi), Pesanan & Kuota (pesanan sendiri, entitlement,
// saldo Refresh dan slot), dan Langganan Saya (langganan pribadi + organisasi yang diikuti, paket Pro aktif). Tiap bagian dimuat sendiri-sendiri: gagal di satu bagian tidak menjatuhkan halaman.
// Mutasi (buat pesanan, bayar, batalkan) TIDAK di sini: dikerjakan komponen klien lewat /api/commercial/*.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextOrg } from "@/lib/agent/context";
import { deriveSubscriptionState } from "@/lib/commercial/subscription-state";
import { annotateAddonsWithPromotionOffers, annotatePlansWithPromotionOffers, type PromotionOffer } from "@/lib/commercial/promotion-offers";
import { createClient } from "@/lib/supabase/server";
import { todayWIB } from "./time";
import { addonCapacities, addonValidityLabel, hasSlot, orderKind, orderProductName, type Capacity } from "./commercial-rules";

export type Part<T> = { ok: true; data: T } | { ok: false };

// ── Katalog ──
export type CatalogAddon = { id: string; code: string; name: string; price: number; capacities: Capacity[]; validityLabel: string; hasSlot: boolean; offer: PromotionOffer | null };
export type OwnerOption = { id: string; name: string };
export type CatalogData = { addons: Part<CatalogAddon[]>; orgs: OwnerOption[]; defaultOrgId: string | null };

type AddonRow = {
  id: string;
  code: string;
  name: string;
  price: number | string | null;
  capacity_type: string | null;
  capacity_value: number | string | null;
  additional_capacities: { capacity_type: string; capacity_value: number | string }[] | null;
  validity_type: string;
  validity_days: number | null;
  promotion_id: string | null;
};

export async function getCatalogData(userId: string, orgs: ContextOrg[], defaultOrgId: string | null): Promise<CatalogData> {
  const supabase = await createClient();
  const owners = orgs.map((o) => ({ id: o.id, name: o.name }));
  try {
    const { data, error } = await supabase
      .from("addons")
      .select("id, code, name, price, capacity_type, capacity_value, additional_capacities, validity_type, validity_days, promotion_id")
      .eq("status", "active")
      .order("price", { ascending: true })
      .limit(100)
      .returns<AddonRow[]>();
    if (error) return { addons: { ok: false }, orgs: owners, defaultOrgId };
    const rows = (data ?? []).filter((a) => Number(a.price) > 0);
    const annotated = await annotateAddonsWithPromotionOffers(supabase, userId, rows, null);
    return {
      addons: {
        ok: true,
        data: annotated.map((a) => ({ id: a.id, code: a.code, name: a.name, price: Number(a.price), capacities: addonCapacities(a), validityLabel: addonValidityLabel(a), hasSlot: hasSlot(a), offer: a.promotion_offer })),
      },
      orgs: owners,
      defaultOrgId,
    };
  } catch {
    return { addons: { ok: false }, orgs: owners, defaultOrgId };
  }
}

// ── Pesanan & Kuota ──
export type OrderItem = { id: string; orderNumber: string; name: string; kind: string; amount: number; placedAt: string; status: string; ownerOrg: string | null };
export type EntitlementItem = { id: string; type: string; capacity: number; status: string; startsAt: string | null; endsAt: string | null; ownerOrg: string | null };
export type Balances = { refreshStock: number | null; slotBalance: number | null };
export type OrdersData = { orders: Part<{ items: OrderItem[]; total: number }>; entitlements: Part<EntitlementItem[]>; balances: Part<Balances> };

export const ORDER_PAGE_SIZE = 10;

type OrderRow = { id: string; order_number: string; amount: number | string; status: string; placed_at: string; organization_id: string | null; addon_id: string | null; subscription_plan_id: string | null; commercial_snapshot: unknown };
type EntRow = { id: string; entitlement_type: string; capacity_value: number | string | null; lifecycle_status: string; starts_at: string | null; ends_at: string | null; organization_id: string | null };

async function loadOrders(supabase: SupabaseClient, userId: string, limit: number, orgName: (id: string | null) => string | null): Promise<Part<{ items: OrderItem[]; total: number }>> {
  const { data, count, error } = await supabase
    .from("commercial_orders")
    .select("id, order_number, amount, status, placed_at, organization_id, addon_id, subscription_plan_id, commercial_snapshot", { count: "exact" })
    .eq("user_id", userId)
    .order("placed_at", { ascending: false })
    .range(0, limit - 1)
    .returns<OrderRow[]>();
  if (error) return { ok: false };
  const items = (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    name: orderProductName(o.commercial_snapshot),
    kind: orderKind(o),
    amount: Number(o.amount),
    placedAt: o.placed_at,
    status: o.status,
    ownerOrg: orgName(o.organization_id),
  }));
  return { ok: true, data: { items, total: count ?? items.length } };
}

async function loadEntitlements(supabase: SupabaseClient, userId: string, orgName: (id: string | null) => string | null): Promise<Part<EntitlementItem[]>> {
  const { data, error } = await supabase
    .from("commercial_entitlements")
    .select("id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at, organization_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<EntRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((e) => ({ id: e.id, type: e.entitlement_type, capacity: Number(e.capacity_value ?? 0), status: e.lifecycle_status, startsAt: e.starts_at, endsAt: e.ends_at, ownerOrg: orgName(e.organization_id) })) };
}

/** Saldo yang benar-benar bisa dipakai: saldo Refresh add-on (stock_remaining) dan saldo slot beli pribadi (purchased.balance). Sisa per entitlement tidak dibuka API, jadi tidak ditampilkan per baris. */
async function loadBalances(supabase: SupabaseClient, now: Date): Promise<Part<Balances>> {
  const day = todayWIB(now);
  const [stats, quota] = await Promise.all([
    supabase.rpc("agent_statistics_summary", { p_from: day, p_to: day, p_organization_id: null }),
    supabase.rpc("listing_quota_summary", { p_organization_id: null }),
  ]);
  if (stats.error && quota.error) return { ok: false };
  const refresh = (stats.data as { quota?: { stock_remaining?: number } } | null)?.quota?.stock_remaining;
  const slots = (quota.data as { purchased?: { balance?: number } } | null)?.purchased?.balance;
  return { ok: true, data: { refreshStock: stats.error || refresh === undefined ? null : Number(refresh), slotBalance: quota.error || slots === undefined ? null : Number(slots) } };
}

export async function getOrdersData(userId: string, orgs: ContextOrg[], tampil: number, now: Date = new Date()): Promise<OrdersData> {
  const supabase = await createClient();
  const names = new Map(orgs.map((o) => [o.id, o.name]));
  const orgName = (id: string | null) => (id ? (names.get(id) ?? "Organisasi") : null);
  const [orders, entitlements, balances] = await Promise.all([loadOrders(supabase, userId, tampil, orgName), loadEntitlements(supabase, userId, orgName), loadBalances(supabase, now)]);
  return { orders, entitlements, balances };
}

// ── Langganan Saya ──
export type PlanItem = { id: string; code: string; name: string; description: string | null; durationMonths: number; pricePersonal: number | null; priceOrganization: number | null; offer: PromotionOffer | null };
export type SubscriptionItem = {
  id: string;
  productCode: string;
  productName: string;
  scope: "personal" | "organization";
  ownerOrg: string | null;
  status: string;
  effective: string;
  daysLeft: number | null;
  startsAt: string | null;
  endsAt: string | null;
  renewsAt: string | null;
  snapshot: Record<string, unknown> | null;
};
export type SubscriptionsData = {
  subscriptions: Part<{ items: SubscriptionItem[]; current: SubscriptionItem | null }>;
  plans: Part<PlanItem[]>;
  /** Organisasi tempat pengguna leader aktif (satu-satunya yang boleh membeli langganan organisasi). */
  leaderOrgs: OwnerOption[];
  memberOnlyOrgs: number;
  defaultOrgId: string | null;
};

type SubRow = { id: string; user_id: string | null; organization_id: string | null; product_code: string; status: string; starts_at: string | null; ends_at: string | null; renews_at: string | null; historical_purchase_snapshot: Record<string, unknown> | null };
type PlanRow = { id: string; code: string; name: string; description: string | null; duration_months: number; price_personal: number | string | null; price_organization: number | string | null; promotion_id: string | null };

export async function getSubscriptionsData(userId: string, orgs: ContextOrg[], defaultOrgId: string | null, now: Date = new Date()): Promise<SubscriptionsData> {
  const supabase = await createClient();
  const leaderOrgs = orgs.filter((o) => o.role === "leader").map((o) => ({ id: o.id, name: o.name }));
  const names = new Map(orgs.map((o) => [o.id, o.name]));

  const [plansRes, subsRes] = await Promise.all([
    supabase.from("subscription_plans").select("id, code, name, description, duration_months, price_personal, price_organization, promotion_id").eq("status", "active").order("duration_months", { ascending: true }).returns<PlanRow[]>(),
    supabase
      .from("subscriptions")
      .select("id, user_id, organization_id, product_code, status, starts_at, ends_at, renews_at, historical_purchase_snapshot")
      .or([`user_id.eq.${userId}`, ...(orgs.length > 0 ? [`organization_id.in.(${orgs.map((o) => o.id).join(",")})`] : [])].join(","))
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<SubRow[]>(),
  ]);

  let plans: Part<PlanItem[]> = { ok: false };
  const planNames = new Map<string, string>();
  if (!plansRes.error) {
    try {
      const annotated = await annotatePlansWithPromotionOffers(supabase, userId, plansRes.data ?? [], null);
      for (const p of annotated) planNames.set(p.code, p.name);
      plans = {
        ok: true,
        data: annotated.map((p) => ({ id: p.id, code: p.code, name: p.name, description: p.description, durationMonths: p.duration_months, pricePersonal: p.price_personal === null ? null : Number(p.price_personal), priceOrganization: p.price_organization === null ? null : Number(p.price_organization), offer: p.promotion_offer })),
      };
    } catch {
      plans = { ok: false };
    }
  }

  let subscriptions: SubscriptionsData["subscriptions"] = { ok: false };
  if (!subsRes.error) {
    const items = (subsRes.data ?? []).map((r): SubscriptionItem => {
      const mine = r.user_id === userId;
      const st = deriveSubscriptionState(r, now);
      return {
        id: r.id,
        productCode: r.product_code,
        productName: planNames.get(r.product_code) ?? r.product_code,
        scope: mine ? "personal" : "organization",
        ownerOrg: r.organization_id ? (names.get(r.organization_id) ?? "Organisasi") : null,
        status: r.status,
        effective: st.effective_status,
        daysLeft: st.days_left,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        renewsAt: r.renews_at,
        // Rincian pembelian hanya untuk pemilik (sama seperti GET /agents/me/subscriptions).
        snapshot: mine ? r.historical_purchase_snapshot : null,
      };
    });
    subscriptions = { ok: true, data: { items, current: items.find((s) => deriveSubscriptionState({ status: s.status, ends_at: s.endsAt }, now).is_current) ?? null } };
  }

  return { subscriptions, plans, leaderOrgs, memberOnlyOrgs: orgs.length - leaderOrgs.length, defaultOrgId };
}
