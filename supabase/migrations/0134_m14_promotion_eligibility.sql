-- 0134_m14_promotion_eligibility.sql
-- Aturan kelayakan promosi M14. `promotions.eligibility_configuration` (0071) berupa jsonb bebas yang TIDAK dievaluasi di mana pun:
-- promosi aktif berlaku untuk semua pembeli tanpa batas pemakaian (0131 hanya memeriksa status dan masa berlaku).
--
-- Model (kunci yang dikenal, semuanya opsional; kunci lain ditolak CHECK):
--   roles                     : array kode role yang boleh memakai (agent, developer_partner, buyer, manager, admin, superadmin)
--   first_purchase_only       : true = hanya pembeli tanpa pesanan berstatus confirmed sebelumnya
--   max_redemptions           : batas total pemakaian (pesanan pending + confirmed yang membawa promosi ini)
--   max_redemptions_per_user  : batas pemakaian per pengguna (pesanan pending + confirmed)
--   min_list_price            : harga list add-on minimum agar promosi berlaku
-- Pemakaian dihitung dari pesanan berstatus pending dan confirmed; pesanan cancelled/expired mengembalikan kuota.
-- Evaluasi memakai satu fungsi (compute_addon_order_price) yang dipanggil trigger pembuatan pesanan, sehingga pesanan yang membawa promosi
-- yang tidak layak DITOLAK (23514) dengan alasan. Pembuatan pesanan dengan promosi mengambil advisory lock per promosi agar batas total tidak terlampaui
-- oleh pesanan bersamaan.
-- Untuk aplikasi pembeli: RPC my_addon_promotion_offers(addon_ids) mengembalikan per addon apakah promosi berlaku untuk pengguna yang login,
-- alasan bila tidak, dan harga akhir; tanpa membuka konfigurasi promosi (tabel promotions hanya untuk staf).
-- `rule_configuration` tetap belum dievaluasi. Tabel promotions kosong saat migration ini ditulis (dicek live), jadi CHECK langsung divalidasi.

-- ═══ 1. Validasi bentuk eligibility_configuration ═══
CREATE OR REPLACE FUNCTION public.promotion_eligibility_valid(p jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  k text;
  r jsonb;
BEGIN
  -- Blok bersarang: nilai tak terduga (mis. teks pada kunci angka) dianggap tidak valid, bukan galat.
  BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN
    RETURN FALSE;
  END IF;
  FOR k IN SELECT jsonb_object_keys(p) LOOP
    IF k NOT IN ('roles', 'first_purchase_only', 'max_redemptions', 'max_redemptions_per_user', 'min_list_price') THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  IF p ? 'roles' THEN
    IF jsonb_typeof(p -> 'roles') <> 'array' OR jsonb_array_length(p -> 'roles') = 0 THEN
      RETURN FALSE;
    END IF;
    FOR r IN SELECT * FROM jsonb_array_elements(p -> 'roles') LOOP
      IF jsonb_typeof(r) <> 'string'
         OR (r #>> '{}') NOT IN ('agent', 'developer_partner', 'buyer', 'manager', 'admin', 'superadmin') THEN
        RETURN FALSE;
      END IF;
    END LOOP;
  END IF;
  IF p ? 'first_purchase_only' AND jsonb_typeof(p -> 'first_purchase_only') <> 'boolean' THEN
    RETURN FALSE;
  END IF;
  IF p ? 'max_redemptions' THEN
    IF jsonb_typeof(p -> 'max_redemptions') <> 'number' OR (p ->> 'max_redemptions') !~ '^[0-9]+$' OR (p ->> 'max_redemptions')::numeric < 1 THEN
      RETURN FALSE;
    END IF;
  END IF;
  IF p ? 'max_redemptions_per_user' THEN
    IF jsonb_typeof(p -> 'max_redemptions_per_user') <> 'number' OR (p ->> 'max_redemptions_per_user') !~ '^[0-9]+$' OR (p ->> 'max_redemptions_per_user')::numeric < 1 THEN
      RETURN FALSE;
    END IF;
  END IF;
  IF p ? 'min_list_price' THEN
    IF jsonb_typeof(p -> 'min_list_price') <> 'number' OR (p ->> 'min_list_price')::numeric <= 0 THEN
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
  ADD CONSTRAINT promotions_eligibility_valid CHECK (public.promotion_eligibility_valid(eligibility_configuration));

-- ═══ 2. Evaluasi kelayakan ═══
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
    RETURN 'harga add-on di bawah minimum untuk promosi ini';
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
REVOKE ALL ON FUNCTION public.promotion_eligibility_problem(uuid, uuid, numeric) FROM PUBLIC, anon, authenticated;

-- ═══ 3. Harga: evaluasi kelayakan di dalam compute_addon_order_price ═══
DROP FUNCTION IF EXISTS public.compute_addon_order_price(uuid, uuid);

CREATE OR REPLACE FUNCTION public.compute_addon_order_price(p_addon_id uuid, p_promotion_id uuid DEFAULT NULL, p_user_id uuid DEFAULT NULL)
RETURNS TABLE (amount numeric, currency text, promotion_id uuid, snapshot jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_addon public.addons;
  v_promo public.promotions;
  v_amount numeric;
  v_pct numeric;
  v_off numeric;
  v_problem text;
BEGIN
  -- Dipanggil trigger pesanan (invoker = pembeli) dan RPC; pengguna biasa hanya boleh menghitung untuk dirinya sendiri.
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
      v_amount := round(v_addon.price * (1 - v_pct / 100), 2);
    ELSIF v_off IS NOT NULL AND v_off > 0 THEN
      v_amount := round(v_addon.price - v_off, 2);
    END IF;
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
REVOKE ALL ON FUNCTION public.compute_addon_order_price(uuid, uuid, uuid) FROM PUBLIC, anon;

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
  IF NEW.subscription_id IS NOT NULL THEN
    RAISE EXCEPTION 'commercial_orders: pembelian langganan belum tersedia' USING ERRCODE = '23514';
  END IF;
  IF NEW.addon_id IS NULL THEN
    RAISE EXCEPTION 'commercial_orders: order harus untuk sebuah addon' USING ERRCODE = '23514';
  END IF;
  IF NEW.promotion_id IS NOT NULL THEN
    -- Serialisasi pemakaian per promosi agar max_redemptions tidak terlampaui oleh pesanan bersamaan.
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

-- ═══ 4. Untuk aplikasi pembeli: kelayakan promosi per addon bagi pengguna yang login ═══
CREATE OR REPLACE FUNCTION public.my_addon_promotion_offers(p_addon_ids uuid[])
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
      SELECT * INTO r FROM public.compute_addon_order_price(a.id, a.promo_id, auth.uid());
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
REVOKE ALL ON FUNCTION public.my_addon_promotion_offers(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_addon_promotion_offers(uuid[]) TO authenticated;

-- ═══ 5. Untuk admin: jumlah pemakaian per promosi (pesanan pending + confirmed) ═══
CREATE OR REPLACE FUNCTION public.promotion_redemption_counts(p_ids uuid[])
RETURNS TABLE (promotion_id uuid, redemptions bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_permission('m14.commercial_administration.configure') THEN
    RAISE EXCEPTION 'promotion_redemption_counts: butuh permission m14.commercial_administration.configure' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT co.promotion_id, count(*)::bigint
    FROM public.commercial_orders co
    WHERE co.promotion_id = ANY (p_ids) AND co.status IN ('pending', 'confirmed')
    GROUP BY co.promotion_id;
END;
$$;
REVOKE ALL ON FUNCTION public.promotion_redemption_counts(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promotion_redemption_counts(uuid[]) TO authenticated;
