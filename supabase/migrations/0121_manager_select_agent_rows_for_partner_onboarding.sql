-- 0121_manager_select_agent_rows_for_partner_onboarding.sql
-- Ditemukan lewat live-testing migration 0120 (throwaway test users,
-- 2026-09-25): UPDATE di PostgreSQL RLS meng-AND-kan USING clause dari
-- SEMUA policy UPDATE yang match DENGAN SELECT policy tabel yang sama --
-- karena UPDATE secara implisit butuh bisa "melihat" baris lama sebelum
-- mengubahnya (dokumentasi Postgres: "for UPDATE, SELECT policies are
-- combined with the relevant policy using AND"). users_select_self_or_admin
-- (migrasi awal 0002/0007) hanya mengizinkan id=self, is_superadmin(),
-- atau current_role_code()='admin' -- Manager TIDAK termasuk sama sekali.
--
-- Akibatnya: users_update_manager_partner_onboarding (0120) SENDIRI sudah
-- benar (USING & WITH CHECK-nya lolos untuk transisi agent->partner), tapi
-- gabungan AND dengan SELECT policy yang tidak mengizinkan Manager
-- membuat SETIAP percobaan UPDATE oleh Manager selalu ter-filter jadi 0
-- baris -- tanpa error, terlihat seperti berhasil di level aplikasi
-- (204/200) padahal tidak mengubah apa pun. Dikonfirmasi via
-- EXPLAIN (ANALYZE) yang menunjukkan filter gabungan tiga klausa AND,
-- klausa ketiga (dari SELECT policy) yang menggagalkan Manager.
--
-- Fix (SEMPIT, sama persis scope 0120 -- BUKAN memberi Manager akses
-- lihat semua user): tambah SELECT policy permissive baru, hanya untuk
-- baris yang role_id-nya 'agent'. Manager tetap TIDAK BISA melihat baris
-- Admin/Manager/Superadmin lain lewat policy ini -- di-OR-kan dengan
-- users_select_self_or_admin yang sudah ada (tidak diubah/dihapus).

CREATE POLICY users_select_manager_agent_rows ON public.users
  FOR SELECT USING (
    public.current_role_code() = 'manager'
    AND role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  );
