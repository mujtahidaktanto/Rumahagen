-- 0071_m14_promotions_addons_subscriptions.sql
-- Fase 4 dari rencana "100% tabel" — M14 Commercial (8 tabel terakhir).
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- entity PROMOTIONS/ADDONS/SUBSCRIPTIONS — tanpa deviasi. Konfirmasi
-- semantik dari STEP11-B7 v1.1 §5 "8 locked MVP commercial surfaces":
-- Listing quota add-ons, Learning Point packages, Free membership, Pro
-- monthly, Pro annual, Paid listing boost/premium promotion, Paid internal
-- RumahAgen Learning classes, Paid partner Learning classes — SEMUA
-- direalisasikan lewat kombinasi addons (produk sekali beli) dan
-- subscriptions (produk berlangganan), promotions sebagai modifier harga.
--
-- TIDAK ADA permission baru — 4 permission M14 SUDAH ADA sejak seed 0009
-- (master matrix 50-baris SUDAH mengantisipasi resource commercial
-- generik ini, beda dari M04 Catalog/M15 Awarding yang butuh permission
-- baru): `m14.commercial_administration.configure` (Superadmin/Admin=ALL
-- — konfigurasi katalog/subscription/addon/promotion, dipakai di sini)
-- dan `m14.commercial_purchase_access.own_purchase` (Superadmin=all,
-- Admin/Manager/Agent/Buyer/Developer_Partner=own — lihat subscription
-- miliknya sendiri).

CREATE TABLE IF NOT EXISTS public.promotions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                      VARCHAR(100) UNIQUE NOT NULL,
  name                      VARCHAR(200) NOT NULL,
  rule_configuration        JSONB NOT NULL DEFAULT '{}'::jsonb,
  eligibility_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  benefit_configuration     JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_from                TIMESTAMPTZ,
  valid_to                  TIMESTAMPTZ,
  status                    TEXT NOT NULL DEFAULT 'draft',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.promotions IS
  'Sumber: STEP10-D entity PROMOTIONS. STEP11-B7 §18: "M14 owns Promotion commercial truth. M11 owns public discovery... A public Promotion representation does not transfer commercial mutation authority to M11" — representasi publik promo (kalau ada) lewat `public_announcement_promotion` (M11/0014), BUKAN tabel ini diekspos langsung. `status` TEXT bebas tanpa CHECK di sumber, konvensi draft/active/expired dipakai tanpa dikunci.';

CREATE TABLE IF NOT EXISTS public.addons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(100) UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  validity_type   TEXT NOT NULL,
  validity_days   INT CHECK (validity_days IS NULL OR validity_days > 0),
  capacity_type   VARCHAR(100),
  capacity_value  NUMERIC(18,2),
  promotion_id    UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  configuration   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addons IS
  'Sumber: STEP10-D entity ADDONS. Realisasi "Listing quota add-ons" dan "Learning Point packages" (2 dari 8 MVP commercial surfaces STEP11-B7 §5) — `capacity_type`/`capacity_value` menyimpan APA yang didapat (mis. capacity_type=''listing_refresh''/''learning_point'', capacity_value=jumlahnya), realisasi entitlement sungguhan tetap lewat commercial_entitlements (0019) setelah fulfillment, bukan tabel ini langsung. Katalog produk — dibaca PUBLIK untuk status=active (mis. halaman "beli tambahan"), berbeda dari promotions yang staff-only (addons adalah katalog harga, bukan config engine internal).';

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id                 UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  product_code                    VARCHAR(100) NOT NULL,
  status                          TEXT NOT NULL,
  starts_at                       TIMESTAMPTZ,
  ends_at                         TIMESTAMPTZ,
  renews_at                       TIMESTAMPTZ,
  historical_purchase_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS
  'Sumber: STEP10-D entity SUBSCRIPTIONS. Realisasi "Free membership"/"Pro monthly"/"Pro annual" (3 dari 8 MVP commercial surfaces). BEDA dari addons: subscriptions adalah CATATAN instance milik satu user/organization (privat, bukan katalog), addons adalah definisi produk (publik). `historical_purchase_snapshot` membekukan syarat harga/benefit SAAT pembelian — pola sama seperti `commercial_orders.commercial_snapshot` (0072) dan `learning_path_versions.definition_snapshot` (M04), supaya perubahan harga di kemudian hari tidak mengubah riwayat langganan yang sudah berjalan.';

ALTER TABLE public.promotions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- promotions — staff-only penuh (config engine internal, pola sama seperti
-- m15.awarding_path_rule.configure/0064).
CREATE POLICY promotions_manage ON public.promotions
  FOR ALL USING (public.has_permission('m14.commercial_administration.configure'))
  WITH CHECK (public.has_permission('m14.commercial_administration.configure'));

-- addons — katalog produk publik untuk status=active, staff kelola penuh.
CREATE POLICY addons_select ON public.addons
  FOR SELECT USING (
    status = 'active'
    OR public.has_permission('m14.commercial_administration.configure')
  );

CREATE POLICY addons_manage ON public.addons
  FOR ALL USING (public.has_permission('m14.commercial_administration.configure'))
  WITH CHECK (public.has_permission('m14.commercial_administration.configure'));

-- subscriptions — pemilik lihat milik sendiri, staf kelola penuh. TIDAK ADA
-- UPDATE untuk pemilik (status/ends_at/renews_at adalah hasil siklus
-- pembayaran/fulfillment, bukan field yang aman diubah klien sendiri —
-- pola sama seperti pelajaran self-approval di agent_verification_documents/
-- 0055: field status yang berdampak bisnis tidak boleh client-writable
-- lewat scope 'own' semata).
CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT USING (
    public.has_permission('m14.commercial_purchase_access.own_purchase', user_id)
    OR public.has_permission('m14.commercial_administration.configure')
  );

CREATE POLICY subscriptions_manage_staff ON public.subscriptions
  FOR ALL USING (public.has_permission('m14.commercial_administration.configure'))
  WITH CHECK (public.has_permission('m14.commercial_administration.configure'));
