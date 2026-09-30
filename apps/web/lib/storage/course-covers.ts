// lib/storage/course-covers.ts — foto sampul kursus (courses.cover_image_url) di bucket publik `course-covers` (migration 0170). Path: "{uploader_user_id}/{uuid}.{webp|jpg}" —
// per-PENGUNGGAH, bukan per-course seperti lib/storage/course-materials.ts, karena foto bisa diunggah SEBELUM course dibuat (form "Buat Kursus" belum punya course id). Otorisasi
// upload-url memeriksa has_permission('m04.course.manage', auth.uid()) terhadap diri sendiri (own-scope Instruktur match otomatis, staf lolos lewat scope all) — bukan kepemilikan
// course tertentu. Unggah lewat signed upload URL buatan server; URL publik disimpan langsung di courses.cover_image_url lewat POST/PUT /courses(/{id}).
import { STORED_IMAGE_TYPES, MAX_STORED_IMAGE_BYTES, type StoredImageType } from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const COURSE_COVERS_BUCKET = "course-covers";

export async function createCourseCoverUpload(userId: string, contentType: StoredImageType) {
  const path = `${userId}/${crypto.randomUUID()}.${STORED_IMAGE_TYPES[contentType]}`;
  const { data, error } = await createAdminClient().storage.from(COURSE_COVERS_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(COURSE_COVERS_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** Hapus berkas foto sampul lama dari storage bila URL-nya milik bucket ini (URL eksternal/lama diabaikan). */
export async function removeCourseCoverByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, COURSE_COVERS_BUCKET) : null;
  if (path) await createAdminClient().storage.from(COURSE_COVERS_BUCKET).remove([path]);
}
