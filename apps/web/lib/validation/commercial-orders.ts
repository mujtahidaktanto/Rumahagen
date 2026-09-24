// lib/validation/commercial-orders.ts
// Skema Zod untuk Commercial Order (M14 Fase 4, migration 0072). SCOPE MVP:
// hanya addon-sourced order (subscription purchase belum dibangun). HARGA TIDAK
// DITERIMA dari klien: amount/currency/promotion/snapshot dihitung server dari
// addons.price (trigger DB trg_price_commercial_order, migration 0131). Klien hanya
// menyebut addon, promosi (opsional, harus yang terkait addon), dan organisasi.

import { z } from "zod";

export const createCommercialOrderSchema = z.object({
  addon_id: z.string().uuid(),
  promotion_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
});
export type CreateCommercialOrderInput = z.infer<typeof createCommercialOrderSchema>;
