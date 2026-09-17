// app/api/admin/commercial/entitlements/reconcile/route.ts
// API-190 POST /admin/commercial/entitlements/reconcile — Authorized
// commercial/reconciliation operator. F11-B7-004: "generic entitlement
// grant/revoke/adjust lifecycle route is not explicitly evidenced" —
// "reconcile" di sini TIDAK memutasi lifecycle_status entitlement secara
// langsung (itu controlled gap), melainkan MEMBUKA reconciliation_cases
// (0076, sudah ada RLS-nya) untuk investigasi manual staf — realisasi
// literal endpoint yang evidenced tanpa mengarang mutasi entitlement yang
// tidak evidenced.

import crypto from "node:crypto";
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { reconcileEntitlementSchema } from "@/lib/validation/commercial-reconciliation";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, reconcileEntitlementSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reconciliation_cases")
    .insert({
      case_number: `REC-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      entitlement_id: body.entitlement_id,
      payment_transaction_id: body.payment_transaction_id ?? null,
      commercial_order_id: body.commercial_order_id ?? null,
      fulfillment_id: body.fulfillment_id ?? null,
      mismatch_category: body.mismatch_category,
      evidence: body.evidence ?? {},
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
