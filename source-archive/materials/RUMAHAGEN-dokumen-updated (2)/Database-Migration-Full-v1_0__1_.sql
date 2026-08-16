-- ============================================================================
-- Migration 0001: Extensions & Helper Functions
-- Platform Web RUMAHAGEN — Database Dictionary (Migration-Ready)
-- Dasar: ERD-Skema-Database-RUMAHAGEN-v1.3.md (Baseline)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- trigram index (search, ADR-005)

-- ----------------------------------------------------------------------------
-- Shared trigger: auto-update updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- RLS Helper Functions
-- ASUMSI KONVENSI (dicatat eksplisit, bukan diasumsikan diam-diam):
-- users.id di tabel aplikasi = auth.uid() dari Supabase Auth (1:1),
-- konsisten PROJECT-CONSTITUTION.md §12 ("role/permission dikelola di tabel
-- aplikasi, bukan auth.users metadata sebagai satu-satunya sumber kebenaran").
-- ----------------------------------------------------------------------------

-- Role code milik user yang sedang login
CREATE OR REPLACE FUNCTION auth_role_code()
RETURNS TEXT AS $$
  SELECT r.code
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Superadmin selalu bypass (hardcoded, PRD Modul 10 / ERD v1.3 Bagian 4 poin 8)
CREATE OR REPLACE FUNCTION auth_is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT auth_role_code() = 'superadmin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Cek granted_scope='all' untuk role user saat ini pada module_code+action_code tertentu
CREATE OR REPLACE FUNCTION auth_has_scope_all(p_module_code TEXT, p_action_code TEXT)
RETURNS BOOLEAN AS $$
  SELECT auth_is_superadmin() OR EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN roles r ON r.id = rp.role_id
    WHERE r.code = auth_role_code()
      AND p.module_code = p_module_code
      AND p.action_code = p_action_code
      AND rp.granted_scope = 'all'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
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
-- ============================================================================
-- Migration 0003: Modul 1 — Auth & Registrasi (users, agent_verification_documents)
-- ENT: ENT-M01-User, ENT-M01-AgentVerificationDocument
-- ============================================================================

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- = auth.uid() (Supabase Auth)
  email               VARCHAR(255) UNIQUE NOT NULL,
  phone               VARCHAR(20) UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,  -- dikelola Supabase Auth; kolom disiapkan utk kompatibilitas skema
  role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'pending_review'
                        CHECK (status IN ('pending_review','active','suspended','rejected')),
  email_verified_at   TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,  -- soft-delete (ADR-046, 8 tabel)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- Late FK: role_permissions.updated_by (ditunda dari 0002 karena users belum ada)
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_updated_by
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Safety guard Superadmin terakhir (ERD v1.3 Bagian 4 poin 9) — trigger, bukan constraint statis
CREATE OR REPLACE FUNCTION prevent_last_superadmin_removal()
RETURNS TRIGGER AS $$
DECLARE
  v_superadmin_role_id UUID;
  v_remaining_count INT;
BEGIN
  SELECT id INTO v_superadmin_role_id FROM roles WHERE code = 'superadmin';
  IF (TG_OP = 'UPDATE' AND OLD.role_id = v_superadmin_role_id AND
      (NEW.role_id != v_superadmin_role_id OR NEW.status != 'active' OR NEW.deleted_at IS NOT NULL))
     OR (TG_OP = 'DELETE' AND OLD.role_id = v_superadmin_role_id) THEN
    SELECT COUNT(*) INTO v_remaining_count FROM users
      WHERE role_id = v_superadmin_role_id AND status = 'active' AND deleted_at IS NULL
        AND id != OLD.id;
    IF v_remaining_count = 0 THEN
      RAISE EXCEPTION 'Tidak dapat menghapus/menonaktifkan Superadmin terakhir yang aktif';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_prevent_last_superadmin BEFORE UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_last_superadmin_removal();

CREATE TABLE agent_verification_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type          TEXT NOT NULL CHECK (doc_type IN ('ktp','npwp','sertifikasi_rei','lainnya')),
  file_url          VARCHAR(500) NOT NULL,  -- enkripsi at-rest wajib, ERD v1.3 Bagian 4 poin 1
  encrypted         BOOLEAN NOT NULL DEFAULT true,
  review_status     TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  reviewed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_avd_user_id ON agent_verification_documents(user_id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_verification_documents ENABLE ROW LEVEL SECURITY;

-- users: PERM-M01-View-User (own) / (all utk Superadmin/Manager/Admin)
CREATE POLICY users_select_own ON users FOR SELECT TO authenticated
  USING (id = auth.uid() OR auth_has_scope_all('M01_registration','view'));
CREATE POLICY users_update_own ON users FOR UPDATE TO authenticated
  USING (id = auth.uid() OR auth_has_scope_all('M01_registration','approve'))
  WITH CHECK (id = auth.uid() OR auth_has_scope_all('M01_registration','approve'));
CREATE POLICY users_insert_self ON users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- agent_verification_documents: PERM-M01-Create/View (own), Approve (all — Superadmin/Manager/Admin)
CREATE POLICY avd_select ON agent_verification_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth_has_scope_all('M01_registration','approve'));
CREATE POLICY avd_insert_own ON agent_verification_documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY avd_update_review ON agent_verification_documents FOR UPDATE TO authenticated
  USING (auth_has_scope_all('M01_registration','approve'))
  WITH CHECK (auth_has_scope_all('M01_registration','approve'));
-- ============================================================================
-- Migration 0004: Referensi Wilayah Indonesia (shared kernel, ERD v1.3 §2.33-36)
-- ENT: ENT-M03-RefProvince/RefCity/RefDistrict/RefVillage
-- Dibangun sebelum M03/M06 karena keduanya bergantung pada data ini.
-- ============================================================================

CREATE TABLE ref_provinces (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code  VARCHAR(10) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE ref_cities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id  UUID NOT NULL REFERENCES ref_provinces(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('kota','kabupaten'))
);
CREATE INDEX idx_ref_cities_province ON ref_cities(province_id);

CREATE TABLE ref_districts (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id  UUID NOT NULL REFERENCES ref_cities(id) ON DELETE RESTRICT,
  code     VARCHAR(10) UNIQUE NOT NULL,
  name     VARCHAR(100) NOT NULL
);
CREATE INDEX idx_ref_districts_city ON ref_districts(city_id);

CREATE TABLE ref_villages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id  UUID NOT NULL REFERENCES ref_districts(id) ON DELETE RESTRICT,
  code         VARCHAR(10) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  postal_code  VARCHAR(6)
);
CREATE INDEX idx_ref_villages_district ON ref_villages(district_id);

-- RLS: data referensi publik, read-only bagi semua, manage hanya Superadmin
ALTER TABLE ref_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ref_villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ref_provinces_select ON ref_provinces FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_provinces_manage ON ref_provinces FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_cities_select ON ref_cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_cities_manage ON ref_cities FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_districts_select ON ref_districts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_districts_manage ON ref_districts FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY ref_villages_select ON ref_villages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY ref_villages_manage ON ref_villages FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());
-- ============================================================================
-- Migration 0005: Modul 2 — Profil Agen (agent_profiles, agent_reviews)
-- ENT: ENT-M02-AgentProfile, ENT-M02-AgentReview
-- Bergantung: 0003 (users)
-- ============================================================================

CREATE TABLE agent_profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name              VARCHAR(150) NOT NULL,
  avatar_url             VARCHAR(500),
  bio                    TEXT,
  specialization         TEXT[],  -- residensial, komersial, tanah, sewa
  coverage_area          VARCHAR(255),
  office_name            VARCHAR(150),
  license_number         VARCHAR(50),
  whatsapp_number        VARCHAR(20) NOT NULL,
  contact_visibility     TEXT NOT NULL DEFAULT 'public' CHECK (contact_visibility IN ('public','hidden')),
  public_slug            VARCHAR(150) UNIQUE NOT NULL,
  total_listings_sold    INT NOT NULL DEFAULT 0,   -- denormalized counter, ERD v1.3 Bagian 4 poin 2
  total_listings_rented  INT NOT NULL DEFAULT 0,
  deleted_at             TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_agent_profiles_slug ON agent_profiles(public_slug) WHERE deleted_at IS NULL;

-- listing_leads direferensikan agent_reviews.listing_lead_id — FK ditambahkan via ALTER di migration 0008 (M03)
CREATE TABLE agent_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_lead_id  UUID,  -- FK ditambahkan setelah listing_leads ada (0008)
  reviewer_name    VARCHAR(150),
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  moderated_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at     TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index mendukung query publik (WHERE status='approved') & moderasi — ERD v1.3 Bagian 4 poin 14
CREATE INDEX idx_agent_reviews_agent_status ON agent_reviews(agent_id, status) WHERE deleted_at IS NULL;
-- Resolusi OD-23 (Issue Register T3-02, 2026-08-06): 1 reviewer (buyer_id) hanya boleh punya
-- 1 review aktif per agen (agent_id) — submit kedua ke agen yang sama WAJIB replace (upsert),
-- bukan baris baru. Constraint ini juga menegakkan batas yang sama untuk self-review Agen
-- (kasus buyer_id = agent_id = auth.uid() sendiri), karena keduanya sama-sama pasangan
-- (buyer_id, agent_id). Bukti interaksi/lead (listing_lead_id) TIDAK wajib — tetap NULLABLE,
-- tidak divalidasi di RLS (OD-23 Opsi B: tidak wajib).
CREATE UNIQUE INDEX idx_agent_reviews_one_per_reviewer_per_agent
  ON agent_reviews(buyer_id, agent_id) WHERE deleted_at IS NULL AND buyer_id IS NOT NULL;

-- RLS
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;

-- agent_profiles: publik boleh lihat (halaman profil publik), edit hanya pemilik/all-scope
CREATE POLICY agent_profiles_select_public ON agent_profiles FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);
CREATE POLICY agent_profiles_update_own ON agent_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR auth_has_scope_all('M02_profile','update'))
  WITH CHECK (user_id = auth.uid() OR auth_has_scope_all('M02_profile','update'));
CREATE POLICY agent_profiles_insert_own ON agent_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- agent_reviews: publik hanya lihat status approved; buyer create (moderasi wajib, status awal
-- 'pending'); Agen create self-review (auto-approved, status awal 'approved' langsung, TIDAK
-- lewat moderasi — resolusi OD-23); moderasi (approve/reject review Buyer) tetap all-scope.
CREATE POLICY agent_reviews_select_public ON agent_reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND deleted_at IS NULL);
CREATE POLICY agent_reviews_select_own_moderation ON agent_reviews FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR auth_has_scope_all('M02_profile','approve'));

-- Diperbaiki [2026-08-06] — OD-23 (Issue Register T3-02): kondisional per tipe reviewer.
-- Buyer review agen lain: status insert WAJIB 'pending' (tetap lewat moderasi, tidak berubah
-- dari desain awal). Agen self-review (buyer_id = agent_id = auth.uid() sendiri, role 'agent'):
-- status insert WAJIB 'approved' langsung (auto-approved, TANPA moderasi — resolusi OD-23).
-- WITH CHECK mencegah kedua arah penyalahgunaan: Buyer tidak bisa smuggle status='approved'
-- saat insert (bypass moderasi), Agen non-self tidak bisa insert atas nama agen lain.
CREATE POLICY agent_reviews_insert_buyer ON agent_reviews FOR INSERT TO authenticated
  WITH CHECK (
    (buyer_id = auth.uid() AND auth_role_code() = 'buyer' AND agent_id != auth.uid() AND status = 'pending')
    OR (buyer_id = auth.uid() AND agent_id = auth.uid() AND auth_role_code() = 'agent' AND status = 'approved')
  );

-- Baru [2026-08-06] — OD-23: policy UPDATE untuk reviewer sendiri (bukan staff moderasi),
-- menegakkan perilaku "replace" (upsert via INSERT ... ON CONFLICT (buyer_id, agent_id) DO
-- UPDATE di service layer) — submit kedua ke agen yang sama mengganti review sebelumnya,
-- bukan baris baru. Aturan status sama seperti insert: review Buyer reset ke 'pending' (wajib
-- dimoderasi ulang karena konten berubah), self-review Agen tetap 'approved' otomatis.
CREATE POLICY agent_reviews_update_own ON agent_reviews FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (
    (buyer_id = auth.uid() AND auth_role_code() = 'buyer' AND agent_id != auth.uid() AND status = 'pending')
    OR (buyer_id = auth.uid() AND agent_id = auth.uid() AND auth_role_code() = 'agent' AND status = 'approved')
  );

CREATE POLICY agent_reviews_moderate ON agent_reviews FOR UPDATE TO authenticated
  USING (auth_has_scope_all('M02_profile','approve'))
  WITH CHECK (auth_has_scope_all('M02_profile','approve'));
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
-- ============================================================================
-- Migration 0008: Modul 3 — Manajemen Listing Properti (tabel inti platform)
-- ENT: ENT-M03-Listing dan seluruh child entity
-- Bergantung: 0003 (users), 0004 (ref_*), 0006 (developer_projects), 0007 (organizations)
-- ============================================================================

CREATE TABLE listings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  developer_project_id      UUID REFERENCES developer_projects(id) ON DELETE SET NULL,
  organization_id           UUID REFERENCES organizations(id) ON DELETE SET NULL,  -- v1.3
  listing_context           TEXT NOT NULL DEFAULT 'personal' CHECK (listing_context IN ('personal','organization')),
  category                  TEXT NOT NULL CHECK (category IN ('primary','secondary')),
  transaction_type          TEXT NOT NULL CHECK (transaction_type IN ('sale','rent')),
  title                     VARCHAR(200) NOT NULL,
  slug                      VARCHAR(220) UNIQUE NOT NULL,
  meta_title                VARCHAR(70),
  meta_description          VARCHAR(160),
  description               TEXT,
  property_type             TEXT NOT NULL CHECK (property_type IN ('rumah','apartemen','ruko','tanah','gudang','kavling','lainnya')),
  price                     DECIMAL(18,2) NOT NULL,
  price_unit                TEXT CHECK (price_unit IN ('total','per_bulan','per_tahun')),
  is_negotiable             BOOLEAN NOT NULL DEFAULT false,
  address                   VARCHAR(500) NOT NULL,
  province_id               UUID NOT NULL REFERENCES ref_provinces(id) ON DELETE RESTRICT,
  city_id                   UUID NOT NULL REFERENCES ref_cities(id) ON DELETE RESTRICT,
  district_id               UUID NOT NULL REFERENCES ref_districts(id) ON DELETE RESTRICT,
  area_keyword              VARCHAR(20),
  latitude                  DECIMAL(10,7),
  longitude                 DECIMAL(10,7),
  land_area                 DECIMAL(10,2),
  building_area             DECIMAL(10,2),
  bedrooms                  SMALLINT,
  bathrooms                 SMALLINT,
  floors                    SMALLINT,
  carport_capacity          SMALLINT,
  electrical_power          INT,
  water_source              TEXT CHECK (water_source IN ('pdam','sumur','lainnya')),
  furnishing                TEXT CHECK (furnishing IN ('unfurnished','semi_furnished','fully_furnished')),
  year_built                SMALLINT,
  certificate_type          TEXT CHECK (certificate_type IN ('shm','hgb','girik','ppjb','strata_title','lainnya')),
  certificate_transferred   BOOLEAN,
  imb_status                TEXT CHECK (imb_status IN ('ada','tidak_ada','dalam_proses')),
  dispute_free_declared     BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number           VARCHAR(20) NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','pending_review','published','sold','rented','expired','rejected')),
  rejection_reason          TEXT,
  view_count                INT NOT NULL DEFAULT 0,
  cta_click_count           INT NOT NULL DEFAULT 0,
  published_at              TIMESTAMPTZ,
  expired_at                TIMESTAMPTZ,
  sold_or_rented_at         TIMESTAMPTZ,
  deleted_at                TIMESTAMPTZ,  -- soft-delete (ADR-046, tabel asli)
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index prioritas pencarian (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_listings_search ON listings(status, category, transaction_type, city_id, price)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_agent ON listings(agent_id) WHERE deleted_at IS NULL;
-- Full-text + trigram search (ADR-005 Fase 1: Postgres FTS + pg_trgm)
CREATE INDEX idx_listings_fts ON listings USING GIN (to_tsvector('indonesian', title || ' ' || COALESCE(description,'')));
CREATE INDEX idx_listings_area_keyword_trgm ON listings USING GIN (area_keyword gin_trgm_ops);

CREATE TABLE listing_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(150),
  is_cover    BOOLEAN NOT NULL DEFAULT false,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  file_hash   VARCHAR(64),  -- SHA-256 hex digest, deteksi duplikat exact-match (ADR-047)
  photo_hash  VARCHAR(64)   -- perceptual hash 64-bit (image-hash), deteksi kemiripan (ADR-047)
);
CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id);
-- Index deteksi duplikat foto (ADR-047, OD-25) — mendukung query pembanding saat
-- agen submit listing untuk review, dibatasi ke listing aktif milik agent_id yang sama
CREATE INDEX idx_listing_photos_file_hash ON listing_photos(file_hash);
CREATE INDEX idx_listing_photos_photo_hash ON listing_photos(photo_hash);

CREATE TABLE listing_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('video','virtual_tour'))
);
CREATE INDEX idx_listing_videos_listing ON listing_videos(listing_id);

CREATE TABLE amenities (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE listing_amenities (
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE listing_price_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  old_price   DECIMAL(18,2),
  new_price   DECIMAL(18,2),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lph_listing ON listing_price_history(listing_id);

CREATE TABLE listing_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      TEXT NOT NULL DEFAULT 'whatsapp_cta',
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index agregasi dashboard (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_listing_leads_dashboard ON listing_leads(listing_id, created_at);
CREATE INDEX idx_listing_leads_agent ON listing_leads(agent_id, created_at);

CREATE TABLE listing_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listing_views_listing ON listing_views(listing_id);

-- Late FK: agent_reviews.listing_lead_id (ditunda dari 0005 karena listing_leads baru ada sekarang)
ALTER TABLE agent_reviews ADD CONSTRAINT fk_agent_reviews_listing_lead
  FOREIGN KEY (listing_lead_id) REFERENCES listing_leads(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- listings: publik hanya lihat published; pemilik/org member lihat semua miliknya; all-scope lihat semua
CREATE POLICY listings_select_public ON listings FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY listings_select_own ON listings FOR SELECT TO authenticated
  USING (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listings_insert_own ON listings FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());
-- Hard rule: Agen hanya boleh UPDATE/DELETE listing miliknya sendiri (ERD v1.3 Bagian 4 poin 6)
CREATE POLICY listings_update_own_or_org_leader ON listings FOR UPDATE TO authenticated
  USING (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','update'))
  WITH CHECK (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY listing_photos_select ON listing_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY listing_photos_manage ON listing_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_photos.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY listing_videos_select ON listing_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY listing_videos_manage ON listing_videos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_videos.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY amenities_select ON amenities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY amenities_manage ON amenities FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY listing_amenities_select ON listing_amenities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY listing_amenities_manage ON listing_amenities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_amenities.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY lph_select_own ON listing_price_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_price_history.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','view'));

CREATE POLICY listing_leads_select_own ON listing_leads FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listing_leads_insert_public ON listing_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);  -- CTA klik dari publik, tanpa login

CREATE POLICY listing_views_select_own ON listing_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_views.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listing_views_insert_public ON listing_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);
-- ============================================================================
-- Migration 0009: Modul 4 — Learning Center
-- ENT: ENT-M04-Course/CourseLesson/Quiz/QuizQuestion/QuizOption/Enrollment/QuizAttempt/Certificate
-- ============================================================================

CREATE TABLE courses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   VARCHAR(200) NOT NULL,
  category                TEXT CHECK (category IN ('sales_skill','legal_regulasi','produk_developer','financial_kpr','lainnya')),
  description             TEXT,
  prerequisite_course_id  UUID REFERENCES courses(id) ON DELETE SET NULL,
  passing_grade           SMALLINT NOT NULL DEFAULT 70,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  deleted_at              TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE course_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         VARCHAR(200),
  content_type  TEXT CHECK (content_type IN ('video','pdf','slide')),
  content_url   VARCHAR(500),
  sort_order    SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_course_lessons_course ON course_lessons(course_id);

CREATE TABLE quizzes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(200)
);

CREATE TABLE quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  TEXT NOT NULL CHECK (question_type IN ('single_choice','multi_choice'))
);

CREATE TABLE quiz_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   VARCHAR(500) NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  progress_percent  SMALLINT NOT NULL DEFAULT 0,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (agent_id, course_id)
);

CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score           DECIMAL(5,2),
  passed          BOOLEAN,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url   VARCHAR(500),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, course_id)
);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY courses_select_published ON courses FOR SELECT TO authenticated
  USING (status = 'published' OR created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'));
CREATE POLICY courses_manage_own ON courses FOR ALL TO authenticated
  USING (created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'))
  WITH CHECK (created_by = auth.uid() OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY course_lessons_select ON course_lessons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_lessons.course_id AND c.status = 'published')
         OR auth_has_scope_all('M04_learning','manage'));
CREATE POLICY course_lessons_manage ON course_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_lessons.course_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quizzes_select ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY quizzes_manage ON quizzes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = quizzes.course_id AND c.created_by = auth.uid())
         OR auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quiz_questions_select ON quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY quiz_questions_manage ON quiz_questions FOR ALL TO authenticated
  USING (auth_has_scope_all('M04_learning','manage'));

CREATE POLICY quiz_options_select ON quiz_options FOR SELECT TO authenticated USING (true);
CREATE POLICY quiz_options_manage ON quiz_options FOR ALL TO authenticated
  USING (auth_has_scope_all('M04_learning','manage'));

CREATE POLICY enrollments_own ON enrollments FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M04_learning','view'))
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid())
         OR auth_has_scope_all('M04_learning','view'))
  WITH CHECK (EXISTS (SELECT 1 FROM enrollments e WHERE e.id = quiz_attempts.enrollment_id AND e.agent_id = auth.uid()));

CREATE POLICY certificates_select ON certificates FOR SELECT TO anon, authenticated
  USING (true);  -- badge tampil publik di profil agen
-- ============================================================================
-- Migration 0010: Modul 5 — Kalender Event
-- ENT: ENT-M05-Event/EventRegistration
-- ============================================================================

CREATE TABLE events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(200) NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('training','launching_proyek','open_house','gathering')),
  description         TEXT,
  is_online           BOOLEAN NOT NULL DEFAULT false,
  location            VARCHAR(255),
  meeting_link        VARCHAR(500),
  host                VARCHAR(150),
  quota               INT,
  related_course_id   UUID REFERENCES courses(id) ON DELETE SET NULL,
  related_project_id  UUID REFERENCES developer_projects(id) ON DELETE SET NULL,
  submitted_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'pending_approval'
                        CHECK (status IN ('pending_approval','published','rejected','cancelled')),
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_events_start_at ON events(start_at) WHERE deleted_at IS NULL;

CREATE TABLE event_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlist','attended','cancelled')),
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, agent_id)
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select_published ON events FOR SELECT TO anon, authenticated
  USING ((status = 'published' AND deleted_at IS NULL) OR submitted_by = auth.uid()
         OR auth_has_scope_all('M05_event','manage'));
CREATE POLICY events_manage ON events FOR ALL TO authenticated
  USING (submitted_by = auth.uid() OR auth_has_scope_all('M05_event','manage'))
  WITH CHECK (submitted_by = auth.uid() OR auth_has_scope_all('M05_event','manage'));

CREATE POLICY event_registrations_own ON event_registrations FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M05_event','view'))
  WITH CHECK (agent_id = auth.uid());
-- ============================================================================
-- Migration 0011: Modul 7 — Sistem Scoring DBR
-- ENT: ENT-M07-DbrSimulation/DbrConfig
-- ============================================================================

CREATE TABLE dbr_simulations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id               UUID REFERENCES listings(id) ON DELETE SET NULL,
  prospect_name            VARCHAR(150),
  prospect_phone           VARCHAR(20),
  net_income               DECIMAL(18,2) NOT NULL,          -- data sensitif, enkripsi at-rest
  existing_installments    DECIMAL(18,2) NOT NULL DEFAULT 0, -- data sensitif
  property_price           DECIMAL(18,2) NOT NULL,
  down_payment             DECIMAL(18,2) NOT NULL,
  loan_amount              DECIMAL(18,2) NOT NULL,
  tenor_months              SMALLINT NOT NULL,               -- SELALU bulan, lihat API Spec §6
  interest_rate_annual     DECIMAL(5,2) NOT NULL,
  monthly_installment      DECIMAL(18,2) NOT NULL,
  dbr_percent              DECIMAL(5,2) NOT NULL,
  eligibility_status       TEXT NOT NULL CHECK (eligibility_status IN ('layak','perlu_review','tidak_layak')),
  pdf_export_url           VARCHAR(500),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index riwayat prospek (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_dbr_simulations_agent ON dbr_simulations(agent_id, created_at);

CREATE TABLE dbr_config (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dbr_threshold_percent    DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  default_interest_rate    DECIMAL(5,2) NOT NULL DEFAULT 8.50,
  updated_by               UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO dbr_config (dbr_threshold_percent, default_interest_rate) VALUES (35.00, 8.50);

-- RLS
ALTER TABLE dbr_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbr_config ENABLE ROW LEVEL SECURITY;

-- Data finansial sensitif: HANYA pemilik & role dengan scope 'all' (Superadmin/Manager/Admin)
CREATE POLICY dbr_simulations_own ON dbr_simulations FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M07_dbr','view'))
  WITH CHECK (agent_id = auth.uid());

-- dbr_config: HANYA Superadmin (ERD v1.3, Authorization Spec §2.8 — none utk Manager/Admin)
CREATE POLICY dbr_config_select ON dbr_config FOR SELECT TO authenticated USING (true);
CREATE POLICY dbr_config_manage ON dbr_config FOR UPDATE TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());
-- ============================================================================
-- Migration 0012: Modul 8 — Dashboard & Notifikasi
-- ENT: ENT-M08-Notification (Dashboard tidak punya tabel sendiri — agregator query)
-- ============================================================================

CREATE TABLE notifications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL CHECK (type IN ('approval_status','event_reminder','listing_expiring','certificate_issued','lead_new','lainnya')),
  title                VARCHAR(200),
  message              TEXT,
  related_entity_type  VARCHAR(50),
  related_entity_id    UUID,
  is_read              BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- RLS: strict own-only, tanpa bocor lintas-scope (REQ-M08-005)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own ON notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
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
-- ============================================================================
-- Migration 0014: Modul 11 — SEO & Analytics (url_redirects)
-- ENT: ENT-M11-UrlRedirect (konfigurasi GTM/GA4/GSC memakai system_configs)
-- ============================================================================

CREATE TABLE url_redirects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path        VARCHAR(300) UNIQUE NOT NULL,
  new_path        VARCHAR(300) NOT NULL,
  redirect_type   SMALLINT NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  reason          TEXT CHECK (reason IN ('slug_changed','listing_deleted','listing_merged','lainnya')),
  entity_type     VARCHAR(50),
  entity_id       UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_url_redirects_old_path ON url_redirects(old_path);

-- RLS: publik boleh baca (dipakai middleware redirect), tulis hanya via service role/trigger
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY url_redirects_select ON url_redirects FOR SELECT TO anon, authenticated USING (true);

-- Trigger wajib: tulis redirect saat listings.slug berubah (ERD v1.3 Bagian 4 poin 12)
CREATE OR REPLACE FUNCTION log_listing_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO url_redirects (old_path, new_path, reason, entity_type, entity_id)
    VALUES ('/listing/' || OLD.slug, '/listing/' || NEW.slug, 'slug_changed', 'listing', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_listings_slug_redirect AFTER UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION log_listing_slug_change();

CREATE OR REPLACE FUNCTION log_developer_project_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO url_redirects (old_path, new_path, reason, entity_type, entity_id)
    VALUES ('/developer/' || OLD.slug, '/developer/' || NEW.slug, 'slug_changed', 'developer_project', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_developer_projects_slug_redirect AFTER UPDATE ON developer_projects
  FOR EACH ROW EXECUTE FUNCTION log_developer_project_slug_change();
-- ============================================================================
-- Migration 0015: Modul 13 — AI Assistant Integration (BYOK)
-- ENT: ENT-M13-AiProvider/AgentAiConnection
-- Dasar: ADR-028/ADR-045. Tidak ada tabel riwayat percakapan (REQ-M13-003).
-- ============================================================================

CREATE TABLE ai_providers (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                      VARCHAR(50) UNIQUE NOT NULL,
  display_name              VARCHAR(100) NOT NULL,
  logo_url                  VARCHAR(500),
  billing_type              TEXT NOT NULL DEFAULT 'free_tier_ongoing'
                               CHECK (billing_type IN ('free_tier_ongoing','paid_only','trial_then_paid')),
  setup_instructions_url    VARCHAR(500) NOT NULL,
  usage_terms_note          TEXT,
  requires_expiry_warning   BOOLEAN NOT NULL DEFAULT false,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);
INSERT INTO ai_providers (code, display_name, setup_instructions_url, requires_expiry_warning) VALUES
  ('gemini', 'Google Gemini', 'https://aistudio.google.com/apikey', false),
  ('groq', 'Groq', 'https://console.groq.com/keys', false),
  ('mistral', 'Mistral AI', 'https://console.mistral.ai/api-keys', false),
  ('github_models', 'GitHub Models', 'https://github.com/settings/tokens', true);

CREATE TABLE agent_ai_connections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id           UUID NOT NULL REFERENCES ai_providers(id) ON DELETE RESTRICT,
  encrypted_api_key     VARCHAR(500) NOT NULL,  -- enkripsi at-rest wajib
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disconnected','invalid')),
  last_validated_at     TIMESTAMPTZ,
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_agent_ai_connections_updated_at BEFORE UPDATE ON agent_ai_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_ai_connections_one_active_per_provider
  ON agent_ai_connections(user_id, provider_id) WHERE status = 'active';

-- RLS
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ai_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_providers_select ON ai_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY ai_providers_manage ON ai_providers FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

-- PENTING: own-only TANPA bypass Superadmin (REQ-M13-004, Authorization Spec §2.15 poin 5)
-- Sengaja TIDAK memakai auth_has_scope_all()/auth_is_superadmin() di sini.
CREATE POLICY ai_connections_strict_own ON agent_ai_connections FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
