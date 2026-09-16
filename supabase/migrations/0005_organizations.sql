-- 0005_organizations.sql
-- Dibutuhkan sebagai target "Organization Context" di STEP12-C (Capability/Scope/
-- Condition/Ownership/Organization) — beberapa baris di master matrix (M03, M04, M05,
-- M06, M07, M12 dll.) punya kolom Organization Context terisi, artinya RLS beberapa
-- modul nanti perlu tahu "apakah actor ini anggota organisasi X". Tabel ini fondasinya.
--
-- Kolom persis sesuai STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- entity ORGANIZATIONS & ORGANIZATION_MEMBERS (status PRESERVE_EXACT_PHYSICAL_CORROBORATION).
--
-- PENTING (STEP12-C semantik, ditegaskan lagi di STEP10-D & README M12):
-- "Organization context does not create Role/scope enum" — keanggotaan organisasi
-- BUKAN role baru dan TIDAK menambah nilai scope di luar all/own/none. Fungsi
-- is_org_member() di 0006 murni dipakai sebagai TAMBAHAN kondisi RLS (AND), bukan
-- pengganti has_permission().

CREATE TABLE IF NOT EXISTS public.organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(150) NOT NULL,
  slug              VARCHAR(170) UNIQUE NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('agency','kantor','tim','komunitas')),
  logo_url          VARCHAR(500),
  banner_url        VARCHAR(500),
  description       TEXT,
  website           VARCHAR(255),
  social_media      JSONB,
  address           VARCHAR(500),
  contact_phone     VARCHAR(20),
  created_by        UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('leader','member')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at         TIMESTAMPTZ,
  UNIQUE (organization_id, agent_id)
);
