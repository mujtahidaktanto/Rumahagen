// lib/validation/awarding-paths.ts
// Skema Zod untuk Awarding Path + Awarding Path Version (M15 Fase 3,
// migration 0064). STEP11-B8 API-205-212 evidenced. `status` awarding_paths
// TIDAK ADA CHECK constraint di DB (0064) — divalidasi sebagai string bebas,
// bukan enum, mengikuti keputusan migration asli untuk tidak mengunci
// vocabulary yang tidak dievidence. `status` awarding_path_versions DIKUNCI
// ke ('draft','active','retired') — satu-satunya vocabulary M15 Fase 3 yang
// eksplisit disebutkan teksnya di STEP11-B8 (F11-B8-002).

import { z } from "zod";

export const createAwardingPathSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  status: z.string().min(1).max(50).optional(),
});
export type CreateAwardingPathInput = z.infer<typeof createAwardingPathSchema>;

export const updateAwardingPathSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
});
export type UpdateAwardingPathInput = z.infer<typeof updateAwardingPathSchema>;

export const awardingPathStatusSchema = z.object({
  status: z.string().min(1).max(50),
});
export type AwardingPathStatusInput = z.infer<typeof awardingPathStatusSchema>;

export const awardingPathVersionStatusEnum = z.enum(["draft", "active", "retired"]);

export const createAwardingPathVersionSchema = z.object({
  version_no: z.coerce.number().int().min(1),
  status: awardingPathVersionStatusEnum.optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
  definition_snapshot: z.record(z.string(), z.unknown()).optional(),
});
export type CreateAwardingPathVersionInput = z.infer<typeof createAwardingPathVersionSchema>;
