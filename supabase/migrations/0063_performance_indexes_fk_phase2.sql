-- 0063_performance_indexes_fk_phase2.sql
-- ADD-NEW — penutup Fase 2 (0056-0062), pola dan alasan PERSIS sama seperti
-- 0038/0053: index B-tree untuk kolom FK yang akan ditandai "Unindexed
-- foreign keys" oleh Supabase Performance Advisor.
--
-- Tidak termasuk: `enrollments.agent_id` dan `learning_path_versions.
-- learning_path_id` (kolom pertama pada UNIQUE komposit masing-masing,
-- sudah otomatis punya index leftmost-prefix — pola sama seperti catatan
-- di 0038/0053).

CREATE INDEX IF NOT EXISTS idx_courses_prerequisite_course_id ON public.courses (prerequisite_course_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON public.courses (created_by);

CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons (course_id);

CREATE INDEX IF NOT EXISTS idx_learning_paths_course_id ON public.learning_paths (course_id);

CREATE INDEX IF NOT EXISTS idx_learning_activities_learning_path_version_id ON public.learning_activities (learning_path_version_id);

CREATE INDEX IF NOT EXISTS idx_learning_activity_completions_learning_activity_id ON public.learning_activity_completions (learning_activity_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_completions_user_id ON public.learning_activity_completions (user_id);

CREATE INDEX IF NOT EXISTS idx_learning_unlock_progressions_user_id ON public.learning_unlock_progressions (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_unlock_progressions_learning_path_version_id ON public.learning_unlock_progressions (learning_path_version_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON public.quiz_options (question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON public.quiz_attempts (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts (quiz_id);

CREATE INDEX IF NOT EXISTS idx_certificates_agent_id ON public.certificates (agent_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates (course_id);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_course_id ON public.learning_sessions (course_id);
