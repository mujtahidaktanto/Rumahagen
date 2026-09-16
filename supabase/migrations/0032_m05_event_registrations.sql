-- 0032_m05_event_registrations.sql
-- Sumber kolom: STEP10-D entity EVENT_REGISTRATIONS (module M05). Permission
-- SUDAH ADA sejak Tahap 1: m05.event_registration.{create,view,update},
-- m05.guest_registration.{create,view,manage}.
--
-- TEMUAN PENTING: tidak ada tabel terpisah untuk "Guest Registration" di
-- STEP10-D — kolom `guest_email` dan `participant_mode` (keduanya gap kosong
-- di sumber) ADA di entity EVENT_REGISTRATIONS yang SAMA. Ini menjelaskan
-- kenapa permission m05.guest_registration.* terpisah dari
-- m05.event_registration.* TAPI targetnya satu tabel fisik: `participant_mode`
-- membedakan pendaftaran untuk diri sendiri ('self') vs mendaftarkan tamu
-- ('guest', dengan guest_email sebagai kontak tamu yang belum tentu punya
-- akun platform). `agent_id` tetap NOT NULL di kedua mode — untuk mode 'guest'
-- artinya agent yang MENDAFTARKAN tamu tersebut (pemilik baris/OWN scope),
-- bukan tamu itu sendiri.

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  agent_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_mode   TEXT NOT NULL DEFAULT 'self' CHECK (participant_mode IN ('self','guest')),
  guest_email        VARCHAR(255),
  status             TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlist','attended','cancelled')),
  registered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_registrations IS
  'Sumber: STEP10-D entity EVENT_REGISTRATIONS. Menyatukan pendaftaran biasa (participant_mode=self, permission m05.event_registration.*) dan pendaftaran tamu (participant_mode=guest, permission m05.guest_registration.*) — lihat catatan lengkap di atas migration ini. guest_email WAJIB kalau participant_mode=guest (trigger di bawah).';

-- Trigger: guest_email wajib untuk mode guest, kosong untuk mode self (validitas
-- data, bukan akses — pola sama seperti 0004/0018).
CREATE OR REPLACE FUNCTION public.enforce_event_registration_guest_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.participant_mode = 'guest' AND (NEW.guest_email IS NULL OR NEW.guest_email = '') THEN
    RAISE EXCEPTION 'event_registrations: guest_email wajib diisi kalau participant_mode=guest';
  END IF;
  IF NEW.participant_mode = 'self' AND NEW.guest_email IS NOT NULL THEN
    RAISE EXCEPTION 'event_registrations: guest_email harus NULL kalau participant_mode=self';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_event_registration_guest_email
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_registration_guest_email();

-- ── RLS ── kedua family permission (event_registration.* dan
-- guest_registration.*) punya scope IDENTIK per baris matrix masing-masing
-- (Superadmin/Admin/Manager=ALL, Agent=OWN untuk event_registration;
-- Superadmin/Admin/Manager=ALL, Instructor=OWN untuk guest_registration) —
-- dipilih permission yang sesuai participant_mode di WITH CHECK, SELECT
-- memakai OR keduanya supaya baris terlihat kalau salah satu grant berlaku.

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_registrations_select ON public.event_registrations
  FOR SELECT USING (
    public.has_permission('m05.event_registration.view', agent_id)
    OR public.has_permission('m05.guest_registration.view', agent_id)
  );

CREATE POLICY event_registrations_insert ON public.event_registrations
  FOR INSERT WITH CHECK (
    CASE
      WHEN participant_mode = 'guest' THEN public.has_permission('m05.guest_registration.create', agent_id)
      ELSE public.has_permission('m05.event_registration.create', agent_id)
    END
  );

CREATE POLICY event_registrations_update ON public.event_registrations
  FOR UPDATE USING (
    CASE
      WHEN participant_mode = 'guest' THEN public.has_permission('m05.guest_registration.manage', agent_id)
      ELSE public.has_permission('m05.event_registration.update', agent_id)
    END
  );
