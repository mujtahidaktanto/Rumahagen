// lib/agent/slug.ts — alamat profil publik Agent (/agen/{slug}), murni tanpa I/O (diuji). Aturan mengikuti migration 0157 (agent_slug_problem, enforce_agent_slug_change): huruf kecil/angka/tanda
// hubung, 3-60 karakter, bukan kata dicadangkan, belum dipakai; diganti maksimal 1x per bulan kalender WIB. Pemeriksaan di sini hanya untuk umpan balik cepat; database tetap penentu akhir.
export const SLUG_MIN = 3;
export const SLUG_MAX = 60;
export const SITE_PROFILE_PREFIX = "rumahagen.com/agen/";

export type SlugReason = "format" | "panjang" | "dicadangkan" | "dipakai" | "sama" | "belum_ada_profil";

export const SLUG_REASON_TEXT: Record<SlugReason, string> = {
  format: "Hanya huruf kecil, angka, dan tanda hubung (tanpa spasi), mis. andi-pratama.",
  panjang: `Alamat harus ${SLUG_MIN} sampai ${SLUG_MAX} karakter.`,
  dicadangkan: "Alamat itu dicadangkan sistem. Pilih alamat lain.",
  dipakai: "Alamat itu sudah dipakai. Pilih alamat lain.",
  sama: "Ini alamat profil Anda saat ini.",
  belum_ada_profil: "Simpan profil Anda lebih dulu.",
};

/** Merapikan ketikan: huruf kecil, spasi/garis bawah -> "-", karakter lain dibuang, tanda hubung ganda dijadikan satu. Tanda hubung di ujung dipertahankan saat mengetik. */
export function normalizeSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, SLUG_MAX);
}

/** Bentuk akhir yang dikirim: tanda hubung ujung dibuang. */
export const finalizeSlug = (s: string): string => s.replace(/-+$/g, "");

/** Galat bentuk (sebelum ke server) atau null. */
export function slugShapeError(s: string): string | null {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) return SLUG_REASON_TEXT.format;
  if (s.length < SLUG_MIN || s.length > SLUG_MAX) return SLUG_REASON_TEXT.panjang;
  return null;
}

const WIB = "Asia/Jakarta";
const monthKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: WIB, year: "numeric", month: "2-digit" }).format(d);

/** Boleh mengganti alamat: belum pernah diganti, atau terakhir diganti di bulan kalender (WIB) yang berbeda. */
export function canChangeSlug(lastChangedAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!lastChangedAt) return true;
  const last = new Date(lastChangedAt);
  return Number.isNaN(last.getTime()) || monthKey(last) !== monthKey(now);
}

/** Awal bulan kalender berikutnya, 00:00 WIB. */
export function nextSlugChangeAt(now: Date = new Date()): Date {
  const [y, m] = monthKey(now).split("-").map(Number) as [number, number];
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return new Date(`${ny}-${String(nm).padStart(2, "0")}-01T00:00:00+07:00`);
}
