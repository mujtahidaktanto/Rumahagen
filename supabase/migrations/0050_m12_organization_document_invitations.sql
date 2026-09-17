-- 0050_m12_organization_document_invitations.sql
-- Fase 1 (lanjutan 0047-0049): 2 tabel M12.
--
-- ORGANIZATION_INVITATIONS — STEP10-D tandai PRESERVE_EXACT_PHYSICAL_
-- CORROBORATION (bagian dari 86-table baseline), kolom persis sesuai
-- STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv. Satu deviasi
-- terdokumentasi: kolom `status` di sumber cuma "TEXT NOT NULL DEFAULT
-- 'pending'" TANPA CHECK enum eksplisit — di sini dikunci ke
-- ('pending','accepted','rejected','cancelled') supaya konsisten dengan
-- pola tabel lifecycle lain di repo (listings/developer_projects/dst.),
-- bukan TEXT bebas tanpa batas.
--
-- ORGANIZATION_DOCUMENT — salah satu dari 8 entitas ADD-NEW STEP10-D
-- (LOGICAL_ONLY_NO_CURRENT_PHYSICAL_CORROBORATION, "exact vocabulary
-- downstream" untuk document_type/visibility — sengaja tidak dikunci
-- dokumen sumber). Vocabulary di bawah adalah KEPUTUSAN ENGINEERING baru
-- (bukan dari dokumen manapun): document_type meniru pola Indonesia yang
-- sama seperti agent_verification_documents/0049 (npwp/lainnya), visibility
-- dua level sederhana (semua anggota vs leader-only) sesuai deskripsi
-- logical_data_meaning "Organization/member visibility according to M12".
--
-- TIDAK ADA permission baru — keduanya memakai helper baru
-- `is_org_leader()` (pola sama seperti `is_org_member()` di 0006) alih-alih
-- `m12.organization.manage_within_authorized_context` yang granted TAPI
-- TIDAK dipakai langsung oleh RLS organizations/organization_members yang
-- sudah ada (0007 memakai `created_by`/leader-membership check langsung,
-- bukan has_permission()) — demi KONSISTEN dengan pola nyata yang sudah
-- berjalan di modul ini, bukan menambah jalur otorisasi kedua yang berbeda.

CREATE OR REPLACE FUNCTION public.is_org_leader(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND agent_id = auth.uid()
      AND role = 'leader'
      AND status = 'active'
  );
$$;

COMMENT ON FUNCTION public.is_org_leader IS
  'Pola sama seperti is_org_member() (0006) — dipakai RLS organization_invitations/organization_document di sini, dan bisa dipakai ulang tabel M12 berikutnya alih-alih menulis subquery leader-check berulang seperti di organization_members_manage (0007).';

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leader_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  initiated_by_type   TEXT NOT NULL CHECK (initiated_by_type IN ('leader_invite','agent_request')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  responded_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organization_invitations IS
  'Sumber: STEP10-D entity ORGANIZATION_INVITATIONS. `initiated_by_type` membedakan leader mengundang agent (leader_invite) vs agent minta bergabung (agent_request) — `agent_id` selalu pihak yang mau bergabung, `leader_id` selalu leader organisasi terkait, terlepas siapa yang memulai.';

-- Trigger: mencegah self-approval — pihak yang MEMULAI (initiated_by_type)
-- tidak boleh jadi pihak yang MENYETUJUI transisi ke 'accepted' (pola sama
-- seperti trg_partnership_result_validation_superadmin_only/0024: pemohon
-- tidak boleh memvalidasi permohonannya sendiri). 'rejected'/'cancelled'
-- tetap boleh oleh kedua pihak (membatalkan permohonan/undangan sendiri sah).
CREATE OR REPLACE FUNCTION public.enforce_organization_invitation_no_self_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    IF NOT public.is_superadmin() THEN
      IF NEW.initiated_by_type = 'agent_request' AND auth.uid() = NEW.agent_id THEN
        RAISE EXCEPTION 'organization_invitations: agent tidak boleh menyetujui agent_request miliknya sendiri — hanya leader/staf';
      END IF;
      IF NEW.initiated_by_type = 'leader_invite' AND auth.uid() = NEW.leader_id THEN
        RAISE EXCEPTION 'organization_invitations: leader tidak boleh menyetujui leader_invite yang ia buat sendiri — hanya agent yang diundang/staf';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_enforce_organization_invitation_no_self_accept
  BEFORE UPDATE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_invitation_no_self_accept();

CREATE TABLE IF NOT EXISTS public.organization_document (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_reference  VARCHAR(500) NOT NULL,
  document_type       TEXT NOT NULL CHECK (document_type IN ('npwp','siup','akta_pendirian','lainnya')),
  visibility          TEXT NOT NULL DEFAULT 'all_members' CHECK (visibility IN ('all_members','leader_only')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organization_document IS
  'Sumber: STEP10-D entity ORGANIZATION_DOCUMENT (ADD-NEW logical, "exact vocabulary downstream" — document_type/visibility di sini KEPUTUSAN ENGINEERING baru, lihat catatan di atas file). `document_reference` meniru pola file_url/file_id tabel dokumen lain di repo (agent_verification_documents/marketing_kit), TEXT bebas karena mekanisme storage belum ditentukan.';

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_document    ENABLE ROW LEVEL SECURITY;

-- organization_invitations — leader organisasi terkait, pihak agent yang
-- diundang/minta bergabung, atau staf.
CREATE POLICY organization_invitations_select ON public.organization_invitations
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
    OR agent_id = auth.uid()
  );

CREATE POLICY organization_invitations_insert ON public.organization_invitations
  FOR INSERT WITH CHECK (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR (initiated_by_type = 'leader_invite' AND public.is_org_leader(organization_id))
    OR (initiated_by_type = 'agent_request' AND agent_id = auth.uid())
  );

CREATE POLICY organization_invitations_update ON public.organization_invitations
  FOR UPDATE USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
    OR agent_id = auth.uid()
  );

-- organization_document — anggota aktif organisasi terkait (dibatasi
-- visibility), leader/staf bisa kelola penuh.
CREATE POLICY organization_document_select ON public.organization_document
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
    OR (visibility = 'all_members' AND public.is_org_member(organization_id))
  );

CREATE POLICY organization_document_manage ON public.organization_document
  FOR ALL USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
  )
  WITH CHECK (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
  );
