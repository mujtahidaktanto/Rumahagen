-- 0011_admin_system_configs.sql
-- Menutup residual R-06: "M09 system_configs RLS broader than semantic
-- Superadmin-only view" (P9 register) — dikonfirmasi lagi di
-- STEP12-G_ROLE_PERMISSION_CAPABILITY_RLS_MATRIX.csv baris PAR-029:
-- "system_configs [RLS=ENABLED; policies=0]" — tabel & RLS SUDAH ditandai aktif
-- di dokumen sumber, tapi belum ada satupun policy fisik. Ini migration yang
-- menutup gap itu.
--
-- Kolom persis sesuai STEP10-D dictionary, entity SYSTEM_CONFIGS.
-- Permission code dipakai dari seed yang SUDAH ADA di 0009 (generate dari
-- STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv baris M09 System Configuration):
--   m09.system_configuration.view   → Superadmin=ALL, semua role lain=NONE
--   m09.system_configuration.manage → Superadmin=ALL, semua role lain=NONE
-- TIDAK ada permission baru diciptakan di sini (menegakkan D13-15: tidak ada
-- permission-ID dikarang di luar katalog sumber).

CREATE TABLE IF NOT EXISTS public.system_configs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key   VARCHAR(100) UNIQUE NOT NULL,
  config_value VARCHAR(255),
  updated_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.system_configs IS
  'Sumber: STEP10-D entity SYSTEM_CONFIGS. Superadmin-only (lihat RLS di bawah) — menutup R-06.';

ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_configs_select ON public.system_configs
  FOR SELECT USING (public.has_permission('m09.system_configuration.view'));

CREATE POLICY system_configs_write ON public.system_configs
  FOR ALL USING (public.has_permission('m09.system_configuration.manage'))
  WITH CHECK (public.has_permission('m09.system_configuration.manage'));
