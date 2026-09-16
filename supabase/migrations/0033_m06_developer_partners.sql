-- 0033_m06_developer_partners.sql
-- Prasyarat fisik untuk developer_projects (0034) — DEVELOPER_PARTNERS adalah
-- FK NOT NULL target yang sejak Tahap 4 (listings.developer_project_id) dan
-- Tahap 5 (agent_ai_connections konseptual terkait role Developer Partner)
-- terus ditunda.
--
-- Sumber kolom: STEP10-D entity DEVELOPER_PARTNERS (module M06). 2 kolom gap
-- (company_logo, description) diisi minimal di sini.
--
-- CATATAN PERMISSION: tidak ada baris "Developer" murni di master matrix
-- (hanya Marketing Kit dan Claim) — Gate PRE-00-H §15 eksplisit bilang matrix
-- M06 adalah "input to later M10 synchronization, not a replacement" — artinya
-- memang belum lengkap disinkronkan, bukan sengaja tanpa kontrol akses. 1
-- permission BARU di-mint, scope staf-dikelola (direktori partner adalah data
-- administratif, bukan self-service registrasi — tidak ada evidensi Developer
-- Partner mendaftar dirinya sendiri di manapun dalam corpus):
--   m06.developer_partner.manage → Superadmin/Admin/Manager=ALL saja

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m06', 'm06.developer_partner.manage', 'own', 'Developer Partner directory - Manage (permission baru, tidak ada baris eksplisit di master matrix — Gate PRE-00-H §15 catatan matrix M06 belum lengkap disinkronkan ke M10; staf-dikelola, bukan self-registrasi)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm06.developer_partner.manage', 'all'),
  ('admin',      'm06.developer_partner.manage', 'all'),
  ('manager',    'm06.developer_partner.manage', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.developer_partners (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name   VARCHAR(200) NOT NULL,
  company_logo   VARCHAR(500),
  description    TEXT,
  pic_name       VARCHAR(150),
  pic_contact    VARCHAR(50),
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.developer_partners IS
  'Sumber: STEP10-D entity DEVELOPER_PARTNERS. `user_id` NULLABLE (bukan bug) — direktori company bisa ada sebelum akun platform user Developer Partner terkait dibuat/ditautkan, sesuai kolom sumber apa adanya.';

-- ── RLS ──

ALTER TABLE public.developer_partners ENABLE ROW LEVEL SECURITY;

-- SELECT publik (nama company perlu terlihat di halaman project/listing publik)
-- untuk baris active; staf lihat semua termasuk inactive.
CREATE POLICY developer_partners_select ON public.developer_partners
  FOR SELECT USING (
    (status = 'active' AND deleted_at IS NULL)
    OR public.has_permission('m06.developer_partner.manage')
    OR user_id = auth.uid()
  );

CREATE POLICY developer_partners_manage ON public.developer_partners
  FOR ALL USING (public.has_permission('m06.developer_partner.manage'))
  WITH CHECK (public.has_permission('m06.developer_partner.manage'));
