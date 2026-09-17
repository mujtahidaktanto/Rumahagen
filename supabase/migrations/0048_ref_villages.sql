-- 0048_ref_villages.sql
-- Fase 1 (lanjutan 0047): level ke-4 rantai referensi wilayah administratif,
-- di bawah ref_districts (0017). Sumber kolom: STEP10-D_ATTRIBUTE_TO_
-- PHYSICAL_COLUMN_RECONCILIATION.csv, entity REF_VILLAGES —
-- PRESERVE_EXACT_PHYSICAL_CORROBORATION, tanpa deviasi. Pola RLS identik
-- persis dengan ref_provinces/ref_cities/ref_districts (0017): baca publik,
-- tulis Superadmin saja, tidak ada permission code khusus (data referensi,
-- bukan resource M-module).

CREATE TABLE IF NOT EXISTS public.ref_villages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id  UUID NOT NULL REFERENCES public.ref_districts(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  postal_code  VARCHAR(6)
);

COMMENT ON TABLE public.ref_villages IS
  'Sumber: STEP10-D entity REF_VILLAGES. Tidak ada seed data desa/kelurahan — sama seperti ref_provinces/ref_cities/ref_districts (0017), diisi operasional dari data BPS/Kemendagri resmi, di luar scope migration.';

ALTER TABLE public.ref_villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ref_villages_select_public ON public.ref_villages FOR SELECT USING (true);
CREATE POLICY ref_villages_write_superadmin ON public.ref_villages FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
