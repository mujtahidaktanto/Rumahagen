// lib/storage/developer-legal-docs.ts — berkas legalitas pendukung perusahaan Developer Partner di bucket PRIVAT `developer-legal-docs` (migration 0172, PDF/JPEG/PNG
// 20 MB). Path: "{developer_id}/{uuid}-{nama berkas asli}". Referensi disimpan sebagai "storage:developer-legal-docs/{path}" (STORAGE_REF_PREFIX, pola sama persis
// seperti lib/storage/project-files.ts untuk marketing-kits) -- diunduh lewat signed URL 1 jam yang dibuat server, TIDAK PERNAH lewat URL publik bucket.
import { createAdminClient } from "@/lib/supabase/admin";

export const DEVELOPER_LEGAL_DOCS_BUCKET = "developer-legal-docs";
export const DEVELOPER_LEGAL_DOC_REF_PREFIX = `storage:${DEVELOPER_LEGAL_DOCS_BUCKET}/`;
export const MAX_LEGAL_DOC_BYTES = 20_971_520;
const SIGNED_DOWNLOAD_SECONDS = 3600;

export function developerLegalDocPath(developerId: string, fileName: string): string {
  const safe =
    fileName
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/^\.+/, "")
      .slice(-100) || "berkas";
  return `${developerId}/${crypto.randomUUID()}-${safe}`;
}

export function developerLegalDocRef(path: string): string {
  return `${DEVELOPER_LEGAL_DOC_REF_PREFIX}${path}`;
}

/** Referensi milik developer ini? (mencegah menempelkan berkas developer lain lewat POST). */
export function isOwnDeveloperLegalDocRef(fileUrl: string, developerId: string): boolean {
  return fileUrl.startsWith(`${DEVELOPER_LEGAL_DOC_REF_PREFIX}${developerId}/`);
}

export function developerLegalDocPathOf(fileUrl: string): string | null {
  return fileUrl.startsWith(DEVELOPER_LEGAL_DOC_REF_PREFIX) ? fileUrl.slice(DEVELOPER_LEGAL_DOC_REF_PREFIX.length) : null;
}

export async function createDeveloperLegalDocUpload(developerId: string, fileName: string) {
  const path = developerLegalDocPath(developerId, fileName);
  const { data, error } = await createAdminClient().storage.from(DEVELOPER_LEGAL_DOCS_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, file_url: developerLegalDocRef(path), max_bytes: MAX_LEGAL_DOC_BYTES };
}

export async function developerLegalDocExists(path: string): Promise<boolean> {
  const { error } = await createAdminClient().storage.from(DEVELOPER_LEGAL_DOCS_BUCKET).createSignedUrl(path, 30);
  return !error;
}

export async function withDeveloperLegalDocDownloadUrls<T extends { file_url: string }>(rows: T[]): Promise<(T & { download_url: string | null })[]> {
  const admin = createAdminClient();
  return Promise.all(
    rows.map(async (row) => {
      const path = developerLegalDocPathOf(row.file_url);
      if (!path) return { ...row, download_url: null };
      const { data } = await admin.storage.from(DEVELOPER_LEGAL_DOCS_BUCKET).createSignedUrl(path, SIGNED_DOWNLOAD_SECONDS);
      return { ...row, download_url: data?.signedUrl ?? null };
    }),
  );
}

export async function removeDeveloperLegalDocObject(fileUrl: string): Promise<void> {
  const path = developerLegalDocPathOf(fileUrl);
  if (path) await createAdminClient().storage.from(DEVELOPER_LEGAL_DOCS_BUCKET).remove([path]);
}
