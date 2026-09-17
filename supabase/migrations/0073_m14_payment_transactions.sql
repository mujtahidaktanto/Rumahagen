-- 0073_m14_payment_transactions.sql
-- Fase 4 (lanjutan 0072): PAYMENT_TRANSACTIONS. Sumber kolom: STEP10-D_
-- ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv — SATU deviasi
-- terdokumentasi dari sumber (lihat di bawah).
--
-- KEPUTUSAN ENGINEERING BARU (bukan dari STEP10-D — diminta eksplisit oleh
-- user untuk mencocokkan Midtrans sebagai payment gateway MVP,
-- berdasarkan Midtrans_API_Dokumentasi_Detail_2026.pdf §6/§9):
-- `payment_state` di sumber TEXT bebas TANPA CHECK — di sini DIKUNCI ke
-- vocabulary status transaksi Midtrans yang didokumentasikan resmi
-- (Legacy Core API "Transaction Status" §6): pending, capture, settlement,
-- deny, cancel, expire, failure, refund, partial_refund, chargeback,
-- partial_chargeback, authorize. Ini BUKAN mengarang enum baru — persis
-- salinan vocabulary yang didokumentasikan Midtrans, dipilih karena
-- Midtrans adalah gateway MVP yang dikonfirmasi eksplisit oleh user.
-- Kalau provider lain ditambahkan nanti dan vocabulary-nya beda,
-- `payment_provider_results.provider_status`/`normalized_status` (0074,
-- TEXT bebas tanpa CHECK) adalah lapisan mapping-nya — `payment_state` di
-- sini tetap status KANONIK INTERNAL, provider manapun harus dipetakan ke
-- vocabulary ini (BI-SNAP numeric response Midtrans sendiri, misalnya,
-- sudah dipetakan balik ke istilah legacy yang sama persis di dokumentasi
-- resmi mereka — pola yang sama diterapkan di sini).
--
-- `verification_state` DIKUNCI ke ('unverified','verified','failed') —
-- merealisasikan "trusted verification" boundary STEP11-B7 §10/§13 secara
-- eksplisit: unverified = baru dibuat/notification belum diproses,
-- verified = signature+status sudah dicek server-side dan valid, failed =
-- signature/amount tidak cocok (Midtrans §10 Security Checklist:
-- signature, amount, replay protection).
--
-- TIDAK ADA permission baru — memakai `m14.commercial_purchase_access.
-- access`/`.own_purchase` + `m14.commercial_administration.
-- manage_commercial_resources` yang sama.

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id                                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commercial_order_id               UUID NOT NULL REFERENCES public.commercial_orders(id) ON DELETE RESTRICT,
  payment_reference                 VARCHAR(150) UNIQUE NOT NULL,
  amount                            NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  currency                          CHAR(3) NOT NULL DEFAULT 'IDR',
  payment_state                     TEXT NOT NULL CHECK (payment_state IN (
                                       'pending','capture','settlement','deny','cancel','expire',
                                       'failure','refund','partial_refund','chargeback',
                                       'partial_chargeback','authorize'
                                     )),
  verification_state                TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_state IN ('unverified','verified','failed')),
  provider_independent_reference    VARCHAR(150),
  idempotency_key                   VARCHAR(150) UNIQUE,
  paid_at                           TIMESTAMPTZ,
  verified_at                       TIMESTAMPTZ,
  created_at                        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payment_transactions IS
  'Sumber: STEP10-D entity PAYMENT_TRANSACTIONS. `payment_reference` = order_id yang dikirim ke Midtrans Snap (POST /snap/v1/transactions {"transaction_details":{"order_id": payment_reference, "gross_amount": amount}}) — HARUS unik per percobaan pembayaran (bukan per commercial_orders, satu order boleh punya beberapa payment_transactions kalau percobaan pertama expire/gagal dan diulang, mengikuti prinsip idempotency Midtrans §10 "gunakan order/reference/external-id secara konsisten agar retry tidak membuat transaksi ganda"). `provider_independent_reference` = transaction_id Midtrans (identifier internal Midtrans, terpisah dari order_id kita). `idempotency_key` untuk mencegah request create-payment ganda dari klien sendiri (pola sama seperti api_idempotency_keys/0010, tapi di level bisnis pembayaran).';

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: pemilik order (lewat join commercial_orders) atau staf.
CREATE POLICY payment_transactions_select ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commercial_orders co
      WHERE co.id = payment_transactions.commercial_order_id
        AND public.has_permission('m14.commercial_purchase_access.own_purchase', co.user_id)
    )
    OR public.has_permission('m14.commercial_administration.manage_commercial_resources')
  );

-- INSERT: pemilik order membuat percobaan pembayaran baru untuk order
-- miliknya sendiri (API-183 "Authenticated/order owner").
CREATE POLICY payment_transactions_insert ON public.payment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.commercial_orders co
      WHERE co.id = payment_transactions.commercial_order_id
        AND public.has_permission('m14.commercial_purchase_access.access', co.user_id)
    )
  );

-- UPDATE: HANYA staf/sistem (bukan pemilik) — payment_state/verification_state
-- adalah hasil verifikasi webhook Midtrans, BUKAN field yang aman diubah
-- klien sendiri (lihat catatan keamanan lengkap di commercial_orders/0072).
CREATE POLICY payment_transactions_update_staff ON public.payment_transactions
  FOR UPDATE USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'));
