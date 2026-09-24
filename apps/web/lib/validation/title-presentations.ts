// lib/validation/title-presentations.ts
// Skema Zod untuk Title Presentation (M15, migration 0068; aturan 1 utama + 3 tambahan: migration 0148).
// PUT /agents/me/awards/presentation menerima pilihan LENGKAP Agent: satu title utama (opsional) dan maksimal 3 title tambahan berurutan (urutan array =
// urutan tampil). Title harus punya award berstatus active/restored milik Agent (dicek di database).

import { z } from "zod";

export const setTitlePresentationsSchema = z.object({
  primary_title_id: z.string().uuid().nullable().optional(),
  additional_title_ids: z.array(z.string().uuid()).max(3).optional(),
});
export type SetTitlePresentationsInput = z.infer<typeof setTitlePresentationsSchema>;
