# 10-ARB-MADCR-049-EVIDENCE-RECOVERY-REQUEST.md
## RUMAHAGEN — MADCR-049 Evidence Recovery Request

**This is NOT a Decision Brief and is NOT presented for ARB architectural deliberation this session.** `MADCR-049` failed the evidence-completeness threshold in the most recent readiness audit and requires a definitional-clarification pass before it can be responsibly presented for a decision.

---

## Current Question

"Learning Activity vs Course" — sourced only as a two-word label in CAIA (§29, Gate 1, item 2) and echoed identically in Gate v1.3 (§4.3), with no elaborating sentence in either document.

## Source Tracing

- **CAIA-001** — sole originating source; §6.1–6.2 provides only indirect context (current-state Course→Lesson→Enrollment→Quiz→Certificate pipeline; target-state diagram lists "Course / Learning Activity" as a single combined line item, which is itself ambiguous as to whether the two are meant to be the same or different concepts).
- **Gate v1.3** §4.3 — corroborates existence as an open question, adds no content.

## Business Rule Tracing

**No result.** Searched legacy BR-001–151, Learning Economy LE-001–059, Learning Session LS-001–080 (including the newly-recovered `MBR-LS-001–015`), and Title 001–100 — none define or use the term "Learning Activity."

## AEP Tracing

**No result.** Searched `AEP_Learning_Economy_v1_0.md` and `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` in full — the exact term "Learning Activity" does not appear as a defined concept in either document, despite both being the domain-specific AEPs one would expect to originate such a term.

## PRD Tracing

**No result.** `docs/01-product/PRD-RUMAHAGEN-v1.3-FINAL.md` does not use this term (M04 Learning Center is described in terms of Course/Lesson/Quiz/Enrollment/Certificate only).

## Learning Module Tracing

**No result.** `docs/09-module-planning/MP-04-LearningCenter-Module-Planning-v1_0-FINAL.md` does not use this term.

## ERD Tracing

**No result.** `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md` contains no "Learning Activity" entity.

## Terminology Tracing

**Conclusion: "Learning Activity" is a term introduced by CAIA's own summary/synthesis language, not inherited from any domain-specific source document.** This does not mean the underlying architectural question is invalid — the question of how new Learning Economy/Session data flows relate to the existing Course/Lesson pipeline is real and CAIA-Gate-1-classified — but the specific vocabulary requires clarification before a Decision Brief can responsibly present "options" to the Board.

---

## Status

> **BLOCKED — EVIDENCE GAP**

## What Exact Definition Is Needed

A clear statement of whether "Learning Activity" is: (a) synonymous with the existing "Course" concept, (b) a new abstraction layer sitting above or alongside Course, (c) a placeholder term CAIA used loosely pending this very ADR, or (d) something else entirely not yet named.

## Which Document Should Contain It

Most naturally, `AEP_Learning_Economy_v1_0.md` and/or `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md`, since these are the domain AEPs that would define new Learning-domain vocabulary — or a future CAIA addendum if the term was intentionally coined at the cross-domain-analysis level and needs to be formally back-filled into the domain AEPs.

## Why Current Evidence Is Insufficient

Per the strict readiness test applied in the most recent Batch-1 audit (`06-BATCH-1-ADR-READINESS-MATRIX.md`), this candidate fails 2 of 5 required criteria: "decision question is clear" (only a 2-word label exists) and effectively "authority sufficient" (compounded by a full Business Rule Source Gap, not merely partial).

## Which Future Decisions Are Blocked

`MADCR-049` itself cannot proceed to a Decision Brief until this gap closes. Its disputed dependency claim toward `MADCR-014` (Learning Point ledger) and `MADCR-023` (Learning Session Provider Adapter) — both otherwise independently ready — means the Board should be aware this evidence gap could, if the disputed dependency proves real, eventually affect the *approval* timing of those two Batch-2 items as well (not their drafting, which has already proceeded independently).

## Which Downstream Artifacts Are Frozen

M04-extend ERD elements specifically shaped by the Course/Learning-Activity boundary remain undesigned until this term is clarified and a proper Decision Brief can be prepared.

---

**No definition is invented here. No term is guessed. This request is the recommended next governance action for this specific item — not a decision, and not authorization to proceed with drafting until the gap is closed.**
