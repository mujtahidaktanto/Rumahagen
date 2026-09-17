// lib/validation/marketing-kit.ts
// Skema Zod untuk Marketing Kit (PDF brochure/pricelist per developer
// project). Field persis mengikuti kolom `public.marketing_kit` di
// supabase/migrations/0035_m06_marketing_kit_claims.sql.

import { z } from "zod";

export const createMarketingKitSchema = z.object({
  file_id: z.string().optional(),
  file_type: z.enum(["brochure", "price_list"]),
  file_name: z.string().min(1).max(255),
  file_url: z.string().min(1).max(500),
});
export type CreateMarketingKitInput = z.infer<typeof createMarketingKitSchema>;

export const updateMarketingKitSchema = createMarketingKitSchema.partial();
export type UpdateMarketingKitInput = z.infer<typeof updateMarketingKitSchema>;
