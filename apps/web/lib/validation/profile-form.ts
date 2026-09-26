// lib/validation/profile-form.ts — aturan formulir Profil Saya (M02) dan verifikasi KTP, murni tanpa I/O agar bisa diuji. Batas mengikuti upsertAgentProfileSchema (lib/validation/agent-profiles.ts)
// dan submitKtpSchema/KTP_CONTENT_TYPES; server tetap menjadi penentu akhir (UI hanya memberi tahu lebih awal).
import { whatsappUrl } from "@/lib/format";

export type ProfileFormValues = {
  fullName: string;
  whatsapp: string;
  bio: string;
  specialization: string[];
  coverageArea: string;
  licenseNumber: string;
  officeName: string;
  provinceId: string;
  cityId: string;
  profileVisibility: "public" | "private";
  publicCtaEnabled: boolean;
  /** Alamat profil publik (/agen/{slug}); dikirim hanya bila berubah. Profil baru: kosong (dibuat server). */
  publicSlug: string;
};

export const BIO_MAX = 2000;
export const SPECIALIZATION_MAX_ITEMS = 8;
export const SPECIALIZATION_MAX_LENGTH = 40;

export type ProfileErrors = Partial<Record<"fullName" | "whatsapp" | "bio" | "specialization" | "coverageArea" | "licenseNumber" | "officeName" | "cityId", string>>;

export function validateProfile(v: ProfileFormValues): ProfileErrors {
  const e: ProfileErrors = {};
  const name = v.fullName.trim();
  if (!name) e.fullName = "Nama lengkap wajib diisi.";
  else if (name.length > 150) e.fullName = "Maksimal 150 karakter.";

  const wa = v.whatsapp.trim();
  if (!wa) e.whatsapp = "Nomor WhatsApp wajib diisi.";
  else if (wa.length > 20) e.whatsapp = "Maksimal 20 karakter.";
  else if (!whatsappUrl(wa)) e.whatsapp = "Nomor WhatsApp tidak valid (contoh 0812-3456-7890).";

  if (v.bio.length > BIO_MAX) e.bio = `Maksimal ${BIO_MAX.toLocaleString("id-ID")} karakter.`;
  if (v.specialization.length > SPECIALIZATION_MAX_ITEMS) e.specialization = `Maksimal ${SPECIALIZATION_MAX_ITEMS} spesialisasi.`;
  if (v.coverageArea.trim().length > 255) e.coverageArea = "Maksimal 255 karakter.";
  if (v.licenseNumber.trim().length > 50) e.licenseNumber = "Maksimal 50 karakter.";
  if (v.officeName.trim().length > 150) e.officeName = "Maksimal 150 karakter.";
  if (v.cityId && !v.provinceId) e.cityId = "Pilih provinsi lebih dulu.";
  return e;
}

/** Badan PUT /users/profile. Provinsi/kota kosong dihilangkan (API tidak menerima null); teks kosong tetap dikirim agar bisa mengosongkan kolom. */
export function toProfilePayload(v: ProfileFormValues, opts: { slugChanged?: boolean } = {}): Record<string, unknown> {
  return {
    full_name: v.fullName.trim(),
    whatsapp_number: v.whatsapp.trim(),
    bio: v.bio.trim(),
    specialization: v.specialization,
    coverage_area: v.coverageArea.trim(),
    license_number: v.licenseNumber.trim(),
    office_name: v.officeName.trim(),
    ...(v.provinceId ? { province_id: v.provinceId } : {}),
    ...(v.provinceId && v.cityId ? { city_id: v.cityId } : {}),
    profile_visibility: v.profileVisibility,
    public_cta_enabled: v.publicCtaEnabled,
    ...(opts.slugChanged && v.publicSlug ? { public_slug: v.publicSlug } : {}),
  };
}

/** Menambah spesialisasi: dipangkas, tanpa duplikat (tak peka huruf besar), dibatasi panjang dan jumlah. Mengembalikan daftar baru atau galat. */
export function addSpecialization(list: string[], raw: string): { list: string[]; error?: string } {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return { list };
  if (t.length > SPECIALIZATION_MAX_LENGTH) return { list, error: `Maksimal ${SPECIALIZATION_MAX_LENGTH} karakter per spesialisasi.` };
  if (list.some((x) => x.toLowerCase() === t.toLowerCase())) return { list, error: "Spesialisasi itu sudah ada." };
  if (list.length >= SPECIALIZATION_MAX_ITEMS) return { list, error: `Maksimal ${SPECIALIZATION_MAX_ITEMS} spesialisasi.` };
  return { list: [...list, t] };
}

// ── KTP ──
export const KTP_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
export const KTP_MAX_BYTES = 5_242_880;

/** Hanya digit, maksimal 16 (untuk kolom NIK yang diketik atau ditempel). */
export function cleanNikInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16);
}
export const isNikShape = (s: string) => /^[0-9]{16}$/.test(s);

export function ktpFileProblem(file: { type: string; size: number }): string | null {
  if (!(KTP_ACCEPT as readonly string[]).includes(file.type)) return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  if (file.size > KTP_MAX_BYTES) return "Ukuran foto melebihi 5 MB. Perkecil gambar lalu coba lagi.";
  if (file.size <= 0) return "Berkas kosong.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
