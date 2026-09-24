-- 0131_m14_server_side_order_pricing.sql
-- Menutup celah harga M14 yang dibuktikan di DB live (2026-09-24, transaksi rollback) saat memindai layar Agent
-- "Langganan Saya" (SOURCE-Agent-Langganan.md §4):
--   * POST /commercial/orders mengambil `amount` dan `currency` dari body klien, dan INSERT commercial_orders
--     dengan amount=1 untuk addon berharga 500.000 diterima. Tidak ada kolom harga otoritatif pada `addons`
--     (harga hanya bisa tersirat di `configuration` jsonb bebas).
--   * payment_transactions_insert hanya memeriksa kepemilikan order, jadi klien juga bisa INSERT percobaan pembayaran
--     dengan `amount` sesukanya lewat PostgREST. Webhook Midtrans mencocokkan gross_amount dengan payment_transactions.amount,
--     sehingga membayar Rp 1 untuk order Rp 500.000 lolos verifikasi dan memicu fulfillment penuh.
--   * `commercial_snapshot` (syarat pembelian yang dibekukan) juga dibangun klien/route, bukan oleh server.
--
-- Model setelah migration ini:
--   * `addons.price` dan `addons.currency` adalah satu-satunya sumber harga. Addon `active` wajib punya price > 0.
--   * Untuk pembeli (bukan staf dan bukan server), trigger BEFORE INSERT pada commercial_orders MENIMPA `amount`,
--     `currency`, `promotion_id`, dan `commercial_snapshot` dengan hasil hitung server; nilai kiriman klien diabaikan.
--     Order harus untuk addon aktif; order untuk `subscription_id` ditolak (pembelian langganan belum dibangun).
--   * Promosi hanya berlaku bila sama dengan `addons.promotion_id`, berstatus `active`, dan dalam masa `valid_from/valid_to`.
--     Konvensi `promotions.benefit_configuration` (jsonb bebas di 0071): `{"percent_off": 1..100}` atau `{"amount_off": > 0}`.
--     Tanpa salah satunya promosi tidak mengubah harga. Hasil akhir harus > 0 (pembayaran Midtrans tidak menerima 0).
--   * Untuk pembeli, trigger BEFORE INSERT pada payment_transactions menyamakan `amount` dan `currency` dengan order induknya
--     dan menolak bila order tidak berstatus pending.
--   * Staf (`m14.commercial_administration.manage_commercial_resources`) dan konteks server (auth.uid() NULL / service_role)
--     tidak dibatasi (webhook, koreksi manual).

-- ═══ 1. Harga otoritatif pada addons ═══
ALTER TABLE public.addons
  ADD COLUMN IF NOT EXISTS price    NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'IDR';

ALTER TABLE public.addons
  ADD CONSTRAINT addons_price_nonneg CHECK (price IS NULL OR price >= 0),
  ADD CONSTRAINT addons_active_requires_price CHECK (status <> 'active' OR price > 0);

COMMENT ON COLUMN public.addons.price IS
  'Harga satu kali beli (satuan terkecil mata uang, 2 desimal). Satu-satunya sumber harga pesanan; addon status=active wajib price > 0.';

-- ═══ 2. Hitung harga di server ═══
CREATE OR REPLACE FUNCTION public.compute_addon_order_price(p_addon_id uuid, p_promotion_id uuid DEFAULT NULL)
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
BEGIN
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
REVOKE ALL ON FUNCTION public.compute_addon_order_price(uuid, uuid) FROM PUBLIC, anon;

-- ═══ 3. Order: harga dan snapshot ditentukan server ═══
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
  SELECT * INTO r FROM public.compute_addon_order_price(NEW.addon_id, NEW.promotion_id);
  NEW.amount := r.amount;
  NEW.currency := r.currency;
  NEW.promotion_id := r.promotion_id;
  NEW.commercial_snapshot := r.snapshot;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_price_commercial_order ON public.commercial_orders;
CREATE TRIGGER trg_price_commercial_order
  BEFORE INSERT ON public.commercial_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_commercial_order_pricing();

-- ═══ 4. Pembayaran: nominal mengikuti order ═══
CREATE OR REPLACE FUNCTION public.order_amount_currency(p_order_id uuid)
RETURNS TABLE (amount numeric, currency text, status text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT co.amount, co.currency::text, co.status FROM public.commercial_orders co WHERE co.id = p_order_id;
$$;
REVOKE ALL ON FUNCTION public.order_amount_currency(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.enforce_payment_transaction_amount()
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
  SELECT * INTO r FROM public.order_amount_currency(NEW.commercial_order_id);
  IF r.amount IS NULL THEN
    RAISE EXCEPTION 'payment_transactions: order tidak ditemukan' USING ERRCODE = '23514';
  END IF;
  IF r.status <> 'pending' THEN
    RAISE EXCEPTION 'payment_transactions: hanya order pending yang bisa dibayar' USING ERRCODE = '23514';
  END IF;
  NEW.amount := r.amount;
  NEW.currency := r.currency;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_payment_transaction_amount ON public.payment_transactions;
CREATE TRIGGER trg_payment_transaction_amount
  BEFORE INSERT ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_transaction_amount();
