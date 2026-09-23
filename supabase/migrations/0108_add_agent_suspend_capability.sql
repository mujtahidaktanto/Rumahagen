-- 0108_add_agent_suspend_capability.sql
-- Menutup gap #1 (bagian ketiga) dari audit admin-surface M01-M15 --
-- API-024 PUT /admin/agents/{id}/suspend (M02, STEP11-A, "CURRENT
-- PRESERVE"). Sebelum migration ini TIDAK ADA jalur HTTP sama sekali
-- untuk mengubah public.users.status milik user LAIN kecuali Superadmin
-- (RLS users_update_admin, 0104) -- Admin/Manager tidak bisa menyentuh
-- baris user lain sama sekali untuk tabel ini.
--
-- users.status = 'suspended' SUDAH fully-enforced di has_permission()
-- sejak 0082 (akun suspended SELALU FALSE untuk permission apa pun) --
-- mekanisme "suspend" itu sendiri sudah ada, yang belum ada murni jalur
-- HTTP untuk memicunya selain lewat SQL langsung/Superadmin.
--
-- TIDAK ADA baris "Agent Suspend" di STEP12-01_ROLE_PERMISSION_MASTER_
-- MATRIX.csv (hanya M02 Profile Photo yang ada) -- konsisten dengan
-- m03.listing.suspend (0086) dan organizations suspend (0087) yang JUGA
-- ADD-NEW di luar matrix awal. Otorisasi di sini MENGIKUTI PRESEDEN
-- organizations suspend (0087), BUKAN listing suspend (0086): direct role
-- check Superadmin+Admin SAJA (BUKAN Manager, bukan permission-code baru)
-- -- konsisten dengan konvensi tabel users sendiri yang SUDAH begitu sejak
-- awal: users_select_self_or_admin (0007) dan users_update_admin (0104)
-- SAMA-SAMA hanya Superadmin+Admin, Manager tidak pernah diberi visibilitas
-- umum atas baris user lain di tabel ini. Menjaga satu konvensi per tabel
-- (alasan eksplisit yang sama dipakai 0087), bukan permission code baru.
--
-- SCOPE SENGAJA SATU ARAH: Admin HANYA boleh transisi 'active' -> 'suspended'
-- untuk target ber-role Agent -- PERSIS endpoint yang dikunci Core (tidak
-- ada endpoint "reactivate"/"unsuspend" yang dievidensi). Superadmin tetap
-- punya kuasa penuh lewat users_update_admin (0104) yang sudah ada
-- (termasuk reaktivasi, kalau dibutuhkan nanti) -- tidak ada jalan buntu.

-- RLS: Admin bisa MENCAPAI baris Agent mana pun untuk UPDATE (kolom yang
-- boleh berubah tetap dibatasi trigger di bawah, bukan di sini). Superadmin
-- sudah tercakup users_update_admin (0104), tidak diulang di sini.
CREATE POLICY users_update_admin_agent_suspend ON public.users
  FOR UPDATE USING (
    public.current_role_code() = 'admin'
    AND role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  )
  WITH CHECK (
    role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  );

-- Trigger: pisahkan blok status dari blok role_id/id/deleted_at/created_at
-- supaya bisa diberi satu pengecualian sempit (Admin, agent target, arah
-- active->suspended saja) tanpa melonggarkan kolom lain sama sekali.
CREATE OR REPLACE FUNCTION public.enforce_users_protected_columns()
RETURNS TRIGGER AS $$
DECLARE
  v_old_role_code TEXT;
BEGIN
  IF auth.uid() IS NULL OR public.is_superadmin() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.role_id IS DISTINCT FROM OLD.role_id
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'users: role_id/id/deleted_at/created_at hanya bisa diubah oleh Superadmin, bukan lewat self-update biasa (mencegah privilege escalation)';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT r.code INTO v_old_role_code FROM public.roles r WHERE r.id = OLD.role_id;
    IF public.current_role_code() = 'admin'
       AND v_old_role_code = 'agent'
       AND OLD.status = 'active'
       AND NEW.status = 'suspended'
    THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'users: status hanya bisa diubah oleh Superadmin, atau Admin khusus untuk suspend Agent yang sedang active (PUT /admin/agents/{id}/suspend, API-024)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON POLICY users_update_admin_agent_suspend ON public.users IS
  'ADD-NEW 0108 (API-024, PUT /admin/agents/{id}/suspend): Admin bisa mencapai baris Agent mana pun untuk UPDATE -- kolom yang benar-benar boleh berubah (hanya status, hanya active->suspended) ditegakkan trigger enforce_users_protected_columns(), bukan di sini. Manager SENGAJA tidak diberi (konsisten users_select_self_or_admin/users_update_admin yang juga Superadmin+Admin saja).';
