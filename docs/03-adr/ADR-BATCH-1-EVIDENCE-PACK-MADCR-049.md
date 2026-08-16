# ADR BATCH 1 — EVIDENCE PACK — MADCR-049
## RUMAHAGEN — Pre-Draft Evidence Pack (NOT AN ADR)

**Status: PRE-DRAFT GOVERNANCE CONTROL ARTIFACT.**

---

## 5.1 IDENTITY

| Field | Value |
|---|---|
| MADCR ID | MADCR-049 |
| Canonical decision title (per MADCR v1.1 §6.5) | "What is the boundary between the new Learning Activity concept (Learning Economy/Session) and the existing Course/Lesson model (M04)?" |
| Title variation 1 | "Learning Activity vs existing Course model" (CAIA §29, Gate 1, item 2) |
| Title variation 2 | "Learning Activity vs Course" (Gate v1.3 §4.3, "Other ADR questions" list) |
| **Both recorded verbatim, no single canonical title chosen** | — |
| Current MADCR status | OPEN |
| Category | A — Mandatory Architecture Decision |
| Priority | ADR REQUIRED |
| Current sequencing batch | BATCH 1 — Foundation |
| Source file (primary) | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` |
| Source section (primary) | §29, Gate 1, item 2 |
| Source file (secondary) | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` |
| Source section (secondary) | §4.3 |

---

## 5.2 DECISION QUESTION

**PRIMARY QUESTION:** unlike the other 4 Batch-1 candidates, this item's primary sources (CAIA §29 Gate1.2, Gate v1.3 §4.3) present it **only as a terse label** — "Learning Activity vs existing Course model" / "Learning Activity vs Course" — with **no elaborating sentence, no stated options, and no explicit prohibition/requirement text anywhere else in CAIA's body that names "Learning Activity" as a defined term.**

**DECISION QUESTION GAP — partial.** The label itself functions as a minimal question, but no source document provides the fuller framing given to the other 4 Batch-1 items. The closest supporting context found is CAIA §6 (current-state Learning pipeline: Course→Lesson→Enrollment→Quiz→Certificate) and §6.2's target-state diagram, which lists "Course / Learning Activity" as a single combined line item in the target domain tree:

> CAIA §6.2 target diagram (verbatim): *"Learning ├── Course / Learning Activity ├── Learning Path ├── Learning Session..."*

This diagram notation ("Course / Learning Activity") itself suggests the two may be closely related or even the same node in CAIA's own target model — which, if read literally, is in tension with treating them as a boundary requiring a separate ADR. **This tension is recorded as a finding, not resolved.**

---

## 5.3 DECISION SCOPE

| Scope dimension | Status | Evidence |
|---|---|---|
| Business scope | UNKNOWN | EVIDENCE NOT LOCATED — no Business Rule set explicitly defines "Learning Activity" as a term |
| Architecture scope | IN SCOPE (by Gate-1 classification) | CAIA §29 Gate 1 item 2 |
| Module scope | IN SCOPE — M04 (existing Course/Lesson) and M04-extend (Learning Economy/Session) | CAIA §6.2 |
| Organization scope | OUT OF SCOPE | — |
| Data scope | IN SCOPE (implied, Gate-1 = pre-ERD) | CAIA §29 |
| Integration scope | OUT OF SCOPE | — |
| Security scope | INDIRECT — feeds `MADCR-056` (Point adjustment permissions) transitively via `MADCR-014` | MADCR v1.1 dependency chain (indirect, not explicitly stated for 049 itself) |
| Operational scope | UNKNOWN | EVIDENCE NOT LOCATED |

---

## 5.4 EVIDENCE PACK

| Evidence ID | Source | Repository Path | Section/Heading | Exact Reference | What It Proves | Authority Level | Confidence |
|---|---|---|---|---|---|---|---|
| EV-049-01 | CAIA v1.0 | `/mnt/user-data/uploads/RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §29, Gate 1, item 2 | "Learning Activity vs existing Course model." | Confirms this is a Gate-1 (pre-ERD) item | LEVEL 9 | HIGH (existence of the item) / LOW (content/detail) |
| EV-049-02 | Master BR Final Traceability Gate v1.3 | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` | §4.3 | "Other ADR questions... Remain open: ... Learning Activity vs Course." | Independent Level-4 corroboration of existence | LEVEL 4 | HIGH (existence) / LOW (content) |
| EV-049-03 | CAIA v1.0 | Same | §6.1–6.2 | Current: "Course → Lesson → Enrollment → Quiz → Certificate"; Target: "Learning ├── Course / Learning Activity ├── Learning Path ├── Learning Session..." | Only located textual context connecting "Learning Activity" to the existing Course model — shows them adjacent/possibly-combined in CAIA's own target diagram | LEVEL 9 | MEDIUM — suggestive, not a clear boundary statement |
| EV-049-04 | AEP Learning Economy v1.0 | `/mnt/user-data/uploads/AEP_Learning_Economy_v1_0.md` | Full-text search | **"Learning Activity" as an exact term was not found as a defined concept in this AEP's own text** (search performed in this evidence pack, not merely relying on prior-session recall) | Confirms the term does not originate from the Learning Economy AEP itself, despite MADCR v1.1 tagging this candidate's domain as "Learning" broadly | N/A (absence finding) | HIGH (confidence in the absence) |
| EV-049-05 | AEP Learning Session v1.0 (AEP-LS-001) | `/mnt/user-data/uploads/RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` | Full-text search | **"Learning Activity" as an exact term was likewise not found as a defined concept in this AEP's own text** | Same absence pattern | N/A | HIGH |
| EV-049-06 | Repository re-verification | `docs/09-module-planning/MP-04-LearningCenter-Module-Planning-v1_0-FINAL.md`, `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md` | Full-text search | No "Learning Activity" entity or term found in existing approved M04 Module Planning or ERD | Confirms this is a genuinely new/undefined term relative to the existing baseline | LEVEL 6/8 | HIGH |

**Material finding for this evidence pack:** "Learning Activity" is a term used by CAIA (Gate 1 item 2, and its own §6.2 diagram) and by Gate v1.3 (§4.3, quoting CAIA) but **is not independently defined or used as a first-class concept in either domain-specific source AEP (Learning Economy or Learning Session)** that would otherwise be expected to originate it. This is recorded as a **CANDIDATE VALIDITY OBSERVATION**, not a deletion — per Master Prompt §4 ("If repository evidence shows one candidate is invalid, do not delete it. Flag: CANDIDATE VALIDITY ISSUE").

**CANDIDATE VALIDITY ISSUE (flagged, not resolved):** the decision question for `MADCR-049` refers to a "Learning Activity concept" that is not independently sourced outside of CAIA's own summary language. This does not mean the underlying architectural question (how do new Learning Economy/Session data flows relate to the existing Course/Lesson pipeline?) is invalid — that question is well-evidenced (§5.3, EV-049-03/06) — but the specific term "Learning Activity" may need definitional clarification during drafting rather than being treated as an already-agreed vocabulary term.

---

## 5.5 BUSINESS RULE TRACEABILITY

| Business Rule | Source | Exact Reference | Relevance | Status | Conflict? |
|---|---|---|---|---|---|
| No Business Rule found explicitly defining "Learning Activity" or its boundary vs Course/Lesson | — | — | — | **BUSINESS RULE SOURCE GAP** | N/A |
| Legacy Learning Center rules (implicit, via existing `courses/course_lessons/enrollments` schema) | `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md` (M04 section) | Existing entity definitions | Establishes what "Course" currently *is* in the approved baseline — necessary context for defining any boundary | FINAL/Approved (existing baseline) | No conflict — this is the baseline the new concept must relate to, not a competing rule |

---

## 5.6 AEP TRACEABILITY

| AEP ID | AEP Title | Source | Relevant Section | Relationship to ADR | Status |
|---|---|---|---|---|---|
| CAIA-001 | Current Architecture Impact Analysis | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §6, §29 Gate1.2 | **DIRECT** (sole originating source) | Analysis Complete |
| AEP-LE-001 | Learning Economy AEP | `AEP_Learning_Economy_v1_0.md` | None found using this exact term | **REFERENCE ONLY** (general domain adjacency; does not itself use "Learning Activity") | Proposed |
| AEP-LS-001 | Learning Session AEP | `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` | None found using this exact term | **REFERENCE ONLY** (same pattern) | Proposed |

---

## 5.7 MADCR DEPENDENCIES

| Field | Value | Cross-check result |
|---|---|---|
| Depends On | None (formal, MADCR v1.1 §6.5: "—") | Consistent |
| Blocked By | None (formal) | Consistent |
| Blocks (free-text field) | `MADCR-014, MADCR-023` | ADR Sequencing Plan §8 independently computed: `MADCR-049` has **zero** direct/indirect dependents in the formal reverse-edge graph — neither `MADCR-014` nor `MADCR-023`'s own `Depends On` field lists `049` |
| **DEPENDENCY DISCREPANCY** | **Confirmed — this is `DISC-07`, already logged in the Pre-ADR Discrepancy Register, re-verified here** | If the free-text claim is accurate, `MADCR-014` (Learning Point ledger) and `MADCR-023` (Learning Session Provider Adapter) — both currently sequenced in **Batch 2**, i.e., after Batch 1 closes — might need their *approval* held pending `049`'s resolution. Both are currently drafted/approved independently of `049` per current sequencing. **Not resolved here** — flagged for Board attention, consistent with `DISC-07`'s existing "MEDIUM" severity in the Discrepancy Register (the highest severity among the dependency-field discrepancies, given the cross-batch nature of this one) |
| Related Decisions | `MADCR-014, 023` | — |
| Upstream Decisions | Disputed — see discrepancy | — |
| Downstream Decisions | Disputed — see discrepancy | — |

---

## 5.8 OPEN DECISION IMPACT

| Open Decision | Impact on MADCR-049 |
|---|---|
| OPEN-Q1 (MADCR-010) | **NOT AFFECTED** |
| OPEN-Q2 (MADCR-011) | **NOT AFFECTED** |
| OPEN-C01 (AEP-MON-001 vs AEP-MON-002) | **NOT AFFECTED** — zero Commercial-domain citation |

---

## 5.9 DOWNSTREAM IMPACT

| Artifact | Impact | Evidence |
|---|---|---|
| ERD (M04-extend, Learning Economy/Session) | **DIRECT IMPACT** | MAEP v1.1 §22 lists this among boundary questions shaping M04-extend ERD |
| API | **INDIRECT IMPACT** | Standard chain |
| RBAC | **INDIRECT IMPACT** (via disputed link to `014`→`056`) | Weak, via discrepancy chain only |
| RLS | UNKNOWN | EVIDENCE NOT LOCATED |
| PRD | **INDIRECT IMPACT** | Standard chain |
| UI | UNKNOWN | EVIDENCE NOT LOCATED |
| Workflow | **INDIRECT IMPACT** | Learning pipeline (Course→Lesson→...) per CAIA §6.1 |
| Event model | UNKNOWN | EVIDENCE NOT LOCATED |
| Integration | OUT OF SCOPE | — |
| Migration | **INDIRECT IMPACT** | Existing M04 migration (`0009_m04_learning_center`) is the baseline this boundary must relate to |
| Reporting/Analytics | UNKNOWN | EVIDENCE NOT LOCATED |
| Operational model | UNKNOWN | EVIDENCE NOT LOCATED |
| Implementation | **NO KNOWN IMPACT YET** | CURRENT-PROJECT-STATE-rev10 |

---

## 5.10 ARCHITECTURE IMPACT

- **M04 Learning Center** (existing, approved) — its Course/Lesson model
- **M04-extend** (proposed, Learning Economy + Learning Session) — the new concept(s) whose relationship to Course/Lesson is undefined
- **Data ownership boundary** — whether "Learning Activity" is a new abstraction layer above Course, a synonym for Course, or something else entirely (per §5.4's validity observation, this is genuinely underspecified)

---

## 5.11 DECISION OPTIONS

**NO FORMAL OPTIONS FOUND IN AUTHORITATIVE SOURCES.** Unlike `MADCR-010/011` (explicit A/B options) or even `MADCR-036/046` (explicit prohibition/requirement statements), this candidate's sources provide only a two-word label and one ambiguous combined-diagram-node ("Course / Learning Activity"). **No options invented here.**

---

## 5.12 CONSEQUENCE EVIDENCE

**No evidence-supported consequence analysis exists.** The only relevant textual signal is CAIA §6.2's own target diagram writing "Course / Learning Activity" as a single line — which could be read as either (a) CAIA treating them as effectively the same concept, or (b) CAIA using informal shorthand pending the very ADR this evidence pack supports. **Both readings are speculative and neither is asserted here as fact** — recorded as Unknown.

| Dimension | Classification |
|---|---|
| Whether "Learning Activity" = "Course" | Unknown |
| Whether "Learning Activity" is a new wrapper concept | Unknown |
| Risk of proceeding without this ADR | Risk — CAIA explicitly places this in Gate 1 ("MUST RESOLVE BEFORE ERD") |

---

## 5.13 APPROVAL PREREQUISITES

| Prerequisite | Status |
|---|---|
| Business decision | None found required |
| Source recovery | **Recommended** — the term "Learning Activity" itself may benefit from a definitional source-check with the Learning Economy/Session AEP authors before drafting proceeds, given EV-049-04/05's absence finding |
| Dependency reconciliation | `DISC-07` should be explicitly addressed — given its cross-batch implication (Batch 1 item potentially gating Batch 2 approvals), this is the most operationally significant of the four dependency-field discrepancies |
| Security review | Not explicitly required |
| Technology confirmation | None found required |
| Another ADR approval | None (formal) — though see DISC-07 |

---

## 5.14 APPROVAL CRITERIA

| ID | Criterion | Evidence Required | Verification Source | Blocking? |
|---|---|---|---|---|
| AC-049-01 | Board explicitly defines what "Learning Activity" means before or as part of adopting this ADR, given the term's absence from domain-specific AEPs | Definitional statement in ADR | ADR draft itself | Yes |
| AC-049-02 | `DISC-07` cross-batch ordering question (does `014`/`023` approval genuinely wait on `049`?) is explicitly discussed and resolved by the Board | Board discussion record | Future governance note | **Yes — recommended blocking for approval** given cross-batch stakes |
| AC-049-03 | Boundary decision is confirmed consistent with existing M04 Course/Lesson ERD (no silent restructuring of approved baseline) | Explicit cross-check | ERD v1.4-FINAL | Yes |

---

## 6. ADR READINESS SCORE

**READY WITH CONDITIONS.**

**Reason:** Zero Category-A dependency, so drafting is not blocked. **However**, this is the weakest-evidenced of the 5 Batch-1 candidates: its core term ("Learning Activity") is not independently defined in either relevant domain AEP (a genuine `CANDIDATE VALIDITY OBSERVATION`, §5.4), its primary sources are two-word labels rather than elaborated statements, and its dependency-field discrepancy (`DISC-07`) has cross-batch implications (Batch 2 items `MADCR-014/023`) unlike the more contained discrepancies found for `MADCR-036/046/010`. **Recommend the Architecture Review Board request definitional clarification (AC-049-01) as part of, not necessarily before, drafting** — the question itself is real and Gate-1-classified, but the term needs sharpening.
