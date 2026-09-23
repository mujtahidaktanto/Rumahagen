-- 0105_cleanup_stale_preset_on_role_change.sql
-- Ditemukan saat membangun PUT /admin/users/{id}/role: trigger
-- enforce_preset_assignee_matches_target_role (0004) hanya menjaga
-- kecocokan role SAAT preset di-assign (INSERT/UPDATE ke
-- user_permission_presets) -- tidak ada apa pun yang menjaga kecocokan
-- itu ke ARAH SEBALIKNYA, yaitu saat role USER berubah belakangan
-- (UPDATE users.role_id). Tanpa ini, Superadmin promosikan Agent yang
-- sedang punya preset aktif jadi Manager akan meninggalkan baris
-- user_permission_presets yang menunjuk preset target_role_id='agent'
-- padahal role user sekarang 'manager' -- data tidak konsisten, melanggar
-- STEP12-B §3 ("Role change + target-role mismatch -> DENY / TRANSACTION
-- INVALID").
--
-- Diselesaikan dengan MEMBERSIHKAN (bukan memblokir role change): kalau
-- role_id user berubah dan preset yang sedang di-assign tidak lagi cocok
-- dengan role barunya, baris user_permission_presets dihapus otomatis --
-- user kembali ke Role Default Matrix (STEP12-B §3: "No preset -> Role
-- Default Matrix"), bukan tersangkut di state preset yang sudah tidak
-- valid. Promosi/mutasi role tetap berhasil, bukan ditolak.

CREATE OR REPLACE FUNCTION public.cleanup_stale_permission_preset_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    DELETE FROM public.user_permission_presets upp
    WHERE upp.user_id = NEW.id
      AND upp.preset_id IN (
        SELECT id FROM public.permission_presets WHERE target_role_id IS DISTINCT FROM NEW.role_id
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_cleanup_stale_permission_preset_on_role_change
  AFTER UPDATE OF role_id ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_stale_permission_preset_on_role_change();
