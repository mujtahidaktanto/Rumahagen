// lib/validation/dbr-simulations.ts
// Skema Zod untuk dbr_simulations (M07 Fase 1, migration 0052). Input dari
// klien HANYA data mentah kalkulasi — monthly_installment/dbr_percent/
// eligibility_status dihitung SERVER-SIDE (lihat lib/dbr/calculate.ts),
// TIDAK diterima dari body sama sekali (mencegah klien menyuntik hasil
// palsu untuk dokumen yang nantinya diekspor PDF ke prospek).

import { z } from "zod";

export const createDbrSimulationSchema = z.object({
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
