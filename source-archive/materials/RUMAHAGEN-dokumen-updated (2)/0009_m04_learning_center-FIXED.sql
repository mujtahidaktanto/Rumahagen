-- ============================================================================
-- Migration 0009: Modul 4 — Learning Center
-- ENT: ENT-M04-Course/CourseLesson/Quiz/QuizQuestion/QuizOption/Enrollment/QuizAttempt/Certificate
-- ============================================================================
-- CHANGELOG:
-- [2026-08-09] Fix RLS gap (Konflik #1 & #3, MP-04-LearningCenter-Module-Planning
--   §51 Conflict Analysis). Sebelumnya dokumen MP-04 mengklaim perbaikan ini
--   sudah dieksekusi "2026-08-06", tapi verifikasi audit konsolidasi 9 Agustus
--   2026 membuktikan migration ini (versi sebelum patch ini) belum memuatnya.
--   4 policy diperbaiki di siklus ini:
--   1. quiz_questions_manage — tambah ownership join quiz→course (Instructor
--      bisa kelola bank soal kursus miliknya sendiri).
--   2. quiz_options_manage — tambah ownership join option→question→quiz→course.
--   3. enrollments_own — tambah akses Instructor via course.created_by (USING
--      saja, agar Instructor bisa lihat progress peserta kursusnya; WITH CHECK
--      insert/update oleh Agen tidak diubah).
--   4. quiz_attempts_own — tambah akses Instructor via enrollment→course
--      (USING saja, pola sama seperti enrollments_own).
-- ============================================================================

CREATE TABLE courses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   VARCHAR(200) NOT NULL,
  category                TEXT CHECK (category IN ('sales_skill','legal_regulasi','produk_developer','financial_kpr','lainnya')),
  description             TEXT,
  prerequisite_course_id  UUID REFERENCES courses(id) ON DELETE SET NULL,
  passing_grade           SMALLINT NOT NULL DEFAULT 70,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  deleted_at              TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE course_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         VARCHAR(200),
  content_type  TEXT CHECK (content_type IN ('video','pdf','slide')),
  content_url   VARCHAR(500),
  sort_order    SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_course_lessons_course ON course_lessons(course_id);

CREATE TABLE quizzes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(200)
);

CREATE TABLE quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  TEXT NOT NULL CHECK (question_type IN ('single_choice','multi_choice'))
);

CREATE TABLE quiz_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   VARCHAR(500) NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  progress_percent  SMALLINT NOT NULL DEFAULT 0,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (agent_id, course_id)
);

CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score           DECIMAL(5,2),
  passed          BOOLEAN,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url   VARCHAR(500),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, course_id)
);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY courses_select_published ON courses FOR SELECT TO authenticated
  USING (status = 'published' OR created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'));
CREATE POLICY courses_manage_own ON courses FOR ALL TO authenticated
  USING (created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'))
  WITH CHECK (created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY course_lessons_select ON course_lessons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_lessons.course_id AND c.status = 'published')
         OR auth_has_scope_all('M04_learning','manage'));
CREATE POLICY course_lessons_manage ON course_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_lessons.course_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quizzes_select ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY quizzes_manage ON quizzes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = quizzes.course_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quiz_questions_select ON quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY quiz_questions_manage ON quiz_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM quizzes qz JOIN courses c ON c.id = qz.course_id
                 WHERE qz.id = quiz_questions.quiz_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'))
  WITH CHECK (EXISTS (SELECT 1 FROM quizzes qz JOIN courses c ON c.id = qz.course_id
                       WHERE qz.id = quiz_questions.quiz_id AND c.created_by = auth.uid())
              OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quiz_options_select ON quiz_options FOR SELECT TO authenticated USING (true);
CREATE POLICY quiz_options_manage ON quiz_options FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes qz ON qz.id = qq.quiz_id JOIN courses c ON c.id = qz.course_id
                 WHERE qq.id = quiz_options.question_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'))
  WITH CHECK (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes qz ON qz.id = qq.quiz_id JOIN courses c ON c.id = qz.course_id
                       WHERE qq.id = quiz_options.question_id AND c.created_by = auth.uid())
              OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY enrollments_own ON enrollments FOR ALL TO authenticated
  USING (agent_id = auth.uid()
         OR EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','view'))
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid())
         OR EXISTS (SELECT 1 FROM enrollments e JOIN courses c ON c.id = e.course_id
                     WHERE e.id = quiz_attempts.enrollment_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','view'))
  WITH CHECK (EXISTS (SELECT 1 FROM enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid()));

CREATE POLICY certificates_select ON certificates FOR SELECT TO anon, authenticated
  USING (true);  -- badge tampil publik di profil agen
