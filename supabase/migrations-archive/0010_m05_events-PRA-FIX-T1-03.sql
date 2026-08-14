-- ============================================================================
-- Migration 0010: Modul 5 — Kalender Event
-- ENT: ENT-M05-Event/EventRegistration
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
CREATE POLICY events_manage ON events FOR ALL TO authenticated
  USING (submitted_by = auth.uid() OR auth_has_scope_all('M05_event','manage'))
  WITH CHECK (submitted_by = auth.uid() OR auth_has_scope_all('M05_event','manage'));

CREATE POLICY event_registrations_own ON event_registrations FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M05_event','view'))
  WITH CHECK (agent_id = auth.uid());
