-- 0109_m04_learning_economy_configuration.sql
-- Menutup gap terakhir dari audit admin-surface M01-M15: API-074/075
-- GET/PUT /admin/learning/configuration (M04, STEP11-A, "CURRENT
-- PRESERVE") -- endpoint dikunci namanya, TAPI TIDAK ADA satu pun field/
-- skema fisik dievidensi Core untuk isinya (dicek menyeluruh: STEP10-D
-- data dictionary tidak punya entity LEARNING_CONFIG/LEARNING_ECONOMY_
-- CONFIG apa pun, tidak ada nama kolom/rate/threshold learning economy
-- di manapun dalam korpus). BUKAN endpoint yang sama dengan
-- `/admin/learning/activities` (API-076/077/078, SUDAH dibangun sejak
-- 0058 -- itu CRUD konten Activity, bukan "configuration").
--
-- Satu-satunya evidence adalah OTORISASI (bukan skema) di Gate
-- PRE-00-F_M04_LEARNING_GATE §19 "LEARNING ECONOMY CONFIGURATION"
-- (Q-M04-E-01A/01B) -- baris ini TIDAK ada di STEP12-01_ROLE_PERMISSION_
-- MASTER_MATRIX.csv 50-baris frozen (pola sama seperti m04.learning_point.*
-- di 0023 dan m04.learning_activity.* di 0058 -- keduanya JUGA ADD-NEW
-- lewat Gate PRE-00-F, bukan di master matrix), jadi 2 permission BARU
-- di-mint di sini, scope PERSIS meniru Gate, bukan dikarang bebas:
--   m04.learning_economy_configuration.view   (Q-M04-E-01A)
--   m04.learning_economy_configuration.manage (Q-M04-E-01B)
--
-- KEPUTUSAN SKEMA (tidak ada field dievidensi -> generic key-value, POLA
-- SAMA PERSIS seperti system_configs/0011, BUKAN tabel kolom-bernama
-- seperti dbr_config/0008 atau seo_config/0097 yang field-nya memang
-- dievidensi eksplisit di tempat lain). Endpoint terkunci sebagai SATU
-- path tanpa {key} (beda dari system_configs yang per-key), jadi PUT di
-- sini menerima {config_key, config_value} sebagai body -- upsert satu
-- baris per panggilan, satu path tetap.
--
-- CATATAN "Instructor = OWN" (Q-M04-E-01A View): di-seed PERSIS sesuai
-- Gate (PRESERVE_EXACT, konsisten pola migration lain di proyek ini),
-- TAPI secara PRAKTIS ini adalah tabel konfigurasi GLOBAL tanpa kolom
-- owner_id apa pun -- has_permission('...', p_owner_id) untuk scope 'own'
-- SELALU FALSE tanpa owner_id yang cocok (0006), dan tidak ada owner_id
-- yang bermakna untuk baris config global. Route GET di bawah TIDAK
-- memanggil has_permission dengan owner_id apa pun untuk Instructor
-- (tidak ada yang bisa dipakai) -- konsekuensinya baris permission
-- Instructor ini efektif TIDAK PERNAH lolos lewat endpoint admin ini,
-- konsisten dengan SETIAP endpoint /admin/* lain di seluruh proyek yang
-- staff-only (Superadmin/Admin/Manager). Nilai scope tetap di-seed exact
-- match Gate untuk keperluan audit/traceability, bukan dihapus diam-diam.

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.learning_economy_configuration.view', 'own', 'Learning Economy Configuration - View (Gate PRE-00-F §19/Q-M04-E-01A, permission baru -- tidak ada di master matrix 50-baris)'),
  ('m04', 'm04.learning_economy_configuration.manage', 'own', 'Learning Economy Configuration - Manage (Gate PRE-00-F §19/Q-M04-E-01B, permission baru)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.learning_economy_configuration.view', 'all'),
  ('admin',      'm04.learning_economy_configuration.view', 'all'),
  ('manager',    'm04.learning_economy_configuration.view', 'all'),
  ('instructor', 'm04.learning_economy_configuration.view', 'own'),
  ('superadmin', 'm04.learning_economy_configuration.manage', 'all'),
  ('admin',      'm04.learning_economy_configuration.manage', 'all'),
  ('manager',    'm04.learning_economy_configuration.manage', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.learning_economy_configs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key   VARCHAR(100) UNIQUE NOT NULL,
  config_value VARCHAR(255),
  updated_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_economy_configs IS
  'ADD-NEW 0109 (API-074/075) -- tidak ada entity ini di STEP10-D dictionary, bentuk key-value generik meniru system_configs (0011) karena tidak ada nama field yang dievidensi Core untuk isi "Learning Economy Configuration" (Gate PRE-00-F §19). Terpisah dari system_configs sendiri karena RBAC-nya BEDA (Manager/Admin=ALL di sini, system_configs Superadmin-only).';

ALTER TABLE public.learning_economy_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_economy_configs_select ON public.learning_economy_configs
  FOR SELECT USING (public.has_permission('m04.learning_economy_configuration.view'));

CREATE POLICY learning_economy_configs_write ON public.learning_economy_configs
  FOR ALL USING (public.has_permission('m04.learning_economy_configuration.manage'))
  WITH CHECK (public.has_permission('m04.learning_economy_configuration.manage'));
