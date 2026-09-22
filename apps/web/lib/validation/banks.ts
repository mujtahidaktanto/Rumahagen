// lib/validation/banks.ts
// Skema Zod untuk Bank Master (M07, tabel `banks` migration 0089). RLS
// banks_select/banks_manage sudah ada sejak 0089 (permission
// m07.bank_master.view/.configure, seed 0009) -- tidak ada permission baru
// di sini, murni skema untuk route CRUD yang sebelumnya belum ada.

import { z } from "zod";

export const createBankSchema = z.object({
  name: z.string().min(1).max(150),
  dbr_threshold_percent: z.coerce.number().min(0).max(100).optional(),
  default_interest_rate: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
export type CreateBankInput = z.infer<typeof createBankSchema>;

export const updateBankSchema = createBankSchema.partial();
export type UpdateBankInput = z.infer<typeof updateBankSchema>;
