// lib/storage/announcement-media.ts — gambar banner (public_announcement_promotion.image_reference) di bucket publik `announcement-media` (migration 0166). Path:
// "{uuid}.{webp|jpg}" tanpa folder pemilik — banner dikelola staf (m11.announcement_promotion.publish), bukan konten milik satu pengguna. Unggah lewat signed upload
// URL buatan server (pola lib/storage/organization-media.ts); URL publik disimpan langsung di image_reference lewat POST/PUT /admin/banners(/{id}).
import { STORED_IMAGE_TYPES, MAX_STORED_IMAGE_BYTES, type StoredImageType } from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const ANNOUNCEMENT_MEDIA_BUCKET = "announcement-media";

export async function createAnnouncementMediaUpload(contentType: StoredImageType) {
  const path = `${crypto.randomUUID()}.${STORED_IMAGE_TYPES[contentType]}`;
  const { data, error } = await createAdminClient().storage.from(ANNOUNCEMENT_MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(ANNOUNCEMENT_MEDIA_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** Hapus berkas gambar banner lama dari storage bila URL-nya milik bucket ini (URL eksternal/lama diabaikan). */
export async function removeAnnouncementMediaByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, ANNOUNCEMENT_MEDIA_BUCKET) : null;
  if (path) await createAdminClient().storage.from(ANNOUNCEMENT_MEDIA_BUCKET).remove([path]);
}
