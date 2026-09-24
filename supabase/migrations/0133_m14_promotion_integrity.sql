-- 0133_m14_promotion_integrity.sql
-- Pengaman tabel promotions untuk API admin pembuatan/pengubahan promosi (SOURCE-Admin-Addon.md, temuan 4).
-- Sejak 0131 harga pesanan dihitung server dan promosi memengaruhi harga lewat `benefit_configuration`
-- (konvensi: {"percent_off": 1..100} ATAU {"amount_off": > 0}). Tabel promotions dibuat 0071 dengan kolom teks/jsonb bebas:
--   * `status` TEXT bebas tanpa CHECK; `code` bebas; `valid_to` boleh sebelum `valid_from`.
--   * `benefit_configuration` jsonb bebas: promosi "aktif" dengan bentuk salah tidak memberi diskon tanpa pesan kesalahan
--     (compute_addon_order_price mengabaikan bentuk tak dikenal), atau bisa berisi kedua kunci sekaligus.
--   * Menghapus promosi mengosongkan `addons.promotion_id` dan `commercial_orders.promotion_id` (FK SET NULL) secara diam-diam.
--
-- Model setelah migration ini:
--   * status: draft | active | inactive | expired. code: huruf/angka/titik/garis bawah/strip.
--   * valid_to harus setelah valid_from bila keduanya diisi.
--   * Promosi `active` wajib punya benefit_configuration valid: tepat SATU dari percent_off (0 < n <= 100) atau amount_off (> 0).
--   * Promosi yang masih dirujuk addon atau pesanan tidak bisa dihapus (nonaktifkan saja).
-- rule_configuration / eligibility_configuration TIDAK dievaluasi sistem saat ini (hanya benefit_configuration yang dipakai harga);
-- API admin menolak isian tak kosong agar tidak menimbulkan kesan aturan kelayakan berlaku.
-- Tabel promotions kosong saat migration ini ditulis (dicek live), jadi CHECK langsung divalidasi.

CREATE OR REPLACE FUNCTION public.promotion_benefit_valid(p jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_has_pct boolean;
  v_has_off boolean;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN
    RETURN FALSE;
  END IF;
  v_has_pct := p ? 'percent_off';
  v_has_off := p ? 'amount_off';
  IF v_has_pct = v_has_off THEN
    RETURN FALSE;  -- harus tepat satu
  END IF;
  IF v_has_pct THEN
    RETURN CASE WHEN jsonb_typeof(p -> 'percent_off') = 'number' THEN (p ->> 'percent_off')::numeric > 0 AND (p ->> 'percent_off')::numeric <= 100 ELSE FALSE END;
  END IF;
  RETURN CASE WHEN jsonb_typeof(p -> 'amount_off') = 'number' THEN (p ->> 'amount_off')::numeric > 0 ELSE FALSE END;
END;
$$;

ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_status_check CHECK (status IN ('draft', 'active', 'inactive', 'expired')),
  ADD CONSTRAINT promotions_code_format CHECK (code ~ '^[A-Za-z0-9_.-]+$'),
  ADD CONSTRAINT promotions_valid_window CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_to > valid_from),
  ADD CONSTRAINT promotions_active_requires_benefit CHECK (status <> 'active' OR public.promotion_benefit_valid(benefit_configuration));

CREATE OR REPLACE FUNCTION public.promotion_in_use(p_promotion_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.addons WHERE promotion_id = p_promotion_id)
      OR EXISTS (SELECT 1 FROM public.commercial_orders WHERE promotion_id = p_promotion_id);
$$;
REVOKE ALL ON FUNCTION public.promotion_in_use(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.enforce_promotion_not_deleted_when_in_use()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.promotion_in_use(OLD.id) THEN
    RAISE EXCEPTION 'promotions: promosi yang masih dirujuk addon atau pesanan tidak bisa dihapus; nonaktifkan saja'
      USING ERRCODE = '23514';
  END IF;
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS trg_promotion_not_deleted_in_use ON public.promotions;
CREATE TRIGGER trg_promotion_not_deleted_in_use
  BEFORE DELETE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_promotion_not_deleted_when_in_use();
