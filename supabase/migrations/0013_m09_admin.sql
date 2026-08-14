-- ============================================================================
-- Migration 0013: Modul 9 — Admin/Sistem (system_configs, audit_logs)
-- ENT: ENT-M09-SystemConfig/AuditLog
-- ============================================================================

CREATE TABLE system_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key    VARCHAR(100) UNIQUE NOT NULL,
  config_value  VARCHAR(255),
  updated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  action            VARCHAR(100) NOT NULL,
  entity_type       VARCHAR(50),
  entity_id         UUID,
  organization_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,  -- v1.3
  old_value         JSONB,
  new_value         JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
-- Audit log RETENSI PERMANEN — tidak boleh dihapus/di-rotate (PROJECT-CONSTITUTION.md §15)

-- RLS
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_configs_select ON system_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY system_configs_manage ON system_configs FOR UPDATE TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

-- audit_logs: Superadmin+Manager 'all', Admin 'none' (Authorization Spec §2.9)
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT TO authenticated
  USING (auth_is_superadmin() OR auth_role_code() = 'manager'
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = audit_logs.organization_id
                AND om.agent_id = auth.uid() AND om.status = 'active')));
-- INSERT hanya lewat service role (backend), tidak ada policy INSERT untuk role authenticated biasa
