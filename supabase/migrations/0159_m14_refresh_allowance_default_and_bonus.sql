-- 0159_m14_refresh_allowance_default_and_bonus.sql
-- Jatah Refresh Listing (keputusan pemilik produk 2026-09-26):
--   * SEMUA Agent otomatis punya jatah GRATIS harian (bawaan 5) yang reset tiap hari WIB. Superadmin mengubah angka bawaan (system_configs 'refresh_allowance.default_daily')
--     dan memberi BONUS harian per orang (mis. hadiah ulang tahun +10, masa berlaku opsional).
--   * Paket refresh dari ADD-ON (pembelian) = SALDO: tanpa masa berlaku, tanpa reset harian, tersimpan sampai habis.
--   * Urutan pemakaian: (1) gratis harian, (2) bonus, (3) saldo add-on. Gratis dan bonus sama-sama reset harian, jadi cukup dihitung sebagai jatah harian (gratis = `default_daily`
--     pemakaian pertama, sisanya bonus); saldo add-on baru dipakai setelah jatah harian hari itu habis (add-on tertua lebih dulu).
--
-- Masalah sebelumnya: consume_refresh_allowance() hanya mengizinkan Agent yang punya "kolam kuota" (operational_quota_pools), dan di DB live 0 Agent punya kolam (tidak ada pemberian otomatis),
-- sehingga SEMUA refresh ditolak dengan pesan menyesatkan "kuota habis". Kolam dari add-on juga punya daily_refresh_allowance NULL sehingga `used >= NULL` tidak pernah benar (tak terbatas).
--
-- Klasifikasi kolam Agent bertipe capacity 'listing_refresh' menurut commercial_entitlements.entitlement_type:
--   'listing_refresh_allowance' (configure_refresh_allowance, tambahan tetap per Agent) dan 'refresh_bonus' (grant_refresh_bonus) -> jatah HARIAN (nilai = COALESCE(daily_refresh_allowance, granted_quantity),
--        berlaku selama valid_from <= now < valid_to atau valid_to NULL);
--   '<kode_addon>:listing_refresh' (add-on) -> SALDO (granted_quantity dikurangi seluruh quota_usage kolam itu sepanjang waktu); valid_to diabaikan dan grant_addon_capacity kini selalu menyimpan
--        NULL (tanpa masa berlaku) untuk listing_refresh.
-- Kolam dasar (jatah 0) dibuat malas saat refresh pertama sebagai penampung catatan pemakaian harian; tidak perlu mengisi Agent lama.
--
-- Baru: refresh_default_allowance(), refresh_allowance_state(uuid) (internal), ensure_refresh_base_pool(uuid) (internal), my_refresh_allowance() (Agent), grant_refresh_bonus(), revoke_refresh_bonus(),
-- admin_refresh_allowance() (Superadmin). Diubah: consume_refresh_allowance, refresh_listing (alasan baru 'agent_refresh_allowance_none' bila jatah harian 0 dan saldo 0), agent_statistics_summary
-- (blok quota), grant_addon_capacity (listing_refresh tanpa masa berlaku).
-- Rollback: kembalikan fungsi yang diubah ke 0020/0081/0125, DROP fungsi baru dan trigger validasi, hapus baris system_configs 'refresh_allowance.default_daily'.

-- ═══ 1. Konfigurasi bawaan + validasi ═══
INSERT INTO public.system_configs (config_key, config_value)
VALUES ('refresh_allowance.default_daily', '5')
ON CONFLICT (config_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.validate_refresh_allowance_config()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.config_key NOT LIKE 'refresh\_allowance.%' THEN
    RETURN NEW;
  END IF;
  IF NEW.config_key <> 'refresh_allowance.default_daily' THEN
    RAISE EXCEPTION 'system_configs: kunci % tidak dikenal', NEW.config_key USING ERRCODE = '23514';
  END IF;
  IF NEW.config_value IS NULL OR NEW.config_value !~ '^[0-9]{1,3}$' THEN
    RAISE EXCEPTION 'system_configs: % harus bilangan bulat 0-999', NEW.config_key USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_refresh_allowance_config ON public.system_configs;
CREATE TRIGGER trg_validate_refresh_allowance_config
  BEFORE INSERT OR UPDATE ON public.system_configs
  FOR EACH ROW EXECUTE FUNCTION public.validate_refresh_allowance_config();

CREATE OR REPLACE FUNCTION public.refresh_default_allowance()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT NULLIF(config_value, '')::int FROM public.system_configs WHERE config_key = 'refresh_allowance.default_daily'), 5);
$$;

-- ═══ 2. Keadaan jatah (internal) ═══
--   allowance = jatah harian efektif (gratis + bonus), used_today = pemakaian harian hari ini (kolam gratis/bonus), stock_remaining = saldo add-on tersisa.
CREATE OR REPLACE FUNCTION public.refresh_allowance_state(p_agent_id uuid)
RETURNS TABLE (default_daily integer, extra_daily integer, allowance integer, used_today integer, stock_remaining integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now   timestamptz := now();
  v_day   date := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_def   integer := public.refresh_default_allowance();
  v_extra integer;
  v_used  integer;
  v_stock integer;
BEGIN
  SELECT COALESCE(sum(COALESCE(qc.daily_refresh_allowance, qc.granted_quantity::integer)), 0)::integer
    INTO v_extra
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE oqp.user_id = p_agent_id
    AND qc.capacity_type = 'listing_refresh'
    AND oqp.pool_status = 'active'
    AND ce.lifecycle_status = 'active'
    AND ce.entitlement_type IN ('listing_refresh_allowance', 'refresh_bonus')
    AND (qc.valid_from IS NULL OR qc.valid_from <= v_now)
    AND (qc.valid_to IS NULL OR qc.valid_to > v_now);

  SELECT count(*)::integer INTO v_used
  FROM public.quota_usage qu
  JOIN public.operational_quota_pools p ON p.id = qu.operational_quota_pool_id
  JOIN public.quota_capacities qc ON qc.id = p.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE p.user_id = p_agent_id
    AND qu.consuming_resource_type = 'listing_refresh'
    AND ce.entitlement_type IN ('listing_refresh_allowance', 'refresh_bonus')
    AND (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date = v_day;

  SELECT COALESCE(sum(GREATEST(qc.granted_quantity - COALESCE((SELECT sum(qu.consumed_quantity) FROM public.quota_usage qu WHERE qu.operational_quota_pool_id = oqp.id), 0), 0)), 0)::integer
    INTO v_stock
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE oqp.user_id = p_agent_id
    AND qc.capacity_type = 'listing_refresh'
    AND oqp.pool_status = 'active'
    AND ce.lifecycle_status = 'active'
    AND ce.entitlement_type LIKE '%:listing\_refresh';

  RETURN QUERY SELECT v_def, v_extra, v_def + v_extra, v_used, v_stock;
END;
$$;

-- Kolam dasar: penampung catatan pemakaian harian untuk Agent yang belum punya kolam sama sekali. Memakai entitlement 'listing_refresh_allowance' yang sama dengan configure_refresh_allowance().
CREATE OR REPLACE FUNCTION public.ensure_refresh_base_pool(p_agent_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement uuid;
  v_capacity    uuid;
  v_pool        uuid;
BEGIN
  SELECT oqp.id INTO v_pool
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE oqp.user_id = p_agent_id AND qc.capacity_type = 'listing_refresh' AND oqp.pool_status = 'active' AND ce.entitlement_type = 'listing_refresh_allowance'
  ORDER BY oqp.created_at LIMIT 1;
  IF v_pool IS NOT NULL THEN RETURN v_pool; END IF;

  SELECT id INTO v_entitlement FROM public.commercial_entitlements
  WHERE user_id = p_agent_id AND entitlement_type = 'listing_refresh_allowance' AND lifecycle_status = 'active' LIMIT 1;
  IF v_entitlement IS NULL THEN
    INSERT INTO public.commercial_entitlements (user_id, entitlement_type, lifecycle_status, starts_at)
    VALUES (p_agent_id, 'listing_refresh_allowance', 'active', now())
    RETURNING id INTO v_entitlement;
  END IF;

  SELECT id INTO v_capacity FROM public.quota_capacities WHERE entitlement_id = v_entitlement AND capacity_type = 'listing_refresh' LIMIT 1;
  IF v_capacity IS NULL THEN
    INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, daily_refresh_allowance)
    VALUES (v_entitlement, 'listing_refresh', 0, 0)
    RETURNING id INTO v_capacity;
  END IF;

  INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
  VALUES (v_capacity, p_agent_id, 'active', 0)
  RETURNING id INTO v_pool;
  RETURN v_pool;
END;
$$;

-- ═══ 3. consume_refresh_allowance: harian dulu (gratis lalu bonus), baru saldo add-on ═══
-- remaining_today yang dikembalikan = sisa jatah harian + sisa saldo add-on setelah pemakaian ini (total yang masih bisa dipakai).
CREATE OR REPLACE FUNCTION public.consume_refresh_allowance(p_agent_id uuid, p_resource_reference text, p_idempotency_key text DEFAULT NULL)
RETURNS TABLE (allowed boolean, remaining_today integer, pool_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base  uuid;
  v_addon uuid;
  v_state record;
BEGIN
  IF NOT public.has_permission('m14.refresh_allowance_entitlement.consume', p_agent_id) THEN
    RAISE EXCEPTION 'consume_refresh_allowance: butuh permission m14.refresh_allowance_entitlement.consume (D13-01)';
  END IF;

  -- Serialkan per Agent agar dua refresh bersamaan tidak melampaui jatah.
  PERFORM pg_advisory_xact_lock(hashtext('refresh_allowance:' || p_agent_id::text));

  v_base := public.ensure_refresh_base_pool(p_agent_id);

  -- Replay idempotency: kunci yang sama pernah sukses -> hasil identik tanpa mencatat lagi.
  IF p_idempotency_key IS NOT NULL AND EXISTS (SELECT 1 FROM public.quota_usage WHERE idempotency_key = p_idempotency_key) THEN
    SELECT * INTO v_state FROM public.refresh_allowance_state(p_agent_id);
    RETURN QUERY SELECT true, GREATEST(v_state.allowance - v_state.used_today, 0) + v_state.stock_remaining, v_base;
    RETURN;
  END IF;

  SELECT * INTO v_state FROM public.refresh_allowance_state(p_agent_id);

  IF v_state.used_today < v_state.allowance THEN
    INSERT INTO public.quota_usage (operational_quota_pool_id, consuming_resource_type, consuming_resource_reference, consumed_quantity, idempotency_key)
    VALUES (v_base, 'listing_refresh', p_resource_reference, 1, p_idempotency_key);
    RETURN QUERY SELECT true, (v_state.allowance - v_state.used_today - 1) + v_state.stock_remaining, v_base;
    RETURN;
  END IF;

  -- Jatah harian habis: pakai saldo add-on (yang paling lama dibeli lebih dulu).
  SELECT oqp.id INTO v_addon
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE oqp.user_id = p_agent_id AND qc.capacity_type = 'listing_refresh' AND oqp.pool_status = 'active' AND ce.lifecycle_status = 'active'
    AND ce.entitlement_type LIKE '%:listing\_refresh'
    AND qc.granted_quantity - COALESCE((SELECT sum(qu.consumed_quantity) FROM public.quota_usage qu WHERE qu.operational_quota_pool_id = oqp.id), 0) >= 1
  ORDER BY oqp.created_at, oqp.id
  LIMIT 1;

  IF v_addon IS NULL THEN
    RETURN QUERY SELECT false, 0, v_base;
    RETURN;
  END IF;

  INSERT INTO public.quota_usage (operational_quota_pool_id, consuming_resource_type, consuming_resource_reference, consumed_quantity, idempotency_key)
  VALUES (v_addon, 'listing_refresh', p_resource_reference, 1, p_idempotency_key);
  RETURN QUERY SELECT true, v_state.stock_remaining - 1, v_addon;
END;
$$;

-- ═══ 4. refresh_listing: alasan terpisah bila tidak ada jatah harian maupun saldo ═══
CREATE OR REPLACE FUNCTION public.refresh_listing(p_listing_id uuid)
RETURNS TABLE (success boolean, reason text, remaining_today integer, refreshed_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing          public.listings;
  v_operational_day  date;
  v_last_refresh_day date;
  v_state            record;
  v_consume          record;
BEGIN
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;

  IF v_listing.id IS NULL THEN
    RETURN QUERY SELECT false, 'listing_not_found', NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  IF NOT public.has_permission('m03.listing.refresh', v_listing.agent_id) THEN
    RAISE EXCEPTION 'refresh_listing: tidak punya permission m03.listing.refresh untuk listing %', p_listing_id;
  END IF;

  IF v_listing.status <> 'published' THEN
    RETURN QUERY SELECT false, 'listing_not_published', NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  v_operational_day := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  IF v_listing.last_refreshed_at IS NOT NULL THEN
    v_last_refresh_day := (v_listing.last_refreshed_at AT TIME ZONE 'Asia/Jakarta')::date;
    IF v_last_refresh_day = v_operational_day THEN
      RETURN QUERY SELECT false, 'listing_already_refreshed_today', NULL::integer, v_listing.last_refreshed_at;
      RETURN;
    END IF;
  END IF;

  SELECT * INTO v_state FROM public.refresh_allowance_state(v_listing.agent_id);
  IF v_state.allowance <= 0 AND v_state.stock_remaining <= 0 THEN
    RETURN QUERY SELECT false, 'agent_refresh_allowance_none', 0, NULL::timestamptz;
    RETURN;
  END IF;

  SELECT * INTO v_consume FROM public.consume_refresh_allowance(v_listing.agent_id, p_listing_id::text);
  IF NOT v_consume.allowed THEN
    RETURN QUERY SELECT false, 'agent_daily_quota_exhausted', v_consume.remaining_today, NULL::timestamptz;
    RETURN;
  END IF;

  PERFORM set_config('rumahagen.refresh_in_progress', 'true', true);
  UPDATE public.listings SET last_refreshed_at = now(), updated_at = now() WHERE id = p_listing_id;
  PERFORM set_config('rumahagen.refresh_in_progress', 'false', true);

  PERFORM public.log_audit_event(
    p_action          := 'm03.listing.refresh',
    p_entity_type     := 'listings',
    p_entity_id       := p_listing_id,
    p_organization_id := v_listing.organization_id,
    p_new_value       := jsonb_build_object('remaining_today', v_consume.remaining_today)
  );

  RETURN QUERY SELECT true, 'ok', v_consume.remaining_today, now();
END;
$$;

-- ═══ 5. Untuk Agent: jatah saya ═══
CREATE OR REPLACE FUNCTION public.my_refresh_allowance()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'my_refresh_allowance: login diperlukan' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_state FROM public.refresh_allowance_state(auth.uid());
  RETURN jsonb_build_object(
    'default_daily', v_state.default_daily,
    'extra_daily', v_state.extra_daily,
    'allowance', v_state.allowance,
    'used_today', v_state.used_today,
    'daily_remaining', GREATEST(v_state.allowance - v_state.used_today, 0),
    'stock_remaining', v_state.stock_remaining,
    'remaining_today', GREATEST(v_state.allowance - v_state.used_today, 0) + v_state.stock_remaining,
    'resets_at', (((now() AT TIME ZONE 'Asia/Jakarta')::date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
  );
END;
$$;

-- ═══ 6. Untuk Superadmin: tambahan harian per orang ═══
CREATE OR REPLACE FUNCTION public.grant_refresh_bonus(p_agent_id uuid, p_extra_daily integer, p_valid_until date DEFAULT NULL, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ends        timestamptz;
  v_entitlement uuid;
  v_capacity    uuid;
  v_pool        uuid;
BEGIN
  IF NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'grant_refresh_bonus: hanya Superadmin' USING ERRCODE = '42501';
  END IF;
  IF p_extra_daily IS NULL OR p_extra_daily < 1 OR p_extra_daily > 1000 THEN
    RAISE EXCEPTION 'grant_refresh_bonus: tambahan harian harus 1-1000' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_agent_id) THEN
    RAISE EXCEPTION 'grant_refresh_bonus: pengguna tidak ditemukan' USING ERRCODE = '23503';
  END IF;
  IF p_valid_until IS NOT NULL THEN
    IF p_valid_until < (now() AT TIME ZONE 'Asia/Jakarta')::date THEN
      RAISE EXCEPTION 'grant_refresh_bonus: tanggal berakhir sudah lewat' USING ERRCODE = '23514';
    END IF;
    v_ends := ((p_valid_until + 1)::timestamp AT TIME ZONE 'Asia/Jakarta'); -- berlaku sampai akhir tanggal itu (WIB)
  END IF;

  INSERT INTO public.commercial_entitlements (user_id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at, historical_source)
  VALUES (p_agent_id, 'refresh_bonus', p_extra_daily, 'active', now(), v_ends,
          jsonb_build_object('reason', NULLIF(btrim(COALESCE(p_reason, '')), ''), 'granted_by', auth.uid(), 'valid_until', p_valid_until))
  RETURNING id INTO v_entitlement;

  INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, daily_refresh_allowance, valid_from, valid_to)
  VALUES (v_entitlement, 'listing_refresh', p_extra_daily, p_extra_daily, now(), v_ends)
  RETURNING id INTO v_capacity;

  INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
  VALUES (v_capacity, p_agent_id, 'active', p_extra_daily)
  RETURNING id INTO v_pool;

  PERFORM public.log_audit_event(
    p_action      := 'm14.refresh_allowance_entitlement.configure',
    p_entity_type := 'operational_quota_pools',
    p_entity_id   := v_pool,
    p_new_value   := jsonb_build_object('agent_id', p_agent_id, 'extra_daily', p_extra_daily, 'valid_until', p_valid_until, 'reason', NULLIF(btrim(COALESCE(p_reason, '')), ''))
  );

  RETURN jsonb_build_object('pool_id', v_pool, 'agent_id', p_agent_id, 'extra_daily', p_extra_daily, 'valid_until', p_valid_until);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_refresh_bonus(p_pool_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity    uuid;
  v_entitlement uuid;
  v_agent       uuid;
BEGIN
  IF NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'revoke_refresh_bonus: hanya Superadmin' USING ERRCODE = '42501';
  END IF;
  SELECT qc.id, ce.id, oqp.user_id INTO v_capacity, v_entitlement, v_agent
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
  WHERE oqp.id = p_pool_id AND ce.entitlement_type = 'refresh_bonus' AND oqp.pool_status = 'active';
  IF v_capacity IS NULL THEN
    RAISE EXCEPTION 'revoke_refresh_bonus: bonus tidak ditemukan atau sudah dicabut' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.quota_capacities SET valid_to = now(), updated_at = now() WHERE id = v_capacity;
  UPDATE public.operational_quota_pools SET pool_status = 'closed', updated_at = now() WHERE id = p_pool_id;
  UPDATE public.commercial_entitlements SET lifecycle_status = 'revoked', updated_at = now() WHERE id = v_entitlement;

  PERFORM public.log_audit_event(
    p_action      := 'm14.refresh_allowance_entitlement.configure',
    p_entity_type := 'operational_quota_pools',
    p_entity_id   := p_pool_id,
    p_new_value   := jsonb_build_object('agent_id', v_agent, 'revoked', true)
  );
  RETURN jsonb_build_object('pool_id', p_pool_id, 'revoked', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_refresh_allowance(p_agent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state record;
BEGIN
  IF NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'admin_refresh_allowance: hanya Superadmin' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_state FROM public.refresh_allowance_state(p_agent_id);
  RETURN jsonb_build_object(
    'default_daily', v_state.default_daily,
    'extra_daily', v_state.extra_daily,
    'allowance', v_state.allowance,
    'used_today', v_state.used_today,
    'stock_remaining', v_state.stock_remaining,
    'bonuses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'pool_id', oqp.id, 'extra_daily', COALESCE(qc.daily_refresh_allowance, qc.granted_quantity::integer),
               'valid_from', qc.valid_from, 'valid_to', qc.valid_to, 'pool_status', oqp.pool_status,
               'reason', ce.historical_source->>'reason', 'type', ce.entitlement_type) ORDER BY qc.valid_from DESC)
      FROM public.operational_quota_pools oqp
      JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
      JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
      WHERE oqp.user_id = p_agent_id AND qc.capacity_type = 'listing_refresh' AND ce.entitlement_type = 'refresh_bonus'), '[]'::jsonb)
  );
END;
$$;

-- ═══ 7. grant_addon_capacity: paket refresh dari add-on tanpa masa berlaku (saldo tersimpan sampai habis) ═══
CREATE OR REPLACE FUNCTION public.grant_addon_capacity(p_user_id uuid, p_capacity_type character varying, p_capacity_value numeric, p_addon_code character varying, p_addon_id uuid, p_ends_at timestamp with time zone, p_fulfillment_key text, p_order_id uuid, p_payment_transaction_id uuid, p_organization_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(outcome_reference text, entitlement_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_entitlement_id UUID;
  v_capacity_id    UUID;
  v_pool           public.operational_quota_pools;
  v_lp_key         TEXT;
  v_ends           timestamptz := p_ends_at;
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

  -- Paket refresh listing = saldo: tanpa masa berlaku dan tanpa reset harian (keputusan pemilik produk 2026-09-26).
  IF p_capacity_type = 'listing_refresh' THEN
    v_ends := NULL;
  END IF;

  INSERT INTO public.commercial_entitlements
    (user_id, entitlement_type, capacity_value, lifecycle_status, starts_at, ends_at,
     historical_source, source_order_id, source_payment_transaction_id)
  VALUES
    (p_user_id, p_addon_code || ':' || p_capacity_type, p_capacity_value, 'active', now(), v_ends,
     jsonb_build_object('addon_id', p_addon_id, 'addon_code', p_addon_code, 'capacity_type', p_capacity_type),
     p_order_id, p_payment_transaction_id)
  RETURNING id INTO v_entitlement_id;

  INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, valid_from, valid_to)
  VALUES (v_entitlement_id, p_capacity_type, COALESCE(p_capacity_value, 0), now(), v_ends)
  RETURNING id INTO v_capacity_id;

  INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
  VALUES (v_capacity_id, p_user_id, 'active', COALESCE(p_capacity_value, 0))
  RETURNING * INTO v_pool;

  INSERT INTO public.quota_allocations (operational_quota_pool_id, beneficiary_user_id, allocated_quantity, status, effective_from, effective_to)
  VALUES (v_pool.id, p_user_id, COALESCE(p_capacity_value, 0), 'active', now(), v_ends);

  RETURN QUERY SELECT ('commercial_entitlements:' || v_entitlement_id::text)::TEXT, v_entitlement_id;
END;
$function$;

-- ═══ 8. agent_statistics_summary: blok quota memakai jatah efektif (kunci lama tetap; ditambah default_daily, extra_daily, stock_remaining) ═══
CREATE OR REPLACE FUNCTION public.agent_statistics_summary(p_from date, p_to date, p_organization_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_ids     UUID[];
  v_own     BOOLEAN := (p_organization_id IS NULL);
  v_start   TIMESTAMPTZ;
  v_end     TIMESTAMPTZ;
  v_today   DATE := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_result  JSONB;
  v_state   RECORD;
BEGIN
  v_ids := public._agent_stats_scope(p_organization_id);
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 365 THEN
    RAISE EXCEPTION 'agent_statistics_summary: rentang tanggal tidak valid (maksimal 366 hari)' USING ERRCODE = '22023';
  END IF;
  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  v_result := jsonb_build_object(
    'listing_status', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT l.status, count(*) AS n FROM public.listings l WHERE l.agent_id = ANY(v_ids) GROUP BY l.status) s), '{}'::jsonb),
    'lead_pipeline', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT ll.status, count(*) AS n FROM public.listing_leads ll
        WHERE ll.agent_id = ANY(v_ids) AND ll.created_at >= v_start AND ll.created_at < v_end GROUP BY ll.status) s), '{}'::jsonb),
    'active_listings', (SELECT count(*) FROM public.listings l WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'),
    'stale_listings', (SELECT count(*) FROM public.listings l
        WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'
          AND COALESCE(l.last_refreshed_at, l.published_at, l.created_at) < now() - INTERVAL '7 days'),
    'top_listings', COALESCE((SELECT jsonb_agg(jsonb_build_object('listing_id', x.id, 'title', x.title, 'status', x.status, 'views', x.views, 'leads', x.leads) ORDER BY x.views DESC, x.leads DESC)
      FROM (SELECT l.id, l.title, l.status,
                   (SELECT count(*) FROM public.listing_views v WHERE v.listing_id = l.id AND v.viewed_at >= v_start AND v.viewed_at < v_end) AS views,
                   (SELECT count(*) FROM public.listing_leads ll WHERE ll.listing_id = l.id AND ll.created_at >= v_start AND ll.created_at < v_end) AS leads
            FROM public.listings l WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'
            ORDER BY views DESC, leads DESC LIMIT 5) x
      WHERE x.views > 0 OR x.leads > 0), '[]'::jsonb)
  );

  IF v_own THEN
    SELECT * INTO v_state FROM public.refresh_allowance_state(auth.uid());
    v_result := v_result || jsonb_build_object(
      'quota', jsonb_build_object('has_pool', (v_state.allowance > 0 OR v_state.stock_remaining > 0), 'allowance', v_state.allowance, 'used_today', v_state.used_today,
                                  'default_daily', v_state.default_daily, 'extra_daily', v_state.extra_daily, 'stock_remaining', v_state.stock_remaining),
      'entitlements', COALESCE((SELECT jsonb_agg(jsonb_build_object('type', e.entitlement_type, 'capacity', e.capacity_value, 'ends_at', e.ends_at))
                                FROM public.commercial_entitlements e WHERE e.user_id = auth.uid() AND e.lifecycle_status = 'active'), '[]'::jsonb),
      'learning', jsonb_build_object(
        'courses_in_progress', (SELECT count(*) FROM public.enrollments e WHERE e.agent_id = auth.uid() AND e.status = 'in_progress'),
        'avg_progress_percent', (SELECT round(avg(e.progress_percent)) FROM public.enrollments e WHERE e.agent_id = auth.uid() AND e.status = 'in_progress'),
        'points_balance', COALESCE((SELECT a.balance_projection FROM public.learning_point_accounts a WHERE a.user_id = auth.uid()), 0),
        'certificates_total', (SELECT count(*) FROM public.certificates c WHERE c.agent_id = auth.uid()),
        'awards_active', (SELECT count(*) FROM public.award_instances ai WHERE ai.user_id = auth.uid() AND ai.status = 'active')),
      'dbr', jsonb_build_object(
        'total', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.created_at >= v_start AND d.created_at < v_end),
        'layak', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'layak' AND d.created_at >= v_start AND d.created_at < v_end),
        'perlu_review', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'perlu_review' AND d.created_at >= v_start AND d.created_at < v_end),
        'tidak_layak', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'tidak_layak' AND d.created_at >= v_start AND d.created_at < v_end),
        'saved_prospects', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.prospect_name IS NOT NULL AND d.created_at >= v_start AND d.created_at < v_end),
        'shared', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.shared_at IS NOT NULL AND d.shared_at >= v_start AND d.shared_at < v_end)));
  ELSE
    v_result := v_result || jsonb_build_object(
      'members', COALESCE((SELECT jsonb_agg(m ORDER BY (m->>'views')::int DESC) FROM (
        SELECT jsonb_build_object(
          'name', COALESCE(ap.full_name, 'Anggota'),
          'is_leader', (om.role = 'leader'),
          'is_self', (om.agent_id = auth.uid()),
          'active_listings', (SELECT count(*) FROM public.listings l WHERE l.agent_id = om.agent_id AND l.status = 'published'),
          'views', (SELECT count(*) FROM public.listing_views v JOIN public.listings l ON l.id = v.listing_id
                    WHERE l.agent_id = om.agent_id AND v.viewed_at >= v_start AND v.viewed_at < v_end),
          'leads', (SELECT count(*) FROM public.listing_leads ll WHERE ll.agent_id = om.agent_id AND ll.created_at >= v_start AND ll.created_at < v_end),
          'refresh', COALESCE((SELECT sum(qu.consumed_quantity) FROM public.quota_usage qu JOIN public.operational_quota_pools p ON p.id = qu.operational_quota_pool_id
                    WHERE p.user_id = om.agent_id AND qu.consuming_resource_type = 'listing_refresh' AND qu.usage_at >= v_start AND qu.usage_at < v_end), 0)) AS m
        FROM public.organization_members om LEFT JOIN public.agent_profiles ap ON ap.user_id = om.agent_id
        WHERE om.organization_id = p_organization_id AND om.status = 'active') mm), '[]'::jsonb));
  END IF;

  RETURN v_result;
END;
$function$;

-- ═══ 9. Hak eksekusi ═══
-- Internal (dipanggil fungsi SECURITY DEFINER lain): tidak untuk anon/authenticated.
REVOKE ALL ON FUNCTION public.refresh_default_allowance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_allowance_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_refresh_base_pool(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_refresh_allowance_config() FROM PUBLIC, anon, authenticated;
-- Untuk pengguna login (penjaga di dalam fungsi): Agent membaca jatahnya sendiri; Superadmin mengelola.
REVOKE ALL ON FUNCTION public.my_refresh_allowance() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grant_refresh_bonus(uuid, integer, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_refresh_bonus(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_refresh_allowance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_refresh_allowance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_refresh_bonus(uuid, integer, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_refresh_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_refresh_allowance(uuid) TO authenticated;
