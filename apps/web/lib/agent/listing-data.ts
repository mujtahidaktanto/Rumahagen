// lib/agent/listing-data.ts — data layar "Listing Saya" (M03), dibaca di server dengan RLS pemanggil (listings milik sendiri, termasuk yang belum terbit). Kuota lewat RPC listing_quota_summary
// (sama seperti GET /agents/me/listing-quota). Konteks aktif (Context Switcher) menentukan daftar (listing milik sendiri berorganisasi kosong / organisasi itu) dan pemilik kuota; RLS listing hanya
// membuka baris milik sendiri, jadi pada konteks organisasi yang tampil adalah listing yang Anda buat atas nama organisasi itu. Bagian kuota dan daftar dimuat sendiri-sendiri: kuota gagal tidak mematikan daftar (wireframe: "Anda tetap bisa menyusun listing").
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatListingPrice } from "@/lib/format";
import type { ActiveContext } from "@/lib/agent/context";
import { createClient } from "@/lib/supabase/server";
import type { ListingQuotaSummary } from "@/lib/validation/listing-quota";
import { MY_LISTING_STATUSES, type MyListingsSearch } from "./listing-params";
import { listingQuotaNote, quotaLevel, type SlotWindow } from "./listing-quota";

export type Part<T> = { ok: true; data: T } | { ok: false };

export type MyListingItem = {
  id: string;
  title: string;
  status: string;
  location: string | null;
  priceText: string;
  viewCount: number;
  coverUrl: string | null;
  note: { text: string; tone: "normal" | "warn" | "danger" } | null;
};
export type MyListings = { items: MyListingItem[]; filteredTotal: number; counts: Record<string, number>; total: number };
export type MyListingsData = { list: Part<MyListings>; quota: Part<ListingQuotaSummary> };

type Row = {
  id: string;
  title: string;
  status: string;
  price: number;
  price_unit: string | null;
  view_count: number;
  city: { name: string } | null;
  province: { name: string } | null;
  photos: { url: string; is_cover: boolean; sort_order: number }[] | null;
};

const SELECT = "id, title, status, price, price_unit, view_count, city:ref_cities(name), province:ref_provinces(name), photos:listing_photos(url, is_cover, sort_order)";

async function loadQuota(supabase: SupabaseClient, orgId: string | null): Promise<Part<ListingQuotaSummary>> {
  const { data, error } = await supabase.rpc("listing_quota_summary", { p_organization_id: orgId });
  if (error || !data) return { ok: false };
  return { ok: true, data: data as ListingQuotaSummary };
}

async function loadList(supabase: SupabaseClient, userId: string, orgId: string | null, s: MyListingsSearch, quotaFull: boolean, now: Date): Promise<Part<MyListings>> {
  let q = supabase
    .from("listings")
    .select(SELECT, { count: "exact" })
    .eq("agent_id", userId)
    .is("deleted_at", null);
  q = orgId ? q.eq("organization_id", orgId) : q.is("organization_id", null);
  q = q
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, s.tampil - 1);
  if (s.status !== "semua") q = q.eq("status", s.status);

  let allQ = supabase.from("listings").select("status").eq("agent_id", userId).is("deleted_at", null);
  allQ = orgId ? allQ.eq("organization_id", orgId) : allQ.is("organization_id", null);
  const [page, all] = await Promise.all([q.returns<Row[]>(), allQ.limit(5000).returns<{ status: string }[]>()]);
  if (page.error || all.error) return { ok: false };

  const rows = page.data ?? [];
  // Masa tayang per listing (jatah kuota aktif); gagal memuat = tanpa catatan, bukan galat.
  const slots = new Map<string, SlotWindow>();
  if (rows.length > 0) {
    const { data } = await supabase
      .from("listing_slot_usage")
      .select("listing_id, valid_until, grace_until")
      .in("listing_id", rows.map((r) => r.id))
      .eq("status", "active")
      .returns<{ listing_id: string; valid_until: string | null; grace_until: string | null }[]>();
    for (const u of data ?? []) slots.set(u.listing_id, { validUntil: u.valid_until, graceUntil: u.grace_until });
  }

  const counts: Record<string, number> = Object.fromEntries(MY_LISTING_STATUSES.map((k) => [k, 0]));
  for (const r of all.data ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;

  return {
    ok: true,
    data: {
      filteredTotal: page.count ?? rows.length,
      total: all.data?.length ?? 0,
      counts,
      items: rows.map((r) => {
        const cover = [...(r.photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0];
        return {
          id: r.id,
          title: r.title,
          status: r.status,
          location: [r.city?.name, r.province?.name].filter(Boolean).join(", ") || null,
          priceText: formatListingPrice(Number(r.price), r.price_unit),
          viewCount: r.view_count ?? 0,
          coverUrl: cover?.url ?? null,
          note: listingQuotaNote(r, slots.get(r.id) ?? null, quotaFull, now),
        };
      }),
    },
  };
}

export async function getMyListingsData(userId: string, search: MyListingsSearch, context: ActiveContext, now: Date = new Date()): Promise<MyListingsData> {
  const supabase = await createClient();
  const orgId = context.kind === "org" ? context.org.id : null;
  const quota = await loadQuota(supabase, orgId);
  const quotaFull = quota.ok && quotaLevel(quota.data.total_remaining) === "penuh";
  const list = await loadList(supabase, userId, orgId, search, quotaFull, now);
  return { list, quota };
}
