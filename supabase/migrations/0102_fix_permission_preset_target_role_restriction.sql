-- 0102_fix_permission_preset_target_role_restriction.sql
-- Bug ditemukan lewat pertanyaan user, dikonfirmasi ke sumber otoritatif
-- STEP12-B_PERMISSION_PRESET_SYNCHRONIZATION (sebelumnya tidak terbaca,
-- masih dalam bentuk zip) -- trigger enforce_preset_target_role_is_agent
-- (0004) memaksa `target_role_id` SELALU 'agent', UNTUK SIAPA PUN
-- (termasuk Superadmin). Ini KONTRADIKSI LANGSUNG dengan
-- STEP12-B_PRESET_ROLE_TRACEABILITY_MATRIX.csv:
--   PP-001 (target Agent): Superadmin full + Manager Create/Edit/Delete/Assign
--   PP-002 (target role LAIN -- Admin/Buyer/Developer Partner/Instructor):
--     "No preset management for [role lain]; Superadmin governance remains"
--     -- Superadmin TETAP punya wewenang preset ke role selain Agent.
--   PP-003 (target Superadmin): Full preset governance.
-- Migration 0004 salah mengutip ini sebagai larangan universal ("Preset
-- HANYA berlaku untuk role Agent") -- ternyata itu HANYA larangan untuk
-- Manager (PP-001 eksplisit "Manager ... Agent-targeted presets only"),
-- BUKAN untuk Superadmin.
--
-- RLS permission_presets_manage (0007) SEBENARNYA SUDAH BENAR sejak awal:
-- "is_superadmin() OR (current_role_code()='manager' AND target_role_id=agent)"
-- -- kesalahannya murni di trigger 0004 yang membatalkan niat RLS itu
-- dengan memaksa semua orang (termasuk Superadmin yang RLS-nya sudah ALL)
-- ke Agent saja. Trigger ini TIDAK menduplikasi pembatasan Manager (sudah
-- ditegakkan RLS) -- hanya memperbaiki agar Superadmin (dan akses SQL/
-- service-role langsung, auth.uid() NULL, pola sama seperti 0101) benar-benar
-- bisa lewat untuk target role apa pun.

CREATE OR REPLACE FUNCTION public.enforce_preset_target_role_is_agent()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_superadmin() THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = NEW.target_role_id AND code = 'agent'
  ) THEN
    RAISE EXCEPTION 'permission_presets.target_role_id: Manager hanya boleh membuat preset untuk role Agent (STEP12-B PP-001) -- role lain memerlukan Superadmin (PP-002/PP-003)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
