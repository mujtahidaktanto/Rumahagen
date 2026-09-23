-- 0111_fix_accepted_invitation_creates_membership.sql
-- Ditemukan saat menyiapkan pengujian nyata untuk batch 0110 (M12
-- Organization CRUD): STEP11-B6 §10 mengunci "Accepted invitation becomes
-- membership" secara eksplisit, TAPI tidak ada satu pun trigger/kode yang
-- benar-benar menulis baris organization_members saat organization_
-- invitations.status berubah jadi 'accepted' (0050 hanya menyediakan tabel
-- + trigger anti-self-approval, TIDAK PERNAH mengonversi undangan yang
-- diterima menjadi keanggotaan sungguhan). Tanpa fix ini, seluruh alur
-- undangan/join-request yang sudah dibangun (POST invitations/join-
-- requests + PUT accept) secara FISIK TIDAK PERNAH menghasilkan member
-- baru -- accept selalu "berhasil" (200 OK) tapi orangnya tidak pernah
-- benar-benar jadi anggota organisasi.
--
-- SECURITY DEFINER wajib: pada alur leader_invite, yang meng-accept adalah
-- AGENT yang diundang (bukan leader) -- agent itu belum tentu (dan
-- biasanya belum) anggota organisasi mana pun, sehingga organization_
-- members_manage (leader-aktif/staf) TIDAK melolos­kan mereka meng-INSERT
-- baris keanggotaan diri sendiri. Pola sama seperti create_organization_
-- leader_membership (0110) dan handle_auth_user_sync (0096).
--
-- ON CONFLICT (organization_id, agent_id) DO UPDATE -- menangani kasus
-- mantan member yang left/removed lalu diundang/melamar lagi (reaktivasi
-- baris lama, bukan INSERT baru yang akan menabrak UNIQUE constraint 0005).

CREATE OR REPLACE FUNCTION public.create_membership_on_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    INSERT INTO public.organization_members (organization_id, agent_id, role, status, joined_at, left_at)
    VALUES (NEW.organization_id, NEW.agent_id, 'member', 'active', now(), NULL)
    ON CONFLICT (organization_id, agent_id) DO UPDATE
      SET status = 'active', joined_at = now(), left_at = NULL
      WHERE public.organization_members.status <> 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_create_membership_on_invitation_accepted
  AFTER UPDATE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.create_membership_on_invitation_accepted();
