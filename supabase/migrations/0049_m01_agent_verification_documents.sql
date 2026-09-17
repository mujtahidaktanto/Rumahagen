-- 0049_m01_agent_verification_documents.sql
-- Fase 1 (lanjutan 0047/0048): tabel M01 yang STEP10-D tandai
-- PRESERVE_EXACT_PHYSICAL_CORROBORATION tapi belum pernah dibuat. Sumber
-- kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- AGENT_VERIFICATION_DOCUMENTS — tanpa deviasi kolom.
--
-- PERMISSION BARU: `m01.verification_document.manage`. Tidak ada satu pun
-- baris M01 di permissions seed (0009) sama sekali — modul M01 Identity/Auth
-- sepenuhnya ditangani Supabase Auth + RLS `users` yang sudah ada, tanpa
-- permission action code sendiri. AGENT_VERIFICATION_DOCUMENTS butuh
-- otorisasi genuinely baru: Agent upload dokumen identitas miliknya sendiri
-- (KTP/NPWP/sertifikasi REI) dan lihat status review-nya (OWN), staf
-- (Superadmin/Admin/Manager) me-review approve/reject (ALL) — pola yang
-- sama seperti `agent_project_claims` (submit sendiri, staf/pihak berwenang
-- me-review), satu permission action mencakup kedua sisi lewat scope
-- OWN/ALL (pola sama seperti `m04.partnership_learning_result.manage`/0024).
-- Scope diberikan HANYA ke Agent (bukan Developer Partner/Instructor/Buyer)
-- karena doc_type (ktp/npwp/sertifikasi_rei) spesifik konteks verifikasi
-- identitas Agent, bukan role lain — kalau role lain butuh verifikasi
-- serupa nanti, itu perluasan terpisah, bukan diasumsikan sekarang.

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m01', 'm01.verification_document.manage', 'own', 'Verification Document - Manage (ADD-NEW, tidak ada baris M01 di master matrix; Agent=OWN upload/lihat dokumen sendiri, Superadmin/Admin/Manager=ALL review approve/reject)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm01.verification_document.manage', 'all'),
  ('admin',      'm01.verification_document.manage', 'all'),
  ('manager',    'm01.verification_document.manage', 'all'),
  ('agent',      'm01.verification_document.manage', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.agent_verification_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doc_type          TEXT NOT NULL CHECK (doc_type IN ('ktp','npwp','sertifikasi_rei','lainnya')),
  file_url          VARCHAR(500) NOT NULL,
  encrypted         BOOLEAN NOT NULL DEFAULT true,
  review_status     TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  reviewed_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agent_verification_documents IS
  'Sumber: STEP10-D entity AGENT_VERIFICATION_DOCUMENTS. `encrypted` menandai apakah file_url menunjuk ke blob terenkripsi di storage (mekanisme enkripsi/dekripsi ada di lapisan storage, di luar scope migration — beda dari BYOK/0016 yang enkripsinya di level aplikasi Next.js).';

-- Trigger: reviewed_by/rejection_reason hanya relevan kalau review_status
-- bukan 'pending' — validitas data dasar, bukan otorisasi (pola sama
-- seperti enforce_event_registration_guest_email/0032).
CREATE OR REPLACE FUNCTION public.enforce_verification_document_review_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_status = 'pending' AND (NEW.reviewed_by IS NOT NULL OR NEW.rejection_reason IS NOT NULL) THEN
    RAISE EXCEPTION 'agent_verification_documents: reviewed_by/rejection_reason harus kosong kalau review_status masih pending';
  END IF;
  IF NEW.review_status = 'rejected' AND NEW.rejection_reason IS NULL THEN
    RAISE EXCEPTION 'agent_verification_documents: rejection_reason wajib diisi kalau review_status=rejected';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_enforce_verification_document_review_fields
  BEFORE INSERT OR UPDATE ON public.agent_verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_verification_document_review_fields();

ALTER TABLE public.agent_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_verification_documents_select ON public.agent_verification_documents
  FOR SELECT USING (public.has_permission('m01.verification_document.manage', user_id));

CREATE POLICY agent_verification_documents_insert ON public.agent_verification_documents
  FOR INSERT WITH CHECK (public.has_permission('m01.verification_document.manage', user_id));

-- UPDATE dipisah dari INSERT: pemilik dokumen TIDAK BOLEH mengubah
-- review_status miliknya sendiri (itu wewenang staf) — has_permission scope
-- OWN untuk Agent tetap lolos WITH CHECK di sini secara struktur permission,
-- TAPI kolom review_status/reviewed_by/rejection_reason yang sensitif
-- dilindungi lapisan REST API (Zod schema tidak expose field itu untuk
-- Agent), bukan RLS terpisah — pola sama seperti listings.agent_id yang
-- dilindungi trigger, bukan RLS ganda (R-02: satu mekanisme per aturan).
CREATE POLICY agent_verification_documents_update ON public.agent_verification_documents
  FOR UPDATE USING (public.has_permission('m01.verification_document.manage', user_id));
