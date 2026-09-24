-- 0143_m14_subscription_plan_promotions.sql
-- Promosi untuk paket langganan (M14). Sebelumnya promosi hanya berlaku untuk addon (addons.promotion_id, harga dan kelayakan dihitung server: 0131/0134);
-- order paket langganan (0142) menolak promotion_id ("Promosi belum berlaku untuk paket langganan").
--
-- Model (sama dengan addon, agar promosi dan layar Admin Promosi tetap satu konsep):
--   * `subscription_plans.promotion_id` menghubungkan satu promosi ke paket (berlaku untuk cakupan pribadi dan organisasi).
--   * Potongan (percent_off / amount_off) dihitung dari harga cakupan yang dipesan (price_personal atau price_organization); harga akhir harus > 0.
--     Order hanya memakai promosi bila klien menyebut promotion_id yang SAMA dengan promosi paket dan promosi itu berlaku: status active, dalam masa
--     berlaku, lolos kelayakan promotion_eligibility_problem (peran, harga minimum, pembelian pertama, batas per pengguna, kuota total) dihitung atas pembeli.
--   * `my_plan_promotion_offers(plan_ids, organization_id?)`: untuk pengguna login, apakah promosi tiap paket berlaku (alasan bila tidak) dan harga akhir,
--     tanpa membuka konfigurasi promosi (padanan my_addon_promotion_offers).
--   * promotion_in_use() ikut memeriksa paket, sehingga promosi yang dipakai paket tidak bisa dihapus/dikunci seperti yang dipakai addon.
-- Tabel subscription_plans/commercial_orders tanpa data promosi saat ditulis (dicek live: order kosong).

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.subscription_plans.promotion_id IS 'Promosi yang terhubung ke paket (0143). Berlaku bila diminta order dan lolos aturan promosi.';

CREATE OR REPLACE FUNCTION public.promotion_in_use(p_promotion_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.addons WHERE promotion_id = p_promotion_id)
      OR EXISTS (SELECT 1 FROM public.subscription_plans WHERE promotion_id = p_promotion_id)
      OR EXISTS (SELECT 1 FROM public.commercial_orders WHERE promotion_id = p_promotion_id);
$$;

-- Pesan kelayakan netral (berlaku untuk addon maupun paket).
CREATE OR REPLACE FUNCTION public.promotion_eligibility_problem(p_promotion_id uuid, p_user_id uuid, p_list_price numeric)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e jsonb;
  v_role text;
  v_n bigint;
BEGIN
  SELECT eligibility_configuration INTO e FROM public.promotions WHERE id = p_promotion_id;
  IF e IS NULL OR e = '{}'::jsonb THEN
    RETURN NULL;
  END IF;
  IF p_user_id IS NULL THEN
    RETURN 'pengguna tidak diketahui';
  END IF;
  IF e ? 'roles' THEN
    SELECT r.code INTO v_role FROM public.users u JOIN public.roles r ON r.id = u.role_id WHERE u.id = p_user_id;
    IF v_role IS NULL OR NOT ((e -> 'roles') ? v_role) THEN
      RETURN 'promosi ini tidak berlaku untuk peran Anda';
    END IF;
  END IF;
  IF e ? 'min_list_price' AND p_list_price < (e ->> 'min_list_price')::numeric THEN
    RETURN 'harga di bawah minimum untuk promosi ini';
  END IF;
  IF COALESCE((e ->> 'first_purchase_only')::boolean, FALSE)
     AND EXISTS (SELECT 1 FROM public.commercial_orders WHERE user_id = p_user_id AND status = 'confirmed') THEN
    RETURN 'promosi ini hanya untuk pembelian pertama';
  END IF;
  IF e ? 'max_redemptions_per_user' THEN
    SELECT count(*) INTO v_n FROM public.commercial_orders
    WHERE user_id = p_user_id AND promotion_id = p_promotion_id AND status IN ('pending', 'confirmed');
    IF v_n >= (e ->> 'max_redemptions_per_user')::bigint THEN
      RETURN 'batas pemakaian promosi per pengguna tercapai';
    END IF;
  END IF;
  IF e ? 'max_redemptions' THEN
    SELECT count(*) INTO v_n FROM public.commercial_orders
    WHERE promotion_id = p_promotion_id AND status IN ('pending', 'confirmed');
    IF v_n >= (e ->> 'max_redemptions')::bigint THEN
      RETURN 'kuota promosi sudah habis';
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Harga order paket, kini dengan promosi. Menggantikan versi 3 argumen (0142).
DROP FUNCTION IF EXISTS public.compute_plan_order_price(uuid, uuid, uuid);
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
  v_pct numeric;
  v_off numeric;
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
    IF v_problem IS NOT NULL THEN
      RAISE EXCEPTION 'commercial_orders: %', v_problem USING ERRCODE = '23514';
    END IF;
    BEGIN
      v_pct := NULLIF(v_promo.benefit_configuration ->> 'percent_off', '')::numeric;
      v_off := NULLIF(v_promo.benefit_configuration ->> 'amount_off', '')::numeric;
    EXCEPTION WHEN OTHERS THEN
      v_pct := NULL; v_off := NULL;
    END;
    IF v_pct IS NOT NULL AND v_pct > 0 AND v_pct <= 100 THEN
      v_amount := round(v_price * (1 - v_pct / 100), 2);
    ELSIF v_off IS NOT NULL AND v_off > 0 THEN
      v_amount := round(v_price - v_off, 2);
    END IF;
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

-- Trigger harga order: paket kini boleh membawa promotion_id.
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
  SELECT * INTO r FROM public.compute_addon_order_price(NEW.addon_id, NEW.promotion_id, NEW.user_id);
  NEW.amount := r.amount;
  NEW.currency := r.currency;
  NEW.promotion_id := r.promotion_id;
  NEW.commercial_snapshot := r.snapshot;
  RETURN NEW;
END;
$$;

-- Penawaran promosi paket untuk pembeli login (padanan my_addon_promotion_offers).
CREATE OR REPLACE FUNCTION public.my_plan_promotion_offers(p_plan_ids uuid[], p_organization_id uuid DEFAULT NULL)
RETURNS TABLE (plan_id uuid, promotion_id uuid, eligible boolean, reason text, list_price numeric, final_amount numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a record;
  r record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'my_plan_promotion_offers: login diperlukan' USING ERRCODE = '42501';
  END IF;
  FOR a IN
    SELECT sp.id, sp.promotion_id AS promo_id,
           CASE WHEN p_organization_id IS NULL THEN sp.price_personal ELSE sp.price_organization END AS price
    FROM public.subscription_plans sp
    WHERE sp.id = ANY (p_plan_ids) AND sp.status = 'active' AND sp.promotion_id IS NOT NULL
  LOOP
    plan_id := a.id;
    promotion_id := a.promo_id;
    list_price := a.price;
    BEGIN
      SELECT * INTO r FROM public.compute_plan_order_price(a.id, p_organization_id, auth.uid(), a.promo_id);
      eligible := TRUE;
      reason := NULL;
      final_amount := r.amount;
    EXCEPTION WHEN check_violation OR insufficient_privilege THEN
      eligible := FALSE;
      reason := regexp_replace(SQLERRM, '^commercial_orders: ', '');
      final_amount := a.price;
    END;
    RETURN NEXT;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.my_plan_promotion_offers(uuid[], uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_plan_promotion_offers(uuid[], uuid) TO authenticated;
