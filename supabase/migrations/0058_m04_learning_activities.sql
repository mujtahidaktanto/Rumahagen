-- 0058_m04_learning_activities.sql
-- Fase 2 (lanjutan 0056/0057): LEARNING_ACTIVITIES/LEARNING_ACTIVITY_
-- COMPLETIONS/LEARNING_UNLOCK_PROGRESSIONS. Sumber kolom: STEP10-D_
-- ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv — TANPA deviasi (dan
-- TANPA menambah CHECK constraint yang tidak dievidence: `activity_type`,
-- `learning_activities.status`, `completion_status`/`outcome`, dan `state`
-- semuanya TEXT bebas persis apa adanya di sumber — beda dari
-- `qualification_evaluations.result` M15 yang memang terkunci enum).
-- Kontrak API: STEP11-B4 API-064-068/076-078. Q-M04-LC-02A/02B eksplisit:
-- "learner completion is an input/claim; M04/server validates evidence and
-- state" — completion BUKAN outcome otoritatif langsung dari klaim learner,
-- tapi STEP11-B4 sendiri TIDAK mengevidence aturan validasi eksak apa pun
-- (beda dari session_completion_outcomes/0022 yang punya aturan tertulis
-- "hanya enrollment active" dari Gate §33) — jadi TIDAK ada trigger validasi
-- tambahan di sini, hanya RLS kepemilikan dasar (pola sama seperti
-- `ai_providers`/0015 yang tidak diberi data melebihi yang dievidensi).
--
-- PERMISSION BARU: `m04.learning_activity.manage` (Superadmin/Admin/
-- Manager=ALL — TIDAK ADA kolom owner di LEARNING_ACTIVITIES, sama seperti
-- learning_paths/0057) dan `m04.learning_activity_completion.create`
-- (Agent=OWN — completion claim adalah aksi milik learner sendiri, sesuai
-- Q-M04-LC-02A).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.learning_activity.manage', 'all', 'Learning Activity - Manage (ADD-NEW, definisi activity — TIDAK ADA kolom owner fisik, hanya scope ALL Superadmin/Admin/Manager)'),
  ('m04', 'm04.learning_activity_completion.create', 'own', 'Learning Activity Completion - Create (ADD-NEW, Q-M04-LC-02A: completion adalah input/claim milik learner sendiri, bukan outcome otoritatif)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.learning_activity.manage', 'all'),
  ('admin',      'm04.learning_activity.manage', 'all'),
  ('manager',    'm04.learning_activity.manage', 'all'),
  ('superadmin', 'm04.learning_activity_completion.create', 'all'),
  ('admin',      'm04.learning_activity_completion.create', 'all'),
  ('manager',    'm04.learning_activity_completion.create', 'all'),
  ('agent',      'm04.learning_activity_completion.create', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.learning_activities (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_version_id  UUID REFERENCES public.learning_path_versions(id) ON DELETE SET NULL,
  code                      VARCHAR(100) NOT NULL,
  activity_type             TEXT NOT NULL,
  title                     VARCHAR(200) NOT NULL,
  description               TEXT,
  sequence_no               INT NOT NULL DEFAULT 0,
  completion_required       BOOLEAN NOT NULL DEFAULT true,
  reward_lp                 NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (reward_lp >= 0),
  status                    TEXT NOT NULL DEFAULT 'active',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_activities IS
  'Sumber: STEP10-D entity LEARNING_ACTIVITIES. `reward_lp` di sini HANYA definisi/janji reward — pemberian LP sungguhan tetap HARUS lewat `grant_learning_points_from_purchase()`/`adjust_learning_points()` (0025/0046), tabel ini TIDAK melakukan INSERT ke learning_point_transactions sendiri (menghindari 2 jalur reward LP yang tidak konsisten).';

CREATE TABLE IF NOT EXISTS public.learning_activity_completions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_activity_id   UUID NOT NULL REFERENCES public.learning_activities(id) ON DELETE RESTRICT,
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completion_status      TEXT NOT NULL,
  outcome                TEXT,
  evidence_reference     TEXT,
  attempt_no             INT NOT NULL DEFAULT 1 CHECK (attempt_no > 0),
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_activity_completions IS
  'Sumber: STEP10-D entity LEARNING_ACTIVITY_COMPLETIONS. Rerun STEP10-D menghapus 1 baris phantom attribute "OR" dari mapping upstream tabel ini (token CHECK-expression yang salah dibaca sebagai kolom) — tidak mengubah skema fisik yang dipakai di sini.';

CREATE TABLE IF NOT EXISTS public.learning_unlock_progressions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  learning_path_version_id  UUID NOT NULL REFERENCES public.learning_path_versions(id) ON DELETE RESTRICT,
  state                     TEXT NOT NULL,
  source_type               VARCHAR(100),
  source_reference          TEXT,
  unlocked_at               TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_unlock_progressions IS
  'Sumber: STEP10-D entity LEARNING_UNLOCK_PROGRESSIONS. Q-M04-C-05B "LearningPath.Progression Manage" dicatat CONTROLLED API GAP ("no invented progression mutation route") — TIDAK ADA mekanisme mutasi client-authoritative yang dievidence, jadi TIDAK ADA RLS INSERT/UPDATE untuk Agent di sini (hanya staf lewat m04.learning_activity.manage sebagai stop-gap administratif, sampai mekanisme progression resmi dibangun). `source_type`/`source_reference` mengikuti pola field konsisten yang sama seperti learning_point_transactions/qualification_evidence.';

ALTER TABLE public.learning_activities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity_completions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_unlock_progressions   ENABLE ROW LEVEL SECURITY;

-- learning_activities — 'active' publik (nilai default = langsung tersedia,
-- beda dari courses/learning_paths yang default 'draft' = tersembunyi).
CREATE POLICY learning_activities_select ON public.learning_activities
  FOR SELECT USING (
    status = 'active'
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
  );

CREATE POLICY learning_activities_manage ON public.learning_activities
  FOR ALL USING (public.has_permission('m04.learning_activity.manage'))
  WITH CHECK (public.has_permission('m04.learning_activity.manage'));

-- learning_activity_completions — Agent lihat/klaim completion miliknya
-- sendiri, staf lihat/kelola semua (oversight, scope 'all' di seed di atas).
CREATE POLICY learning_activity_completions_select ON public.learning_activity_completions
  FOR SELECT USING (public.has_permission('m04.learning_activity_completion.create', user_id));

CREATE POLICY learning_activity_completions_insert ON public.learning_activity_completions
  FOR INSERT WITH CHECK (public.has_permission('m04.learning_activity_completion.create', user_id));

-- learning_unlock_progressions — Agent HANYA SELECT progres miliknya
-- sendiri (API-062/067 "own progression" read surface), TIDAK ADA jalur
-- mutasi client (lihat catatan CONTROLLED API GAP di atas). Staf tetap bisa
-- lihat/kelola semua sebagai stop-gap administratif.
CREATE POLICY learning_unlock_progressions_select ON public.learning_unlock_progressions
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.has_permission('m04.learning_activity.manage')
  );

CREATE POLICY learning_unlock_progressions_manage_staff ON public.learning_unlock_progressions
  FOR ALL USING (public.has_permission('m04.learning_activity.manage'))
  WITH CHECK (public.has_permission('m04.learning_activity.manage'));
