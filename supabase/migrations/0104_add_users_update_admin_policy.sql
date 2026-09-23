-- 0104_add_users_update_admin_policy.sql
-- Ditemukan saat membangun PUT /admin/users/{id}/role (bagian dari gap #2,
-- Permission Matrix Console): `users_update_self` (0007) HANYA
-- mengizinkan `id = auth.uid()` -- Superadmin TIDAK BISA update baris user
-- LAIN sama sekali, bahkan setelah trigger enforce_users_protected_columns
-- (0100/0101) diberi bypass is_superadmin(). Trigger itu menjawab "kolom
-- mana boleh berubah", tapi RLS yang menjawab "baris siapa yang bisa
-- disentuh" tidak pernah memberi Superadmin akses ke baris ORANG LAIN.
-- Diverifikasi nyata: Superadmin sesi asli PATCH role_id user lain -> 200
-- OK tapi 0 baris berubah (RLS diam-diam menyaring).
--
-- Kebijakan baru: Superadmin boleh UPDATE baris users siapa pun. Tidak
-- membatasi kolom di sini (trigger enforce_users_protected_columns sudah
-- menegakkan itu; RLS + trigger tetap dua lapis berbeda tanggung jawab,
-- konsisten pola proyek ini). Role lain (Admin/Manager/dst.) TIDAK diberi
-- akses ini -- perubahan role adalah operasi paling sensitif di seluruh
-- model otorisasi, konsisten dengan STEP12-B "Superadmin: full governance"
-- dan desain 0100/0101 yang sudah mengantisipasi endpoint ini Superadmin-only.

CREATE POLICY users_update_admin ON public.users
  FOR UPDATE USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
