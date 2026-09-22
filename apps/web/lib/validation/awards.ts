// lib/validation/awards.ts
// Skema Zod untuk Award Instance (M15, migration 0026). STEP11-B8 API-223-
// 229 evidenced untuk create/read/lifecycle/provenance.

import { z } from "zod";

export const createAwardSchema = z.object({
  user_id: z.string().uuid(),
  title_definition_id: z.string().uuid(),
  qualification_evaluation_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
  historical_snapshot: z.record(z.string(), z.unknown()).optional(),
});
export type CreateAwardInput = z.infer<typeof createAwardSchema>;

export const revokeAwardSchema = z.object({
  reason: z.string().optional(),
});
export type RevokeAwardInput = z.infer<typeof revokeAwardSchema>;

// POST /awards/{id}/appeals — API-230 (migration 0098, award_appeals ADD-NEW)
export const createAwardAppealSchema = z.object({
  reason: z.string().min(1),
});
export type CreateAwardAppealInput = z.infer<typeof createAwardAppealSchema>;

// POST /awards/{id}/appeals/{appeal_id}/decide — API-232
export const decideAwardAppealSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  decision_note: z.string().optional(),
});
export type DecideAwardAppealInput = z.infer<typeof decideAwardAppealSchema>;
