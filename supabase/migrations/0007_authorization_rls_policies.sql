-- 0007_authorization_rls_policies.sql
-- Sumber: STEP12-D_RLS_REQUIREMENT_MATRIX.csv + STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv
-- (baris M10: Role Catalogue View=ALL/ALL/ALL, Permission Catalogue View=ALL/ALL/ALL,
--  Role-Permission Matrix View=ALL/ALL/ALL, Manage=ALL only, Agent Permission Rows
--  Modify=ALL/OWN(Manager)).
--
-- Setiap policy memanggil has_permission()/is_superadmin() dari 0006 — TIDAK ada
-- logika otorisasi baru ditulis di sini (menegakkan R-02 secara fisik).

ALTER TABLE public.users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_presets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_preset_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_presets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members      ENABLE ROW LEVEL SECURITY;

-- ── users ──
-- Semua actor login boleh baca profil sendiri; permission m10 tidak mengatur user
-- lain di luar admin console (M09), jadi default SELECT dibatasi ke baris sendiri
-- + Superadmin/Admin (yang di master matrix memang butuh lihat semua user untuk M09).
CREATE POLICY users_select_self_or_admin ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_superadmin() OR public.current_role_code() = 'admin');

CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ── roles / permissions / role_permissions ──
-- "Role Catalogue View" & "Permission Catalogue View" & "Role-Permission Matrix
-- View" = ALL/ALL/ALL (Superadmin/Admin/Manager) di master matrix.
CREATE POLICY roles_select ON public.roles
  FOR SELECT USING (public.has_permission('m10.role_catalogue.view'));

CREATE POLICY permissions_select ON public.permissions
  FOR SELECT USING (public.has_permission('m10.permission_catalogue.view'));

CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT USING (public.has_permission('m10.role_permission_matrix.view'));

-- "Role-Permission Matrix Manage" = Superadmin ALL only (protected governance).
CREATE POLICY role_permissions_manage_superadmin ON public.role_permissions
  FOR ALL USING (public.has_permission('m10.role_permission_matrix.manage'))
  WITH CHECK (public.has_permission('m10.role_permission_matrix.manage'));

-- "Agent Permission Rows Modify" = Superadmin ALL, Manager OWN (baris milik role
-- Agent saja — mekanismenya lewat Permission Preset di 0004, bukan langsung
-- mengedit role_permissions Agent).
CREATE POLICY role_permissions_manager_modify_agent_rows ON public.role_permissions
  FOR UPDATE USING (
    public.current_role_code() = 'manager'
    AND public.has_permission('m10.agent_permission_rows.modify')
    AND role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  )
  WITH CHECK (
    role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  );

-- ── permission_presets / items / assignments ──
-- Preset adalah instrumen Manager untuk mengatur Agent (STEP12-B PP-001):
-- Superadmin ALL; Manager boleh kelola preset untuk target role Agent.
CREATE POLICY permission_presets_manage ON public.permission_presets
  FOR ALL USING (
    public.is_superadmin()
    OR (public.current_role_code() = 'manager'
        AND target_role_id = (SELECT id FROM public.roles WHERE code = 'agent'))
  )
  WITH CHECK (
    public.is_superadmin()
    OR (public.current_role_code() = 'manager'
        AND target_role_id = (SELECT id FROM public.roles WHERE code = 'agent'))
  );

CREATE POLICY permission_preset_items_manage ON public.permission_preset_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.permission_presets pp
      WHERE pp.id = preset_id
        AND (public.is_superadmin() OR public.current_role_code() = 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permission_presets pp
      WHERE pp.id = preset_id
        AND (public.is_superadmin() OR public.current_role_code() = 'manager')
    )
  );

CREATE POLICY user_permission_presets_manage ON public.user_permission_presets
  FOR ALL USING (public.is_superadmin() OR public.current_role_code() = 'manager')
  WITH CHECK (public.is_superadmin() OR public.current_role_code() = 'manager');

-- Agent yang jadi target preset boleh MELIHAT (bukan mengubah) preset miliknya sendiri.
CREATE POLICY user_permission_presets_select_own ON public.user_permission_presets
  FOR SELECT USING (user_id = auth.uid());

-- ── organizations / organization_members ──
-- Belum ada baris eksplisit organizations di master matrix M10 (organization
-- context = tambahan kondisi, bukan resource M10 sendiri — lihat M12 di matrix:
-- "Manage within authorized context" ALL/ALL/OWN/OWN/OWN/OWN/OWN). Policy dasar:
-- anggota organisasi boleh lihat organisasinya; pengelolaan penuh ALL untuk
-- Superadmin/Admin, OWN untuk role lain yang jadi leader.
CREATE POLICY organizations_select_member ON public.organizations
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_member(id)
  );

CREATE POLICY organizations_manage ON public.organizations
  FOR ALL USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR created_by = auth.uid()
  )
  WITH CHECK (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR created_by = auth.uid()
  );

CREATE POLICY organization_members_select ON public.organization_members
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_member(organization_id)
  );

CREATE POLICY organization_members_manage ON public.organization_members
  FOR ALL USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'
    )
  )
  WITH CHECK (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'
    )
  );
