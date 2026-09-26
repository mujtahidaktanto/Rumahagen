-- 0158_m02_m03_public_image_buckets.sql
-- Unggah foto profil Agent dan foto listing (keputusan pemilik produk 2026-09-26): browser memangkas/mengecilkan foto lebih dulu (WebP atau JPEG), lalu mengunggah lewat
-- signed upload URL buatan server. Batas simpan 3 MB per berkas (pilih berkas di browser hingga 25 MB; pengecilan terjadi di browser).
--
--   * `avatars`         (publik-baca): "{user_id}/{uuid}-512.webp"; satu varian persegi 512x512 yang ditampilkan berbingkai lingkaran.
--   * `listing-photos`  (publik-baca): "{user_id}/{listing_id}/{uuid}-{400|1080|2048}.webp"; tiga varian ukuran web. `listing_photos.url` menyimpan URL varian 2048; varian
--                       400 (kartu/daftar) dan 1080 (detail) diturunkan dengan mengganti akhiran nama berkas (lib/media/variants.ts), tanpa kolom baru.
--
-- Tidak ada policy pada storage.objects untuk pengguna: penulisan hanya lewat signed upload URL yang dibuat server dengan service role setelah kepemilikan diperiksa
-- (pola sama seperti bucket `agent-ktp`, 0149); pembacaan publik lewat URL publik bucket. Tidak ada perubahan tabel.
--
-- Rollback: DELETE FROM storage.buckets WHERE id IN ('avatars', 'listing-photos') (hanya bila bucket kosong).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',        'avatars',        true, 3145728, ARRAY['image/webp', 'image/jpeg']),
  ('listing-photos', 'listing-photos', true, 3145728, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
