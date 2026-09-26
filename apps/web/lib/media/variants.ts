// lib/media/variants.ts — aturan murni foto (profil dan listing): ukuran varian, batas berkas, dan penurunan URL varian dari URL varian besar. Tanpa I/O dan tanpa impor server,
// sehingga aman dipakai komponen klien, halaman publik, dan uji. Keputusan 2026-09-26: berkas tersimpan maksimal 3 MB, pilih berkas di browser hingga 25 MB (dikecilkan di browser).
export const MAX_STORED_IMAGE_BYTES = 3_145_728;
export const MAX_PICKED_IMAGE_BYTES = 26_214_400;
export const STORED_IMAGE_TYPES = { "image/webp": "webp", "image/jpeg": "jpg" } as const;
export type StoredImageType = keyof typeof STORED_IMAGE_TYPES;

export const AVATAR_SIZE = 512;
export const LISTING_VARIANTS = { sm: 400, md: 1080, lg: 2048 } as const;
export type ListingVariant = keyof typeof LISTING_VARIANTS;
export const LISTING_VARIANT_ORDER: ListingVariant[] = ["sm", "md", "lg"];
export const MAX_LISTING_PHOTOS = 20;

export const AVATAR_BUCKET = "avatars";
export const LISTING_PHOTO_BUCKET = "listing-photos";

const SUFFIX = /-(400|1080|2048)\.(webp|jpg)$/;

/**
 * URL varian yang diminta dari URL foto listing yang tersimpan (varian 2048). URL yang bukan hasil unggah (mis. tautan lama dari sebelum fitur unggah)
 * tidak punya varian: dikembalikan apa adanya.
 */
export function listingPhotoUrl(url: string | null | undefined, variant: ListingVariant): string | null {
  if (!url) return null;
  if (!SUFFIX.test(url)) return url;
  return url.replace(SUFFIX, (_m, _size, ext) => `-${LISTING_VARIANTS[variant]}.${ext}`);
}

/** Nama berkas varian dari "basis" (tanpa akhiran). */
export function variantFileName(base: string, variant: ListingVariant, ext: "webp" | "jpg"): string {
  return `${base}-${LISTING_VARIANTS[variant]}.${ext}`;
}

/** Path objek unggahan listing: "{user}/{listing}/{uuid}-{ukuran}.{ext}". */
export function listingPhotoPath(userId: string, listingId: string, uuid: string, variant: ListingVariant, ext: "webp" | "jpg"): string {
  return `${userId}/${listingId}/${variantFileName(uuid, variant, ext)}`;
}

export function avatarPath(userId: string, uuid: string, ext: "webp" | "jpg"): string {
  return `${userId}/${uuid}-${AVATAR_SIZE}.${ext}`;
}

/** Path objek di bucket dari URL publik bucket itu; null bila URL bukan milik bucket tsb. */
export function objectPathFromPublicUrl(url: string, supabaseUrl: string, bucket: string): string | null {
  const prefix = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  const path = url.slice(prefix.length).split("?")[0] ?? "";
  return path && !path.includes("..") ? decodeURIComponent(path) : null;
}

/** Semua path varian dari path varian besar (untuk menghapus foto). Path yang bukan hasil unggah -> hanya dirinya. */
export function allVariantPaths(largePath: string): string[] {
  if (!SUFFIX.test(largePath)) return [largePath];
  return LISTING_VARIANT_ORDER.map((v) => largePath.replace(SUFFIX, (_m, _s, ext) => `-${LISTING_VARIANTS[v]}.${ext}`));
}

// ── Geometri (dipakai pemangkas/pengecil di browser) ──

/** Ukuran terkecil yang muat dalam kotak max x max (tidak pernah memperbesar). */
export function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= 0 || h <= 0) return { width: 0, height: 0 };
  const s = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

export type CropState = { zoom: number; x: number; y: number };
export const CROP_MAX_ZOOM = 4;

/** Skala dasar agar gambar menutupi seluruh bingkai persegi berukuran `frame`. */
export const baseScale = (w: number, h: number, frame: number) => frame / Math.min(w, h);

/** Geser (x, y = posisi kiri-atas gambar terhadap bingkai, px layar) dijepit agar gambar selalu menutupi bingkai. */
export function clampCrop(w: number, h: number, frame: number, c: CropState): CropState {
  const zoom = Math.min(CROP_MAX_ZOOM, Math.max(1, c.zoom));
  const s = baseScale(w, h, frame) * zoom;
  const dw = w * s;
  const dh = h * s;
  return { zoom, x: Math.min(0, Math.max(frame - dw, c.x)), y: Math.min(0, Math.max(frame - dh, c.y)) };
}

/** Posisi awal: gambar di tengah bingkai pada zoom 1. */
export function centerCrop(w: number, h: number, frame: number): CropState {
  const s = baseScale(w, h, frame);
  return { zoom: 1, x: (frame - w * s) / 2, y: (frame - h * s) / 2 };
}

/** Zoom baru dengan titik tengah bingkai tetap di tempat. */
export function zoomAtCenter(w: number, h: number, frame: number, c: CropState, zoom: number): CropState {
  const z = Math.min(CROP_MAX_ZOOM, Math.max(1, zoom));
  const ratio = z / c.zoom;
  const cx = frame / 2;
  return clampCrop(w, h, frame, { zoom: z, x: cx - (cx - c.x) * ratio, y: cx - (cx - c.y) * ratio });
}

/** Persegi sumber (piksel gambar asli) yang terlihat di dalam bingkai. */
export function sourceRect(w: number, h: number, frame: number, c: CropState): { sx: number; sy: number; size: number } {
  const s = baseScale(w, h, frame) * c.zoom;
  return { sx: -c.x / s, sy: -c.y / s, size: frame / s };
}
