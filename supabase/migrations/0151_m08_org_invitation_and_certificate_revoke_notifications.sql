-- 0151_m08_org_invitation_and_certificate_revoke_notifications.sql
-- Paket kecil notifikasi (temuan audit kotak masuk Agent, 2026-09-25):
--   1. Undangan/permohonan organisasi (organization_invitations) sebelumnya tidak memicu notifikasi apa pun, sehingga Agent yang diundang tidak diberi tahu.
--      Trigger baru trg_notify_org_invitation:
--        INSERT leader_invite  -> Agent yang diundang ("Undangan bergabung organisasi")
--        INSERT agent_request  -> Leader ("Permohonan bergabung baru")
--        pending -> accepted/rejected -> pihak yang memulai (leader untuk undangan, Agent untuk permohonan)
--        pending -> cancelled (undangan leader dibatalkan) -> Agent
--      Semua bertipe 'lainnya' dengan related entity 'organization_invitation' (klien memetakan tautan ke Organisasi). notify_user() melewati notifikasi
--      untuk diri sendiri dan menelan galat, jadi trigger ini tidak pernah menggagalkan penulisan undangan.
--   2. revoke_certificate() (0150) kini memberi tahu pemilik sertifikat ("Sertifikat dicabut", bertipe 'lainnya', entity 'certificate').
-- Tabel organization_invitations kosong saat ditulis (dicek live).

CREATE OR REPLACE FUNCTION public.trg_notify_org_invitation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org    text;
  v_leader uuid;
  v_who    text;
BEGIN
  SELECT organization_name INTO v_org FROM public.organizations WHERE id = NEW.organization_id;
  v_org := COALESCE(v_org, 'organisasi');
  v_leader := COALESCE(NEW.leader_id, (SELECT agent_id FROM public.organization_members WHERE organization_id = NEW.organization_id AND role = 'leader' AND status = 'active' LIMIT 1));

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending' THEN RETURN NEW; END IF;
    IF NEW.initiated_by_type = 'leader_invite' THEN
      PERFORM public.notify_user(NEW.agent_id, 'lainnya', 'Undangan bergabung organisasi',
        'Anda diundang bergabung ke "' || v_org || '". Buka Organisasi untuk menerima atau menolak.', 'organization_invitation', NEW.id);
    ELSE
      PERFORM public.notify_user(v_leader, 'lainnya', 'Permohonan bergabung baru',
        'Ada agen yang mengajukan permohonan bergabung ke "' || v_org || '".', 'organization_invitation', NEW.id);
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('accepted', 'rejected') THEN
      v_who := CASE NEW.status WHEN 'accepted' THEN 'diterima' ELSE 'ditolak' END;
      IF NEW.initiated_by_type = 'leader_invite' THEN
        PERFORM public.notify_user(v_leader, 'lainnya', 'Undangan ' || v_who,
          'Undangan Anda ke "' || v_org || '" ' || v_who || '.', 'organization_invitation', NEW.id);
      ELSE
        PERFORM public.notify_user(NEW.agent_id, 'lainnya', 'Permohonan ' || v_who,
          'Permohonan Anda bergabung ke "' || v_org || '" ' || v_who || '.', 'organization_invitation', NEW.id);
      END IF;
    ELSIF NEW.status = 'cancelled' AND NEW.initiated_by_type = 'leader_invite' THEN
      PERFORM public.notify_user(NEW.agent_id, 'lainnya', 'Undangan dibatalkan',
        'Undangan bergabung ke "' || v_org || '" dibatalkan oleh pengundang.', 'organization_invitation', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_org_invitation_ins ON public.organization_invitations;
CREATE TRIGGER trg_notify_org_invitation_ins AFTER INSERT ON public.organization_invitations FOR EACH ROW EXECUTE FUNCTION public.trg_notify_org_invitation();
DROP TRIGGER IF EXISTS trg_notify_org_invitation_upd ON public.organization_invitations;
CREATE TRIGGER trg_notify_org_invitation_upd AFTER UPDATE OF status ON public.organization_invitations FOR EACH ROW EXECUTE FUNCTION public.trg_notify_org_invitation();

CREATE OR REPLACE FUNCTION public.revoke_certificate(p_certificate_id uuid, p_note text DEFAULT NULL)
RETURNS public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.certificates;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('m04.certificate.manage') THEN
    RAISE EXCEPTION 'revoke_certificate: hanya staf yang boleh mencabut sertifikat' USING ERRCODE = '42501';
  END IF;
  UPDATE public.certificates
     SET status = 'revoked', revoked_at = now(), revoked_by = auth.uid(), revoke_note = NULLIF(btrim(COALESCE(p_note, '')), '')
   WHERE id = p_certificate_id AND status = 'issued'
  RETURNING * INTO v_cert;
  IF v_cert.id IS NULL THEN
    RAISE EXCEPTION 'certificates: sertifikat tidak ditemukan atau sudah dicabut' USING ERRCODE = '23514';
  END IF;
  PERFORM public.log_audit_event('m04.certificate.revoke', 'certificates', v_cert.id, NULL, NULL,
    jsonb_build_object('certificate_number', v_cert.certificate_number, 'note', v_cert.revoke_note));
  PERFORM public.notify_user(v_cert.agent_id, 'lainnya', 'Sertifikat dicabut',
    'Sertifikat ' || v_cert.certificate_number || ' untuk kursus "' || COALESCE(v_cert.snapshot ->> 'course_title', 'kursus') || '" dicabut. Hubungi admin bila ada kekeliruan.',
    'certificate', v_cert.id);
  RETURN v_cert;
END; $$;
REVOKE ALL ON FUNCTION public.revoke_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) TO authenticated;
