# RUMAHAGEN — TECH-29A-03 Controlled Execution Plan v1.0

## Status
**APPROVED FOR CONTROLLED DEVELOPMENT EXECUTION**

## Scope
This plan governs the first physical schema execution in the designated Supabase Development Environment. It does not authorize production execution.

## Canonical precedence
1. Explicit Owner/governance decisions.
2. Latest formal D6 synchronized baseline.
3. Latest downstream TECH synchronization artifacts.
4. Corrected canonical migrations selected by reconciliation.
5. Older material is history only unless explicitly superseded.

## Execution order
1. `0001_extensions_helpers.sql`
2. `0002_m10_rbac_foundation.sql`
3. `0003_m01_auth.sql`
4. `0004_region_reference.sql`
5. `0005_m02_agent_profile.sql`
6. `0006_m06_developer.sql`
7. `0007_m12_organization.sql`
8. `0008_m03_listing.sql`
9. `0009_m04_learning_center.sql`
10. `0010_m05_events.sql`
11. `0011_m07_dbr.sql`
12. `0012_m08_notifications.sql`
13. `0013_m09_admin.sql`
14. `0014_m11_seo.sql`
15. `0015_m13_ai_assistant.sql`
16. TECH-25 consolidated Learning Session candidate — **candidate only; execute only after legacy baseline validation**.
17. TECH-28 authorization candidate/seed — **candidate only; execute only after schema and permission catalogue validation**.

## Important dependency controls
- Do not execute TECH-25 before validating the M04 Learning baseline and its references to users/courses/events/organizations.
- Do not seed Session permissions before validating the canonical permission namespace and existing M04 permissions.
- Do not run duplicate TECH-24 and TECH-25 migrations. TECH-25 is the consolidated candidate.
- Do not create Partner relation/private-audience structures unless an explicit approved decision authorizes them.
- Do not bypass RLS or provider authorization boundaries.

## Preflight
Before DDL:
- confirm zero RumahAgen application migrations are applied;
- confirm no canonical application tables exist;
- confirm target is Development, not Production;
- capture Security Advisor baseline;
- preserve the `rls_auto_enable` warning as environment evidence; do not silently alter it in this execution.

## Post-migration validation
For every migration:
- verify table existence;
- verify expected primary/foreign keys;
- verify RLS enabled where specified;
- verify expected policies;
- verify no unexpected public/authenticated write policies;
- verify migration count/order;
- stop on first structural failure.

## Fixture strategy
No real user or production business data is required for structural validation. Runtime fixtures must use isolated synthetic records only. Superadmin bootstrap is handled separately through the documented CLI flow and must not be embedded in the schema migration.

## Stop conditions
Immediately stop and report if:
- any migration fails;
- an expected dependency is missing;
- a migration attempts to overwrite an existing unrelated object;
- RLS/policy state materially differs from the canonical source;
- a candidate requires an unresolved governance decision;
- environment identity cannot be confirmed as Development.

## Current decision
Owner explicitly authorized controlled execution on the Development Supabase environment on 2026-08-16. Production remains out of scope.
