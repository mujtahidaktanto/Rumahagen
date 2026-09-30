-- 0166_m11_announcement_media_bucket.sql
-- Bucket publik-baca `announcement-media` untuk gambar banner (public_announcement_promotion.image_reference, migration 0014/0028) — sebelumnya admin hanya bisa
-- menempel URL gambar dari luar (celah dicatat audit/FRONTEND_GAPS.md 2026-09-26). Penulisan hanya lewat signed upload URL buatan server dengan service role, setelah
-- permission m11.announcement_promotion.publish diperiksa (pola sama seperti bucket avatars/organization-media, 0158/0161) — tidak ada policy storage.objects untuk
-- pengguna. Tidak ada perubahan tabel: image_reference tetap VARCHAR(500) bebas format (jalur situs atau https), tidak dibatasi harus hasil unggahan bucket ini agar
-- banner lama dengan URL eksternal tetap sah.
--
-- Rollback: DELETE FROM storage.buckets WHERE id = 'announcement-media' (hanya bila bucket kosong).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('announcement-media', 'announcement-media', true, 3145728, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
