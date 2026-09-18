// lib/validation/listing-media.ts
// Skema Zod untuk 7 tabel M03 Fase 1 (migration 0047): listing_photos/
// listing_videos (digabung sebagai "media" mengikuti STEP11-B2 API-030-032
// yang memakai istilah generik "media", bukan photos/videos terpisah),
// listing_price_history (read-only, diisi trigger), listing_views/
// listing_leads (event log, INSERT terbuka), amenities/listing_amenities.

import { z } from "zod";

export const createListingMediaSchema = z.object({
  media_type: z.enum(["photo", "video", "virtual_tour"]),
  url: z.string().min(1).max(500),
  alt_text: z.string().max(150).optional(),
  is_cover: z.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
  file_hash: z.string().max(64).optional(),
  photo_hash: z.string().max(64).optional(),
});
export type CreateListingMediaInput = z.infer<typeof createListingMediaSchema>;

export const createLeadSchema = z.object({
  listing_id: z.string().uuid(),
  source: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const createAmenitySchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;

export const attachAmenitySchema = z.object({
  amenity_id: z.string().uuid(),
});
export type AttachAmenityInput = z.infer<typeof attachAmenitySchema>;
