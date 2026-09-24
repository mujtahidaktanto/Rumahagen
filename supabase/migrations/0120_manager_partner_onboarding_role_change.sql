-- 0120_manager_partner_onboarding_role_change.sql
-- Permintaan user (2026-09-25), muncul dari pertanyaan soal cara membuat
-- akun Instructor/Buyer/Developer Partner: satu-satunya jalur (PUT
-- /admin/users/{id}/role) sebelumnya Superadmin-only murni (RLS
-- users_update_admin, 0104 + trigger enforce_users_protected_columns,
-- 0100/0101 -- keduanya sengaja dikunci ke is_superadmin() untuk mencegah
-- privilege escalation). User meminta: Manager yang berhadapan langsung
-- dengan calon Developer Partner/Instructor (proses bisnis nyata, bukan
-- staf admin) tidak harus minta Superadmin setiap kali onboarding mitra
-- baru.
--
-- Scope yang DIBERIKAN ke Manager (SEMPIT, bukan menyamakan dengan
-- Superadmin):
--   - HANYA transisi role_id dari 'agent' -> salah satu dari
--     {'instructor','buyer','developer_partner'} (onboarding mitra dari
--     akun yang baru self-register, satu-satunya cara akun non-Agent
--     pernah "ada" -- lihat lib/validation/admin.ts:
--     updateUserRoleSchema).
--   - TIDAK BISA promosi ke role staf (admin/manager/superadmin) --
--     tetap murni Superadmin-only, tidak berubah dari 0104.
--   - TIDAK BISA membalik arah (instructor/buyer/developer_partner ->
--     agent atau role lain) -- kalau perlu, tetap lewat Superadmin.
--   - TIDAK BISA sekaligus mengubah status/deleted_at/id/created_at
--     dalam panggilan yang sama -- trigger di bawah menegakkan kolom lain
--     harus TIDAK berubah supaya exception ini tidak jadi celah untuk
--     kolom terproteksi lain.
--
-- DUA lapis yang diubah (RLS menentukan BARIS mana yang boleh disentuh
-- Manager, trigger menentukan KOLOM apa saja yang boleh berubah dalam
-- baris itu -- pola sama seperti 0100/0101/0104 aslinya):

-- ── RLS: baris mana yang boleh disentuh Manager ──
-- Pola sama persis dengan role_permissions_manager_modify_agent_rows
-- (0007) -- current_role_code()='manager' langsung, TANPA has_permission()
-- scope 'own' (0103 sudah membuktikan pola has_permission+scope 'own'
-- tanpa owner_id itu diam-diam gagal total -- current_role_code() polos
-- yang benar-benar berfungsi, dipakai lagi di sini, R-02).
CREATE POLICY users_update_manager_partner_onboarding ON public.users
  FOR UPDATE USING (
    public.current_role_code() = 'manager'
    AND role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  )
  WITH CHECK (
    role_id IN (SELECT id FROM public.roles WHERE code IN ('instructor', 'buyer', 'developer_partner'))
  );

-- ── Trigger: kolom apa saja yang boleh berubah dalam baris itu ──
-- CREATE OR REPLACE, bukan mengedit 0101 yang sudah applied (konvensi
-- proyek ini). Guard is_superadmin()/auth.uid() IS NULL dari 0101
-- dipertahankan utuh -- exception Manager ditambahkan SEBELUM blok
-- RAISE EXCEPTION generik, sempit ke transisi agent->partner-role saja
-- dan mensyaratkan kolom lain (status/deleted_at/id/created_at) tidak
-- berubah sama sekali.
CREATE OR REPLACE FUNCTION public.enforce_users_protected_columns()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_role_id UUID;
  v_partner_role_ids UUID[];
BEGIN
  IF auth.uid() IS NULL OR public.is_superadmin() THEN
    RETURN NEW;
  END IF;

  IF public.current_role_code() = 'manager'
     AND NEW.id = OLD.id
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at
     AND NEW.created_at = OLD.created_at
     AND NEW.role_id IS DISTINCT FROM OLD.role_id
  THEN
    SELECT id INTO v_agent_role_id FROM public.roles WHERE code = 'agent';
    SELECT array_agg(id) INTO v_partner_role_ids FROM public.roles WHERE code IN ('instructor', 'buyer', 'developer_partner');

    IF OLD.role_id = v_agent_role_id AND NEW.role_id = ANY(v_partner_role_ids) THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'users.role_id: Manager hanya boleh mengubah role Agent menjadi Instructor/Buyer/Developer Partner (onboarding mitra) -- transisi role lain memerlukan Superadmin';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.role_id IS DISTINCT FROM OLD.role_id
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'users: role_id/status/deleted_at/id/created_at hanya bisa diubah oleh Superadmin, bukan lewat self-update biasa (mencegah privilege escalation)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
