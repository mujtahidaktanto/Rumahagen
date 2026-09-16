# P6 Focused Execution Pack — M02 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M02 Profile/Review v1.1

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B03
**Current semantic source:** WF03-03-02_M02_FULL_SEMANTIC_REBUILD_v1.1.md

## Semantic execution boundary
- Preserve Agent Profile semantic authority.
- Treat PUBLIC/PRIVATE as visibility state, not RBAC scope.
- Preserve explicit Agent opt-in for Public/WhatsApp CTA.
- Preserve Superadmin-only administrative override of another Agent's profile visibility/CTA.
- Preserve review auto-publication with Admin moderation post-publication.

## Explicit Core → Execution WP Routing
- `M02-P4-WP01` — Profile Core: M02-CI-001, M02-CI-002
- `M02-P4-WP02` — Review Lifecycle: M02-CI-006, M02-CI-007, M02-CI-008
- `M02-P4-WP03` — Visibility & CTA: M02-CI-003, M02-CI-004, M02-CI-005
- `M02-P4-WP04` — Profile Presentation & Validation: M02-CI-009, M02-CI-010, M02-CI-011, M02-CI-012, M02-CI-013, M02-CI-014, M02-CI-015, M02-CI-016, M02-CI-017

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.