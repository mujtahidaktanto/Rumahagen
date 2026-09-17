-- 0060_m04_quizzes.sql
-- Fase 2 (lanjutan 0056-0059): QUIZZES/QUIZ_QUESTIONS/QUIZ_OPTIONS/
-- QUIZ_ATTEMPTS. Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_
-- RECONCILIATION.csv, tanpa deviasi. Kontrak API: STEP11-B4 API-055
-- (POST /courses/{id}/quiz/submit — "PRESERVE; not Award issuance") dan
-- API-060 (POST /admin/courses/{id}/quizzes).
--
-- TIDAK ADA permission baru untuk quizzes/quiz_questions/quiz_options —
-- ketiganya konten milik course (quizzes.course_id NOT NULL), dikelola
-- lewat `m04.course.manage` yang sama persis seperti course_lessons/0056
-- (pola join-ke-courses.created_by). quiz_attempts JUGA TIDAK ADA
-- permission baru — kepemilikan diturunkan lewat join ke
-- `enrollments.agent_id` (attempt HANYA valid kalau enrollment-nya ada,
-- FK NOT NULL enrollment_id), jadi cukup pengecekan langsung
-- `agent_id = auth.uid()` pada baris enrollment terkait (pola sama seperti
-- listing_photos/0047 join ke listings.agent_id) — bukan has_permission()
-- baru untuk resource yang sudah punya rantai kepemilikan jelas.

CREATE TABLE IF NOT EXISTS public.quizzes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      VARCHAR(200)
);

COMMENT ON TABLE public.quizzes IS 'Sumber: STEP10-D entity QUIZZES.';

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  TEXT NOT NULL CHECK (question_type IN ('single_choice','multi_choice'))
);

COMMENT ON TABLE public.quiz_questions IS 'Sumber: STEP10-D entity QUIZ_QUESTIONS.';

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text  VARCHAR(500) NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE public.quiz_options IS
  'Sumber: STEP10-D entity QUIZ_OPTIONS. `is_correct` HANYA boleh terlihat pemilik course/staf (lihat RLS quiz_options_select di bawah) — Agent yang sedang mengerjakan quiz TIDAK BOLEH melihat kunci jawaban sebelum submit, konsisten dengan semantik "quiz" sungguhan (bukan sekadar tabel referensi terbuka seperti amenities).';

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score          DECIMAL(5,2),
  passed         BOOLEAN,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quiz_attempts IS
  'Sumber: STEP10-D entity QUIZ_ATTEMPTS. `enrollment_id` NOT NULL — attempt HANYA valid kalau Agent sudah enroll ke course terkait (pola sama seperti session_completion_outcomes.session_enrollment_id/0022, tapi di sini cukup FK biasa karena tidak ada aturan "harus enrollment aktif" yang dievidence eksplisit seperti Gate §33 milik M04 Session).';

ALTER TABLE public.quizzes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts  ENABLE ROW LEVEL SECURITY;

-- quizzes/quiz_questions — dibaca sama seperti course induknya (pemilik
-- course melihat untuk mengelola; Agent TIDAK otomatis melihat soal hanya
-- karena course published — mengerjakan quiz adalah aksi tersendiri lewat
-- quiz_attempts, bukan browsing soal seperti course_lessons).
CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND public.has_permission('m04.course.manage', c.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = quizzes.course_id AND e.agent_id = auth.uid()
    )
  );

CREATE POLICY quizzes_manage ON public.quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );

CREATE POLICY quiz_questions_select ON public.quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_questions.quiz_id AND public.has_permission('m04.course.manage', c.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.quizzes q JOIN public.enrollments e ON e.course_id = q.course_id
      WHERE q.id = quiz_questions.quiz_id AND e.agent_id = auth.uid()
    )
  );

CREATE POLICY quiz_questions_manage ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_questions.quiz_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_questions.quiz_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );

-- quiz_options — HANYA pemilik course/staf yang lihat is_correct (kunci
-- jawaban). Agent yang sedang mengerjakan TIDAK diberi akses SELECT
-- langsung ke tabel ini sama sekali (opsi jawaban disajikan lewat lapisan
-- REST API nanti dari quiz_questions tanpa expose is_correct, bukan lewat
-- query langsung ke tabel ini).
CREATE POLICY quiz_options_select ON public.quiz_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qq.id = quiz_options.question_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );

CREATE POLICY quiz_options_manage ON public.quiz_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qq.id = quiz_options.question_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qq.id = quiz_options.question_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );

-- quiz_attempts — pemilik enrollment (Agent yang mengerjakan) atau
-- pemilik course/staf (mengawasi hasil).
CREATE POLICY quiz_attempts_select ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_attempts.quiz_id AND public.has_permission('m04.course.manage', c.created_by)
    )
  );

CREATE POLICY quiz_attempts_insert ON public.quiz_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid()
    )
  );
