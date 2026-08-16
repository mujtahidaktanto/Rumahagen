-- ============================================================================
-- RUMAHAGEN TECH-25 STATIC VERIFICATION v1.0
-- REVIEW-ONLY — DO NOT USE AS PRODUCTION EXECUTION SCRIPT
-- ============================================================================

-- Object existence
SELECT to_regclass('public.learning_sessions') AS learning_sessions;
SELECT to_regclass('public.session_enrollments') AS session_enrollments;
SELECT to_regclass('public.session_provider_bindings') AS session_provider_bindings;
SELECT to_regclass('public.session_participation_evidence') AS session_participation_evidence;
SELECT to_regclass('public.session_attendance_evaluations') AS session_attendance_evaluations;
SELECT to_regclass('public.session_completion_outcomes') AS session_completion_outcomes;
SELECT to_regclass('public.session_artifacts') AS session_artifacts;
SELECT to_regclass('public.learning_session_assignments') AS learning_session_assignments;

-- Required FK targets
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN (
  'public.learning_sessions'::regclass,
  'public.session_enrollments'::regclass,
  'public.session_provider_bindings'::regclass,
  'public.session_participation_evidence'::regclass,
  'public.session_attendance_evaluations'::regclass,
  'public.session_completion_outcomes'::regclass,
  'public.session_artifacts'::regclass,
  'public.learning_session_assignments'::regclass
)
AND contype = 'f'
ORDER BY conrelid::text, conname;

-- Assignment integrity
SELECT id
FROM learning_session_assignments
WHERE capability NOT IN ('HOST','INSTRUCTOR')
   OR status NOT IN ('ACTIVE','REVOKED')
   OR (status='ACTIVE' AND revoked_at IS NOT NULL)
   OR (status='REVOKED' AND revoked_at IS NULL);

SELECT session_id, actor_id, capability, count(*)
FROM learning_session_assignments
WHERE status='ACTIVE'
GROUP BY session_id, actor_id, capability
HAVING count(*) > 1;

-- Session invariants
SELECT id
FROM learning_sessions
WHERE visibility='organization' AND organization_id IS NULL;

SELECT id
FROM learning_sessions
WHERE end_at IS NOT NULL AND end_at < start_at;

-- Enrollment uniqueness
SELECT session_id, agent_id, count(*)
FROM session_enrollments
WHERE status IN ('pending','active')
GROUP BY session_id, agent_id
HAVING count(*) > 1;

-- Provider uniqueness
SELECT session_id, count(*)
FROM session_provider_bindings
WHERE binding_state IN ('pending','active')
GROUP BY session_id
HAVING count(*) > 1;

-- RLS enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN (
  'learning_sessions',
  'session_enrollments',
  'session_provider_bindings',
  'session_participation_evidence',
  'session_attendance_evaluations',
  'session_completion_outcomes',
  'session_artifacts',
  'learning_session_assignments'
)
ORDER BY relname;

-- Policy inventory
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN (
  'learning_sessions',
  'session_enrollments',
  'session_provider_bindings',
  'session_participation_evidence',
  'session_attendance_evaluations',
  'session_completion_outcomes',
  'session_artifacts',
  'learning_session_assignments'
)
ORDER BY tablename, policyname;

-- Permission seeding must remain absent from this candidate:
-- review the SQL text, not runtime data, for INSERT into permissions/role_permissions.

-- Runtime execution is NOT claimed by this artifact.
