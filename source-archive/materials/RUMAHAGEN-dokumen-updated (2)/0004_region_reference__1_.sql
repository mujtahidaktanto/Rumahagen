-- ============================================================================
-- Migration 0004: Referensi Wilayah Indonesia (shared kernel, ERD v1.3 §2.33-36)
-- ENT: ENT-M03-RefProvince/RefCity/RefDistrict/RefVillage
-- Dibangun sebelum M03/M06 karena keduanya bergantung pada data ini.
-- ============================================================================

CREATE TABLE ref_provinces (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code  VARCHAR(10) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE ref_cities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id  UUID NOT NULL REFERENCES ref_provinces(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('kota','kabupaten'))
);
CREATE INDEX idx_ref_cities_province ON ref_cities(province_id);

CREATE TABLE ref_districts (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id  UUID NOT NULL REFERENCES ref_cities(id) ON DELETE RESTRICT,
  code     VARCHAR(10) UNIQUE NOT NULL,
  name     VARCHAR(100) NOT NULL
);
CREATE INDEX idx_ref_districts_city ON ref_districts(city_id);

CREATE TABLE ref_villages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id  UUID NOT NULL REFERENCES ref_districts(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  postal_code  VARCHAR(6)
);
CREATE INDEX idx_ref_villages_district ON ref_villages(district_id);

-- RLS: data referensi publik, read-only bagi semua, manage hanya Superadmin
ALTER TABLE ref_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ref_provinces_select ON ref_provinces FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_provinces_manage ON ref_provinces FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_cities_select ON ref_cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_cities_manage ON ref_cities FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_districts_select ON ref_districts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_districts_manage ON ref_districts FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_villages_select ON ref_villages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_villages_manage ON ref_villages FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());
