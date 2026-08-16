# ADR-[TBD, pending CR-06 resolution — provisional reference: MADCR-046] — Certificate/Credential (M04) vs Title (M15) Boundary

**Status:** DRAFT

**Decision Owner:** TBD / per RumahAgen governance (Architecture Review Board)

**Date:** 2026-08-15 (draft prepared)

---

## Context

RumahAgen's existing M04 Learning Center module contains a `certificates` table (migration `0009_m04_learning_center`), explicitly retained as foundation for the broader Learning domain (CAIA §5.2: *"The existing: courses; course lessons; quizzes; enrollments; quiz attempts; certificates — remain useful. They should become the foundation of the broader Learning domain rather than being discarded."*). Separately, the proposed M15 Title module (see companion ADR draft, `MADCR-036`) introduces a new Award Instance concept. The relationship between these two — whether they are ever the same record, and where the boundary lies — is undecided.

## Problem Statement

Without an explicit boundary, implementation could accidentally conflate `certificates` with Title Award Instances, corrupting both models. CAIA explicitly warns: *"The current `certificates` table must not automatically become the new Title Award Instance. Certificate/Credential and Title/Award must remain separate"* (§6.3).

## Business Drivers

- `certificates` is explicitly to be retained, not discarded or replaced (CAIA §5.2).
- Title may relate to, but is not defined as identical to, a Credential (Title Rule 013).

## Canonical Inputs

- `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` (CAIA) — sole originating source
- `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` — independent Level-4 corroboration

## Business Rules

| Rule | Text (as sourced) | Status |
|---|---|---|
| Title Rule 013 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." | Final |

**Business Rule Source Gap (M04 side):** no Learning Center-specific Business Rule was found explicitly addressing Title interaction — CAIA's own prohibition is the operative authority.

## AEP Inputs

- **CAIA-001** §6.3: *"CRITICAL — ERD, API, PRD, User Flow, RBAC, System Architecture and test strategy all change. The current `certificates` table must not automatically become the new Title Award Instance. Certificate/Credential and Title/Award must remain separate."*
- **CAIA-001** §28, `CAIA-ADR-010`: "Certificate/Credential vs Title separation."
- **CAIA-001** §29, Gate 1 item 3: "Certificate/Credential vs Title boundary."
- **Gate v1.3** §4.3: lists "Certificate/Credential vs Title" among remaining open ADR questions — independent corroboration from a Level-4-equivalent document.

## Existing Architecture

M04 Learning Center `certificates` table (existing, approved, migration `0009`) — confirmed to have no Title-related columns or foreign keys by direct ERD/migration inspection this cycle. M15 Title (proposed, see `MADCR-036` companion draft).

## Existing ADR Dependencies

None — no existing ADR (either numbering scheme) addresses this boundary.

## Decision Drivers

- `certificates` must remain retained and functional as-is for M04.
- Title/Award must not silently absorb or be absorbed by `certificates`.

## Options Considered

**No formal A-vs-B options were found in any authoritative source.** CAIA states a prohibition ("must not automatically become") and a requirement ("must remain separate") but does not present named alternative technical approaches (e.g., no source offers "shared table with type discriminator" vs "fully separate tables" as explicit choices). This ADR records a **confirmation of a sourced prohibition/requirement**, not a selection among invented alternatives.

## Decision

**PROPOSED FOR ADOPTION (DRAFT — pending Board confirmation):** `certificates` (M04) and Title Award Instance (M15) SHALL remain separate, distinct records/entities. `certificates` SHALL NOT be automatically converted, migrated, or repurposed into a Title Award Instance. The exact technical mechanism for any future relationship (e.g., an optional reference from a Title Award Instance to a supporting Certificate, if ever required) is NOT decided by this ADR and is deferred to future, evidence-based design work once `MADCR-036`'s ERD-shaping decisions are approved.

**This Decision is NOT APPROVED.** It reflects the sourced requirement as-stated, subject to Board review.

## Non-Goals

This ADR does not decide the internal Title Definition/Award Instance model (`MADCR-036`, companion draft), any RBAC/permission taxonomy, or any specific technical mechanism for cross-referencing `certificates` and Title records if such a reference is later deemed necessary.

## Consequences

Adopting this boundary is the most extensively-documented-impact candidate in Batch 1 — CAIA §6.3 explicitly names ERD, API, RBAC, PRD, User Flow, System Architecture, and test strategy as all CRITICALLY affected. Declining or delaying this decision blocks Title ERD work that depends on a clear M04/M15 boundary.

## Security / RBAC / RLS Impact

**DIRECT** per CAIA §6.3's explicit enumeration — exact impact not detailed further in source; deferred to future RBAC design once ERD is authorized.

## Data Model Impact

**DIRECT and CRITICAL** — this is fundamentally a data-boundary decision.

## API Impact

**DIRECT** per CAIA §6.3's explicit enumeration.

## PRD / UX Impact

**DIRECT** per CAIA §6.3's explicit enumeration (PRD, User Flow both named).

## Migration Impact

The existing `0009_m04_learning_center` migration (containing `certificates`) is NOT altered by this decision — this ADR confirms `certificates` remains as-is; any new M15-side structures are additive, in a future, separate migration.

## Operational Impact

Not assessed — no source document addresses this specifically.

## Observability Impact

Not assessed — no source document addresses this specifically.

## Dependencies

**Depends on:** None (zero Category-A prerequisite, per MADCR v1.1 §6.4).
**Disputed dependency:** This candidate's own free-text field claims to block `MADCR-036` (`CR-01`) — not mirrored in `MADCR-036`'s own formal dependency field. Recorded, not resolved.

## Risks

- `CR-01`: if a genuine ordering dependency exists relative to `MADCR-036`, approving the two out of the recommended joint sequence could require rework.
- `CR-06` (dual ADR numbering) applies to this draft's final number.

## Open Questions

1. Does this ADR need to formally precede `MADCR-036`'s approval, or can both be approved in the same session (`CR-01`)?
2. Should a future optional Title-Award-Instance-to-Certificate reference be designed now or deferred entirely to implementation-phase discovery?

## Traceability

Title Rule 013 → CAIA §6.3/§28/§29 → Gate v1.3 §4.3 → MADCR-046 → this draft ADR.

## Evidence

See `ADR-BATCH-1-EVIDENCE-PACK-MADCR-046.md` for the complete evidence pack (6 items, all HIGH confidence).

## Approval Requirements

1. Architecture Review Board confirms the separation.
2. `CR-01` ordering question with `MADCR-036` is explicitly discussed and recorded, even if the outcome is "no reordering needed."
3. Confirms `certificates` table itself is not altered or deleted by this decision.
4. Downstream ERD/API/RBAC/PRD/User-Flow/Test-strategy authors notified once approved.

**This ADR remains DRAFT until all Approval Requirements are satisfied and the Board formally records approval. No implementation, ERD, API, or RBAC work is authorized by this draft.**
