// lib/payments/initiate-payment.ts
// Logika bersama untuk API-181 POST /commercial/orders/{id}/checkout DAN
// API-183 POST /commercial/payments (dua endpoint evidenced yang melakukan
// operasi sama: mulai percobaan pembayaran baru untuk satu order — beda
// hanya cara order_id diberikan, path vs body). Satu implementasi supaya
// tidak ada divergensi logika bisnis antara keduanya.

import crypto from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { createSnapTransaction } from "@/lib/payments/midtrans";
import type { createClient } from "@/lib/supabase/server";

export async function initiatePaymentForOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
) {
  const { data: order, error: orderError } = await supabase
    .from("commercial_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw orderError;
  }
  if (!order) {
    throw new ApiError("NOT_FOUND", "Order tidak ditemukan atau Anda tidak punya akses.");
  }
  if (order.status !== "pending") {
    throw new ApiError("CONFLICT", `Order berstatus '${order.status}', hanya order pending yang bisa dibayar.`);
  }

  const paymentReference = `${order.order_number}-${crypto.randomBytes(4).toString("hex")}`;

  const snap = await createSnapTransaction({
    orderId: paymentReference,
    grossAmount: Number(order.amount),
  });

  const { data: payment, error: paymentError } = await supabase
    .from("payment_transactions")
    .insert({
      commercial_order_id: order.id,
      payment_reference: paymentReference,
      amount: order.amount,
      currency: order.currency,
      payment_state: "pending",
    })
    .select()
    .single();

  if (paymentError) {
    throw paymentError;
  }

  return {
    payment_transaction: payment,
    snap_token: snap.token,
    redirect_url: snap.redirect_url,
  };
}
