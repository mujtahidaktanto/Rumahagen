-- ============================================================================
-- Migration 0007: Modul 12 — Organization Management System
-- Dibangun sebelum M03 karena listings.organization_id mereferensikan organizations.
-- ENT: ENT-M12-Organization/OrganizationMember/OrganizationInvitation
-- Dasar: ADR-026/ADR-043, ADR-027/ADR-044
-- ============================================================================

CREATE TABLE organizations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name  VARCHAR(150) NOT NULL,
  slug               VARCHAR(170) UNIQUE NOT NULL,
  organization_type  TEXT NOT NULL CHECK (organization_type IN ('agency','kantor','tim','komunitas')),
  logo_url           VARCHAR(500),
  banner_url         VARCHAR(500),
  description        TEXT,
  website            VARCHAR(255),
  social_media       JSONB,
  address            VARCHAR(500),
  contact_phone      VARCHAR(20),
  created_by         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  deleted_at         TIMESTAMPTZ,  -- soft-delete (prinsip ADR-046 diterapkan ke tabel baru)
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;

CREATE TABLE organization_members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('leader','member')),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at          TIMESTAMPTZ
);
-- Constraint kunci REQ-M12-003: 1 agen maksimal 1 Organization aktif
CREATE UNIQUE INDEX idx_org_members_one_active_per_agent
  ON organization_members(agent_id) WHERE status = 'active';
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

CREATE TABLE organization_invitations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leader_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  initiated_by_type   TEXT NOT NULL CHECK (initiated_by_type IN ('leader_invite','agent_request')),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','accepted','rejected','ignored','expired','cancelled')),
  responded_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_org_invitations_pending_unique
  ON organization_invitations(organization_id, agent_id, initiated_by_type) WHERE status = 'pending';
CREATE INDEX idx_org_invitations_agent ON organization_invitations(agent_id);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_select_public ON organizations FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);
CREATE POLICY organizations_insert_own ON organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
-- Leader (own org) CRUD penuh; Member hanya View (ditegakkan lewat organization_members.role)
CREATE POLICY organizations_update_leader ON organizations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om
                 WHERE om.organization_id = organizations.id AND om.agent_id = auth.uid()
                   AND om.role = 'leader' AND om.status = 'active')
         OR auth_has_scope_all('M12_organization','manage'))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om
                 WHERE om.organization_id = organizations.id AND om.agent_id = auth.uid()
                   AND om.role = 'leader' AND om.status = 'active')
         OR auth_has_scope_all('M12_organization','manage'));

CREATE POLICY org_members_select ON organization_members FOR SELECT TO authenticated
  USING (agent_id = auth.uid()
         OR EXISTS (SELECT 1 FROM organization_members me
                    WHERE me.organization_id = organization_members.organization_id
                      AND me.agent_id = auth.uid() AND me.status = 'active')
         OR auth_has_scope_all('M12_organization','view'));
CREATE POLICY org_members_leader_manage ON organization_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om
                 WHERE om.organization_id = organization_members.organization_id
                   AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active')
         OR agent_id = auth.uid()  -- member boleh keluar sendiri
         OR auth_has_scope_all('M12_organization','manage'));

CREATE POLICY org_invitations_select ON organization_invitations FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR leader_id = auth.uid() OR auth_has_scope_all('M12_organization','view'));
CREATE POLICY org_invitations_insert ON organization_invitations FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid() OR leader_id = auth.uid());
CREATE POLICY org_invitations_respond ON organization_invitations FOR UPDATE TO authenticated
  USING (agent_id = auth.uid() OR leader_id = auth.uid());
