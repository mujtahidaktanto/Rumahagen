// lib/storage/home-hero-media.ts — gambar slide banner hero halaman utama (home_hero_banners.image_reference) di bucket publik `home-hero-media` (migration 0167).
// Path: "{uuid}.{webp|jpg}" tanpa folder pemilik — dikelola staf (m11.static_public_content.publish), bukan konten milik satu pengguna. Unggah lewat signed upload
// URL buatan server (pola lib/storage/announcement-media.ts); URL publik disimpan langsung di image_reference lewat POST/PUT /admin/home-hero-banners(/{id}).
import { STORED_IMAGE_TYPES, MAX_STORED_IMAGE_BYTES, type StoredImageType } from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const HOME_HERO_MEDIA_BUCKET = "home-hero-media";

export async function createHomeHeroMediaUpload(contentType: StoredImageType) {
  const path = `${crypto.randomUUID()}.${STORED_IMAGE_TYPES[contentType]}`;
  const { data, error } = await createAdminClient().storage.from(HOME_HERO_MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(HOME_HERO_MEDIA_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** Hapus berkas gambar slide lama dari storage bila URL-nya milik bucket ini (URL eksternal/lama diabaikan). */
export async function removeHomeHeroMediaByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, HOME_HERO_MEDIA_BUCKET) : null;
  if (path) await createAdminClient().storage.from(HOME_HERO_MEDIA_BUCKET).remove([path]);
}
