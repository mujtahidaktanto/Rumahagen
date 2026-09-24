// lib/storage/project-files.ts
// File proyek Developer Partner di Supabase Storage (migration 0147). Dua bucket:
//   * project-media  (publik)  : foto/video proyek; developer_project_media.url berisi URL publik.
//   * marketing-kits (privat)  : brosur/price list PDF; marketing_kit.file_url berisi referensi "storage:marketing-kits/{project_id}/{uuid}-{nama}"
//     dan unduhan lewat signed URL yang dibuat server (download_url).
// Unggah selalu lewat signed upload URL yang dibuat server setelah kepemilikan proyek diperiksa; tanpa policy storage.objects. Client service role dipakai HANYA
// setelah otorisasi diperiksa lewat sesi pengguna (RLS / has_permission).

import { createAdminClient } from "@/lib/supabase/admin";

export const PROJECT_MEDIA_BUCKET = "project-media";
export const MARKETING_KIT_BUCKET = "marketing-kits";
export const STORAGE_REF_PREFIX = "storage:";

export const MEDIA_CONTENT_TYPES = { "image/jpeg": "photo", "image/png": "photo", "image/webp": "photo", "video/mp4": "video" } as const;
export const MAX_MEDIA_BYTES = 52_428_800;
export const MAX_KIT_BYTES = 20_971_520;
export const SIGNED_DOWNLOAD_SECONDS = 3600;

export function projectFilePath(projectId: string, fileName: string): string {
  const safe = fileName.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-100) || "file";
  return `${projectId}/${crypto.randomUUID()}-${safe}`;
}

export function kitRef(path: string): string {
  return `${STORAGE_REF_PREFIX}${MARKETING_KIT_BUCKET}/${path}`;
}

// Referensi kit milik proyek ini? (mencegah menempelkan file proyek lain lewat POST/PUT)
export function isOwnKitRef(fileUrl: string, projectId: string): boolean {
  return fileUrl.startsWith(`${STORAGE_REF_PREFIX}${MARKETING_KIT_BUCKET}/${projectId}/`);
}

export function kitPathOf(fileUrl: string): string | null {
  const prefix = `${STORAGE_REF_PREFIX}${MARKETING_KIT_BUCKET}/`;
  return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null;
}

export function mediaPublicUrl(path: string): string {
  return createAdminClient().storage.from(PROJECT_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

// URL publik bucket project-media: milik proyek ini, milik proyek lain, atau URL luar (tetap diizinkan seperti sebelumnya).
export function mediaUrlOwnership(url: string, projectId: string): "own" | "foreign_project" | "external" {
  const marker = `/storage/v1/object/public/${PROJECT_MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return "external";
  return url.slice(i + marker.length).startsWith(`${projectId}/`) ? "own" : "foreign_project";
}

export async function createUploadTarget(bucket: string, path: string) {
  const { data, error } = await createAdminClient().storage.from(bucket).createSignedUploadUrl(path);
  if (error) {
    throw error;
  }
  return data; // { signedUrl, token, path }
}

export async function kitObjectExists(path: string): Promise<boolean> {
  const { error } = await createAdminClient().storage.from(MARKETING_KIT_BUCKET).createSignedUrl(path, 30);
  return !error;
}

export async function withKitDownloadUrls<T extends { file_url: string }>(rows: T[]): Promise<(T & { download_url: string | null })[]> {
  const admin = createAdminClient();
  return Promise.all(
    rows.map(async (row) => {
      const path = kitPathOf(row.file_url);
      if (!path) {
        return { ...row, download_url: /^https?:\/\//.test(row.file_url) ? row.file_url : null };
      }
      const { data } = await admin.storage.from(MARKETING_KIT_BUCKET).createSignedUrl(path, SIGNED_DOWNLOAD_SECONDS);
      return { ...row, download_url: data?.signedUrl ?? null };
    }),
  );
}

export async function removeKitObject(fileUrl: string): Promise<void> {
  const path = kitPathOf(fileUrl);
  if (path) {
    await createAdminClient().storage.from(MARKETING_KIT_BUCKET).remove([path]);
  }
}
