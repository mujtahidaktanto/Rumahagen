-- 0091_fix_event_registration_approval_trigger_security_definer.sql
-- Bug ditemukan lewat testing nyata migration 0088 (T2-4):
-- `enforce_event_registration_approval_mode()` TIDAK SECURITY DEFINER,
-- jadi `SELECT registration_approval_mode FROM public.events WHERE id =
-- NEW.event_id` di dalamnya berjalan dengan privilese CALLER (registrant),
-- tunduk RLS `events_select` (0031) yang HANYA mengizinkan lihat event
-- published+public, event milik sendiri, atau staf. Registrant yang
-- mendaftar ke event ORANG LAIN yang belum published (kasus normal) tidak
-- lolos RLS itu -- SELECT mengembalikan 0 baris, v_mode jadi NULL, seluruh
-- pengecekan closed/manual_approval diam-diam TIDAK PERNAH berlaku.
-- Dikonfirmasi lewat test nyata: RSVP ke event manual_approval tetap
-- berstatus 'registered' (harusnya 'pending_approval'); RSVP ke event
-- closed tetap berhasil 201 (harusnya ditolak).
--
-- Pola sama seperti alasan admin_force_provider_connection()/
-- fulfill_commercial_order() SECURITY DEFINER: ini lookup DATA INTEGRITY
-- (perilaku pendaftaran wajib konsisten dengan konfigurasi event, terlepas
-- apakah registrant kebetulan boleh SELECT baris event itu), BUKAN
-- keputusan otorisasi -- otorisasi SESUNGGUHNYA (boleh/tidaknya mendaftar
-- sama sekali) tetap RLS event_registrations_insert (0032), tidak berubah.

CREATE OR REPLACE FUNCTION public.enforce_event_registration_approval_mode()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION public.enforce_event_registration_approval_mode IS
  'DIPERBAIKI 0091: ditambah SECURITY DEFINER + SET search_path=public -- versi 0088 tanpa ini gagal membaca events.registration_approval_mode untuk event yang bukan milik registrant (RLS events_select terlalu sempit untuk lookup data-integrity ini), membuat mode closed/manual_approval diam-diam tidak pernah berlaku.';

-- Pencegahan proaktif, BUKAN bug yang ketemu lewat testing (banks_select
-- kebetulan mengizinkan ketiga role yang bisa INSERT dbr_simulations --
-- superadmin/admin/manager/agent semuanya punya m07.bank_master.view, jadi
-- lookup ini SAAT INI selalu berhasil) -- tapi pola akar masalahnya PERSIS
-- sama seperti bug event di atas, jadi ditutup sekalian sebelum sempat jadi
-- bug nyata kalau matrix permission banks_select berubah di masa depan.
CREATE OR REPLACE FUNCTION public.enforce_dbr_simulation_bank_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bank public.banks;
BEGIN
  SELECT * INTO v_bank FROM public.banks WHERE id = NEW.bank_id;
  IF v_bank.id IS NULL THEN
    RAISE EXCEPTION 'dbr_simulations: bank_id tidak ditemukan';
  END IF;
  IF v_bank.status <> 'active' THEN
    RAISE EXCEPTION 'dbr_simulations: bank % tidak aktif, tidak bisa dipakai untuk simulasi baru (Gate PRE-00-I)', v_bank.name;
  END IF;
  NEW.threshold_used := v_bank.dbr_threshold_percent;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_dbr_simulation_bank_snapshot IS
  'DIPERKUAT 0091: ditambah SECURITY DEFINER untuk konsistensi/pencegahan proaktif terhadap kelas bug yang sama seperti enforce_event_registration_approval_mode -- lookup data-integrity lintas tabel sebaiknya tidak bergantung pada RLS visibility caller yang bisa berubah.';
