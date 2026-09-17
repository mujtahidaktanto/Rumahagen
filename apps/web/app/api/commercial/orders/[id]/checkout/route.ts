// app/api/commercial/orders/[id]/checkout/route.ts
// API-181 POST /commercial/orders/{order_id}/checkout — Order owner. Mulai
// percobaan pembayaran baru: panggil Midtrans Snap API sungguhan, simpan
// payment_transactions (status dipaksa pending oleh trigger 0079). Logika
// sama persis dengan POST /commercial/payments (API-183) — lihat
// lib/payments/initiate-payment.ts.

import { withApiHandler } from "@/lib/api/handler";
import { initiatePaymentForOrder } from "@/lib/payments/initiate-payment";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  const result = await initiatePaymentForOrder(supabase, ctx.params.id!);
  return { data: result, status: 201 };
});
