-- 0168_m04_course_materials_bucket.sql
-- Bucket publik-baca `course-materials` untuk materi PDF/Slide pelajaran kursus (course_lessons.content_type IN ('pdf','slide'), migration 0056) — sebelumnya
-- admin/instruktur hanya bisa menempel URL file dari luar untuk SEMUA jenis konten termasuk PDF/Slide. Permintaan pemilik produk (2026-09-30): Video tetap
-- tautan URL (YouTube/mp4 dari luar), PDF dan Slide jadi unggah berkas langsung. Slide juga memakai PDF (keputusan pemilik produk: PDF saja, bukan PPT/PPTX,
-- supaya tetap terbuka langsung di tab baru lewat tautan yang sudah dibuat CourseRunner.tsx — PPT/PPTX hanya akan terunduh, tidak terbuka di browser).
--
-- Penulisan hanya lewat signed upload URL server setelah permission m04.course.manage (owner_id = courses.created_by) diperiksa — pola sama seperti
-- avatars/organization-media/announcement-media/home-hero-media (0158/0161/0166/0167). Tidak ada policy storage.objects untuk pengguna.
-- Tidak ada perubahan tabel: course_lessons.content_url (0056) tetap VARCHAR(500) bebas format, tidak dibatasi harus hasil unggahan bucket ini agar lesson
-- lama dengan URL eksternal tetap sah, dan Video tetap bebas URL YouTube/mp4 dari luar.
--
-- Rollback: DELETE FROM storage.buckets WHERE id = 'course-materials' (hanya bila bucket kosong).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-materials', 'course-materials', true, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
