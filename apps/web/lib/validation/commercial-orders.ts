// lib/validation/commercial-orders.ts
// Skema Zod untuk Commercial Order (M14 Fase 4, migration 0072). SCOPE MVP:
// hanya addon-sourced order (lihat catatan scope di migration 0079/
// fulfill_commercial_order) — subscription purchase belum dievidence
// katalog harganya. `amount`/`currency` diterima dari klien (tidak ada
// tabel harga otoritatif untuk addons — configuration JSONB bebas, F11-B7-
// 002 controlled gap untuk katalog/harga), tapi `status`/`confirmed_at`
// SELALU dipaksa 'pending'/NULL oleh trigger DB (0079) apa pun yang dikirim
// di sini — Zod hanya validasi bentuk, bukan satu-satunya penjaga.

import { z } from "zod";

export const createCommercialOrderSchema = z.object({
  addon_id: z.string().uuid(),
  promotion_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  amount: z.coerce.number().min(0),
  currency: z.string().length(3).optional(),
});
export type CreateCommercialOrderInput = z.infer<typeof createCommercialOrderSchema>;
