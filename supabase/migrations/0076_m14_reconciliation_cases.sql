-- 0076_m14_reconciliation_cases.sql
-- Fase 4 (penutup batch tabel, lanjutan 0071-0075): RECONCILIATION_CASES.
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv
-- — SATU deviasi terdokumentasi: `status` di sumber TEXT bebas TANPA
-- CHECK, TAPI STEP11-B7 §13 secara eksplisit MENGEVIDENCE lifecycle-nya:
-- "INCONSISTENCY DETECTED -> OPEN -> INVESTIGATING -> RESOLVED with
-- controlled REJECTED / ESCALATED outcomes where applicable" — di sini
-- dikunci ke ('open','investigating','resolved','rejected','escalated')
-- karena vocabulary itu SUDAH ADA di dokumen sumber (bukan dikarang),
-- beda dari kolom status lain di M14 yang dibiarkan bebas karena memang
-- tidak ada vocabulary eksak yang dievidence.
--
-- TIDAK ADA permission baru — sepenuhnya staf lewat
-- `m14.commercial_administration.manage_commercial_resources` (API-197-199
-- "Authorized reconciliation operator"), TIDAK ADA akses Agent sama sekali
-- (reconciliation adalah proses investigasi internal, bukan resource
-- milik user).

CREATE TABLE IF NOT EXISTS public.reconciliation_cases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number           VARCHAR(100) UNIQUE NOT NULL,
  payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  commercial_order_id   UUID REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  fulfillment_id        UUID REFERENCES public.commercial_fulfillments(id) ON DELETE SET NULL,
  entitlement_id        UUID REFERENCES public.commercial_entitlements(id) ON DELETE SET NULL,
  mismatch_category     VARCHAR(100) NOT NULL,
  evidence              JSONB NOT NULL DEFAULT '{}'::jsonb,
  status                TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','rejected','escalated')),
  resolution_metadata   JSONB,
  opened_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reconciliation_cases IS
  'Sumber: STEP10-D entity RECONCILIATION_CASES. `mismatch_category` TEXT bebas (mis. "amount_mismatch", "duplicate_webhook", "orphaned_payment", "signature_failure" — mengikuti skenario testing checklist Midtrans_API_Dokumentasi_Detail_2026.pdf §12) — kategori spesifik ditentukan lapisan aplikasi saat kasus dibuka, tidak dikunci di DB karena STEP10-D tidak mengevidence daftar kategori eksak.';

ALTER TABLE public.reconciliation_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY reconciliation_cases_manage ON public.reconciliation_cases
  FOR ALL USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'))
  WITH CHECK (public.has_permission('m14.commercial_administration.manage_commercial_resources'));
