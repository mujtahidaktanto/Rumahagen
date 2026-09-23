// lib/validation/organizations.ts
// Skema Zod untuk M12 Organization CRUD (API-156/157/158/159/160/166/167/
// 168 — STEP11-B6, admin-surface... err, gap agen/user M01-M15). Field
// persis mengikuti kolom public.organizations di migration 0005.

import { z } from "zod";

const organizationTypeEnum = z.enum(["agency", "kantor", "tim", "komunitas"]);

// POST /organizations (API-156). "Eligible Agent creates an Organization
// and becomes Lead" (B6 §8) -- master matrix (STEP12-01) memberi scope
// 'own' ke SEMUA role untuk M12 Manage, jadi tidak dibatasi ke role agent
// saja di sini (ikuti master matrix, bukan prosa B6 -- precedent R-02).
export const createOrganizationSchema = z.object({
  organization_name: z.string().min(1).max(150),
  slug: z.string().min(1).max(170).optional(),
  organization_type: organizationTypeEnum,
  logo_url: z.string().max(500).optional(),
  banner_url: z.string().max(500).optional(),
  description: z.string().optional(),
  website: z.string().max(255).optional(),
  social_media: z.record(z.string()).optional(),
  address: z.string().max(500).optional(),
  contact_phone: z.string().max(20).optional(),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// PUT /organizations/{id}/branding (API-158). "Branding remains
// Organization-owned presentation mutation" (B6 §8) -- dibatasi ke field
// presentasi/publik saja (logo/banner/description/website/social_media),
// TIDAK termasuk organization_name/address/contact_phone/organization_type
// yang lebih ke arah "Settings" (B6 §15, "Do not invent
// /organizations/{id}/settings" — sehingga field itu SENGAJA tidak
// dibuatkan jalur update apa pun, immutable pasca-create lewat HTTP).
export const updateOrganizationBrandingSchema = z.object({
  logo_url: z.string().max(500).nullable().optional(),
  banner_url: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  social_media: z.record(z.string()).nullable().optional(),
});
export type UpdateOrganizationBrandingInput = z.infer<typeof updateOrganizationBrandingSchema>;

// GET /organizations/search (API-159).
export const searchOrganizationsQuerySchema = z.object({
  q: z.string().max(150).optional(),
  organization_type: organizationTypeEnum.optional(),
});
export type SearchOrganizationsQuery = z.infer<typeof searchOrganizationsQuerySchema>;
