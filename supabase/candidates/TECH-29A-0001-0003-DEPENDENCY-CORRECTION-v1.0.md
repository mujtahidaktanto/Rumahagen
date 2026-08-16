# TECH-29A — M01/M02/M03 Dependency Correction Candidate v1.0

Status: CONTROLLED EXECUTION CANDIDATE — NOT CANONICAL

## Provenance
Source: `supabase/migrations/0001_extensions_helpers.sql`, `0002_m10_rbac_foundation.sql`, `0003_m01_auth.sql` at canonical HEAD `22ca96d5d4438e678505dc3914eb19330b47f09c`.

Runtime evidence: canonical 0001 failed on Supabase Development Environment with `42P01 relation "users" does not exist` before any application object was created.

GitHub tracking: Issue #1 — TECH-29A blocker: canonical 0001 migration has dependency-order defect.

## Correction principle
Preserve canonical source unchanged. Correct execution dependency only. No authorization semantics, role vocabulary, permission vocabulary, RLS intent, table definitions, constraints, or business rules are changed.

## Controlled execution sequence
1. Execute the extension declarations and `set_updated_at()` portion of canonical 0001.
2. Execute canonical 0002 unchanged.
3. Execute the table/constraint/trigger/RLS-enable portion of canonical 0003 without its policies that call authorization helpers.
4. Execute the three authorization helper functions from canonical 0001 unchanged, after `users`, `roles`, `permissions`, and `role_permissions` exist.
5. Execute the policy portion of canonical 0003 unchanged.
6. Continue with canonical 0004–0015 in order.

## Why this correction is required
Canonical 0001 defines SQL-language helpers against tables created by later migrations. PostgreSQL validates SQL function bodies at creation time, so the original order is not executable on an empty database. Canonical 0003 also creates policies that require the helpers, creating a dependency cycle that must be resolved by splitting execution only at the dependency boundary.

## Non-goals
- Do not modify canonical migration files on `main`.
- Do not change role/permission mappings.
- Do not introduce new permission IDs.
- Do not modify Session/AEP4 decisions.
- Do not authorize production execution.

## Acceptance gate
The correction is acceptable only if the resulting objects and definitions are byte/semantic equivalent to the canonical source sections and the subsequent 0004–0015 migrations execute without requiring additional undocumented edits.
