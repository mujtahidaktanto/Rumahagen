-- 0037_m11_static_public_content.sql
-- Sumber kolom: STEP10-D entity STATIC_PUBLIC_CONTENT (module M11) — SELURUH
-- kolom kosong di sumber, diisi berdasar nama kolom + semantik terkunci di
-- Gate PRE-00-M §9 (lifecycle Draft→Published→Unpublished→Archived) dan §12-13
-- (SEO representation, indexability, sitemap).
--
-- Permission SUDAH ADA sejak Tahap 1: m11.static_public_content.publish
-- (Superadmin/Admin=ALL, semua role lain NONE — dipakai untuk SELURUH lifecycle
-- CRUD di sini, bukan cuma aksi "publish" harfiah, karena hanya SATU permission
-- code yang dievidensi untuk resource ini, sama seperti pola konsolidasi verb
-- di ai_providers/0015).

CREATE TABLE IF NOT EXISTS public.static_public_content (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  VARCHAR(200) NOT NULL,
  slug                   VARCHAR(220) UNIQUE NOT NULL,
  content                TEXT,
  meta_title             VARCHAR(70),
  meta_description       VARCHAR(160),
  canonical_url          VARCHAR(500),
  indexability           TEXT NOT NULL DEFAULT 'index' CHECK (indexability IN ('index','noindex')),
  sitemap_participation  BOOLEAN NOT NULL DEFAULT true,
  status                 TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','unpublished','archived')),
  published_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.static_public_content IS
  'Sumber: STEP10-D entity STATIC_PUBLIC_CONTENT. Lifecycle Draft→Published→Unpublished→Archived terkunci Gate PRE-00-M §9. Indexability/sitemap_participation menegakkan §13: hanya status=published DAN indexability=index DAN sitemap_participation=true yang layak jadi kandidat sitemap/index mesin pencari (logika penyaringannya sendiri di lapisan generate-sitemap, bukan di migration ini — tabel hanya menyimpan flag-nya).';

COMMENT ON COLUMN public.static_public_content.indexability IS
  'Bukan Boolean sederhana — dibuat TEXT (index/noindex) supaya konsisten dengan istilah SEO robots meta tag yang sama persis dipakai gate (§13.3 "robots.txt and crawler controls"), bukan istilah generik "is_indexable".';

-- ── Trigger: published_at hanya terisi sekali (Gate §9: transisi Draft→Published) ──
CREATE OR REPLACE FUNCTION public.enforce_static_content_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status = 'draft' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_static_content_published_at
  BEFORE UPDATE ON public.static_public_content
  FOR EACH ROW EXECUTE FUNCTION public.enforce_static_content_published_at();

-- ── RLS ──

ALTER TABLE public.static_public_content ENABLE ROW LEVEL SECURITY;

-- SELECT publik: hanya status=published DAN indexability tidak relevan untuk
-- akses (indexability cuma soal mesin pencari, BUKAN otorisasi — Gate §13.3:
-- "A protected resource remains protected regardless of crawler behavior",
-- berlaku juga sebaliknya: noindex tidak berarti halaman disembunyikan dari
-- user biasa, cuma tidak diindeks mesin pencari).
CREATE POLICY static_public_content_select ON public.static_public_content
  FOR SELECT USING (
    status = 'published'
    OR public.has_permission('m11.static_public_content.publish')
  );

CREATE POLICY static_public_content_manage ON public.static_public_content
  FOR ALL USING (public.has_permission('m11.static_public_content.publish'))
  WITH CHECK (public.has_permission('m11.static_public_content.publish'));
