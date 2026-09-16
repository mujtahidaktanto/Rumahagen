-- 0015_m13_provider_catalogue.sql
-- Menutup residual: R-07 (M13 Provider Catalogue/BYOK Core propagation — realisasi
-- fisik pertama, bukan cuma referensi dokumen), sebagian D13-09 (Provider Catalogue
-- mutation semantically Superadmin-only — RLS ditulis di sini; rute REST-nya sendiri
-- menyusul Step 3/STEP-11, lihat catatan penutupan di README migrations).
--
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- AI_PROVIDERS (module M13, seluruh baris berstatus PRESERVE_EXACT_PHYSICAL_CORROBORATION)
-- — TIDAK ADA deviasi dari dokumen sumber di tabel ini.
--
-- Sumber permission: STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv baris
-- "M13,Provider Catalogue,Create/Edit/Enable/Disable/Retire,ALL,NONE,NONE,NONE,NONE,NONE,NONE"
-- (Superadmin=ALL, semua role lain=NONE). Lima permission code turunan dari baris ini
-- (m13.provider_catalogue.create/edit/enable/disable/retire) SUDAH DI-SEED di
-- 0009_seed_authorization.sql sejak Tahap 1 — migration ini TIDAK menambah permission
-- baru, hanya menyambungkan tabel fisik ke permission yang sudah ada (menegakkan
-- D13-15: tidak ada permission-ID dikarang ulang di luar katalog sumber).

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     VARCHAR(50) UNIQUE NOT NULL,
  display_name             VARCHAR(100) NOT NULL,
  logo_url                 VARCHAR(500),
  billing_type             TEXT NOT NULL DEFAULT 'free_tier_ongoing'
                              CHECK (billing_type IN ('free_tier_ongoing','paid_only','trial_then_paid')),
  setup_instructions_url   VARCHAR(500) NOT NULL,
  usage_terms_note         TEXT,
  requires_expiry_warning  BOOLEAN NOT NULL DEFAULT false,
  status                   TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_providers IS
  'Katalog provider AI yang boleh dipakai untuk BYOK (Bring Your Own Key). Sumber: STEP10-D entity AI_PROVIDERS — kolom persis, tanpa deviasi. Mutasi Superadmin-only (D13-09). Tidak ada seed data provider nyata di sini (lihat catatan di bawah) — Superadmin mengisi lewat endpoint mutasi (menyusul Step 3/STEP-11).';

COMMENT ON COLUMN public.ai_providers.status IS
  'Hanya 2 nilai sesuai STEP10-D (active/inactive) — TIDAK dilebarkan. Action "Disable" dan "Retire" di master matrix sama-sama diwakili status=inactive (skema sumber tidak membedakan disable sementara vs retire permanen untuk entity ini; kalau kebutuhan membedakan keduanya muncul nyata, itu residual baru, bukan diasumsikan di sini).';

-- SENGAJA TIDAK ADA seed data provider (mis. nama provider AI tertentu) — dicek ke
-- seluruh corpus dokumen (docs/ + archive/, termasuk isi zip bersarang), tidak ada
-- satu pun daftar provider kanonik yang dievidensi di sumber manapun. Menambah baris
-- di sini akan berarti mengarang data bisnis di luar dokumen — bertentangan dengan
-- prinsip "NOT INVENTED / USE SOURCE CATALOGUE" yang dipakai konsisten di seluruh
-- STEP12-G. Superadmin mengisi katalog ini secara operasional setelah endpoint
-- mutasi (D13-09) ditulis.

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- Baca: provider dengan status 'active' boleh dilihat siapa pun yang sudah login —
-- ini prasyarat fungsional supaya Developer Partner bisa MEMILIH provider sebelum
-- membuat BYOK connection (permission m13.own_byok_connection.create miliknya tidak
-- ada gunanya kalau tidak bisa melihat katalog). Tidak ada baris permission "View"
-- eksplisit untuk Provider Catalogue di master matrix (hanya "Mutation" yang
-- dievidensi) — pola yang sama seperti public_announcement_promotion di 0014:
-- SELECT publik/read dikondisikan langsung, bukan lewat has_permission(), karena
-- memang tidak ada permission code untuk itu di katalog sumber. Superadmin tetap
-- bisa lihat baris inactive lewat klausul kedua.
CREATE POLICY ai_providers_select_active_or_admin ON public.ai_providers
  FOR SELECT USING (
    (status = 'active' AND auth.uid() IS NOT NULL)
    OR public.is_superadmin()
  );

-- Tulis (create/edit/enable/disable/retire): kelima action_code di atas berbagi
-- scope IDENTIK (Superadmin=ALL, semua role lain=NONE) di master matrix — satu
-- resource, satu baris matrix. Daripada memilih salah satu dari lima action_code
-- sebagai representative has_permission() call (berpotensi menyesatkan pembaca,
-- mis. UPDATE memanggil kode 'create'), dipakai public.is_superadmin() langsung —
-- ini FUNGSI YANG SAMA dari lapisan otorisasi tunggal 0006 (bukan logika baru,
-- R-02 tetap ditegakkan), dan sudah jadi pola yang dipakai migration lain untuk
-- kasus scope seragam serupa (lihat 0007 organizations_manage/permission_presets_manage).
CREATE POLICY ai_providers_write_superadmin ON public.ai_providers
  FOR ALL USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
