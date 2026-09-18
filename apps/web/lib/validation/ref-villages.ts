// lib/validation/ref-villages.ts
// Skema Zod untuk ref_villages (M03 Fase 1, migration 0048).

import { z } from "zod";

export const createRefVillageSchema = z.object({
  district_id: z.string().uuid(),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  postal_code: z.string().max(6).optional(),
});
export type CreateRefVillageInput = z.infer<typeof createRefVillageSchema>;

export const updateRefVillageSchema = createRefVillageSchema.omit({ district_id: true }).partial();
export type UpdateRefVillageInput = z.infer<typeof updateRefVillageSchema>;
