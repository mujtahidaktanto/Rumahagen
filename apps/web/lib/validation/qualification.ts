// lib/validation/qualification.ts
// Skema Zod untuk Qualification Evaluation + Evidence (M15, migration 0026-
// 0027). STEP11-B8 API-216-222 evidenced untuk create/read manual;
// endpoint evaluate-from-evidence dan capture-from-session ADD-NEW yang
// membungkus fungsi SQL evaluate_qualification()/
// capture_qualification_evidence_from_session() (0027) — fungsi itu sudah
// fisik sejak Tahap 6 tapi belum pernah punya route HTTP.

import { z } from "zod";

export const qualificationResultEnum = z.enum([
  "qualified",
  "not_qualified",
  "pending",
  "failed",
  "revoked",
]);

export const createQualificationEvaluationSchema = z.object({
  user_id: z.string().uuid(),
  result: qualificationResultEnum,
  evaluator_type: z.string().min(1).max(100),
  evaluator_reference: z.string().optional(),
  provenance: z.record(z.string(), z.unknown()).optional(),
});
export type CreateQualificationEvaluationInput = z.infer<typeof createQualificationEvaluationSchema>;

export const createQualificationEvidenceSchema = z.object({
  user_id: z.string().uuid(),
  qualification_evaluation_id: z.string().uuid().optional(),
  evidence_type: z.string().min(1).max(100),
  source_type: z.string().min(1).max(100),
  source_reference: z.string().min(1),
  evidence_payload: z.record(z.string(), z.unknown()).optional(),
});
export type CreateQualificationEvidenceInput = z.infer<typeof createQualificationEvidenceSchema>;

export const evaluateFromEvidenceSchema = z.object({
  evaluator_reference: z.string().optional(),
});
export type EvaluateFromEvidenceInput = z.infer<typeof evaluateFromEvidenceSchema>;

export const captureEvidenceFromCompletionSchema = z.object({
  completion_outcome_id: z.string().uuid(),
});
export type CaptureEvidenceFromCompletionInput = z.infer<typeof captureEvidenceFromCompletionSchema>;
