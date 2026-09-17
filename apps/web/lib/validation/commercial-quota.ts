// lib/validation/commercial-quota.ts
// Skema Zod untuk API-194/195 (allocate/consume quota, M14 0019+0079).

import { z } from "zod";

export const allocateQuotaSchema = z
  .object({
    beneficiary_user_id: z.string().uuid().optional(),
    beneficiary_organization_id: z.string().uuid().optional(),
    quantity: z.coerce.number().positive(),
  })
  .refine((v) => v.beneficiary_user_id || v.beneficiary_organization_id, {
    message: "Butuh beneficiary_user_id atau beneficiary_organization_id",
  });
export type AllocateQuotaInput = z.infer<typeof allocateQuotaSchema>;

export const consumeQuotaSchema = z.object({
  consuming_resource_type: z.string().min(1).max(100),
  consuming_resource_reference: z.string().min(1),
  quantity: z.coerce.number().positive(),
  idempotency_key: z.string().optional(),
});
export type ConsumeQuotaInput = z.infer<typeof consumeQuotaSchema>;
