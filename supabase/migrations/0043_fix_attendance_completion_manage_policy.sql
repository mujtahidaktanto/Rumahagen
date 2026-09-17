-- 0043_fix_attendance_completion_manage_policy.sql
-- Menutup BUG FUNGSIONAL (ditemukan saat testing REST API M04, pola sama
-- persis seperti 0041 di M06): RLS `session_attendance_evaluations_manage`
-- dan `session_completion_outcomes_manage` (0022) memanggil has_permission()
-- TANPA argumen p_owner_id sama sekali:
--
--   has_permission('m04.attendance.manage')
--   has_permission('m04.completion.manage')
--
-- has_permission() default p_owner_id=NULL, dan scope 'own' hanya true kalau
-- "p_owner_id IS NOT NULL AND p_owner_id = auth.uid()" — karena p_owner_id
-- SELALU NULL di policy lama, Instructor (yang punya scope 'own' untuk
-- KEDUA permission ini di seed 0009) TIDAK PERNAH bisa lolos WITH CHECK,
-- walau semantiknya seharusnya boleh mengelola attendance/completion untuk
-- session yang dia ampu sendiri. Hanya Superadmin/Admin/Manager (scope
-- 'all') yang secara fungsional bisa lewat policy ini. Dikonfirmasi lewat
-- test nyata: Instructor evaluate attendance session miliknya sendiri
-- ditolak RLS (403).
--
-- PERBAIKAN: kirim owner_id yang benar — pemilik SESSION (learning_sessions.owner_id),
-- dijangkau lewat session_enrollment_id -> session_enrollments.session_id ->
-- learning_sessions.owner_id. Ini konsisten dengan makna "Instructor
-- mengelola attendance/completion utuk session yang dia ampu".

DROP POLICY IF EXISTS session_attendance_evaluations_manage ON public.session_attendance_evaluations;

CREATE POLICY session_attendance_evaluations_manage ON public.session_attendance_evaluations
  FOR ALL USING (
    public.has_permission('m04.attendance.manage', (
      SELECT ls.owner_id FROM public.session_enrollments se
      JOIN public.learning_sessions ls ON ls.id = se.session_id
      WHERE se.id = session_attendance_evaluations.session_enrollment_id
    ))
  )
  WITH CHECK (
    public.has_permission('m04.attendance.manage', (
      SELECT ls.owner_id FROM public.session_enrollments se
      JOIN public.learning_sessions ls ON ls.id = se.session_id
      WHERE se.id = session_attendance_evaluations.session_enrollment_id
    ))
  );

DROP POLICY IF EXISTS session_completion_outcomes_manage ON public.session_completion_outcomes;

CREATE POLICY session_completion_outcomes_manage ON public.session_completion_outcomes
  FOR ALL USING (
    public.has_permission('m04.completion.manage', (
      SELECT ls.owner_id FROM public.session_enrollments se
      JOIN public.learning_sessions ls ON ls.id = se.session_id
      WHERE se.id = session_completion_outcomes.session_enrollment_id
    ))
  )
  WITH CHECK (
    public.has_permission('m04.completion.manage', (
      SELECT ls.owner_id FROM public.session_enrollments se
      JOIN public.learning_sessions ls ON ls.id = se.session_id
      WHERE se.id = session_completion_outcomes.session_enrollment_id
    ))
  );
