-- 0074_m14_payment_provider_results.sql
-- Fase 4 (lanjutan 0073): PAYMENT_PROVIDER_RESULTS — penyimpanan MENTAH
-- notification/webhook dari payment gateway (Midtrans §7 "HTTP
-- Notification/Webhook": order_id, transaction_id, transaction_status,
-- gross_amount, payment_type, currency, signature_key). Sumber kolom:
-- STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa deviasi.
--
-- TIDAK ADA RLS INSERT untuk siapa pun, TERMASUK staf — tabel ini HANYA
-- boleh ditulis lewat route webhook server-side yang memakai ADMIN CLIENT
-- (bypass RLS), dengan validasi shared-secret/signature di level route
-- (pola PERSIS sama seperti
-- /api/integrations/learning-session/providers/[provider]/events yang
-- sudah dibangun di batch M04 Session — endpoint publik tanpa auth
-- pengguna, dijaga X-Webhook-Secret, BUKAN RLS permission). Midtrans §10
-- Security Checklist eksplisit: "Validasi source/authenticity; jangan
-- mempercayai payload mentah tanpa verifikasi" — validasi signature HARUS
-- terjadi SEBELUM baris ini pernah tersimpan, bukan sesudahnya via RLS
-- (RLS tidak bisa memvalidasi signature kriptografis Midtrans).
--
-- `provider_key` TEXT bebas tanpa CHECK (bukan dikunci ke 'midtrans' saja)
-- — desain provider-agnostic mengikuti rekomendasi arsitektur Midtrans
-- §11 "Payment Provider Adapter": provider lain bisa ditambahkan nanti
-- tanpa migration skema baru, cukup baris dengan provider_key berbeda.
-- Untuk MVP, nilai yang dipakai adalah 'midtrans'.

CREATE TABLE IF NOT EXISTS public.payment_provider_results (
  id                               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id           UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  provider_key                     VARCHAR(100) NOT NULL,
  external_transaction_reference   VARCHAR(200),
  provider_status                  TEXT,
  normalized_status                TEXT,
  raw_payload                      JSONB,
  verification_evidence            JSONB,
  received_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at                     TIMESTAMPTZ,
  idempotency_key                  VARCHAR(150) UNIQUE
);

COMMENT ON TABLE public.payment_provider_results IS
  'Sumber: STEP10-D entity PAYMENT_PROVIDER_RESULTS. `raw_payload` menyimpan BODY notification Midtrans mentah apa adanya (order_id/transaction_id/transaction_status/gross_amount/payment_type/currency/signature_key — lihat Midtrans_API_Dokumentasi_Detail_2026.pdf §7), `verification_evidence` menyimpan hasil pengecekan signature+amount (bukan signature_key mentah itu sendiri — signature_key adalah bukti dari Midtrans, verification_evidence adalah HASIL verifikasi kita). `idempotency_key` = kombinasi order_id+transaction_status atau notification event ID Midtrans, mencegah notification duplikat (retry Midtrans) memproses efek bisnis dua kali — Midtrans §10/§12 eksplisit menandai "Duplicate webhook" dan "Out-of-order event" sebagai skenario wajib diuji.';

ALTER TABLE public.payment_provider_results ENABLE ROW LEVEL SECURITY;

-- SELECT: pemilik order (lewat join payment_transactions -> commercial_orders)
-- atau staf. TIDAK ADA INSERT/UPDATE/DELETE policy untuk siapa pun — lihat
-- catatan di atas file.
CREATE POLICY payment_provider_results_select ON public.payment_provider_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payment_transactions pt
      JOIN public.commercial_orders co ON co.id = pt.commercial_order_id
      WHERE pt.id = payment_provider_results.payment_transaction_id
        AND public.has_permission('m14.commercial_purchase_access.own_purchase', co.user_id)
    )
    OR public.has_permission('m14.commercial_administration.manage_commercial_resources')
  );
