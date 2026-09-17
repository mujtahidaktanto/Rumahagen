-- 0064_m15_awarding_paths.sql
-- Fase 3 dari rencana "100% tabel" — M15 Awarding Engine (9 tabel, "mesin
-- konfigurasi jalur/aturan kelulusan" yang sejak migration 0026 sengaja
-- ditunda: "di luar lingkup literal D13-03... belum punya nomor residual
-- di checklist manapun"). Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_
-- COLUMN_RECONCILIATION.csv, entity AWARDING_PATHS/AWARDING_PATH_VERSIONS
-- — tanpa deviasi. Dikonfirmasi silang dengan STEP11-B8 §13 "Physical
-- Schema Parity": 14 tabel M15 total (5 sudah ada sejak 0026, 9 di sini).
--
-- PERMISSION BARU: `m15.awarding_path_rule.configure`. STEP11-B8 §10
-- mencatat semantic capability inventory `awarding.path.manage`/
-- `awarding.rule.manage` SEBAGAI "semantic capability inventory, not a
-- final permission-ID seed" — permission ID final memang didelegasikan ke
-- STEP12/downstream, migration inilah realisasi downstream-nya. HANYA
-- Superadmin/Admin/Manager=ALL (pola identik `m15.title_authority_scope_
-- binding.configure` dari 0026 — config engine, bukan resource milik
-- Agent). Satu permission mencakup SELURUH 7 tabel config engine
-- (awarding_paths s.d. awarding_prerequisites di 0064-0066) — konsisten
-- dengan pola konsolidasi verb di `ai_providers`/0015 dan
-- `static_public_content`/0037 (satu action code untuk seluruh siklus
-- CRUD resource yang sama).
--
-- VISIBILITY: config engine ini STAFF-ONLY untuk SELECT juga (bukan publik
-- seperti title_definitions) — Agent tidak perlu (dan STEP11-B8 tidak
-- mengevidence kebutuhan) melihat internal rule engine, cukup melihat
-- HASIL-nya (qualification_evaluations/award_instances yang sudah ada).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m15', 'm15.awarding_path_rule.configure', 'all', 'Awarding Path/Rule - Configure (ADD-NEW, realisasi downstream STEP11-B8 awarding.path.manage/awarding.rule.manage; Superadmin/Admin/Manager saja)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm15.awarding_path_rule.configure', 'all'),
  ('admin',      'm15.awarding_path_rule.configure', 'all'),
  ('manager',    'm15.awarding_path_rule.configure', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.awarding_paths (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_definition_id  UUID NOT NULL REFERENCES public.title_definitions(id) ON DELETE CASCADE,
  code                 VARCHAR(100) NOT NULL,
  name                 VARCHAR(200) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.awarding_paths IS
  'Sumber: STEP10-D entity AWARDING_PATHS. Satu Title bisa punya banyak jalur kelulusan (mis. "jalur ujian" vs "jalur pengalaman kerja") — awarding_paths adalah definisi jalur itu, awarding_path_versions (di bawah) adalah versi konkretnya.';

CREATE TABLE IF NOT EXISTS public.awarding_path_versions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awarding_path_id     UUID NOT NULL REFERENCES public.awarding_paths(id) ON DELETE CASCADE,
  version_no           INT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'draft',
  effective_from       TIMESTAMPTZ,
  effective_to         TIMESTAMPTZ,
  definition_snapshot  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (awarding_path_id, version_no)
);

COMMENT ON TABLE public.awarding_path_versions IS
  'Sumber: STEP10-D entity AWARDING_PATH_VERSIONS. Inilah tabel yang ditunggu `qualification_evaluations.awarding_path_version_id`/`award_instances.awarding_path_version_id` (NULLABLE tanpa FK sejak 0026) — FK retroaktifnya ditutup di 0069. UNIQUE(awarding_path_id, version_no) ditambahkan untuk integritas referensial, pola sama seperti learning_path_versions/0057.';

ALTER TABLE public.awarding_paths         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awarding_path_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY awarding_paths_manage ON public.awarding_paths
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));

CREATE POLICY awarding_path_versions_manage ON public.awarding_path_versions
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));
