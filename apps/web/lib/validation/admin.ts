// lib/validation/admin.ts
// Skema Zod untuk M09 Admin Console (STEP11-A API-129/149/238/239 + M11
// API-135/136 banners). Field persis mengikuti kolom DB:
// system_configs (0011), dbr_config (0008), audit_logs (0012),
// notification_templates (0013), public_announcement_promotion (0014/0028).

import { z } from "zod";
import { passwordSchema } from "./auth";

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

// PUT /admin/permissions/matrix — API-146 (M10). Upsert satu sel
// role_id×permission_id di role_permissions (baseline). RLS 0007/0103
// membedakan Superadmin (semua role) vs Manager (hanya baris role Agent).
export const permissionMatrixCellUpdateSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  granted_scope: z.enum(["all", "own", "none"]),
});
export type PermissionMatrixCellUpdateInput = z.infer<typeof permissionMatrixCellUpdateSchema>;

// GET/PUT /admin/permissions/matrix/agent — API-145/API-147 (M10). Nama
// path historis ("agent") dari saat trigger 0004 salah mengunci SEMUA
// preset ke role Agent -- 0102 memperbaiki trigger itu supaya Superadmin
// tetap bisa target role LAIN (STEP12-B PP-002/PP-003), tapi endpoint-nya
// sendiri belum pernah diperbarui untuk mengekspos itu (ditemukan lewat
// pertanyaan user, 2026-09-25). `target_role_id` kini opsional -- default
// Agent (perilaku lama, satu-satunya yang bisa dipakai Manager), diisi
// eksplisit HANYA berlaku untuk Superadmin (trigger enforce_preset_
// target_role_is_agent yang menegakkan, bukan diduplikasi di sini, R-02).
export const presetTargetRoleQuerySchema = z.object({
  target_role_id: z.string().uuid().optional(),
});
export type PresetTargetRoleQuery = z.infer<typeof presetTargetRoleQuerySchema>;

export const agentPermissionPresetUpsertSchema = z.object({
  preset_id: z.string().uuid().optional(),
  target_role_id: z.string().uuid().optional(),
  name: z.string().min(1).max(150),
  items: z
    .array(
      z.object({
        permission_id: z.string().uuid(),
        granted_scope: z.enum(["all", "own", "none"]),
      }),
    )
    .min(1),
});
export type AgentPermissionPresetUpsertInput = z.infer<typeof agentPermissionPresetUpsertSchema>;

// PUT /admin/users/{id}/permission-preset — ADD-NEW (STEP12-B menyebut
// "Assign/Replace" sebagai kapabilitas yang dibutuhkan tapi tidak mengunci
// endpoint pastinya; ekstensi minimal dari pola /admin/users/{id}/role
// yang sudah dikunci STEP11-A). `preset_id: null` melepas assignment.
export const assignPermissionPresetSchema = z.object({
  preset_id: z.string().uuid().nullable(),
});
export type AssignPermissionPresetInput = z.infer<typeof assignPermissionPresetSchema>;

// PUT /admin/users/{id}/role — API-148 (M10). Superadmin-only (RLS
// users_update_admin, 0104) — perubahan role adalah operasi paling
// sensitif di seluruh model otorisasi.
export const updateUserRoleSchema = z.object({
  role_id: z.string().uuid(),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// GET/POST /admin/internal-users, PUT /admin/internal-users/{id},
// PUT /admin/internal-users/{id}/deactivate — API-139/140/141/142 (M09,
// STEP11-A). "Internal user" = akun staf (role admin/manager/superadmin),
// dibedakan dari actor platform (agent/buyer/developer_partner/instructor)
// yang punya jalur pendaftaran sendiri (M01). Tidak ada definisi
// field/skema apa pun untuk resource ini di korpus Core selain nama
// endpoint (dicek menyeluruh) — desain di bawah adalah keputusan rekayasa
// minimal: `public.users` tidak punya kolom email/nama sama sekali (email
// hanya ada di auth.users), jadi create memakai Supabase Admin API
// (auth.admin.createUser) lalu role_id di-set eksplisit (menimpa default
// 'agent' dari trigger sinkron 0096).
export const createInternalUserSchema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema,
  role_id: z.string().uuid(),
});
export type CreateInternalUserInput = z.infer<typeof createInternalUserSchema>;

export const updateInternalUserSchema = z.object({
  role_id: z.string().uuid().optional(),
  status: z.enum(["active", "suspended"]).optional(),
});
export type UpdateInternalUserInput = z.infer<typeof updateInternalUserSchema>;
