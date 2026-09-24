// lib/validation/commercial-orders.ts
// Skema Zod untuk Commercial Order (M14 Fase 4, migration 0072). HARGA TIDAK DITERIMA dari klien: amount/currency/promotion/snapshot dihitung
// server oleh trigger DB trg_price_commercial_order (addons.price, migration 0131; subscription_plans.price_*, migration 0142).
// Klien menyebut TEPAT SATU dari: addon_id (beli add-on) atau subscription_plan_id (beli paket langganan Pro). promotion_id opsional: harus promosi yang terhubung ke
// addon/paket itu dan berlaku (0134/0143). organization_id opsional: add-on slot listing masuk ke organisasi; langganan menjadi milik organisasi (hanya leader aktif).

import { z } from "zod";

export const createCommercialOrderSchema = z
  .object({
    addon_id: z.string().uuid().optional(),
    subscription_plan_id: z.string().uuid().optional(),
    promotion_id: z.string().uuid().optional(),
    organization_id: z.string().uuid().optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.addon_id ? 1 : 0) + (v.subscription_plan_id ? 1 : 0) !== 1) {
      ctx.addIssue({ code: "custom", path: ["addon_id"], message: "Kirim tepat satu dari addon_id atau subscription_plan_id." });
    }
  });
export type CreateCommercialOrderInput = z.infer<typeof createCommercialOrderSchema>;
