-- 0101_fix_users_protected_columns_service_role_bypass.sql
-- Koreksi atas 0100 (TIDAK mengedit migration yang sudah applied -- pola
-- CREATE OR REPLACE di migration baru, konsisten dengan konvensi proyek
-- ini): trigger enforce_users_protected_columns() versi 0100 memblokir
-- SEMUA update role_id/status/dst., termasuk lewat koneksi SQL langsung
-- (service role/postgres, auth.uid() IS NULL) -- ini justru menutup jalur
-- operasional yang SAH (admin database langsung, Supabase MCP/Dashboard
-- SQL editor), bukan cuma jalur serangan (REST API dengan JWT user biasa).
--
-- RLS users_update_self (0007) SUDAH SENDIRI membatasi siapa yang bisa
-- sampai ke baris UPDATE ini lewat PostgREST: USING (id = auth.uid())
-- berarti auth.uid() HARUS cocok dengan id baris yang diubah -- kalau
-- auth.uid() NULL (tidak ada JWT/koneksi service-role/postgres langsung),
-- PostgREST tidak akan pernah meloloskan UPDATE itu sama sekali (RLS
-- menutup jalur REST anon lebih dulu). Jadi trigger ini HANYA pernah
-- benar-benar dieksekusi pada baris yang matched ketika: (a) ada sesi user
-- asli yang auth.uid()-nya cocok dengan baris itu (skenario serangan yang
-- ingin ditutup 0100), atau (b) koneksi service-role/postgres langsung
-- yang memang bypass RLS sepenuhnya (auth.uid() selalu NULL di konteks
-- itu, sudah dipercaya penuh by design -- level akses yang sama yang bisa
-- menonaktifkan trigger ini sendiri kalau mau).
--
-- Guard diubah dari `is_superadmin()` menjadi
-- `auth.uid() IS NULL OR is_superadmin()` -- membedakan (a) serangan lewat
-- REST dengan JWT user biasa (auth.uid() TERISI, bukan superadmin -> tetap
-- diblokir, tidak berubah) dari (b) akses administratif langsung yang
-- sudah dipercaya (auth.uid() NULL -> dilewatkan, koreksi).

CREATE OR REPLACE FUNCTION public.enforce_users_protected_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_superadmin() THEN
    RETURN NEW;
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
