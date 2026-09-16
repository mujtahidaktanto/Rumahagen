# P6 Focused Execution Pack — M03 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M03 Listing/Lifecycle/Refresh v1.3

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B04
**Current semantic source:** 00_M03_REBUILD_CONTROL_REPORT_v1.3.md

## Semantic execution boundary
- Preserve M03 Listing/Refresh action authority.
- Direct Publish remains the normal publication path; no Pending Review/Admin publication gate.
- Preserve Suspended as enforcement/ethics state.
- Sold/Rented are excluded from public search but retained in historical Agent-profile counts.
- Preserve owner-only ordinary Listing Update and four post-first-publish field locks.
- Refresh allowance is consumed from M14; M03 owns Refresh action semantics.
- Preserve configurable default 5 successful Refreshes/day, Asia/Jakarta reset, no carry-forward, one successful Refresh per Listing/day, same-District repositioning, server-authoritative ordering, and failed-refresh no-consumption.

## Explicit Core → Execution WP Routing
- `M03-P4-WP01` — Listing Core/Lifecycle: M03-CI-001, M03-CI-002, M03-CI-003, M03-CI-004
- `M03-P4-WP02` — Publish & Field Locks: M03-CI-005
- `M03-P4-WP03` — Refresh Action & Allowance Contract: M03-CI-006, M03-CI-007, M03-CI-008, M03-CI-009, M03-CI-010, M03-CI-011, M03-CI-012, M03-CI-013, M03-CI-018, M03-CI-020
- `M03-P4-WP04` — Search/Media/Validation: M03-CI-014, M03-CI-015, M03-CI-016, M03-CI-017, M03-CI-019, M03-CI-021

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.