// lib/public/listing-search.ts — kueri Discovery listing (M11), dibaca di server dengan RLS anon (hanya listing published). Urutan bawaan = "district-local freshness"
// (freshness_rank_at menurun, id sebagai tie-break) seperti GET /api/listings. Filter fasilitas = SEMUA fasilitas terpilih harus dimiliki listing.
import { createClient } from "@/lib/supabase/server";
import { LISTING_CARD_SELECT, toFeaturedListing, type FeaturedListing, type ListingCardRow } from "./home-data";
import { safeKeyword, type ListingSearch } from "./listing-params";

export type ListingSearchResult = { ok: true; items: FeaturedListing[]; total: number } | { ok: false; items: []; total: 0 };
export type Amenity = { id: string; name: string };

export async function searchListings(s: ListingSearch): Promise<ListingSearchResult> {
  const supabase = await createClient();

  let idFilter: string[] | null = null;
  if (s.fasilitas.length > 0) {
    const { data, error } = await supabase.from("listing_amenities").select("listing_id, amenity_id").in("amenity_id", s.fasilitas);
    if (error) return { ok: false, items: [], total: 0 };
    const seen = new Map<string, Set<string>>();
    for (const row of data ?? []) seen.set(row.listing_id, (seen.get(row.listing_id) ?? new Set()).add(row.amenity_id));
    idFilter = [...seen].filter(([, set]) => set.size === s.fasilitas.length).map(([id]) => id);
    if (idFilter.length === 0) return { ok: true, items: [], total: 0 };
  }

  let query = supabase.from("listings").select(LISTING_CARD_SELECT, { count: "exact" }).eq("status", "published").is("deleted_at", null);
  if (idFilter) query = query.in("id", idFilter);
  if (s.jenis.length > 0) query = query.in("property_type", s.jenis);
  if (s.transaksi) query = query.eq("transaction_type", s.transaksi);
  if (s.min !== null) query = query.gte("price", s.min);
  if (s.max !== null) query = query.lte("price", s.max);
  if (s.kt) query = query.gte("bedrooms", s.kt);
  if (s.km) query = query.gte("bathrooms", s.km);
  const kw = safeKeyword(s.q);
  if (kw) query = query.or(`title.ilike.%${kw}%,address.ilike.%${kw}%,area_keyword.ilike.%${kw}%`);

  if (s.urut === "termurah") query = query.order("price", { ascending: true });
  else if (s.urut === "termahal") query = query.order("price", { ascending: false });
  else query = query.order("freshness_rank_at", { ascending: false });
  query = query.order("id", { ascending: true }).range(0, s.tampil - 1);

  const { data, count, error } = await query.returns<ListingCardRow[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: (data ?? []).map(toFeaturedListing), total: count ?? 0 };
}

/** Daftar fasilitas untuk filter; gagal/kosong -> [] (kelompok filter fasilitas disembunyikan). */
export async function getAmenities(): Promise<Amenity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("amenities").select("id, name").order("name").limit(50);
  return error ? [] : (data ?? []);
}
