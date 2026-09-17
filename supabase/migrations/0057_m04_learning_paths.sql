-- 0057_m04_learning_paths.sql
-- Fase 2 (lanjutan 0056): LEARNING_PATHS/LEARNING_PATH_VERSIONS. Sumber
-- kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa
-- deviasi. Kontrak API: STEP11-B4 API-061/062 (GET /learning/paths,
-- GET /learning/paths/{id} — "PRESERVE"); Q-M04-C-05A "LearningPath —
-- Configure" dicatat CONTROLLED API GAP (semantik terkunci, TAPI tidak ada
-- route admin eksak yang dievidence) — migration ini menyiapkan RLS-nya
-- saja (prasyarat), route HTTP-nya menyusul di batch REST terpisah nanti.
--
-- PERMISSION BARU: `m04.learning_path.manage`. TIDAK ADA kolom
-- created_by/owner apa pun di LEARNING_PATHS/LEARNING_PATH_VERSIONS (beda
-- dari COURSES) — jadi TIDAK ADA scope 'own' yang bisa diberikan ke
-- Instructor di sini (tidak ada kolom untuk menaut kepemilikan). Scope
-- HANYA Superadmin/Admin/Manager=ALL, konsisten dengan pola permission
-- tanpa-owner lain di repo (mis. `m11.static_public_content.publish`,
-- `m15.title_authority_scope_binding.configure`).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.learning_path.manage', 'all', 'Learning Path - Manage (ADD-NEW, Q-M04-C-05A "LearningPath Configure" — semantik terkunci, TIDAK ADA kolom owner fisik jadi hanya scope ALL untuk Superadmin/Admin/Manager)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.learning_path.manage', 'all'),
  ('admin',      'm04.learning_path.manage', 'all'),
  ('manager',    'm04.learning_path.manage', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.learning_paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  code        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_paths IS
  'Sumber: STEP10-D entity LEARNING_PATHS. `course_id` NULLABLE apa adanya (sumber tidak menandainya NOT NULL) — satu Learning Path bisa berdiri sendiri tanpa terikat Course tertentu. `status` TEXT bebas tanpa CHECK di sumber (beda dari courses.status yang terkunci enum) — dipertahankan apa adanya, konvensi nilai "draft/published/archived" dipakai di RLS tanpa memaksakan CHECK constraint yang tidak dievidence.';

CREATE TABLE IF NOT EXISTS public.learning_path_versions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  version_no           INT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'draft',
  effective_from       TIMESTAMPTZ,
  effective_to         TIMESTAMPTZ,
  definition_snapshot  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (learning_path_id, version_no)
);

COMMENT ON TABLE public.learning_path_versions IS
  'Sumber: STEP10-D entity LEARNING_PATH_VERSIONS. Pola versioning sama seperti `awarding_path_versions` (M15) — satu Learning Path bisa punya banyak versi, `learning_activities.learning_path_version_id` menaut ke versi spesifik (bukan ke learning_paths langsung), sehingga path bisa direvisi tanpa mengubah histori progres yang sudah terjadi di versi lama. UNIQUE(learning_path_id, version_no) ditambahkan untuk integritas referensial (tidak ada di STEP10-D literal, tapi konsisten dengan semantik "version_no" sebagai penomor urut per path).';

ALTER TABLE public.learning_paths         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_paths_select ON public.learning_paths
  FOR SELECT USING (
    status = 'published'
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
  );

CREATE POLICY learning_paths_manage ON public.learning_paths
  FOR ALL USING (public.has_permission('m04.learning_path.manage'))
  WITH CHECK (public.has_permission('m04.learning_path.manage'));

CREATE POLICY learning_path_versions_select ON public.learning_path_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths lp
      WHERE lp.id = learning_path_versions.learning_path_id
        AND (
          lp.status = 'published'
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
        )
    )
  );

CREATE POLICY learning_path_versions_manage ON public.learning_path_versions
  FOR ALL USING (public.has_permission('m04.learning_path.manage'))
  WITH CHECK (public.has_permission('m04.learning_path.manage'));
