-- 0142_m14_subscription_plans_purchase.sql
-- Pembelian langganan Pro (M14). Sebelumnya: tabel `subscriptions` hanya catatan instance yang dibuat staf; tidak ada katalog paket, harga, pembelian, maupun
-- fulfillment (order langganan ditolak: "pembelian langganan belum tersedia"; fulfill_commercial_order menolak order non-addon).
--
-- Model (keputusan produk: perpanjangan = pembelian baru, tidak ada mekanisme perpanjangan):
--   * `subscription_plans`: katalog paket (mis. pro_bulanan 1 bulan, pro_tahunan 12 bulan). Harga diisi staf per cakupan: `price_personal` (langganan pribadi)
--     dan `price_organization` (langganan organisasi). Paket aktif wajib punya minimal satu harga. `code` = `subscriptions.product_code` dan harus masuk
--     `listing_quota.pro_product_codes` (0140) supaya memberi kuota Pro. Kode, durasi, dan penghapusan terkunci setelah paket punya penjualan (harga tetap bisa
--     diubah; berlaku untuk pesanan baru). Dua paket awal (draft, tanpa harga) di-seed: pro_bulanan dan pro_tahunan.
--   * Order: kolom `commercial_orders.subscription_plan_id` (tidak boleh bersama addon_id). Harga, mata uang, dan snapshot dihitung server oleh trigger harga
--     (bukan klien): cakupan pribadi (organization_id NULL) memakai price_personal; cakupan organisasi memakai price_organization dan HANYA leader aktif organisasi
--     (organisasi berstatus active) yang boleh membeli. Promosi belum berlaku untuk paket langganan.
--   * Fulfillment (webhook/staf, idempoten seperti addon): membuat baris `subscriptions` aktif: starts_at = sekarang (awal siklus kuota Pro, jadi beli baru mereset
--     kuota Pro), ends_at = GREATEST(sekarang, akhir langganan aktif sejenis milik pemilik yang sama) + durasi (waktu tersisa tidak hilang saat beli lagi).
--     Langganan organisasi disimpan tanpa user_id (milik organisasi; pembeli tercatat di snapshot). Order dikaitkan ke langganan lewat subscription_id.
--     Pembeli diberi notifikasi.
-- Tabel subscription_plans baru; subscriptions dan commercial_orders kosong saat ditulis (dicek live).

-- ═══ 1. Katalog paket ═══
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                VARCHAR(100) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_]+$'),
  name                VARCHAR(200) NOT NULL,
  description         TEXT,
  duration_months     INTEGER NOT NULL CHECK (duration_months BETWEEN 1 AND 36),
  price_personal      NUMERIC(18,2) CHECK (price_personal IS NULL OR price_personal > 0),
  price_organization  NUMERIC(18,2) CHECK (price_organization IS NULL OR price_organization > 0),
  currency            CHAR(3) NOT NULL DEFAULT 'IDR',
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_active_has_price CHECK (status <> 'active' OR price_personal IS NOT NULL OR price_organization IS NOT NULL)
);
COMMENT ON TABLE public.subscription_plans IS 'Katalog paket langganan (0142). code = subscriptions.product_code. Harga per cakupan diisi staf; hanya paket aktif yang bisa dibeli.';

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscription_plans_select ON public.subscription_plans;
CREATE POLICY subscription_plans_select ON public.subscription_plans
  FOR SELECT USING (status = 'active' OR public.has_permission('m14.commercial_administration.configure'));
DROP POLICY IF EXISTS subscription_plans_manage ON public.subscription_plans;
CREATE POLICY subscription_plans_manage ON public.subscription_plans
  FOR ALL USING (public.has_permission('m14.commercial_administration.configure'))
  WITH CHECK (public.has_permission('m14.commercial_administration.configure'));

INSERT INTO public.subscription_plans (code, name, description, duration_months, status) VALUES
  ('pro_bulanan', 'Pro Bulanan', 'Kuota penerbitan listing Pro; kuota Pro reset tiap pembelian baru.', 1, 'draft'),
  ('pro_tahunan', 'Pro Tahunan', 'Kuota penerbitan listing Pro selama 12 bulan; kuota Pro reset tiap siklus bulanan.', 12, 'draft')
ON CONFLICT (code) DO NOTHING;

-- Kolom order (dipakai fungsi di bawah)
ALTER TABLE public.commercial_orders
  ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
ALTER TABLE public.commercial_orders DROP CONSTRAINT IF EXISTS commercial_orders_addon_xor_plan;
ALTER TABLE public.commercial_orders
  ADD CONSTRAINT commercial_orders_addon_xor_plan CHECK (addon_id IS NULL OR subscription_plan_id IS NULL);

CREATE OR REPLACE FUNCTION public.subscription_plan_has_sales(p_plan_id uuid, p_code text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.commercial_orders WHERE subscription_plan_id = p_plan_id)
      OR EXISTS (SELECT 1 FROM public.subscriptions WHERE product_code = p_code);
$$;
REVOKE ALL ON FUNCTION public.subscription_plan_has_sales(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_subscription_plan_terms()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.subscription_plan_has_sales(OLD.id, OLD.code) THEN
      RAISE EXCEPTION 'subscription_plans: paket yang sudah terjual tidak bisa dihapus; nonaktifkan saja' USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;
  IF (NEW.code, NEW.duration_months) IS DISTINCT FROM (OLD.code, OLD.duration_months) AND public.subscription_plan_has_sales(OLD.id, OLD.code) THEN
    RAISE EXCEPTION 'subscription_plans: kode dan durasi dikunci karena paket sudah terjual; buat paket baru untuk syarat yang berbeda' USING ERRCODE = '23514';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_subscription_plan_terms ON public.subscription_plans;
CREATE TRIGGER trg_subscription_plan_terms
  BEFORE UPDATE OR DELETE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.enforce_subscription_plan_terms();

-- ═══ 2. Order langganan ═══
CREATE OR REPLACE FUNCTION public.compute_plan_order_price(p_plan_id uuid, p_organization_id uuid, p_user_id uuid)
RETURNS TABLE (amount numeric, currency text, snapshot jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.subscription_plans;
  v_price numeric;
  v_org_status text;
BEGIN
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id;
  IF v_plan.id IS NULL OR v_plan.status <> 'active' THEN
    RAISE EXCEPTION 'commercial_orders: paket langganan tidak ditemukan atau tidak aktif' USING ERRCODE = '23514';
  END IF;
  IF p_organization_id IS NULL THEN
    v_price := v_plan.price_personal;
    IF v_price IS NULL THEN
      RAISE EXCEPTION 'commercial_orders: paket ini belum punya harga untuk langganan pribadi' USING ERRCODE = '23514';
    END IF;
  ELSE
    SELECT status INTO v_org_status FROM public.organizations WHERE id = p_organization_id;
    IF v_org_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'commercial_orders: organisasi tidak aktif sehingga tidak bisa berlangganan' USING ERRCODE = '23514';
    END IF;
    IF NOT public.is_org_leader(p_organization_id) THEN
      RAISE EXCEPTION 'commercial_orders: hanya leader organisasi yang bisa membeli langganan organisasi' USING ERRCODE = '42501';
    END IF;
    v_price := v_plan.price_organization;
    IF v_price IS NULL THEN
      RAISE EXCEPTION 'commercial_orders: paket ini belum punya harga untuk langganan organisasi' USING ERRCODE = '23514';
    END IF;
  END IF;
  amount := v_price;
  currency := trim(v_plan.currency);
  snapshot := jsonb_build_object(
    'plan', to_jsonb(v_plan),
    'scope', CASE WHEN p_organization_id IS NULL THEN 'personal' ELSE 'organization' END,
    'list_price', v_price,
    'amount', v_price,
    'buyer_user_id', p_user_id,
    'priced_at', now()
  );
  RETURN NEXT;
END;
$$;
REVOKE ALL ON FUNCTION public.compute_plan_order_price(uuid, uuid, uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.enforce_commercial_order_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  IF auth.uid() IS NULL OR public.is_service_role_request()
     OR public.has_permission('m14.commercial_administration.manage_commercial_resources') THEN
    RETURN NEW;
  END IF;
  IF NEW.subscription_plan_id IS NOT NULL THEN
    IF NEW.addon_id IS NOT NULL OR NEW.promotion_id IS NOT NULL OR NEW.subscription_id IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: order langganan tidak bisa memuat addon, promosi, atau langganan lain' USING ERRCODE = '23514';
    END IF;
    SELECT * INTO r FROM public.compute_plan_order_price(NEW.subscription_plan_id, NEW.organization_id, NEW.user_id);
    NEW.amount := r.amount;
    NEW.currency := r.currency;
    NEW.commercial_snapshot := r.snapshot;
    RETURN NEW;
  END IF;
  IF NEW.subscription_id IS NOT NULL THEN
    RAISE EXCEPTION 'commercial_orders: langganan hanya dibuat lewat pembelian paket' USING ERRCODE = '23514';
  END IF;
  IF NEW.addon_id IS NULL THEN
    RAISE EXCEPTION 'commercial_orders: order harus untuk sebuah addon atau paket langganan' USING ERRCODE = '23514';
  END IF;
  IF NEW.promotion_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.promotion_id::text, 0));
  END IF;
  SELECT * INTO r FROM public.compute_addon_order_price(NEW.addon_id, NEW.promotion_id, NEW.user_id);
  NEW.amount := r.amount;
  NEW.currency := r.currency;
  NEW.promotion_id := r.promotion_id;
  NEW.commercial_snapshot := r.snapshot;
  RETURN NEW;
END;
$$;

-- ═══ 3. Fulfillment: addon (tidak berubah dari 0141) + paket langganan ═══
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
