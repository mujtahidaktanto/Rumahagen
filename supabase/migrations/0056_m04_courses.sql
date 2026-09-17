-- 0056_m04_courses.sql
-- Fase 2 dari rencana "100% tabel" — M04 Learning Catalog/Activity (13
-- tabel, di luar Session/Evidence yang sudah selesai di Tahap 5/STEP11-B5).
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- entity COURSES/COURSE_LESSONS — PRESERVE_EXACT_PHYSICAL_CORROBORATION,
-- tanpa deviasi. Kontrak API: STEP11-B4 API-051/052/057/058/059
-- (GET /courses, GET /courses/{id}, POST/PUT /admin/courses,
-- POST /admin/courses/{id}/lessons — "PRESERVE").
--
-- PERMISSION BARU: `m04.course.manage`. Tidak ada satu pun baris Course/
-- Learning Catalog di master matrix 50-baris (dicek ke
-- M10_PERMISSION_SEED_TRACEABILITY.csv — nihil) — modul M04 yang sudah
-- ada sepenuhnya soal Session (learning_session.*/session_enrollment.*/
-- session_evidence.*), resource Course adalah domain terpisah. Scope:
-- Instructor=OWN (via `created_by`, pola identik `learning_sessions.
-- owner_id` — Instructor pembuat konten mengelola kontennya sendiri),
-- Superadmin/Admin/Manager=ALL. Agent TIDAK diberi scope apa pun di sini
-- (course_lessons konten milik penulis course, Agent hanya konsumen —
-- akses baca lewat SELECT publik untuk course published, bukan lewat
-- permission ini).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.course.manage', 'own', 'Course - Manage (ADD-NEW, tidak ada baris Course di master matrix; Instructor=OWN kelola course buatannya sendiri + lessons-nya, Superadmin/Admin/Manager=ALL)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.course.manage', 'all'),
  ('admin',      'm04.course.manage', 'all'),
  ('manager',    'm04.course.manage', 'all'),
  ('instructor', 'm04.course.manage', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.courses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   VARCHAR(200) NOT NULL,
  category                TEXT CHECK (category IN ('sales_skill','legal_regulasi','produk_developer','financial_kpr','lainnya')),
  description             TEXT,
  prerequisite_course_id  UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  passing_grade           SMALLINT NOT NULL DEFAULT 70,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by              UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  deleted_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.courses IS
  'Sumber: STEP10-D entity COURSES. M04 Learning Catalog — TERPISAH dari learning_sessions (M04 Session, 0021): course adalah konten self-paced/katalog, session adalah live/terjadwal. `prerequisite_course_id` self-referencing (course lain harus lulus dulu), divalidasi di lapisan aplikasi (tidak ada trigger cycle-detection di sini — STEP10-D tidak mengevidence aturan itu).';

CREATE TABLE IF NOT EXISTS public.course_lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title        VARCHAR(200),
  content_type TEXT CHECK (content_type IN ('video','pdf','slide')),
  content_url  VARCHAR(500),
  sort_order   SMALLINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.course_lessons IS 'Sumber: STEP10-D entity COURSE_LESSONS.';

ALTER TABLE public.courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- courses — published publik (katalog, API-051/052 tidak menyaratkan auth),
-- pembuat/staf selalu bisa lihat draft/archived miliknya.
CREATE POLICY courses_select ON public.courses
  FOR SELECT USING (
    status = 'published'
    OR created_by = auth.uid()
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
  );

CREATE POLICY courses_manage ON public.courses
  FOR ALL USING (public.has_permission('m04.course.manage', created_by))
  WITH CHECK (public.has_permission('m04.course.manage', created_by));

-- course_lessons — dibaca sama seperti course induknya, dikelola pemilik
-- course lewat m04.course.manage (pola join sama seperti listing_photos/0047).
CREATE POLICY course_lessons_select ON public.course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id
        AND (
          c.status = 'published'
          OR c.created_by = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
        )
    )
  );

CREATE POLICY course_lessons_manage ON public.course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );
