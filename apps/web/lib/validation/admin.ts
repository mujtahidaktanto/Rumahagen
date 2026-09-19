// lib/validation/admin.ts
// Skema Zod untuk M09 Admin Console (STEP11-A API-129/149/238/239 + M11
// API-135/136 banners). Field persis mengikuti kolom DB:
// system_configs (0011), dbr_config (0008), audit_logs (0012),
// notification_templates (0013), public_announcement_promotion (0014/0028).

import { z } from "zod";

// GET/PUT /admin/config/system/{key} — API-238/239
export const systemConfigUpsertSchema = z.object({
  config_value: z.string().max(255).nullable(),
});
export type SystemConfigUpsertInput = z.infer<typeof systemConfigUpsertSchema>;

// PUT /admin/config/dbr — API-129 (M07, dikelola via M09 console)
export const dbrConfigUpdateSchema = z.object({
  dbr_threshold_percent: z.coerce.number().min(0).max(100).optional(),
  default_interest_rate: z.coerce.number().min(0).max(100).optional(),
});
export type DbrConfigUpdateInput = z.infer<typeof dbrConfigUpdateSchema>;

// GET /admin/audit-logs — API-149 (read-only; INSERT hanya lewat log_audit_event())
export const auditLogsQuerySchema = z.object({
  entity_type: z.string().max(50).optional(),
  action: z.string().max(100).optional(),
  user_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
});
export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>;

// PUT /admin/notification-templates/{type} — ADD-NEW (tidak ada route
// evidenced di STEP11-A untuk resource ini; POST tidak ada karena 6 nilai
// `type` sudah dikunci CHECK constraint & di-seed penuh sejak 0013 — hanya
// UPDATE, tidak ada CREATE baru).
export const notificationTemplateUpdateSchema = z.object({
  title_template: z.string().min(1).max(200).optional(),
  message_template: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});
export type NotificationTemplateUpdateInput = z.infer<typeof notificationTemplateUpdateSchema>;

// POST/PUT /admin/banners — API-136 (M09 mutation atas public_announcement_promotion)
export const bannerSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  image_reference: z.string().max(500).optional(),
  cta_reference: z.string().max(500).optional(),
  campaign_reference: z.string().max(150).optional(),
  priority: z.coerce.number().int().optional(),
  schedule_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  status: z.enum(["draft", "scheduled", "active", "expired", "archived"]).optional(),
  canonical_url: z.string().max(500).optional(),
});
export type BannerInput = z.infer<typeof bannerSchema>;

export const updateBannerSchema = bannerSchema.partial();
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

// GET/PUT /admin/config/seo — CORE-CFG-SEO-01 (STEP11-B9 §6), tabel baru
// seo_config (migration 0097, permission m09.system_configuration.manage)
export const seoConfigUpdateSchema = z.object({
  site_title_suffix: z.string().max(150).nullable().optional(),
  default_meta_description: z.string().max(500).nullable().optional(),
  default_og_image_url: z.string().max(500).nullable().optional(),
  robots_global_noindex: z.boolean().optional(),
  sitemap_enabled: z.boolean().optional(),
});
export type SeoConfigUpdateInput = z.infer<typeof seoConfigUpdateSchema>;
