// lib/ai/platform/whitelist.ts — bangun blok DATA_FORM (docs/ai-description-rules.md "Data form
// yang dipakai AI") dari field listing/project yang DIIZINKAN saja. TIDAK PERNAH dikirim ke sini:
// whatsapp_number, address, latitude, longitude, ID user/organisasi, dispute_free_declared,
// commission_scheme/extra_commission/is_exclusive_by_region, location (alamat project), statistik
// (view_count dst) -- field-field itu SENGAJA TIDAK ADA di tipe DescriptionWhitelistInput di bawah,
// bukan sekadar tidak dicentang; kalau butuh field baru nanti, cek ulang daftar "Tidak pernah
// dikirim" di dokumen dulu sebelum menambah.
import { formatListingPrice } from "@/lib/format";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL } from "@/lib/public/listing-labels";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "@/lib/public/listing-params";

export type DescriptionWhitelistInput = {
  kind: "listing" | "project";
  title: string | null; // listing: judul saat ini (mode improve). project: tidak dipakai (nama diisi developer, lihat `name`).
  name: string | null; // project: nama proyek (konteks, bukan yang disarankan ulang)
  category: string | null;
  transactionType: "sale" | "rent";
  propertyType: string;
  price: number | null; // listing
  priceMin: number | null; // project
  priceMax: number | null;
  priceUnit: string | null;
  isNegotiable: boolean | null;
  unitAvailability: string | null; // project
  provinceName: string | null;
  cityName: string | null;
  districtName: string | null;
  areaKeyword: string | null;
  landArea: number | null;
  buildingArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  carportCapacity: number | null;
  electricalPower: number | null;
  waterSource: string | null;
  furnishing: string | null;
  yearBuilt: number | null;
  certificateType: string | null;
  certificateTransferred: boolean | null;
  imbStatus: string | null;
  developerName: string | null; // project: developer_partners.company_name
  amenities: string[]; // listing
};

const CATEGORY_LABEL: Record<string, string> = { primary: "Primary/baru", secondary: "Secondary/bekas" };
const TRANSACTION_LABEL: Record<string, string> = { sale: "Dijual", rent: "Disewakan" };

function line(label: string, value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return `${label}: ${value}`;
}

/** Baris "DATA_FORM" sesuai prompt description.v3 -- field kosong TIDAK ditulis sama sekali (docs: supaya AI tidak mengisi kekosongan dengan tebakan). */
export function buildDataFormBlock(d: DescriptionWhitelistInput): string {
  const lines: (string | null)[] = [];
  const propertyLabel = PROPERTY_TYPE_LABEL[d.propertyType as PropertyType] ?? d.propertyType;
  lines.push(line("Tipe", `${propertyLabel} · ${TRANSACTION_LABEL[d.transactionType] ?? d.transactionType}${d.category ? ` · ${CATEGORY_LABEL[d.category] ?? d.category}` : ""}`));
  if (d.kind === "project" && d.name) lines.push(line("Nama proyek", d.name));
  if (d.kind === "project" && d.developerName) lines.push(line("Developer", d.developerName));

  const location = [d.districtName ? `Kec. ${d.districtName}` : null, d.cityName, d.provinceName].filter(Boolean).join(", ");
  lines.push(line("Lokasi", `${location}${d.areaKeyword ? ` (${d.areaKeyword})` : ""}`));

  if (d.kind === "listing" && d.price !== null) {
    lines.push(line("Harga", `${formatListingPrice(d.price, d.priceUnit)}${d.isNegotiable ? " (bisa nego)" : ""}`));
  }
  if (d.kind === "project" && (d.priceMin !== null || d.priceMax !== null)) {
    const range = d.priceMin !== null && d.priceMax !== null ? `${formatListingPrice(d.priceMin, null)} - ${formatListingPrice(d.priceMax, null)}` : formatListingPrice((d.priceMin ?? d.priceMax)!, null);
    lines.push(line("Rentang harga", `${range}${d.isNegotiable ? " (bisa nego)" : ""}`));
  }
  if (d.unitAvailability) lines.push(line("Ketersediaan unit", d.unitAvailability));

  if (d.landArea !== null || d.buildingArea !== null) {
    lines.push(line("Luas tanah/bangunan", `${d.landArea !== null ? `${d.landArea} m²` : "—"} / ${d.buildingArea !== null ? `${d.buildingArea} m²` : "—"}`));
  }
  if (d.bedrooms !== null || d.bathrooms !== null || d.floors !== null) {
    lines.push(line("Kamar tidur/mandi/lantai", `${d.bedrooms ?? "—"} / ${d.bathrooms ?? "—"} / ${d.floors ?? "—"}`));
  }
  if (d.carportCapacity !== null) lines.push(line("Carport", `${d.carportCapacity} mobil`));
  if (d.electricalPower !== null) lines.push(line("Listrik", `${d.electricalPower} VA`));
  if (d.waterSource) lines.push(line("Sumber air", WATER_LABEL[d.waterSource] ?? d.waterSource));
  if (d.furnishing) lines.push(line("Furnishing", FURNISHING_LABEL[d.furnishing] ?? d.furnishing));
  if (d.yearBuilt !== null) lines.push(line("Tahun dibangun", String(d.yearBuilt)));

  if (d.certificateType) {
    lines.push(line("Sertifikat", `${CERTIFICATE_LABEL[d.certificateType] ?? d.certificateType}${d.certificateTransferred ? " (sudah balik nama)" : ""}`));
  }
  if (d.imbStatus) lines.push(line("IMB/PBG", IMB_LABEL[d.imbStatus] ?? d.imbStatus));
  if (d.amenities.length > 0) lines.push(line("Fasilitas", d.amenities.join(", ")));

  return lines.filter((l): l is string => l !== null).join("\n");
}
