// lib/validation/commercial-webhook.ts
// Skema Zod untuk payload notification/webhook Midtrans (Midtrans_API_
// Dokumentasi_Detail_2026.pdf §7): order_id/transaction_id/
// transaction_status/gross_amount/payment_type/currency/signature_key.
// Field DIBACA APA ADANYA sebagai string (gross_amount dikirim Midtrans
// sebagai string mis. "10000.00", bukan number) — signature dihitung dari
// representasi string mentah ini, jangan di-coerce ke number sebelum
// verifikasi.

import { z } from "zod";

export const midtransNotificationSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
  transaction_id: z.string().optional(),
  transaction_status: z.string().min(1),
  payment_type: z.string().optional(),
  currency: z.string().optional(),
  fraud_status: z.string().optional(),
});
export type MidtransNotificationInput = z.infer<typeof midtransNotificationSchema>;
