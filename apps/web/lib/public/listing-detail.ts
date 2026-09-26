// lib/public/listing-detail.ts — data Detail Listing publik (M11), dibaca di server dengan RLS pemanggil: pengunjung hanya melihat listing `published`; pemilik dan staf juga
// melihat status lain (draft, sold, rented, suspended, expired, dst.) sehingga halaman memberi spanduk "tidak tersedia" untuk mereka. Profil agen dibaca dari view
// `public_agent_profiles` (hanya profil publik dan akun aktif); agen berprofil privat tidak tampil sebagai kartu agen.
import { createClient } from "@/lib/supabase/server";
import { getAgentRatings, type RatingSummary } from "./agent-reviews";
import { LISTING_CARD_SELECT, toFeaturedListing, type FeaturedListing, type ListingCardRow } from "./home-data";

export type ListingStatus = "draft" | "pending_review" | "published" | "sold" | "rented" | "expired" | "rejected" | "suspended";

export type ListingDetail = {
  id: string;
  slug: string;
  title: string;
  status: ListingStatus;
  transaction_type: "sale" | "rent";
  property_type: string;
  price: number;
  price_unit: string | null;
  is_negotiable: boolean | null;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  land_area: number | null;
  building_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  carport_capacity: number | null;
  electrical_power: number | null;
  water_source: string | null;
  furnishing: string | null;
  year_built: number | null;
  certificate_type: string | null;
  imb_status: string | null;
  whatsapp_number: string | null;
  meta_title: string | null;
  meta_description: string | null;
  agent_id: string;
  province_id: string;
  city_id: string;
  cityName: string | null;
  provinceName: string | null;
  districtName: string | null;
  photos: { url: string; alt: string | null }[];
  amenities: string[];
};

export type ListingAgent = {
  user_id: string;
  public_slug: string | null;
  full_name: string;
  avatar_url: string | null;
  organization_name: string | null;
  active_listings_count: number;
  whatsapp_number: string | null;
  public_cta_enabled: boolean;
  is_verified: boolean;
};

type Row = Omit<ListingDetail, "cityName" | "provinceName" | "districtName" | "photos" | "amenities"> & {
  city: { name: string } | null;
  province: { name: string } | null;
  district: { name: string } | null;
  photos: { url: string; alt_text: string | null; is_cover: boolean; sort_order: number }[] | null;
  amenities: { amenity: { name: string } | null }[] | null;
};

const DETAIL_SELECT =
  "id, slug, title, status, transaction_type, property_type, price, price_unit, is_negotiable, description, address, latitude, longitude, land_area, building_area, bedrooms, bathrooms, floors, carport_capacity, electrical_power, water_source, furnishing, year_built, certificate_type, imb_status, whatsapp_number, meta_title, meta_description, agent_id, province_id, city_id, city:ref_cities(name), province:ref_provinces(name), district:ref_districts(name), photos:listing_photos(url, alt_text, is_cover, sort_order), amenities:listing_amenities(amenity:amenities(name))";

export type ListingDetailResult =
  | { state: "ok"; listing: ListingDetail; agent: ListingAgent | null; agentRating?: RatingSummary; similar: FeaturedListing[] }
  | { state: "not_found" }
  | { state: "error" };

export async function getListingDetail(slug: string): Promise<ListingDetailResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(DETAIL_SELECT).eq("slug", slug).is("deleted_at", null).maybeSingle<Row>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  const { city, province, district, photos, amenities, ...rest } = data;
  const listing: ListingDetail = {
    ...rest,
    cityName: city?.name ?? null,
    provinceName: province?.name ?? null,
    districtName: district?.name ?? null,
    photos: [...(photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order).map((p) => ({ url: p.url, alt: p.alt_text })),
    amenities: (amenities ?? []).map((a) => a.amenity?.name).filter((n): n is string => !!n),
  };

  // Kartu agen dan listing serupa bersifat pelengkap: gagal memuat tidak boleh menjatuhkan halaman.
  const [agentRes, similar, ratings] = await Promise.all([
    supabase
      .from("public_agent_profiles")
      .select("user_id, public_slug, full_name, avatar_url, organization_name, active_listings_count, whatsapp_number, public_cta_enabled, is_verified")
      .eq("user_id", listing.agent_id)
      .maybeSingle<ListingAgent>(),
    getSimilarListings(listing),
    getAgentRatings([listing.agent_id]),
  ]);
  return { state: "ok", listing, agent: agentRes.error ? null : agentRes.data, agentRating: ratings.get(listing.agent_id), similar };
}

async function getSimilarListings(l: ListingDetail, limit = 3): Promise<FeaturedListing[]> {
  const supabase = await createClient();
  const base = () =>
    supabase.from("listings").select(LISTING_CARD_SELECT).eq("status", "published").is("deleted_at", null).neq("id", l.id).eq("property_type", l.property_type).order("freshness_rank_at", { ascending: false }).order("id", { ascending: true }).limit(limit);
  const sameCity = await base().eq("city_id", l.city_id).returns<ListingCardRow[]>();
  const items = (sameCity.data ?? []).map(toFeaturedListing);
  if (items.length >= limit) return items;
  const sameProvince = await base().eq("province_id", l.province_id).neq("city_id", l.city_id).returns<ListingCardRow[]>();
  return [...items, ...(sameProvince.data ?? []).map(toFeaturedListing)].slice(0, limit);
}

export { CERTIFICATE_LABEL, IMB_LABEL, WATER_LABEL, FURNISHING_LABEL } from "./listing-labels";
