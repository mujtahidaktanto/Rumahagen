// lib/agent/listing-detail-data.ts — data Detail Listing milik Agent (M03 Listing-Detail), dibaca di server dengan RLS pemanggil. Boleh dibuka: listing milik sendiri, atau listing ORGANISASI yang organisasinya
// dipimpin pengguna (baca saja, migration 0162); selain itu (termasuk listing pribadi anggota dan listing terbit orang lain) = tidak ditemukan. Bagian pelengkap (lead, kuota refresh) dimuat sendiri-sendiri: gagal di sana tidak menjatuhkan halaman. Aturan pakai ada di lib/agent/listing-rules.ts.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextOrg } from "@/lib/agent/context";
import { createClient } from "@/lib/supabase/server";
import { todayWIB } from "./time";

export type Part<T> = { ok: true; data: T } | { ok: false };

export type MyListingDetail = {
  id: string;
  slug: string;
  title: string;
  status: string;
  rejectionReason: string | null;
  transactionType: "sale" | "rent";
  category: "primary" | "secondary";
  propertyType: string;
  price: number;
  priceUnit: string | null;
  isNegotiable: boolean;
  address: string;
  location: string | null;
  landArea: number | null;
  buildingArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  carportCapacity: number | null;
  certificateType: string | null;
  description: string | null;
  amenities: string[];
  photos: { url: string; alt: string | null }[];
  viewCount: number;
  ctaClickCount: number;
  lastRefreshedAt: string | null;
  publishedAt: string | null;
};
/** Siapa yang melihat: milik sendiri atau listing anggota (pemimpin, baca saja); dan organisasi pemilik kuota bila listing atas nama organisasi. */
export type ListingViewer = { mine: boolean; creator: string | null; organization: { id: string; name: string } | null };
export type MyLead = { id: string; source: string; createdAt: string; status: string };
/** Jatah refresh harian efektif = bawaan sistem + tambahan (migration 0159). `defaultDaily`/`extraDaily` hanya ada setelah 0159 diterapkan. */
export type RefreshQuota = { allowance: number; usedToday: number; defaultDaily?: number; extraDaily?: number; /** Saldo add-on (tanpa masa berlaku, tanpa reset harian); dipakai setelah jatah harian habis. */ stockRemaining?: number };

export type MyListingDetailResult =
  // leads dan refresh = null pada tampilan baca saja (listing anggota): leads hanya untuk pembuat, jatah refresh milik pembuat.
  | { state: "ok"; listing: MyListingDetail; viewer: ListingViewer; leads: Part<{ items: MyLead[]; total: number }> | null; refresh: Part<RefreshQuota | null> | null }
  | { state: "not_found" }
  | { state: "error" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isListingId = (v: string) => UUID.test(v);

type Row = {
  id: string;
  agent_id: string;
  organization_id: string | null;
  slug: string;
  title: string;
  status: string;
  rejection_reason: string | null;
  transaction_type: "sale" | "rent";
  category: "primary" | "secondary";
  property_type: string;
  price: number;
  price_unit: string | null;
  is_negotiable: boolean;
  address: string;
  land_area: number | null;
  building_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  carport_capacity: number | null;
  certificate_type: string | null;
  description: string | null;
  view_count: number;
  cta_click_count: number;
  last_refreshed_at: string | null;
  published_at: string | null;
  city: { name: string } | null;
  province: { name: string } | null;
  district: { name: string } | null;
  photos: { url: string; alt_text: string | null; is_cover: boolean; sort_order: number }[] | null;
  amenities: { amenity: { name: string } | null }[] | null;
};

const SELECT =
  "id, agent_id, organization_id, slug, title, status, rejection_reason, transaction_type, category, property_type, price, price_unit, is_negotiable, address, land_area, building_area, bedrooms, bathrooms, floors, carport_capacity, certificate_type, description, view_count, cta_click_count, last_refreshed_at, published_at, city:ref_cities(name), province:ref_provinces(name), district:ref_districts(name), photos:listing_photos(url, alt_text, is_cover, sort_order), amenities:listing_amenities(amenity:amenities(name))";

async function loadLeads(supabase: SupabaseClient, listingId: string, userId: string): Promise<Part<{ items: MyLead[]; total: number }>> {
  const { data, count, error } = await supabase
    .from("listing_leads")
    .select("id, source, created_at, status", { count: "exact" })
    .eq("listing_id", listingId)
    .eq("agent_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<{ id: string; source: string; created_at: string; status: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: { total: count ?? (data?.length ?? 0), items: (data ?? []).map((l) => ({ id: l.id, source: l.source, createdAt: l.created_at, status: l.status })) } };
}

async function loadRefreshQuota(supabase: SupabaseClient, now: Date): Promise<Part<RefreshQuota | null>> {
  const day = todayWIB(now);
  const { data, error } = await supabase.rpc("agent_statistics_summary", { p_from: day, p_to: day, p_organization_id: null });
  if (error) return { ok: false };
  const q = (data as { quota?: { has_pool: boolean; allowance: number; used_today: number; default_daily?: number; extra_daily?: number; stock_remaining?: number } } | null)?.quota;
  // has_pool = jatah efektif > 0; null = tidak punya jatah harian sama sekali (bawaan 0 dan tanpa tambahan).
  return { ok: true, data: q && q.has_pool ? { allowance: q.allowance, usedToday: q.used_today, defaultDaily: q.default_daily, extraDaily: q.extra_daily, stockRemaining: q.stock_remaining } : null };
}

/** `orgs` = organisasi yang diikuti pengguna (role dipakai untuk memutuskan apakah pemimpin boleh melihat listing anggota). */
export async function getMyListingDetail(id: string, userId: string, orgs: ContextOrg[] = [], now: Date = new Date()): Promise<MyListingDetailResult> {
  if (!isListingId(id)) return { state: "not_found" };
  const supabase = await createClient();
  // Tanpa filter agent_id: RLS juga membuka listing terbit orang lain dan (0162) listing organisasi bagi pemimpin, jadi kepemilikan diperiksa di bawah.
  const { data: r, error } = await supabase.from("listings").select(SELECT).eq("id", id).is("deleted_at", null).maybeSingle<Row>();
  if (error) return { state: "error" };
  if (!r) return { state: "not_found" };
  const mine = r.agent_id === userId;
  const org = r.organization_id ? (orgs.find((o) => o.id === r.organization_id) ?? null) : null;
  if (!mine && !(org && org.role === "leader")) return { state: "not_found" };

  let creator: string | null = null;
  if (!mine && org) {
    const { data: roster } = await supabase.rpc("organization_roster", { p_organization_id: org.id });
    creator = ((roster ?? []) as { agent_id: string; agent_name: string }[]).find((m) => m.agent_id === r.agent_id)?.agent_name ?? "Mantan anggota";
  }
  const [leads, refresh] = mine ? await Promise.all([loadLeads(supabase, id, userId), loadRefreshQuota(supabase, now)]) : [null, null];
  const photos = [...(r.photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order).map((p) => ({ url: p.url, alt: p.alt_text }));
  return {
    state: "ok",
    viewer: { mine, creator, organization: org ? { id: org.id, name: org.name } : r.organization_id ? { id: r.organization_id, name: "Organisasi" } : null },
    leads,
    refresh,
    listing: {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      rejectionReason: r.rejection_reason,
      transactionType: r.transaction_type,
      category: r.category,
      propertyType: r.property_type,
      price: Number(r.price),
      priceUnit: r.price_unit,
      isNegotiable: r.is_negotiable,
      address: r.address,
      location: [r.district?.name, r.city?.name, r.province?.name].filter(Boolean).join(", ") || null,
      landArea: r.land_area === null ? null : Number(r.land_area),
      buildingArea: r.building_area === null ? null : Number(r.building_area),
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      floors: r.floors,
      carportCapacity: r.carport_capacity,
      certificateType: r.certificate_type,
      description: r.description,
      amenities: (r.amenities ?? []).map((a) => a.amenity?.name).filter((n): n is string => !!n),
      photos,
      viewCount: r.view_count ?? 0,
      ctaClickCount: r.cta_click_count ?? 0,
      lastRefreshedAt: r.last_refreshed_at,
      publishedAt: r.published_at,
    },
  };
}
