-- 0075_m14_commercial_fulfillments.sql
-- Fase 4 (lanjutan 0074): COMMERCIAL_FULFILLMENTS — realisasi "idempotent
-- fulfillment" pada causal chain M14 (STEP11-B7 §5/§10): setelah payment
-- terverifikasi, baris di sini mencatat entitlement/subscription APA yang
-- diberikan, sekali saja per payment (idempotency_key UNIQUE NOT NULL).
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- tanpa deviasi.
--
-- TIDAK ADA permission baru, TIDAK ADA RLS INSERT untuk siapa pun
-- (termasuk staf lewat REST biasa) — fulfillment adalah konsekuensi
-- OTOMATIS dari payment_state=settlement yang terverifikasi, bukan aksi
-- manual staf mengetik form. Pola sama seperti
-- `grant_learning_points_from_purchase()` (0025): realisasi sungguhan
-- fulfillment SEHARUSNYA lewat fungsi SQL SECURITY DEFINER baru di batch
-- REST API nanti (belum dibangun di migration ini — Migration ini HANYA
-- menyiapkan skema+RLS, bukan mengarang business logic fulfillment yang
-- tidak dievidence STEP11-B7 secara eksak: dokumen sumber sendiri mencatat
-- "generic entitlement grant/revoke/adjust lifecycle route is not
-- explicitly evidenced" sebagai CONTROLLED API GAP, F11-B7-004). SELECT
-- tetap dibuka untuk pemilik order + staf supaya bisa melihat riwayat
-- fulfillment miliknya begitu mekanismenya dibangun.

CREATE TABLE IF NOT EXISTS public.commercial_fulfillments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id   UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE RESTRICT,
  commercial_order_id      UUID NOT NULL REFERENCES public.commercial_orders(id) ON DELETE RESTRICT,
  fulfillment_key          VARCHAR(150) UNIQUE NOT NULL,
  fulfillment_status       TEXT NOT NULL,
  outcome_reference        TEXT,
  idempotency_key          VARCHAR(150) UNIQUE NOT NULL,
  fulfilled_at             TIMESTAMPTZ,
  reversed_at              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.commercial_fulfillments IS
  'Sumber: STEP10-D entity COMMERCIAL_FULFILLMENTS. `fulfillment_key`/`idempotency_key` keduanya UNIQUE NOT NULL (beda dari payment_transactions.idempotency_key yang nullable) — fulfillment TIDAK BOLEH terjadi tanpa kunci idempotensi eksplisit, mencegah pemberian entitlement ganda kalau webhook Midtrans terkirim ulang (Midtrans §12 "Duplicate webhook -> tidak menggandakan efek bisnis"). `outcome_reference` menaut ke entitlement/subscription yang dihasilkan (mis. ID baris commercial_entitlements) — TEXT longgar karena outcome bisa macam-macam jenis resource tergantung produk (addon vs subscription), pola sama seperti url_redirects.entity_id.';

ALTER TABLE public.commercial_fulfillments ENABLE ROW LEVEL SECURITY;

CREATE POLICY commercial_fulfillments_select ON public.commercial_fulfillments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commercial_orders co
      WHERE co.id = commercial_fulfillments.commercial_order_id
        AND public.has_permission('m14.commercial_purchase_access.own_purchase', co.user_id)
    )
    OR public.has_permission('m14.commercial_administration.manage_commercial_resources')
  );
