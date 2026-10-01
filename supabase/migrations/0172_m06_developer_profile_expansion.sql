-- 0172_m06_developer_profile_expansion.sql
-- Permintaan pemilik produk 2026-10-01: logo perusahaan jadi unggahan (bukan URL teks), berkas legalitas pendukung (privat -- hanya pemilik akun Developer Partner
-- dan staf internal RumahAgen), riwayat perumahan (publik -- untuk citra brand saat dilihat calon mitra/agen), dan halaman profil publik Developer baru yang
-- ditautkan dari Detail Proyek (menggantikan tombol CTA WhatsApp PIC langsung).
--
-- ═══ 1. Slug publik developer_partners ═══
-- Dibutuhkan untuk URL halaman publik baru (/developer/{slug}) -- belum ada kolom slug sama sekali sebelum ini. Pola sama seperti organizations.slug (0005):
-- "{nama di-slugify}-{suffix acak}", dibuat server saat create (lihat app/api/developer-partners/route.ts). Backfill baris lama di sini.
ALTER TABLE public.developer_partners ADD COLUMN IF NOT EXISTS slug VARCHAR(170);

UPDATE public.developer_partners
SET slug = lower(regexp_replace(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

ALTER TABLE public.developer_partners ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.developer_partners ADD CONSTRAINT developer_partners_slug_key UNIQUE (slug);

COMMENT ON COLUMN public.developer_partners.slug IS
  'Slug URL publik (/developer/{slug}, migration 0172). Dibuat server saat create (pola sama seperti organizations.slug, 0005); TIDAK ada di updateDeveloperPartnerSchema -- tidak bisa diubah mitra sendiri supaya tautan lama tidak putus.';

-- ═══ 2. Berkas legalitas pendukung (PRIVAT -- hanya pemilik akun dan staf) ═══
CREATE TABLE public.developer_legal_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id   UUID NOT NULL REFERENCES public.developer_partners(id) ON DELETE CASCADE,
  document_name  VARCHAR(200) NOT NULL,
  file_url       VARCHAR(500) NOT NULL, -- referensi "storage:developer-legal-docs/{developer_id}/{uuid}-{nama}", pola sama seperti marketing_kit.file_url (0147)
  uploaded_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.developer_legal_documents IS
  'Berkas legalitas pendukung perusahaan Developer Partner (akta, NIB, SIUP, dll). PRIVAT -- hanya pemilik akun (m06.developer_partner.update_own_profile, own) dan staf (m06.developer_partner.manage, all) yang boleh melihat/mengelola, TIDAK PERNAH publik.';

CREATE INDEX idx_developer_legal_documents_developer_id ON public.developer_legal_documents (developer_id);

ALTER TABLE public.developer_legal_documents ENABLE ROW LEVEL SECURITY;

-- Satu kebijakan FOR ALL (bukan SELECT terpisah + MANAGE terpisah): berkas ini tidak pernah publik, jadi syarat baca sama persis dengan syarat kelola.
CREATE POLICY developer_legal_documents_manage ON public.developer_legal_documents
  FOR ALL USING (
    public.has_permission('m06.developer_partner.manage')
    OR EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND public.has_permission('m06.developer_partner.update_own_profile', dp.user_id))
  )
  WITH CHECK (
    public.has_permission('m06.developer_partner.manage')
    OR EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND public.has_permission('m06.developer_partner.update_own_profile', dp.user_id))
  );

-- ═══ 3. Riwayat perumahan (PUBLIK -- citra brand developer) ═══
CREATE TABLE public.developer_project_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id   UUID NOT NULL REFERENCES public.developer_partners(id) ON DELETE CASCADE,
  project_name   VARCHAR(200) NOT NULL,
  logo_url       VARCHAR(500), -- bucket publik developer-media; nullable -- entri boleh cuma nama tanpa logo
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.developer_project_history IS
  'Riwayat perumahan yang pernah/sedang dikerjakan Developer Partner (logo + nama) -- ditampilkan di halaman profil publik Developer (migration 0172) untuk citra brand. Beda dari developer_projects (listing proyek aktif di platform) -- ini murni galeri portofolio, boleh berisi proyek yang tidak pernah terdaftar di RumahAgen.';

CREATE INDEX idx_developer_project_history_developer_id ON public.developer_project_history (developer_id);

ALTER TABLE public.developer_project_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY developer_project_history_select ON public.developer_project_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND dp.status = 'active' AND dp.deleted_at IS NULL)
    OR public.has_permission('m06.developer_partner.manage')
    OR EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND dp.user_id = auth.uid())
  );

CREATE POLICY developer_project_history_manage ON public.developer_project_history
  FOR ALL USING (
    public.has_permission('m06.developer_partner.manage')
    OR EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND public.has_permission('m06.developer_partner.update_own_profile', dp.user_id))
  )
  WITH CHECK (
    public.has_permission('m06.developer_partner.manage')
    OR EXISTS (SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_id AND public.has_permission('m06.developer_partner.update_own_profile', dp.user_id))
  );

-- ═══ 4. Bucket logo perusahaan + logo riwayat perumahan (PUBLIK) dan berkas legalitas (PRIVAT) ═══
-- developer-media: publik, WebP/JPEG 3 MB -- pola sama seperti organization-media (0161), menampung DUA kind lewat path "{developer_id}/{logo|history_logo}-{uuid}.ext".
-- developer-legal-docs: privat, PDF atau foto scan (JPEG/PNG) 20 MB -- pola sama seperti marketing-kits (0147), diunduh lewat signed URL yang dibuat server.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('developer-media', 'developer-media', true, 3145728, ARRAY['image/webp', 'image/jpeg']),
  ('developer-legal-docs', 'developer-legal-docs', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
