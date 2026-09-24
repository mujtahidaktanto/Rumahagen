// lib/storage/agent-ktp.ts
// Foto KTP Agent di bucket PRIVAT `agent-ktp` (migration 0149). Path: "{user_id}/ktp-{uuid}.{ext}". Unggah lewat signed upload URL buatan server; unduhan
// hanya lewat signed URL berumur pendek yang dibuat server setelah hak akses (pemilik atau staf) diperiksa lewat RLS. Client service role dipakai HANYA untuk
// operasi storage setelah otorisasi terbukti.

import { createAdminClient } from "@/lib/supabase/admin";

export const AGENT_KTP_BUCKET = "agent-ktp";
export const MAX_KTP_BYTES = 5_242_880;
export const KTP_CONTENT_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export const KTP_SIGNED_DOWNLOAD_SECONDS = 600;

export function ktpPhotoPath(userId: string, contentType: keyof typeof KTP_CONTENT_TYPES): string {
  return `${userId}/ktp-${crypto.randomUUID()}.${KTP_CONTENT_TYPES[contentType]}`;
}

export function maskNik(nik: string): string {
  return `${"*".repeat(Math.max(0, nik.length - 4))}${nik.slice(-4)}`;
}

export async function createKtpUploadTarget(path: string) {
  const { data, error } = await createAdminClient().storage.from(AGENT_KTP_BUCKET).createSignedUploadUrl(path);
  if (error) {
    throw error;
  }
  return data; // { signedUrl, token, path }
}

export async function ktpObjectExists(path: string): Promise<boolean> {
  const { error } = await createAdminClient().storage.from(AGENT_KTP_BUCKET).createSignedUrl(path, 30);
  return !error;
}

export async function ktpSignedUrl(path: string): Promise<string | null> {
  const { data } = await createAdminClient().storage.from(AGENT_KTP_BUCKET).createSignedUrl(path, KTP_SIGNED_DOWNLOAD_SECONDS);
  return data?.signedUrl ?? null;
}

export async function removeKtpObject(path: string | null | undefined): Promise<void> {
  if (path) {
    await createAdminClient().storage.from(AGENT_KTP_BUCKET).remove([path]);
  }
}
