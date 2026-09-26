// lib/storage/public-images.ts — penyimpanan foto profil (bucket `avatars`) dan foto listing (bucket `listing-photos`), keduanya publik-baca (migration 0158). Unggah lewat signed upload
// URL buatan server (service role hanya untuk operasi storage, setelah kepemilikan diperiksa pemanggil); klien PUT berkas lalu memberi tahu API. Aturan nama/varian ada di lib/media/variants.ts.
import { z } from "zod";
import {
  AVATAR_BUCKET,
  LISTING_PHOTO_BUCKET,
  LISTING_VARIANT_ORDER,
  MAX_STORED_IMAGE_BYTES,
  STORED_IMAGE_TYPES,
  allVariantPaths,
  avatarPath,
  listingPhotoPath,
  objectPathFromPublicUrl,
  type ListingVariant,
  type StoredImageType,
} from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";

export const imageUploadUrlSchema = z.object({
  content_type: z.enum(Object.keys(STORED_IMAGE_TYPES) as [StoredImageType, ...StoredImageType[]]),
});

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function publicUrl(bucket: string, path: string): string {
  return `${supabaseUrl().replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

/** Path objek bila URL milik bucket ini di proyek ini, selain itu null. */
export const pathInBucket = (url: string, bucket: string) => objectPathFromPublicUrl(url, supabaseUrl(), bucket);

async function signedTarget(bucket: string, path: string) {
  const { data, error } = await createAdminClient().storage.from(bucket).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl };
}

export async function objectExists(bucket: string, path: string): Promise<boolean> {
  const { error } = await createAdminClient().storage.from(bucket).createSignedUrl(path, 30);
  return !error;
}

export async function removeObjects(bucket: string, paths: string[]): Promise<void> {
  if (paths.length) await createAdminClient().storage.from(bucket).remove(paths);
}

// ── Foto profil ──
export async function createAvatarUpload(userId: string, contentType: StoredImageType) {
  const path = avatarPath(userId, crypto.randomUUID(), STORED_IMAGE_TYPES[contentType]);
  const t = await signedTarget(AVATAR_BUCKET, path);
  return { ...t, public_url: publicUrl(AVATAR_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** Path avatar yang sah milik pengguna ("{user}/{uuid}-512.ext"); null bila bukan. */
export function ownAvatarPath(userId: string, path: string): string | null {
  return new RegExp(`^${userId}/[0-9a-f-]{36}-512\\.(webp|jpg)$`).test(path) ? path : null;
}

// ── Foto listing ──
export async function createListingPhotoUploads(userId: string, listingId: string, contentType: StoredImageType) {
  const ext = STORED_IMAGE_TYPES[contentType];
  const id = crypto.randomUUID();
  const uploads = await Promise.all(
    LISTING_VARIANT_ORDER.map(async (variant: ListingVariant) => {
      const path = listingPhotoPath(userId, listingId, id, variant, ext);
      return { variant, ...(await signedTarget(LISTING_PHOTO_BUCKET, path)), public_url: publicUrl(LISTING_PHOTO_BUCKET, path) };
    }),
  );
  return { id, uploads, content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/**
 * URL foto listing hasil unggah yang sah untuk (pengguna, listing): varian besar milik pemanggil di folder listing itu, dan ketiga varian sudah ada di storage.
 * Mengembalikan "ok", "not_own" (bukan berkas bucket ini/bukan folder pemanggil) atau "incomplete" (ada varian yang belum terunggah).
 */
export async function checkListingPhotoUrl(url: string, userId: string, listingId: string): Promise<"ok" | "not_own" | "incomplete" | "external"> {
  const path = pathInBucket(url, LISTING_PHOTO_BUCKET);
  if (!path) return "external";
  if (!new RegExp(`^${userId}/${listingId}/[0-9a-f-]{36}-2048\\.(webp|jpg)$`).test(path)) return "not_own";
  const all = await Promise.all(allVariantPaths(path).map((p) => objectExists(LISTING_PHOTO_BUCKET, p)));
  return all.every(Boolean) ? "ok" : "incomplete";
}

/** Hapus semua varian dari URL foto listing hasil unggah (URL eksternal/lama diabaikan). */
export async function removeListingPhotoObjects(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, LISTING_PHOTO_BUCKET) : null;
  if (path) await removeObjects(LISTING_PHOTO_BUCKET, allVariantPaths(path));
}
