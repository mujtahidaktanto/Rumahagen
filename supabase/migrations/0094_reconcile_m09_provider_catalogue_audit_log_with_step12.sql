-- 0094_reconcile_m09_provider_catalogue_audit_log_with_step12.sql
-- KOREKSI atas migration 0084 -- ditemukan lewat deep scan lanjutan Core
-- (65 file .docx/.zip yang sebelumnya di luar scope, sekarang diekstrak
-- dan dibaca): `docs/core/current/05-authorization/STEP-12-RBAC-PERMISSION-
-- RLS-SYNCHRONIZATION/STEP12-01_.../STEP12-01_ROLE_PERMISSION_MASTER_
-- MATRIX.csv` (50 baris, M02-M15) DAN `STEP12-01_ROLE_PERMISSION_CONFLICT_
-- REGISTER.csv` finding S12-01-001 SECARA EKSPLISIT menyatakan kebalikan
-- dari 2 dari 3 perbaikan 0084:
--
-- - Audit Log (`m09.administrative_audit_log.view`): Master Matrix row 31
--   mengunci Superadmin=ALL, **Admin=ALL, Manager=NONE**. 0084 menerapkan
--   SEBALIKNYA (Manager=ALL, Admin=NONE) berdasarkan
--   `PRE-00-K_M09_ADMINISTRATION_AUTHORITY_GATE_FULL_v1.0.md` §3 M09-R04.
-- - Provider Catalogue (`m09.provider_catalogue.mutation` +
--   `m13.provider_catalogue.create/edit/enable/disable/retire`): Master
--   Matrix row 34/43 DAN Conflict Register S12-01-001 eksplisit: "M13
--   final authority states Provider Catalogue mutation is Superadmin-only
--   ... Admin/Manager do not receive mutation authority ... The M09
--   combined row cannot be allowed to grant Admin mutation" -- resolusi:
--   "catalogue mutation = Superadmin only". 0084 menerapkan Admin=ALL
--   berdasarkan PRE-00-K §3 M09-R10 (Admin=ALL) -- SEBALIKNYA. Konflik ini
--   dikonfirmasi independen oleh 2 agent terpisah yang membaca dokumen
--   berbeda (STEP12-01 Conflict Register DAN STEP12-C/D Cross-Module
--   Conflict Register, keduanya menyimpulkan Superadmin-only).
--
-- KEPUTUSAN RESOLUSI KONFLIK ANTAR-DOKUMEN CORE: STEP12-01 menang atas
-- PRE-00-K -- ini BUKAN preferensi baru, tapi PRESEDEN yang SUDAH
-- ditetapkan proyek ini sendiri di `0008_dbr_config.sql`: "STEP12-01
-- dieksekusi setelah STEP11 handoff, hasilnya secara eksplisit menang
-- atas versi lama -- pola yang sama seperti S12-B-001 ... 'Later current
-- M10 granular matrix governs operational delegation; older umbrella
-- wording retained only as provenance'". PRE-00-K (STEP-00, gate lebih
-- awal) adalah "umbrella wording" yang kalah terhadap STEP12-01 (STEP-12,
-- matrix granular lebih baru + Conflict Register yang MEMUTUSKAN
-- pertentangan ini secara eksplisit) -- konsisten dengan prinsip proyek
-- sendiri, bukan penyimpangan baru.
--
-- Reconciliation Manual Correction (temuan T1-3 asli 0084, permission
-- `m14.commercial_administration.manual_correction`) TIDAK disentuh --
-- Master Matrix tidak punya baris yang mempertentangkannya, tetap benar.

-- ── Audit Log: kembalikan ke Superadmin=ALL, Admin=ALL, Manager=NONE ──
DELETE FROM public.role_permissions
WHERE permission_id = (SELECT id FROM public.permissions WHERE action_code = 'm09.administrative_audit_log.view')
  AND role_id = (SELECT id FROM public.roles WHERE code = 'manager');

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM public.roles r, public.permissions p
WHERE r.code = 'admin' AND p.action_code = 'm09.administrative_audit_log.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ── Provider Catalogue: kembalikan ke Superadmin-ONLY, hapus grant Admin ──
DELETE FROM public.role_permissions
WHERE role_id = (SELECT id FROM public.roles WHERE code = 'admin')
  AND permission_id IN (
    SELECT id FROM public.permissions WHERE action_code IN (
      'm09.provider_catalogue.mutation',
      'm13.provider_catalogue.create',
      'm13.provider_catalogue.edit',
      'm13.provider_catalogue.enable',
      'm13.provider_catalogue.disable',
      'm13.provider_catalogue.retire'
    )
  );

DROP POLICY IF EXISTS ai_providers_write_superadmin ON public.ai_providers;
CREATE POLICY ai_providers_write_superadmin ON public.ai_providers
  FOR ALL USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

COMMENT ON POLICY ai_providers_write_superadmin ON public.ai_providers IS
  'DIKEMBALIKAN 0094 ke hardcode is_superadmin() (bentuk asli 0015) -- 0084 sempat mengganti ke has_permission(''m09.provider_catalogue.mutation'') + grant Admin berdasarkan PRE-00-K, TERNYATA bertentangan dengan STEP12-01 Master Matrix + Conflict Register S12-01-001 yang mengunci Provider Catalogue mutation Superadmin-only. STEP12-01 menang atas PRE-00-K per preseden 0008.';
