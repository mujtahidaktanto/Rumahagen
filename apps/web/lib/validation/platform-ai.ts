// lib/validation/platform-ai.ts — skema Zod untuk Koneksi AI Platform (migration 0174, M13).
// TERPISAH dari lib/validation/ai-providers.ts (BYOK Agent) -- resource beda (platform_ai_connections
// bukan agent_ai_connections), field berbeda (model_id dipilih dari katalog, bukan ketik bebas).
import { z } from "zod";

export const testPlatformKeySchema = z.object({
  api_key: z.string().trim().min(1).max(500),
});
export type TestPlatformKeyInput = z.infer<typeof testPlatformKeySchema>;

export const savePlatformKeySchema = z.object({
  api_key: z.string().trim().min(1).max(500),
  model_id: z.string().uuid(),
});
export type SavePlatformKeyInput = z.infer<typeof savePlatformKeySchema>;

export const testPlatformModelSchema = z.object({
  model_id: z.string().uuid(),
});
export type TestPlatformModelInput = z.infer<typeof testPlatformModelSchema>;

// PUT /admin/platform-ai-feature-settings/{featureCode} — "Pengaturan lanjutan" (temperature/
// max_output_tokens) dan field utama (model/batas/anggaran/aktif) sama-sama lewat satu endpoint ini;
// semua opsional (partial update), validasi angka sama persis batas CHECK constraint tabel.
export const updatePlatformFeatureSettingsSchema = z.object({
  is_enabled: z.boolean().optional(),
  primary_model_id: z.string().uuid().nullable().optional(),
  fallback_model_id: z.string().uuid().nullable().optional(),
  temperature: z.coerce.number().min(0).max(1.5).optional(),
  max_output_tokens: z.coerce.number().int().min(200).max(4000).optional(),
  per_user_daily_limit: z.coerce.number().int().min(0).optional(),
  global_daily_limit: z.coerce.number().int().min(0).optional(),
  monthly_budget_usd: z.coerce.number().min(0).optional(),
});
export type UpdatePlatformFeatureSettingsInput = z.infer<typeof updatePlatformFeatureSettingsSchema>;
