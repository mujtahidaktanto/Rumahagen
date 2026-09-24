-- 0141_m14_listing_slot_addon_and_expiry_job.sql
-- Lanjutan 0140 (kuota listing): (1) addon "slot listing" (capacity_type='listing_slot'), (2) penutupan celah grant_addon_capacity, (3) penjadwalan
-- expire_listing_slots() lewat pg_cron.
--
-- 1. Slot listing yang dibeli: tidak reset dan tidak kedaluwarsa sebelum dipakai. Karena itu grant_addon_capacity() memberi entitlement dan
--    quota_capacities listing_slot TANPA ends_at/valid_to (abaikan masa berlaku addon untuk kapasitas ini) dan tanpa pool/alokasi operasional
--    (saldo dihitung listing_slot_purchased_balance() = total capacity aktif - jatah 'purchased' terpakai, 0140). Pembelian dengan organization_id
--    (0138: hanya anggota aktif) memberi slot ke ORGANISASI (commercial_entitlements.organization_id); tanpa organisasi, ke pribadi.
--    Nilai kapasitas listing_slot harus bilangan bulat > 0. Jenis kapasitas addon kini: listing_refresh, learning_point, listing_slot.
-- 2. CELAH (dibuktikan di DB live): grant_addon_capacity() SECURITY DEFINER tanpa pemeriksaan dan bisa dieksekusi PUBLIC/anon/authenticated. Pengguna
--    login mana pun dapat memanggil RPC-nya dan memberi dirinya kapasitas apa pun tanpa membayar (uji: entitlement terbentuk). Dengan slot listing
--    ini berarti kuota tanpa batas. Perbaikan: EXECUTE dicabut dari PUBLIC/anon/authenticated (fulfill_commercial_order tetap memanggilnya sebagai
--    pemilik fungsi), ditambah penjaga di dalam fungsi (hanya pemilik/service).
-- 3. pg_cron: job 'expire-listing-slots' tiap jam menjalankan expire_listing_slots() (pengingat masa tenggang + pengembalian ke draf setelah 90+7 hari).
--    Job dijadwalkan ulang bila sudah ada (idempoten).
-- Tabel addons kosong saat ditulis (dicek live).

-- ═══ 1a. Jenis kapasitas addon ═══
CREATE OR REPLACE FUNCTION public.addon_capacities_valid(p jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  e jsonb;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'array' THEN
    RETURN FALSE;
  END IF;
  FOR e IN SELECT * FROM jsonb_array_elements(p) LOOP
    IF jsonb_typeof(e) <> 'object'
       OR (e ->> 'capacity_type') NOT IN ('listing_refresh', 'learning_point', 'listing_slot')
       OR (e ->> 'capacity_value') IS NULL
       OR (e ->> 'capacity_value') !~ '^[0-9]+(\.[0-9]+)?$'
       OR (e ->> 'capacity_value')::numeric <= 0
       OR ((e ->> 'capacity_type') = 'listing_slot' AND (e ->> 'capacity_value')::numeric <> trunc((e ->> 'capacity_value')::numeric)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;

ALTER TABLE public.addons DROP CONSTRAINT IF EXISTS addons_capacity_type_check;
ALTER TABLE public.addons
  ADD CONSTRAINT addons_capacity_type_check CHECK (capacity_type IS NULL OR capacity_type IN ('listing_refresh', 'learning_point', 'listing_slot'));
ALTER TABLE public.addons DROP CONSTRAINT IF EXISTS addons_listing_slot_integer_check;
ALTER TABLE public.addons
  ADD CONSTRAINT addons_listing_slot_integer_check CHECK (capacity_type IS DISTINCT FROM 'listing_slot' OR capacity_value = trunc(capacity_value));

-- ═══ 1b + 2. grant_addon_capacity: slot listing, organisasi, dan penjaga akses ═══
DROP FUNCTION IF EXISTS public.grant_addon_capacity(uuid, character varying, numeric, character varying, uuid, timestamptz, text, uuid, uuid);
CREATE OR REPLACE FUNCTION public.grant_addon_capacity(
  p_user_id uuid, p_capacity_type character varying, p_capacity_value numeric, p_addon_code character varying, p_addon_id uuid,
  p_ends_at timestamptz, p_fulfillment_key text, p_order_id uuid, p_payment_transaction_id uuid,
  p_organization_id uuid DEFAULT NULL
)
RETURNS TABLE(outcome_reference text, entitlement_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement_id UUID;
  v_capacity_id    UUID;
  v_pool           public.operational_quota_pools;
  v_lp_key         TEXT;
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'grant_addon_capacity: hanya dipanggil dari fulfill_commercial_order (server-side)' USING ERRCODE = '42501';
  END IF;

  IF p_capacity_type = 'learning_point' THEN
    v_lp_key := p_fulfillment_key || ':' || p_capacity_type;
    PERFORM public.grant_learning_points_from_purchase(
      p_user_id          := p_user_id,
      p_amount           := COALESCE(p_capacity_value, 0),
      p_source_reference := v_lp_key,
      p_idempotency_key  := v_lp_key
    );
    RETURN QUERY SELECT ('learning_point_transactions:' || v_lp_key)::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF p_capacity_type = 'listing_slot' THEN
    IF p_capacity_value IS NULL OR p_capacity_value <= 0 OR p_capacity_value <> trunc(p_capacity_value) THEN
      RAISE EXCEPTION 'grant_addon_capacity: kapasitas listing_slot harus bilangan bulat > 0' USING ERRCODE = '23514';
    END IF;
    INSERT INTO public.commercial_entitlements
      (user_id, organization_id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at,
       historical_source, source_order_id, source_payment_transaction_id)
    VALUES
      (p_user_id, p_organization_id, p_addon_code || ':' || p_capacity_type, p_capacity_value, 'active', now(), NULL,
       jsonb_build_object('addon_id', p_addon_id, 'addon_code', p_addon_code, 'capacity_type', p_capacity_type),
       p_order_id, p_payment_transaction_id)
    RETURNING id INTO v_entitlement_id;
    INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, valid_from, valid_to)
    VALUES (v_entitlement_id, p_capacity_type, p_capacity_value, now(), NULL);
    RETURN QUERY SELECT ('commercial_entitlements:' || v_entitlement_id::text)::TEXT, v_entitlement_id;
    RETURN;
  END IF;

  INSERT INTO public.commercial_entitlements
    (user_id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at,
     historical_source, source_order_id, source_payment_transaction_id)
  VALUES
    (p_user_id, p_addon_code || ':' || p_capacity_type, p_capacity_value, 'active', now(), p_ends_at,
     jsonb_build_object('addon_id', p_addon_id, 'addon_code', p_addon_code, 'capacity_type', p_capacity_type),
     p_order_id, p_payment_transaction_id)
  RETURNING id INTO v_entitlement_id;

  INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, valid_from, valid_to)
  VALUES (v_entitlement_id, p_capacity_type, COALESCE(p_capacity_value, 0), now(), p_ends_at)
  RETURNING id INTO v_capacity_id;

  INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
  VALUES (v_capacity_id, p_user_id, 'active', COALESCE(p_capacity_value, 0))
  RETURNING * INTO v_pool;

  INSERT INTO public.quota_allocations (operational_quota_pool_id, beneficiary_user_id, allocated_quantity, status, effective_from, effective_to)
  VALUES (v_pool.id, p_user_id, COALESCE(p_capacity_value, 0), 'active', now(), p_ends_at);

  RETURN QUERY SELECT ('commercial_entitlements:' || v_entitlement_id::text)::TEXT, v_entitlement_id;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_addon_capacity(uuid, varchar, numeric, varchar, uuid, timestamptz, text, uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- fulfill_commercial_order: sama seperti 0081, ditambah meneruskan organisasi pesanan ke grant_addon_capacity.
CREATE OR REPLACE FUNCTION public.fulfill_commercial_order(p_payment_transaction_id uuid)
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
  v_ends_at      TIMESTAMPTZ;
  v_outcome_refs TEXT[] := ARRAY[]::TEXT[];
  v_entitlement_ids UUID[] := ARRAY[]::UUID[];
  v_grant        RECORD;
  v_cap          RECORD;
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
    RETURN v_fulfillment;
  END IF;

  SELECT * INTO v_order FROM public.commercial_orders WHERE id = v_payment.commercial_order_id;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: commercial_order sumber tidak ditemukan';
  END IF;

  IF v_order.addon_id IS NULL THEN
    RAISE EXCEPTION 'fulfill_commercial_order: order ini bukan addon-sourced order - fulfillment subscription belum dibangun di batch ini (lihat catatan scope migration 0079)';
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

  SELECT * INTO v_grant FROM public.grant_addon_capacity(
    v_order.user_id, v_addon.capacity_type, v_addon.capacity_value, v_addon.code, v_addon.id,
    v_ends_at, v_key, v_order.id, p_payment_transaction_id, v_order.organization_id
  );
  v_outcome_refs := array_append(v_outcome_refs, v_grant.outcome_reference);
  IF v_grant.entitlement_id IS NOT NULL THEN
    v_entitlement_ids := array_append(v_entitlement_ids, v_grant.entitlement_id);
  END IF;

  FOR v_cap IN
    SELECT * FROM jsonb_to_recordset(COALESCE(v_addon.additional_capacities, '[]'::jsonb))
      AS x(capacity_type VARCHAR(100), capacity_value NUMERIC(18,2))
  LOOP
    SELECT * INTO v_grant FROM public.grant_addon_capacity(
      v_order.user_id, v_cap.capacity_type, v_cap.capacity_value, v_addon.code, v_addon.id,
      v_ends_at, v_key, v_order.id, p_payment_transaction_id, v_order.organization_id
    );
    v_outcome_refs := array_append(v_outcome_refs, v_grant.outcome_reference);
    IF v_grant.entitlement_id IS NOT NULL THEN
      v_entitlement_ids := array_append(v_entitlement_ids, v_grant.entitlement_id);
    END IF;
  END LOOP;

  INSERT INTO public.commercial_fulfillments
    (payment_transaction_id, commercial_order_id, fulfillment_key, fulfillment_status, outcome_reference, idempotency_key, fulfilled_at)
  VALUES
    (p_payment_transaction_id, v_order.id, v_key, 'fulfilled', array_to_string(v_outcome_refs, ';'), v_key, now())
  RETURNING * INTO v_fulfillment;

  IF array_length(v_entitlement_ids, 1) > 0 THEN
    UPDATE public.commercial_entitlements
    SET source_fulfillment_id = v_fulfillment.id
    WHERE id = ANY(v_entitlement_ids);
  END IF;

  UPDATE public.commercial_orders
  SET status = 'confirmed', confirmed_at = now(), updated_at = now()
  WHERE id = v_order.id;

  PERFORM public.log_audit_event(
    p_action      := 'm14.commercial_fulfillment.fulfill',
    p_entity_type := 'commercial_fulfillments',
    p_entity_id   := v_fulfillment.id,
    p_new_value   := jsonb_build_object('payment_transaction_id', p_payment_transaction_id, 'commercial_order_id', v_order.id, 'outcome_references', v_outcome_refs)
  );

  RETURN v_fulfillment;
END;
$$;

-- ═══ 3. Penjadwalan kedaluwarsa jatah listing ═══
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
DO $cron$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire-listing-slots';
  PERFORM cron.schedule('expire-listing-slots', '0 * * * *', 'SELECT public.expire_listing_slots()');
END
$cron$;
