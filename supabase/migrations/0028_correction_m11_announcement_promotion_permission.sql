-- 0028_correction_m11_announcement_promotion_permission.sql
-- KOREKSI atas kesalahan kategorisasi di 0014 (Tahap 2) — ditemukan saat riset
-- Tahap 6 untuk M11. Migration lama TIDAK diedit (migration yang sudah
-- "berjalan" tidak boleh ditulis ulang, prinsip dasar migration tool apa pun)
-- — perbaikan dilakukan lewat migration BARU ini.
--
-- APA YANG SALAH: `0014_admin_public_announcement_promotion.sql` men-mint
-- permission baru `m09.public_announcement_promotion.manage` dengan alasan
-- "tidak ada di master matrix" — TAPI itu keliru. STEP10-D memberi tag
-- `module: M11` untuk SETIAP kolom entity PUBLIC_ANNOUNCEMENT_PROMOTION (bukan
-- M09), dan master matrix 50-baris MEMANG punya baris untuk resource ini,
-- hanya dengan nama berbeda: "M11,Announcement / Promotion,Publish" — permission
-- `m11.announcement_promotion.publish` SUDAH ADA di seed 0009 sejak Tahap 1,
-- luput dicek waktu itu karena pencarian sebelumnya cuma cocok ke istilah
-- "Provider Catalogue"/M13 untuk pola serupa, tidak menyisir modul lain.
--
-- DAMPAK: scope permission yang salah dipakai 0014 juga tidak presisi — grant
-- lama memberi Manager=ALL, padahal baris matrix M11 asli: Superadmin=ALL,
-- Admin=ALL, Manager=NONE (lebih restriktif).
--
-- PERBAIKAN: RLS `public_announcement_promotion` dipindah ke
-- `m11.announcement_promotion.publish` (evidenced, scope benar). Permission
-- lama `m09.public_announcement_promotion.manage` TIDAK dihapus (menghapus
-- baris permissions/role_permissions berisiko kalau ada referensi lain; toh
-- tidak berbahaya dibiarkan ada tapi menganggur) — hanya ditandai deprecated
-- lewat komentar, dan RLS policy lama di tabel ini di-DROP+ganti.

COMMENT ON COLUMN public.permissions.action_code IS
  'm09.public_announcement_promotion.manage (baris di seed 0009) DEPRECATED sejak 0028 — kesalahan kategorisasi, resource ini sebenarnya milik M11 (STEP10-D module tag) dengan permission m11.announcement_promotion.publish yang sudah dievidensi di master matrix. Dibiarkan ada di tabel permissions untuk keutuhan riwayat audit, tidak dipakai RLS manapun lagi sejak migration ini.';

DROP POLICY IF EXISTS public_announcement_promotion_manage ON public.public_announcement_promotion;

-- Scope BENAR dari master matrix: Superadmin=ALL, Admin=ALL, Manager=NONE
-- (BEDA dari grant lama 0014 yang keliru memberi Manager=ALL juga).
CREATE POLICY public_announcement_promotion_manage_m11 ON public.public_announcement_promotion
  FOR ALL USING (public.has_permission('m11.announcement_promotion.publish'))
  WITH CHECK (public.has_permission('m11.announcement_promotion.publish'));

-- SELECT policy publik dari 0014 (public_announcement_promotion_select_public,
-- kalau ada) TIDAK disentuh — itu bukan bagian yang salah, hanya jalur MANAGE
-- yang permission code-nya perlu dikoreksi.
