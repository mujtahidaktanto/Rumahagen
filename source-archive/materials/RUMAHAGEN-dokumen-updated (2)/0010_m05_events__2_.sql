-- ============================================================================
-- Migration 0010: Modul 5 — Kalender Event
-- ENT: ENT-M05-Event/EventRegistration
-- ============================================================================
-- CHANGELOG:
-- [2026-08-09] Fix RLS self-approval bug (Konflik #1, MP-05-KalenderEvent-
--   Module-Planning §51 Conflict Analysis). Dokumen MP-05 mengklaim perbaikan
--   ini sudah dieksekusi "2026-08-06", tapi verifikasi audit konsolidasi 9
--   Agustus 2026 membuktikan migration ini (versi sebelum patch ini) masih
--   memakai 1 policy `events_manage` tunggal yang mengizinkan submitter
--   (mis. Developer Partner) mengubah status event miliknya sendiri menjadi
--   'published' tanpa approval — bug keamanan/bisnis nyata, bukan hanya gap
--   fitur (berbeda tingkat keparahan dari regresi serupa di MP-04/migration
--   0009). Policy tunggal `events_manage` dipecah jadi 4 policy:
--   1. events_insert_own — submitter hanya bisa INSERT dengan status awal
--      'pending_approval'.
--   2. events_update_own — submitter hanya bisa UPDATE event miliknya selama
--      status masih 'pending_approval'/'cancelled', tidak bisa self-set ke
--      'published'/'rejected'.
--   3. events_delete_own — submitter hanya bisa DELETE event miliknya selama
--      belum diproses.
--   4. events_manage_all — role dengan scope 'manage' (Superadmin/Admin/
--      Manager, OD-17) memegang kendali penuh termasuk approve/reject.
--   Endpoint approve/reject API Specification masih belum ditambahkan
--   (temuan terpisah, di luar scope perbaikan RLS ini — lihat MP-05 §46).
-- ============================================================================

CREATE TABLE events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(200) NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('training','launching_proyek','open_house','gathering')),
  description         TEXT,
  is_online           BOOLEAN NOT NULL DEFAULT false,
  location            VARCHAR(255),
  meeting_link        VARCHAR(500),
  host                VARCHAR(150),
  quota               INT,
  related_course_id   UUID REFERENCES courses(id) ON DELETE SET NULL,
  related_project_id  UUID REFERENCES developer_projects(id) ON DELETE SET NULL,
  submitted_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'pending_approval'
                        CHECK (status IN ('pending_approval','published','rejected','cancelled')),
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_events_start_at ON events(start_at) WHERE deleted_at IS NULL;

CREATE TABLE event_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlist','attended','cancelled')),
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, agent_id)
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select_published ON events FOR SELECT TO anon, authenticated
  USING ((status = 'published' AND deleted_at IS NULL) OR submitted_by = auth.uid()
         OR auth_has_scope_all('M05_event','manage'));

-- Submitter (mis. Developer Partner) hanya boleh INSERT dengan status awal 'pending_approval'
-- — tidak bisa langsung set 'published' saat membuat event sendiri.
CREATE POLICY events_insert_own ON events FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending_approval');

-- Submitter hanya boleh UPDATE event miliknya SELAMA statusnya masih 'pending_approval'
-- atau 'cancelled' — tidak bisa mengubah status menjadi 'published'/'rejected' sendiri
-- (transisi approval eksklusif milik events_manage_all di bawah). Mencegah self-approval
-- (Konflik #1, MP-05 §51).
CREATE POLICY events_update_own ON events FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status IN ('pending_approval','cancelled'))
  WITH CHECK (submitted_by = auth.uid() AND status IN ('pending_approval','cancelled'));

-- Submitter boleh DELETE event miliknya selama belum diproses (masih pending_approval/cancelled).
CREATE POLICY events_delete_own ON events FOR DELETE TO authenticated
  USING (submitted_by = auth.uid() AND status IN ('pending_approval','cancelled'));

-- Role dengan scope 'manage' (Superadmin/Admin/Manager — lihat OD-17) memegang kendali penuh,
-- termasuk transisi status ke 'published'/'rejected' (approval/reject) untuk event siapa pun.
CREATE POLICY events_manage_all ON events FOR ALL TO authenticated
  USING (auth_has_scope_all('M05_event','manage'))
  WITH CHECK (auth_has_scope_all('M05_event','manage'));

CREATE POLICY event_registrations_own ON event_registrations FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M05_event','view'))
  WITH CHECK (agent_id = auth.uid());
