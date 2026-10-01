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

// POST /developer-partners/{id}/media-upload-url -- logo perusahaan atau logo riwayat perumahan (migration 0172, bucket publik `developer-media`).
export const developerMediaUploadSchema = z.object({
  kind: z.enum(["logo", "history_logo"]),
  content_type: z.enum(["image/webp", "image/jpeg"]),
});
export type DeveloperMediaUploadInput = z.infer<typeof developerMediaUploadSchema>;

// Berkas legalitas pendukung perusahaan (migration 0172, PRIVAT -- hanya pemilik akun dan staf).
export const createDeveloperLegalDocumentSchema = z.object({
  document_name: z.string().trim().min(1).max(200),
  // Referensi hasil POST /developer-partners/{id}/legal-documents/upload-url ("storage:developer-legal-docs/{developer_id}/...").
  file_url: z
    .string()
    .min(1)
    .max(500)
    .refine((v) => v.startsWith("storage:developer-legal-docs/"), { message: "Harus referensi hasil unggah." }),
});
export type CreateDeveloperLegalDocumentInput = z.infer<typeof createDeveloperLegalDocumentSchema>;

// Riwayat perumahan (migration 0172, PUBLIK -- citra brand developer).
export const createDeveloperProjectHistorySchema = z.object({
  project_name: z.string().trim().min(1).max(200),
  logo_url: z.string().max(500).optional(),
  display_order: z.coerce.number().int().optional(),
});
export type CreateDeveloperProjectHistoryInput = z.infer<typeof createDeveloperProjectHistorySchema>;

export const updateDeveloperProjectHistorySchema = createDeveloperProjectHistorySchema.partial();
export type UpdateDeveloperProjectHistoryInput = z.infer<typeof updateDeveloperProjectHistorySchema>;
