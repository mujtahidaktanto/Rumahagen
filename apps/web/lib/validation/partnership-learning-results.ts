// lib/validation/partnership-learning-results.ts
// Skema Zod untuk Partnership Learning Result — ADD-NEW, tidak ada di
// STEP11-B4 (bukan bagian dari M04 v1.2 QIR package yang disinkronkan B4;
// sumbernya Gate PRE-00-F §51, lihat rasional lengkap di
// supabase/migrations/0024_m04_partnership_learning_result.sql). Field
// persis mengikuti kolom `public.partnership_learning_results`.

import { z } from "zod";

export const createPartnershipLearningResultSchema = z.object({
  partner_user_id: z.string().uuid().optional(), // default ke pemanggil (Developer Partner)
  session_id: z.string().uuid().optional(),
  result_type: z.string().min(1).max(100),
  result_summary: z.string().optional(),
  result_payload: z.record(z.string(), z.unknown()).optional(),
  provenance_source: z.string().min(1).max(150),
  provenance_reference: z.string().min(1),
});
export type CreatePartnershipLearningResultInput = z.infer<typeof createPartnershipLearningResultSchema>;

// PUT /partnership-learning-results/{id} — update biasa ATAU ubah
// validation_status. Trigger trg_partnership_result_validation_superadmin_only
// (0024) menegakkan HANYA Superadmin yang boleh mengubah validation_status —
// tidak diduplikasi di sini (R-02).
export const updatePartnershipLearningResultSchema = z.object({
  result_summary: z.string().optional(),
  result_payload: z.record(z.string(), z.unknown()).optional(),
  validation_status: z.enum(["pending", "validated", "rejected"]).optional(),
});
export type UpdatePartnershipLearningResultInput = z.infer<typeof updatePartnershipLearningResultSchema>;
