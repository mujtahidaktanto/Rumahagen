-- 0169_m14_addon_fulfillment_notification.sql
-- Celah ditemukan lewat testing webhook Midtrans live (2026-10-01): fulfill_commercial_order (0142)
-- hanya memanggil notify_user() di cabang langganan Pro (IF v_sub_id IS NOT NULL) — cabang addon
-- (refresh listing, slot listing, dll.) tidak pernah memberi notifikasi pembeli sejak fitur ini
-- dibuat (0079/0081/0141/0142). Fix: tambah notify_user() di cabang addon, pola sama seperti
-- langganan — hanya CREATE OR REPLACE ulang fulfill_commercial_order (0142), tidak ada perubahan
-- skema. Body fungsi identik dengan 0142 kecuali blok notifikasi addon yang ditambahkan.

CREATE OR REPLACE FUNCTION public.fulfill_commercial_order(p_payment_transaction_id uuid)
RETURNS public.commercial_fulfillments
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment      public.payment_transactions;
  v_order        public.commercial_orders;
  v_addon        public.addons;
  v_plan         public.subscription_plans;
  v_fulfillment  public.commercial_fulfillments;
  v_key          TEXT;
  v_ends_at      TIMESTAMPTZ;
  v_prev_end     TIMESTAMPTZ;
  v_sub_id       UUID;
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

  IF v_order.subscription_plan_id IS NOT NULL THEN
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = v_order.subscription_plan_id;
    IF v_plan.id IS NULL THEN
      RAISE EXCEPTION 'fulfill_commercial_order: paket langganan sumber order tidak ditemukan';
    END IF;
    -- Waktu tersisa langganan aktif sejenis (pemilik sama) tidak hilang: masa baru ditumpuk setelahnya. Awal siklus kuota Pro = sekarang (reset).
    SELECT max(s.ends_at) INTO v_prev_end
      FROM public.subscriptions s
      WHERE s.product_code = v_plan.code AND s.status = 'active' AND s.ends_at IS NOT NULL AND s.ends_at > now()
        AND ((v_order.organization_id IS NOT NULL AND s.organization_id = v_order.organization_id)
             OR (v_order.organization_id IS NULL AND s.user_id = v_order.user_id AND s.organization_id IS NULL));
    v_ends_at := GREATEST(now(), COALESCE(v_prev_end, now())) + make_interval(months => v_plan.duration_months);
    INSERT INTO public.subscriptions (user_id, organization_id, product_code, status, starts_at, ends_at, historical_purchase_snapshot)
    VALUES (CASE WHEN v_order.organization_id IS NULL THEN v_order.user_id ELSE NULL END, v_order.organization_id, v_plan.code, 'active', now(), v_ends_at,
            COALESCE(v_order.commercial_snapshot, '{}'::jsonb) || jsonb_build_object('order_id', v_order.id, 'buyer_user_id', v_order.user_id))
    RETURNING id INTO v_sub_id;
    v_outcome_refs := array_append(v_outcome_refs, 'subscriptions:' || v_sub_id::text);
  ELSE
    IF v_order.addon_id IS NULL THEN
      RAISE EXCEPTION 'fulfill_commercial_order: order ini bukan pembelian addon atau paket langganan';
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
  END IF;

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
  SET status = 'confirmed', confirmed_at = now(), updated_at = now(), subscription_id = COALESCE(v_sub_id, subscription_id)
  WHERE id = v_order.id;

  IF v_sub_id IS NOT NULL THEN
    PERFORM public.notify_user(v_order.user_id, 'lainnya', 'Langganan ' || v_plan.name || ' aktif',
      'Langganan ' || v_plan.name || CASE WHEN v_order.organization_id IS NULL THEN '' ELSE ' untuk organisasi' END || ' aktif sampai ' ||
      to_char(v_ends_at AT TIME ZONE 'Asia/Jakarta', 'DD-MM-YYYY') || '. Kuota Pro penerbitan listing sudah tersedia.', 'subscription', v_sub_id);
  ELSIF v_order.user_id IS NOT NULL THEN
    -- BARU (0169): cabang addon sebelumnya tidak memberi notifikasi sama sekali (celah ditemukan
    -- lewat testing live) — pembeli langganan dapat notif, pembeli addon tidak. user_id bisa NULL
    -- untuk addon organisasi (grant_addon_capacity men-skip user_id saat organization_id terisi).
    PERFORM public.notify_user(v_order.user_id, 'lainnya', 'Pembelian ' || v_addon.name || ' berhasil',
      'Pembelian "' || v_addon.name || '" berhasil diproses. Manfaatnya sudah tersedia.', 'addon', v_addon.id);
  END IF;

  PERFORM public.log_audit_event(
    p_action      := 'm14.commercial_fulfillment.fulfill',
    p_entity_type := 'commercial_fulfillments',
    p_entity_id   := v_fulfillment.id,
    p_new_value   := jsonb_build_object('payment_transaction_id', p_payment_transaction_id, 'commercial_order_id', v_order.id, 'outcome_references', v_outcome_refs)
  );

  RETURN v_fulfillment;
END;
$$;
