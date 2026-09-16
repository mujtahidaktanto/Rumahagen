-- 0003_authorization_core.sql
-- Menutup residual: D13-06 (Permission Preset butuh fondasi roles/permissions dulu),
-- sebagian R-02 (Authority inversion — modul lain harus refer ke sini, bukan duplikasi).
--
-- Kolom persis sesuai STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv
-- (entity ROLES, PERMISSIONS, ROLE_PERMISSIONS, status PRESERVE_EXACT_PHYSICAL_CORROBORATION).
--
-- Satu deviasi terdokumentasi: kolom `permissions.action_code` di dokumen didesain
-- VARCHAR(50), tapi kode permission kita (format "m03.listing.create", lihat 0009 seed)
-- bisa melebihi 50 karakter untuk resource majemuk — dilebarkan ke VARCHAR(150)
-- supaya tidak truncate. Semantik & nama kolom tidak berubah.

CREATE TABLE IF NOT EXISTS public.roles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(50) UNIQUE NOT NULL,
  name           VARCHAR(100) NOT NULL,
  is_system_role BOOLEAN NOT NULL DEFAULT true,
  is_protected   BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roles IS
  'Katalog Role platform. Sumber: STEP12-01_ROLE_CATALOGUE_FULL.csv — 7 role LOCKED (lihat seed 0009). Baris ORG-ADMIN/Guest TIDAK dibuat di sini karena keduanya eksplisit "NOT A PLATFORM ROLE" di sumber.';

CREATE TABLE IF NOT EXISTS public.permissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code  VARCHAR(50) NOT NULL,
  action_code  VARCHAR(150) NOT NULL,  -- diperlebar dari VARCHAR(50), lihat catatan di atas
  scope_type   TEXT NOT NULL DEFAULT 'own' CHECK (scope_type IN ('all','own','none')),
  description  VARCHAR(255),
  UNIQUE (module_code, action_code)
);

COMMENT ON TABLE public.permissions IS
  'Katalog permission. Menutup residual D13-15 (permission-ID final) — action_code diturunkan deterministik dari STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv (format module.resource.action), bukan dikarang bebas. Lihat seed 0009 untuk asal setiap baris.';

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id               UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  permission_id         UUID NOT NULL REFERENCES public.permissions(id) ON DELETE RESTRICT,
  granted_scope         TEXT NOT NULL CHECK (granted_scope IN ('all','own','none')),
  editable_by_role_code VARCHAR(100) NOT NULL DEFAULT 'superadmin',
  updated_by            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS
  'Grant per role. Sumber: STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv (50 baris frozen, 345 grant ALL/OWN → lihat seed 0009). editable_by_role_code mencerminkan STEP12-B PP-001: hanya Superadmin yang bisa mengubah baris ini secara umum, kecuali baris Agent yang juga boleh diubah Manager lewat Permission Preset (lihat 0004 & RLS di 0007).';

-- Sekarang roles sudah ada — pasang FK yang ditunda dari 0002_users.sql
ALTER TABLE public.users
  ADD CONSTRAINT users_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;
