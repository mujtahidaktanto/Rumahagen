// lib/storage/certificate-assets.ts
// Logo mitra dan tanda tangan sertifikat di bucket PRIVAT `certificate-assets` (migration 0150). Path: `courses/{course_id}/{logo|signature}-{uuid}.{ext}` untuk
// kursus dan `defaults/signature-{uuid}.{ext}` untuk tanda tangan bawaan. Unggah lewat signed upload URL buatan server (hanya staf); file dibaca server saat
// membuat PDF dan lewat signed URL berumur pendek untuk pratinjau. Client service role dipakai HANYA untuk operasi storage setelah otorisasi terbukti.

import { createAdminClient } from "@/lib/supabase/admin";

export const CERTIFICATE_ASSETS_BUCKET = "certificate-assets";
export const MAX_CERT_ASSET_BYTES = 1_048_576;
export const CERT_ASSET_CONTENT_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as const;
export type CertAssetContentType = keyof typeof CERT_ASSET_CONTENT_TYPES;
export const CERT_ASSET_SIGNED_SECONDS = 600;

export function courseAssetPath(courseId: string, kind: "logo" | "signature", contentType: CertAssetContentType): string {
  return `courses/${courseId}/${kind}-${crypto.randomUUID()}.${CERT_ASSET_CONTENT_TYPES[contentType]}`;
}

export function defaultSignaturePath(contentType: CertAssetContentType): string {
  return `defaults/signature-${crypto.randomUUID()}.${CERT_ASSET_CONTENT_TYPES[contentType]}`;
}

export async function createCertAssetUploadTarget(path: string) {
  const { data, error } = await createAdminClient().storage.from(CERTIFICATE_ASSETS_BUCKET).createSignedUploadUrl(path);
  if (error) {
    throw error;
  }
  return data; // { signedUrl, token, path }
}

export async function certAssetExists(path: string): Promise<boolean> {
  const { error } = await createAdminClient().storage.from(CERTIFICATE_ASSETS_BUCKET).createSignedUrl(path, 30);
  return !error;
}

export async function certAssetSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) {
    return null;
  }
  const { data } = await createAdminClient().storage.from(CERTIFICATE_ASSETS_BUCKET).createSignedUrl(path, CERT_ASSET_SIGNED_SECONDS);
  return data?.signedUrl ?? null;
}

export async function downloadCertAsset(path: string): Promise<Buffer | null> {
  const { data, error } = await createAdminClient().storage.from(CERTIFICATE_ASSETS_BUCKET).download(path);
  if (error || !data) {
    return null;
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function removeCertAssets(paths: (string | null | undefined)[]): Promise<void> {
  const list = paths.filter((p): p is string => !!p);
  if (list.length > 0) {
    await createAdminClient().storage.from(CERTIFICATE_ASSETS_BUCKET).remove(list);
  }
}
