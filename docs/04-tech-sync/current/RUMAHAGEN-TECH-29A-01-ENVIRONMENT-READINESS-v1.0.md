# RUMAHAGEN — TECH-29A-01
## Environment & Access Readiness

**Version:** 1.0  
**Status:** PASS WITH CONTROLLED RESIDUALS — READY FOR CANDIDATE FREEZE  
**Execution track:** TECH-29A — Supabase Development Environment Preparation  
**Repository baseline:** `main` @ `22ca96d5d4438e678505dc3914eb19330b47f09c`  
**Working branch:** `tech-29a-environment-readiness`

---

## 1. Purpose

This artifact records the first controlled TECH-29A gate. It verifies that the existing RumahAgen Supabase project can serve as the project's **Development Environment** for controlled runtime verification, while preserving the prohibition on production execution/authorization.

This artifact does not authorize migration execution by itself and does not claim TECH-29 runtime PASS.

## 2. Environment Classification

| Item | Result |
|---|---|
| Supabase project | `RumahAgen project` |
| Project ref | `bjbczvhpikeyoganbyla` |
| Region | `ap-northeast-1` |
| Status | `ACTIVE_HEALTHY` |
| PostgreSQL | `17.6` |
| Environment classification | **DEVELOPMENT** |
| Production authorization | **NOT AUTHORIZED** |
| Application schema state at checkpoint | **EMPTY** |
| Applied project migrations | **0** |
| Runtime accessibility | **PASS** |

The Development classification follows the Owner's explicit operating decision: the Supabase `main` project is Development, not Production.

## 3. Database Baseline Observation

The runtime connection was verified successfully against PostgreSQL 17.6.

At the checkpoint:

- `public` contains **0 tables**.
- `supabase_migrations.schema_migrations` contains **0 applied project migrations**.
- Supabase-managed schemas remain present (`auth`, `storage`, `realtime`, etc.).
- Therefore the application database has not yet received the RumahAgen M01–M13 migration baseline.

This matches the intended TECH-29 starting condition: provisioned environment, but no application migration execution yet.

## 4. Repository / Candidate Structure Verified

The canonical repository contains:

- `supabase/migrations/` — selected corrected M01–M13 baseline.
- `supabase/candidates/authorization/` — TECH-26/27/28 authorization candidates.
- `supabase/candidates/session/` — TECH-24/25 Session migration/RLS candidates.
- `supabase/seed/` — superadmin bootstrap material.

The repository control artifact explicitly states that candidate SQL must not be promoted/executed automatically.

## 5. Frozen Candidate Inputs Identified

### 5.1 Legacy migration baseline

The repository's canonical migration directory contains the ordered M01–M13 migration set. The uploaded corpus identifies corrected `-FIXED` source artifacts for the historically remediated M12/M03/M04/M05 migrations; the current repository's canonical files must be treated by content and SHA, not filename suffix alone.

Verified examples:

- `0001_extensions_helpers.sql`
- `0002_m10_rbac_foundation.sql`
- `0003_m01_auth.sql`
- `0004_region_reference.sql`
- `0005_m02_agent_profile.sql`
- `0006_m06_developer.sql`
- `0007_m12_organization.sql`
- `0008_m03_listing.sql`
- `0009_m04_learning_center.sql`
- `0010_m05_events.sql`
- `0011_m07_dbr.sql`
- `0012_m08_notifications.sql`
- `0013_m09_admin.sql`

The exact remaining migration filenames must be frozen from the live repository directory before execution rather than inferred from historical documentation.

### 5.2 Authorization seed

Frozen candidate:

`supabase/candidates/authorization/TECH-28-FINAL-AUTHORIZATION-SEED-CANDIDATE-v1.0.sql`

Its status is frozen for review/non-production execution only. It creates the M04 Session permission catalogue and role mappings, while keeping resource-level HOST/INSTRUCTOR capability separate from `role_permissions`.

### 5.3 Session/RLS candidate

Primary consolidated candidate:

`supabase/candidates/session/TECH-25-CONSOLIDATED-SESSION-MIGRATION-CANDIDATE-v1.0.sql`

It incorporates the resource-level `learning_session_assignments` structure and conservative RLS boundary. The standalone TECH-24 candidate remains source evidence, not an additional migration to blindly execute after TECH-25.

## 6. Environment Security Observation

Supabase Security Advisor currently reports a warning for a pre-existing `public.rls_auto_enable()` `SECURITY DEFINER` event-trigger function executable by both `anon` and `authenticated` roles.

This function is **not part of the canonical RumahAgen `0001_extensions_helpers.sql` migration**, which contains only the documented RumahAgen helper functions.

Disposition:

- Do **not** silently modify it during TECH-29A.
- Record as an environment residual.
- Determine provenance before any remediation.
- It must not be treated as evidence that the RumahAgen migration baseline itself is faulty.

## 7. Gate Result

**TECH-29A-01 = PASS WITH CONTROLLED RESIDUALS.**

The Supabase `main` project is reachable, healthy, PostgreSQL-capable, and empty at the application-schema level. It is suitable to continue controlled Development Environment preparation.

The environment is **not Production**, and this gate does not authorize production migration or production traffic.

## 8. Next Controlled Action

Proceed to **TECH-29A-02 — Canonical Candidate Freeze & Provenance Reconciliation**.

Before any DDL execution, freeze:

1. exact M01–M13 migration file set and SHA;
2. exact authorization seed candidate and SHA;
3. exact Session candidate and SHA;
4. dependency/execution order;
5. controlled fixture strategy;
6. rollback/reset strategy for the Development Environment.

No migration execution should occur until this freeze is complete.

## 9. Evidence Basis

- GitHub `mujtahidaktanto/Rumahagen` `main` @ `22ca96d5d4438e678505dc3914eb19330b47f09c`.
- `docs/04-tech-sync/current/TECH-29-REPOSITORY-STAGING-CONTROL.md`.
- `docs/04-tech-sync/current/RUMAHAGEN-TECH-29-...` runtime gate artifacts.
- `supabase/migrations/` canonical repository content.
- `supabase/candidates/authorization/TECH-28-FINAL-AUTHORIZATION-SEED-CANDIDATE-v1.0.sql`.
- `supabase/candidates/session/TECH-25-CONSOLIDATED-SESSION-MIGRATION-CANDIDATE-v1.0.sql`.
- Live Supabase project metadata and PostgreSQL runtime checks performed during TECH-29A-01.
