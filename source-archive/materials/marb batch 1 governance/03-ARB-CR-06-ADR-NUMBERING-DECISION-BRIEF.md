# 03-ARB-CR-06-ADR-NUMBERING-DECISION-BRIEF.md

# Decision Brief

## Decision ID
CR-06

## Decision Title
ADR Numbering / Decision Register Convention

## Current Status
OPEN — ARB REQUIRED

## Decision Authority
Document Custodian recommendation basis prepared; final convention selection requires Architecture Review Board (governance-convention authority, not a technical architecture decision)

## Why This Decision Exists

Two repository documents independently number architecture/technical decisions, and at least 8 confirmed cases assign **different numbers to the same underlying decision**. This was discovered during evidence reconciliation for Batch-1 ADR drafting and must be resolved before any of the 4 drafted ADRs (`MADCR-010, 011, 036, 046`) can receive a final, canonical ADR number.

## Canonical Evidence

**Document 1 — `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md`**
- Self-declared scope (document line 14, verbatim): *"29 dari 29 ADR arsitektur/teknis kini Approved, 0 ADR OPEN."*
- Numbering: sequential, internal, 001–029
- Purpose: curated register specifically for architecture/technical decisions

**Document 2 — `docs/00-governance/decision-log-FINAL.md`**
- Self-declared scope (document line 3, verbatim): *"Dokumen ini adalah catatan resmi seluruh keputusan penting proyek — teknis maupun non-teknis."*
- Numbering: sequential, 001–047, confirmed by direct header count this cycle (zero gaps)
- Purpose: complete master log of all significant project decisions (technical and non-technical)

**Confirmed cross-reference cases (same decision, different number):**

| Decision | Document 1 number | Document 2 number |
|---|---|---|
| Search Strategy | ADR-005 | ADR-039 |
| Job Queue Strategy | ADR-006 | ADR-040 |
| Maps Provider | ADR-008 | ADR-041 |
| Caching Strategy | ADR-018 | ADR-042 |
| Organization Model | ADR-026 | ADR-043 |
| Organization-Scoped Authorization | ADR-027 | ADR-044 |
| AI Assistant Integration (BYOK) | ADR-028 | ADR-045 |
| Image Duplicate Detection | ADR-029 | ADR-047 |

**Explicit acknowledgment found in source (Document 2, `ADR-044` entry, line 1484, verbatim):** *"Sumber utama keputusan ini adalah `architecture-decision-records.md` ADR-027... yang menggunakan skema penomoran ADR independen dari `decision-log.md`... Entry ini adalah pencatatan/sinkronisasi keputusan tsb ke dalam Decision Log... Tidak menggantikan (Supersedes/Replaces) ADR manapun."* This confirms the dual numbering is **deliberate and cross-referenced**, not an undetected error.

**Decision Log's own stated relationship to other documents** (Document 2, line 12): *"Decision Log tidak menggantikan dokumen manapun di atas — fungsinya adalah menjelaskan mengapa sebuah keputusan yang tercatat di dokumen-dokumen tersebut diambil."*

**Unconfirmed extent:** Document 2 also contains `ADR-030–038, 046` (9 entries covering UUID-PK/soft-delete, rendering strategy, role model formalization, DBR tenor units, city-FK migration, review/rating feature flag, governance-hierarchy documentation, backend architecture, soft-delete-scope-expansion) — **whether these have counterparts in Document 1 was not exhaustively verified in this pass** and is noted as a residual evidence gap, not resolved here.

## Existing Decisions

Neither numbering scheme is itself "wrong" per the evidence — both are self-consistent within their own declared scope, and 8 confirmed overlaps are explicitly cross-referenced rather than contradictory.

## Business Rules

Not applicable — this is a documentation/governance-convention question, not a business rule matter.

## AEP References

Not applicable.

## Existing ADR References

The 8 cross-referenced pairs listed above are the direct evidentiary basis.

## Architecture Impact

None directly — this decision affects **numbering convention only**, not any architecture content. However, it determines what identifier the 4 currently-drafted ADRs (`MADCR-010, 011, 036, 046`) will carry once approved.

## Dependencies

No architecture decision depends on this being resolved first. **Correct final numbering of any newly-approved ADR does depend on this.**

## Options

**OPTION A — Keep the two registers separate**, each retaining its own independent numbering scheme, as they currently and historically have.
- *Pros:* No migration/renumbering work; preserves all existing cross-references as-is; each document continues serving its distinct declared purpose (curated architecture subset vs. complete project log).
- *Cons:* Perpetuates the confusion that led to this CR being raised; any future AI coding assistant or new team member must learn both schemes and their cross-reference pattern; risk of the same discovery process needing to repeat itself.
- *Governance impact:* Low — no change to existing process.
- *Repository impact:* None.
- *Future ADR impact:* New ADRs must be assigned two numbers (one per register) if both are to remain synchronized, as has been the historical practice for the 8 confirmed pairs.
- *Migration impact:* None.
- *AI interpretation impact:* Continues to require an AI agent to know both schemes exist and cross-reference correctly — as this very Decision Pack had to discover.

**OPTION B — Merge into a single canonical ADR sequence.**
- *Pros:* Eliminates the dual-numbering confusion permanently; one number per decision going forward.
- *Cons:* Requires renumbering either the 29-entry curated register or reconciling it into the 47-entry log; risk of breaking existing cross-references throughout `PROJECT-CONSTITUTION.md`, `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, and other documents that cite specific ADR numbers under the current scheme(s) — this is a non-trivial documentation migration.
- *Governance impact:* High — touches the core decision-tracking convention project-wide.
- *Repository impact:* Potentially many files require citation updates.
- *Future ADR impact:* Simplest going forward — one register, one number.
- *Migration impact:* Significant one-time documentation effort.
- *AI interpretation impact:* Simplest for future AI agents — single source of truth.

**OPTION C — Keep two registers but assign explicit, distinct namespace/terminology** (e.g., "ADR-ARCH-XXX" for the curated architecture register vs. "ADR-LOG-XXX" or continuing "ADR-XXX" for the master log) so the dual-numbering is self-evident from the identifier itself, rather than requiring tribal knowledge or document-by-document discovery.
- *Pros:* Preserves both documents' existing content/numbers (low migration cost) while making the distinction explicit and machine/human-readable going forward; new decisions and new ADRs (including the 4 from this Batch) could adopt the namespaced convention immediately without touching historical entries.
- *Cons:* Historical entries would still lack the namespace unless retroactively updated (partial-migration risk); introduces a new convention that must itself be documented and adopted consistently.
- *Governance impact:* Moderate — requires a documented convention change and a decision on whether to retrofit historical entries.
- *Repository impact:* Low for historical entries (can remain as-is with a note); new entries follow new convention.
- *Future ADR impact:* Clear and unambiguous going forward.
- *Migration impact:* Low-to-moderate, can be phased.
- *AI interpretation impact:* Most robust — the namespace itself signals which register an identifier belongs to.

## Consequences

Deferred to Board discussion — no consequence is asserted as decided here.

## Risks

- If left unresolved, each future ADR (including the 4 drafted this cycle) risks being informally assigned an ad-hoc number by whoever finalizes it, perpetuating or worsening the ambiguity.
- Option B's migration carries a documented risk of breaking existing cross-references if not executed carefully.

## Open Questions

1. Does Document 2's `ADR-029–038, 046` (9 entries) have any undiscovered counterpart in Document 1, or are these genuinely Document-2-only entries (business/product/config decisions outside Document 1's "architecture/technical" scope)?
2. Should historical entries be retroactively migrated under whichever option is chosen, or only new entries going forward?

## Downstream Impact

Determines the final ADR number for `MADCR-010, 011, 036, 046` (this Batch) and every subsequent ADR. Does not block drafting or content approval of any of the 4.

## Recommendation

**Procedural recommendation only, not an architecture decision:** given that Options A and C both preserve all existing content without a large-scale migration, and Option C additionally resolves the ambiguity going forward without disturbing history, **the Board may wish to weigh Option C first** as it offers the lowest migration cost with the clearest long-term outcome. **This is a suggestion for where the Board might start discussion, not a selection.** The Board retains full discretion, including selecting Option A, B, or a variant not listed here.

## Decision

> **OPEN — ARB REQUIRED**
