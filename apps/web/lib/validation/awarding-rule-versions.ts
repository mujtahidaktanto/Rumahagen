// lib/validation/awarding-rule-versions.ts
// Skema Zod untuk Awarding Rule Version (M15 Fase 3, migration 0065).
// STEP11-B8 API-213-215 evidenced (GET detail/POST create/PUT update — TIDAK
// ADA GET list, F11-B8-004 juga menegaskan tidak ada endpoint asosiasi
// awarding_path_rules, jadi rule version hanya bisa ditemukan lewat id yang
// sudah diketahui, mis. dari awarding_path_versions.definition_snapshot).
// `status` dikunci ke ('draft','active','retired') — sama seperti
// awarding_path_versions, satu-satunya vocabulary eksplisit di STEP11-B8
// (F11-B8-003).

import { z } from "zod";

export const awardingRuleVersionStatusEnum = z.enum(["draft", "active", "retired"]);

export const createAwardingRuleVersionSchema = z.object({
  rule_code: z.string().min(1).max(100),
  version_no: z.coerce.number().int().min(1),
  status: awardingRuleVersionStatusEnum.optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
  rule_definition: z.record(z.string(), z.unknown()),
});
export type CreateAwardingRuleVersionInput = z.infer<typeof createAwardingRuleVersionSchema>;

export const updateAwardingRuleVersionSchema = z.object({
  status: awardingRuleVersionStatusEnum.optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
  rule_definition: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateAwardingRuleVersionInput = z.infer<typeof updateAwardingRuleVersionSchema>;
