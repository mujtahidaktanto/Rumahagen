-- 0152_region_hierarchy_integrity.sql
-- Ketergantungan alamat (permintaan pemilik produk, 2026-09-25): kota/kabupaten HARUS berada di provinsi yang dipilih dan kecamatan HARUS berada di
-- kota/kabupaten yang dipilih. Sebelumnya listings, developer_projects, dan agent_profiles hanya punya FK terpisah ke ref_provinces / ref_cities /
-- ref_districts, sehingga kombinasi tak berkaitan (mis. Provinsi Jawa Timur + Kota Bandung) bisa tersimpan.
-- Satu fungsi trigger dipakai tiga tabel. Pelanggaran memakai ERRCODE 23514 (check_violation) supaya API (throwIntegrityError) menjawab 409.
-- agent_profiles hanya punya province_id dan city_id (tanpa district_id); fungsi membaca district_id lewat to_jsonb(NEW) agar tetap satu fungsi.
-- Kolom desa/kelurahan belum ada di ketiga tabel; ref_villages -> ref_districts sudah dijaga FK, jadi tidak perlu trigger di sini.
-- Pengisian data wilayah (provinsi/kota/kecamatan/desa) TIDAK bagian dari migration ini: lihat supabase/seed/wilayah.

CREATE OR REPLACE FUNCTION public.enforce_region_hierarchy()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_district uuid := NULLIF(to_jsonb(NEW) ->> 'district_id', '')::uuid;
  v_city_province uuid;
  v_district_city uuid;
BEGIN
  IF NEW.city_id IS NOT NULL THEN
    IF NEW.province_id IS NULL THEN
      RAISE EXCEPTION 'wilayah: provinsi wajib dipilih bila kota/kabupaten dipilih' USING ERRCODE = '23514';
    END IF;
    SELECT province_id INTO v_city_province FROM public.ref_cities WHERE id = NEW.city_id;
    IF v_city_province IS DISTINCT FROM NEW.province_id THEN
      RAISE EXCEPTION 'wilayah: kota/kabupaten tidak berada di provinsi yang dipilih' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF v_district IS NOT NULL THEN
    IF NEW.city_id IS NULL THEN
      RAISE EXCEPTION 'wilayah: kota/kabupaten wajib dipilih bila kecamatan dipilih' USING ERRCODE = '23514';
    END IF;
    SELECT city_id INTO v_district_city FROM public.ref_districts WHERE id = v_district;
    IF v_district_city IS DISTINCT FROM NEW.city_id THEN
      RAISE EXCEPTION 'wilayah: kecamatan tidak berada di kota/kabupaten yang dipilih' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_region_hierarchy ON public.listings;
CREATE TRIGGER trg_region_hierarchy BEFORE INSERT OR UPDATE OF province_id, city_id, district_id ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_region_hierarchy();

DROP TRIGGER IF EXISTS trg_region_hierarchy ON public.developer_projects;
CREATE TRIGGER trg_region_hierarchy BEFORE INSERT OR UPDATE OF province_id, city_id, district_id ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_region_hierarchy();

DROP TRIGGER IF EXISTS trg_region_hierarchy ON public.agent_profiles;
CREATE TRIGGER trg_region_hierarchy BEFORE INSERT OR UPDATE OF province_id, city_id ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_region_hierarchy();
