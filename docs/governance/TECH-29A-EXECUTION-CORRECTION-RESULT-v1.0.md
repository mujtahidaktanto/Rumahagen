# TECH-29A — Dependency Correction Execution Result v1.0

## Gate result
**M01–M13 baseline execution: PASS WITH CONTROLLED EXECUTION OVERLAY**

## Runtime target
Supabase `RumahAgen project` — Development Environment, project ref `bjbczvhpikeyoganbyla`.

## Evidence
- Canonical 0001 literal execution failed with `42P01 relation "users" does not exist` and left no application objects.
- Controlled correction then executed the dependency-sensitive portions of 0001/0002/0003 without changing their definitions or authorization semantics.
- Canonical 0004–0015 executed successfully in order.
- Migration history contains the controlled correction entries followed by canonical 0004–0015.
- `public` contains 44 application tables after M01–M13.
- All 44 application tables have RLS enabled.
- 92 public policies are present.
- Seven canonical RBAC roles exist, including protected `superadmin`.
- Canonical authorization helper functions exist.

## Controlled correction sequence actually used
1. 0001 extensions + `set_updated_at()` only.
2. 0002 RBAC tables/seed/RLS-enable only.
3. 0003 users/verification tables, constraints, trigger, RLS-enable only.
4. 0001 authorization helper functions.
5. 0002 RBAC policies.
6. 0003 Auth policies.
7. Canonical 0004–0015 unchanged at semantic/source level.

## Important discovery
The dependency cycle is broader than the initial 0001 failure: canonical 0002 policies and canonical 0003 policies also call the authorization helpers. Therefore the correction had to split policy sections from 0002 and 0003 as well.

## Non-goals preserved
- No canonical migration on `main` was changed.
- No production environment was touched.
- No authorization decision was reopened.
- No Session/AEP4 decision was changed.
- No production seed or real user data was introduced.

## Next gate
Proceed to frozen TECH-25 Session candidate validation before any Session DDL. TECH-28 authorization seed remains a separate controlled step after Session schema compatibility is verified.
