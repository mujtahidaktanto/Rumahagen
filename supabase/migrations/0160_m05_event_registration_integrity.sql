-- 0160_m05_event_registration_integrity.sql
-- Menutup celah pendaftaran event yang ditemukan pemindaian 2026-09-26 (audit/FRONTEND_GAPS.md, bagian 3e) dan menyiapkan layar pendaftar untuk penyelenggara:
--
--   1. Peserta bisa mengubah status pendaftarannya sendiri (RLS event_registrations_update mengizinkan pemilik, trigger organizer_rules langsung meloloskan pemilik): menyetujui diri sendiri
--      (pending_approval -> registered) atau menandai 'attended'. SEKARANG peserta hanya boleh membatalkan (registered|waitlist|pending_approval -> cancelled) dan tidak boleh mengubah kolom lain.
--      Bila pemilik pendaftaran juga penyelenggara event itu, aturan penyelenggara yang berlaku (bisa menyetujui/menandai hadir).
--   2. Peserta bisa MENYISIPKAN pendaftaran berstatus 'attended'/'waitlist'/'cancelled', mendaftar ke event yang belum tayang (pending_approval/rejected/cancelled) atau privat, dan mendaftar
--      berkali-kali pada event yang sama (tidak ada indeks unik). SEKARANG: peserta biasa hanya boleh status awal 'registered', hanya untuk event published dan bukan privat (kecuali penyelenggara),
--      dan satu pendaftaran aktif per (event, Agent) untuk mode self (pendaftaran yang dibatalkan boleh didaftarkan ulang).
--   3. RPC event_registrants(event): daftar pendaftar untuk penyelenggara event/staf (nama Agent diambil di dalam fungsi karena RLS agent_profiles tidak mengizinkan penyelenggara membaca profil).
--   4. Perbaikan Advisor: search_path tetap pada is_reserved_agent_slug dan next_wib_month_start (dibuat 0157).
--
-- Staf (Superadmin, Admin, Manager) dan service_role tidak dibatasi aturan peserta. Rollback: kembalikan dua fungsi trigger ke 0088/0129, DROP INDEX uq_event_registrations_active_self, DROP FUNCTION event_registrants,
-- ALTER FUNCTION ... RESET search_path.

-- ═══ 1. Perbaikan search_path (Advisor) ═══
ALTER FUNCTION public.is_reserved_agent_slug(text) SET search_path = public;
ALTER FUNCTION public.next_wib_month_start(timestamptz) SET search_path = public;

-- ═══ 2. Satu pendaftaran aktif per Agent per event (mode self) ═══
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_registrations_active_self
  ON public.event_registrations (event_id, agent_id)
  WHERE participant_mode = 'self' AND status <> 'cancelled';

-- ═══ 3. Trigger INSERT: status awal, event tayang dan tidak privat ═══
CREATE OR REPLACE FUNCTION public.enforce_event_registration_approval_mode()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_mode       TEXT;
  v_status     TEXT;
  v_visibility TEXT;
  v_deleted    TIMESTAMPTZ;
  v_user_call  BOOLEAN := COALESCE(current_setting('role', true), '') IN ('authenticated', 'anon') AND auth.uid() IS NOT NULL;
  v_staff      BOOLEAN := COALESCE(public.is_superadmin(), false) OR COALESCE(public.current_role_code() IN ('admin', 'manager'), false);
  v_organizer  BOOLEAN;
BEGIN
  SELECT registration_approval_mode, status, visibility, deleted_at INTO v_mode, v_status, v_visibility, v_deleted FROM public.events WHERE id = NEW.event_id;

  IF v_user_call AND NOT v_staff THEN
    v_organizer := public.is_event_organizer(NEW.event_id);
    IF NEW.status <> 'registered' THEN
      RAISE EXCEPTION 'event_registrations: pendaftaran baru harus berstatus registered' USING ERRCODE = '23514';
    END IF;
    IF NOT v_organizer AND (v_status IS DISTINCT FROM 'published' OR v_deleted IS NOT NULL) THEN
      RAISE EXCEPTION 'event_registrations: event belum tayang atau sudah tidak tersedia' USING ERRCODE = '23514';
    END IF;
    IF NOT v_organizer AND v_visibility = 'private' THEN
      RAISE EXCEPTION 'event_registrations: event ini tidak menerima pendaftaran' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF v_mode = 'closed' THEN
    RAISE EXCEPTION 'event_registrations: pendaftaran ditutup Event Owner (registration_approval_mode=closed, Gate PRE-00-G)';
  END IF;

  IF v_mode = 'manual_approval' AND NEW.status = 'registered' THEN
    NEW.status := 'pending_approval';
  END IF;

  RETURN NEW;
END;
$function$;

-- ═══ 4. Trigger UPDATE: penyelenggara mengatur status, peserta hanya membatalkan ═══
CREATE OR REPLACE FUNCTION public.enforce_event_registration_organizer_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_strip text[];
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager') THEN RETURN NEW; END IF;

  IF public.is_event_organizer(OLD.event_id) THEN
    IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'updated_at') THEN
      RAISE EXCEPTION 'event_registrations: penyelenggara hanya boleh mengubah status pendaftaran' USING ERRCODE = '42501';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
         (OLD.status = 'pending_approval' AND NEW.status IN ('registered', 'cancelled'))
      OR (OLD.status = 'waitlist' AND NEW.status IN ('registered', 'cancelled'))
      OR (OLD.status = 'registered' AND NEW.status IN ('attended', 'cancelled'))) THEN
      RAISE EXCEPTION 'event_registrations: transisi % -> % tidak diizinkan untuk penyelenggara', OLD.status, NEW.status USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.agent_id = auth.uid() THEN
    -- Peserta (pemilik pendaftaran): hanya boleh membatalkan; pendaftaran tamu boleh mengganti email tamu.
    v_strip := ARRAY['status', 'updated_at'] || CASE WHEN OLD.participant_mode = 'guest' THEN ARRAY['guest_email'] ELSE ARRAY[]::text[] END;
    IF (to_jsonb(NEW) - v_strip) IS DISTINCT FROM (to_jsonb(OLD) - v_strip) THEN
      RAISE EXCEPTION 'event_registrations: peserta hanya boleh mengubah status pendaftarannya' USING ERRCODE = '42501';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (OLD.status IN ('registered', 'waitlist', 'pending_approval') AND NEW.status = 'cancelled') THEN
      RAISE EXCEPTION 'event_registrations: peserta hanya boleh membatalkan pendaftarannya (% -> % tidak diizinkan)', OLD.status, NEW.status USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- ═══ 5. Daftar pendaftar untuk penyelenggara ═══
CREATE OR REPLACE FUNCTION public.event_registrants(p_event_id uuid)
RETURNS TABLE (id uuid, status text, participant_mode text, guest_email text, registered_at timestamptz, agent_name text, agent_office text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'event_registrants: login diperlukan' USING ERRCODE = '42501';
  END IF;
  IF NOT (public.is_event_organizer(p_event_id) OR COALESCE(public.is_superadmin(), false) OR COALESCE(public.current_role_code() IN ('admin', 'manager'), false)) THEN
    RAISE EXCEPTION 'event_registrants: hanya penyelenggara event' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT er.id, er.status, er.participant_mode, er.guest_email::text, er.registered_at, COALESCE(ap.full_name, 'Agent')::text, ap.office_name::text
    FROM public.event_registrations er
    LEFT JOIN public.agent_profiles ap ON ap.user_id = er.agent_id
    WHERE er.event_id = p_event_id
    ORDER BY CASE er.status WHEN 'pending_approval' THEN 0 WHEN 'waitlist' THEN 1 WHEN 'registered' THEN 2 WHEN 'attended' THEN 3 ELSE 4 END, er.registered_at;
END;
$$;

REVOKE ALL ON FUNCTION public.event_registrants(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.event_registrants(uuid) TO authenticated;
