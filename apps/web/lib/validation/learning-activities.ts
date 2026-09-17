// lib/validation/learning-activities.ts
// Skema Zod untuk LEARNING_ACTIVITIES + LEARNING_ACTIVITY_COMPLETIONS
// (M04 Learning Catalog, migration 0058). STEP11-B4 API-064-068/076-078.

import { z } from "zod";

export const createLearningActivitySchema = z.object({
  learning_path_version_id: z.string().uuid().optional(),
  code: z.string().min(1).max(100),
  activity_type: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sequence_no: z.coerce.number().int().optional(),
  completion_required: z.boolean().optional(),
  reward_lp: z.coerce.number().min(0).optional(),
  status: z.string().optional(),
});
export type CreateLearningActivityInput = z.infer<typeof createLearningActivitySchema>;

export const updateLearningActivitySchema = createLearningActivitySchema.partial().omit({ learning_path_version_id: true });
export type UpdateLearningActivityInput = z.infer<typeof updateLearningActivitySchema>;

// POST /learning/activities/{id}/complete — completion CLAIM milik learner
// sendiri (Q-M04-LC-02A), bukan outcome otoritatif. user_id TIDAK ada di
// body (selalu ctx.userId, tidak boleh klaim atas nama orang lain).
export const completeActivitySchema = z.object({
  completion_status: z.string().min(1),
  outcome: z.string().optional(),
  evidence_reference: z.string().optional(),
});
export type CompleteActivityInput = z.infer<typeof completeActivitySchema>;
