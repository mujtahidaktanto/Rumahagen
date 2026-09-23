-- 0106_fix_preset_assignee_trigger_security_definer.sql
-- Ditemukan lewat tes nyata assign preset sebagai Manager (bagian dari
-- gap #2): trigger enforce_preset_assignee_matches_target_role (0004)
-- TIDAK SECURITY DEFINER -- SELECT role_id FROM public.users di dalamnya
-- berjalan dengan privilege CALLER (Manager), tunduk RLS
-- users_select_self_or_admin (0007) yang HANYA mengizinkan
-- id=auth.uid() OR Superadmin OR Admin -- Manager TIDAK TERMASUK sama
-- sekali. Akibatnya v_user_role_id selalu NULL untuk assignment yang
-- dilakukan Manager terhadap user LAIN, "NULL IS DISTINCT FROM
-- <target_role_id>" selalu TRUE -> trigger SELALU menolak dengan pesan
-- "role tidak cocok", padahal rolenya benar-benar cocok. Diverifikasi
-- nyata: Manager assign preset ke Agent asli (role memang cocok) tetap
-- ditolak dengan pesan mismatch -- root cause bukan validasi bisnis yang
-- benar-benar gagal, tapi SELECT internal trigger yang diam-diam kosong.
-- Sebelum ini baru pertama kali ada INSERT nyata ke user_permission_presets
-- di seluruh riwayat proyek, jadi bug ini belum pernah ketahuan sejak 0004.
--
-- Diperbaiki dengan menandai fungsi SECURITY DEFINER (pola sama seperti
-- handle_auth_user_sync/log_audit_event -- baca lintas-tabel untuk
-- VALIDASI, bukan mengekspos data ke caller) supaya SELECT role_id di
-- dalamnya benar-benar melihat baris user yang dimaksud, siapa pun
-- pemanggilnya.

CREATE OR REPLACE FUNCTION public.enforce_preset_assignee_matches_target_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_role_id UUID;
  v_user_role_id UUID;
BEGIN
  SELECT target_role_id INTO v_target_role_id
  FROM public.permission_presets WHERE id = NEW.preset_id;

  SELECT role_id INTO v_user_role_id FROM public.users WHERE id = NEW.user_id;

  IF v_user_role_id IS DISTINCT FROM v_target_role_id THEN
    RAISE EXCEPTION 'user_permission_presets: role user tidak cocok dengan target_role_id preset — assignment TIDAK mengubah role (STEP12-B B-002)';
  END IF;

  RETURN NEW;
END;
$$;
