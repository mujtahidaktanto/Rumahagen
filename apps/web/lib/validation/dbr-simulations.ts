// lib/validation/dbr-simulations.ts
// Skema Zod untuk dbr_simulations (M07 Fase 1, migration 0052; diperluas
// 0089 untuk model Bank Master — Gate PRE-00-I). Input dari klien HANYA
// data mentah kalkulasi + `bank_id` pilihan user — monthly_installment/
// dbr_percent/eligibility_status/threshold_used dihitung SERVER-SIDE
// (lihat lib/dbr/calculate.ts + trigger enforce_dbr_simulation_bank_
// snapshot), TIDAK diterima dari body sama sekali (mencegah klien
// menyuntik hasil palsu untuk dokumen yang nantinya diekspor PDF ke
// prospek, atau memalsukan threshold historis).

import { z } from "zod";

export const createDbrSimulationSchema = z.object({
  bank_id: z.string().uuid(),
  listing_id: z.string().uuid().optional(),
  prospect_name: z.string().max(150).optional(),
  prospect_phone: z.string().max(20).optional(),
  net_income: z.coerce.number().positive(),
  existing_installments: z.coerce.number().min(0).optional(),
  property_price: z.coerce.number().positive(),
  down_payment: z.coerce.number().min(0),
  tenor_months: z.coerce.number().int().positive(),
  interest_rate_annual: z.coerce.number().positive().optional(),
});
export type CreateDbrSimulationInput = z.infer<typeof createDbrSimulationSchema>;
