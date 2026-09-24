-- 0145_m14_promotion_rules.sql
-- `promotions.rule_configuration` (0071) sebelumnya tidak dievaluasi (API menolak isian tak kosong). Migration ini menetapkan modelnya dan
-- mengevaluasinya di harga order add-on (compute_addon_order_price) dan paket langganan (compute_plan_order_price), sehingga order yang membawa promosi
-- yang tidak memenuhi aturan DITOLAK (23514) dengan alasan, dan penawaran (my_*_promotion_offers) menampilkan alasannya.
--
-- Kunci yang dikenal (semuanya opsional; kunci lain ditolak CHECK). Aturan ini melengkapi eligibility_configuration (0134: peran, pembelian pertama,
-- batas pemakaian, harga minimum) dan benefit_configuration (potongan):
--   max_discount_amount   : batas atas potongan dalam Rp (> 0); potongan persen/nominal dipotong ke batas ini
--   applies_to            : 'personal' | 'organization'; kosong = keduanya. Cakupan order = organization_id kosong -> personal
--   product_codes         : daftar kode add-on / paket (addons.code, subscription_plans.code) yang boleh memakai promosi
--   days_of_week          : hari berlaku, ISO 1=Senin .. 7=Minggu, menurut waktu WIB (Asia/Jakarta)
--   time_from, time_to    : jam berlaku 'HH:MM' WIB, harus berpasangan dan time_from < time_to (tidak melewati tengah malam)
--   new_user_within_days  : hanya pengguna yang mendaftar paling lama N hari lalu (users.created_at)
-- Tabel promotions hanya berisi rule_configuration '{}' saat ditulis, jadi CHECK langsung divalidasi.

-- ═══ 1. Validasi bentuk rule_configuration ═══
CREATE OR REPLACE FUNCTION public.promotion_rules_valid(p jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  k text;
  e jsonb;
  d int[] := '{}';
  v int;
BEGIN
  BEGIN
    IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN
      RETURN FALSE;
    END IF;
    FOR k IN SELECT jsonb_object_keys(p) LOOP
      IF k NOT IN ('max_discount_amount', 'applies_to', 'product_codes', 'days_of_week', 'time_from', 'time_to', 'new_user_within_days') THEN
        RETURN FALSE;
      END IF;
    END LOOP;
    IF p ? 'max_discount_amount' THEN
      IF jsonb_typeof(p -> 'max_discount_amount') <> 'number' OR (p ->> 'max_discount_amount')::numeric <= 0 THEN
        RETURN FALSE;
      END IF;
    END IF;
    IF p ? 'applies_to' THEN
      IF jsonb_typeof(p -> 'applies_to') <> 'string' OR (p ->> 'applies_to') NOT IN ('personal', 'organization') THEN
        RETURN FALSE;
      END IF;
    END IF;
    IF p ? 'product_codes' THEN
      IF jsonb_typeof(p -> 'product_codes') <> 'array' OR jsonb_array_length(p -> 'product_codes') NOT BETWEEN 1 AND 50 THEN
        RETURN FALSE;
      END IF;
      FOR e IN SELECT * FROM jsonb_array_elements(p -> 'product_codes') LOOP
        IF jsonb_typeof(e) <> 'string' OR length(e #>> '{}') NOT BETWEEN 1 AND 100 THEN
          RETURN FALSE;
        END IF;
      END LOOP;
    END IF;
    IF p ? 'days_of_week' THEN
      IF jsonb_typeof(p -> 'days_of_week') <> 'array' OR jsonb_array_length(p -> 'days_of_week') NOT BETWEEN 1 AND 7 THEN
        RETURN FALSE;
      END IF;
      FOR e IN SELECT * FROM jsonb_array_elements(p -> 'days_of_week') LOOP
        IF jsonb_typeof(e) <> 'number' OR (e #>> '{}') !~ '^[1-7]$' THEN
          RETURN FALSE;
        END IF;
        v := (e #>> '{}')::int;
        IF v = ANY (d) THEN
          RETURN FALSE;  -- hari ganda
        END IF;
        d := d || v;
      END LOOP;
    END IF;
    IF (p ? 'time_from') <> (p ? 'time_to') THEN
      RETURN FALSE;
    END IF;
    IF p ? 'time_from' THEN
      IF jsonb_typeof(p -> 'time_from') <> 'string' OR jsonb_typeof(p -> 'time_to') <> 'string'
         OR (p ->> 'time_from') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         OR (p ->> 'time_to') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         OR (p ->> 'time_from') >= (p ->> 'time_to') THEN
        RETURN FALSE;
      END IF;
    END IF;
    IF p ? 'new_user_within_days' THEN
      IF jsonb_typeof(p -> 'new_user_within_days') <> 'number' OR (p ->> 'new_user_within_days') !~ '^[0-9]+$'
         OR (p ->> 'new_user_within_days')::numeric NOT BETWEEN 1 AND 3650 THEN
        RETURN FALSE;
      END IF;
    END IF;
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;
END;
$$;

ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_rules_valid CHECK (public.promotion_rules_valid(rule_configuration));

-- ═══ 2. Evaluasi aturan ═══
CREATE OR REPLACE FUNCTION public.promotion_rules_problem(p_promotion_id uuid, p_user_id uuid, p_scope text, p_product_code text)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
  v_now timestamp := (now() AT TIME ZONE 'Asia/Jakarta');
  v_created timestamptz;
BEGIN
  SELECT rule_configuration INTO r FROM public.promotions WHERE id = p_promotion_id;
  IF r IS NULL OR r = '{}'::jsonb THEN
    RETURN NULL;
  END IF;

  IF r ? 'applies_to' AND (r ->> 'applies_to') <> p_scope THEN
    RETURN CASE WHEN (r ->> 'applies_to') = 'personal' THEN 'promosi ini hanya untuk pembelian pribadi'
                ELSE 'promosi ini hanya untuk pembelian atas nama organisasi' END;
  END IF;

  IF r ? 'product_codes' AND (p_product_code IS NULL OR NOT ((r -> 'product_codes') ? p_product_code)) THEN
    RETURN 'promosi ini tidak berlaku untuk produk ini';
  END IF;

  IF r ? 'days_of_week' AND NOT ((r -> 'days_of_week') @> to_jsonb(extract(isodow FROM v_now)::int)) THEN
    RETURN 'promosi ini tidak berlaku pada hari ini';
  END IF;

  IF r ? 'time_from' AND NOT (to_char(v_now, 'HH24:MI') >= (r ->> 'time_from') AND to_char(v_now, 'HH24:MI') < (r ->> 'time_to')) THEN
    RETURN format('promosi ini hanya berlaku pukul %s–%s WIB', r ->> 'time_from', r ->> 'time_to');
  END IF;

  IF r ? 'new_user_within_days' THEN
    SELECT created_at INTO v_created FROM public.users WHERE id = p_user_id;
    IF v_created IS NULL OR v_created < now() - make_interval(days => (r ->> 'new_user_within_days')::int) THEN
      RETURN format('promosi ini hanya untuk pengguna baru (maksimal %s hari sejak mendaftar)', r ->> 'new_user_within_days');
    END IF;
  END IF;

  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.promotion_rules_problem(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;

-- ═══ 3. Harga setelah potongan (persen / nominal) dengan batas max_discount_amount ═══
CREATE OR REPLACE FUNCTION public.promotion_discounted_price(p_promotion_id uuid, p_price numeric)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b jsonb;
  r jsonb;
  v_pct numeric;
  v_off numeric;
  v_amount numeric := p_price;
  v_cap numeric;
BEGIN
  SELECT benefit_configuration, rule_configuration INTO b, r FROM public.promotions WHERE id = p_promotion_id;
  BEGIN
    v_pct := NULLIF(b ->> 'percent_off', '')::numeric;
    v_off := NULLIF(b ->> 'amount_off', '')::numeric;
  EXCEPTION WHEN OTHERS THEN
    v_pct := NULL; v_off := NULL;
  END;
  IF v_pct IS NOT NULL AND v_pct > 0 AND v_pct <= 100 THEN
    v_amount := round(p_price * (1 - v_pct / 100), 2);
  ELSIF v_off IS NOT NULL AND v_off > 0 THEN
    v_amount := round(p_price - v_off, 2);
  END IF;
  IF r ? 'max_discount_amount' THEN
    v_cap := (r ->> 'max_discount_amount')::numeric;
    IF p_price - v_amount > v_cap THEN
      v_amount := round(p_price - v_cap, 2);
    END IF;
  END IF;
  RETURN v_amount;
END;
$$;
REVOKE ALL ON FUNCTION public.promotion_discounted_price(uuid, numeric) FROM PUBLIC, anon, authenticated;

-- ═══ 4. Harga order add-on: kini menerima organisasi (cakupan) dan mengevaluasi aturan ═══
DROP FUNCTION IF EXISTS public.compute_addon_order_price(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.compute_addon_order_price(p_addon_id uuid, p_promotion_id uuid DEFAULT NULL, p_user_id uuid DEFAULT NULL, p_organization_id uuid DEFAULT NULL)
RETURNS TABLE (amount numeric, currency text, promotion_id uuid, snapshot jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_addon public.addons;
  v_promo public.promotions;
  v_amount numeric;
  v_problem text;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    RAISE EXCEPTION 'compute_addon_order_price: hanya untuk pengguna yang sedang login' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_addon FROM public.addons WHERE id = p_addon_id;
  IF v_addon.id IS NULL OR v_addon.status <> 'active' THEN
    RAISE EXCEPTION 'commercial_orders: addon tidak ditemukan atau tidak aktif' USING ERRCODE = '23514';
  END IF;
  IF v_addon.price IS NULL OR v_addon.price <= 0 THEN
    RAISE EXCEPTION 'commercial_orders: addon belum punya harga' USING ERRCODE = '23514';
  END IF;
  v_amount := v_addon.price;

  IF p_promotion_id IS NOT NULL THEN
    SELECT * INTO v_promo FROM public.promotions WHERE id = p_promotion_id;
    IF v_promo.id IS NULL
       OR v_addon.promotion_id IS DISTINCT FROM p_promotion_id
       OR v_promo.status <> 'active'
       OR (v_promo.valid_from IS NOT NULL AND v_promo.valid_from > now())
       OR (v_promo.valid_to IS NOT NULL AND v_promo.valid_to < now()) THEN
      RAISE EXCEPTION 'commercial_orders: promosi tidak berlaku untuk addon ini' USING ERRCODE = '23514';
    END IF;
    v_problem := public.promotion_eligibility_problem(p_promotion_id, p_user_id, v_addon.price);
    IF v_problem IS NULL THEN
      v_problem := public.promotion_rules_problem(p_promotion_id, p_user_id, CASE WHEN p_organization_id IS NULL THEN 'personal' ELSE 'organization' END, v_addon.code);
    END IF;
    IF v_problem IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: %', v_problem USING ERRCODE = '23514';
    END IF;
    v_amount := public.promotion_discounted_price(p_promotion_id, v_addon.price);
    IF v_amount <= 0 THEN
      RAISE EXCEPTION 'commercial_orders: harga setelah promosi harus lebih dari 0' USING ERRCODE = '23514';
    END IF;
  END IF;

  amount := v_amount;
  currency := trim(v_addon.currency);
  promotion_id := CASE WHEN v_promo.id IS NULL THEN NULL ELSE v_promo.id END;
  snapshot := jsonb_build_object(
    'addon', to_jsonb(v_addon),
    'promotion', CASE WHEN v_promo.id IS NULL THEN NULL ELSE to_jsonb(v_promo) END,
    'list_price', v_addon.price,
    'amount', v_amount,
    'priced_at', now()
  );
  RETURN NEXT;
END;
$$;
REVOKE ALL ON FUNCTION public.compute_addon_order_price(uuid, uuid, uuid, uuid) FROM PUBLIC, anon;

-- ═══ 5. Harga order paket: mengevaluasi aturan ═══
CREATE OR REPLACE FUNCTION public.compute_plan_order_price(p_plan_id uuid, p_organization_id uuid, p_user_id uuid, p_promotion_id uuid DEFAULT NULL)
RETURNS TABLE (amount numeric, currency text, promotion_id uuid, snapshot jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.subscription_plans;
  v_promo public.promotions;
  v_price numeric;
  v_amount numeric;
  v_problem text;
  v_org_status text;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT (public.is_service_role_request() OR public.has_permission('m14.commercial_administration.manage_commercial_resources')) THEN
    RAISE EXCEPTION 'compute_plan_order_price: hanya untuk pengguna yang sedang login' USING ERRCODE = '42501';
  END IF;
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
  v_amount := v_price;

  IF p_promotion_id IS NOT NULL THEN
    SELECT * INTO v_promo FROM public.promotions WHERE id = p_promotion_id;
    IF v_promo.id IS NULL
       OR v_plan.promotion_id IS DISTINCT FROM p_promotion_id
       OR v_promo.status <> 'active'
       OR (v_promo.valid_from IS NOT NULL AND v_promo.valid_from > now())
       OR (v_promo.valid_to IS NOT NULL AND v_promo.valid_to < now()) THEN
      RAISE EXCEPTION 'commercial_orders: promosi tidak berlaku untuk paket ini' USING ERRCODE = '23514';
    END IF;
    v_problem := public.promotion_eligibility_problem(p_promotion_id, p_user_id, v_price);
    IF v_problem IS NULL THEN
      v_problem := public.promotion_rules_problem(p_promotion_id, p_user_id, CASE WHEN p_organization_id IS NULL THEN 'personal' ELSE 'organization' END, v_plan.code);
    END IF;
    IF v_problem IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: %', v_problem USING ERRCODE = '23514';
    END IF;
    v_amount := public.promotion_discounted_price(p_promotion_id, v_price);
    IF v_amount <= 0 THEN
      RAISE EXCEPTION 'commercial_orders: harga setelah promosi harus lebih dari 0' USING ERRCODE = '23514';
    END IF;
  END IF;

  amount := v_amount;
  currency := trim(v_plan.currency);
  promotion_id := CASE WHEN v_promo.id IS NULL THEN NULL ELSE v_promo.id END;
  snapshot := jsonb_build_object(
    'plan', to_jsonb(v_plan),
    'promotion', CASE WHEN v_promo.id IS NULL THEN NULL ELSE to_jsonb(v_promo) END,
    'scope', CASE WHEN p_organization_id IS NULL THEN 'personal' ELSE 'organization' END,
    'list_price', v_price,
    'amount', v_amount,
    'buyer_user_id', p_user_id,
    'priced_at', now()
  );
  RETURN NEXT;
END;
$$;
REVOKE ALL ON FUNCTION public.compute_plan_order_price(uuid, uuid, uuid, uuid) FROM PUBLIC, anon;

-- ═══ 6. Trigger harga order: order add-on meneruskan organization_id ═══
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
    IF NEW.addon_id IS NOT NULL OR NEW.subscription_id IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: order langganan tidak bisa memuat addon atau langganan lain' USING ERRCODE = '23514';
    END IF;
    IF NEW.promotion_id IS NOT NULL THEN
      PERFORM pg_advisory_xact_lock(hashtextextended(NEW.promotion_id::text, 0));
    END IF;
    SELECT * INTO r FROM public.compute_plan_order_price(NEW.subscription_plan_id, NEW.organization_id, NEW.user_id, NEW.promotion_id);
    NEW.amount := r.amount;
    NEW.currency := r.currency;
    NEW.promotion_id := r.promotion_id;
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
  SELECT * INTO r FROM public.compute_addon_order_price(NEW.addon_id, NEW.promotion_id, NEW.user_id, NEW.organization_id);
  NEW.amount := r.amount;
  NEW.currency := r.currency;
  NEW.promotion_id := r.promotion_id;
  NEW.commercial_snapshot := r.snapshot;
  RETURN NEW;
END;
$$;

-- ═══ 7. Penawaran add-on: opsional menyebut organisasi (cakupan) ═══
DROP FUNCTION IF EXISTS public.my_addon_promotion_offers(uuid[]);
CREATE OR REPLACE FUNCTION public.my_addon_promotion_offers(p_addon_ids uuid[], p_organization_id uuid DEFAULT NULL)
RETURNS TABLE (addon_id uuid, promotion_id uuid, eligible boolean, reason text, list_price numeric, final_amount numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a record;
  r record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'my_addon_promotion_offers: login diperlukan' USING ERRCODE = '42501';
  END IF;
  FOR a IN
    SELECT ad.id, ad.promotion_id AS promo_id, ad.price FROM public.addons ad
    WHERE ad.id = ANY (p_addon_ids) AND ad.status = 'active' AND ad.promotion_id IS NOT NULL
  LOOP
    addon_id := a.id;
    promotion_id := a.promo_id;
    list_price := a.price;
    BEGIN
      SELECT * INTO r FROM public.compute_addon_order_price(a.id, a.promo_id, auth.uid(), p_organization_id);
      eligible := TRUE;
      reason := NULL;
      final_amount := r.amount;
    EXCEPTION WHEN check_violation THEN
      eligible := FALSE;
      reason := regexp_replace(SQLERRM, '^commercial_orders: ', '');
      final_amount := a.price;
    END;
    RETURN NEXT;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.my_addon_promotion_offers(uuid[], uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_addon_promotion_offers(uuid[], uuid) TO authenticated;
