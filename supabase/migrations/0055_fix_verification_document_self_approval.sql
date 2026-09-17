-- 0055_fix_verification_document_self_approval.sql
-- BUG FUNGSIONAL ditemukan saat testing nyata Fase 1 (0049): RLS
-- agent_verification_documents_update hanya mengecek has_permission
-- ('m01.verification_document.manage', user_id) — untuk Agent, scope 'own'
-- membuat pengecekan ini TRUE untuk baris miliknya sendiri, TANPA
-- membedakan kolom mana yang diubah. Komentar asli di 0049 menyatakan
-- proteksi review_status "dilindungi lapisan REST API/Zod schema, bukan
-- RLS" — TERBUKTI SALAH/TIDAK CUKUP saat diuji langsung lewat PostgREST
-- (bukan lewat route Next.js yang belum dibangun): Agent BERHASIL
-- self-approve dokumennya sendiri (`review_status: pending -> approved`)
-- lewat request PATCH langsung, karena Supabase mengekspos SETIAP tabel
-- lewat PostgREST otomatis terlepas dari REST route Next.js apa pun yang
-- (belum) dibangun di atasnya. Trigger di sini menutup celah di sumbernya
-- (level RLS/DB), bukan berharap sepenuhnya pada lapisan aplikasi —
-- pola sama seperti trg_enforce_organization_invitation_no_self_accept
-- (0050) dan trg_partnership_result_validation_superadmin_only (0024).

CREATE OR REPLACE FUNCTION public.enforce_verification_document_staff_only_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    IF NOT (public.is_superadmin() OR public.current_role_code() IN ('admin','manager')) THEN
      RAISE EXCEPTION 'agent_verification_documents: hanya Superadmin/Admin/Manager yang boleh mengubah review_status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_enforce_verification_document_staff_only_review
  BEFORE UPDATE ON public.agent_verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_verification_document_staff_only_review();
