// lib/validation/title-presentations.ts
// Skema Zod untuk Title Presentation (M15 Fase 3, migration 0068).
// STEP11-B8 API-234/235 "PUT /agents/me/awards/presentation" — PUT dibaca
// sebagai replace-set: klien kirim seluruh daftar title yang ingin
// ditampilkan, server upsert tiap baris berdasarkan UNIQUE(user_id,
// title_definition_id). `presentation_type` TEXT tanpa CHECK di DB (0068) —
// divalidasi sebagai string bebas, bukan enum.

import { z } from "zod";

export const titlePresentationItemSchema = z.object({
  title_definition_id: z.string().uuid(),
  presentation_type: z.string().min(1).max(100),
  active: z.boolean().optional(),
  display_order: z.coerce.number().int().optional(),
});

export const setTitlePresentationsSchema = z.object({
  presentations: z.array(titlePresentationItemSchema).min(1),
});
export type SetTitlePresentationsInput = z.infer<typeof setTitlePresentationsSchema>;
