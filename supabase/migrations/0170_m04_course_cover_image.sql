-- 0170_m04_course_cover_image.sql
-- Foto/cover kursus (M04) — dilaporkan pemilik produk 2026-10-01: courses (0056) tidak pernah punya kolom gambar
-- sejak awal (sumber STEP10-D tidak mengevidence-kan field ini), jadi kartu "Course Saya" (Agent) dan katalog publik
-- /learning hanya menampilkan ikon placeholder, dan "Kelola Kursus" (Admin/Instruktur) tidak punya menu unggah foto.
--
-- Kolom baru courses.cover_image_url (nullable, seperti course_lessons.content_url — bebas format, kursus lama tanpa
-- foto tetap sah). Bucket publik-baca baru `course-covers` (WebP/JPEG, 3 MB, pola sama seperti avatars/organization-
-- media/home-hero-media/announcement-media). TIDAK ADA permission baru — upload diotorisasi has_permission
-- ('m04.course.manage', auth.uid()) di endpoint upload-url (sama seperti pengecekan course-materials 0168, tapi
-- dicek terhadap diri sendiri karena unggahan bisa terjadi SEBELUM course dibuat — path disimpan per-pengunggah
-- ("{user_id}/{uuid}.ext"), bukan per-course seperti course-materials).
--
-- Rasio bingkai pangkas: 16:9 (lib/media/variants.ts COURSE_COVER) — SAMA dengan aspect-[16/9] kartu "Course Saya"
-- (components/agent/LearningView.tsx), yang sebelumnya cuma h-24 tetap untuk menengahkan ikon placeholder (bukan
-- rasio yang disengaja untuk foto).
--
-- Rollback: ALTER TABLE public.courses DROP COLUMN cover_image_url; DELETE FROM storage.buckets WHERE id = 'course-covers' (hanya bila bucket kosong).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);

COMMENT ON COLUMN public.courses.cover_image_url IS
  'URL publik foto sampul kursus (bucket course-covers, migration 0170). Nullable -- kursus lama/tanpa foto tetap sah, jatuh ke ikon placeholder di UI.';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-covers', 'course-covers', true, 3145728, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
