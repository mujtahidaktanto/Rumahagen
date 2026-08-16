-- ============================================================================
-- RUMAHAGEN TECH-25
-- Consolidated Session Migration Candidate v1.0
-- STATUS: REVIEW-ONLY / NOT AUTHORIZED FOR PRODUCTION EXECUTION
--
-- Consolidates:
--   TECH-13 frozen Session migration candidate
--   TECH-24 resource-level Session assignment delta
--
-- Governing:
--   MADCR-053 Capability + Permission + Scope
--   MADCR-054 HOST != INSTRUCTOR; explicit dual capability
--   TECH-19-R1 physical Session relationships / RLS boundary
--   TECH-20 approved M04 Learning permission namespace
--   TECH-21 Session permission catalogue candidate
--   TECH-23 resource-level assignment schema
--   TECH-24 assignment migration/RLS candidate
--
-- IMPORTANT:
--   1) No permission or role_permissions seeding.
--   2) No provider-specific authorization bypass.
--   3) No Partner relation or private-audience table is introduced.
--   4) This file is a consolidated candidate only; do not run in production.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Core Learning Session
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id          UUID REFERENCES courses(id) ON DELETE SET NULL,
  organization_id    UUID REFERENCES organizations(id) ON DELETE SET NULL,
  event_id           UUID REFERENCES events(id) ON DELETE SET NULL,
  session_type       TEXT NOT NULL CHECK (session_type IN ('broadcast','interactive','on_demand')),
  status             TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','scheduled','live','ended','cancelled','failed')),
  start_at           TIMESTAMPTZ NOT NULL,
  end_at             TIMESTAMPTZ,
  visibility         TEXT NOT NULL
                     CHECK (visibility IN ('public','organization','partner','private')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_owner
  ON learning_sessions(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_sessions_org
  ON learning_sessions(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_sessions_event
  ON learning_sessions(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_sessions_start
  ON learning_sessions(start_at) WHERE deleted_at IS NULL;

-- Add expected constraints safely if the table already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ck_learning_sessions_org_visibility'
      AND conrelid = 'learning_sessions'::regclass
  ) THEN
    ALTER TABLE learning_sessions
      ADD CONSTRAINT ck_learning_sessions_org_visibility
      CHECK (visibility <> 'organization' OR organization_id IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ck_learning_sessions_time_order'
      AND conrelid = 'learning_sessions'::regclass
  ) THEN
    ALTER TABLE learning_sessions
      ADD CONSTRAINT ck_learning_sessions_time_order
      CHECK (end_at IS NULL OR end_at >= start_at);
  END IF;
END $$;

-- --------------------------------------------------------------------------
-- 2. Session Enrollment
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_enrollments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  agent_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','active','completed')),
  activation_reference  TEXT,
  requested_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at          TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_enrollments_active_unique
  ON session_enrollments(session_id, agent_id)
  WHERE status IN ('pending','active');
CREATE INDEX IF NOT EXISTS idx_session_enrollments_agent
  ON session_enrollments(agent_id);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_session
  ON session_enrollments(session_id);

-- --------------------------------------------------------------------------
-- 3. Provider Binding
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_provider_bindings (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                    UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  provider_key                  TEXT NOT NULL,
  external_provider_session_id  TEXT,
  binding_state                 TEXT NOT NULL DEFAULT 'active'
                                CHECK (binding_state IN ('pending','active','ended','failed','replaced')),
  effective_from                TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to                  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_spb_external_ref
  ON session_provider_bindings(provider_key, external_provider_session_id)
  WHERE external_provider_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_spb_one_active_per_session
  ON session_provider_bindings(session_id)
  WHERE binding_state IN ('pending','active');
CREATE INDEX IF NOT EXISTS idx_spb_session
  ON session_provider_bindings(session_id);

-- --------------------------------------------------------------------------
-- 4. Participation Evidence
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_participation_evidence (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_id            UUID NOT NULL REFERENCES session_provider_bindings(id) ON DELETE CASCADE,
  session_enrollment_id UUID REFERENCES session_enrollments(id) ON DELETE SET NULL,
  external_event_id     TEXT,
  idempotency_key       TEXT NOT NULL UNIQUE,
  observed_at           TIMESTAMPTZ,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at          TIMESTAMPTZ,
  payload_metadata      JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_session_evidence_binding
  ON session_participation_evidence(binding_id);
CREATE INDEX IF NOT EXISTS idx_session_evidence_enrollment
  ON session_participation_evidence(session_enrollment_id);

-- --------------------------------------------------------------------------
-- 5. Attendance Evaluation
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_attendance_evaluations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_enrollment_id UUID NOT NULL REFERENCES session_enrollments(id) ON DELETE CASCADE,
  evidence_id           UUID REFERENCES session_participation_evidence(id) ON DELETE SET NULL,
  policy_version        TEXT NOT NULL,
  result                TEXT NOT NULL,
  evaluated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_session_attendance_enrollment
  ON session_attendance_evaluations(session_enrollment_id);

-- --------------------------------------------------------------------------
-- 6. Completion Outcome
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_completion_outcomes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_enrollment_id     UUID NOT NULL REFERENCES session_enrollments(id) ON DELETE CASCADE,
  attendance_evaluation_id  UUID REFERENCES session_attendance_evaluations(id) ON DELETE SET NULL,
  completion_policy_version TEXT NOT NULL,
  result                    TEXT NOT NULL,
  completed_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_session_completion_enrollment
  ON session_completion_outcomes(session_enrollment_id);

-- --------------------------------------------------------------------------
-- 7. Session Artifact / Recording Reference
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  provider_key  TEXT,
  source_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'available'
                CHECK (status IN ('pending','available','unavailable','expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_session_artifacts_session
  ON session_artifacts(session_id);

-- --------------------------------------------------------------------------
-- 8. Resource-Level Host / Instructor Assignment (TECH-23/24)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_session_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  actor_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  capability  TEXT NOT NULL CHECK (capability IN ('HOST','INSTRUCTOR')),
  status      TEXT NOT NULL DEFAULT 'ACTIVE'
              CHECK (status IN ('ACTIVE','REVOKED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  revoked_at  TIMESTAMPTZ,
  revoked_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  CHECK (
    (status = 'ACTIVE' AND revoked_at IS NULL)
    OR
    (status = 'REVOKED' AND revoked_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_session_assignments_active
  ON learning_session_assignments(session_id, actor_id, capability)
  WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_session
  ON learning_session_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_actor
  ON learning_session_assignments(actor_id);
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_active_capability
  ON learning_session_assignments(session_id, capability)
  WHERE status = 'ACTIVE';

-- --------------------------------------------------------------------------
-- 9. RLS Enablement
-- --------------------------------------------------------------------------
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_provider_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_completion_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_session_assignments ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 10. Session RLS — conservative baseline
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS learning_sessions_select_public ON learning_sessions;
CREATE POLICY learning_sessions_select_public
ON learning_sessions FOR SELECT TO anon, authenticated
USING (
  visibility = 'public'
  AND status IN ('scheduled','live','ended')
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS learning_sessions_select_owner ON learning_sessions;
CREATE POLICY learning_sessions_select_owner
ON learning_sessions FOR SELECT TO authenticated
USING (owner_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS learning_sessions_insert_owner ON learning_sessions;
CREATE POLICY learning_sessions_insert_owner
ON learning_sessions FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND (
    visibility <> 'organization'
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = learning_sessions.organization_id
        AND om.agent_id = auth.uid()
        AND om.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS learning_sessions_update_owner ON learning_sessions;
CREATE POLICY learning_sessions_update_owner
ON learning_sessions FOR UPDATE TO authenticated
USING (owner_id = auth.uid() AND deleted_at IS NULL)
WITH CHECK (
  owner_id = auth.uid()
  AND (
    visibility <> 'organization'
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = learning_sessions.organization_id
        AND om.agent_id = auth.uid()
        AND om.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS learning_sessions_select_org_member ON learning_sessions;
CREATE POLICY learning_sessions_select_org_member
ON learning_sessions FOR SELECT TO authenticated
USING (
  visibility = 'organization'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = learning_sessions.organization_id
      AND om.agent_id = auth.uid()
      AND om.status = 'active'
  )
);

-- --------------------------------------------------------------------------
-- 11. Enrollment RLS — learner owns enrollment; lifecycle server-governed
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS session_enrollments_select_own ON session_enrollments;
CREATE POLICY session_enrollments_select_own
ON session_enrollments FOR SELECT TO authenticated
USING (agent_id = auth.uid());

DROP POLICY IF EXISTS session_enrollments_insert_own ON session_enrollments;
CREATE POLICY session_enrollments_insert_own
ON session_enrollments FOR INSERT TO authenticated
WITH CHECK (agent_id = auth.uid() AND status = 'pending');

-- No generic learner UPDATE/DELETE policy.

-- --------------------------------------------------------------------------
-- 12. Provider Binding RLS — conservative owner read only
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS session_provider_bindings_owner_read ON session_provider_bindings;
CREATE POLICY session_provider_bindings_owner_read
ON session_provider_bindings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM learning_sessions s
    WHERE s.id = session_provider_bindings.session_id
      AND s.owner_id = auth.uid()
      AND s.deleted_at IS NULL
  )
);

-- --------------------------------------------------------------------------
-- 13. Evidence / Attendance / Completion RLS — own enrollment read
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS session_evidence_enrollment_read ON session_participation_evidence;
CREATE POLICY session_evidence_enrollment_read
ON session_participation_evidence FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM session_enrollments se
    WHERE se.id = session_participation_evidence.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_attendance_own_read ON session_attendance_evaluations;
CREATE POLICY session_attendance_own_read
ON session_attendance_evaluations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM session_enrollments se
    WHERE se.id = session_attendance_evaluations.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_completion_own_read ON session_completion_outcomes;
CREATE POLICY session_completion_own_read
ON session_completion_outcomes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM session_enrollments se
    WHERE se.id = session_completion_outcomes.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

-- --------------------------------------------------------------------------
-- 14. Artifact RLS — owner / organization member read
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS session_artifacts_read ON session_artifacts;
CREATE POLICY session_artifacts_read
ON session_artifacts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM learning_sessions s
    WHERE s.id = session_artifacts.session_id
      AND s.deleted_at IS NULL
      AND (
        s.owner_id = auth.uid()
        OR (
          s.visibility = 'organization'
          AND EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = s.organization_id
              AND om.agent_id = auth.uid()
              AND om.status = 'active'
          )
        )
      )
  )
);

-- --------------------------------------------------------------------------
-- 15. Assignment RLS — read boundary only
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS learning_session_assignments_select_authorized
  ON learning_session_assignments;
CREATE POLICY learning_session_assignments_select_authorized
ON learning_session_assignments
FOR SELECT TO authenticated
USING (
  actor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM learning_sessions s
    WHERE s.id = learning_session_assignments.session_id
      AND s.owner_id = auth.uid()
      AND s.deleted_at IS NULL
  )
);

-- No generic INSERT/UPDATE/DELETE assignment policy.
-- Final mutation authorization must combine:
--   platform permission + explicit HOST/INSTRUCTOR capability
--   + Session/resource scope + audit controls.
--
-- --------------------------------------------------------------------------
-- 16. Permission catalogue gate — intentionally not seeded
-- --------------------------------------------------------------------------
-- Approved namespace: M04 Learning.
-- Candidate Session families from TECH-21 include:
--   Create/View/Update LearningSession
--   Lifecycle LearningSession
--   Create/View SessionEnrollment
--   Access LearningSession
--   Manage SessionProvider
--   View SessionEvidence
--   Review SessionAttendance
--   Evaluate SessionCompletion
--   View SessionArtifact
--   Manage SessionVisibility
--   Host/Instruct LearningSession
--
-- DO NOT INSERT permissions or role_permissions in this candidate.

COMMIT;
