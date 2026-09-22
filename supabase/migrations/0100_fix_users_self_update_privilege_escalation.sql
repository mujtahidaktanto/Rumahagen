-- 0100_fix_users_self_update_privilege_escalation.sql
-- Temuan keamanan: RLS `users_update_self` (0007) mengizinkan siapa pun
-- UPDATE baris `public.users` MILIKNYA SENDIRI tanpa batasan kolom sama
-- sekali ("id = auth.uid()" pada USING dan WITH CHECK, tidak ada apa pun
-- lain). Karena PostgREST/Supabase REST API bisa dipanggil LANGSUNG oleh
-- klien mana pun yang punya JWT (bukan cuma lewat route Next.js proyek
-- ini), user yang login bisa mengirim
-- `PATCH {SUPABASE_URL}/rest/v1/users?id=eq.<id-sendiri>`
-- dengan body `{"role_id": "<id-role-admin/superadmin>"}` dan RLS akan
-- MELOLOSKANNYA -- privilege escalation penuh, mengubah peran diri sendiri
-- jadi admin/superadmin. Ditemukan sebagai efek samping audit M01 Auth
-- (bukan bug baru yang ditambahkan sesi ini -- sudah ada sejak 0007).
--
-- KENAPA TRIGGER (bukan cukup RLS/CHECK constraint statis): RLS hanya bisa
-- menjawab "siapa boleh UPDATE baris ini", bukan "kolom mana yang boleh
-- berubah" -- perlu membandingkan OLD vs NEW, pola yang sama dipakai
-- berulang di proyek ini (agent_ai_connections disabled_by_admin 0016,
-- dbr_simulations prospect-only 0099).
--
-- KENAPA role_id/status/deleted_at/id/created_at yang diblokir, BUKAN
-- email_verified_at/last_login_at: dicek langsung ke seluruh
-- apps/web/app/api -- TIDAK ADA satu pun route yang mengubah role_id/
-- status via client biasa (gap terpisah: belum ada PUT /admin/users/{id}/
-- role sama sekali, dikunci STEP11-B10 M09 tapi belum dibangun -- di luar
-- cakupan perbaikan keamanan ini). email_verified_at/last_login_at TETAP
-- self-editable -- sudah dipakai nyata oleh trigger sync auth (0096) dan
-- route /auth/login (last_login_at), dan keduanya TIDAK menggerbangi
-- keputusan otorisasi apa pun secara langsung (status yang menggerbangi,
-- bukan email_verified_at/last_login_at) -- risiko rendah dibiarkan
-- self-editable, konsisten dengan tidak menambah pembatasan yang tidak
-- perlu (R-08 semangat "jangan melebihi kebutuhan").
--
-- is_superadmin() bypass disediakan untuk future-proofing endpoint admin
-- (PUT /admin/users/{id}/role, dst.) yang belum dibangun -- supaya
-- migration ini tidak perlu diubah lagi begitu endpoint itu ditulis,
-- selama route itu nanti memakai client bersesi Superadmin biasa (bukan
-- admin/service-role client, konsisten pola project ini).

CREATE OR REPLACE FUNCTION public.enforce_users_protected_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_superadmin() THEN
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

CREATE TRIGGER trg_users_protected_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_users_protected_columns();
