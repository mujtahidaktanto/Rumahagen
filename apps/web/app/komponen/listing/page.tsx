// app/komponen/listing/page.tsx — Detail Listing dengan DATA CONTOH (bukan database) untuk memeriksa tampilan: ?status=published|sold|rented|suspended|expired dan ?kosong=1 (tanpa foto/fasilitas/agen).
// Sembunyikan di produksi nyata dengan env HIDE_DEV_PAGES=1 (sama seperti /komponen).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ListingDetailView } from "@/components/public/ListingDetailView";
import type { FeaturedListing } from "@/lib/public/home-data";
import type { ListingAgent, ListingDetail, ListingStatus } from "@/lib/public/listing-detail";

export const metadata: Metadata = { title: "Contoh Detail Listing | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ status?: string; kosong?: string }> };

const STATUSES: ListingStatus[] = ["published", "sold", "rented", "suspended", "expired", "draft", "pending_review", "rejected"];

const photo = (n: number) => ({ url: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='hsl(${210 + n * 25},35%,${72 - n * 3}%)'/><text x='400' y='310' font-size='40' text-anchor='middle' fill='white' font-family='sans-serif'>Foto ${n}</text></svg>`)}`, alt: null });

const similar: FeaturedListing[] = [
  { id: "s1", slug: "rumah-cluster-syariah", title: "Rumah Cluster Syariah 1 Lantai", transaction_type: "sale", price: 780000000, price_unit: null, bedrooms: 2, bathrooms: 1, land_area: 90, building_area: 60, cityName: "Kabupaten Bogor", provinceName: "Jawa Barat", coverUrl: null, coverAlt: null },
  { id: "s2", slug: "rumah-modern-tol", title: "Rumah Modern Dekat Tol", transaction_type: "sale", price: 920000000, price_unit: null, bedrooms: 3, bathrooms: 2, land_area: 120, building_area: 90, cityName: "Kabupaten Bogor", provinceName: "Jawa Barat", coverUrl: null, coverAlt: null },
];

export default async function SampleListingPage({ searchParams }: Props) {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  const sp = await searchParams;
  const status = (STATUSES as string[]).includes(sp.status ?? "") ? (sp.status as ListingStatus) : "published";
  const kosong = sp.kosong === "1";

  const listing: ListingDetail = {
    id: "1a2b3c4d-1111-2222-3333-444455556666",
    slug: "rumah-minimalis-modern-a1b2c3",
    title: kosong ? "Tanah Kavling" : "Rumah Minimalis Modern 2 Lantai Dekat Sekolah Internasional dan Akses Tol",
    status,
    transaction_type: "sale",
    property_type: kosong ? "tanah" : "rumah",
    price: 850000000,
    price_unit: null,
    is_negotiable: !kosong,
    description: kosong ? null : "Rumah minimalis modern 2 lantai dalam kondisi siap huni, lokasi strategis dekat sekolah internasional dan akses tol.\n\nDesain terang dengan banyak bukaan cahaya alami, dapur bersih dan kotor terpisah, carport untuk 2 mobil. Lingkungan cluster aman dengan keamanan 24 jam.",
    address: "Jl. Kenanga Raya No. 12",
    latitude: kosong ? null : -6.3,
    longitude: kosong ? null : 106.65,
    land_area: 150,
    building_area: kosong ? null : 120,
    bedrooms: kosong ? null : 3,
    bathrooms: kosong ? null : 2,
    floors: kosong ? null : 2,
    carport_capacity: kosong ? null : 2,
    electrical_power: kosong ? null : 2200,
    water_source: kosong ? null : "pdam",
    furnishing: kosong ? null : "semi_furnished",
    year_built: kosong ? null : 2022,
    certificate_type: "shm",
    imb_status: kosong ? null : "ada",
    whatsapp_number: kosong ? null : "0812-3456-7890",
    meta_title: null,
    meta_description: null,
    agent_id: "a1",
    province_id: "p1",
    city_id: "c1",
    cityName: "Kota Tangerang Selatan",
    provinceName: "Banten",
    districtName: "Serpong",
    photos: kosong ? [] : [photo(1), photo(2), photo(3), photo(4)],
    amenities: kosong ? [] : ["Carport 2 Mobil", "Keamanan 24 Jam", "Taman", "Dekat Sekolah"],
  };
  const agent: ListingAgent | null = kosong
    ? null
    : { user_id: "a1", public_slug: "rian-saputra-a1b2c3d4", full_name: "Rian Saputra", avatar_url: null, organization_name: "PT Properti Jaya Sejahtera", active_listings_count: 34, whatsapp_number: "081234567890", public_cta_enabled: true, is_verified: true };

  return (
    <>
      <ListingDetailView listing={listing} agent={agent} similar={kosong ? [] : similar} track={false} />
      <PublicFooter />
    </>
  );
}
