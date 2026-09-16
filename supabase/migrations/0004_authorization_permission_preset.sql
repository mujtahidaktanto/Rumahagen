-- 0004_authorization_permission_preset.sql
-- Menutup residual: D13-06 (Permission Preset — "logical names supported;
-- physical migration not executed" di STEP12-B_API_STORAGE_RLS_EVIDENCE_REGISTER.csv).
--
-- Nama tabel & field persis sesuai STEP10-D dictionary (entity PERMISSION_PRESET,
-- PERMISSION_PRESET_ITEM, USER_PERMISSION_PRESET) dan STEP12-B/STEP12-D:
--   - Preset HANYA berlaku untuk role Agent (STEP12-B PP-001: "Target role Agent").
--     Constraint CHECK di bawah menegakkan ini secara fisik, bukan cuma dokumen.
--   - Satu akun maksimal satu preset aktif (STEP12-D: "one current preset
--     assignment per account") → UNIQUE (user_id) di user_permission_presets.
--   - Preset tidak pernah mengubah role akun (STEP12-B B-002: "Preset is never
--     a Role"; STEP12-D: "no role change through preset assignment").
--   - Item preset dibatasi ke baseline permission role target (STEP12-D:
--     "preset items constrained to the target role baseline") — ditegakkan lewat
--     trigger di bawah, bukan cuma RLS, karena ini business-rule bukan access-control.

CREATE TABLE IF NOT EXISTS public.permission_presets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  target_role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  created_by     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  updated_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.permission_presets IS
  'Preset permission untuk role Agent (STEP12-B PP-001). Bukan Role baru — hanya varian konfigurasi permission dari role target.';

CREATE TABLE IF NOT EXISTS public.permission_preset_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id     UUID NOT NULL REFERENCES public.permission_presets(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE RESTRICT,
  granted_scope TEXT NOT NULL CHECK (granted_scope IN ('all','own','none')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (preset_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_permission_presets (
  user_id      UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  preset_id    UUID NOT NULL REFERENCES public.permission_presets(id) ON DELETE RESTRICT,
  assigned_by  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_permission_presets IS
  'PK langsung di user_id (bukan kolom id terpisah) menegakkan "one current preset assignment per account" (STEP12-D) secara struktural, bukan cuma via UNIQUE constraint.';

-- ── Business-rule enforcement (bukan RLS — ini soal validitas data, bukan akses) ──

-- Preset hanya boleh menargetkan role Agent (STEP12-B PP-001).
CREATE OR REPLACE FUNCTION public.enforce_preset_target_role_is_agent()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = NEW.target_role_id AND code = 'agent'
  ) THEN
    RAISE EXCEPTION 'permission_presets.target_role_id harus role Agent (STEP12-B PP-001)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preset_target_role_is_agent
  BEFORE INSERT OR UPDATE OF target_role_id ON public.permission_presets
  FOR EACH ROW EXECUTE FUNCTION public.enforce_preset_target_role_is_agent();

-- Item preset tidak boleh melebihi baseline permission milik role target
-- (STEP12-D: "preset items constrained to the target role baseline").
CREATE OR REPLACE FUNCTION public.enforce_preset_item_within_role_baseline()
RETURNS TRIGGER AS $$
DECLARE
  v_target_role_id UUID;
  v_baseline_exists BOOLEAN;
BEGIN
  SELECT target_role_id INTO v_target_role_id
  FROM public.permission_presets WHERE id = NEW.preset_id;

  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role_id = v_target_role_id
      AND permission_id = NEW.permission_id
      AND granted_scope <> 'none'
  ) INTO v_baseline_exists;

  IF NOT v_baseline_exists THEN
    RAISE EXCEPTION 'permission_preset_items: permission % di luar baseline role target (STEP12-D constrained baseline)', NEW.permission_id;
  END IF;

  -- Preset tidak boleh MEMPERLUAS scope melebihi baseline role (hanya boleh sama atau lebih sempit).
  IF NEW.granted_scope = 'all' AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role_id = v_target_role_id AND permission_id = NEW.permission_id AND granted_scope = 'all'
  ) THEN
    RAISE EXCEPTION 'permission_preset_items: tidak boleh menaikkan scope melebihi baseline role target';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preset_item_within_role_baseline
  BEFORE INSERT OR UPDATE ON public.permission_preset_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_preset_item_within_role_baseline();

-- Assignment preset ke user tidak boleh mengubah role user (STEP12-B B-002 / STEP12-D).
CREATE OR REPLACE FUNCTION public.enforce_preset_assignee_matches_target_role()
RETURNS TRIGGER AS $$
DECLARE
  v_target_role_id UUID;
  v_user_role_id UUID;
BEGIN
  SELECT target_role_id INTO v_target_role_id
  FROM public.permission_presets WHERE id = NEW.preset_id;

  SELECT role_id INTO v_user_role_id FROM public.users WHERE id = NEW.user_id;

  IF v_user_role_id IS DISTINCT FROM v_target_role_id THEN
    RAISE EXCEPTION 'user_permission_presets: role user tidak cocok dengan target_role_id preset — assignment TIDAK mengubah role (STEP12-B B-002)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preset_assignee_matches_target_role
  BEFORE INSERT OR UPDATE ON public.user_permission_presets
  FOR EACH ROW EXECUTE FUNCTION public.enforce_preset_assignee_matches_target_role();
