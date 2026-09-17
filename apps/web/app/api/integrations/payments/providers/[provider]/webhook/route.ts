// app/api/integrations/payments/providers/[provider]/webhook/route.ts
// API-185 POST /integrations/payments/providers/{provider}/webhook —
// Provider adapter (Midtrans notification, §7). Endpoint PUBLIK tanpa sesi
// user (server-to-server dari Midtrans) — otorisasi lewat VERIFIKASI
// SIGNATURE KRIPTOGRAFIS (bukan has_permission()/RLS, keduanya butuh
// auth.uid() yang tidak ada di sini). Alur wajib Midtrans §10 Security
// Checklist: signature -> amount -> replay protection, SEBELUM payload
// mentah dipercaya sama sekali.
//
// Memakai ADMIN CLIENT (bypass RLS) untuk payment_provider_results (0074,
// TIDAK ADA INSERT policy untuk siapa pun — hanya jalur ini yang boleh
// menulis) dan payment_transactions (UPDATE staff-only di RLS, 0073) —
// pola PERSIS sama seperti webhook provider learning-session (M04) yang
// sudah dibangun, tapi di sini verifikasi ADALAH signature Midtrans
// sungguhan (SHA512 order_id+status_code+gross_amount+ServerKey), bukan
// shared-secret generik.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { midtransNotificationSchema } from "@/lib/validation/commercial-webhook";
import { ApiError } from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMidtransWebhookSignature, isValidMidtransPaymentState } from "@/lib/payments/midtrans";

export const POST = withApiHandler({}, async (ctx) => {
  if (ctx.params.provider !== "midtrans") {
    throw new ApiError("NOT_FOUND", `Provider '${ctx.params.provider}' tidak didukung.`);
  }

  const body = await validateJsonBody(ctx.request, midtransNotificationSchema);

  const signatureValid = verifyMidtransWebhookSignature({
    orderId: body.order_id,
    statusCode: body.status_code,
    grossAmount: body.gross_amount,
    signatureKey: body.signature_key,
  });

  if (!signatureValid) {
    throw new ApiError("UNAUTHENTICATED", "Signature Midtrans tidak valid.");
  }

  const admin = createAdminClient();

  const { data: payment, error: paymentLookupError } = await admin
    .from("payment_transactions")
    .select("*")
    .eq("payment_reference", body.order_id)
    .maybeSingle();

  if (paymentLookupError) {
    throw paymentLookupError;
  }
  if (!payment) {
    throw new ApiError("NOT_FOUND", "payment_transactions dengan payment_reference ini tidak ditemukan.");
  }

  // Sertakan gross_amount di idempotency key (bukan cuma order_id+status) —
  // ditemukan lewat testing: notification dengan amount SALAH (mismatch,
  // tidak diproses sebagai pembayaran sah) tidak boleh "mengunci" key
  // sehingga notification BERIKUTNYA dengan amount BENAR untuk order+status
  // yang sama malah ditolak sebagai duplicate. Retry Midtrans sungguhan
  // (order_id+status+amount identik berulang) tetap terdeteksi sebagai
  // duplicate seperti seharusnya (Midtrans §12).
  const idempotencyKey = `${body.order_id}:${body.transaction_status}:${body.gross_amount}`;

  const { error: insertResultError } = await admin.from("payment_provider_results").insert({
    payment_transaction_id: payment.id,
    provider_key: "midtrans",
    external_transaction_reference: body.transaction_id ?? null,
    provider_status: body.transaction_status,
    normalized_status: body.transaction_status,
    raw_payload: body,
    verification_evidence: { verified: true, checked_at: new Date().toISOString() },
    idempotency_key: idempotencyKey,
  });

  if (insertResultError) {
    if (insertResultError.code === "23505") {
      // Duplicate webhook (Midtrans §12) — sudah pernah diproses, tidak
      // menggandakan efek bisnis. Ack tanpa memproses ulang.
      return { data: { status: "duplicate_ignored" } };
    }
    throw insertResultError;
  }

  // Amount mismatch (Midtrans §10 Security Checklist) — jangan proses
  // sebagai pembayaran sah, buka reconciliation case untuk investigasi staf.
  const expectedAmount = Number(payment.amount).toFixed(2);
  const receivedAmount = Number(body.gross_amount).toFixed(2);
  if (expectedAmount !== receivedAmount) {
    await admin.from("reconciliation_cases").insert({
      case_number: `REC-${Date.now()}`,
      payment_transaction_id: payment.id,
      commercial_order_id: payment.commercial_order_id,
      mismatch_category: "amount_mismatch",
      evidence: { expected: expectedAmount, received: receivedAmount, raw_payload: body },
    });
    return { data: { status: "amount_mismatch_flagged_for_reconciliation" } };
  }

  if (!isValidMidtransPaymentState(body.transaction_status)) {
    await admin.from("reconciliation_cases").insert({
      case_number: `REC-${Date.now()}`,
      payment_transaction_id: payment.id,
      commercial_order_id: payment.commercial_order_id,
      mismatch_category: "unexpected_status",
      evidence: { transaction_status: body.transaction_status, raw_payload: body },
    });
    return { data: { status: "unexpected_status_flagged_for_reconciliation" } };
  }

  const isSettled = body.transaction_status === "settlement" || body.transaction_status === "capture";

  const { error: updatePaymentError } = await admin
    .from("payment_transactions")
    .update({
      payment_state: body.transaction_status,
      verification_state: "verified",
      provider_independent_reference: body.transaction_id ?? null,
      paid_at: isSettled ? new Date().toISOString() : payment.paid_at,
      verified_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updatePaymentError) {
    throw updatePaymentError;
  }

  await admin
    .from("payment_provider_results")
    .update({ processed_at: new Date().toISOString() })
    .eq("idempotency_key", idempotencyKey);

  if (isSettled) {
    const { error: fulfillError } = await admin.rpc("fulfill_commercial_order", {
      p_payment_transaction_id: payment.id,
    });
    if (fulfillError) {
      throw fulfillError;
    }
  }

  return { data: { status: "ok" } };
});
