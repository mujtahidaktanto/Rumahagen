-- ============================================================================
-- RUMAHAGEN TECH-11
-- Migration Specification Draft v1.0
-- STATUS: REVIEW-ONLY / NOT AUTHORIZED FOR PRODUCTION EXECUTION
--
-- Source baseline:
--   Database-Migration-Full-v1_0.sql
--   0002_m10_rbac_foundation.sql
--   0007_m12_organization-FIXED.sql
--   0010_m05_events-FIXED.sql
--
-- Governing:
--   TECH-08: org_id nullable (0..1), no partner relation in MVP,
--            no private audience table in MVP, event_id nullable (0..1)
--   TECH-09/10: additive Session resources only
--
-- IMPORTANT:
--   Exact permission catalogue IDs are intentionally NOT seeded here.
--   Review and reconcile permissions before authorization implementation.
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
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                  UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  provider_key                TEXT NOT NULL,
  external_provider_session_id TEXT,
  binding_state               TEXT NOT NULL DEFAULT 'active'
                              CHECK (binding_state IN ('pending','active','ended','failed','replaced')),
  effective_from              TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
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
  idempotency_key       TEXT NOT NULL,
  observed_at           TIMESTAMPTZ,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at          TIMESTAMPTZ,
  payload_metadata      JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (idempotency_key)
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
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_enrollment_id    UUID NOT NULL REFERENCES session_enrollments(id) ON DELETE CASCADE,
  attendance_evaluation_id UUID REFERENCES session_attendance_evaluations(id) ON DELETE SET NULL,
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
-- 8. Basic integrity checks
-- --------------------------------------------------------------------------
ALTER TABLE learning_sessions
  ADD CONSTRAINT ck_learning_sessions_org_visibility
  CHECK (
    visibility <> 'organization'
    OR organization_id IS NOT NULL
  );

ALTER TABLE learning_sessions
  ADD CONSTRAINT ck_learning_sessions_time_order
  CHECK (
    end_at IS NULL OR end_at >= start_at
  );

-- --------------------------------------------------------------------------
-- 9. RLS skeleton
-- --------------------------------------------------------------------------
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_provider_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_completion_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_artifacts ENABLE ROW LEVEL SECURITY;

-- Public/read policy is intentionally conservative.
-- Final publication/eligibility policy must be reviewed before production.
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
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS learning_sessions_insert_owner ON learning_sessions;

CREATE POLICY learning_sessions_insert_owner
ON learning_sessions FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND (
    visibility <> 'organization'
    OR EXISTS (
      SELECT 1
      FROM organization_members om
      WHERE om.organization_id = learning_sessions.organization_id
        AND om.agent_id = auth.uid()
        AND om.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS learning_sessions_update_owner ON learning_sessions;

CREATE POLICY learning_sessions_update_owner
ON learning_sessions FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
)
WITH CHECK (
  owner_id = auth.uid()
  AND (
    visibility <> 'organization'
    OR EXISTS (
      SELECT 1
      FROM organization_members om
      WHERE om.organization_id = learning_sessions.organization_id
        AND om.agent_id = auth.uid()
        AND om.status = 'active'
    )
  )
);

-- Organization visibility: authoritative membership, not client-supplied proof.
DROP POLICY IF EXISTS learning_sessions_select_org_member ON learning_sessions;

CREATE POLICY learning_sessions_select_org_member
ON learning_sessions FOR SELECT TO authenticated
USING (
  visibility = 'organization'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = learning_sessions.organization_id
      AND om.agent_id = auth.uid()
      AND om.status = 'active'
  )
);

-- Enrollment: learner owns own enrollment.
DROP POLICY IF EXISTS session_enrollments_own ON session_enrollments;

DROP POLICY IF EXISTS session_enrollments_select_own ON session_enrollments;

CREATE POLICY session_enrollments_select_own
ON session_enrollments FOR SELECT TO authenticated
USING (
  agent_id = auth.uid()
);

DROP POLICY IF EXISTS session_enrollments_insert_own ON session_enrollments;

CREATE POLICY session_enrollments_insert_own
ON session_enrollments FOR INSERT TO authenticated
WITH CHECK (
  agent_id = auth.uid()
  AND status = 'pending'
);

-- Lifecycle/status transitions are intentionally NOT granted to the learner.
-- A future reconciled management permission must own activation/completion.

-- Supporting resources: conservative owner/enrollment-context access.
DROP POLICY IF EXISTS session_provider_bindings_owner_read ON session_provider_bindings;

CREATE POLICY session_provider_bindings_owner_read
ON session_provider_bindings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM learning_sessions s
    WHERE s.id = session_provider_bindings.session_id
      AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_evidence_enrollment_read ON session_participation_evidence;

CREATE POLICY session_evidence_enrollment_read
ON session_participation_evidence FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM session_enrollments se
    WHERE se.id = session_participation_evidence.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_attendance_own_read ON session_attendance_evaluations;

CREATE POLICY session_attendance_own_read
ON session_attendance_evaluations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM session_enrollments se
    WHERE se.id = session_attendance_evaluations.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_completion_own_read ON session_completion_outcomes;

CREATE POLICY session_completion_own_read
ON session_completion_outcomes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM session_enrollments se
    WHERE se.id = session_completion_outcomes.session_enrollment_id
      AND se.agent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS session_artifacts_read ON session_artifacts;

CREATE POLICY session_artifacts_read
ON session_artifacts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM learning_sessions s
    WHERE s.id = session_artifacts.session_id
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
-- 10. Permission catalogue gate
-- --------------------------------------------------------------------------
-- DO NOT insert permissions/role_permissions here until the actual catalogue
-- is reconciled and approved. Conceptual families from AEP4 STEP-10 include:
-- learning.session.read
-- learning.session.manage
-- learning.session.lifecycle
-- learning.session.enroll
-- learning.session.enrollment.read
-- learning.session.access
-- learning.session.provider.manage
-- learning.session.evidence.read
-- learning.session.attendance.review
-- learning.session.completion.evaluate
-- learning.session.artifact.read
-- learning.session.capability.read

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (RUN SEPARATELY IN REVIEW ENVIRONMENT)
-- ============================================================================
-- SELECT to_regclass('public.learning_sessions');
-- SELECT to_regclass('public.session_enrollments');
-- SELECT to_regclass('public.session_provider_bindings');
-- SELECT to_regclass('public.session_participation_evidence');
-- SELECT to_regclass('public.session_attendance_evaluations');
-- SELECT to_regclass('public.session_completion_outcomes');
-- SELECT to_regclass('public.session_artifacts');
--
-- SELECT visibility, count(*)
-- FROM learning_sessions
-- GROUP BY visibility;
--
-- SELECT session_id, agent_id, count(*)
-- FROM session_enrollments
-- WHERE status IN ('pending','active')
-- GROUP BY session_id, agent_id
-- HAVING count(*) > 1;
--
-- SELECT id
-- FROM learning_sessions
-- WHERE visibility = 'organization'
--   AND organization_id IS NULL;
--
-- SELECT id
-- FROM learning_sessions
-- WHERE end_at IS NOT NULL AND end_at < start_at;
--
-- ROLLBACK DIRECTION:
-- DROP policies -> child tables -> learning_sessions, in reverse dependency order.
-- Do not touch M04/M05/Organization existing data.
