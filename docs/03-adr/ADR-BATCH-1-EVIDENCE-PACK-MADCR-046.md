# ADR BATCH 1 — EVIDENCE PACK — MADCR-046
## RUMAHAGEN — Pre-Draft Evidence Pack (NOT AN ADR)

**Status: PRE-DRAFT GOVERNANCE CONTROL ARTIFACT.**

---

## 5.1 IDENTITY

| Field | Value |
|---|---|
| MADCR ID | MADCR-046 |
| Canonical decision title (per MADCR v1.1 §6.4) | "Where is the boundary between the existing `certificates` table (M04) and the new Title/Award Instance model (M15) — are they ever the same record?" |
| Title variation 1 | "CAIA-ADR-010: Certificate/Credential vs Title separation" (CAIA §28) |
| Title variation 2 | "Certificate/Credential vs Title boundary" (CAIA §29 Gate 1, item 3; Gate v1.3 §4.3) |
| **Both recorded verbatim, no single canonical title chosen** | — |
| Current MADCR status | OPEN |
| Category | A — Mandatory Architecture Decision |
| Priority | ADR REQUIRED |
| Current sequencing batch | BATCH 1 — Foundation |
| Source file (primary) | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` |
| Source section (primary) | §6.3 "Impact" (Learning), §28 `CAIA-ADR-010`, §29 Gate 1 item 3 |
| Source file (secondary) | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` |
| Source section (secondary) | §4.3 "Other ADR questions" (lists "Certificate/Credential vs Title" as remaining open) |

---

## 5.2 DECISION QUESTION

**PRIMARY QUESTION** (CAIA §6.3, verbatim assertion, normalized to neutral question form per MADCR v1.1 §6.4):

> Source text (§6.3, verbatim): *"The current `certificates` table must not automatically become the new Title Award Instance. Certificate/Credential and Title/Award must remain separate."*
>
> Normalized question (MADCR v1.1 §6.4): *"Where is the boundary between the existing `certificates` table (M04) and the new Title/Award Instance model (M15) — are they ever the same record?"*

**Note on framing:** like `MADCR-036`, the primary source states a prohibition ("must not automatically become") rather than posing an open A-vs-B choice. The normalized question in MADCR v1.1 is broader than the source's flat prohibition — it asks about the *boundary*, not just whether auto-conversion is disallowed. **This broader framing is retained as-is (it is MADCR v1.1's own normalization, not altered here), but the distinction is recorded as a scope observation.**

**No SECONDARY question found.** Gate v1.3 §4.3 lists "Certificate/Credential vs Title" tersely among "Other ADR questions" without additional detail beyond confirming it remains open.

---

## 5.3 DECISION SCOPE

| Scope dimension | Status | Evidence |
|---|---|---|
| Business scope | INDIRECT | CAIA §6.3 frames this as architecture impact, not a business rule statement |
| Architecture scope | IN SCOPE — CRITICAL | CAIA §6.3: "CRITICAL — ERD, API, PRD, User Flow, RBAC, System Architecture and test strategy all change" |
| Module scope | IN SCOPE — M04 (existing) and M15 (proposed) | CAIA §6.3 |
| Organization scope | OUT OF SCOPE | — |
| Data scope | IN SCOPE — the entire question is about a specific table's fate | CAIA §6.3 |
| Integration scope | OUT OF SCOPE (no source ties this to external integration) | — |
| Security scope | INDIRECT — feeds `MADCR-048` (Title RBAC) per shared dependency chain | MADCR v1.1 §6.4 |
| Operational scope | UNKNOWN | EVIDENCE NOT LOCATED |

---

## 5.4 EVIDENCE PACK

| Evidence ID | Source | Repository Path | Section/Heading | Exact Reference | What It Proves | Authority Level | Confidence |
|---|---|---|---|---|---|---|---|
| EV-046-01 | CAIA v1.0 | `/mnt/user-data/uploads/RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §6.3 | "The current `certificates` table must not automatically become the new Title Award Instance. Certificate/Credential and Title/Award must remain separate." | Confirms the explicit prohibition and CRITICAL-impact classification | LEVEL 9 | HIGH |
| EV-046-02 | CAIA v1.0 | Same | §28, `CAIA-ADR-010` | "Certificate/Credential vs Title separation." | Confirms this is formally listed as an ADR candidate | LEVEL 9 | HIGH |
| EV-046-03 | CAIA v1.0 | Same | §29, Gate 1, item 3 | "Certificate/Credential vs Title boundary." | Confirms Gate-1 (pre-ERD) classification | LEVEL 9 | HIGH |
| EV-046-04 | Master BR Final Traceability Gate v1.3 | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` | §4.3 | "Other ADR questions... Remain open: ... Certificate/Credential vs Title." | Independently corroborates from the Master BR governance layer (Level 4), not just CAIA (Level 9) | LEVEL 4 | HIGH |
| EV-046-05 | CAIA v1.0 | Same | §5.2 | "The existing: courses; course lessons; quizzes; enrollments; quiz attempts; certificates — remain useful. They should become the foundation of the broader Learning domain rather than being discarded." | Confirms `certificates` is explicitly meant to be RETAINED, not deleted — clarifying the question is about *boundary*, not about removing the existing table | LEVEL 9 | HIGH |
| EV-046-06 | Repository re-verification | `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md`, `supabase/migrations/0009_m04_learning_center*.sql` | Full-text search | Confirms `certificates` table exists in the current, approved ERD/migration for M04, with no Title-related columns or foreign keys | LEVEL 6 (ERD), LEVEL 7 (migration, written not executed) | HIGH |

---

## 5.5 BUSINESS RULE TRACEABILITY

| Business Rule | Source | Exact Reference | Relevance | Status | Conflict? |
|---|---|---|---|---|---|
| Title Rule 013 | Title Business Rules Baseline v1.0 Consolidated, line 32 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." | Directly relevant — establishes that Title *may* relate to a Credential but is not defined as identical to one | Final | No conflict — actually supports the CAIA §6.3 separation |
| No M04 Learning Center Business Rule found specifically addressing `certificates`-vs-Title | — | — | **BUSINESS RULE SOURCE GAP** for the M04 side of this boundary — the existing Learning Center rules (legacy BR-001–151, LE-001–059) do not appear to explicitly discuss Title interaction | — | UNKNOWN — absence, not a conflict |

---

## 5.6 AEP TRACEABILITY

| AEP ID | AEP Title | Source | Relevant Section | Relationship to ADR | Status |
|---|---|---|---|---|---|
| CAIA-001 (source-native ID) | Current Architecture Impact Analysis | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §6.3, §28, §29 | **DIRECT** — CAIA is the sole originating source for this exact candidate | Analysis Complete |
| AEP-TITLE-001 (MAEP-assigned ID) | Title Business Rules Baseline v1.0 (AEP) | `AEP_Title_Business_Rules_Baseline_v1_0.md` | Not directly addressed — this AEP focuses on the *internal* Title domain model (Definition/Instance/Path/Provenance), not the M04-boundary question | **INDIRECT** — shares Rule 013 as common evidentiary ground, but does not itself discuss `certificates` | Proposed |
| AEP-LE-001 (MAEP-assigned ID) | Learning Economy AEP | `AEP_Learning_Economy_v1_0.md` | Not directly addressed | **REFERENCE ONLY** — general Learning-domain adjacency | Proposed |

---

## 5.7 MADCR DEPENDENCIES

| Field | Value | Cross-check result |
|---|---|---|
| Depends On | None (formal, MADCR v1.1 §6.4: "—") | Consistent — **but see Discrepancy below** |
| Blocked By | None (formal) | Consistent |
| Blocks (free-text field) | `MADCR-036, Title ERD` | ADR Sequencing Plan §8 independently computed: `MADCR-046` has **zero** direct/indirect dependents in the formal reverse-edge graph (its `Blocks` claim of `MADCR-036` is not mirrored by `MADCR-036`'s own `Depends On` field, which lists "—") |
| **DEPENDENCY DISCREPANCY** | **Confirmed — this is `DISC-06`, already logged in the Pre-ADR Discrepancy Register, re-verified here directly against both rows' exact text** | `MADCR-046` claims (via its free-text field) to block `MADCR-036`, the highest-fan-out candidate in the entire register — if this claim is accurate, it would mean `MADCR-046` should be resolved *before* `MADCR-036`, not merely alongside it in the same Batch 1. **This is not resolved here; both remain in Batch 1 per existing sequencing, with the ordering question flagged for Board attention** |
| Related Decisions | `MADCR-036` (per the discrepancy above) | — |
| Upstream Decisions | Disputed — see discrepancy | — |
| Downstream Decisions | Title ERD (non-A artifact) | — |

---

## 5.8 OPEN DECISION IMPACT

| Open Decision | Impact on MADCR-046 |
|---|---|
| OPEN-Q1 (MADCR-010) | **NOT AFFECTED** |
| OPEN-Q2 (MADCR-011) | **NOT AFFECTED** |
| OPEN-C01 (AEP-MON-001 vs AEP-MON-002) | **NOT AFFECTED** — zero Commercial-domain citation |

---

## 5.9 DOWNSTREAM IMPACT

| Artifact | Impact | Evidence |
|---|---|---|
| ERD | **DIRECT IMPACT** | CAIA §6.3: "CRITICAL — ERD... change"; MAEP v1.1 §22 lists Title ERD as blocked by this |
| API | **DIRECT IMPACT** | CAIA §6.3 explicitly lists "API" among changed artifacts |
| RBAC | **DIRECT IMPACT** | CAIA §6.3 explicitly lists "RBAC" |
| RLS | **INDIRECT IMPACT** | Not explicitly named by CAIA §6.3, inferred from RBAC impact |
| PRD | **DIRECT IMPACT** | CAIA §6.3 explicitly lists "PRD" |
| UI | UNKNOWN (not explicitly named, though "User Flow" is) | — |
| Workflow / User Flow | **DIRECT IMPACT** | CAIA §6.3 explicitly lists "User Flow" |
| Event model | UNKNOWN | EVIDENCE NOT LOCATED |
| Integration | OUT OF SCOPE | — |
| Migration | **INDIRECT IMPACT** | Existing `0009_m04_learning_center` migration already contains `certificates` — any M15 boundary decision does not require altering this existing migration file, only adding new M15-side structures |
| Reporting/Analytics | UNKNOWN | EVIDENCE NOT LOCATED |
| Operational model | UNKNOWN | EVIDENCE NOT LOCATED |
| Implementation | **NO KNOWN IMPACT YET** — 0% implementation | CURRENT-PROJECT-STATE-rev10 |
| Test strategy | **DIRECT IMPACT** | CAIA §6.3 explicitly lists "test strategy" |

**This candidate has the most explicitly-enumerated CRITICAL downstream impact list of all 5 Batch-1 candidates**, directly quoted from source rather than inferred.

---

## 5.10 ARCHITECTURE IMPACT

- **M04 Learning Center** (existing, approved) — specifically its `certificates` table
- **M15 Title** (proposed, new)
- **Data ownership boundary** between the two modules — the central question
- **`certificates` table is explicitly to be RETAINED** (EV-046-05) — this is not a "delete and replace" question, it is a "coexistence boundary" question

---

## 5.11 DECISION OPTIONS

**NO FORMAL A-VS-B OPTIONS FOUND IN AUTHORITATIVE SOURCES.** CAIA §6.3 states a prohibition ("must not automatically become") and an outcome requirement ("must remain separate") but does not present named alternative architectural approaches for *how* the boundary should be technically drawn (e.g., no source offers "Option A: shared table with type discriminator" vs "Option B: fully separate tables" as named choices). **No options invented here.**

---

## 5.12 CONSEQUENCE EVIDENCE

Since no competing options exist in the source, consequence analysis is limited to the stated rationale:

| Claim | Classification | Evidence |
|---|---|---|
| Auto-converting `certificates` to Title Award Instance would violate CAIA's explicit prohibition | Risk (of non-compliance if not observed) | CAIA §6.3 |
| Both must "remain separate" while `certificates` is simultaneously "retained as foundation" | Constraint | CAIA §6.3, §5.2 |

**No speculative claim beyond what the source states.**

---

## 5.13 APPROVAL PREREQUISITES

| Prerequisite | Status |
|---|---|
| Business decision | None found required |
| Source recovery | None required — evidence base fully FOUND |
| Dependency reconciliation | **DISC-06 should be explicitly addressed before or during drafting** — given this candidate's claimed blocking relationship to the register's highest-fan-out item (`MADCR-036`), this is the most consequential of the four dependency-field discrepancies found across the Batch-1 set |
| Security review | Recommended (RBAC is explicitly a DIRECT-impact artifact, §5.9) |
| Technology confirmation | None found required |
| Another ADR approval | None (formal) — though see DISC-06 ordering question |

---

## 5.14 APPROVAL CRITERIA

| ID | Criterion | Evidence Required | Verification Source | Blocking? |
|---|---|---|---|---|
| AC-046-01 | Board confirms the `certificates`/Title separation as architecturally adopted | Recorded Board decision | Future ADR | Yes |
| AC-046-02 | `DISC-06` ordering question (does `046` genuinely need to precede `036`?) is explicitly discussed and resolved by the Board — even if the resolution is "no reordering needed," this should be recorded | Board discussion record | Future ADR or governance note | **Yes — recommended as blocking for approval, though not for drafting** |
| AC-046-03 | Confirms `certificates` table itself is not altered/deleted by this decision (only its relationship boundary is defined) | Explicit statement in ADR | ADR draft itself | Yes |
| AC-046-04 | Downstream Title ERD/API/RBAC/PRD/User-Flow/Test-strategy authors notified once decision closes | Governance record | Future governance log | Yes |

---

## 6. ADR READINESS SCORE

**READY WITH CONDITIONS.**

**Reason:** Evidence pack is complete and strong (6 items, all HIGH confidence, including independent Level-4 corroboration from Gate v1.3); zero Open-Decision entanglement; the single most explicitly-detailed downstream-impact list among the 5 Batch-1 candidates. **The condition:** `DISC-06` (this candidate's free-text claim of blocking `MADCR-036`, the register's highest-fan-out item, unmirrored in `036`'s own dependency field) should be explicitly discussed by the Architecture Review Board — ideally in the same session as `MADCR-036` itself — before this candidate's ADR moves to approval, to settle whether a real ordering dependency exists or the free-text field is simply imprecise.
