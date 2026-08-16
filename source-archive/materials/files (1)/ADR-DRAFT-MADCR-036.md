# ADR-[TBD, pending CR-06 resolution — provisional reference: MADCR-036] — Separate Title Definition from Award Instance

**Status:** DRAFT

**Decision Owner:** TBD / per RumahAgen governance (Architecture Review Board)

**Date:** 2026-08-15 (draft prepared)

---

## Context

RumahAgen's Title/Achievement system (proposed module M15) must support multiple Title authorities and scopes, configurable Awarding Paths, multiple qualification sources, prerequisites, Learning Points integration, assessment and evidence, multiple Awarding Paths per Title, provenance, versioned Awarding Rules, persistent Award Instances, lifecycle states (Active/Expired/Revoked/Restored), appeal and Stay Policy, renewal/requalification/repeat awards/progression, independent Primary and Featured presentation, agent-controlled Featured ordering, historical retention, and RBAC-controlled issuer/administrative actions (AEP-TITLE-001 §1). No such system currently exists in RumahAgen's approved architecture — M15 Title is a proposed, new module with zero existing ERD/API/RBAC precedent (confirmed by direct inspection of `ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md`, which contains no Title/Award entities).

## Problem Statement

If Title is modeled as a single flat attribute attached to an agent record, none of the above capabilities are representable: there is no way to distinguish a Title's canonical definition (name, authority, category, progression policy) from a specific agent's earned instance of that Title (award date, provenance, lifecycle state, presentation eligibility), no way to support Title renaming without breaking historical award references, and no way to support multiple qualification paths or versioned Awarding Rules.

## Business Drivers

- Title system must support RumahAgen, Partner, and Agency/Organization authorities (Title Rules 002, 025, 053, 071–074, 079).
- Title renames must not sever the link to already-earned awards (Title Rule 022).
- Titles that have been awarded must never be hard-deleted (Title Rule 023).
- Titles may exist independent of any single Credential relationship (Title Rule 013).

## Canonical Inputs

- `Title_Business_Rules_Baseline_v1_0_Consolidated.md` — Title Rules 001–100 (user-locked, Final status)
- `AEP_Title_Business_Rules_Baseline_v1_0.md` — the AEP proposing this architecture
- `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` (CAIA) — independent corroboration

## Business Rules

| Rule | Text (as sourced) | Status |
|---|---|---|
| Title Rule 003 | "Semua earned Title dapat menjadi Primary. Tidak ada pembatasan source yang otomatis melarang Primary." | Final |
| Title Rule 011 | "Repeat, Renewal, dan Progression merupakan policy configurable per Title." | Final |
| Title Rule 012 | "Ketika agen memperoleh level berikutnya, Title level sebelumnya tetap Active kecuali policy menentukan sebaliknya." | (Progression note) |
| Title Rule 013 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." | Final |
| Title Rule 021 | "Perubahan material terhadap business rule menghasilkan new Awarding Rule/Title version. Award lama tetap terkait version saat award diberikan." | Final |
| Title Rule 022 | "Rename Title berlaku global terhadap Title/award terkait." (Rename ≠ new Award; Award Instance tetap sama) | Final |
| Title Rule 023 | "Title yang pernah diberikan tidak boleh hard-delete; dapat dikeluarkan dari active catalog." | Final |
| Title Rules 037–038, 051–052, 093–095 | Cited by AEP §4.2 as additional driver rules (range reference; not individually re-extracted in this draft) | Presumed Final |

## AEP Inputs

- **AEP-TITLE-001** §4.2: *"Rules 003, 011–013, 021, 022, 023, 037–038, 051–052 and 093–095 establish a critical separation: 'A Title definition is not the same object as an earned Award Instance.'... This separation is an architectural requirement."*
- **CAIA-001**, `CAIA-ADR-007`: "Title Definition vs Award Instance."

## Existing Architecture

No existing M15 Title architecture. Existing M04 Learning Center `certificates` table is explicitly a **separate** concern (see companion ADR draft for `MADCR-046`) and is not to be conflated with this model.

## Existing ADR Dependencies

None — no existing ADR (in either numbering scheme identified in `CR-06`) addresses Title architecture.

## Decision Drivers

- Must support all capabilities listed in AEP-TITLE-001 §1 (see Context).
- Must not contradict any of the 13 cited Title Rules.
- Must remain distinct from, but coexistent with, the existing `certificates` table (companion decision, `MADCR-046`).

## Options Considered

**No competing options were found in any authoritative source.** AEP-TITLE-001 §4.2 presents the Definition/Instance separation as a stated architectural requirement, not a choice among alternatives. No alternative model is described or evaluated in any source document. This ADR therefore records a **confirmation of a sourced requirement**, not a selection among invented alternatives.

## Decision

**PROPOSED FOR ADOPTION (DRAFT — pending Board confirmation):** Title Definition SHALL be modeled as an object separate from Award Instance, per AEP-TITLE-001 §4.2 and the 13 cited Business Rules. The conceptual structure (AEP-TITLE-001 §4.2):

```text
Title Definition
      │
      ├── Awarding Paths
      │      └── Awarding Configuration / Version
      │
      └── Award Instances
             ├── Owner
             ├── Award Date
             ├── Lifecycle
             ├── Provenance
             └── Presentation eligibility
```

**This Decision is NOT APPROVED.** It reflects the sourced requirement as-stated, subject to Board review and formal approval per the Approval Requirements below.

## Non-Goals

This ADR does not decide: the exact Awarding Path versioning mechanism (`MADCR-037`), Award Provenance persistence details (`MADCR-038`), Award Lifecycle vs Prerequisite Lifecycle separation (`MADCR-039`), Presentation-State-vs-Award-State modeling (`MADCR-040`), Awarding Rule versioning-without-new-identity mechanics (`MADCR-041`), Revocation/Appeal lifecycle processes (`MADCR-042`), multi-instance support (`MADCR-043`), the `certificates`-vs-Title boundary (`MADCR-046`, companion draft), or any RBAC/permission taxonomy (`MADCR-048/053/057`). These are separate, dependent MADCR candidates.

## Consequences

Adopting this separation is foundational — it unlocks (but does not itself resolve) 8 direct and 5 indirect dependent architecture decisions (the highest fan-out of any candidate in the 64-item MADCR register). Declining or delaying this separation would block the entire Title/Achievement domain's ERD from proceeding.

## Security / RBAC / RLS Impact

INDIRECT — feeds future Title authority/scope RBAC realization (`MADCR-048`) and Title issuance/revocation/appeal permissions (`MADCR-057`). No RBAC change is made or proposed by this ADR itself.

## Data Model Impact

CRITICAL — foundational for all M15 Title data model work. No ERD is created by this ADR.

## API Impact

None directly — API impact is indirect, via future M15 API design once ERD is authorized.

## PRD / UX Impact

Indirect — presentation-state distinctions (Primary/Featured) depend on this separation (`MADCR-040`).

## Migration Impact

None — no migration exists yet for M15; this ADR does not authorize one.

## Operational Impact

Not assessed — no source document addresses operational impact for this specific candidate.

## Observability Impact

Not assessed — no source document addresses this.

## Dependencies

**Depends on:** None (zero Category-A prerequisite, per MADCR v1.1 §6.4).
**Disputed dependency:** `MADCR-046`'s free-text field claims to block this ADR (`CR-01`) — not mirrored in this candidate's own formal dependency field. Recorded, not resolved.

## Risks

- If the ordering question in `CR-01` reflects a genuine dependency, approving this ADR before `MADCR-046` could require rework. Mitigation: joint Board session recommended (see `07-BATCH-1-ADR-SEQUENCING-UPDATE.md`).
- `CR-06` (dual ADR numbering) means this draft's eventual formal ADR number is not yet assigned.

## Open Questions

1. Does `MADCR-046` genuinely need to be approved before or alongside this ADR (`CR-01`)?
2. Which ADR numbering convention (curated architecture-specific sequence vs. full decision-log sequence) applies to this ADR's final number (`CR-06`)?

## Traceability

Title Rules 003, 011, 012, 013, 021, 022, 023, 037, 038, 051, 052, 093, 094, 095 → AEP-TITLE-001 §4.2/§27 → CAIA-ADR-007 → MADCR-036 → this draft ADR.

## Evidence

See `ADR-BATCH-1-EVIDENCE-PACK-MADCR-036.md` for the complete evidence pack (7 items, all HIGH confidence).

## Approval Requirements

1. Architecture Review Board reviews and confirms adoption of the Definition/Instance separation.
2. Cross-check against all 13 cited Title Rules confirms no contradiction.
3. `CR-01` ordering question discussed (recommended, not blocking).
4. Downstream Title ERD authors notified once approved.

**This ADR remains DRAFT until all Approval Requirements are satisfied and the Board formally records approval. No implementation, ERD, API, or RBAC work is authorized by this draft.**
