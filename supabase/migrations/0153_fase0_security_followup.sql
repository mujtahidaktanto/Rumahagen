-- 0153_fase0_security_followup.sql
-- Lanjutan Fase 0 keamanan (audit/FASE0_SECURITY_PLAN.md) setelah 0146:
--   1. Pembantu internal yang masih bisa dipanggil lewat RPC:
--      * next_certificate_number() dan new_certificate_verification_code(): hanya dipanggil issue_certificate_internal (SECURITY DEFINER, jalan sebagai pemilik).
--        next_certificate_number MENULIS penghitung; siapa pun yang login bisa membakar nomor sertifikat (lubang nomor). Cabut dari anon dan authenticated.
--      * course_enroll_problem(uuid, uuid) dan session_enrollment_agent(uuid): dipanggil trigger INVOKER (enrollments, evaluasi sesi) yang berjalan sebagai pengguna
--        yang login, jadi authenticated harus tetap; cabut hanya dari anon.
--   2. View public_agent_profiles: anon dan authenticated memegang SEMUA hak (INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES). View kompleks ini tidak bisa
--      ditulis, tetapi hak berlebih dicabut; tersisa SELECT (proyeksi publik yang disengaja tetap SECURITY DEFINER).
--   3. current_role_code() NULL-aman. Pengguna login tanpa baris users (yatim) membuat current_role_code() dan is_superadmin() NULL, sehingga guard berpola
--      `IF NOT (is_superadmin() OR current_role_code() IN (...)) THEN RAISE` (NOT NULL = NULL) TIDAK menolak: admin_analytics_flow, admin_analytics_funnel,
--      notify_expiring_listings, send_event_reminders dst. lolos. Sekarang bernilai '' (bukan NULL) untuk pengguna tanpa peran, sehingga guard menolak. Tidak ada
--      kode/policy yang membandingkan current_role_code() dengan NULL (dicek di pg_proc, pg_policy, dan apps/web).

-- ═══ 1. Pembantu internal ═══
REVOKE ALL ON FUNCTION public.next_certificate_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.new_certificate_verification_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.course_enroll_problem(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.course_enroll_problem(uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.session_enrollment_agent(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.session_enrollment_agent(uuid) TO authenticated, service_role;

-- ═══ 2. Hak view publik ═══
REVOKE ALL ON public.public_agent_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;

-- ═══ 3. current_role_code NULL-aman ═══
CREATE OR REPLACE FUNCTION public.current_role_code()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT r.code FROM public.users u JOIN public.roles r ON r.id = u.role_id WHERE u.id = auth.uid()), '');
$$;
