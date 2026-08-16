# 06-ARB-MADCR-046-CERTIFICATE-TITLE-DECISION-BRIEF.md

# Decision Brief

## Decision ID
MADCR-046

## Decision Title
Certificate (M04) vs Title Award Instance (M15) Boundary

## Current Status
OPEN — ARB REQUIRED (DRAFT ADR exists, not yet Board-reviewed)

## Decision Authority
Architecture Review Board

## Why This Decision Exists

M04 Learning Center's existing `certificates` table is explicitly retained as foundation for the broader Learning domain. The proposed M15 Title system introduces a new Award Instance concept. CAIA explicitly warns these must not be conflated. The Board must formally confirm this boundary before Title ERD work can proceed safely.

## Canonical Evidence

- CAIA §6.3: *"CRITICAL — ERD, API, PRD, User Flow, RBAC, System Architecture and test strategy all change. The current `certificates` table must not automatically become the new Title Award Instance. Certificate/Credential and Title/Award must remain separate."*
- CAIA §5.2: *"The existing: courses; course lessons; quizzes; enrollments; quiz attempts; certificates — remain useful. They should become the foundation of the broader Learning domain rather than being discarded."*
- CAIA §28, `CAIA-ADR-010`: "Certificate/Credential vs Title separation."
- `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` §4.3: independent corroboration listing "Certificate/Credential vs Title" among remaining open questions.

## Certificate Purpose (as documented)

Existing M04 artifact evidencing course/quiz completion within the Learning Center — retained, not deprecated.

## Title Purpose (as documented)

New M15 achievement/reputation-recognition system with authorities/scopes, Awarding Paths, lifecycle, provenance, presentation, appeal — see companion brief `MADCR-036`.

## Relationship / Distinction

Per source: **they must remain separate records/entities.** No source states they are ever the same record. No source states a certificate automatically or by-default becomes (or is required to become) a Title Award Instance.

## M04 Impact

`certificates` table (migration `0009_m04_learning_center`) is confirmed by direct inspection to have no existing Title-related columns/FKs — this decision does not alter that table, it confirms its continued independent existence.

## M15 Impact

Establishes that Title Award Instance is a genuinely new, separate structure — not a repurposing of `certificates`.

## Learning Impact

None to the existing Learning Center functionality — `certificates` continues serving its current purpose unchanged.

## Reputation Impact

Not directly assessed by any source — the Title system's reputation/achievement function is a separate concern governed by `MADCR-036` and its dependents.

## Data Impact

CRITICAL per CAIA's own classification — foundational boundary for two otherwise-independent data domains.

## Downstream Dependency

Most extensively documented downstream impact of any Batch-1 candidate: CAIA §6.3 explicitly names ERD, API, RBAC, PRD, User Flow, System Architecture, and test strategy as all CRITICALLY affected.

## Business Rules

Title Rule 013: "Title dapat berdiri sendiri atau berhubungan dengan Credential." (Final) — supports the separation while allowing an optional, non-automatic relationship.

## AEP References

CAIA-001 (sole originating source for this specific boundary); AEP-TITLE-001 (indirect, shares Rule 013).

## Existing ADR References

None found in either numbering scheme.

## Architecture Impact

See Data Impact and Downstream Dependency above.

## Dependencies

**Depends on:** None (formal). **Disputed:** this candidate's own field claims to block `MADCR-036` — see companion brief `04-ARB-CR-01-...`.

## Options

**No alternative architecture exists in any source** for *whether* to separate — CAIA states this as a prohibition/requirement, not a choice. Per Master Prompt §9 instruction, no schema or table structure is proposed here, and no alternative is invented. The only matter for the Board is formal confirmation of the sourced boundary requirement, and optionally, guidance on whether any future optional cross-reference between the two entities should be designed now or deferred.

## Consequences

Confirming this boundary unblocks Title ERD design work specifically at the M04/M15 seam. Deferring leaves this seam undefined, risking accidental conflation during future implementation.

## Risks

`CR-01` sequencing question relative to `MADCR-036`; `CR-06` numbering convention.

## Open Questions

Same as `CR-01` companion brief.

## Downstream Impact

See Downstream Dependency above (most extensive of the Batch-1 set).

## Recommendation

**Procedural recommendation only:** given this is the most extensively-documented-impact item in Batch 1, **the Board may wish to pair this discussion directly with `MADCR-036`** (per `CR-01`'s procedural suggestion) to resolve both the content confirmation and the sequencing question in one sitting. Not a substitute for Board deliberation.

## Decision

> **OPEN — ARB REQUIRED**

*(Full DRAFT ADR available: `ADR-DRAFT-MADCR-046.md`, prepared in the prior governance-execution cycle, unchanged.)*
