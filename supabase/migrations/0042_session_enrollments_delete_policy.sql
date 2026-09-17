-- 0042_session_enrollments_delete_policy.sql
-- Menutup GAP fisik: STEP11-B5 (API-097) meng-evidence
-- "DELETE /learning/session-enrollments/{enrollment_id}" (Withdrawal/
-- cancellation) sebagai current preserved route, TAPI migration
-- 0021_m04_learning_sessions.sql tidak pernah membuat RLS policy untuk
-- command DELETE di tabel `session_enrollments` — diverifikasi lewat
-- pg_policies (hanya insert/select/update-staff yang ada). Pola gap yang
-- sama seperti events (0039) dan developer_projects (0040).
--
-- KEPUTUSAN PERMISSION — BEDA dari 0039/0040: migration 0021 sendiri
-- eksplisit mencatat "Gate §26: SessionEnrollment lifecycle authority = NO
-- NEW PERMISSION, SERVER/BUSINESS-RULE GOVERNED" untuk tabel ini — artinya
-- TIDAK BOLEH mengarang permission code baru (mis. "m04.session_enrollment.manage")
-- untuk menutup gap ini. Sebagai gantinya, policy DELETE di sini memakai
-- EKSPRESI OTORISASI YANG SAMA PERSIS dengan `session_enrollments_manage_staff`
-- (UPDATE) yang sudah ada — is_superadmin() OR current_role_code() IN
-- ('admin','manager') — bukan permission baru, hanya melengkapi command yang
-- hilang untuk otoritas yang sudah disetujui sebelumnya di tabel yang sama.

CREATE POLICY session_enrollments_delete ON public.session_enrollments
  FOR DELETE USING (public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager'));
