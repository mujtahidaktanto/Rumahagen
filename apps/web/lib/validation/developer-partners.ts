// lib/validation/developer-partners.ts
// Skema Zod untuk direktori Developer Partner. Field persis mengikuti kolom
// `public.developer_partners` di supabase/migrations/0033_m06_developer_partners.sql.
// Dikelola staf (has_permission m06.developer_partner.manage, Superadmin/
// Admin/Manager=ALL) — bukan self-service Developer Partner sendiri.

import { z } from "zod";

export const createDeveloperPartnerSchema = z.object({
  company_name: z.string().min(1).max(200),
  company_logo: z.string().max(500).optional(),
  description: z.string().optional(),
  pic_name: z.string().max(150).optional(),
  pic_contact: z.string().max(50).optional(),
  user_id: z.string().uuid().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
export type CreateDeveloperPartnerInput = z.infer<typeof createDeveloperPartnerSchema>;

export const updateDeveloperPartnerSchema = createDeveloperPartnerSchema.partial();
export type UpdateDeveloperPartnerInput = z.infer<typeof updateDeveloperPartnerSchema>;
