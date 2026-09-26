// lib/validation/refresh-allowance.ts — skema Zod jatah Refresh Listing (migration 0159). Bonus per orang diberikan Superadmin; batas mengikuti fungsi grant_refresh_bonus (1-1000 per hari).
import { z } from "zod";

export const refreshBonusSchema = z.object({
  extra_daily: z.coerce.number().int().min(1).max(1000),
  /** Tanggal terakhir berlaku (WIB, YYYY-MM-DD); kosong = tanpa batas. */
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD.")
    .optional(),
  reason: z.string().trim().max(200).optional(),
});
export type RefreshBonusInput = z.infer<typeof refreshBonusSchema>;
