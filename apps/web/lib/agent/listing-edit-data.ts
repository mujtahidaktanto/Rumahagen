// lib/agent/listing-edit-data.ts — nilai awal Wizard dari listing yang sudah ada (mode edit dan salin) dan nomor WhatsApp bawaan dari profil, dibaca di server dengan RLS pemanggil dan dibatasi
// agent_id = pengguna. Mode salin tidak membawa foto/video/judul-sama; listing yang sudah pernah terbit dianggap `locked` (alamat, tipe properti, luas dikunci trigger DB).
import { createClient } from "@/lib/supabase/server";
import { EMPTY_WIZARD, formatPriceInput, type WizardValues } from "./listing-wizard";
import { isListingId } from "./listing-detail-data";

export type WizardSource = {
  values: WizardValues;
  listingId: string;
  status: string;
  locked: boolean;
  amenityIds: string[];
  photos: { id: string; url: string }[];
  videos: { id: string; url: string; kind: "video" | "virtual_tour" }[];
};
export type WizardSourceResult = { state: "ok"; source: WizardSource } | { state: "not_found" } | { state: "error" };

type Row = Record<string, unknown> & {
  id: string;
  status: string;
  published_at: string | null;
  photos: { id: string; url: string; is_cover: boolean; sort_order: number }[] | null;
  videos: { id: string; url: string; type: string }[] | null;
  amenities: { amenity_id: string }[] | null;
};

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const dec = (v: unknown) => str(v).replace(".", ",");

export async function getWizardSource(id: string, userId: string): Promise<WizardSourceResult> {
  if (!isListingId(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, photos:listing_photos(id, url, is_cover, sort_order), videos:listing_videos(id, url, type), amenities:listing_amenities(amenity_id)")
    .eq("id", id)
    .eq("agent_id", userId)
    .is("deleted_at", null)
    .maybeSingle<Row>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  const photos = [...(data.photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  const videos = (data.videos ?? []).map((x) => ({ id: x.id, url: x.url, kind: (x.type === "virtual_tour" ? "virtual_tour" : "video") as "video" | "virtual_tour" }));
  const values: WizardValues = {
    ...EMPTY_WIZARD,
    organizationId: str(data.organization_id),
    title: str(data.title),
    category: data.category === "primary" ? "primary" : "secondary",
    transactionType: data.transaction_type === "rent" ? "rent" : "sale",
    address: str(data.address),
    provinceId: str(data.province_id),
    cityId: str(data.city_id),
    districtId: str(data.district_id),
    areaKeyword: str(data.area_keyword),
    propertyType: str(data.property_type),
    landArea: dec(data.land_area),
    buildingArea: dec(data.building_area),
    bedrooms: str(data.bedrooms),
    bathrooms: str(data.bathrooms),
    floors: str(data.floors),
    carport: str(data.carport_capacity),
    electricalPower: str(data.electrical_power),
    yearBuilt: str(data.year_built),
    waterSource: str(data.water_source),
    furnishing: str(data.furnishing),
    amenityIds: (data.amenities ?? []).map((a) => a.amenity_id),
    price: formatPriceInput(String(Math.round(Number(data.price)))),
    priceUnit: (["total", "per_bulan", "per_tahun"].includes(str(data.price_unit)) ? str(data.price_unit) : "total") as WizardValues["priceUnit"],
    isNegotiable: data.is_negotiable === true,
    certificateType: str(data.certificate_type),
    certificateTransferred: data.certificate_transferred === true,
    imbStatus: str(data.imb_status),
    disputeFree: data.dispute_free_declared === true,
    photoUrls: photos.map((p) => p.url),
    videoUrls: videos.filter((x) => x.kind === "video").map((x) => x.url),
    virtualTourUrl: videos.find((x) => x.kind === "virtual_tour")?.url ?? "",
    whatsapp: str(data.whatsapp_number),
    description: str(data.description),
    metaTitle: str(data.meta_title),
    metaDescription: str(data.meta_description),
  };
  return {
    state: "ok",
    source: { values, listingId: data.id, status: data.status, locked: data.published_at !== null, amenityIds: values.amenityIds, photos: photos.map((p) => ({ id: p.id, url: p.url })), videos },
  };
}

/** Nomor WhatsApp dari profil Agent (bawaan kolom kontak di Wizard); kosong bila belum ada profil. */
export async function getDefaultWhatsapp(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("agent_profiles").select("whatsapp_number").eq("user_id", userId).maybeSingle<{ whatsapp_number: string | null }>();
  return data?.whatsapp_number ?? "";
}
