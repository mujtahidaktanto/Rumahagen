-- ============================================================================
-- Migration 0002: Modul 10 — RBAC Foundation (roles, permissions, role_permissions)
-- Dibangun PERTAMA sesuai DEVELOPMENT-ROADMAP.md "Module Order" #0/#3 —
-- modul fondasi, tidak bergantung modul lain.
-- ENT: ENT-M10-Role, ENT-M10-Permission, ENT-M10-RolePermission
-- ============================================================================

CREATE TABLE roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(50) UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  is_system_role    BOOLEAN NOT NULL DEFAULT true,
  is_protected      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed 7 role final (resolusi OD-02, ERD v1.3 §2.28) — Guest BUKAN baris fisik
INSERT INTO roles (code, name, is_system_role, is_protected) VALUES
  ('superadmin',        'Superadmin',        true, true),
  ('manager',           'Manager',           true, false),
  ('admin',             'Admin',             true, false),
  ('instructor',        'Instructor',        true, false),
  ('agent',             'Agen',              true, false),
  ('developer_partner', 'Developer Partner', true, false),
  ('buyer',             'Buyer',             true, false);

CREATE TABLE permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code   VARCHAR(50) NOT NULL,
  action_code   VARCHAR(50) NOT NULL,
  scope_type    TEXT NOT NULL DEFAULT 'own' CHECK (scope_type IN ('all','own','none')),
  description   VARCHAR(255),
  UNIQUE (module_code, action_code)
);

CREATE TABLE role_permissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id               UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  permission_id         UUID NOT NULL REFERENCES permissions(id) ON DELETE RESTRICT,
  granted_scope         TEXT NOT NULL CHECK (granted_scope IN ('all','own','none')),
  editable_by_role_code VARCHAR(100) NOT NULL DEFAULT 'superadmin',
  updated_by            UUID,  -- FK → users.id, ditambahkan via ALTER setelah tabel users ada (lihat 0003)
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);

-- Index traceability PERM-XXX: setiap baris di sini menegakkan PERM-[module_code]-[action_code]-[Entity]
-- terdaftar penuh di Authorization-Access-Control-Specification-v1.0.md Bagian 2.

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- roles: semua user authenticated boleh VIEW (PERM-M10-View-Role, Authorization Spec §2.10 read-only utk Superadmin/Manager)
CREATE POLICY roles_select ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY roles_manage ON roles FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

-- permissions: read-only bagi seluruh authenticated, manage hanya Superadmin
CREATE POLICY permissions_select ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_manage ON permissions FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

-- role_permissions: PERM-M10-Manage-RolePermission (Superadmin all) / PERM-M10-Update-RolePermission (Manager terbatas role agent)
CREATE POLICY role_permissions_select ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_superadmin_all ON role_permissions FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());
-- Manager: HANYA boleh UPDATE baris yang editable_by_role_code memuat 'manager' DAN role target = 'agent'
CREATE POLICY role_permissions_manager_update ON role_permissions FOR UPDATE TO authenticated
  USING (
    auth_role_code() = 'manager'
    AND editable_by_role_code LIKE '%manager%'
    AND role_id = (SELECT id FROM roles WHERE code = 'agent')
  )
  WITH CHECK (
    auth_role_code() = 'manager'
    AND editable_by_role_code LIKE '%manager%'
    AND role_id = (SELECT id FROM roles WHERE code = 'agent')
  );
