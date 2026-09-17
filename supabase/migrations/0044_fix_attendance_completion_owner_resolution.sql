-- 0044_fix_attendance_completion_owner_resolution.sql
-- Menutup bug LANJUTAN dari 0043 (ditemukan langsung saat re-test setelah
-- 0043 diterapkan — migration yang SUDAH applied tidak diedit ulang,
-- perbaikan lewat migration baru, pola sama seperti koreksi 0028 atas 0014).
--
-- 0043 menambahkan subquery owner-resolution langsung di ekspresi CREATE
-- POLICY:
--   (SELECT ls.owner_id FROM session_enrollments se JOIN learning_sessions ls...)
-- TAPI subquery yang ditulis LANGSUNG di ekspresi policy (bukan di dalam
-- fungsi SECURITY DEFINER) dieksekusi sebagai ROLE PEMANGGIL, sehingga
-- TUNDUK PADA RLS tabel yang di-query di dalamnya. Instructor yang meng-
-- evaluate attendance/completion TIDAK PUNYA akses SELECT ke baris
-- `session_enrollments` milik Agent lain (RLS session_enrollments_select:
-- scope 'own' Instructor hanya cocok kalau agent_id = auth.uid() —
-- enrollment ini punya agent_id = Agent, bukan Instructor) — subquery itu
-- mengembalikan NULL (baris tersaring RLS), has_permission(..., NULL) gagal
-- untuk scope 'own'. Dikonfirmasi lewat re-test nyata: Instructor tetap
-- ditolak 403 setelah 0043.
--
-- PERBAIKAN: bungkus owner-resolution dalam fungsi SECURITY DEFINER (pola
-- IDENTIK dengan has_permission()/current_role_code() di 0006 — satu-satunya
-- cara query lintas-RLS yang benar di codebase ini), lalu pakai fungsi itu
-- sebagai argumen has_permission() di kedua policy.

CREATE OR REPLACE FUNCTION public.session_owner_for_enrollment(p_enrollment_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ls.owner_id
  FROM public.session_enrollments se
  JOIN public.learning_sessions ls ON ls.id = se.session_id
  WHERE se.id = p_enrollment_id;
$$;

COMMENT ON FUNCTION public.session_owner_for_enrollment IS
  'SECURITY DEFINER — resolve owner_id session dari session_enrollment_id lintas-RLS, dipakai has_permission() di session_attendance_evaluations_manage/session_completion_outcomes_manage (0043/0044). Bukan fungsi otorisasi baru (R-02 tetap ditegakkan has_permission di 0006) — murni helper lookup yang perlu bypass RLS seperti has_permission sendiri.';

DROP POLICY IF EXISTS session_attendance_evaluations_manage ON public.session_attendance_evaluations;

CREATE POLICY session_attendance_evaluations_manage ON public.session_attendance_evaluations
  FOR ALL USING (
    public.has_permission('m04.attendance.manage', public.session_owner_for_enrollment(session_enrollment_id))
  )
  WITH CHECK (
    public.has_permission('m04.attendance.manage', public.session_owner_for_enrollment(session_enrollment_id))
  );

DROP POLICY IF EXISTS session_completion_outcomes_manage ON public.session_completion_outcomes;

CREATE POLICY session_completion_outcomes_manage ON public.session_completion_outcomes
  FOR ALL USING (
    public.has_permission('m04.completion.manage', public.session_owner_for_enrollment(session_enrollment_id))
  )
  WITH CHECK (
    public.has_permission('m04.completion.manage', public.session_owner_for_enrollment(session_enrollment_id))
  );
