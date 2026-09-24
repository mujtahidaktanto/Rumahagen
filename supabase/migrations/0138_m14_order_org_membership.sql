-- 0138_m14_order_org_membership.sql
-- Order komersial (M14) menerima `organization_id` dari klien tanpa memeriksa keanggotaan: policy INSERT hanya memeriksa izin atas `user_id`,
-- dan trigger harga (0131) tidak menyentuh organisasi. Akibatnya pengguna mana pun bisa membuat order atas nama organisasi yang bukan miliknya
-- (mengotori data order organisasi lain, laporan analytics per organisasi, dan pembacaan order oleh anggota organisasi itu bila kelak ada).
-- Pemenuhan order saat ini memberi kapasitas ke `user_id` saja, jadi tidak ada kebocoran kapasitas, tetapi atribusi organisasi harus benar.
--
-- Aturan: untuk pengguna biasa (bukan staf/service role), `organization_id` harus NULL atau organisasi tempat pemesan (user_id = auth.uid())
-- adalah anggota aktif. Pemesan hanya bisa memesan untuk dirinya sendiri (policy INSERT), jadi cukup memeriksa is_org_member().
-- Berlaku pada INSERT dan pada perubahan organization_id. Staf/service role dan pekerjaan sistem (tanpa auth.uid()) tidak dibatasi.
-- Tabel commercial_orders kosong saat migration ini ditulis (dicek live).

CREATE OR REPLACE FUNCTION public.enforce_commercial_order_org_membership()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_service_role_request()
     OR public.has_permission('m14.commercial_administration.manage_commercial_resources') THEN
    RETURN NEW;
  END IF;
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.organization_id IS NOT DISTINCT FROM OLD.organization_id THEN
    RETURN NEW;
  END IF;
  IF NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'commercial_orders: pemesan bukan anggota aktif organisasi ini' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_commercial_order_org ON public.commercial_orders;
CREATE TRIGGER trg_check_commercial_order_org
  BEFORE INSERT OR UPDATE OF organization_id ON public.commercial_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_commercial_order_org_membership();
