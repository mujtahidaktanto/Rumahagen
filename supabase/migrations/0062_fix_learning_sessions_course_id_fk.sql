-- 0062_fix_learning_sessions_course_id_fk.sql
-- Penutup FK yang SENGAJA ditunda sejak migration 0021 (lihat komentar
-- aslinya: "FK ke courses DITUNDA — courses (M04 Learning Catalog) di luar
-- scope Tahap 5"). Sekarang tabel `courses` sudah ada (0056), FK retroaktif
-- ini ditutup — pola PERSIS sama seperti `listings.developer_project_id`
-- yang ditutup di 0034 begitu `developer_projects` ada.
--
-- ON DELETE SET NULL (bukan RESTRICT/CASCADE): course yang dihapus TIDAK
-- BOLEH ikut menghapus/memblokir penghapusan learning_sessions terkait —
-- sesi live/terjadwal (M04 Session) tetap berdiri sendiri secara siklus
-- hidup dari katalog course (M04 Catalog), course_id di sini murni tautan
-- referensial opsional (kolom sudah NULLABLE sejak 0021).

ALTER TABLE public.learning_sessions
  ADD CONSTRAINT learning_sessions_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
