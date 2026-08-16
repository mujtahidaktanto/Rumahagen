-- ============================================================================
-- RUMAHAGEN TECH-24
-- Session Assignment Migration & RLS Candidate
-- STATUS: REVIEW-ONLY / NOT AUTHORIZED FOR PRODUCTION EXECUTION
--
-- Source-grounded:
--   TECH-23 Option A: resource-level Session assignment
--   TECH-10/12/13: UUID + users.id + TIMESTAMPTZ + RLS conventions
--   MADCR-053: Capability + Permission + Scope
--   MADCR-054: HOST != INSTRUCTOR; explicit dual capability
--
-- IMPORTANT:
--   1) This migration adds ONLY the resource-level assignment structure.
--   2) It does NOT seed permissions or role_permissions.
--   3) Final authorization mutation policies remain controlled until
--      Session permission IDs / role mapping are formally executable.
--   4) No PostgreSQL execution is claimed by this artifact.
-- ============================================================================

BEGIN;

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

ALTER TABLE learning_session_assignments ENABLE ROW LEVEL SECURITY;

-- Conservative read boundary:
--   assigned actor can see their own assignment;
--   Session owner can see assignments for Sessions they own.
DROP POLICY IF EXISTS learning_session_assignments_select_authorized
  ON learning_session_assignments;

CREATE POLICY learning_session_assignments_select_authorized
ON learning_session_assignments
FOR SELECT TO authenticated
USING (
  actor_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM learning_sessions s
    WHERE s.id = learning_session_assignments.session_id
      AND s.owner_id = auth.uid()
      AND s.deleted_at IS NULL
  )
);

-- No generic INSERT/UPDATE/DELETE policy is created here.
-- Assignment mutation must be connected to the final reconciled
-- Session capability/permission path and audited server-side.

COMMIT;
