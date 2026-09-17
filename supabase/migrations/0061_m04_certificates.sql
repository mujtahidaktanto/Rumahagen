-- 0061_m04_certificates.sql
-- Fase 2 (penutup batch tabel, lanjutan 0056-0060): CERTIFICATES. Sumber
-- kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa
-- deviasi. Kontrak API: STEP11-B4 API-056 (GET /agents/me/certificates —
-- "M04 Certificate/Credential presentation; not M15 Award"). Q-M04-C-06B
-- eksplisit: "Certificate view is not Credential administration" — issuance
-- BUKAN aksi Agent, hanya staf.
--
-- PERMISSION BARU: `m04.certificate.manage` — Superadmin/Admin/Manager=ALL
-- SAJA (issue + lihat semua). Agent SENGAJA TIDAK diberi grant permission
-- ini sama sekali (bukan scope 'own' yang dibatasi ke SELECT lewat
-- has_permission — kalau diberi scope 'own' pada permission FOR ALL yang
-- sama, Agent otomatis bisa INSERT/UPDATE baris miliknya sendiri lewat RLS,
-- termasuk self-issue certificate yang tidak sah). Sebagai gantinya, akses
-- baca Agent ditegakkan lewat kondisi kepemilikan LANGSUNG (`agent_id =
-- auth.uid()`) di policy SELECT terpisah, BUKAN lewat grant permission
-- apa pun — pola yang sama seperti `award_instances_select` (M15/0026)
-- yang memisahkan visibility publik dari permission manage.

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.certificate.manage', 'all', 'Certificate - Manage (ADD-NEW, issue/kelola — HANYA Superadmin/Admin/Manager, Agent TIDAK PERNAH diberi grant di sini demi mencegah self-issue; Agent baca certificate sendiri lewat kondisi agent_id=auth.uid() langsung di RLS, bukan lewat permission ini)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.certificate.manage', 'all'),
  ('admin',      'm04.certificate.manage', 'all'),
  ('manager',    'm04.certificate.manage', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_url   VARCHAR(500),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.certificates IS
  'Sumber: STEP10-D entity CERTIFICATES. TERPISAH TOTAL dari M15 `award_instances` (Q-M04-C-06B/§7 STEP11-B8: "Certificate ≠ Award Instance") — Certificate adalah bukti penyelesaian course M04, Award adalah kualifikasi formal M15 yang butuh Title/Authority Scope. Tidak ada FK antar keduanya di sini; kalau suatu saat Certificate perlu memicu Award, itu lewat pipeline qualification_evidence (M15) seperti session_completion_outcomes, bukan FK langsung.';

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    agent_id = auth.uid()
    OR public.has_permission('m04.certificate.manage')
  );

CREATE POLICY certificates_manage ON public.certificates
  FOR ALL USING (public.has_permission('m04.certificate.manage'))
  WITH CHECK (public.has_permission('m04.certificate.manage'));
