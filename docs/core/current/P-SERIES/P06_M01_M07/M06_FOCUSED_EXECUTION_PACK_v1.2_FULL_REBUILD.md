# P6 Focused Execution Pack — M06 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M06 Developer/Project/Marketing Kit/Claim v1.5

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B03
**Current semantic source:** 07_M06_FULL_REBUILD_CONTROLLED_v1.5.md

## Semantic execution boundary
- Preserve Developer/Project/Marketing Kit/Claim authority.
- Add semantic Developer company_logo and free-text “Tentang Developer”.
- Preserve Project meta_title/meta_description and do not introduce Project description as substitute.
- Preserve Project Media = photo/video and Marketing Kit as separate semantic resource.
- Preserve Marketing Kit permission boundary from current M06 authority.
- Approved Claim may seed/create an Agent-owned M03 Personal Listing; M03 retains Listing lifecycle authority.

## Explicit Core → Execution WP Routing
- `M06-P4-WP01` — Developer/Project Core: M06-CI-001, M06-CI-002, M06-CI-003, M06-CI-004, M06-CI-005, M06-CI-006, M06-CI-017, M06-CI-018
- `M06-P4-WP02` — Project Media & SEO: M06-CI-007, M06-CI-015
- `M06-P4-WP03` — Marketing Kit: M06-CI-008, M06-CI-009
- `M06-P4-WP04` — Claim → Listing Handoff: M06-CI-010, M06-CI-011, M06-CI-012, M06-CI-013, M06-CI-014, M06-CI-016

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.