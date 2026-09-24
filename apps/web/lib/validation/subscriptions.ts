// lib/validation/subscriptions.ts
// Skema Zod untuk GET /agents/me/subscriptions (M14, tabel subscriptions 0071).

import { z } from "zod";

// subscriptions.status adalah TEXT bebas tanpa CHECK (0071), jadi filter menerima string apa adanya.
export const listMySubscriptionsQuerySchema = z.object({
  status: z.string().trim().min(1).max(50).optional(),
  active_only: z.enum(["true", "false"]).optional(),
});
export type ListMySubscriptionsQuery = z.infer<typeof listMySubscriptionsQuerySchema>;
