-- 0171_m12_sync_agent_org_and_roster_public_slug.sql
-- Dua celah dilaporkan pemilik produk bersamaan (testing live 2026-10-01), akar masalah sama: hubungan antara keanggotaan organisasi (organization_members,
-- M12) dan profil publik Agent (agent_profiles) putus di dua tempat.
--
-- ═══ Celah 1: "Anggota Tim" kosong di halaman publik Organisasi walau ada anggota aktif berprofil publik ═══
-- Halaman publik Organisasi (components/public/OrganizationDetailView.tsx) membaca anggota lewat view public_agent_profiles.organization_id (0156), yang
-- di-JOIN dari agent_profiles.organization_id (0092, "M12 tetap otoritas Organization/Membership truth, M02 hanya menampilkan konteksnya"). MASALAHNYA:
-- tidak ada satu pun jalur kode yang PERNAH menulis balik ke agent_profiles.organization_id saat keanggotaan berubah (bergabung, undangan diterima, keluar,
-- dikeluarkan) -- dicek langsung ke kode, nihil. Dicek ke DB live: dari 4 keanggotaan aktif, hanya 2 agent_profiles yang punya organization_id terisi --
-- SALAH SATUNYA SALAH (menunjuk organisasi LAMA yang bukan organisasi yang sedang dipimpin sekarang). Akibatnya anggota tim nyaris tidak pernah muncul di
-- halaman publik organisasinya sendiri, walau profilnya sudah publik.
-- FIX: trigger pada organization_members (INSERT/UPDATE/DELETE) yang menghitung ulang agent_profiles.organization_id = organisasi dari keanggotaan AKTIF
-- TERBARU (joined_at terbesar) milik agent itu, NULL bila tidak ada lagi keanggotaan aktif. SECURITY DEFINER -- organization_members TIDAK terbaca anon
-- langsung (RLS), itu sebabnya desain 0092/0156 sengaja memakai kolom cerminan di agent_profiles, bukan membaca organization_members langsung di halaman
-- publik. Backfill sekali jalan memperbaiki data yang sudah basi/kosong di DB live saat ini.
--
-- ═══ Celah 2: Leader/anggota tidak bisa membuka profil publik sesama anggota dari "Kelola Anggota"/ringkasan Organisasi ═══
-- organization_roster (0161) hanya mengembalikan agent_name (teks) -- TIDAK ADA public_slug/indikator profil publik sama sekali, jadi UI (OrganizationView.tsx,
-- OrgMembersPanel.tsx) tidak punya cara menautkan ke /agen/{slug} walau anggota itu sudah mengaktifkan profil publik. Bukan bug UI yang lupa memasang <Link>
-- -- datanya sendiri tidak pernah dikirim RPC-nya.
-- FIX: organization_roster kini juga mengembalikan public_slug (nullable -- NULL bila profil bukan public atau belum punya slug), diambil dari
-- agent_profiles.public_slug + profile_visibility, sama seperti kolom yang sudah dipakai public_agent_profiles (0148/0157). Tidak membuka field privat lain
-- -- public_slug sudah dirancang untuk dibaca publik (dasar URL /agen/{slug}).
--
-- Rollback: DROP TRIGGER trg_sync_agent_profile_organization ON organization_members; DROP FUNCTION sync_agent_profile_organization();
-- kembalikan organization_roster ke definisi 0161 (tanpa public_slug). Backfill TIDAK di-rollback -- memperbaiki data yang memang salah, bukan mengubah niat produk.

-- ═══ 1. Sinkron agent_profiles.organization_id dari keanggotaan aktif ═══
CREATE OR REPLACE FUNCTION public.sync_agent_profile_organization()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent uuid;
BEGIN
  FOR v_agent IN SELECT DISTINCT x FROM unnest(ARRAY[NEW.agent_id, OLD.agent_id]) AS x WHERE x IS NOT NULL LOOP
    UPDATE public.agent_profiles
    SET organization_id = (
      SELECT m.organization_id FROM public.organization_members m
      WHERE m.agent_id = v_agent AND m.status = 'active'
      ORDER BY m.joined_at DESC LIMIT 1
    )
    WHERE user_id = v_agent;
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_agent_profile_organization ON public.organization_members;
CREATE TRIGGER trg_sync_agent_profile_organization
  AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_agent_profile_organization();

-- RETURNS trigger tidak bisa dipanggil langsung lewat SQL, tapi Postgres tetap memberi EXECUTE ke PUBLIC secara default kecuali dicabut -- linter keamanan
-- Supabase menandainya (statis, tanpa verifikasi runtime). Dicabut demi konsisten dengan fungsi trigger lain di proyek ini.
REVOKE ALL ON FUNCTION public.sync_agent_profile_organization() FROM PUBLIC, anon, authenticated;

-- Backfill: perbaiki data basi/kosong yang sudah ada di DB live.
UPDATE public.agent_profiles ap
SET organization_id = sub.organization_id
FROM (
  SELECT DISTINCT ON (agent_id) agent_id, organization_id
  FROM public.organization_members
  WHERE status = 'active'
  ORDER BY agent_id, joined_at DESC
) sub
WHERE ap.user_id = sub.agent_id AND ap.organization_id IS DISTINCT FROM sub.organization_id;

UPDATE public.agent_profiles ap
SET organization_id = NULL
WHERE ap.organization_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.agent_id = ap.user_id AND m.status = 'active');

-- ═══ 2. organization_roster: tambah public_slug ═══
-- Kolom hasil (RETURNS TABLE) berubah -- Postgres tidak mengizinkan CREATE OR REPLACE mengganti tipe baris, DROP dulu.
DROP FUNCTION IF EXISTS public.organization_roster(uuid);

CREATE FUNCTION public.organization_roster(p_organization_id uuid)
RETURNS TABLE (member_id uuid, agent_id uuid, role text, joined_at timestamptz, agent_name text, is_self boolean, public_slug text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'organization_roster: login diperlukan' USING ERRCODE = '42501'; END IF;
  IF NOT (public.is_org_member(p_organization_id) OR COALESCE(public.is_superadmin(), false) OR public.current_role_code() = 'admin') THEN
    RAISE EXCEPTION 'organization_roster: hanya anggota organisasi' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT m.id, m.agent_id, m.role, m.joined_at, COALESCE(ap.full_name, 'Anggota')::text, (m.agent_id = auth.uid()),
           (CASE WHEN ap.profile_visibility = 'public' THEN ap.public_slug ELSE NULL END)
    FROM public.organization_members m
    LEFT JOIN public.agent_profiles ap ON ap.user_id = m.agent_id
    WHERE m.organization_id = p_organization_id AND m.status = 'active'
    ORDER BY (m.role = 'leader') DESC, m.joined_at;
END;
$$;

-- DROP FUNCTION menghapus grant lama -- diberikan ulang (sama seperti 0161).
REVOKE ALL ON FUNCTION public.organization_roster(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.organization_roster(uuid) TO authenticated;
