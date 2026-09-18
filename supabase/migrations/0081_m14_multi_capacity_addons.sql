-- 0081_m14_multi_capacity_addons.sql
-- ADD-NEW — ditemukan lewat testing nyata batch REST M14 Commercial:
-- fulfill_commercial_order() (0079) hanya memproses SATU pasang
-- capacity_type/capacity_value per addon (kolom rigid `addons.capacity_type`/
-- `capacity_value`, evidenced STEP10-D). Kasus nyata (addon "10 listing
-- tambahan + 50 kuota refresh sekaligus") butuh LEBIH dari satu jenis
-- kuota per addon — skema lama tidak bisa merepresentasikannya sama
-- sekali (angka kedua cuma bisa jadi metadata deskriptif di `configuration`,
-- TIDAK PERNAH benar-benar ter-grant sebagai kuota nyata, dikonfirmasi
-- lewat testing).
--
-- KEPUTUSAN DESAIN: kolom baru GENERIK (`additional_capacities`), bukan
-- kolom kedua/ketiga bernama literal (`capacity_type_2`, dst.) — menampung
-- N kapasitas tambahan sekaligus (bukan cuma 2), dipakai ulang untuk addon
-- manapun di masa depan yang butuh kombinasi kuota apa pun. Konsisten
-- dengan pola generik yang sama dipakai di 0080 (public_identifier/
-- encrypted_secondary_key untuk BYOK multi-kredensial) — satu kolom
-- fleksibel, bukan proliferasi kolom per-kasus.
--
-- Bentuk data: array objek `[{"capacity_type": "...", "capacity_value": N}, ...]`.
-- Kapasitas PRIMER (kolom `capacity_type`/`capacity_value` yang sudah ada)
-- TETAP dipertahankan apa adanya (evidenced STEP10-D, tidak diubah) —
-- `additional_capacities` murni MENAMBAH, bukan menggantikan.

ALTER TABLE public.addons
  ADD COLUMN IF NOT EXISTS additional_capacities JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.addons.additional_capacities IS
  'ADD-NEW/0081. Kapasitas TAMBAHAN di luar capacity_type/capacity_value primer (yang itu evidenced STEP10-D, tidak diubah) — array objek {"capacity_type","capacity_value"}, diproses fulfill_commercial_order() persis seperti kapasitas primer (termasuk capacity_type=''learning_point'' kalau addon ingin menggabungkan bonus LP). Default array kosong — addon lama (single-capacity) tidak berubah perilakunya sama sekali.';

-- ── grant_addon_capacity() — helper BARU, realisasi SATU unit "grant
-- kapasitas" (dipakai berulang untuk kapasitas primer MAUPUN tambahan,
-- diekstrak dari badan fulfill_commercial_order() versi 0079 supaya tidak
-- duplikasi logika saat dipanggil N kali). Mengembalikan outcome_reference
-- (untuk digabung ke commercial_fulfillments.outcome_reference) dan
-- entitlement_id (NULL untuk cabang learning_point, yang tidak membuat
-- baris commercial_entitlements — LP punya ledger sendiri).
CREATE OR REPLACE FUNCTION public.grant_addon_capacity(
  p_user_id                 UUID,
  p_capacity_type           VARCHAR(100),
  p_capacity_value          NUMERIC(18,2),
  p_addon_code              VARCHAR(100),
  p_addon_id                UUID,
  p_ends_at                 TIMESTAMPTZ,
  p_fulfillment_key         TEXT,
  p_order_id                UUID,
  p_payment_transaction_id  UUID
)
RETURNS TABLE (outcome_reference TEXT, entitlement_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement_id UUID;
  v_capacity_id    UUID;
  v_pool           public.operational_quota_pools;
  v_lp_key         TEXT;
BEGIN
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

COMMENT ON FUNCTION public.grant_addon_capacity IS
  'ADD-NEW/0081. Satu unit "grant kapasitas dari addon" — dipanggil fulfill_commercial_order() sekali per kapasitas (primer + setiap entri additional_capacities). entitlement_type diberi suffix capacity_type (mis. "CODE:listing_refresh") supaya tidak ambigu saat satu addon punya >1 entitlement.';

-- ── fulfill_commercial_order() — DIPERLUAS (CREATE OR REPLACE, signature
-- sama) untuk memproses kapasitas primer + seluruh additional_capacities
-- dalam satu fulfillment. outcome_reference commercial_fulfillments kini
-- bisa berisi lebih dari satu referensi, digabung dengan ';' (TEXT longgar,
-- pola sama seperti url_redirects.entity_id — tidak butuh kolom baru).
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

  -- Kapasitas PRIMER (kolom rigid capacity_type/capacity_value, evidenced STEP10-D).
  SELECT * INTO v_grant FROM public.grant_addon_capacity(
    v_order.user_id, v_addon.capacity_type, v_addon.capacity_value, v_addon.code, v_addon.id,
    v_ends_at, v_key, v_order.id, p_payment_transaction_id
  );
  v_outcome_refs := array_append(v_outcome_refs, v_grant.outcome_reference);
  IF v_grant.entitlement_id IS NOT NULL THEN
    v_entitlement_ids := array_append(v_entitlement_ids, v_grant.entitlement_id);
  END IF;

  -- Kapasitas TAMBAHAN (0081) — nol atau lebih, diproses persis sama.
  FOR v_cap IN
    SELECT * FROM jsonb_to_recordset(COALESCE(v_addon.additional_capacities, '[]'::jsonb))
      AS x(capacity_type VARCHAR(100), capacity_value NUMERIC(18,2))
  LOOP
    SELECT * INTO v_grant FROM public.grant_addon_capacity(
      v_order.user_id, v_cap.capacity_type, v_cap.capacity_value, v_addon.code, v_addon.id,
      v_ends_at, v_key, v_order.id, p_payment_transaction_id
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

COMMENT ON FUNCTION public.fulfill_commercial_order IS
  'Realisasi "idempotent fulfillment" causal chain M14 (STEP11-B7 §5). DIPERLUAS 0081: memproses kapasitas primer (addons.capacity_type/capacity_value) DAN seluruh addons.additional_capacities dalam satu fulfillment, masing-masing lewat grant_addon_capacity(). Idempotent lewat idempotency_key=fulfill:<payment_transaction_id>. SCOPE MVP tetap: addon-sourced order saja.';
