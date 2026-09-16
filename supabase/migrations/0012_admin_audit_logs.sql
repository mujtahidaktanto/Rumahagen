-- 0012_admin_audit_logs.sql
-- Menutup residual D13-13: "/admin/audit-logs authorization wording is not
-- aligned with M09-R04 scope" — M09-R04 = "Administrative Audit Log View":
-- Superadmin=ALL, Admin=ALL, semua role lain=NONE (bukan Superadmin-only,
-- bukan juga dibuka lebih luas dari itu). Dikonfirmasi di
-- STEP12-G_ROLE_PERMISSION_CAPABILITY_RLS_MATRIX.csv PAR-030:
-- "audit_logs [RLS=ENABLED; policies=0]" — sama seperti system_configs,
-- tabel sudah ditandai RLS aktif tapi 0 policy fisik.
--
-- Kolom persis sesuai STEP10-D dictionary, entity AUDIT_LOGS.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action           VARCHAR(100) NOT NULL,
  entity_type      VARCHAR(50),
  entity_id        UUID,
  organization_id  UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  old_value        JSONB,
  new_value        JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS
  'Sumber: STEP10-D entity AUDIT_LOGS. View dibatasi Superadmin+Admin (M09-R04) — menutup D13-13. INSERT dilakukan lewat log_audit_event() SECURITY DEFINER supaya semua modul (bukan cuma M09) bisa menulis log tanpa perlu izin audit_logs.manage sendiri.';

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT USING (public.has_permission('m09.administrative_audit_log.view'));

-- Tidak ada policy UPDATE/DELETE sama sekali — audit log harus append-only.
-- Tidak ada policy INSERT untuk role biasa — insert HANYA lewat fungsi di bawah
-- (SECURITY DEFINER), supaya actor tidak bisa menulis log palsu langsung ke tabel.

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action          VARCHAR(100),
  p_entity_type     VARCHAR(50) DEFAULT NULL,
  p_entity_id       UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_old_value       JSONB DEFAULT NULL,
  p_new_value       JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, organization_id, old_value, new_value)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_organization_id, p_old_value, p_new_value)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.log_audit_event IS
  'Satu-satunya cara menulis ke audit_logs. Dipanggil dari route handler modul manapun (M03, M09, M13, dst.) setelah operasi admin/mutasi sensitif — bukan trigger otomatis di semua tabel, supaya modul yang belum ada (Tahap 2-6 lain) tetap eksplisit memilih kapan logging relevan.';
