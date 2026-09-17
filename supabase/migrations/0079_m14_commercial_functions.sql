-- 0079_m14_commercial_functions.sql
-- Batch REST API M14 Commercial (Midtrans MVP) — merealisasikan 4 potongan
-- business logic yang SENGAJA ditunda oleh migration Fase 4 sendiri untuk
-- "batch REST API nanti": cancel order (catatan di 0072), fulfillment
-- (catatan di 0075), dan invocation contract M14->M04 LP grant (TODO
-- eksplisit di 0025 "TODO direvisi saat pipeline fulfillment M14 dibangun").
-- Juga menutup 1 CELAH SELF-APPROVAL yang ditemukan SEBELUM ada bug nyata
-- (proaktif, pola sama seperti Fase 1/agent_verification_documents-0055):
-- RLS INSERT commercial_orders/payment_transactions (0072/0073) memang
-- WITH CHECK permission, TAPI TIDAK membatasi NILAI kolom status/
-- payment_state/verification_state/confirmed_at/paid_at/verified_at yang
-- boleh diisi klien saat INSERT — seorang Agent bisa langsung INSERT order
-- dengan status='confirmed' atau payment dengan payment_state='settlement'
-- lewat PostgREST mentah, TANPA pernah membayar sungguhan. Ditutup di sini
-- SEBELUM REST API dibangun (bukan sesudah ditemukan lewat testing), karena
-- pola vulnerability ini sudah dikenal berulang di proyek ini (Fase 1
-- verification_document self-approval, Fase 4 payment_transactions UPDATE).

-- ── Helper: deteksi request lewat service_role (admin client server-side,
-- lib/supabase/admin.ts) — auth.uid()/has_permission() TIDAK bisa dipakai
-- untuk menggerbangi fulfill_commercial_order() karena webhook Midtrans
-- (API-185) tidak punya sesi user Supabase Auth sama sekali (dipanggil
-- server-to-server, bukan oleh actor manusia manapun) — has_permission()
-- akan selalu FALSE untuk request tanpa auth.uid(). service_role adalah
-- role Postgres yang dipakai SUPABASE_SERVICE_ROLE_KEY, terbaca dari klaim
-- JWT "role" (PostgREST mengekspos ini lewat request.jwt.claims).
CREATE OR REPLACE FUNCTION public.is_service_role_request()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::json ->> 'role', '') = 'service_role';
$$;

COMMENT ON FUNCTION public.is_service_role_request IS
  'True kalau request PostgREST memakai SUPABASE_SERVICE_ROLE_KEY (admin client, lib/supabase/admin.ts) — dipakai fulfill_commercial_order() untuk mengizinkan invocation dari webhook Midtrans yang tidak punya sesi user sama sekali.';

-- ── Trigger: paksa order baru selalu berstatus pending, tidak peduli field
-- apa yang dikirim klien di body INSERT-nya (defense-in-depth PostgREST
-- mentah, di luar apa pun yang divalidasi lapisan Next.js/Zod).
CREATE OR REPLACE FUNCTION public.enforce_commercial_order_insert_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    IF NEW.status IS DISTINCT FROM 'pending' OR NEW.confirmed_at IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: order baru harus berstatus pending tanpa confirmed_at — status hanya berubah lewat verifikasi pembayaran server-side (lihat catatan keamanan migration 0072/0079)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_commercial_order_insert_pending ON public.commercial_orders;
CREATE TRIGGER trg_enforce_commercial_order_insert_pending
  BEFORE INSERT ON public.commercial_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_commercial_order_insert_pending();

-- ── Trigger: sama untuk payment_transactions — percobaan pembayaran baru
-- HARUS mulai dari payment_state='pending'/verification_state='unverified',
-- tidak peduli apa yang dikirim klien.
CREATE OR REPLACE FUNCTION public.enforce_payment_transaction_insert_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    IF NEW.payment_state IS DISTINCT FROM 'pending'
       OR NEW.verification_state IS DISTINCT FROM 'unverified'
       OR NEW.paid_at IS NOT NULL
       OR NEW.verified_at IS NOT NULL THEN
      RAISE EXCEPTION 'payment_transactions: percobaan pembayaran baru harus pending/unverified tanpa paid_at/verified_at — status hanya berubah lewat webhook Midtrans terverifikasi (lihat catatan keamanan migration 0073/0079)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_payment_transaction_insert_pending ON public.payment_transactions;
CREATE TRIGGER trg_enforce_payment_transaction_insert_pending
  BEFORE INSERT ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_transaction_insert_pending();

-- ── cancel_commercial_order() — realisasi API-182, dijanjikan di komentar
-- 0072 ("Cancel oleh pemilik akan lewat fungsi SECURITY DEFINER terpisah
-- nanti, pola sama seperti refresh_listing()"). Pemilik ATAU staf boleh
-- memanggil; hanya order status='pending' yang boleh dibatalkan (order yang
-- sudah confirmed/settlement tidak "dibatalkan" lewat jalur ini — itu domain
-- refund/reconciliation, F11-B7-003, controlled gap, tidak dibangun di sini).
CREATE OR REPLACE FUNCTION public.cancel_commercial_order(p_order_id UUID)
RETURNS public.commercial_orders
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.commercial_orders;
BEGIN
  SELECT * INTO v_order FROM public.commercial_orders WHERE id = p_order_id;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'cancel_commercial_order: order tidak ditemukan';
  END IF;

  IF NOT (public.has_permission('m14.commercial_purchase_access.own_purchase', v_order.user_id)
          OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    RAISE EXCEPTION 'cancel_commercial_order: Anda tidak punya akses ke order ini';
  END IF;

  IF v_order.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'cancel_commercial_order: hanya order berstatus pending yang bisa dibatalkan (status saat ini: %)', v_order.status;
  END IF;

  UPDATE public.commercial_orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  PERFORM public.log_audit_event(
    p_action      := 'm14.commercial_order.cancel',
    p_entity_type := 'commercial_orders',
    p_entity_id   := v_order.id,
    p_new_value   := jsonb_build_object('status', 'cancelled')
  );

  RETURN v_order;
END;
$$;

COMMENT ON FUNCTION public.cancel_commercial_order IS
  'Realisasi API-182 POST /commercial/orders/{order_id}/cancel. Pemilik order (own_purchase) atau staf (manage_commercial_resources). Hanya order pending yang bisa dibatalkan.';

-- ── fulfill_commercial_order() — realisasi API "idempotent fulfillment"
-- (STEP11-B7 §5/§10), dijanjikan di komentar 0075. Dipanggil dari route
-- webhook Midtrans (admin client/service_role, TIDAK ADA sesi user) setelah
-- signature+amount terverifikasi, ATAU staf secara manual untuk
-- reconciliation. SCOPE MVP: HANYA addon-sourced order (order.addon_id
-- NOT NULL) — subscription purchase TIDAK dibangun di batch ini karena
-- tidak ada tabel katalog/harga subscription plan yang dievidence
-- (subscriptions/0071 adalah catatan INSTANCE milik user, bukan katalog
-- harga — lihat README apps/web untuk penjelasan lengkap keputusan scope
-- ini).
CREATE OR REPLACE FUNCTION public.fulfill_commercial_order(p_payment_transaction_id UUID)
RETURNS public.commercial_fulfillments
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment      public.payment_transactions;
  v_order        public.commercial_orders;
  v_addon        public.addons;
  v_fulfillment  public.commercial_fulfillments;
  v_key          TEXT;
  v_entitlement_id UUID;
  v_capacity_id  UUID;
  v_pool         public.operational_quota_pools;
  v_ends_at      TIMESTAMPTZ;
  v_outcome_ref  TEXT;
BEGIN
  IF NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    RAISE EXCEPTION 'fulfill_commercial_order: hanya dipanggil dari webhook server-side atau staf reconciliation';
  END IF;

  SELECT * INTO v_payment FROM public.payment_transactions WHERE id = p_payment_transaction_id;
  IF v_payment.id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: payment_transaction tidak ditemukan';
  END IF;

  IF v_payment.payment_state NOT IN ('settlement', 'capture') OR v_payment.verification_state <> 'verified' THEN
    RAISE EXCEPTION 'fulfill_commercial_order: payment_state/verification_state belum settlement+verified (state saat ini: %/%)', v_payment.payment_state, v_payment.verification_state;
  END IF;

  v_key := 'fulfill:' || p_payment_transaction_id::text;

  SELECT * INTO v_fulfillment FROM public.commercial_fulfillments WHERE idempotency_key = v_key;
  IF v_fulfillment.id IS NOT NULL THEN
    RETURN v_fulfillment; -- replay idempoten — webhook Midtrans boleh terkirim ulang (Midtrans §12)
  END IF;

  SELECT * INTO v_order FROM public.commercial_orders WHERE id = v_payment.commercial_order_id;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: commercial_order sumber tidak ditemukan';
  END IF;

  IF v_order.addon_id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: order ini bukan addon-sourced order — fulfillment subscription belum dibangun di batch ini (lihat catatan scope migration 0079)';
  END IF;

  SELECT * INTO v_addon FROM public.addons WHERE id = v_order.addon_id;
  IF v_addon.id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: addon sumber order tidak ditemukan';
  END IF;

  IF v_addon.validity_days IS NOT NULL THEN
    v_ends_at := now() + make_interval(days => v_addon.validity_days);
  ELSE
    v_ends_at := NULL;
  END IF;

  IF v_addon.capacity_type = 'learning_point' THEN
    -- Realisasi TODO eksplisit di komentar 0025: invocation M14->M04 kini
    -- lewat jalur tervalidasi (fulfillment_key sah), bukan is_superadmin().
    PERFORM public.grant_learning_points_from_purchase(
      p_user_id          := v_order.user_id,
      p_amount           := COALESCE(v_addon.capacity_value, 0),
      p_source_reference := v_key,
      p_idempotency_key  := v_key
    );
    v_outcome_ref := 'learning_point_transactions:' || v_key;
  ELSE
    -- Realisasi generik rantai Entitlement->Quota Capacity->Operational Pool
    -- ->Allocation (0019) untuk capacity_type non-LP (mis. 'listing_refresh'
    -- top-up dari addon) — rantai yang sama, sumber diisi (source_order_id/
    -- source_payment_transaction_id/source_fulfillment_id akan diisi setelah
    -- baris fulfillment ini dibuat, lihat UPDATE di bawah).
    INSERT INTO public.commercial_entitlements
      (user_id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at, historical_source)
    VALUES
      (v_order.user_id, v_addon.code, v_addon.capacity_value, 'active', now(), v_ends_at,
       jsonb_build_object('addon_id', v_addon.id, 'addon_code', v_addon.code))
    RETURNING id INTO v_entitlement_id;

    INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, valid_from, valid_to)
    VALUES (v_entitlement_id, COALESCE(v_addon.capacity_type, v_addon.code), COALESCE(v_addon.capacity_value, 0), now(), v_ends_at)
    RETURNING id INTO v_capacity_id;

    INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
    VALUES (v_capacity_id, v_order.user_id, 'active', COALESCE(v_addon.capacity_value, 0))
    RETURNING * INTO v_pool;

    INSERT INTO public.quota_allocations (operational_quota_pool_id, beneficiary_user_id, allocated_quantity, status, effective_from, effective_to)
    VALUES (v_pool.id, v_order.user_id, COALESCE(v_addon.capacity_value, 0), 'active', now(), v_ends_at);

    v_outcome_ref := 'commercial_entitlements:' || v_entitlement_id::text;
  END IF;

  INSERT INTO public.commercial_fulfillments
    (payment_transaction_id, commercial_order_id, fulfillment_key, fulfillment_status, outcome_reference, idempotency_key, fulfilled_at)
  VALUES
    (p_payment_transaction_id, v_order.id, v_key, 'fulfilled', v_outcome_ref, v_key, now())
  RETURNING * INTO v_fulfillment;

  IF v_entitlement_id IS NOT NULL THEN
    UPDATE public.commercial_entitlements
    SET source_order_id = v_order.id,
        source_payment_transaction_id = p_payment_transaction_id,
        source_fulfillment_id = v_fulfillment.id
    WHERE id = v_entitlement_id;
  END IF;

  UPDATE public.commercial_orders
  SET status = 'confirmed', confirmed_at = now(), updated_at = now()
  WHERE id = v_order.id;

  PERFORM public.log_audit_event(
    p_action      := 'm14.commercial_fulfillment.fulfill',
    p_entity_type := 'commercial_fulfillments',
    p_entity_id   := v_fulfillment.id,
    p_new_value   := jsonb_build_object('payment_transaction_id', p_payment_transaction_id, 'commercial_order_id', v_order.id, 'outcome_reference', v_outcome_ref)
  );

  RETURN v_fulfillment;
END;
$$;

COMMENT ON FUNCTION public.fulfill_commercial_order IS
  'Realisasi "idempotent fulfillment" causal chain M14 (STEP11-B7 §5), dijanjikan di komentar 0075. Idempotent lewat idempotency_key=fulfill:<payment_transaction_id>. Dipanggil dari webhook Midtrans (service_role) atau staf manual. SCOPE MVP: addon-sourced order saja.';

-- ── grant_learning_points_from_purchase() — realisasi TODO eksplisit di
-- komentar 0025: kini menerima invocation lewat p_idempotency_key yang
-- match ke fulfillment_key sah di commercial_fulfillments (bukan cuma
-- is_superadmin()). CREATE OR REPLACE aman — signature tidak berubah,
-- perilaku existing (is_superadmin()) tetap jalan sebagai fallback manual.
CREATE OR REPLACE FUNCTION public.grant_learning_points_from_purchase(
  p_user_id           UUID,
  p_amount            NUMERIC(18,2),
  p_source_reference  TEXT,
  p_idempotency_key   TEXT DEFAULT NULL
)
RETURNS public.learning_point_transactions
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_txn        public.learning_point_transactions;
  v_valid_fulfillment BOOLEAN := false;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.commercial_fulfillments
      WHERE fulfillment_key = p_idempotency_key AND fulfillment_status = 'fulfilled'
    ) INTO v_valid_fulfillment;
  END IF;

  IF NOT (public.is_superadmin() OR public.is_service_role_request() OR v_valid_fulfillment) THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: butuh is_superadmin(), service_role, atau p_idempotency_key yang match ke commercial_fulfillments sah (lihat migration 0025/0079)';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: p_amount harus > 0 (ini grant/kredit; pemakaian LP/debit memakai jalur transaksi lain, bukan fungsi ini)';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn FROM public.learning_point_transactions WHERE idempotency_key = p_idempotency_key;
    IF v_txn.id IS NOT NULL THEN
      RETURN v_txn;
    END IF;
  END IF;

  SELECT id INTO v_account_id FROM public.learning_point_accounts WHERE user_id = p_user_id;
  IF v_account_id IS NULL THEN
    INSERT INTO public.learning_point_accounts (user_id) VALUES (p_user_id)
    RETURNING id INTO v_account_id;
  END IF;

  INSERT INTO public.learning_point_transactions (
    account_id, user_id, transaction_type, amount, source_type, source_reference, idempotency_key
  ) VALUES (
    v_account_id, p_user_id, 'purchased', p_amount, 'm14_commercial_fulfillment', p_source_reference, p_idempotency_key
  )
  RETURNING * INTO v_txn;

  PERFORM public.log_audit_event(
    p_action      := 'm04.learning_point.grant_from_purchase',
    p_entity_type := 'learning_point_transactions',
    p_entity_id   := v_txn.id,
    p_new_value   := jsonb_build_object('user_id', p_user_id, 'amount', p_amount, 'source_reference', p_source_reference)
  );

  RETURN v_txn;
END;
$$;

COMMENT ON FUNCTION public.grant_learning_points_from_purchase IS
  'Realisasi fisik D13-02: kontrak invocation M14->M04 untuk purchased-LP handoff. Idempotent lewat p_idempotency_key. Sejak 0079: bisa dipanggil is_superadmin() (manual/testing), service_role (webhook), ATAU p_idempotency_key yang match fulfillment_key sah di commercial_fulfillments (pipeline fulfill_commercial_order() otomatis) — realisasi TODO yang didokumentasikan eksplisit di komentar migration 0025.';

-- ── allocate_quota_capacity() — realisasi API-194 POST
-- /commercial/quota/{quota_id}/allocate. Staff-only (Authorized
-- organization/admin scope) — mengisi quota_allocations yang RLS-nya
-- sengaja tanpa INSERT policy (0019).
CREATE OR REPLACE FUNCTION public.allocate_quota_capacity(
  p_pool_id                    UUID,
  p_beneficiary_user_id        UUID DEFAULT NULL,
  p_beneficiary_organization_id UUID DEFAULT NULL,
  p_quantity                   NUMERIC(18,2) DEFAULT 0
)
RETURNS public.quota_allocations
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool public.operational_quota_pools;
  v_allocation public.quota_allocations;
BEGIN
  IF NOT public.has_permission('m14.commercial_administration.manage_commercial_resources') THEN
    RAISE EXCEPTION 'allocate_quota_capacity: butuh permission m14.commercial_administration.manage_commercial_resources';
  END IF;

  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'allocate_quota_capacity: p_quantity harus > 0';
  END IF;

  IF p_beneficiary_user_id IS NULL AND p_beneficiary_organization_id IS NULL THEN
    RAISE EXCEPTION 'allocate_quota_capacity: butuh p_beneficiary_user_id atau p_beneficiary_organization_id';
  END IF;

  SELECT * INTO v_pool FROM public.operational_quota_pools WHERE id = p_pool_id;
  IF v_pool.id IS NULL THEN
    RAISE EXCEPTION 'allocate_quota_capacity: operational_quota_pool tidak ditemukan';
  END IF;

  INSERT INTO public.quota_allocations
    (operational_quota_pool_id, beneficiary_user_id, beneficiary_organization_id, allocated_quantity, status, effective_from)
  VALUES
    (p_pool_id, p_beneficiary_user_id, p_beneficiary_organization_id, p_quantity, 'active', now())
  RETURNING * INTO v_allocation;

  PERFORM public.log_audit_event(
    p_action      := 'm14.commercial_administration.quota_allocate',
    p_entity_type := 'quota_allocations',
    p_entity_id   := v_allocation.id,
    p_new_value   := jsonb_build_object('pool_id', p_pool_id, 'quantity', p_quantity)
  );

  RETURN v_allocation;
END;
$$;

COMMENT ON FUNCTION public.allocate_quota_capacity IS
  'Realisasi API-194 POST /commercial/quota/{quota_id}/allocate. Staff-only. Mengisi quota_allocations yang RLS-nya sengaja tanpa INSERT policy langsung (0019).';

-- ── consume_quota_capacity() — realisasi API-195 POST
-- /commercial/quota/{quota_id}/consume ("Server-authorized domain
-- operation" — BUKAN endpoint client bebas, hanya staf/service_role,
-- BERBEDA dari consume_refresh_allowance()/0020 yang khusus dipanggil
-- Agent sendiri lewat refresh_listing() untuk capacity_type='listing_refresh'
-- SAJA). Generik untuk capacity_type lain yang lahir dari addon purchase.
CREATE OR REPLACE FUNCTION public.consume_quota_capacity(
  p_pool_id                UUID,
  p_consuming_resource_type VARCHAR(100),
  p_consuming_resource_reference TEXT,
  p_quantity               NUMERIC(18,2),
  p_idempotency_key        TEXT DEFAULT NULL
)
RETURNS public.quota_usage
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool  public.operational_quota_pools;
  v_usage public.quota_usage;
BEGIN
  IF NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    RAISE EXCEPTION 'consume_quota_capacity: hanya dipanggil dari server-side domain operation atau staf (Server-authorized domain operation, API-195)';
  END IF;

  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'consume_quota_capacity: p_quantity harus > 0';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_usage FROM public.quota_usage WHERE idempotency_key = p_idempotency_key;
    IF v_usage.id IS NOT NULL THEN
      RETURN v_usage;
    END IF;
  END IF;

  SELECT * INTO v_pool FROM public.operational_quota_pools WHERE id = p_pool_id;
  IF v_pool.id IS NULL THEN
    RAISE EXCEPTION 'consume_quota_capacity: operational_quota_pool tidak ditemukan';
  END IF;

  INSERT INTO public.quota_usage
    (operational_quota_pool_id, consuming_resource_type, consuming_resource_reference, consumed_quantity, idempotency_key)
  VALUES
    (p_pool_id, p_consuming_resource_type, p_consuming_resource_reference, p_quantity, p_idempotency_key)
  RETURNING * INTO v_usage;

  RETURN v_usage;
END;
$$;

COMMENT ON FUNCTION public.consume_quota_capacity IS
  'Realisasi API-195 POST /commercial/quota/{quota_id}/consume — "Server-authorized domain operation", staf/service_role saja. Generik untuk capacity_type non-listing_refresh (yang punya jalur khusus sendiri, consume_refresh_allowance()/0020).';
