-- 0113_fix_self_leave_trigger_blocks_invitation_reactivation.sql
-- Ditemukan saat menguji nyata re-invite+accept (mantan member yang left
-- lalu diundang lagi): PUT /organization-invitations/{id}/accept gagal
-- 500 dengan pesan trigger "self-update hanya boleh transisi status ke
-- 'left'".
--
-- ROOT CAUSE: trigger create_membership_on_invitation_accepted (0111)
-- melakukan INSERT...ON CONFLICT DO UPDATE ke organization_members untuk
-- mereaktivasi baris left->active. UPDATE itu TETAP memicu BEFORE UPDATE
-- trigger enforce_organization_member_self_leave (0110) di tabel yang
-- sama -- SECURITY DEFINER membuat operasinya bypass RLS, TAPI TIDAK
-- membuatnya bypass trigger tabel (dua mekanisme berbeda). auth.uid() di
-- dalam trigger itu tetap terbaca sebagai agent yang meng-accept (bukan
-- leader/staf) -- trigger self-leave lalu menolak karena transisi
-- left->active BUKAN active->left yang ia izinkan, padahal ini reaktivasi
-- SAH lewat jalur accept-invitation, bukan self-leave sama sekali.
--
-- FIX: pola SAMA seperti rumahagen.refresh_in_progress (0018) -- flag sesi
-- transaksi lokal yang di-set oleh create_membership_on_invitation_
-- accepted() SEBELUM menulis, dibaca enforce_organization_member_self_
-- leave() sebagai jalur bypass paling awal.

CREATE OR REPLACE FUNCTION public.create_membership_on_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    PERFORM set_config('rumahagen.org_membership_sync_in_progress', 'true', true);
    INSERT INTO public.organization_members (organization_id, agent_id, role, status, joined_at, left_at)
    VALUES (NEW.organization_id, NEW.agent_id, 'member', 'active', now(), NULL)
    ON CONFLICT (organization_id, agent_id) DO UPDATE
      SET status = 'active', joined_at = now(), left_at = NULL
      WHERE public.organization_members.status <> 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.enforce_organization_member_self_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('rumahagen.org_membership_sync_in_progress', true) IS DISTINCT FROM 'true' THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
