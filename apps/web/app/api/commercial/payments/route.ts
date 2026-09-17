// app/api/commercial/payments/route.ts
// API-183 POST /commercial/payments — Authenticated/order owner. Bentuk
// top-level dari operasi yang sama dengan API-181 checkout (order_id di
// body, bukan path) — lihat lib/payments/initiate-payment.ts.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createPaymentSchema } from "@/lib/validation/commercial-payments";
import { initiatePaymentForOrder } from "@/lib/payments/initiate-payment";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createPaymentSchema);
  const supabase = await createClient();
  const result = await initiatePaymentForOrder(supabase, body.commercial_order_id);
  return { data: result, status: 201 };
});
