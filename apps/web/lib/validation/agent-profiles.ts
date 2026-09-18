// lib/validation/agent-profiles.ts
// Skema Zod untuk M02 Profile (agent_profiles/agent_reviews, migration
// 0029-0030). STEP11-B1 API-011/012/014/016/017/018/019/020 evidenced.
// `total_listings_sold`/`total_listings_rented` SENGAJA tidak ada di skema
// manapun di sini — migration 0029 sendiri menyatakan itu proyeksi/cache
// dari M03 yang belum ada mekanisme sinkronisasinya, bukan field yang bisa
// ditulis lewat REST API mana pun (client atau staff).

import { z } from "zod";

export const upsertAgentProfileSchema = z.object({
  full_name: z.string().min(1).max(150),
  avatar_url: z.string().max(500).optional(),
  bio: z.string().optional(),
  specialization: z.array(z.string()).optional(),
  coverage_area: z.string().max(255).optional(),
  office_name: z.string().max(150).optional(),
  license_number: z.string().max(50).optional(),
  whatsapp_number: z.string().min(1).max(20),
  contact_visibility: z.enum(["public", "hidden"]).optional(),
  public_cta_enabled: z.boolean().optional(),
  profile_visibility: z.enum(["public", "private"]).optional(),
});
export type UpsertAgentProfileInput = z.infer<typeof upsertAgentProfileSchema>;

export const createAgentReviewSchema = z.object({
  reviewer_name: z.string().max(150).optional(),
  listing_lead_id: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});
export type CreateAgentReviewInput = z.infer<typeof createAgentReviewSchema>;

export const rejectAgentReviewSchema = z.object({
  reason: z.string().optional(),
});
export type RejectAgentReviewInput = z.infer<typeof rejectAgentReviewSchema>;
