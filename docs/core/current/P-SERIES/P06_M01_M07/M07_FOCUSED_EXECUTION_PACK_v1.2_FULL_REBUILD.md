# P6 Focused Execution Pack — M07 v1.2 FULL REBUILD
**Correction:** explicit Core finding → P4 WP routing added during P8 audit re-entry.

# P6 Focused Execution Pack — M07 DBR v1.1

**Execution mode:** full-version focused execution specification; not patch/append.
**P6 batch:** B03
**Current semantic source:** 00_M07_FULL_REBUILD_CONTROLLED_v1.1.md

## Semantic execution boundary
- Preserve DBR as semantic authority.
- Preserve DBR/bank configuration authority in M07.
- M09 configuration must not become generic DBR authority.
- M10 remains authorization authority; physical permission IDs/RLS/runtime remain downstream evidence-gated.

## Explicit Core → Execution WP Routing
- `M07-P4-WP01` — DBR Core: M07-IA-001, M07-IA-002, M07-IA-003, M07-IA-012, M07-IA-013, M07-IA-018, M07-IA-019
- `M07-P4-WP02` — DBR Configuration: M07-IA-004, M07-IA-006, M07-IA-007, M07-IA-008
- `M07-P4-WP03` — Decision Output/History: M07-IA-009, M07-IA-010, M07-IA-011
- `M07-P4-WP04` — Validation/Handoff: M07-IA-005, M07-IA-014, M07-IA-015, M07-IA-016, M07-IA-017

## Validation
- All Core findings assigned exactly once to an existing P4 WP.
- P3 obligations remain routed; classification preserved.
- Evidence-gated physical/API/RLS/runtime status remains controlled.
- Core v1.3 is not modified.