// lib/payments/midtrans.ts
// Payment Provider Adapter untuk Midtrans (M14 Commercial, payment gateway
// MVP) — realisasi rekomendasi arsitektur Midtrans_API_Dokumentasi_Detail_
// 2026.pdf §11 "Payment Provider Adapter": business logic (route handler)
// TIDAK PERNAH memanggil endpoint Midtrans langsung, selalu lewat modul ini.
//
// KEPUTUSAN KEAMANAN: base URL SELALU *.sandbox.midtrans.com, TIDAK PERNAH
// api.midtrans.com/app.midtrans.com (Production) — MVP ini sengaja dikunci
// ke Sandbox saja. Pindah ke Production adalah keputusan bisnis terpisah di
// masa depan (ganti base URL + rotasi Server/Client Key), bukan sesuatu yang
// otomatis lewat env flag di sini, supaya tidak ada risiko transaksi nyata
// tidak sengaja saat development/testing.
//
// Server Key JANGAN PERNAH diekspos ke client — hanya dipakai di sini
// (server-side route handler) untuk Basic Auth ke Snap API dan untuk
// menghitung signature webhook.

import crypto from "node:crypto";

const SNAP_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";

export const MIDTRANS_PAYMENT_STATES = [
  "pending", "capture", "settlement", "deny", "cancel", "expire",
  "failure", "refund", "partial_refund", "chargeback", "partial_chargeback", "authorize",
] as const;

export type MidtransPaymentState = (typeof MIDTRANS_PAYMENT_STATES)[number];

export function isValidMidtransPaymentState(value: string): value is MidtransPaymentState {
  return (MIDTRANS_PAYMENT_STATES as readonly string[]).includes(value);
}

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di server.");
  }
  return key;
}

interface CreateSnapTransactionInput {
  orderId: string;
  grossAmount: number;
  customerDetails?: {
    first_name?: string;
    email?: string;
  };
}

interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

// Midtrans_API_Dokumentasi_Detail_2026.pdf §4: POST /snap/v1/transactions,
// Basic Auth dengan Server Key sebagai username, password kosong.
export async function createSnapTransaction(
  input: CreateSnapTransactionInput,
): Promise<SnapTransactionResult> {
  const auth = Buffer.from(`${getServerKey()}:`).toString("base64");

  const res = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      ...(input.customerDetails ? { customer_details: input.customerDetails } : {}),
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.token) {
    throw new Error(
      `Midtrans Snap API gagal (HTTP ${res.status}): ${body ? JSON.stringify(body) : "respons tidak valid"}`,
    );
  }

  return { token: body.token, redirect_url: body.redirect_url };
}

interface WebhookSignatureInput {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}

// Midtrans §7/§10: signature_key = SHA512(order_id + status_code +
// gross_amount + ServerKey). Timing-safe compare mencegah timing attack pada
// perbandingan signature.
export function verifyMidtransWebhookSignature(input: WebhookSignatureInput): boolean {
  const expected = crypto
    .createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${getServerKey()}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(input.signatureKey, "hex");

  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
