-- 0006_authorization_functions.sql
-- Menutup residual R-02 "Authority inversion": fungsi di sini adalah SATU-SATUNYA
-- tempat keputusan otorisasi dihitung. Modul lain (M03 Listing, M09 Admin, M13
-- Provider/BYOK, M14 Commercial, dst.) WAJIB memanggil fungsi ini di RLS policy
-- mereka, TIDAK BOLEH menulis ulang logika role/permission/scope sendiri.
-- Ini yang dimaksud di jawaban sebelumnya: "M03/M09/M13/dst tidak menulis logika
-- otorisasi sendiri-sendiri".

-- ── 1. Role code milik user yang sedang login ──
CREATE OR REPLACE FUNCTION public.current_role_code()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.code
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = auth.uid();
$$;

-- ── 2. Bypass eksplisit untuk Superadmin ──
-- Dipakai sebagai jaring pengaman untuk tabel di luar 50 baris
-- STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv (mis. tabel referensi REF_CITIES,
-- REF_PROVINCES) yang tidak akan pernah punya baris permission eksplisit, tapi
-- role_catalogue tetap menyebut Superadmin sebagai "Highest governed platform
-- authority". Bukan pengganti has_permission() untuk modul yang SUDAH ada di matrix.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_role_code() = 'superadmin';
$$;

-- ── 3. Scope efektif untuk satu permission action_code ──
-- Mengembalikan 'all' | 'own' | 'none'. Menghormati override Permission Preset
-- untuk role Agent (STEP12-D: preset menyempitkan scope baseline role, bukan
-- menggantikan role). Kalau user tidak punya preset aktif, pakai role_permissions
-- baseline biasa.
CREATE OR REPLACE FUNCTION public.auth_scope(p_action_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
  v_preset_id UUID;
  v_scope TEXT;
BEGIN
  SELECT role_id INTO v_role_id FROM public.users WHERE id = auth.uid();
  IF v_role_id IS NULL THEN
    RETURN 'none';
  END IF;

  -- Cek override Permission Preset (hanya relevan untuk role Agent, ditegakkan
  -- oleh trigger di 0004; query ini tetap aman untuk role lain karena hasilnya NULL).
  SELECT preset_id INTO v_preset_id
  FROM public.user_permission_presets WHERE user_id = auth.uid();

  IF v_preset_id IS NOT NULL THEN
    SELECT ppi.granted_scope INTO v_scope
    FROM public.permission_preset_items ppi
    JOIN public.permissions p ON p.id = ppi.permission_id
    WHERE ppi.preset_id = v_preset_id AND p.action_code = p_action_code;

    IF v_scope IS NOT NULL THEN
      RETURN v_scope;
    END IF;
    -- Kalau preset ada tapi tidak menyebut permission ini, JANGAN fallback ke
    -- baseline role — preset yang aktif berarti akses agent dibatasi hanya ke
    -- item yang eksplisit ada di preset (STEP12-B: preset = konfigurasi permission).
    RETURN 'none';
  END IF;

  -- Tidak ada preset aktif → pakai baseline role_permissions biasa.
  SELECT rp.granted_scope INTO v_scope
  FROM public.role_permissions rp
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE rp.role_id = v_role_id AND p.action_code = p_action_code;

  RETURN COALESCE(v_scope, 'none');
END;
$$;

-- ── 4. Pemeriksaan akses siap-pakai untuk RLS policy ──
-- p_owner_id: kolom owner baris yang sedang dicek (NULL kalau resource tidak
-- punya konsep ownership per-baris, mis. system_configs).
CREATE OR REPLACE FUNCTION public.has_permission(p_action_code TEXT, p_owner_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope TEXT;
BEGIN
  IF public.is_superadmin() THEN
    RETURN TRUE;
  END IF;

  v_scope := public.auth_scope(p_action_code);

  IF v_scope = 'all' THEN
    RETURN TRUE;
  ELSIF v_scope = 'own' THEN
    RETURN p_owner_id IS NOT NULL AND p_owner_id = auth.uid();
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- ── 5. Keanggotaan organisasi (tambahan kondisi, bukan pengganti permission) ──
-- Sesuai catatan di 0005: organization context TIDAK membuat scope/role baru.
CREATE OR REPLACE FUNCTION public.is_org_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND agent_id = auth.uid()
      AND status = 'active'
  );
$$;
