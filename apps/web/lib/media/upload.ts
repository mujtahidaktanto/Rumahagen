// lib/media/upload.ts — unggah satu foto listing dari browser: minta tiga signed upload URL, PUT varian 400/1080/2048, kembalikan URL publik varian 2048 (yang disimpan di listing_photos.url).
// Dipanggil setelah listing ada (Wizard: saat Simpan/Terbitkan, setelah POST /listings). Pemroses ada di lib/media/image-processing.ts.
import { api } from "@/lib/api-client";
import { putToSignedUrl } from "./image-processing";
import type { ListingVariant, StoredImageType } from "./variants";

type UploadTargets = { id: string; uploads: { variant: ListingVariant; path: string; upload_url: string; public_url: string }[] };

export type ProcessedPhoto = { type: StoredImageType; blobs: Record<ListingVariant, Blob> };

export async function uploadListingPhoto(listingId: string, photo: ProcessedPhoto): Promise<string> {
  const res = await api.post<UploadTargets>(`/listings/${listingId}/media/upload-url`, { content_type: photo.type }, { idempotency: true });
  await Promise.all(res.data.uploads.map((u) => putToSignedUrl(u.upload_url, photo.blobs[u.variant], photo.type)));
  const large = res.data.uploads.find((u) => u.variant === "lg");
  if (!large) throw new Error("Respons unggah tidak lengkap.");
  return large.public_url;
}
