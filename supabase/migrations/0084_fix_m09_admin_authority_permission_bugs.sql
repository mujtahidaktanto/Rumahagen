-- 0084_fix_m09_admin_authority_permission_bugs.sql
-- Menutup 3 dari 4 temuan Tier 1 (bug permission AKTIF SEKARANG) dari deep
-- scan Core vs migrasi (audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md), semuanya
-- bersumber dari `docs/core/current/00-governance/STEP-00/PRE-00-K_M09_
-- ADMINISTRATION_AUTHORITY_GATE_FULL_v1.0.md` yang LOCKED tapi tidak
-- konsisten dengan seed permission 0009 / RLS 0015 / RLS 0076. Temuan
-- ke-4 (agent_project_claims kekurangan status 'withdrawn') ditutup di
-- migration terpisah karena menyentuh domain berbeda (M06, bukan M09).

-- ── FIX 1 — M09-R04 Administrative Audit Log: Manager dan Admin tertukar.
-- Gate §3 M09-R04: Superadmin=ALL, Manager=ALL, Admin=NONE. Seed 0009
-- baris 375-376 justru memberi ALL ke admin (bukan manager). RLS-nya
-- (0012, `audit_logs_select`) sudah benar memakai has_permission() --
-- cukup perbaiki baris role_permissions, tidak perlu ubah RLS.
DELETE FROM public.role_permissions
WHERE permission_id = (SELECT id FROM public.permissions WHERE action_code = 'm09.administrative_audit_log.view')
  AND role_id = (SELECT id FROM public.roles WHERE code = 'admin');

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM public.roles r, public.permissions p
WHERE r.code = 'manager' AND p.action_code = 'm09.administrative_audit_log.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ── FIX 2 — M09-R10 Provider Catalogue: Admin seharusnya ALL, saat ini
-- hanya Superadmin. Gate §3 M09-R10: Superadmin=ALL, Manager=NONE,
-- Admin=ALL. Seed 0009 baris 381/405-409 hanya memberi superadmin.
-- BERBEDA dari Fix 1: di sini RLS `ai_providers_write_superadmin` (0015)
-- TIDAK memakai has_permission() sama sekali -- hardcode
-- `public.is_superadmin()` langsung, jadi memperbaiki role_permissions
-- SAJA tidak cukup, RLS-nya sendiri harus diganti supaya benar-benar
-- menghormati matrix (R-02: satu sumber keputusan otorisasi, bukan
-- hardcode role check paralel).
INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM (VALUES
  ('admin', 'm09.provider_catalogue.mutation'),
  ('admin', 'm13.provider_catalogue.create'),
  ('admin', 'm13.provider_catalogue.edit'),
  ('admin', 'm13.provider_catalogue.enable'),
  ('admin', 'm13.provider_catalogue.disable'),
  ('admin', 'm13.provider_catalogue.retire')
) AS x(role_code, action_code)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

DROP POLICY IF EXISTS ai_providers_write_superadmin ON public.ai_providers;
CREATE POLICY ai_providers_write_superadmin ON public.ai_providers
  FOR ALL USING (public.has_permission('m09.provider_catalogue.mutation'))
  WITH CHECK (public.has_permission('m09.provider_catalogue.mutation'));

COMMENT ON POLICY ai_providers_write_superadmin ON public.ai_providers IS
  'DIPERBAIKI 0084: sebelumnya hardcode is_superadmin(), tidak menghormati matrix (Gate PRE-00-K M09-R10 mengunci Admin=ALL, bukan Superadmin-only). Nama policy dipertahankan (bukan diganti) supaya jejak DROP/CREATE di migration ini jelas -- perilakunya sekarang mengikuti has_permission() seperti tabel M13 lain.';

-- ── FIX 3 — M09-R09 Reconciliation Manual Correction: harus Superadmin-
-- only, saat ini Admin ikut bisa lewat satu permission gabungan. Gate §3
-- M09-R09 + guardrail #6-7: Review/Escalate boleh Admin, TAPI Manual
-- Correction (mengubah kasus jadi status FINAL yang mengoreksi data
-- komersial -- 'resolved'/'rejected') Superadmin-only. RLS 0076 sebelumnya
-- satu policy FOR ALL untuk semua operasi lewat SATU permission
-- (`m14.commercial_administration.manage_commercial_resources`, admin+
-- superadmin) -- tidak ada pembedaan sama sekali.
--
-- Permission BARU (bukan menghapus yang lama -- Review/Escalate/create/
-- delete case tetap Admin+Superadmin lewat permission lama, konsisten
-- dengan gate): `m14.commercial_administration.manual_correction`,
-- Superadmin-only, dicek TAMBAHAN hanya saat status baru masuk ke
-- ('resolved','rejected') -- transisi non-final (investigating/escalated)
-- tetap Admin+Superadmin seperti sebelumnya.
INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m14', 'm14.commercial_administration.manual_correction', 'all', 'Reconciliation Manual Correction (ADD-NEW/0084; Gate PRE-00-K M09-R09: Superadmin-only, dipisah dari Review/Escalate yang tetap Admin+Superadmin lewat manage_commercial_resources)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM public.roles r, public.permissions p
WHERE r.code = 'superadmin' AND p.action_code = 'm14.commercial_administration.manual_correction'
ON CONFLICT (role_id, permission_id) DO NOTHING;

DROP POLICY IF EXISTS reconciliation_cases_manage ON public.reconciliation_cases;

CREATE POLICY reconciliation_cases_select ON public.reconciliation_cases
  FOR SELECT USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'));

CREATE POLICY reconciliation_cases_insert ON public.reconciliation_cases
  FOR INSERT WITH CHECK (public.has_permission('m14.commercial_administration.manage_commercial_resources'));

CREATE POLICY reconciliation_cases_update ON public.reconciliation_cases
  FOR UPDATE USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'))
  WITH CHECK (
    public.has_permission('m14.commercial_administration.manage_commercial_resources')
    AND (
      status NOT IN ('resolved', 'rejected')
      OR public.has_permission('m14.commercial_administration.manual_correction')
    )
  );

CREATE POLICY reconciliation_cases_delete ON public.reconciliation_cases
  FOR DELETE USING (public.has_permission('m14.commercial_administration.manage_commercial_resources'));

COMMENT ON TABLE public.reconciliation_cases IS
  'Sumber: STEP10-D entity RECONCILIATION_CASES. `mismatch_category` TEXT bebas (mis. "amount_mismatch", "duplicate_webhook", "orphaned_payment", "signature_failure" -- mengikuti skenario testing checklist Midtrans_API_Dokumentasi_Detail_2026.pdf §12) -- kategori spesifik ditentukan lapisan aplikasi saat kasus dibuka, tidak dikunci di DB karena STEP10-D tidak mengevidence daftar kategori eksak. DIPERBARUI 0084: RLS dipecah 4 policy (semula 1 FOR ALL) supaya transisi status ke resolved/rejected (Manual Correction, Gate PRE-00-K M09-R09) bisa dibatasi Superadmin-only terpisah dari Review/Escalate yang tetap Admin+Superadmin.';
