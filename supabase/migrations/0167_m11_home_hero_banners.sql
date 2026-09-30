-- 0167_m11_home_hero_banners.sql
-- Slide banner hero HALAMAN UTAMA publik (blok gambar di samping headline pencarian, app/(publik)/page.tsx) — TIDAK SAMA dengan `public_announcement_promotion`
-- (0014/0028, tabel "Banner & Promosi" yang tampil di /promo). Sebelumnya blok ini satu gambar statis di-hardcode langsung di kode (tanpa konsol admin sama sekali);
-- permintaan pemilik produk (2026-09-30): jadikan slider (banyak gambar bergantian, auto-play + panah/titik manual) yang dikelola dari admin — tambah/ubah/ganti/hapus
-- slide, tiap slide punya gambar wajib dan tautan tujuan saat diklik (opsional).
--
-- TIDAK ADA permission baru — memakai `m11.static_public_content.publish` yang sudah ada (Superadmin/Admin=ALL, Manager=NONE), pola sama seperti 0051
-- (url_redirects): ini infrastruktur presentasi publik M11 sejenis "konten statis", bukan resource M-module terpisah dengan permission sendiri di master matrix.
--
-- Bucket publik-baca terpisah `home-hero-media` (bukan `announcement-media` milik 0166 — satu bucket per resource, pola sama seperti avatars/organization-media/
-- announcement-media), WebP/JPEG, 3 MB, penulisan hanya lewat signed upload URL server setelah permission diperiksa.
--
-- Rollback: DROP TABLE public.home_hero_banners; DELETE FROM storage.buckets WHERE id = 'home-hero-media' (hanya bila bucket kosong).

CREATE TABLE public.home_hero_banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_reference VARCHAR(500) NOT NULL,
  alt_text        VARCHAR(200),
  cta_reference   VARCHAR(500), -- format sama seperti public_announcement_promotion.cta_reference: "jenis:isi" (lib/public/cta.ts) atau jalur/https lama
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.home_hero_banners IS
  'Slide banner hero di halaman utama publik (bukan Banner & Promosi/public_announcement_promotion). Urutan tampil = display_order menaik; hanya is_active=true yang tampil publik.';

ALTER TABLE public.home_hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY home_hero_banners_select_public ON public.home_hero_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY home_hero_banners_manage ON public.home_hero_banners
  FOR ALL USING (public.has_permission('m11.static_public_content.publish'))
  WITH CHECK (public.has_permission('m11.static_public_content.publish'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('home-hero-media', 'home-hero-media', true, 3145728, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
