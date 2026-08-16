# 04-ARB-CR-01-036-046-DEPENDENCY-DECISION-BRIEF.md

# Decision Brief

## Decision ID
CR-01

## Decision Title
MADCR-036 ↔ MADCR-046 Dependency / Sequencing

## Current Status
OPEN — ARB REQUIRED (procedural)

## Decision Authority
Architecture Review Board (sequencing/scheduling discretion)

## Why This Decision Exists

`MADCR-046`'s MADCR v1.1 record contains a free-text `Blocks` field naming `MADCR-036` as something it blocks. `MADCR-036`'s own formal `Depends On` field lists no prerequisite at all. These two fields are inconsistent with each other, and the Board should determine whether a genuine sequencing dependency exists or whether the free-text field is simply imprecise.

## Canonical Evidence

- MADCR v1.1 §6.4, `MADCR-046` row, `Blocks` field (free-text, descriptive): "MADCR-036, Title ERD"
- MADCR v1.1 §6.4, `MADCR-036` row, `Depends On` field (formal, structured): "—" (none)
- `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` §19.2 first identified this as `REC-01`; carried forward as `DISC-06` in subsequent governance cycles; re-verified directly against both rows' exact text in the most recent Batch-1 evidence-pack cycle

## Existing Decisions

Both `MADCR-036` and `MADCR-046` were assessed as independently READY TO DRAFT under the strict evidence-completeness test (see their respective decision briefs) — neither's own drafting readiness is in question; only their **relative order** is at issue.

## Business Rules

`MADCR-036` cites Title Rule 013 as supporting evidence; `MADCR-046` cites the same rule. This shared citation does not itself establish an ordering dependency — it establishes shared subject-matter grounding.

## AEP References

Both candidates cite CAIA-001 directly. `MADCR-036` additionally cites AEP-TITLE-001. Neither AEP explicitly states an ordering requirement between the two decisions.

## Existing ADR References

None — neither candidate maps to an existing ADR in either numbering scheme.

## Architecture Impact

If a genuine dependency exists (046 must precede 036), approving 036 first could require revisiting its Definition/Instance model once the `certificates` boundary is separately settled. If no genuine dependency exists, the two can be approved in either order or simultaneously without rework risk.

## Dependencies

This is itself the dependency question — see above.

## Options

**Option 1 — Independent (no ordering requirement).** Treat the free-text field as imprecise documentation; approve `036` and `046` in the same session with no enforced order.

**Option 2 — Sequential, 046 before 036.** Treat `046`'s claim at face value; require `046`'s approval before `036` proceeds to approval.

**Option 3 — Sequential, 036 before 046.** Treat `036` (highest fan-out in the entire register) as foundational, with `046` following once `036`'s Definition/Instance model is confirmed — this is the order used in the drafting sequence recommended by `07-BATCH-1-ADR-SEQUENCING-UPDATE.md`, though that recommendation was itself procedural, not a resolution of this exact question.

*No source document states a preference among these three options — all three are constructed from the evidence pattern, not asserted by any primary source as "the" answer.*

## Consequences

Not assessed further — deferred to Board discussion, since no source provides consequence analysis for any of the three options.

## Risks

- If Option 1 is chosen and a real dependency does exist, rework may be needed later.
- If Option 2 or 3 is chosen without confirming which candidate genuinely depends on the other, the Board risks enforcing an arbitrary order based on an admittedly imprecise field.

## Open Questions

1. Does `MADCR-046` (certificates/Title boundary) substantively inform `MADCR-036`'s (Definition/Instance) scope, or vice versa, in a way that would change either decision's content if approved out of order?
2. Should the MADCR Document Custodian correct the underlying free-text field regardless of which option the Board selects (a documentation-hygiene action, separable from the sequencing decision itself)?

## Downstream Impact

Both candidates block Title (M15) ERD work in different ways — `036` foundationally, `046` for the M04-boundary specifically. The sequencing choice does not change what is ultimately blocked, only the internal order of approval.

## Recommendation

**Procedural recommendation only:** since both candidates have zero *formal* Category-A dependency and were independently assessed as evidence-complete, the Board may find it efficient to **discuss and approve both in the same session** (Option 1 in effect), explicitly recording whether either substantively informed the other's final wording — this converts the open question into a documented finding regardless of which numbered option is technically selected. **This is a scheduling suggestion, not a selection among the three options, which remain the Board's to choose.**

## Decision

> **OPEN — ARB REQUIRED**
