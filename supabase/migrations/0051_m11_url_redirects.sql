-- 0051_m11_url_redirects.sql
-- Fase 1 (lanjutan 0047-0050): tabel M11 PRESERVE_EXACT_PHYSICAL_
-- CORROBORATION, kolom persis sesuai STEP10-D_ATTRIBUTE_TO_PHYSICAL_
-- COLUMN_RECONCILIATION.csv.
--
-- TIDAK ADA permission baru — memakai `m11.static_public_content.publish`
-- yang sudah ada (Superadmin/Admin=ALL) untuk manage, konsisten dengan
-- alasan yang sama seperti 0037: url_redirects adalah infrastruktur SEO
-- sejenis (bukan resource M-module terpisah dengan permission sendiri di
-- master matrix), me-mint permission baru untuk hal yang secara semantik
-- sama akan menduplikasi konsep otorisasi tanpa alasan.

CREATE TABLE IF NOT EXISTS public.url_redirects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path       VARCHAR(300) UNIQUE NOT NULL,
  new_path       VARCHAR(300) NOT NULL,
  redirect_type  SMALLINT NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  reason         TEXT CHECK (reason IN ('slug_changed','listing_deleted','listing_merged','lainnya')),
  entity_type    VARCHAR(50),
  entity_id      UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.url_redirects IS
  'Sumber: STEP10-D entity URL_REDIRECTS. `entity_type`/`entity_id` referensi longgar (TIDAK ada FK fisik — bisa menunjuk listings/developer_projects/dst., tabel manapun yang slug-nya berubah) — pola sama seperti audit_logs.entity_type/entity_id (0012), bukan FK spesifik supaya satu tabel ini bisa dipakai lintas modul.';

ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;

-- SELECT publik penuh — satu-satunya tujuan tabel ini adalah menjawab
-- "URL lama ini sekarang kemana" untuk SIAPA PUN yang mengakses old_path,
-- termasuk pengunjung anonim/crawler mesin pencari.
CREATE POLICY url_redirects_select_public ON public.url_redirects FOR SELECT USING (true);

CREATE POLICY url_redirects_manage ON public.url_redirects
  FOR ALL USING (public.has_permission('m11.static_public_content.publish'))
  WITH CHECK (public.has_permission('m11.static_public_content.publish'));
