-- 0014_admin_public_announcement_promotion.sql
-- Menutup residual D13-05: "Announcement/Promotion lifecycle administration
-- remains incomplete and split across M09/M14 responsibilities."
--
-- KEPUTUSAN ENGINEERING (didokumentasikan eksplisit, karena baris ini TIDAK
-- ada di STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv — beda dengan migration
-- 0011-0013 yang semua permission-nya sudah ada di seed 0009):
--
-- 1. Scope tabel: STEP10-D dictionary punya entity PUBLIC_ANNOUNCEMENT_PROMOTION
--    dengan nama atribut lengkap tapi TANPA sql_physical_definition (kolom kosong)
--    — berbeda dari PROMOTIONS (M14) yang sudah py punya tipe fisik lengkap
--    (rule_configuration/eligibility_configuration/benefit_configuration JSONB).
--    Kesimpulan: PROMOTIONS (M14, belum dibuat — menyusul Tahap 4) adalah mesin
--    aturan/benefit promosi; PUBLIC_ANNOUNCEMENT_PROMOTION (M09, tabel ini) adalah
--    lapisan PRESENTASI publik (judul, gambar, CTA, jadwal tayang) — konsisten
--    dengan D13-05 sendiri: "M11 public discovery ... consumes M14 Promotion
--    truth" (M14 = sumber kebenaran aturan) sementara M09 mengatur tampilannya.
--
-- 2. Permission BARU: tidak ada baris matrix untuk resource ini, jadi kode
--    permission `m09.public_announcement_promotion.manage` di-mint baru DENGAN
--    scope role PERSIS meniru pola resource M09 yang paling mirip secara
--    semantik: "Notification Template/Content Configure" (baris matrix yang
--    sudah ada) — Superadmin=ALL, Admin=ALL, Manager=ALL, sisanya NONE. Alasan:
--    sama-sama "presentation/content config" milik M09, dikelola tim internal
--    (bukan actor publik/Agent). Ini keputusan MINIMAL-INVENTION: pola role
--    diambil dari resource tetangga yang sudah frozen, bukan dikarang bebas.
--    Kalau di P-series berikutnya ternyata matrix resmi menetapkan scope
--    berbeda, migration ini yang perlu direvisi — bukan didiamkan sebagai
--    "sudah benar".

CREATE TABLE IF NOT EXISTS public.public_announcement_promotion (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(200) NOT NULL,
  content            TEXT,
  image_reference    VARCHAR(500),
  cta_reference      VARCHAR(500),
  campaign_reference VARCHAR(150),  -- referensi longgar ke promotions.code (M14) — FK ditambahkan saat migration M14 (Tahap 4) dibuat, lihat catatan di bawah.
  priority           INTEGER NOT NULL DEFAULT 0,
  schedule_at        TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ,
  status             TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','scheduled','active','expired','archived')),
  canonical_url      VARCHAR(500),
  created_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.public_announcement_promotion IS
  'Sumber: STEP10-D entity PUBLIC_ANNOUNCEMENT_PROMOTION (tipe fisik tidak dikorroborasi di dokumen — didesain di sini). Lapisan presentasi M09; aturan/benefit promosi sebenarnya tetap di M14 promotions (menyusul). Menutup D13-05.';

COMMENT ON COLUMN public.public_announcement_promotion.campaign_reference IS
  'Referensi longgar (bukan FK) ke promotions.code — tabel promotions belum ada (M14, Tahap 4). TODO saat M14 dibuat: ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY (campaign_reference) REFERENCES promotions(code).';

-- Daftarkan permission baru (lihat rasional keputusan di atas). module_code
-- dan action_code dipilih konsisten dengan konvensi seed 0009 (module.resource.action).
INSERT INTO public.permissions (module_code, action_code, scope_type, description)
VALUES ('m09', 'm09.public_announcement_promotion.manage', 'all',
        'Public Announcement/Promotion - Manage (permission baru, lihat rasional di migration 0014)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM public.roles r, public.permissions p
WHERE r.code IN ('superadmin','admin','manager')
  AND p.action_code = 'm09.public_announcement_promotion.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;

ALTER TABLE public.public_announcement_promotion ENABLE ROW LEVEL SECURITY;

-- Publik (anon/semua actor login) boleh baca pengumuman yang sudah 'active' saja.
CREATE POLICY public_announcement_promotion_select_public ON public.public_announcement_promotion
  FOR SELECT USING (status = 'active' AND (schedule_at IS NULL OR schedule_at <= now())
                     AND (expires_at IS NULL OR expires_at > now()));

-- Tim internal (Superadmin/Admin/Manager) boleh lihat & kelola semua baris,
-- termasuk draft/scheduled/expired/archived.
CREATE POLICY public_announcement_promotion_manage ON public.public_announcement_promotion
  FOR ALL USING (public.has_permission('m09.public_announcement_promotion.manage'))
  WITH CHECK (public.has_permission('m09.public_announcement_promotion.manage'));
