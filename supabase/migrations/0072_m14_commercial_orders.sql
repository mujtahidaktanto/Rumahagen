-- 0072_m14_commercial_orders.sql
-- Fase 4 (lanjutan 0071): COMMERCIAL_ORDERS — titik awal causal chain M14
-- (STEP11-B7 §5): "Offer -> Order -> immutable commercial snapshot ->
-- Checkout -> Payment -> trusted verification -> idempotent fulfillment ->
-- Entitlement -> Quota/benefit". Sumber kolom: STEP10-D_ATTRIBUTE_TO_
-- PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa deviasi.
--
-- TIDAK ADA permission baru — memakai `m14.commercial_purchase_access.
-- access` (buat order) + `.own_purchase` (lihat order sendiri) +
-- `m14.commercial_administration.manage_commercial_resources` (staf kelola
-- semua order, API-179 "Order owner/admin").
--
-- KEPUTUSAN KEAMANAN PENTING: TIDAK ADA UPDATE untuk pemilik order sama
-- sekali (hanya INSERT+SELECT). `status`/`confirmed_at` HANYA boleh
-- berubah lewat proses verifikasi pembayaran server-side (webhook Midtrans
-- + fulfillment, dibangun di batch REST terpisah), BUKAN klien langsung —
-- kalau Agent diberi UPDATE scope 'own' pada kolom-kolom ini, itu identik
-- dengan celah self-approval yang ditemukan di agent_verification_documents
-- (0055), tapi untuk sistem pembayaran risikonya jauh lebih besar (Agent
-- bisa "membayar" tanpa membayar sungguhan). Midtrans_API_Dokumentasi §4/§10
-- eksplisit: "Jangan menjadikan callback frontend sebagai satu-satunya
-- sumber kebenaran status pembayaran" — prinsip yang sama berlaku untuk
-- status order internal. Cancel (API-182) oleh pemilik akan lewat fungsi
-- SECURITY DEFINER terpisah nanti (pola sama seperti refresh_listing()),
-- bukan UPDATE RLS langsung.

CREATE TABLE IF NOT EXISTS public.commercial_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          VARCHAR(100) UNIQUE NOT NULL,
  user_id               UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id       UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  subscription_id       UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  addon_id              UUID REFERENCES public.addons(id) ON DELETE SET NULL,
  promotion_id          UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  amount                NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  currency              CHAR(3) NOT NULL DEFAULT 'IDR',
  status                TEXT NOT NULL,
  commercial_snapshot   JSONB NOT NULL,
  placed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.commercial_orders IS
  'Sumber: STEP10-D entity COMMERCIAL_ORDERS. `order_number` inilah yang dipetakan ke `order_id` pada payload Midtrans Snap (POST /snap/v1/transactions {"transaction_details":{"order_id":...}}) — lihat catatan lengkap di payment_transactions.payment_reference (0073). `commercial_snapshot` membekukan harga/syarat SAAT order dibuat (STEP11-B7 §9: "commercial_snapshot preserves historical purchase terms"), `confirmed_at` diisi setelah payment terverifikasi (STEP11-B7 §9: "confirmed_at is required by the current physical invariant for confirmed commercial states"). `status` TEXT bebas tanpa CHECK di sumber — konvensi pending/confirmed/cancelled/expired dipakai lapisan aplikasi tanpa dikunci di DB.';

ALTER TABLE public.commercial_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY commercial_orders_select ON public.commercial_orders
  FOR SELECT USING (
    public.has_permission('m14.commercial_purchase_access.own_purchase', user_id)
    OR public.has_permission('m14.commercial_administration.manage_commercial_resources')
  );

CREATE POLICY commercial_orders_insert ON public.commercial_orders
  FOR INSERT WITH CHECK (public.has_permission('m14.commercial_purchase_access.access', user_id));

CREATE POLICY commercial_orders_update_staff ON public.commercial_orders
  FOR UPDATE USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'));
