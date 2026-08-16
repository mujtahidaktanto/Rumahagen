-- ============================================================================
-- RUMAHAGEN TECH-24
-- Static Verification / Review Queries
-- STATUS: REVIEW-ONLY / DO NOT CLAIM LIVE RESULTS
-- ============================================================================

-- V01: table exists
SELECT to_regclass('public.learning_session_assignments') AS assignment_table;

-- V02: expected columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='learning_session_assignments'
ORDER BY ordinal_position;

-- V03: FKs
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name=kcu.constraint_name
 AND tc.table_schema=kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name=ccu.constraint_name
 AND tc.table_schema=ccu.table_schema
WHERE tc.table_schema='public'
  AND tc.table_name='learning_session_assignments'
  AND tc.constraint_type='FOREIGN KEY';

-- V04: RLS enabled
SELECT relrowsecurity
FROM pg_class
WHERE oid='public.learning_session_assignments'::regclass;

-- V05: policies
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename='learning_session_assignments';

-- V06: indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public'
  AND tablename='learning_session_assignments';

-- V07: duplicate active assignment detector
SELECT session_id, actor_id, capability, COUNT(*) AS active_count
FROM learning_session_assignments
WHERE status='ACTIVE'
GROUP BY session_id, actor_id, capability
HAVING COUNT(*) > 1;

-- V08: invalid capability/status detector
SELECT *
FROM learning_session_assignments
WHERE capability NOT IN ('HOST','INSTRUCTOR')
   OR status NOT IN ('ACTIVE','REVOKED');

-- V09: invalid lifecycle timestamp detector
SELECT *
FROM learning_session_assignments
WHERE (status='ACTIVE' AND revoked_at IS NOT NULL)
   OR (status='REVOKED' AND revoked_at IS NULL);

-- V10: dual capability is allowed; this query is informational.
SELECT session_id, actor_id,
       COUNT(*) FILTER (WHERE capability='HOST' AND status='ACTIVE') AS active_host,
       COUNT(*) FILTER (WHERE capability='INSTRUCTOR' AND status='ACTIVE') AS active_instructor
FROM learning_session_assignments
GROUP BY session_id, actor_id
HAVING COUNT(*) FILTER (WHERE capability='HOST' AND status='ACTIVE') > 0
   AND COUNT(*) FILTER (WHERE capability='INSTRUCTOR' AND status='ACTIVE') > 0;

-- V11: no Session permission seeding is expected in this candidate.
-- Manual/source verification must confirm permissions and role_permissions
-- were not modified by this migration.
