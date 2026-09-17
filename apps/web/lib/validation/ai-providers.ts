// lib/validation/ai-providers.ts
// Skema Zod untuk M13 Provider Catalogue + BYOK. Field persis mengikuti
// kolom `public.ai_providers`/`public.agent_ai_connections` di
// supabase/migrations/0015_m13_provider_catalogue.sql /
// 0016_m13_agent_ai_connections.sql.

import { z } from "zod";

export const createAiProviderSchema = z.object({
  code: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  logo_url: z.string().max(500).optional(),
  billing_type: z.enum(["free_tier_ongoing", "paid_only", "trial_then_paid"]).optional(),
  setup_instructions_url: z.string().min(1).max(500),
  usage_terms_note: z.string().optional(),
  requires_expiry_warning: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
export type CreateAiProviderInput = z.infer<typeof createAiProviderSchema>;

export const updateAiProviderSchema = createAiProviderSchema.omit({ code: true }).partial();
export type UpdateAiProviderInput = z.infer<typeof updateAiProviderSchema>;

// POST /ai-connections — `api_key` mentah diterima di sini, dienkripsi
// (lib/crypto/byok.ts) SEBELUM insert. TIDAK PERNAH disimpan/dilogging mentah.
export const createAiConnectionSchema = z.object({
  provider_id: z.string().uuid(),
  api_key: z.string().min(1),
});
export type CreateAiConnectionInput = z.infer<typeof createAiConnectionSchema>;

// PUT /ai-connections/{id} — rotate key (opsional) dan/atau enable/disable
// biasa oleh pemilik sendiri. Transisi ke 'disabled'/'revoked' dengan
// disabled_by_admin=true HANYA lewat admin_force_provider_connection() RPC
// (route terpisah), bukan lewat PUT ini — trigger
// trg_agent_ai_connection_transition (0016) yang menegakkan itu, tidak
// diduplikasi di sini (R-02).
export const updateAiConnectionSchema = z.object({
  api_key: z.string().min(1).optional(),
  status: z.enum(["active", "disconnected", "invalid"]).optional(),
  // Hanya berlaku untuk actor dengan permission
  // m13.administrative_force_revoke_disable.execute (RLS
  // agent_ai_connections_admin_force, 0016) membalikkan FORCE_DISABLE
  // miliknya sendiri (trigger 0016 mengizinkan transisi true->false untuk
  // aktor itu) — pemilik biasa yang mengirim field ini akan ditolak RLS/trigger.
  disabled_by_admin: z.literal(false).optional(),
});
export type UpdateAiConnectionInput = z.infer<typeof updateAiConnectionSchema>;

// POST /admin/ai-connections/{id}/force — bungkus admin_force_provider_connection()
export const forceConnectionActionSchema = z.object({
  action: z.enum(["force_revoke", "force_disconnect", "force_disable"]),
  reason: z.string().optional(),
});
export type ForceConnectionActionInput = z.infer<typeof forceConnectionActionSchema>;
