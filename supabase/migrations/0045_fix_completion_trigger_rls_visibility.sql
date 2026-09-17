-- 0045_fix_completion_trigger_rls_visibility.sql
-- Menutup bug KETIGA dari kelas yang sama (0041 di M06, 0043/0044 di sini):
-- trigger `enforce_completion_requires_active_enrollment()` (0022) melakukan
--   SELECT 1 FROM public.session_enrollments WHERE id = NEW.session_enrollment_id ...
-- TANPA SECURITY DEFINER — beda dari trigger lain di codebase ini
-- (enforce_listing_lifecycle_rules dkk. sengaja TIDAK DEFINER karena hanya
-- baca OLD/NEW milik tabelnya sendiri + panggil has_permission() yang sudah
-- DEFINER). Trigger ini BEDA: dia SELECT ke TABEL LAIN (session_enrollments)
-- secara langsung, sehingga tunduk RLS actor yang sedang INSERT — Instructor
-- yang meng-evaluate completion untuk enrollment milik Agent lain TIDAK
-- PUNYA akses SELECT ke baris session_enrollments itu (RLS
-- session_enrollments_select: scope 'own' Instructor cocok kalau
-- agent_id=auth.uid(), padahal baris ini agent_id-nya si Agent) — EXISTS()
-- selalu FALSE meski status baris sungguhan 'active', trigger salah
-- melempar "belum berstatus active/completed". Dikonfirmasi lewat test
-- nyata: enrollment status di DB memang 'active', tapi Instructor tetap
-- ditolak trigger ini.
--
-- PERBAIKAN: tambahkan SECURITY DEFINER (pola sama seperti
-- session_owner_for_enrollment() di 0044) — trigger ini murni pengecekan
-- precondition data (business-rule), BUKAN keputusan otorisasi (otorisasi
-- tetap dari RLS session_completion_outcomes_manage yang sudah benar sejak
-- 0044) — aman dinaikkan privilegenya untuk keperluan baca lintas-RLS ini.

CREATE OR REPLACE FUNCTION public.enforce_completion_requires_active_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.session_enrollments
    WHERE id = NEW.session_enrollment_id AND status IN ('active','completed')
  ) THEN
    RAISE EXCEPTION 'session_completion_outcomes: session_enrollment_id % belum berstatus active/completed', NEW.session_enrollment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
