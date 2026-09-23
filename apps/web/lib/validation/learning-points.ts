// lib/validation/learning-points.ts
// Skema Zod untuk M04 Learning Points/Economy (STEP11-B4 API-069/070/073).
// Field persis mengikuti kolom `public.learning_point_transactions` di
// supabase/migrations/0023_m04_learning_points.sql.

import { z } from "zod";

// POST /admin/learning-point-adjustments (API-073) — bungkus
// adjust_learning_points() dari 0046.
export const learningPointAdjustmentSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.coerce.number().refine((v) => v !== 0, "amount tidak boleh nol"),
  reason: z.string().optional(),
});
export type LearningPointAdjustmentInput = z.infer<typeof learningPointAdjustmentSchema>;

// GET/PUT /admin/learning/configuration (API-074/075) -- key-value generik
// (public.learning_economy_configs, migration 0109), tidak ada field
// bernama yang dievidensi Core -- lihat header migration 0109 untuk alasan
// lengkap.
export const learningEconomyConfigUpsertSchema = z.object({
  config_key: z.string().min(1).max(100),
  config_value: z.string().max(255).nullable(),
});
export type LearningEconomyConfigUpsertInput = z.infer<typeof learningEconomyConfigUpsertSchema>;
