// lib/agent/listing-wizard.ts — logika Wizard Buat/Edit Listing (M03, wireframe 01-Agent/M03-Create-Listing-Wizard): nilai formulir, validasi per langkah, dan pembuat badan API. Murni tanpa I/O
// (diuji). Batas dan enum mengikuti createListingSchema/updateListingSchema (lib/validation/listings.ts); server dan trigger DB tetap penentu akhir.
// Catatan media: API media hanya menerima URL (tidak ada endpoint unggah file), jadi foto dimasukkan sebagai tautan https (lihat audit/FRONTEND_GAPS.md).
import { whatsappUrl } from "@/lib/format";

export const WIZARD_STEPS = [
  { key: "mulai", label: "Mulai" },
  { key: "kategori", label: "Kategori" },
  { key: "lokasi", label: "Lokasi" },
  { key: "detail", label: "Detail" },
  { key: "harga", label: "Harga" },
  { key: "legalitas", label: "Legalitas" },
  { key: "media", label: "Media" },
  { key: "kontak", label: "Kontak" },
  { key: "terbit", label: "Terbitkan" },
] as const;
export type StepKey = (typeof WIZARD_STEPS)[number]["key"];

export const PROPERTY_TYPES = ["rumah", "apartemen", "ruko", "tanah", "gudang", "kavling", "lainnya"] as const;
export const PRICE_UNITS = ["total", "per_bulan", "per_tahun"] as const;
export const WATER_SOURCES = ["pdam", "sumur", "lainnya"] as const;
export const FURNISHINGS = ["unfurnished", "semi_furnished", "fully_furnished"] as const;
export const CERTIFICATES = ["shm", "hgb", "girik", "ppjb", "strata_title", "lainnya"] as const;
export const IMB_STATUSES = ["ada", "tidak_ada", "dalam_proses"] as const;

export const MAX_PHOTOS = 20;
export const MAX_VIDEOS = 3;

export type WizardValues = {
  /** Pemilik kuota: "" = pribadi, selain itu id organisasi (listing organisasi memakai kuota bersama organisasi). */
  organizationId: string;
  title: string;
  category: "" | "primary" | "secondary";
  transactionType: "" | "sale" | "rent";
  address: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  areaKeyword: string;
  propertyType: string;
  landArea: string;
  buildingArea: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  carport: string;
  electricalPower: string;
  yearBuilt: string;
  waterSource: string;
  furnishing: string;
  amenityIds: string[];
  price: string;
  priceUnit: (typeof PRICE_UNITS)[number];
  isNegotiable: boolean;
  certificateType: string;
  certificateTransferred: boolean;
  imbStatus: string;
  disputeFree: boolean;
  photoUrls: string[]; // foto pertama = sampul (urutan = sort_order)
  videoUrls: string[];
  virtualTourUrl: string;
  whatsapp: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export const EMPTY_WIZARD: WizardValues = {
  organizationId: "",
  title: "",
  category: "",
  transactionType: "",
  address: "",
  provinceId: "",
  cityId: "",
  districtId: "",
  areaKeyword: "",
  propertyType: "",
  landArea: "",
  buildingArea: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  carport: "",
  electricalPower: "",
  yearBuilt: "",
  waterSource: "",
  furnishing: "",
  amenityIds: [],
  price: "",
  priceUnit: "total",
  isNegotiable: false,
  certificateType: "",
  certificateTransferred: false,
  imbStatus: "",
  disputeFree: false,
  photoUrls: [],
  videoUrls: [],
  virtualTourUrl: "",
  whatsapp: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
};

/** Angka dari isian pengguna: titik = pemisah ribuan, koma = desimal ("1.200,5" -> 1200.5). Kosong/tidak valid -> null. */
export function parseNumber(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "");
  if (!t || !/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
const parseInteger = (raw: string): number | null => {
  const n = parseNumber(raw);
  return n !== null && Number.isInteger(n) ? n : null;
};

/** "850000000" / "850.000.000" -> "850.000.000" (untuk kolom harga); bukan digit dibuang. */
export function formatPriceInput(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const defaultPriceUnit = (t: "" | "sale" | "rent"): (typeof PRICE_UNITS)[number] => (t === "rent" ? "per_bulan" : "total");

export const isHttpsUrl = (s: string) => {
  try {
    return new URL(s.trim()).protocol === "https:";
  } catch {
    return false;
  }
};

export type StepErrors = Record<string, string>;

/** `locked` = listing sudah pernah terbit: alamat, tipe properti, luas tanah/bangunan dikunci (trigger DB) dan tidak divalidasi/dikirim. */
export function validateStep(step: StepKey, v: WizardValues, opts: { locked?: boolean } = {}): StepErrors {
  const e: StepErrors = {};
  const locked = opts.locked === true;
  const year = new Date().getFullYear();
  switch (step) {
    case "mulai":
      if (!v.title.trim()) e.title = "Judul listing wajib diisi.";
      else if (v.title.trim().length > 200) e.title = "Maksimal 200 karakter.";
      break;
    case "kategori":
      if (!v.category) e.category = "Pilih kategori.";
      if (!v.transactionType) e.transactionType = "Pilih jenis transaksi.";
      break;
    case "lokasi":
      if (!locked) {
        if (!v.address.trim()) e.address = "Alamat lengkap wajib diisi.";
        else if (v.address.trim().length > 500) e.address = "Maksimal 500 karakter.";
      }
      if (!v.provinceId) e.provinceId = "Pilih provinsi.";
      if (!v.cityId) e.cityId = "Pilih kota/kabupaten.";
      if (!v.districtId) e.districtId = "Pilih kecamatan.";
      if (v.areaKeyword.trim().length > 20) e.areaKeyword = "Maksimal 20 karakter.";
      break;
    case "detail": {
      if (!locked) {
        if (!v.propertyType) e.propertyType = "Pilih tipe properti.";
        for (const k of ["landArea", "buildingArea"] as const) if (v[k].trim() && parseNumber(v[k]) === null) e[k] = "Isi angka (mis. 120 atau 120,5).";
      }
      for (const k of ["bedrooms", "bathrooms", "floors", "carport", "electricalPower"] as const) if (v[k].trim() && parseInteger(v[k]) === null) e[k] = "Isi angka bulat.";
      if (v.yearBuilt.trim()) {
        const y = parseInteger(v.yearBuilt);
        if (y === null || y < 1900 || y > year + 5) e.yearBuilt = `Isi tahun antara 1900 dan ${year + 5}.`;
      }
      break;
    }
    case "harga": {
      const p = parseNumber(v.price);
      if (p === null || p <= 0) e.price = "Isi harga lebih dari 0 (mis. 850.000.000).";
      break;
    }
    case "legalitas":
      break;
    case "media": {
      if (v.photoUrls.length > MAX_PHOTOS) e.photoUrls = `Maksimal ${MAX_PHOTOS} foto.`;
      if (v.videoUrls.length > MAX_VIDEOS) e.videoUrls = `Maksimal ${MAX_VIDEOS} video.`;
      if (v.virtualTourUrl.trim() && !isHttpsUrl(v.virtualTourUrl)) e.virtualTourUrl = "Tautan virtual tour harus diawali https://.";
      break;
    }
    case "kontak": {
      const wa = v.whatsapp.trim();
      if (!wa) e.whatsapp = "Nomor WhatsApp wajib diisi.";
      else if (wa.length > 20) e.whatsapp = "Maksimal 20 karakter.";
      else if (!whatsappUrl(wa)) e.whatsapp = "Nomor WhatsApp tidak valid (contoh 0812-3456-7890).";
      if (v.metaTitle.length > 70) e.metaTitle = "Maksimal 70 karakter.";
      if (v.metaDescription.length > 160) e.metaDescription = "Maksimal 160 karakter.";
      break;
    }
    case "terbit":
      break;
  }
  return e;
}

/** Langkah pertama yang belum valid (untuk memindahkan pengguna ke galat saat menerbitkan), atau null. */
export function firstInvalidStep(v: WizardValues, opts: { locked?: boolean } = {}): StepKey | null {
  for (const s of WIZARD_STEPS) if (Object.keys(validateStep(s.key, v, opts)).length > 0) return s.key;
  return null;
}

const num = (raw: string) => parseNumber(raw);
const int = (raw: string) => parseInteger(raw);

/** Badan POST /listings (valid bila semua langkah lolos). */
export function toCreatePayload(v: WizardValues): Record<string, unknown> {
  return {
    listing_context: v.organizationId ? "organization" : "personal",
    ...(v.organizationId ? { organization_id: v.organizationId } : {}),
    category: v.category,
    transaction_type: v.transactionType,
    title: v.title.trim(),
    ...(v.metaTitle.trim() ? { meta_title: v.metaTitle.trim() } : {}),
    ...(v.metaDescription.trim() ? { meta_description: v.metaDescription.trim() } : {}),
    ...(v.description.trim() ? { description: v.description.trim() } : {}),
    property_type: v.propertyType,
    price: num(v.price),
    price_unit: v.priceUnit,
    is_negotiable: v.isNegotiable,
    address: v.address.trim(),
    province_id: v.provinceId,
    city_id: v.cityId,
    district_id: v.districtId,
    ...(v.areaKeyword.trim() ? { area_keyword: v.areaKeyword.trim() } : {}),
    ...(num(v.landArea) !== null ? { land_area: num(v.landArea) } : {}),
    ...(num(v.buildingArea) !== null ? { building_area: num(v.buildingArea) } : {}),
    ...(int(v.bedrooms) !== null ? { bedrooms: int(v.bedrooms) } : {}),
    ...(int(v.bathrooms) !== null ? { bathrooms: int(v.bathrooms) } : {}),
    ...(int(v.floors) !== null ? { floors: int(v.floors) } : {}),
    ...(int(v.carport) !== null ? { carport_capacity: int(v.carport) } : {}),
    ...(int(v.electricalPower) !== null ? { electrical_power: int(v.electricalPower) } : {}),
    ...(v.waterSource ? { water_source: v.waterSource } : {}),
    ...(v.furnishing ? { furnishing: v.furnishing } : {}),
    ...(int(v.yearBuilt) !== null ? { year_built: int(v.yearBuilt) } : {}),
    ...(v.certificateType ? { certificate_type: v.certificateType, certificate_transferred: v.certificateTransferred } : {}),
    ...(v.imbStatus ? { imb_status: v.imbStatus } : {}),
    dispute_free_declared: v.disputeFree,
    whatsapp_number: v.whatsapp.trim(),
  };
}

/** Badan PUT /listings/{id}: tanpa konteks/organisasi/agen dan (bila terkunci) tanpa alamat, tipe properti, luas tanah/bangunan. */
export function toUpdatePayload(v: WizardValues, opts: { locked?: boolean } = {}): Record<string, unknown> {
  const body = { ...toCreatePayload(v) };
  delete body.listing_context;
  delete body.organization_id;
  if (opts.locked) {
    for (const k of ["address", "property_type", "land_area", "building_area"]) delete body[k];
  }
  return body;
}

/** Ringkasan satu baris untuk pratinjau: "Rumah · 3 KT · 2 KM · LT 150 · LB 120". */
export function specLine(v: WizardValues, typeLabel: (t: string) => string): string {
  return [typeLabel(v.propertyType), v.bedrooms.trim() ? `${v.bedrooms} KT` : "", v.bathrooms.trim() ? `${v.bathrooms} KM` : "", v.landArea.trim() ? `LT ${v.landArea}` : "", v.buildingArea.trim() ? `LB ${v.buildingArea}` : ""].filter(Boolean).join(" · ");
}

/** Selisih media saat edit: hapus yang tak lagi diinginkan (menurut URL), tambah URL baru dengan indeks urut. */
export function diffMedia(existing: { id: string; url: string }[], desired: string[]): { remove: string[]; add: { url: string; index: number }[] } {
  const have = new Set(existing.map((m) => m.url));
  const want = new Set(desired);
  return {
    remove: existing.filter((m) => !want.has(m.url)).map((m) => m.id),
    add: desired.map((url, index) => ({ url, index })).filter((m) => !have.has(m.url)),
  };
}

export function diffIds(before: string[], after: string[]): { attach: string[]; detach: string[] } {
  const b = new Set(before);
  const a = new Set(after);
  return { attach: after.filter((x) => !b.has(x)), detach: before.filter((x) => !a.has(x)) };
}
