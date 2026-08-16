# TECH-29A — M01/M02/M03 Dependency Correction Candidate v1.0

Status: CONTROLLED EXECUTION CANDIDATE — NOT CANONICAL

## Provenance
Source: `supabase/migrations/0001_extensions_helpers.sql`, `0002_m10_rbac_foundation.sql`, `0003_m01_auth.sql` at canonical HEAD `22ca96d5d4438e678505dc3914eb19330b47f09c`.

Runtime evidence: canonical 0001 failed on Supabase Development Environment with `42P01 relation "users" does not exist` before any application object was created.

GitHub tracking: Issue #1 — TECH-29A blocker: canonical 0001 migration has dependency-order defect.

## Correction principle
Preserve canonical source unchanged. Correct execution dependency only. No authorization semantics, role vocabulary, permission vocabulary, RLS intent, table definitions, constraints, or business rules are changed.

## Controlled execution sequence
1. Execute only the extension declarations and `set_updated_at()` portion of canonical 0001.
2. Execute the table/seed/RLS-enable portion of canonical 0002 without its policies that call authorization helpers.
3. Execute the table/constraint/trigger/RLS-enable portion of canonical 0003 without its policies that call authorization helpers.
4. Execute the three authorization helper functions from canonical 0001 unchanged, after `users`, `roles`, `permissions`, and `role_permissions` exist.
5. Execute the policy portion of canonical 0002 unchanged.
6. Execute the policy portion of canonical 0003 unchanged.
7. Continue with canonical 0004–0015 in order.

## Why this correction is required
There is a dependency cycle across the first three canonical migrations: 0001 helper functions reference tables created by 0002/0003; 0002 RLS policies call those helpers; and 0003 RLS policies also call those helpers. PostgreSQL therefore cannot execute the three files literally on an empty database. The correction splits only the dependency-sensitive sections while preserving their canonical definitions.

## Non-goals
- Do not modify canonical migration files on `main`.
- Do not change role/permission mappings.
- Do not introduce new permission IDs.
- Do not modify Session/AEP4 decisions.
- Do not authorize production execution.

## Acceptance gate
The correction is acceptable only if the resulting objects and definitions are semantically equivalent to the canonical source sections and canonical 0004–0015 execute without additional undocumented edits.
