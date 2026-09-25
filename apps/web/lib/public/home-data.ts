// lib/public/home-data.ts — data Homepage publik (M11), dibaca di server dengan RLS anon: listing berstatus published, promo/pengumuman aktif dalam jendela jadwal,
// kursus published. Setiap fungsi mengembalikan { ok, items }: gagal baca -> ok=false agar halaman menampilkan keadaan galat (bukan halaman kosong yang menyesatkan).
import { createClient } from "@/lib/supabase/server";

export type FeaturedListing = {
  id: string;
  slug: string;
  title: string;
  transaction_type: "sale" | "rent";
  price: number;
  price_unit: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  land_area: number | null;
  building_area: number | null;
  cityName: string | null;
  provinceName: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
};

export type Announcement = { id: string; title: string; content: string | null; schedule_at: string | null; created_at: string; canonical_url: string | null };
export type FeaturedCourse = { id: string; title: string; category: string; lessonCount: number };
export type Loaded<T> = { ok: true; items: T[] } | { ok: false; items: [] };

/** Kolom kartu listing (dipakai Homepage dan Discovery): kota/provinsi lewat FK, foto untuk memilih sampul. */
export const LISTING_CARD_SELECT =
  "id, slug, title, transaction_type, price, price_unit, bedrooms, bathrooms, land_area, building_area, city:ref_cities(name), province:ref_provinces(name), photos:listing_photos(url, alt_text, is_cover, sort_order)";

export type ListingCardRow = Omit<FeaturedListing, "cityName" | "provinceName" | "coverUrl" | "coverAlt"> & {
  city: { name: string } | null;
  province: { name: string } | null;
  photos: { url: string; alt_text: string | null; is_cover: boolean; sort_order: number }[] | null;
};

export function toFeaturedListing({ city, province, photos, ...rest }: ListingCardRow): FeaturedListing {
  const sorted = [...(photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  return { ...rest, cityName: city?.name ?? null, provinceName: province?.name ?? null, coverUrl: sorted[0]?.url ?? null, coverAlt: sorted[0]?.alt_text ?? null };
}

export async function getFeaturedListings(limit = 4): Promise<Loaded<FeaturedListing>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("status", "published")
    .eq("transaction_type", "sale") // sama dengan Discovery: tampilan awal = Dijual (jual dan sewa tidak dicampur)
    .is("deleted_at", null)
    .order("freshness_rank_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit)
    .returns<ListingCardRow[]>();
  if (error) return { ok: false, items: [] };
  return { ok: true, items: (data ?? []).map(toFeaturedListing) };
}

export async function getAnnouncements(limit = 3): Promise<Loaded<Announcement>> {
  const supabase = await createClient();
  // RLS public_announcement_promotion_select_public sudah membatasi ke status active dan jendela jadwal; filter status tetap eksplisit (pola /api/banners).
  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .select("id, title, content, schedule_at, created_at, canonical_url")
    .eq("status", "active")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, items: [] };
  return { ok: true, items: data ?? [] };
}

export async function getFeaturedCourses(limit = 2): Promise<Loaded<FeaturedCourse>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, category, lessons:course_lessons(count)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<{ id: string; title: string; category: string; lessons: { count: number }[] }[]>();
  if (error) return { ok: false, items: [] };
  return { ok: true, items: (data ?? []).map((c) => ({ id: c.id, title: c.title, category: c.category, lessonCount: c.lessons?.[0]?.count ?? 0 })) };
}
