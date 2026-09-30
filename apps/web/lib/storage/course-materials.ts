// lib/storage/course-materials.ts — materi PDF/Slide pelajaran kursus (course_lessons.content_url) di bucket publik `course-materials` (migration 0168). Video
// tetap tautan luar (YouTube/mp4), tidak lewat sini. Path: "{course_id}/{uuid}-{nama berkas asli}" (nama dipertahankan supaya unduhan pengguna rapi — pola sama
// seperti lib/storage/project-files.ts projectFilePath). Unggah lewat signed upload URL server setelah kepemilikan course diperiksa (has_permission m04.course.manage).
import { MAX_COURSE_MATERIAL_BYTES } from "@/lib/validation/courses";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const COURSE_MATERIALS_BUCKET = "course-materials";

export function courseMaterialPath(courseId: string, fileName: string): string {
  const safe =
    fileName
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/^\.+/, "")
      .slice(-100) || "materi.pdf";
  return `${courseId}/${crypto.randomUUID()}-${safe}`;
}

export async function createCourseMaterialUpload(courseId: string, fileName: string) {
  const path = courseMaterialPath(courseId, fileName);
  const { data, error } = await createAdminClient().storage.from(COURSE_MATERIALS_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(COURSE_MATERIALS_BUCKET, path), max_bytes: MAX_COURSE_MATERIAL_BYTES };
}

/** Hapus berkas materi lama dari storage bila URL-nya milik bucket ini (URL eksternal/tautan Video diabaikan). */
export async function removeCourseMaterialByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, COURSE_MATERIALS_BUCKET) : null;
  if (path) await createAdminClient().storage.from(COURSE_MATERIALS_BUCKET).remove([path]);
}
