// lib/validation/learning-paths.ts
// Skema Zod untuk LEARNING_PATHS + LEARNING_PATH_VERSIONS (M04 Learning
// Catalog, migration 0057). STEP11-B4 API-061/062. Q-M04-C-05A "LearningPath
// Configure" CONTROLLED API GAP di STEP11-B4 (tidak ada route admin eksak
// dievidence) — route create/update di sini ADD-NEW, RLS-nya sudah lengkap
// sejak 0057 (m04.learning_path.manage).

import { z } from "zod";

export const createLearningPathSchema = z.object({
  course_id: z.string().uuid().optional(),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
export type CreateLearningPathInput = z.infer<typeof createLearningPathSchema>;

export const updateLearningPathSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
export type UpdateLearningPathInput = z.infer<typeof updateLearningPathSchema>;

export const createLearningPathVersionSchema = z.object({
  version_no: z.coerce.number().int().min(1),
  status: z.enum(["draft", "published", "archived"]).optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
  definition_snapshot: z.record(z.string(), z.unknown()).optional(),
});
export type CreateLearningPathVersionInput = z.infer<typeof createLearningPathVersionSchema>;
