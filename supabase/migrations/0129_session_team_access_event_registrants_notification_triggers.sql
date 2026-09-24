-- 0129_session_team_access_event_registrants_notification_triggers.sql
-- Menutup 4 celah backend yang ditemukan saat memindai persona Instructor (Fase G, SOURCE-Instructor.md §7):
--   1. Pemilik sesi tidak bisa melihat daftar peserta sesinya (session_enrollments_select hanya baris milik sendiri),
--      padahal izin penilaian kehadiran/penyelesaian diberikan atas sesi miliknya -> Instructor mengevaluasi "buta".
--   2. Instructor/Host yang DITUGASKAN (learning_session_assignments ACTIVE) bukan pemilik: tidak bisa melihat maupun
--      mengubah sesi itu; penugasan belum berdampak pada akses.
--   3. Penyelenggara event (Agent/Instructor/Developer Partner) tidak bisa melihat pendaftar eventnya, dan mode
--      registrasi manual_approval tidak bisa dijalankan oleh penyelenggara non-staf.
--   4. Tidak ada satu pun peristiwa bisnis yang membuat notifikasi (hanya push manual Admin lewat create_notification()).
--
-- Keputusan desain:
--   * "Tim sesi" = pemilik sesi ATAU pemegang penugasan ACTIVE. Diperiksa lewat fungsi SECURITY DEFINER (tanpa rekursi RLS)
--     dan tetap membutuhkan izin scope bukan 'none' pada permission terkait (aturan dua lapis PRE-00-F §42-43).
--   * Melihat peserta/bukti/hasil: semua tim sesi. Mengubah status sesi: tim sesi (Host dan Instructor), tetapi non-pemilik
--     non-staf hanya boleh mengubah kolom status. Menilai kehadiran/penyelesaian dan mengelola artefak: pemilik dan
--     Instructor penugasan (Host hanya membaca). Tim tidak boleh menilai enrollment miliknya sendiri.
--   * Penyelenggara event boleh melihat pendaftar dan memutuskan status pendaftaran (pending_approval -> registered|cancelled,
--     waitlist -> registered|cancelled, registered -> attended|cancelled); kolom lain tidak boleh diubah.
--   * Notifikasi dibuat oleh trigger lewat notify_user() internal (tidak bisa dipanggil pengguna), tidak pernah menggagalkan
--     transaksi utama, dan tidak mengirim notifikasi ke pelaku aksi itu sendiri.
--   * event_reminder dan listing_expiring butuh penjadwal; fungsi disediakan (send_event_reminders, notify_expiring_listings)
--     tetapi TIDAK dijadwalkan di sini (pg_cron belum terpasang). Tanpa penjadwalan dua tipe itu belum terkirim.

-- ═══ 0. Helper tim sesi & penyelenggara event ═══
CREATE OR REPLACE FUNCTION public.is_session_team(p_session_id uuid, p_instructor_only boolean DEFAULT false)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.learning_sessions ls
    WHERE ls.id = p_session_id AND ls.deleted_at IS NULL
      AND (
        ls.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.learning_session_assignments a
          WHERE a.session_id = ls.id AND a.actor_id = auth.uid() AND a.status = 'ACTIVE'
            AND (NOT p_instructor_only OR a.capability = 'INSTRUCTOR')
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_team_for_enrollment(p_enrollment_id uuid, p_instructor_only boolean DEFAULT false)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_enrollments se
    WHERE se.id = p_enrollment_id
      AND se.agent_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
      AND public.is_session_team(se.session_id, p_instructor_only)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_event_organizer(p_event_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.submitted_by = auth.uid() AND e.deleted_at IS NULL
  );
$$;

-- ═══ 1. Akses tim sesi: sesi ═══
DROP POLICY IF EXISTS learning_sessions_select_assigned ON public.learning_sessions;
CREATE POLICY learning_sessions_select_assigned ON public.learning_sessions
  FOR SELECT USING (
    public.is_session_team(id) AND public.auth_scope('m04.learning_session.view') <> 'none'
  );

DROP POLICY IF EXISTS learning_sessions_update_assigned ON public.learning_sessions;
CREATE POLICY learning_sessions_update_assigned ON public.learning_sessions
  FOR UPDATE USING (
    public.is_session_team(id) AND public.auth_scope('m04.learning_session.update') <> 'none'
  ) WITH CHECK (
    public.is_session_team(id) AND public.auth_scope('m04.learning_session.update') <> 'none'
  );

-- Non-pemilik non-staf (mis. Host/Instructor penugasan) hanya boleh mengubah status sesi.
CREATE OR REPLACE FUNCTION public.enforce_session_assignee_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.owner_id = auth.uid() OR public.has_permission('m04.learning_session.update') THEN
    RETURN NEW;
  END IF;
  IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'updated_at') THEN
    RAISE EXCEPTION 'learning_sessions: tim penugasan hanya boleh mengubah status sesi'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_session_assignee_columns ON public.learning_sessions;
CREATE TRIGGER trg_session_assignee_columns
  BEFORE UPDATE ON public.learning_sessions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_session_assignee_columns();

-- ═══ 1b. Akses tim sesi: peserta, bukti, kehadiran, penyelesaian, artefak ═══
DROP POLICY IF EXISTS session_enrollments_select_team ON public.session_enrollments;
CREATE POLICY session_enrollments_select_team ON public.session_enrollments
  FOR SELECT USING (
    public.is_session_team(session_id) AND public.auth_scope('m04.session_enrollment.view') <> 'none'
  );

DROP POLICY IF EXISTS session_participation_evidence_select_team ON public.session_participation_evidence;
CREATE POLICY session_participation_evidence_select_team ON public.session_participation_evidence
  FOR SELECT USING (
    public.is_session_team_for_enrollment(session_enrollment_id)
    AND public.auth_scope('m04.session_evidence.view') <> 'none'
  );

DROP POLICY IF EXISTS session_attendance_evaluations_select_team ON public.session_attendance_evaluations;
CREATE POLICY session_attendance_evaluations_select_team ON public.session_attendance_evaluations
  FOR SELECT USING (public.is_session_team_for_enrollment(session_enrollment_id));

DROP POLICY IF EXISTS session_completion_outcomes_select_team ON public.session_completion_outcomes;
CREATE POLICY session_completion_outcomes_select_team ON public.session_completion_outcomes
  FOR SELECT USING (public.is_session_team_for_enrollment(session_enrollment_id));

-- Menilai: pemilik + Instructor penugasan (Host hanya membaca); tidak boleh menilai enrollment miliknya sendiri.
DROP POLICY IF EXISTS session_attendance_evaluations_manage_team ON public.session_attendance_evaluations;
CREATE POLICY session_attendance_evaluations_manage_team ON public.session_attendance_evaluations
  FOR ALL USING (
    public.is_session_team_for_enrollment(session_enrollment_id, TRUE)
    AND public.auth_scope('m04.attendance.manage') <> 'none'
  ) WITH CHECK (
    public.is_session_team_for_enrollment(session_enrollment_id, TRUE)
    AND public.auth_scope('m04.attendance.manage') <> 'none'
  );

DROP POLICY IF EXISTS session_completion_outcomes_manage_team ON public.session_completion_outcomes;
CREATE POLICY session_completion_outcomes_manage_team ON public.session_completion_outcomes
  FOR ALL USING (
    public.is_session_team_for_enrollment(session_enrollment_id, TRUE)
    AND public.auth_scope('m04.completion.manage') <> 'none'
  ) WITH CHECK (
    public.is_session_team_for_enrollment(session_enrollment_id, TRUE)
    AND public.auth_scope('m04.completion.manage') <> 'none'
  );

-- is_session_team(.., TRUE) menyertakan pemilik; is_session_team_for_enrollment menolak enrollment milik pelaku sendiri.
-- Policy lama (has_permission ... session_owner_for_enrollment) tetap ada, jadi tutup celah pemilik menilai dirinya sendiri:
CREATE OR REPLACE FUNCTION public.session_enrollment_agent(p_enrollment_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT agent_id FROM public.session_enrollments WHERE id = p_enrollment_id; $$;

-- SECURITY INVOKER (bukan definer) agar current_user tetap 'authenticated' dan pemanggilan internal dapat dibedakan.
CREATE OR REPLACE FUNCTION public.enforce_no_self_session_evaluation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_agent uuid;
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager') THEN
    RETURN NEW;
  END IF;
  v_agent := public.session_enrollment_agent(NEW.session_enrollment_id);
  IF v_agent = auth.uid() THEN
    RAISE EXCEPTION '% : peserta tidak boleh menilai enrollment miliknya sendiri', TG_TABLE_NAME
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_no_self_attendance_eval ON public.session_attendance_evaluations;
CREATE TRIGGER trg_no_self_attendance_eval
  BEFORE INSERT OR UPDATE ON public.session_attendance_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_no_self_session_evaluation();
DROP TRIGGER IF EXISTS trg_no_self_completion_eval ON public.session_completion_outcomes;
CREATE TRIGGER trg_no_self_completion_eval
  BEFORE INSERT OR UPDATE ON public.session_completion_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_no_self_session_evaluation();

-- Artefak: tim melihat; pemilik + Instructor penugasan mengelola.
DROP POLICY IF EXISTS session_artifacts_select_team ON public.session_artifacts;
CREATE POLICY session_artifacts_select_team ON public.session_artifacts
  FOR SELECT USING (
    public.is_session_team(session_id) AND public.auth_scope('m04.artifact.view') <> 'none'
  );
DROP POLICY IF EXISTS session_artifacts_manage_team ON public.session_artifacts;
CREATE POLICY session_artifacts_manage_team ON public.session_artifacts
  FOR ALL USING (
    public.is_session_team(session_id, TRUE) AND public.auth_scope('m04.artifact.manage') <> 'none'
  ) WITH CHECK (
    public.is_session_team(session_id, TRUE) AND public.auth_scope('m04.artifact.manage') <> 'none'
  );

-- ═══ 3. Pendaftar event untuk penyelenggara ═══
DROP POLICY IF EXISTS event_registrations_select_organizer ON public.event_registrations;
CREATE POLICY event_registrations_select_organizer ON public.event_registrations
  FOR SELECT USING (
    public.is_event_organizer(event_id) AND public.auth_scope('m05.event.update') <> 'none'
  );

DROP POLICY IF EXISTS event_registrations_update_organizer ON public.event_registrations;
CREATE POLICY event_registrations_update_organizer ON public.event_registrations
  FOR UPDATE USING (
    public.is_event_organizer(event_id) AND public.auth_scope('m05.event.update') <> 'none'
  ) WITH CHECK (
    public.is_event_organizer(event_id) AND public.auth_scope('m05.event.update') <> 'none'
  );

CREATE OR REPLACE FUNCTION public.enforce_event_registration_organizer_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  -- Staf tidak dibatasi; peserta yang mengubah baris miliknya diatur policy/trigger yang sudah ada.
  IF public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager') OR OLD.agent_id = auth.uid() THEN
    RETURN NEW;
  END IF;
  IF NOT public.is_event_organizer(OLD.event_id) THEN
    RETURN NEW;
  END IF;
  IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'updated_at') THEN
    RAISE EXCEPTION 'event_registrations: penyelenggara hanya boleh mengubah status pendaftaran'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
       (OLD.status = 'pending_approval' AND NEW.status IN ('registered', 'cancelled'))
    OR (OLD.status = 'waitlist'         AND NEW.status IN ('registered', 'cancelled'))
    OR (OLD.status = 'registered'       AND NEW.status IN ('attended', 'cancelled'))
  ) THEN
    RAISE EXCEPTION 'event_registrations: transisi % -> % tidak diizinkan untuk penyelenggara', OLD.status, NEW.status
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_event_registration_organizer_rules ON public.event_registrations;
CREATE TRIGGER trg_event_registration_organizer_rules
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_registration_organizer_rules();

-- ═══ 4. Notifikasi dari peristiwa bisnis ═══
-- Pembuat internal: tidak bisa dipanggil pengguna; kegagalan hanya menjadi WARNING, tidak menggagalkan transaksi utama.
CREATE OR REPLACE FUNCTION public.notify_user(
  p_user_id uuid, p_type text, p_title text, p_message text,
  p_entity_type text DEFAULT NULL, p_entity_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id = auth.uid() THEN
    RETURN;
  END IF;
  BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id, delivery_status)
    VALUES (p_user_id, p_type, left(p_title, 255), p_message, p_entity_type, p_entity_id, 'delivered');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_user gagal (%): %', p_type, SQLERRM;
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_user(uuid, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;

-- 4a. Event: keputusan persetujuan/pembatalan -> penyelenggara; pembatalan -> pendaftar aktif.
CREATE OR REPLACE FUNCTION public.trg_notify_event_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF NEW.status = 'published' THEN
    PERFORM public.notify_user(NEW.submitted_by, 'approval_status', 'Event Anda diterbitkan', 'Event "' || NEW.title || '" kini tampil sesuai visibilitasnya.', 'event', NEW.id);
  ELSIF NEW.status = 'rejected' THEN
    PERFORM public.notify_user(NEW.submitted_by, 'approval_status', 'Event Anda ditolak', 'Event "' || NEW.title || '" tidak disetujui tim RumahAgen.', 'event', NEW.id);
  ELSIF NEW.status = 'cancelled' THEN
    PERFORM public.notify_user(NEW.submitted_by, 'approval_status', 'Event dibatalkan', 'Event "' || NEW.title || '" dibatalkan.', 'event', NEW.id);
    FOR r IN SELECT DISTINCT agent_id FROM public.event_registrations
             WHERE event_id = NEW.id AND agent_id IS NOT NULL AND status IN ('registered', 'waitlist', 'pending_approval') LOOP
      PERFORM public.notify_user(r.agent_id, 'lainnya', 'Event dibatalkan', 'Event "' || NEW.title || '" yang Anda ikuti dibatalkan.', 'event', NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_event_status ON public.events;
CREATE TRIGGER trg_notify_event_status AFTER UPDATE OF status ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_event_status();

-- 4b. Keputusan pendaftaran event (manual approval) -> peserta.
CREATE OR REPLACE FUNCTION public.trg_notify_event_registration_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status OR NEW.agent_id IS NULL THEN RETURN NEW; END IF;
  SELECT title INTO v_title FROM public.events WHERE id = NEW.event_id;
  IF OLD.status IN ('pending_approval', 'waitlist') AND NEW.status = 'registered' THEN
    PERFORM public.notify_user(NEW.agent_id, 'approval_status', 'Pendaftaran event disetujui', 'Anda terdaftar pada event "' || v_title || '".', 'event', NEW.event_id);
  ELSIF OLD.status = 'pending_approval' AND NEW.status = 'cancelled' THEN
    PERFORM public.notify_user(NEW.agent_id, 'approval_status', 'Pendaftaran event ditolak', 'Pendaftaran Anda pada event "' || v_title || '" tidak disetujui.', 'event', NEW.event_id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_event_registration_status ON public.event_registrations;
CREATE TRIGGER trg_notify_event_registration_status AFTER UPDATE OF status ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_event_registration_status();

-- 4c. Proyek developer: perubahan status oleh pihak lain -> pemilik proyek.
CREATE OR REPLACE FUNCTION public.trg_notify_developer_project_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner uuid;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  SELECT user_id INTO v_owner FROM public.developer_partners WHERE id = NEW.developer_id;
  PERFORM public.notify_user(v_owner, 'approval_status', 'Status proyek diperbarui',
    'Proyek "' || NEW.name || '" kini berstatus ' || NEW.status || '.', 'developer_project', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_developer_project_status ON public.developer_projects;
CREATE TRIGGER trg_notify_developer_project_status AFTER UPDATE OF status ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_developer_project_status();

-- 4d. Klaim proyek: klaim baru -> pemilik proyek; keputusan -> pengklaim.
CREATE OR REPLACE FUNCTION public.trg_notify_project_claim()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner uuid; v_name text;
BEGIN
  SELECT dp2.user_id, p.name INTO v_owner, v_name
  FROM public.developer_projects p JOIN public.developer_partners dp2 ON dp2.id = p.developer_id
  WHERE p.id = NEW.project_id;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pending' THEN
      PERFORM public.notify_user(v_owner, 'lainnya', 'Klaim proyek baru', 'Ada agen yang mengajukan klaim pada proyek "' || v_name || '".', 'project_claim', NEW.id);
    END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved', 'rejected', 'revoked') THEN
    PERFORM public.notify_user(NEW.agent_id, 'approval_status', 'Klaim proyek ' ||
      CASE NEW.status WHEN 'approved' THEN 'disetujui' WHEN 'rejected' THEN 'ditolak' ELSE 'dicabut' END,
      'Klaim Anda pada proyek "' || v_name || '" ' ||
      CASE NEW.status WHEN 'approved' THEN 'disetujui.' WHEN 'rejected' THEN 'ditolak.' ELSE 'dicabut.' END, 'project_claim', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_project_claim ON public.agent_project_claims;
CREATE TRIGGER trg_notify_project_claim AFTER INSERT OR UPDATE OF status ON public.agent_project_claims
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_project_claim();

-- 4e. Sertifikat terbit, lead baru.
CREATE OR REPLACE FUNCTION public.trg_notify_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_user(NEW.agent_id, 'certificate_issued', 'Sertifikat diterbitkan', 'Sertifikat baru Anda sudah tersedia.', 'certificate', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_certificate ON public.certificates;
CREATE TRIGGER trg_notify_certificate AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_certificate();

CREATE OR REPLACE FUNCTION public.trg_notify_listing_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner uuid; v_title text;
BEGIN
  SELECT agent_id, title INTO v_owner, v_title FROM public.listings WHERE id = NEW.listing_id;
  PERFORM public.notify_user(v_owner, 'lead_new', 'Lead baru', 'Ada lead baru pada listing "' || v_title || '".', 'listing', NEW.listing_id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_listing_lead ON public.listing_leads;
CREATE TRIGGER trg_notify_listing_lead AFTER INSERT ON public.listing_leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_listing_lead();

-- 4f. Sesi belajar: dijadwalkan/live/dibatalkan -> peserta aktif; aktivasi enrollment -> peserta; penugasan -> aktor.
CREATE OR REPLACE FUNCTION public.trg_notify_session_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_msg text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status OR NEW.status NOT IN ('live', 'cancelled', 'failed') THEN RETURN NEW; END IF;
  v_msg := CASE NEW.status WHEN 'live' THEN 'Sesi yang Anda ikuti sedang berlangsung.'
                            WHEN 'cancelled' THEN 'Sesi yang Anda ikuti dibatalkan.'
                            ELSE 'Sesi yang Anda ikuti dinyatakan gagal.' END;
  FOR r IN SELECT agent_id FROM public.session_enrollments WHERE session_id = NEW.id AND status IN ('pending', 'active') LOOP
    PERFORM public.notify_user(r.agent_id, 'lainnya', 'Pembaruan sesi', v_msg, 'learning_session', NEW.id);
  END LOOP;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_session_status ON public.learning_sessions;
CREATE TRIGGER trg_notify_session_status AFTER UPDATE OF status ON public.learning_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_session_status();

CREATE OR REPLACE FUNCTION public.trg_notify_session_enrollment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    PERFORM public.notify_user(NEW.agent_id, 'approval_status', 'Pendaftaran sesi diaktifkan', 'Pendaftaran Anda pada sesi pembelajaran sudah aktif.', 'learning_session', NEW.session_id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_session_enrollment ON public.session_enrollments;
CREATE TRIGGER trg_notify_session_enrollment AFTER UPDATE OF status ON public.session_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_session_enrollment();

CREATE OR REPLACE FUNCTION public.trg_notify_session_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ACTIVE' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'ACTIVE') THEN
    PERFORM public.notify_user(NEW.actor_id, 'lainnya', 'Penugasan sesi',
      'Anda ditugaskan sebagai ' || CASE NEW.capability WHEN 'HOST' THEN 'Host' ELSE 'Instruktur' END || ' pada sebuah sesi pembelajaran.',
      'learning_session', NEW.session_id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_session_assignment ON public.learning_session_assignments;
CREATE TRIGGER trg_notify_session_assignment AFTER INSERT OR UPDATE OF status ON public.learning_session_assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_session_assignment();

-- 4g. Award diterbitkan/dicabut, banding diputuskan -> penerima.
CREATE OR REPLACE FUNCTION public.trg_notify_award()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_user(NEW.user_id, 'approval_status', 'Award diterima', 'Anda menerima sebuah award baru.', 'award', NEW.id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'revoked' THEN
    PERFORM public.notify_user(NEW.user_id, 'approval_status', 'Award dicabut', 'Sebuah award Anda dicabut. Anda dapat mengajukan banding.', 'award', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_award ON public.award_instances;
CREATE TRIGGER trg_notify_award AFTER INSERT OR UPDATE OF status ON public.award_instances
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_award();

CREATE OR REPLACE FUNCTION public.trg_notify_award_appeal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM public.notify_user(NEW.appellant_id, 'approval_status',
      CASE NEW.status WHEN 'approved' THEN 'Banding award diterima' ELSE 'Banding award ditolak' END,
      CASE NEW.status WHEN 'approved' THEN 'Banding Anda diterima.' ELSE 'Banding Anda ditolak.' END, 'award_appeal', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_award_appeal ON public.award_appeals;
CREATE TRIGGER trg_notify_award_appeal AFTER UPDATE OF status ON public.award_appeals
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_award_appeal();

-- 4h. Pengingat terjadwal (perlu penjadwal eksternal/pg_cron; TIDAK dijadwalkan di migration ini).
-- Idempoten: tidak mengirim ulang jika notifikasi tipe+entitas yang sama sudah ada untuk pengguna itu.
CREATE OR REPLACE FUNCTION public.send_event_reminders(p_within interval DEFAULT interval '24 hours')
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_n integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT (public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'send_event_reminders: hanya staf/server' USING ERRCODE = '42501';
  END IF;
  FOR r IN
    SELECT er.agent_id, e.id AS event_id, e.title
    FROM public.event_registrations er JOIN public.events e ON e.id = er.event_id
    WHERE er.status = 'registered' AND er.agent_id IS NOT NULL AND e.status = 'published' AND e.deleted_at IS NULL
      AND e.start_at > now() AND e.start_at <= now() + p_within
      AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = er.agent_id AND n.type = 'event_reminder' AND n.related_entity_id = e.id)
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id, delivery_status)
    VALUES (r.agent_id, 'event_reminder', 'Event segera dimulai', 'Event "' || r.title || '" akan dimulai dalam waktu dekat.', 'event', r.event_id, 'delivered');
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_expiring_listings(p_within interval DEFAULT interval '3 days')
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_n integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT (public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'notify_expiring_listings: hanya staf/server' USING ERRCODE = '42501';
  END IF;
  FOR r IN
    SELECT l.id, l.agent_id, l.title FROM public.listings l
    WHERE l.status = 'published' AND l.deleted_at IS NULL AND l.expired_at IS NOT NULL
      AND l.expired_at > now() AND l.expired_at <= now() + p_within
      AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = l.agent_id AND n.type = 'listing_expiring' AND n.related_entity_id = l.id AND n.created_at > now() - p_within)
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id, delivery_status)
    VALUES (r.agent_id, 'listing_expiring', 'Listing segera berakhir', 'Listing "' || r.title || '" akan segera berakhir.', 'listing', r.id, 'delivered');
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END; $$;
REVOKE ALL ON FUNCTION public.send_event_reminders(interval) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notify_expiring_listings(interval) FROM PUBLIC, anon;
