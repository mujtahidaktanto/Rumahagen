-- supabase/seed/wilayah/load.sql
-- Memuat wilayah Kepmendagri 2025 (38 provinsi, 514 kab/kota, 7.285 kecamatan, 83.762 desa/kelurahan) ke ref_provinces, ref_cities, ref_districts,
-- ref_villages. Idempoten (upsert per `code`; id baris yang sudah ada dan direferensikan listing TIDAK berubah). Jalankan dengan psql dari folder ini:
--   psql "$DATABASE_URL" -f load.sql
-- Kode tanpa titik: provinsi 2 digit, kab/kota 4, kecamatan 6, desa 10 (kolom code varchar(10)). Kode pos opsional (kosong = NULL).

\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE stg_provinces (code text, name text) ON COMMIT DROP;
CREATE TEMP TABLE stg_cities (province_code text, code text, name text, type text) ON COMMIT DROP;
CREATE TEMP TABLE stg_districts (city_code text, code text, name text) ON COMMIT DROP;
CREATE TEMP TABLE stg_villages (district_code text, code text, name text, postal_code text) ON COMMIT DROP;

\copy stg_provinces FROM 'provinces.csv' WITH (FORMAT csv, HEADER true)
\copy stg_cities FROM 'cities.csv' WITH (FORMAT csv, HEADER true)
\copy stg_districts FROM 'districts.csv' WITH (FORMAT csv, HEADER true)
\copy stg_villages FROM 'villages.csv' WITH (FORMAT csv, HEADER true)

INSERT INTO public.ref_provinces (code, name)
SELECT code, name FROM stg_provinces
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.ref_cities (province_id, code, name, type)
SELECT p.id, s.code, s.name, s.type FROM stg_cities s JOIN public.ref_provinces p ON p.code = s.province_code
ON CONFLICT (code) DO UPDATE SET province_id = EXCLUDED.province_id, name = EXCLUDED.name, type = EXCLUDED.type;

INSERT INTO public.ref_districts (city_id, code, name)
SELECT c.id, s.code, s.name FROM stg_districts s JOIN public.ref_cities c ON c.code = s.city_code
ON CONFLICT (code) DO UPDATE SET city_id = EXCLUDED.city_id, name = EXCLUDED.name;

INSERT INTO public.ref_villages (district_id, code, name, postal_code)
SELECT d.id, s.code, s.name, NULLIF(s.postal_code, '') FROM stg_villages s JOIN public.ref_districts d ON d.code = s.district_code
ON CONFLICT (code) DO UPDATE SET district_id = EXCLUDED.district_id, name = EXCLUDED.name, postal_code = EXCLUDED.postal_code;

COMMIT;
