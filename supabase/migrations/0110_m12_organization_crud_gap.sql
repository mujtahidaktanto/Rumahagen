-- 0110_m12_organization_crud_gap.sql
-- Menutup gap terbesar dari audit endpoint agen/user M01-M15: API-156/157/
-- 158/159/160/166/167/168 (M12) -- tabel `organizations`/`organization_
-- members` dan RLS `organizations_manage`/`organization_members_manage`
-- (0007) sudah ada sejak awal, fitur turunannya (invitations/join-requests/
-- quota/entitlements, 0050/dst.) sudah dibangun DI ATASNYA, TAPI tidak ada
-- SATU PUN route yang menyentuh tabel `organizations` itu sendiri --
-- organisasi tidak pernah bisa dibuat/dilihat/di-branding/dicari/ditutup
-- lewat HTTP sama sekali sebelum migration ini.
--
-- Sumber: docs/core/current/04-api/STEP-11-API-SYNCHRONIZATION/
-- STEP11-B6_ORGANIZATION_MEMBERSHIP_INVITATION_API_SYNCHRONIZATION (§7-13,
-- §19) + PRE-00-N_M12_ORGANIZATION_MEMBERSHIP_AUTHORITY_GATE §6-7.
--
-- TIDAK ADA permission baru -- master matrix (STEP12-01_ROLE_PERMISSION_
-- MASTER_MATRIX.csv baris M12 "Manage within authorized context") sudah
-- ALL/ALL/OWN/OWN/OWN/OWN/OWN (Superadmin/Admin/Manager/Agent/Developer
-- Partner/Buyer/Instructor) -- PERSIS sama dengan RLS organizations_manage
-- (created_by=auth.uid() OR staff) yang sudah ada sejak 0007. B6 menulis
-- "Eligible Agent creates..." tapi master matrix (otoritas RBAC final di
-- proyek ini) tidak membatasi ke role agent saja -- diikuti master matrix,
-- bukan prosa B6, konsisten precedent R-02.

-- ── 1. Auto-create leader membership saat organisasi dibuat ──
-- "Eligible Agent creates an Organization and becomes Lead" (B6 §8) --
-- SECURITY DEFINER wajib: pembuat organisasi BELUM PUNYA baris
-- organization_members apa pun saat trigger ini jalan, jadi
-- organization_members_manage (butuh leader AKTIF yang sudah ada) belum
-- bisa dipakai caller sendiri -- pola sama seperti handle_auth_user_sync
-- (0096): trigger yang menulis prasyarat dirinya sendiri.
CREATE OR REPLACE FUNCTION public.create_organization_leader_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, agent_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'leader', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_create_organization_leader_membership
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_organization_leader_membership();

-- ── 2. "CLOSED is irreversible" (B6 §12, PRE-00-N §6) ──
-- Diperluas dari fungsi 0087 (CREATE OR REPLACE, dua aturan lama --
-- suspended staff-only gate + auto-cancel invitation pending -- tetap
-- dipertahankan verbatim).
CREATE OR REPLACE FUNCTION public.enforce_organization_lifecycle_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- (BARU 0110) closed final -- tidak ada transisi apa pun keluar dari
  -- closed, termasuk untuk Superadmin (B6 §12: "CLOSED is irreversible").
  IF OLD.status = 'closed' THEN
    RAISE EXCEPTION 'organizations: closed bersifat final, tidak bisa diubah lagi (Gate PRE-00-N §6 / B6 §12)';
  END IF;

  IF (NEW.status = 'suspended') IS DISTINCT FROM (OLD.status = 'suspended') THEN
    IF NOT (public.is_superadmin() OR public.current_role_code() = 'admin') THEN
      RAISE EXCEPTION 'organizations: transisi ke/dari suspended adalah enforcement staff-only (Gate PRE-00-N §6)';
    END IF;
  END IF;

  IF NEW.status IN ('closing', 'suspended', 'closed') AND OLD.status NOT IN ('closing', 'suspended', 'closed') THEN
    UPDATE public.organization_invitations
    SET status = 'cancelled'
    WHERE organization_id = NEW.id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── 3. Self-leave untuk member biasa (B6 §9: "Member controls own leave") ──
-- organization_members_manage (0007) FOR ALL cuma leader-aktif/staf --
-- member biasa TIDAK PERNAH bisa mengubah baris keanggotaannya sendiri
-- (mis. keluar organisasi) -- celah nyata, bukan disengaja (RLS lama tidak
-- pernah menyebut agent_id=auth.uid() sama sekali).
CREATE POLICY organization_members_self_leave ON public.organization_members
  FOR UPDATE USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- Batasi APA yang boleh diubah lewat grant self-leave di atas: HANYA
-- status active->left milik baris sendiri, tidak ada field lain. Leader/
-- staf (organization_members_manage) TIDAK dibatasi trigger ini -- jalur
-- otorisasi mereka sendiri yang menentukan (mis. staf boleh set 'removed').
CREATE OR REPLACE FUNCTION public.enforce_organization_member_self_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_superadmin() OR public.current_role_code() = 'admin' OR public.is_org_leader(OLD.organization_id) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS DISTINCT FROM OLD.agent_id THEN
    RAISE EXCEPTION 'organization_members: hanya leader/staf yang bisa mengubah baris member lain';
  END IF;
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id
     OR NEW.agent_id IS DISTINCT FROM OLD.agent_id
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.joined_at IS DISTINCT FROM OLD.joined_at
  THEN
    RAISE EXCEPTION 'organization_members: self-update hanya boleh transisi status ke ''left'' (leave), tidak ada field lain yang berubah';
  END IF;
  IF OLD.status <> 'active' OR NEW.status <> 'left' THEN
    RAISE EXCEPTION 'organization_members: self-leave hanya berlaku dari status active ke left';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_enforce_organization_member_self_leave
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_member_self_leave();

-- ── 4. Lead Exit -> Organization CLOSING (B6 §13, PRE-00-N §7, LOCKED) ──
-- "Lead Exit -> Organization CLOSING -> Organization CLOSED", TANPA Lead
-- Transfer/successor/auto-promotion. SECURITY DEFINER untuk konsistensi
-- pola trigger lintas-tabel proyek ini (0096/0105/dst.), meski di semua
-- jalur realistis (self-leave leader, atau staf force-remove) caller
-- sudah otomatis punya hak UPDATE organizations juga.
CREATE OR REPLACE FUNCTION public.trigger_org_closing_on_lead_exit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'leader' AND OLD.status = 'active' AND NEW.status IN ('left', 'removed') THEN
    UPDATE public.organizations
    SET status = 'closing'
    WHERE id = NEW.organization_id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_org_closing_on_lead_exit
  AFTER UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.trigger_org_closing_on_lead_exit();

-- ── 5. Visibilitas publik untuk discovery/search (API-159) ──
-- "Organization discovery" (B6 §8) butuh organisasi bisa DITEMUKAN sebelum
-- seseorang jadi member (mis. untuk join-request) -- RLS lama
-- (organizations_select_member) HANYA mengizinkan member/staf melihat baris
-- apa pun, tidak ada jalur publik sama sekali. Kolom yang benar-benar
-- ditampilkan ke non-member (curated, bukan full row) dibatasi di kode
-- route (GET .../search dan GET .../{id}), bukan di RLS -- RLS di sini
-- hanya menentukan baris MANA yang boleh terlihat (status='active'),
-- BUKAN kolom mana yang aman ditampilkan ("must not expose private
-- Organization information", B6 §8/§10).
CREATE POLICY organizations_select_active_public ON public.organizations
  FOR SELECT USING (status = 'active');

COMMENT ON POLICY organizations_select_active_public ON public.organizations IS
  'ADD-NEW 0110 (API-159 search + API-157 detail non-member) -- RLS hanya menggerbangi baris (status active), kurasi kolom privat (address/contact_phone/social_media) tetap tanggung jawab kode route, bukan RLS.';
