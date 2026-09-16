-- 0008_dbr_config.sql
-- Menutup residual D13-04 secara eksplisit.
--
-- KONFLIK YANG DITEMUKAN (sesuai checklist sebelumnya):
--   Sumber lama (STEP12-A/handoff STEP11) menulis `PUT /admin/config/dbr` sebagai
--   Superadmin-only.
--   Sumber terbaru & frozen (STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv, baris
--   "M07,DBR,Domain operations,ALL,ALL,ALL,OWN,NONE,NONE,NONE,...") secara eksplisit
--   memberi Admin & Manager = ALL, bukan Superadmin-only.
--
-- KEPUTUSAN (menerapkan instruksi awal: "implementasikan sesuai keputusan M10
-- sebagai otoritas final"): pakai master matrix STEP12-01 sebagai sumber kebenaran
-- karena itu dokumen FROZEN terbaru di rantai STEP12 (STEP12-01 dieksekusi setelah
-- STEP11 handoff, dan hasilnya secara eksplisit menang atas versi lama — pola yang
-- sama seperti S12-B-001 di STEP12-B_CONFLICT_FINDING_REGISTER.csv: "Later current
-- M10 granular matrix governs operational delegation; older umbrella wording
-- retained only as provenance"). Maka PUT /admin/config/dbr dibuka untuk
-- Superadmin + Admin + Manager (ALL), Agent (OWN — dibaca sebagai "lihat milik
-- sendiri" karena DBR domain operations OWN untuk Agent di matrix), bukan
-- Superadmin-only.

CREATE TABLE IF NOT EXISTS public.dbr_config (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dbr_threshold_percent  DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  default_interest_rate  DECIMAL(5,2) NOT NULL DEFAULT 8.50,
  updated_by             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.dbr_config IS
  'Kolom sesuai STEP10-D entity DBR_CONFIG. Otorisasi mengikuti M07 DBR Domain Operations di STEP12-01 master matrix (Superadmin/Admin/Manager=ALL, Agent=OWN) — lihat resolusi konflik D13-04 di atas.';

ALTER TABLE public.dbr_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY dbr_config_select ON public.dbr_config
  FOR SELECT USING (public.has_permission('m07.dbr.domain_operations', updated_by));

CREATE POLICY dbr_config_write ON public.dbr_config
  FOR ALL USING (public.has_permission('m07.dbr.domain_operations', updated_by))
  WITH CHECK (public.has_permission('m07.dbr.domain_operations', updated_by));
