# P6 Focused Execution Pack — M05 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M05 Event/Registration v1.3

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B04
**Current semantic source:** 00_M05_FULL_REBUILD_CONTROL_REPORT_v1.3.md

## Semantic execution boundary
- Preserve Event Registration as distinct from Session Enrollment.
- Preserve waitlist, late-registration, cancellation, and attendance semantics.
- Preserve default auto-confirm with Event Owner override to closed/manual approval.
- Preserve guest registration/notification behavior and provider-specific configuration boundary.
- Keep universal iframe behavior controlled/provider-dependent; do not invent a universal iframe field.
- Preserve provider ordering: LiveKit primary, Zoom fallback 1, Daily fallback 2, Google Meet external.

## Explicit Core → Execution WP Routing
- `M05-P4-WP01` — Event Core: M05-CI-001
- `M05-P4-WP02` — Registration/Waitlist/Attendance: M05-CI-002, M05-CI-003, M05-CI-004, M05-CI-005, M05-CI-006, M05-CI-007, M05-CI-008
- `M05-P4-WP03` — Calendar/Session Boundary: M05-CI-009
- `M05-P4-WP04` — Provider/Validation: M05-CI-010

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.