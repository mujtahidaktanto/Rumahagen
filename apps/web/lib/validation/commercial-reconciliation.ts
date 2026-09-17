// lib/validation/commercial-reconciliation.ts
// Skema Zod untuk API-190 (reconcile entitlement) dan API-199 (resolve
// reconciliation case), M14 migration 0076.

import { z } from "zod";

export const reconcileEntitlementSchema = z.object({
  entitlement_id: z.string().uuid(),
  payment_transaction_id: z.string().uuid().optional(),
  commercial_order_id: z.string().uuid().optional(),
  fulfillment_id: z.string().uuid().optional(),
  mismatch_category: z.string().min(1).max(100),
  evidence: z.record(z.string(), z.unknown()).optional(),
});
export type ReconcileEntitlementInput = z.infer<typeof reconcileEntitlementSchema>;

export const resolveReconciliationCaseSchema = z.object({
  status: z.enum(["investigating", "resolved", "rejected", "escalated"]),
  resolution_metadata: z.record(z.string(), z.unknown()).optional(),
});
export type ResolveReconciliationCaseInput = z.infer<typeof resolveReconciliationCaseSchema>;
