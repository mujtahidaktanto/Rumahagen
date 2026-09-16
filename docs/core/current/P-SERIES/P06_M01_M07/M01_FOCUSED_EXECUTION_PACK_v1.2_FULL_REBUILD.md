# P6 Focused Execution Pack — M01 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M01 Identity/Auth v1.1

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B01
**Current semantic source:** WF03-03-01_M01_FULL_SEMANTIC_REBUILD_v1.1.md

## Semantic execution boundary
- Preserve M01 identity/authentication authority.
- Reconcile OTP-successful activation so it does not default to Pending Review/approval.
- Preserve private verification-document handling and separation of Create/View/Review.
- Preserve KTP as eligibility/requirement, not RBAC permission.
- Carry Conditional KTP deferred path into executable validation.

## Explicit Core → Execution WP Routing
- `M01-P4-WP01` — Identity/Auth Core: M01-CI-001, M01-CI-002
- `M01-P4-WP02` — Activation & Verification: M01-CI-003, M01-CI-004, M01-CI-005, M01-CI-006, M01-CI-007, M01-CI-008, M01-CI-009
- `M01-P4-WP03` — Session/Recovery: No Core finding directly assigned; WP remains required by P4 and is retained.
- `M01-P4-WP04` — Identity Handoff & Validation: M01-CI-010, M01-CI-011, M01-CI-012, M01-CI-013, M01-CI-014

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.