-- 0059_m04_course_enrollments.sql
-- Fase 2 (lanjutan 0056-0058): ENROLLMENTS — Course Enrollment, SECARA
-- EKSPLISIT terpisah dari `session_enrollments` (M04 Session, 0021).
-- STEP11-B4 §8: "Course Enrollment API-053/API-054 is distinct from
-- Session Enrollment." Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_
-- COLUMN_RECONCILIATION.csv, tanpa deviasi. Kontrak API: API-053
-- (POST /courses/{id}/enroll), API-054 (GET /agents/me/enrollments).
--
-- PERMISSION BARU: `m04.course_enrollment.create` + `.view` — pola PERSIS
-- sama seperti `m04.session_enrollment.create`/`.view` yang sudah ada
-- (dua action code terpisah untuk create vs view, bukan digabung satu
-- "manage"), Agent=OWN keduanya (namespace API literal `/agents/me/*`),
-- Superadmin/Admin/Manager=ALL (view saja — staf tidak enroll diri sendiri).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.course_enrollment.create', 'own', 'Course Enrollment - Create (ADD-NEW, distinct dari m04.session_enrollment.create — API-053 Course Enrollment bukan Session Enrollment)'),
  ('m04', 'm04.course_enrollment.view', 'own', 'Course Enrollment - View (ADD-NEW, distinct dari m04.session_enrollment.view)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('agent',      'm04.course_enrollment.create', 'own'),
  ('agent',      'm04.course_enrollment.view', 'own'),
  ('superadmin', 'm04.course_enrollment.view', 'all'),
  ('admin',      'm04.course_enrollment.view', 'all'),
  ('manager',    'm04.course_enrollment.view', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  progress_percent  SMALLINT NOT NULL DEFAULT 0,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (agent_id, course_id)
);

COMMENT ON TABLE public.enrollments IS
  'Sumber: STEP10-D entity ENROLLMENTS. `agent_id` mengikuti penamaan sumber apa adanya (pola sama seperti catatan agent_ai_connections/0016, session_enrollments/0021 — bukan berarti hanya role Agent yang bisa punya baris di sini secara struktural, tapi scope permission di migration ini memang membatasinya ke Agent). UNIQUE(agent_id, course_id) mencegah enroll ganda pada course yang sama (tidak eksplisit di STEP10-D, tapi konsisten dengan UNIQUE(session_id, agent_id) di session_enrollments).';

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY enrollments_select ON public.enrollments
  FOR SELECT USING (public.has_permission('m04.course_enrollment.view', agent_id));

CREATE POLICY enrollments_insert ON public.enrollments
  FOR INSERT WITH CHECK (public.has_permission('m04.course_enrollment.create', agent_id));

-- UPDATE (progress_percent/status/completed_at) dibatasi pemilik enrollment
-- sendiri lewat permission view yang sama (own) — completion sesungguhnya
-- tetap TIDAK otoritatif dari sisi klien semata (lihat catatan
-- learning_activity_completions/0058), UPDATE di sini hanya progres
-- kasar (progress_percent), bukan mekanisme grant reward.
CREATE POLICY enrollments_update ON public.enrollments
  FOR UPDATE USING (public.has_permission('m04.course_enrollment.view', agent_id));
