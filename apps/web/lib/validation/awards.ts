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
