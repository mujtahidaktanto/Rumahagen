-- 0097_seo_config.sql
-- Gap M11 (audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md Gap #2): STEP11-B9
-- (M11 Public Discovery/SEO deep-scan) mengunci `GET/PUT /admin/config/seo`
-- sebagai route "PRESERVE" (Core API v2.1) dengan otoritas dikoreksi:
-- "M09 administrative configuration/control; M11 SEO/discovery/measurement
-- semantics" -- lihat STEP11-B9 v1.1 FINAL CORRECTED §4.2/§6 (record
-- CORE-CFG-SEO-01). Tidak ada tabel STEP10-D untuk SEO_CONFIG dan tidak ada
-- baris permission `seo` apa pun di seluruh korpus 05-authorization (dicek
-- grep menyeluruh) -- jadi field & permission di bawah ini didesain baru,
-- BUKAN disalin dari dictionary yang tidak ada.
--
-- Permission: TIDAK membuat permission baru (menegakkan D13-15, preseden
-- 0011 "no permission-ID dikarang di luar katalog sumber"). STEP11-B9 §4.2
-- sendiri menyatakan M09 "may configure/control SEO/analytics configuration
-- THROUGH THE EXISTING CONFIGURATION AUTHORITY" -- dibaca sebagai instruksi
-- eksplisit memakai ULANG `m09.system_configuration.view`/`.manage` yang
-- sudah ada sejak 0009/0011 (Superadmin-only), bukan permission baru.
--
-- SELECT dibuka PUBLIC (bukan cuma Superadmin) SENGAJA: seluruh isi tabel
-- ini (site_title_suffix, default_meta_description, robots_global_noindex,
-- sitemap_enabled) memang harus dibaca tanpa sesi oleh route publik
-- app/robots.ts + app/sitemap-*.xml/route.ts (crawler mesin pencari tidak
-- pernah login) -- tidak ada data sensitif di tabel ini, jadi tidak ada
-- kerugian keamanan membuka SELECT publik. Hanya WRITE yang dibatasi
-- Superadmin lewat has_permission('m09.system_configuration.manage').

CREATE TABLE public.seo_config (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title_suffix         VARCHAR(150),
  default_meta_description  TEXT,
  default_og_image_url      VARCHAR(500),
  robots_global_noindex     BOOLEAN NOT NULL DEFAULT false,
  sitemap_enabled           BOOLEAN NOT NULL DEFAULT true,
  last_reindex_requested_at TIMESTAMPTZ,
  last_reindex_requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by                UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.seo_config IS
  'Baris tunggal konfigurasi SEO (M11/M09, STEP11-B9 CORE-CFG-SEO-01). Bukan entity STEP10-D -- didesain baru karena Core tidak pernah mendefinisikan skema SEO_CONFIG. SELECT publik (dipakai robots.txt/sitemap), WRITE Superadmin-only.';

INSERT INTO public.seo_config (site_title_suffix, default_meta_description)
VALUES ('RumahAgen', 'RumahAgen — platform properti untuk agen di Indonesia.');

ALTER TABLE public.seo_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY seo_config_select_public ON public.seo_config
  FOR SELECT USING (true);

CREATE POLICY seo_config_write ON public.seo_config
  FOR ALL USING (public.has_permission('m09.system_configuration.manage'))
  WITH CHECK (public.has_permission('m09.system_configuration.manage'));
