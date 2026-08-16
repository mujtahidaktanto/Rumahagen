# RUMAHAGEN — TECH-29A-02
## Canonical Candidate Freeze & Provenance Reconciliation

**Version:** 1.0  
**Status:** FROZEN FOR DEVELOPMENT-RUNTIME REVIEW  
**Base:** `main` @ `22ca96d5d4438e678505dc3914eb19330b47f09c`  
**Preparation branch:** `tech-29a-environment-readiness`

## 1. Scope

This artifact freezes the exact repository-side candidates to be used for the next controlled Development Environment execution planning. It does **not** authorize execution yet.

## 2. Canonical M01–M13 Migration Set

The live `supabase/migrations/` tree contains exactly 15 ordered files:

| # | File | Git blob SHA |
|---:|---|---|
| 0001 | `0001_extensions_helpers.sql` | `d8ce8463ab001786602a3b78857a06eb755182f7` |
| 0002 | `0002_m10_rbac_foundation.sql` | `42cedbc5c63a377547388e587c0273ae94167613` |
| 0003 | `0003_m01_auth.sql` | `66c2dab10e0d7ebf49b38e4a2057266c96b9cd0a` |
| 0004 | `0004_region_reference.sql` | `8ee263e37877e8e554ed1be33f9c9f386edbe439` |
| 0005 | `0005_m02_agent_profile.sql` | `d25ca6b3c3ac8e8f5239dfdb7ffb97d3e1476281` |
| 0006 | `0006_m06_developer.sql` | `cb6997d7c09f357c790662ff6e6ad4082c326a6d` |
| 0007 | `0007_m12_organization.sql` | `20ec42ef0151eb4e1d284358ca30157aaa06328c` |
| 0008 | `0008_m03_listing.sql` | `4e1a2f8310bbca1be6e72db176b8618c970b0c87` |
| 0009 | `0009_m04_learning_center.sql` | `46a3db7fbe1293797008886778238f7d4f6d7bb2` |
| 0010 | `0010_m05_events.sql` | `975a518ded3874957491e53d7d4320484e076192` |
| 0011 | `0011_m07_dbr.sql` | `dede0c671c73283589713ad36d1e09c764aee5fd` |
| 0012 | `0012_m08_notifications.sql` | `d9485350ecbffd0e4876c366480643f125282a4c` |
| 0013 | `0013_m09_admin.sql` | `af8fc148a8afb49e038c20b96d7c7e16dcf4528b` |
| 0014 | `0014_m11_seo.sql` | `4e07b96003a1a3725e1af29fb3b0f07b08fe7948` |
| 0015 | `0015_m13_ai_assistant.sql` | `d8699fca9860f5021c64865ce9469a42e1e18da3` |

## 3. Corrected-Migration Provenance

The uploaded project corpus identifies corrected execution candidates for the historically remediated M12/M03/M04/M05 migrations:

- `0007_m12_organization-FIXED.sql` — SHA-256 `fa38d807c24e676b0c898bcec5a8dc7832c92857fe5a00f515d60f6c71b42fc7`
- `0008_m03_listing-FIXED.sql` — SHA-256 `54a0fca967ad9372d57bb3be1e28718e4ba98458cc5a88f74c59654b01b4c384`
- `0009_m04_learning_center-FIXED.sql` — SHA-256 `fca14d8c07ac0555de5717cd6c12a6fd2471d6a367f17f681680d520aedfc553`
- `0010_m05_events-FIXED.sql` — SHA-256 `60187c6d78a1780a8af09213c7ddab0c7182fc380ce574db28124274dcd52dc3`

The current GitHub canonical files use the numeric canonical filenames without the `-FIXED` suffix. Their content must be treated as canonical based on content/provenance, not filename alone. For example, the current `0007_m12_organization.sql` contains the remediated conditional `org_invitations_insert` membership check and is the same size as the corpus FIXED artifact.

## 4. Authorization Candidate

Frozen review candidate:

`supabase/candidates/authorization/TECH-28-FINAL-AUTHORIZATION-SEED-CANDIDATE-v1.0.sql`

Git blob SHA: `1db83270b8c461d15e9ea8eea8df928e05bef6bd`

The candidate is explicitly non-production. It seeds M04 Session permission rows and role mappings while retaining resource-level HOST/INSTRUCTOR capability as a separate layer.

## 5. Session Candidate

Primary consolidated candidate:

`supabase/candidates/session/TECH-25-CONSOLIDATED-SESSION-MIGRATION-CANDIDATE-v1.0.sql`

Git blob SHA: `3667d3df6cf05da44eaf7630762a580afe2f54ea`

Supporting source candidate:

`supabase/candidates/session/TECH-24-SESSION-ASSIGNMENT-MIGRATION-RLS-CANDIDATE-v1.0.sql`

Git blob SHA: `c3fc5a7b8ce89bd906be6278a09715faa72a5741`

TECH-24 is source evidence incorporated by TECH-25; it must not be blindly executed as a second independent migration after TECH-25.

## 6. Execution Order — PRELIMINARY, NOT YET EXECUTED

1. M01–M13 canonical migration set, in numeric order.
2. Verify structural baseline and migration ledger.
3. Apply TECH-25 consolidated Session candidate as a controlled separate migration.
4. Apply TECH-28 authorization seed only after the Session structures exist and static preconditions are confirmed.
5. Create controlled test fixtures.
6. Execute runtime test families A–H.

This order remains subject to the final TECH-29A execution-plan gate and must not be treated as an authorization to run.

## 7. Important Residual — Pre-existing Supabase Function

The Development Environment currently contains `public.rls_auto_enable()` as a SECURITY DEFINER function and an enabled `ensure_rls` event trigger. Security Advisor reports that the function is executable by `anon` and `authenticated`.

This function is **not present in canonical RumahAgen migration 0001**. Therefore it is classified as an environment provenance residual, not a RumahAgen migration artifact.

No remediation is performed in this freeze step.

## 8. Gate Result

**TECH-29A-02 = PASS WITH CONTROLLED RESIDUALS — CANDIDATES FROZEN.**

The next step is **TECH-29A-03 — Controlled Execution Plan & Fixture Design**.

No SQL migration has been executed against the Development Environment during TECH-29A-01/02.
