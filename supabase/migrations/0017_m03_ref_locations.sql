-- 0017_m03_ref_locations.sql
-- Prasyarat untuk 0018_m03_listings.sql: `listings.province_id/city_id/district_id`
-- adalah FK NOT NULL ke tiga tabel ini (STEP10-D). Bukan bagian dari residual
-- R-04/D13-01 secara langsung, tapi tanpa ini LISTINGS tidak bisa dibuat sama
-- sekali — jadi diimplementasikan lebih dulu di file terpisah supaya jelas mana
-- yang prasyarat referensi vs mana yang inti residual Tahap 4.
--
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- REF_PROVINCES/REF_CITIES/REF_DISTRICTS — PRESERVE_EXACT_PHYSICAL_CORROBORATION,
-- tanpa deviasi.
--
-- TIDAK ADA seed data provinsi/kota/kecamatan di sini — dicek ke seluruh corpus
-- dokumen (termasuk isi zip bersarang), tidak ada satu pun daftar wilayah
-- administratif Indonesia yang dievidensi sebagai data sumber. Mengisi baris
-- contoh berarti mengarang data referensi di luar dokumen. Superadmin/proses
-- import data mengisi tabel ini secara operasional (biasanya dari data BPS/
-- Kemendagri resmi) — di luar scope migration.

CREATE TABLE IF NOT EXISTS public.ref_provinces (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code  VARCHAR(10) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ref_cities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id  UUID NOT NULL REFERENCES public.ref_provinces(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('kota','kabupaten'))
);

CREATE TABLE IF NOT EXISTS public.ref_districts (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id  UUID NOT NULL REFERENCES public.ref_cities(id) ON DELETE RESTRICT,
  code     VARCHAR(10) UNIQUE NOT NULL,
  name     VARCHAR(100) NOT NULL
);

COMMENT ON TABLE public.ref_provinces IS 'Data referensi wilayah administratif. Sumber: STEP10-D entity REF_PROVINCES. Tidak ada seed — lihat catatan di atas file.';
COMMENT ON TABLE public.ref_cities IS 'Sumber: STEP10-D entity REF_CITIES.';
COMMENT ON TABLE public.ref_districts IS 'Sumber: STEP10-D entity REF_DISTRICTS.';

-- RLS: data referensi publik murni (nama provinsi/kota/kecamatan bukan data
-- sensitif, dibutuhkan siapa pun — termasuk pengunjung anonim — untuk mengisi
-- form listing atau filter pencarian). Tidak ada permission code untuk resource
-- ini di master matrix (bukan resource M-module, murni data referensi) — pola
-- yang sama seperti ai_providers SELECT di 0015: kondisi langsung, bukan
-- has_permission(). Mutasi (INSERT/UPDATE/DELETE) dibatasi Superadmin lewat
-- is_superadmin() langsung, sama seperti ai_providers_write_superadmin di 0015.

ALTER TABLE public.ref_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ref_cities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ref_districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ref_provinces_select_public ON public.ref_provinces FOR SELECT USING (true);
CREATE POLICY ref_provinces_write_superadmin ON public.ref_provinces FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY ref_cities_select_public ON public.ref_cities FOR SELECT USING (true);
CREATE POLICY ref_cities_write_superadmin ON public.ref_cities FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY ref_districts_select_public ON public.ref_districts FOR SELECT USING (true);
CREATE POLICY ref_districts_write_superadmin ON public.ref_districts FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
