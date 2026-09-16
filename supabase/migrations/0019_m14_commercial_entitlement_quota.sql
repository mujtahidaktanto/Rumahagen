-- 0019_m14_commercial_entitlement_quota.sql
-- Menutup sebagian R-04 (M14 sebagai pemilik allowance — realisasi fisik "berapa
-- banyak entitlement" tersedia) dan menyiapkan fondasi untuk D13-01 (fungsi
-- consume_refresh_allowance() ditulis di 0020, memakai tabel-tabel di sini).
--
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- COMMERCIAL_ENTITLEMENTS/QUOTA_CAPACITIES/OPERATIONAL_QUOTA_POOLS/
-- QUOTA_ALLOCATIONS/QUOTA_USAGE (module M14) — rantai 5 tabel evidenced yang
-- SAMA dipakai untuk SEMUA jenis entitlement M14 (bukan hanya Refresh Allowance),
-- tapi migration ini HANYA mengisi jalur `entitlement_type='listing_refresh_allowance'`
-- / `capacity_type='listing_refresh'` sesuai scope Tahap 4 (R-04/D13-01). Jenis
-- entitlement lain (mis. subscription plan, addon) menyusul saat residualnya
-- sendiri masuk giliran — tabelnya generik dan sudah siap dipakai ulang.
--
-- KEPUTUSAN DESAIN (evidence-based, bukan skema baru): QUOTA_USAGE tidak punya
-- kolom "saldo sisa" — hanya event konsumsi mentah (usage_at, consumed_quantity).
-- Ini secara struktural menandakan sisa kuota harian dihitung on-the-fly dari
-- COUNT(quota_usage hari ini), BUKAN kolom counter yang di-reset lewat cron/job
-- terjadwal — pendekatan ini menghindari kebutuhan pg_cron/scheduler eksternal
-- (yang belum tentu aktif di project Supabase manapun) untuk menegakkan
-- "no carry-forward, reset di operational day baru" (Gate PRE-00-E §19): kalau
-- hari sudah ganti, COUNT hari ini otomatis nol tanpa proses reset apa pun.
-- `operational_quota_pools.operational_quantity` karenanya berarti KAPASITAS
-- OPERASIONAL total pool (jarang berubah, hanya saat Configure), BUKAN saldo
-- yang berkurang — lihat 0020 untuk logika penghitungan sisa harian.
--
-- SENGAJA DITUNDA: 3 kolom FK di commercial_entitlements
-- (source_order_id/source_payment_transaction_id/source_fulfillment_id) — target
-- tabelnya (commercial_orders/payment_transactions/commercial_fulfillments) milik
-- pipeline Commercial Purchase/Payment M14 yang lebih luas, residual TERPISAH dari
-- R-04/D13-01, belum masuk Tahap 4. Pola sama seperti campaign_reference di 0014
-- dan developer_project_id di 0018: kolom ada, FK menyusul.

CREATE TABLE IF NOT EXISTS public.commercial_entitlements (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id                 UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  entitlement_type                VARCHAR(100) NOT NULL,
  source_order_id                 UUID,  -- FK ke commercial_orders DITUNDA, lihat catatan di atas
  source_payment_transaction_id   UUID,  -- FK ke payment_transactions DITUNDA
  source_fulfillment_id           UUID,  -- FK ke commercial_fulfillments DITUNDA
  capacity_value                  NUMERIC(18,2),
  lifecycle_status                TEXT NOT NULL DEFAULT 'active'
                                     CHECK (lifecycle_status IN ('pending','active','expired','revoked','consumed','reversed')),
  starts_at                       TIMESTAMPTZ,
  ends_at                         TIMESTAMPTZ,
  historical_source               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quota_capacities (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id            UUID NOT NULL REFERENCES public.commercial_entitlements(id) ON DELETE RESTRICT,
  capacity_type             VARCHAR(100) NOT NULL,
  granted_quantity          NUMERIC(18,2) NOT NULL CHECK (granted_quantity >= 0),
  remaining_projection      NUMERIC(18,2) CHECK (remaining_projection IS NULL OR remaining_projection >= 0),
  valid_from                TIMESTAMPTZ,
  valid_to                  TIMESTAMPTZ,
  configuration              JSONB NOT NULL DEFAULT '{}'::jsonb,
  daily_refresh_allowance   INTEGER NOT NULL DEFAULT 5 CHECK (daily_refresh_allowance >= 0),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.quota_capacities.daily_refresh_allowance IS
  'ADD-NEW/downstream — di STEP10-D logical_data_type-nya "integer" tapi sql_physical_definition KOSONG ("exact physical realization downstream"). Default 5 mengikuti nilai default terkunci di Gate PRE-00-E §17 ("5 successful Refreshes per Agent per operational day"). Hanya relevan untuk baris dengan capacity_type=''listing_refresh''; NOT NULL dengan default supaya baris capacity_type lain (menyusul residual masa depan) tidak perlu isi kolom ini secara eksplisit.';

CREATE TABLE IF NOT EXISTS public.operational_quota_pools (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quota_capacity_id      UUID NOT NULL REFERENCES public.quota_capacities(id) ON DELETE RESTRICT,
  user_id                UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id        UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  pool_status            TEXT NOT NULL DEFAULT 'active'
                            CHECK (pool_status IN ('active','suspended','expired','closed')),
  operational_quantity   NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (operational_quantity >= 0),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quota_allocations (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operational_quota_pool_id   UUID NOT NULL REFERENCES public.operational_quota_pools(id) ON DELETE RESTRICT,
  beneficiary_user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  beneficiary_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  allocated_quantity           NUMERIC(18,2) NOT NULL CHECK (allocated_quantity >= 0),
  status                        TEXT NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('pending','active','suspended','expired','revoked','closed')),
  effective_from                TIMESTAMPTZ,
  effective_to                  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quota_usage (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quota_allocation_id           UUID REFERENCES public.quota_allocations(id) ON DELETE RESTRICT,
  operational_quota_pool_id     UUID NOT NULL REFERENCES public.operational_quota_pools(id) ON DELETE RESTRICT,
  consuming_resource_type       VARCHAR(100) NOT NULL,
  consuming_resource_reference  TEXT NOT NULL,
  consumed_quantity             NUMERIC(18,2) NOT NULL CHECK (consumed_quantity > 0),
  usage_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key                VARCHAR(150) UNIQUE,
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quota_usage IS
  'Ledger event konsumsi, append-only (tidak ada UPDATE/DELETE policy sama sekali — lihat RLS di bawah). idempotency_key dipakai consume_refresh_allowance() (0020) supaya retry dengan key sama tidak dobel-charge, pola sama dengan api_idempotency_keys (0010) tapi di level bisnis, bukan level HTTP request.';

-- ── RLS ── sumber: STEP12-01 baris "M14,Refresh Allowance/Entitlement,
-- Configure/consume,ALL,NONE,NONE,OWN,..." — 2 permission code (.configure,
-- .consume) SUDAH ADA di seed 0009. Agent punya scope OWN untuk KEDUANYA di
-- matrix (satu baris matrix, dua verb, scope sama — pola pemecahan yang sama
-- seperti m13.own_byok_connection.* di 0016).

ALTER TABLE public.commercial_entitlements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_capacities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_quota_pools   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_allocations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_usage               ENABLE ROW LEVEL SECURITY;

-- SELECT: Agent lihat entitlement/kapasitas miliknya sendiri (mis. untuk
-- menampilkan "sisa refresh hari ini" di UI), Superadmin lihat semua.
CREATE POLICY commercial_entitlements_select ON public.commercial_entitlements
  FOR SELECT USING (public.has_permission('m14.refresh_allowance_entitlement.configure', user_id));

CREATE POLICY quota_capacities_select ON public.quota_capacities
  FOR SELECT USING (
    public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.commercial_entitlements ce
      WHERE ce.id = quota_capacities.entitlement_id
        AND public.has_permission('m14.refresh_allowance_entitlement.configure', ce.user_id)
    )
  );

CREATE POLICY operational_quota_pools_select ON public.operational_quota_pools
  FOR SELECT USING (public.has_permission('m14.refresh_allowance_entitlement.configure', user_id));

CREATE POLICY quota_allocations_select ON public.quota_allocations
  FOR SELECT USING (public.has_permission('m14.refresh_allowance_entitlement.configure', beneficiary_user_id));

CREATE POLICY quota_usage_select ON public.quota_usage
  FOR SELECT USING (
    public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.operational_quota_pools oqp
      WHERE oqp.id = quota_usage.operational_quota_pool_id
        AND public.has_permission('m14.refresh_allowance_entitlement.consume', oqp.user_id)
    )
  );

-- MUTASI: TIDAK ADA policy INSERT/UPDATE/DELETE untuk kelima tabel ini sama
-- sekali (implicit-deny RLS default) — meski matrix memberi Agent scope OWN
-- untuk verb "Configure", mengizinkan Agent mengubah ANGKA granted_quantity/
-- daily_refresh_allowance milik dirinya sendiri lewat client langsung adalah
-- celah eskalasi hak (agent bisa "konfigurasi" jatah sendiri jadi tak terbatas).
-- KEPUTUSAN: perketat ke jalur fungsi SECURITY DEFINER saja
-- (configure_refresh_allowance() di bawah, consume_refresh_allowance() di 0020),
-- yang TETAP menegakkan has_permission() secara eksplisit di dalamnya — pola
-- yang sama seperti R-06 (0011): "RLS didesain lebih luas dari semantik yang
-- dimaksud — perketat saat migration ditulis, jangan copy scope dokumen
-- mentah-mentah". SELECT (lihat di atas) TETAP menghormati OWN scope Agent
-- apa adanya karena melihat saldo sendiri tidak berisiko sama sekali.

-- ── Fungsi Configure (M14, Superadmin-only secara praktik — lihat catatan di
-- atas kenapa OWN scope Agent tidak diberi jalur mutasi langsung) ──
-- Membuat/memperbarui rantai entitlement→capacity→pool→allocation untuk satu
-- agent sekaligus, atomik. Ini realisasi fisik verb "Configure" dari matrix.
CREATE OR REPLACE FUNCTION public.configure_refresh_allowance(
  p_agent_id UUID,
  p_daily_allowance INTEGER DEFAULT 5
)
RETURNS public.operational_quota_pools
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement_id UUID;
  v_capacity_id    UUID;
  v_pool           public.operational_quota_pools;
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'configure_refresh_allowance: butuh permission m14.refresh_allowance_entitlement.configure dengan scope Superadmin (lihat catatan keputusan RLS di migration ini)';
  END IF;

  IF p_daily_allowance < 0 THEN
    RAISE EXCEPTION 'configure_refresh_allowance: p_daily_allowance tidak boleh negatif';
  END IF;

  SELECT id INTO v_entitlement_id
  FROM public.commercial_entitlements
  WHERE user_id = p_agent_id AND entitlement_type = 'listing_refresh_allowance' AND lifecycle_status = 'active'
  LIMIT 1;

  IF v_entitlement_id IS NULL THEN
    INSERT INTO public.commercial_entitlements (user_id, entitlement_type, lifecycle_status, starts_at)
    VALUES (p_agent_id, 'listing_refresh_allowance', 'active', now())
    RETURNING id INTO v_entitlement_id;
  END IF;

  SELECT id INTO v_capacity_id
  FROM public.quota_capacities
  WHERE entitlement_id = v_entitlement_id AND capacity_type = 'listing_refresh'
  LIMIT 1;

  IF v_capacity_id IS NULL THEN
    INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, daily_refresh_allowance)
    VALUES (v_entitlement_id, 'listing_refresh', p_daily_allowance, p_daily_allowance)
    RETURNING id INTO v_capacity_id;
  ELSE
    UPDATE public.quota_capacities
    SET daily_refresh_allowance = p_daily_allowance,
        granted_quantity = p_daily_allowance,
        updated_at = now()
    WHERE id = v_capacity_id;
  END IF;

  SELECT * INTO v_pool
  FROM public.operational_quota_pools
  WHERE quota_capacity_id = v_capacity_id AND user_id = p_agent_id
  LIMIT 1;

  IF v_pool.id IS NULL THEN
    INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
    VALUES (v_capacity_id, p_agent_id, 'active', p_daily_allowance)
    RETURNING * INTO v_pool;

    INSERT INTO public.quota_allocations
      (operational_quota_pool_id, beneficiary_user_id, allocated_quantity, status, effective_from)
    VALUES (v_pool.id, p_agent_id, p_daily_allowance, 'active', now());
  ELSE
    UPDATE public.operational_quota_pools
    SET operational_quantity = p_daily_allowance, updated_at = now()
    WHERE id = v_pool.id
    RETURNING * INTO v_pool;
  END IF;

  PERFORM public.log_audit_event(
    p_action      := 'm14.refresh_allowance_entitlement.configure',
    p_entity_type := 'operational_quota_pools',
    p_entity_id   := v_pool.id,
    p_new_value   := jsonb_build_object('agent_id', p_agent_id, 'daily_allowance', p_daily_allowance)
  );

  RETURN v_pool;
END;
$$;

COMMENT ON FUNCTION public.configure_refresh_allowance IS
  'Realisasi fisik verb "Configure" dari M14 Refresh Allowance/Entitlement (Gate PRE-00-E §18: "Configuration actor = Superadmin"). Membuat/top-up rantai entitlement→capacity→pool→allocation. Dipanggil dari route handler Superadmin (menyusul Step 3/STEP-11).';
