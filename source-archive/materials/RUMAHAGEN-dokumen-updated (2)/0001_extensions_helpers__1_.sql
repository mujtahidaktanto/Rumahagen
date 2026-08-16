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
