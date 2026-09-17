// lib/validation/commercial-payments.ts
// Skema Zod untuk API-183 POST /commercial/payments (top-level; API-181
// POST /commercial/orders/{id}/checkout mengambil order_id dari path,
// tidak butuh body ini).

import { z } from "zod";

export const createPaymentSchema = z.object({
  commercial_order_id: z.string().uuid(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
