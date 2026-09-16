# STEP06 v1.1 — STEP07 DEPENDENCY HANDOFF

## Upstream authority
- Governance: M01–M15 RECON → CORE v1.3 Integration Governance v1.3.
- Core: immutable Core v1.3 source pack.
- STEP04: corrected synchronization matrix v1.2.
- STEP05: final semantic conflict resolution v1.1.
- STEP06 v1.0: historical predecessor retained for provenance.

## Current semantic model
`CORE VALID DETAIL + VALID Mxx DELTA + APPROVED CONFLICT UPDATE`

## STEP07 must preserve
1. Core detail not restated by Mxx.
2. Mxx detail that is valid and additive.
3. Granular rule updates only.
4. Lifecycle states/transitions not explicitly superseded.
5. One canonical representation for semantic duplicates.
6. STEP05 authority for the seven resolved conflicts.
7. M10 authorization authority.
8. M11 discovery/measurement authority.
9. M14 commercial/payment/entitlement/quota authority.
10. M15 qualification/awarding authority.
11. M04 Learning authority.
12. M08 projection/notification boundary.

## Controlled downstream items
CONTROLLED findings remain downstream physical/API/RLS/runtime work. They are not semantic proof and must not be promoted prematurely.

## Re-entry condition
If STEP07 discovers that the STEP06 semantic candidate cannot preserve valid Core detail, creates duplicate canonical entities, loses lifecycle state/transition, or lacks deterministic provenance, STEP06 must be RE-OPENED and rebuilt rather than patched.
