-- ============================================================================
-- Migration 0006: Modul 6 — Direktori Developer (dibangun sebelum M03 karena
-- listings.developer_project_id mereferensikan developer_projects)
-- ENT: ENT-M06-DeveloperPartner/DeveloperProject/DeveloperProjectMedia/AgentProjectClaim
-- Bergantung: 0004 (ref_cities), 0003 (users)
-- ============================================================================

CREATE TABLE developer_partners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  VARCHAR(200) NOT NULL,
  pic_name      VARCHAR(150),
  pic_contact   VARCHAR(50),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  deleted_at    TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE developer_projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id          UUID NOT NULL REFERENCES developer_partners(id) ON DELETE CASCADE,
  name                  VARCHAR(200) NOT NULL,
  slug                  VARCHAR(220) UNIQUE NOT NULL,
  meta_title            VARCHAR(70),
  meta_description      VARCHAR(160),
  location              VARCHAR(255),
  city_id               UUID NOT NULL REFERENCES ref_cities(id) ON DELETE RESTRICT,
  property_type         TEXT CHECK (property_type IN ('rumah','apartemen','ruko','tanah','gudang','kavling','lainnya')),
  price_min             DECIMAL(18,2),
  price_max             DECIMAL(18,2),
  unit_availability     INT,
  commission_scheme     VARCHAR(255),
  is_exclusive_by_region BOOLEAN NOT NULL DEFAULT false,
  status                TEXT NOT NULL DEFAULT 'coming_soon'
                          CHECK (status IN ('active','coming_soon','sold_out','inactive')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_developer_projects_updated_at BEFORE UPDATE ON developer_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_developer_projects_slug ON developer_projects(slug);
-- Index filter proyek per lokasi setara listing (ERD v1.3 Bagian 4 poin 13)
CREATE INDEX idx_developer_projects_filter ON developer_projects(city_id, status, property_type);

CREATE TABLE developer_project_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES developer_projects(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('photo','video','brochure','price_list')),
  url         VARCHAR(500) NOT NULL
);
CREATE INDEX idx_dpm_project ON developer_project_media(project_id);

CREATE TABLE agent_project_claims (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES developer_projects(id) ON DELETE CASCADE,
  claimed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, project_id)
);

-- RLS
ALTER TABLE developer_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_project_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY developer_partners_select ON developer_partners FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);
CREATE POLICY developer_partners_manage ON developer_partners FOR ALL TO authenticated
  USING (user_id = auth.uid() OR auth_has_scope_all('M06_developer','manage'))
  WITH CHECK (user_id = auth.uid() OR auth_has_scope_all('M06_developer','manage'));

CREATE POLICY developer_projects_select ON developer_projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY developer_projects_manage ON developer_projects FOR ALL TO authenticated
  USING (auth_has_scope_all('M06_developer','manage'))
  WITH CHECK (auth_has_scope_all('M06_developer','manage'));

CREATE POLICY dpm_select ON developer_project_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY dpm_manage ON developer_project_media FOR ALL TO authenticated
  USING (auth_has_scope_all('M06_developer','manage'))
  WITH CHECK (auth_has_scope_all('M06_developer','manage'));

CREATE POLICY claims_select_own ON agent_project_claims FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M06_developer','view'));
CREATE POLICY claims_insert_own ON agent_project_claims FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());
