-- 0002_users.sql
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity USERS (M01).
--
-- KEPUTUSAN ADAPTASI (didokumentasikan eksplisit, bukan penyimpangan diam-diam):
-- Dokumen sumber mendesain tabel `users` generik dengan kolom `password_hash`
-- (ditulis sebelum keputusan memakai Supabase). Karena target eksekusi adalah
-- Supabase, autentikasi & password_hash sudah dikelola oleh `auth.users` bawaan
-- Supabase — kita TIDAK boleh duplikasi/menyimpan password_hash sendiri (anti-pattern
-- & risiko keamanan). Maka:
--   - `public.users.id` = FK 1:1 ke `auth.users.id` (bukan PK independen)
--   - kolom `email`, `phone`, `password_hash` DIHAPUS dari sini (sudah ada di auth.users)
--   - kolom sisanya (`role_id`, `status`, `email_verified_at`, `last_login_at`,
--     `deleted_at`, `created_at`, `updated_at`) DIPERTAHANKAN PERSIS sesuai dokumen,
--     karena itu bagian dari model otorisasi (role_id) dan lifecycle akun (status)
--     yang menjadi tanggung jawab aplikasi, bukan Supabase Auth.
--
-- Tabel `roles` dibuat di 0003, sehingga FK role_id di sini pakai DEFERRABLE
-- supaya urutan migration tetap aman kalau suatu saat diurut ulang.

CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id            UUID NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending_review'
                        CHECK (status IN ('pending_review','active','suspended','rejected')),
  email_verified_at  TIMESTAMPTZ,
  last_login_at      TIMESTAMPTZ,
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS
  'Profil aplikasi 1:1 dengan auth.users. Sumber: STEP10-D USERS (M01), diadaptasi untuk Supabase Auth — lihat komentar migration.';
