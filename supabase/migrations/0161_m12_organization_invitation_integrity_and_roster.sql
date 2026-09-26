-- 0161_m12_organization_invitation_integrity_and_roster.sql
-- Fase 3f (Organisasi Agent). Menutup celah undangan organisasi yang ditemukan saat membangun layar M12 dan menambah yang dibutuhkan layar:
--
--   1. CELAH: organization_invitations_update mengizinkan Agent memperbarui SEMUA kolom baris undangan miliknya (agent_id = auth.uid()). Lewat REST langsung, Agent bisa mengganti organization_id
--      ke organisasi mana pun atau mengubah initiated_by_type dari 'agent_request' menjadi 'leader_invite', lalu status = 'accepted': trigger membuat keanggotaan tanpa persetujuan leader (guard
--      "tidak boleh menyetujui sendiri" hanya membandingkan leader_id). Undangan yang sudah rejected/cancelled/kedaluwarsa juga masih bisa diterima, dan status awal saat INSERT bebas.
--      SEKARANG (non-staf): kolom identitas dan kedaluwarsa tidak bisa diubah; hanya dari 'pending'; leader_invite: yang diundang menerima/menolak, leader membatalkan; agent_request: peminta
--      membatalkan (menarik), leader menerima/menolak; menerima butuh undangan belum kedaluwarsa dan organisasi 'active'. INSERT: status harus 'pending', organisasi 'active', bukan anggota aktif,
--      leader_invite oleh leader organisasi itu, agent_request oleh dirinya dengan leader_id = leader aktif organisasi itu.
--   2. Satu undangan/permohonan pending per (organisasi, Agent, jenis) — indeks unik parsial.
--   3. RPC daftar dengan nama (RLS agent_profiles tidak mengizinkan anggota/leader membaca profil satu sama lain): organization_roster, organization_pending_requests (leader),
--      my_organization_invitations (Agent yang diundang), search_invitable_agents (leader; hanya profil publik, tanpa anggota/undangan pending).
--   4. Bucket publik-baca \`organization-media\` (logo dan banner organisasi; JPEG/WebP, 3 MB) — penulisan hanya lewat signed upload URL server (pola avatars/0158).
--
-- Staf (Superadmin, Admin) dan service_role tidak dibatasi aturan Agent. Rollback: DROP TRIGGER trg_enforce_organization_invitation_rules + fungsinya, DROP INDEX uq_org_invitation_pending,
-- DROP FUNCTION empat RPC, hapus bucket organization-media bila kosong.

-- ═══ 1. Aturan undangan ═══
CREATE OR REPLACE FUNCTION public.enforce_organization_invitation_rules()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_status text;
  v_is_leader  boolean;
BEGIN
  -- SECURITY DEFINER agar pemeriksaan keanggotaan/leader tidak terhalang RLS organization_members (peminta belum anggota); pemanggil dikenali dari peran sesi, bukan current_user.
  IF COALESCE(current_setting('role', true), '') NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF COALESCE(public.is_superadmin(), false) OR public.current_role_code() = 'admin' THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending' THEN
      RAISE EXCEPTION 'organization_invitations: undangan/permohonan baru harus berstatus pending' USING ERRCODE = '23514';
    END IF;
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
      RAISE EXCEPTION 'organization_invitations: tanggal kedaluwarsa harus di masa depan' USING ERRCODE = '23514';
    END IF;
    SELECT status INTO v_org_status FROM public.organizations WHERE id = NEW.organization_id AND deleted_at IS NULL;
    IF v_org_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'organization_invitations: organisasi tidak aktif' USING ERRCODE = '23514';
    END IF;
    IF EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = NEW.organization_id AND m.agent_id = NEW.agent_id AND m.status = 'active') THEN
      RAISE EXCEPTION 'organization_invitations: Agent itu sudah menjadi anggota organisasi ini' USING ERRCODE = '23514';
    END IF;
    IF NEW.initiated_by_type = 'leader_invite' THEN
      IF NEW.leader_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'organization_invitations: undangan hanya atas nama leader yang mengirimnya' USING ERRCODE = '42501';
      END IF;
    ELSE
      IF NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = NEW.organization_id AND m.agent_id = NEW.leader_id AND m.role = 'leader' AND m.status = 'active') THEN
        RAISE EXCEPTION 'organization_invitations: leader tujuan bukan leader aktif organisasi ini' USING ERRCODE = '23514';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.agent_id IS DISTINCT FROM OLD.agent_id OR NEW.leader_id IS DISTINCT FROM OLD.leader_id
     OR NEW.initiated_by_type IS DISTINCT FROM OLD.initiated_by_type OR NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'organization_invitations: hanya status yang boleh diubah' USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'organization_invitations: undangan/permohonan ini sudah % dan tidak bisa diubah lagi', OLD.status USING ERRCODE = '23514';
  END IF;
  IF NEW.status NOT IN ('accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'organization_invitations: status tujuan tidak valid' USING ERRCODE = '23514';
  END IF;

  v_is_leader := public.is_org_leader(OLD.organization_id);
  IF OLD.initiated_by_type = 'leader_invite' THEN
    IF auth.uid() = OLD.agent_id AND NEW.status IN ('accepted', 'rejected') THEN
      NULL; -- yang diundang menjawab
    ELSIF v_is_leader AND NEW.status = 'cancelled' THEN
      NULL; -- leader membatalkan
    ELSE
      RAISE EXCEPTION 'organization_invitations: aksi % tidak diizinkan untuk Anda pada undangan ini', NEW.status USING ERRCODE = '42501';
    END IF;
  ELSE
    IF auth.uid() = OLD.agent_id AND NEW.status = 'cancelled' THEN
      NULL; -- peminta menarik permohonannya
    ELSIF v_is_leader AND NEW.status IN ('accepted', 'rejected') THEN
      NULL; -- leader menjawab permohonan
    ELSE
      RAISE EXCEPTION 'organization_invitations: aksi % tidak diizinkan untuk Anda pada permohonan ini', NEW.status USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.status = 'accepted' THEN
    IF OLD.expires_at IS NOT NULL AND OLD.expires_at <= now() THEN
      RAISE EXCEPTION 'organization_invitations: undangan/permohonan ini sudah kedaluwarsa' USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = OLD.organization_id AND o.status = 'active' AND o.deleted_at IS NULL) THEN
      RAISE EXCEPTION 'organization_invitations: organisasi tidak aktif' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_organization_invitation_rules ON public.organization_invitations;
CREATE TRIGGER trg_enforce_organization_invitation_rules
  BEFORE INSERT OR UPDATE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_invitation_rules();

REVOKE ALL ON FUNCTION public.enforce_organization_invitation_rules() FROM PUBLIC, anon, authenticated;

-- ═══ 2. Satu pending per (organisasi, Agent, jenis) ═══
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_invitation_pending
  ON public.organization_invitations (organization_id, agent_id, initiated_by_type)
  WHERE status = 'pending';

-- ═══ 3. RPC daftar dengan nama ═══
-- Anggota aktif organisasi (untuk sesama anggota dan staf).
CREATE OR REPLACE FUNCTION public.organization_roster(p_organization_id uuid)
RETURNS TABLE (member_id uuid, agent_id uuid, role text, joined_at timestamptz, agent_name text, is_self boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'organization_roster: login diperlukan' USING ERRCODE = '42501'; END IF;
  IF NOT (public.is_org_member(p_organization_id) OR COALESCE(public.is_superadmin(), false) OR public.current_role_code() = 'admin') THEN
    RAISE EXCEPTION 'organization_roster: hanya anggota organisasi' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT m.id, m.agent_id, m.role, m.joined_at, COALESCE(ap.full_name, 'Anggota')::text, (m.agent_id = auth.uid())
    FROM public.organization_members m
    LEFT JOIN public.agent_profiles ap ON ap.user_id = m.agent_id
    WHERE m.organization_id = p_organization_id AND m.status = 'active'
    ORDER BY (m.role = 'leader') DESC, m.joined_at;
END;
$$;

-- Permohonan bergabung dan undangan terkirim yang masih pending (untuk leader).
CREATE OR REPLACE FUNCTION public.organization_pending_requests(p_organization_id uuid)
RETURNS TABLE (id uuid, initiated_by_type text, created_at timestamptz, expires_at timestamptz, is_expired boolean, agent_name text, agent_office text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'organization_pending_requests: login diperlukan' USING ERRCODE = '42501'; END IF;
  IF NOT (public.is_org_leader(p_organization_id) OR COALESCE(public.is_superadmin(), false) OR public.current_role_code() = 'admin') THEN
    RAISE EXCEPTION 'organization_pending_requests: hanya leader organisasi' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT i.id, i.initiated_by_type, i.created_at, i.expires_at, (i.expires_at IS NOT NULL AND i.expires_at <= now()), COALESCE(ap.full_name, 'Agent')::text, ap.office_name::text
    FROM public.organization_invitations i
    LEFT JOIN public.agent_profiles ap ON ap.user_id = i.agent_id
    WHERE i.organization_id = p_organization_id AND i.status = 'pending'
    ORDER BY i.created_at DESC;
END;
$$;

-- Undangan dari leader untuk saya (belum dijawab), termasuk yang sudah kedaluwarsa agar bisa ditampilkan sebagai "Kedaluwarsa".
CREATE OR REPLACE FUNCTION public.my_organization_invitations()
RETURNS TABLE (id uuid, organization_id uuid, organization_name text, organization_type text, leader_name text, created_at timestamptz, expires_at timestamptz, is_expired boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'my_organization_invitations: login diperlukan' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
    SELECT i.id, i.organization_id, o.organization_name::text, o.organization_type, COALESCE(ap.full_name, 'Leader')::text, i.created_at, i.expires_at,
           (i.expires_at IS NOT NULL AND i.expires_at <= now())
    FROM public.organization_invitations i
    JOIN public.organizations o ON o.id = i.organization_id AND o.status = 'active' AND o.deleted_at IS NULL
    LEFT JOIN public.agent_profiles ap ON ap.user_id = i.leader_id
    WHERE i.agent_id = auth.uid() AND i.initiated_by_type = 'leader_invite' AND i.status = 'pending'
    ORDER BY i.created_at DESC;
END;
$$;

-- Cari Agent untuk diundang (leader): hanya profil publik, bukan anggota aktif, tanpa undangan pending dari organisasi ini.
CREATE OR REPLACE FUNCTION public.search_invitable_agents(p_organization_id uuid, p_q text)
RETURNS TABLE (agent_id uuid, agent_name text, agent_area text, agent_office text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_q text := btrim(COALESCE(p_q, ''));
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'search_invitable_agents: login diperlukan' USING ERRCODE = '42501'; END IF;
  IF NOT public.is_org_leader(p_organization_id) THEN
    RAISE EXCEPTION 'search_invitable_agents: hanya leader organisasi' USING ERRCODE = '42501';
  END IF;
  IF length(v_q) < 2 THEN RETURN; END IF;
  RETURN QUERY
    SELECT p.user_id, p.full_name::text, COALESCE(NULLIF(concat_ws(', ', p.city_name, p.province_name), ''), p.coverage_area)::text, p.office_name::text
    FROM public.public_agent_profiles p
    WHERE (p.full_name ILIKE '%' || replace(replace(v_q, '%', ''), '_', '') || '%' OR p.license_number ILIKE '%' || replace(replace(v_q, '%', ''), '_', '') || '%')
      AND NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = p_organization_id AND m.agent_id = p.user_id AND m.status = 'active')
      AND NOT EXISTS (SELECT 1 FROM public.organization_invitations i WHERE i.organization_id = p_organization_id AND i.agent_id = p.user_id AND i.status = 'pending')
    ORDER BY p.full_name
    LIMIT 8;
END;
$$;

REVOKE ALL ON FUNCTION public.organization_roster(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.organization_pending_requests(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_organization_invitations() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_invitable_agents(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.organization_roster(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.organization_pending_requests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_organization_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_invitable_agents(uuid, text) TO authenticated;

-- ═══ 4. Bucket logo dan banner organisasi ═══
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('organization-media', 'organization-media', true, 3145728, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
