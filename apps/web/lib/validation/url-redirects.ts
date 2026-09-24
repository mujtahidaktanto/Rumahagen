// lib/validation/url-redirects.ts
// Skema Zod untuk url_redirects (M11 Fase 1, migration 0051).

import { z } from "zod";

// Jalur internal saja: diawali "/", bukan "//" (URL protokol-relatif), tanpa spasi atau backslash. Mengikuti CHECK di migration 0130.
const internalPath = z
  .string()
  .min(1)
  .max(300)
  .regex(/^\/([^/\s\\][^\s\\]*)?$/, 'Harus jalur internal yang diawali "/" tanpa spasi (URL luar tidak diizinkan).');

export const createUrlRedirectSchema = z.object({
  old_path: internalPath,
  new_path: internalPath,
  redirect_type: z.union([z.literal(301), z.literal(302)]).optional(),
  reason: z.enum(["slug_changed", "listing_deleted", "listing_merged", "lainnya"]).optional(),
  entity_type: z.string().max(50).optional(),
  entity_id: z.string().uuid().optional(),
});
export type CreateUrlRedirectInput = z.infer<typeof createUrlRedirectSchema>;
