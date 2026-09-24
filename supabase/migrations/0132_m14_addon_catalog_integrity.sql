-- 0132_m14_addon_catalog_integrity.sql
-- Pengaman katalog add-on untuk layar/route Admin "Katalog Add-on" (SOURCE-Admin-Addon.md).
-- Setelah 0131 harga addon diisi staf, jadi katalog harus aman diubah tanpa merusak pesanan yang berjalan:
--   * fulfill_commercial_order() (0079/0081) membaca addon SAAT INI (kapasitas, masa berlaku, kode), bukan snapshot pesanan.
--     Mengubah kapasitas/masa berlaku addon setelah ada pesanan membuat pembeli lama menerima syarat baru; menghapus addon
--     membuat commercial_orders.addon_id menjadi NULL (FK SET NULL) sehingga fulfillment gagal.
--   * addons.status, validity_type, dan capacity_type berupa teks bebas tanpa CHECK; addon aktif tanpa kapasitas akan
--     membuat entitlement kosong; kapasitas tambahan (jsonb) tidak divalidasi.
--
-- Model setelah migration ini:
--   * status: draft | active | inactive. validity_type: days (validity_days wajib > 0) | unlimited (validity_days NULL).
--   * capacity_type dibatasi ke jenis yang benar-benar dikonsumsi sistem: listing_refresh, learning_point.
--     Addon aktif wajib punya kapasitas primer (jenis + nilai > 0). additional_capacities harus array objek
--     {capacity_type, capacity_value > 0} dengan jenis yang sama.
--   * Addon yang SUDAH punya pesanan: code, validity_type, validity_days, capacity_type, capacity_value, additional_capacities
--     dikunci (harga, nama, status, promosi, konfigurasi tetap bisa diubah; harga hanya berlaku untuk pesanan baru).
--     Addon yang punya pesanan tidak bisa dihapus (nonaktifkan saja).
-- Tabel addons kosong saat migration ini ditulis (dicek live), jadi CHECK langsung divalidasi.

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
       OR (e ->> 'capacity_type') NOT IN ('listing_refresh', 'learning_point')
       OR (e ->> 'capacity_value') IS NULL
       OR (e ->> 'capacity_value') !~ '^[0-9]+(\.[0-9]+)?$'
       OR (e ->> 'capacity_value')::numeric <= 0 THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;

ALTER TABLE public.addons
  ADD CONSTRAINT addons_status_check CHECK (status IN ('draft', 'active', 'inactive')),
  ADD CONSTRAINT addons_validity_type_check CHECK (
    (validity_type = 'days' AND validity_days IS NOT NULL) OR (validity_type = 'unlimited' AND validity_days IS NULL)
  ),
  ADD CONSTRAINT addons_capacity_type_check CHECK (capacity_type IS NULL OR capacity_type IN ('listing_refresh', 'learning_point')),
  ADD CONSTRAINT addons_capacity_value_check CHECK (capacity_value IS NULL OR capacity_value > 0),
  ADD CONSTRAINT addons_active_requires_capacity CHECK (status <> 'active' OR (capacity_type IS NOT NULL AND capacity_value IS NOT NULL)),
  ADD CONSTRAINT addons_additional_capacities_check CHECK (public.addon_capacities_valid(additional_capacities));

CREATE OR REPLACE FUNCTION public.addon_has_orders(p_addon_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.commercial_orders WHERE addon_id = p_addon_id);
$$;
REVOKE ALL ON FUNCTION public.addon_has_orders(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.enforce_addon_terms_locked_after_orders()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.addon_has_orders(OLD.id) THEN
      RAISE EXCEPTION 'addons: addon yang sudah punya pesanan tidak bisa dihapus; nonaktifkan saja' USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;
  IF (NEW.code, NEW.validity_type, NEW.validity_days, NEW.capacity_type, NEW.capacity_value, NEW.additional_capacities)
     IS DISTINCT FROM
     (OLD.code, OLD.validity_type, OLD.validity_days, OLD.capacity_type, OLD.capacity_value, OLD.additional_capacities)
     AND public.addon_has_orders(OLD.id) THEN
    RAISE EXCEPTION 'addons: kode, masa berlaku, dan kapasitas dikunci karena addon sudah punya pesanan; buat addon baru untuk syarat yang berbeda'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_addon_terms_locked ON public.addons;
CREATE TRIGGER trg_addon_terms_locked
  BEFORE UPDATE OR DELETE ON public.addons
  FOR EACH ROW EXECUTE FUNCTION public.enforce_addon_terms_locked_after_orders();
