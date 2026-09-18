-- 0088_add_event_registration_approval_mode.sql
-- Menutup temuan Tier 2 T2-4 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-G_M05_MANDATORY_DELTA_
-- IMPACT_GATE_FULL_v1.0.md` mengunci (M05-DELTA-011/012, "PASS/LOCKED"):
-- Event Registration approval BERBEDA dari Event publication approval
-- ("Event publication approval != Event Registration approval", §-nya
-- eksplisit menekankan "two approval layers must not be collapsed").
-- Default Registration adalah AUTO-CONFIRM; Event Owner boleh
-- mengkonfigurasi override CLOSED atau MANUAL APPROVAL. Skema lama
-- (`events`/`event_registrations`, 0031/0032) tidak punya kolom APA PUN
-- untuk menyimpan mode ini -- bukan cuma logika yang belum ditegakkan,
-- kapasitas penyimpanannya sendiri tidak ada.
--
-- Desain:
-- - `events.registration_approval_mode` BARU -- 'auto_confirm' (default)/
--   'manual_approval'/'closed'. Diatur Event Owner lewat UPDATE biasa
--   (RLS `events_update`/m05.event.update yang SUDAH ADA, tidak perlu
--   permission baru -- ini konfigurasi event normal, bukan enforcement
--   staff-only seperti listings/organizations suspended).
-- - `event_registrations.status` BARU nilai 'pending_approval' -- state
--   registrasi yang menunggu keputusan Event Owner saat mode=manual_approval.
-- - Trigger BARU (terpisah dari trg_event_registration_guest_email yang
--   sudah ada, supaya satu trigger = satu concern): pendaftaran ditolak
--   total kalau mode=closed; kalau mode=manual_approval, status awal
--   dipaksa 'pending_approval' terlepas apa yang dikirim klien (kecuali
--   'waitlist', yang tetap dihormati -- itu konsekuensi KAPASITAS, sumbu
--   berbeda dari approval, tidak dicampur).

ALTER TABLE public.events ADD COLUMN registration_approval_mode TEXT NOT NULL DEFAULT 'auto_confirm'
  CHECK (registration_approval_mode IN ('auto_confirm', 'manual_approval', 'closed'));

COMMENT ON COLUMN public.events.registration_approval_mode IS
  'ADD-NEW/0088. Gate PRE-00-G (LOCKED): default auto_confirm, Event Owner boleh override closed/manual_approval. TERPISAH dari events.status (approval PUBLIKASI event) -- "two approval layers must not be collapsed". Diatur lewat UPDATE biasa (m05.event.update), bukan permission enforcement khusus.';

ALTER TABLE public.event_registrations DROP CONSTRAINT event_registrations_status_check;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_status_check
  CHECK (status IN ('registered', 'waitlist', 'attended', 'cancelled', 'pending_approval'));

CREATE OR REPLACE FUNCTION public.enforce_event_registration_approval_mode()
RETURNS TRIGGER AS $$
DECLARE
  v_mode TEXT;
BEGIN
  SELECT registration_approval_mode INTO v_mode FROM public.events WHERE id = NEW.event_id;

  IF v_mode = 'closed' THEN
    RAISE EXCEPTION 'event_registrations: pendaftaran ditutup Event Owner (registration_approval_mode=closed, Gate PRE-00-G)';
  END IF;

  IF v_mode = 'manual_approval' AND NEW.status = 'registered' THEN
    NEW.status := 'pending_approval';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_event_registration_approval_mode
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_registration_approval_mode();

COMMENT ON CONSTRAINT event_registrations_status_check ON public.event_registrations IS
  'DIPERLUAS 0088: menambah nilai ''pending_approval'' -- registrasi yang menunggu keputusan Event Owner saat events.registration_approval_mode=manual_approval (Gate PRE-00-G). Status awal dipaksa nilai ini oleh trigger enforce_event_registration_approval_mode(), bukan dikirim mentah dari klien.';
