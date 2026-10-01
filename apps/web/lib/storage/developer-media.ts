// lib/storage/developer-media.ts — logo perusahaan dan logo riwayat perumahan Developer Partner di bucket publik `developer-media` (migration 0172). Path:
// "{developer_id}/{logo|history_logo}-{uuid}.{webp|jpg}" -- satu bucket dua kind, pola sama seperti lib/storage/organization-media.ts (logo/banner organisasi).
// Unggah lewat signed upload URL buatan server; URL publik disimpan di developer_partners.company_logo (PUT /developer-partners/{id}) atau
// developer_project_history.logo_url (POST/PUT project-history) setelah kepemilikan diperiksa.
import { STORED_IMAGE_TYPES, MAX_STORED_IMAGE_BYTES, type StoredImageType } from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const DEVELOPER_MEDIA_BUCKET = "developer-media";
export type DeveloperMediaKind = "logo" | "history_logo";

export async function createDeveloperMediaUpload(developerId: string, kind: DeveloperMediaKind, contentType: StoredImageType) {
  const path = `${developerId}/${kind}-${crypto.randomUUID()}.${STORED_IMAGE_TYPES[contentType]}`;
  const { data, error } = await createAdminClient().storage.from(DEVELOPER_MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(DEVELOPER_MEDIA_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** URL logo/history_logo yang sah untuk developer ini ("{developer_id}/{kind}-{uuid}.ext"); null bila bukan. */
export function isOwnDeveloperMediaUrl(url: string, developerId: string, kind: DeveloperMediaKind): boolean {
  const path = pathInBucket(url, DEVELOPER_MEDIA_BUCKET);
  return !!path && new RegExp(`^${developerId}/${kind}-[0-9a-f-]{36}\\.(webp|jpg)$`).test(path);
}

export async function removeDeveloperMediaByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, DEVELOPER_MEDIA_BUCKET) : null;
  if (path) await createAdminClient().storage.from(DEVELOPER_MEDIA_BUCKET).remove([path]);
}
