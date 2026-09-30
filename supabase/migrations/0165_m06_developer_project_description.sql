-- 0165_m06_developer_project_description.sql
-- Tambah kolom deskripsi ke developer_projects (M06). `developer_projects`
-- SEJAK AWAL (0034) tidak punya kolom deskripsi sendiri -- keputusan
-- 2026-09-26 (lihat audit/FRONTEND_GAPS.md dan README migration ini area
-- M06) memakai `meta_description` (VARCHAR(160), untuk tag <meta> SEO)
-- SEBAGAI deskripsi tampilan sementara, karena tidak ada field lain.
--
-- Permintaan pemilik produk (2026-09-30): Form Proyek Developer supaya
-- punya field yang sama dengan Form Listing Agent -- Judul/Nama, Deskripsi
-- (isi panjang, bebas), Meta Title SEO, Meta Description SEO -- empat
-- field terpisah, bukan Meta Description dipakai rangkap. `listings`
-- (0018) sudah punya pola ini persis: `description TEXT` terpisah dari
-- `meta_title VARCHAR(70)`/`meta_description VARCHAR(160)`. Migration ini
-- menyamakan `developer_projects` dengan pola itu.
--
-- TIDAK NOT NULL (opsional, sama seperti `listings.description`) supaya
-- proyek yang sudah ada tidak perlu diisi ulang paksa; `meta_description`
-- lama pada proyek yang sudah ada TETAP DIBIARKAN APA ADANYA di kolom
-- meta_description (tidak disalin otomatis ke description oleh migration
-- ini -- itu keputusan tampilan di kode aplikasi, bukan migrasi data;
-- lihat lib/public/project-data.ts yang jatuh ke meta_description bila
-- description masih kosong, supaya proyek lama tidak tiba-tiba kosong
-- deskripsinya di halaman publik).
--
-- TIDAK ADA perubahan RLS/trigger: kolom baru otomatis tercakup policy
-- developer_projects_select/_insert/_update/_delete (0034) yang beroperasi
-- per baris, bukan per kolom.

ALTER TABLE public.developer_projects ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.developer_projects.description IS
  'Deskripsi panjang proyek (bebas, ditampilkan di halaman publik). Terpisah dari meta_description (SEO, maks 160 karakter) sejak 0165 -- sebelumnya meta_description dipakai rangkap sebagai deskripsi (keputusan 2026-09-26, lihat README migration ini) karena kolom ini belum ada.';

-- Rollback (uji manual sebelum "terapkan 0165"):
--   ALTER TABLE public.developer_projects DROP COLUMN IF EXISTS description;
