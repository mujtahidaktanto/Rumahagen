// lib/storage/organization-media.ts — logo dan banner organisasi di bucket publik `organization-media` (migration 0161). Path: "{organization_id}/{logo|banner}-{uuid}.{webp|jpg}". Unggah lewat signed upload URL
// buatan server (pola lib/storage/public-images.ts); URL publik disimpan di organizations.logo_url/banner_url lewat PUT /organizations/{id}/branding.
import { STORED_IMAGE_TYPES, MAX_STORED_IMAGE_BYTES, type StoredImageType } from "@/lib/media/variants";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathInBucket, publicUrl } from "@/lib/storage/public-images";

export const ORG_MEDIA_BUCKET = "organization-media";
export type OrgMediaKind = "logo" | "banner";

export async function createOrganizationMediaUpload(orgId: string, kind: OrgMediaKind, contentType: StoredImageType) {
  const path = `${orgId}/${kind}-${crypto.randomUUID()}.${STORED_IMAGE_TYPES[contentType]}`;
  const { data, error } = await createAdminClient().storage.from(ORG_MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { path, upload_url: data.signedUrl, public_url: publicUrl(ORG_MEDIA_BUCKET, path), content_type: contentType, max_bytes: MAX_STORED_IMAGE_BYTES };
}

/** URL logo/banner yang sah untuk organisasi ini: milik bucket kita, di folder organisasi itu, dengan jenis yang sesuai. */
export function isOwnOrgMediaUrl(url: string, orgId: string, kind: OrgMediaKind): boolean {
  const path = pathInBucket(url, ORG_MEDIA_BUCKET);
  return !!path && new RegExp(`^${orgId}/${kind}-[0-9a-f-]{36}\\.(webp|jpg)$`).test(path);
}

export async function removeOrgMediaByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathInBucket(url, ORG_MEDIA_BUCKET) : null;
  if (path) await createAdminClient().storage.from(ORG_MEDIA_BUCKET).remove([path]);
}
