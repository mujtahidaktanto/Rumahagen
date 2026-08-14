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
