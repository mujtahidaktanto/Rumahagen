# ADR BATCH 1 — EVIDENCE PACK — MADCR-036
## RUMAHAGEN — Pre-Draft Evidence Pack (NOT AN ADR)

**Status: PRE-DRAFT GOVERNANCE CONTROL ARTIFACT.**

---

## 5.1 IDENTITY

| Field | Value |
|---|---|
| MADCR ID | MADCR-036 |
| Canonical decision title (per MADCR v1.1 §6.4) | "Should Title Definition be modeled as a separate object from an earned Award Instance?" |
| Title variation 1 | "ADR Candidate 1: Separate Title Definition from Award Instance" (`AEP_Title_Business_Rules_Baseline_v1_0.md` §27) |
| Title variation 2 | "CAIA-ADR-007: Title Definition vs Award Instance" (CAIA §28) |
| **Both recorded verbatim, no single canonical title chosen** | — |
| Current MADCR status | OPEN |
| Category | A — Mandatory Architecture Decision |
| Priority | ADR REQUIRED — **highest total-reach candidate in the entire 64-item register (13, per ADR Sequencing Plan §8)** |
| Current sequencing batch | BATCH 1 — Foundation |
| Source file (primary) | `AEP_Title_Business_Rules_Baseline_v1_0.md` |
| Source section (primary) | §4.2 "Title Definition vs Award Instance", §27 "ADR Candidate 1" |
| Source file (secondary) | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` |
| Source section (secondary) | §28, `CAIA-ADR-007` |

---

## 5.2 DECISION QUESTION

**PRIMARY QUESTION** (derived from AEP-TITLE-001 §4.2, which states the requirement as an assertion rather than an interrogative — reproduced faithfully, not rewritten into a leading question):

> Source text (§4.2, verbatim): *"A Title definition is not the same object as an earned Award Instance... This separation is an architectural requirement."*
>
> Normalized as a neutral decision question (MADCR v1.1 §6.4, reproduced unchanged): *"Should Title Definition be modeled as a separate object from an earned Award Instance?"*

**Note on question framing:** unlike `MADCR-010`/`011` (which present genuinely open A-vs-B options in their primary source), this candidate's primary source *asserts* the separation as "an architectural requirement" rather than posing two competing options. **This is recorded as a scope/framing observation, not resolved or acted upon** — see §5.11 for the formal Decision Options check.

**No SECONDARY or UNRESOLVED QUESTION found** — CAIA-ADR-007's terse label ("Title Definition vs Award Instance") is consistent with, not additional to, the primary question.

---

## 5.3 DECISION SCOPE

| Scope dimension | Status | Evidence |
|---|---|---|
| Business scope | IN SCOPE | AEP-TITLE-001 §4.2 ties this to Title Rules "003, 011–013, 021, 022, 023, 037–038, 051–052 and 093–095" |
| Architecture scope | IN SCOPE | Explicitly "architectural requirement" per §4.2 |
| Module scope | IN SCOPE — M15 Title (proposed, new) | AEP-TITLE-001 throughout |
| Organization scope | OUT OF SCOPE (no direct tie found) | — |
| Data scope | IN SCOPE — CRITICAL, per MADCR v1.1 §6.4 "Data" impact column = C (Critical) | MADCR v1.1 §6.4 |
| Integration scope | OUT OF SCOPE (no direct tie found) | — |
| Security scope | INDIRECT — feeds `MADCR-048, 057` (Title RBAC candidates) | MADCR v1.1 §6.4/§6.5 dependency fields |
| Operational scope | UNKNOWN | EVIDENCE NOT LOCATED |

---

## 5.4 EVIDENCE PACK

| Evidence ID | Source | Repository Path | Section/Heading | Exact Reference | What It Proves | Authority Level | Confidence |
|---|---|---|---|---|---|---|---|
| EV-036-01 | AEP Title Business Rules Baseline v1.0 | `/mnt/user-data/uploads/AEP_Title_Business_Rules_Baseline_v1_0.md` | §4.2 | "Rules 003, 011–013, 021, 022, 023, 037–038, 051–052 and 093–095 establish a critical separation: 'A Title definition is not the same object as an earned Award Instance.'" | Confirms the separation is driven by 13 specific Title source rules, not an unsupported assertion | LEVEL 9 (AEP) | HIGH |
| EV-036-02 | AEP Title Business Rules Baseline v1.0 | Same | §27, "ADR Candidate 1" | "Separate Title Definition from Award Instance" | Confirms this is explicitly proposed as an ADR candidate by the source AEP itself | LEVEL 9 | HIGH |
| EV-036-03 | CAIA v1.0 | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §28, `CAIA-ADR-007` | "Title Definition vs Award Instance." | Independent corroboration from the cross-domain impact analysis | LEVEL 9 | HIGH |
| EV-036-04 | Title Business Rules Baseline v1.0 Consolidated | `/mnt/user-data/uploads/Title_Business_Rules_Baseline_v1_0_Consolidated.md` | Rule 013 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." (Final) | Directly-cited source rule confirming Title can exist independent of any single earned credential/instance | LEVEL 1 (Locked, per Title-Rules-are-user-locked status) | HIGH |
| EV-036-05 | Title Business Rules Baseline v1.0 Consolidated | Same | Rule 022 | "Rename Title berlaku global terhadap Title/award terkait." + dependency note: "Rename ≠ new Award; Award Instance tetap sama." | Directly demonstrates the Definition (renameable) vs Instance (persists across rename) separation in a concrete rule | LEVEL 1 | HIGH |
| EV-036-06 | Title Business Rules Baseline v1.0 Consolidated | Same | Rule 023 | "Title yang pernah diberikan tidak boleh hard-delete; dapat dikeluarkan dari active catalog." (Final) | Demonstrates Award Instance historical persistence independent of Title Definition's active/inactive catalog state — another concrete Definition≠Instance data point | LEVEL 1 | HIGH |
| EV-036-07 | Repository re-verification | `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md`, `docs/09-module-planning/` | Full-text search | No Title/Award/M15 entities exist in the current ERD or module planning set | Confirms 0% existing architecture for this domain — genuinely greenfield decision | LEVEL 6 (ERD baseline) | HIGH |

---

## 5.5 BUSINESS RULE TRACEABILITY

| Business Rule | Source | Exact Reference | Relevance | Status | Conflict? |
|---|---|---|---|---|---|
| Title Rule 003 | Title Business Rules Baseline v1.0 Consolidated, line 17 | "Semua earned Title dapat menjadi Primary. Tidak ada pembatasan source yang otomatis melarang Primary." | Cited by AEP §4.2 as a driver rule | Final | No conflict |
| Title Rule 011 | Same, line 30 | "Repeat, Renewal, dan Progression merupakan policy configurable per Title." | Cited driver rule | Final | No conflict |
| Title Rule 012 | Same, line 31 | "Ketika agen memperoleh level berikutnya, Title level sebelumnya tetap Active kecuali policy menentukan sebaliknya." | Cited driver rule | Progression note (not "Final" label, but not conflicting) | No conflict |
| Title Rule 013 | Same, line 32 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." | Cited driver rule (also EV-036-04) | Final | No conflict |
| Title Rule 021 | Same, line 45 | "Perubahan material terhadap business rule menghasilkan new Awarding Rule/Title version. Award lama tetap terkait version saat award diberikan." | Cited driver rule — directly demonstrates version-vs-instance separation | Final | No conflict |
| Title Rule 022 | Same, line 46 (also EV-036-05) | "Rename Title berlaku global terhadap Title/award terkait." | Cited driver rule | Final | No conflict |
| Title Rule 023 | Same, line 47 (also EV-036-06) | "Title yang pernah diberikan tidak boleh hard-delete." | Cited driver rule | Final | No conflict |
| Title Rules 037–038, 051–052, 093–095 | Same document | Not individually re-extracted in this pass (cited by AEP §4.2 range reference) | Cited driver rules | Presumed Final (consistent with document's overall "Final" status pattern for the 100-rule set) | No conflict found in extracted subset |

**No Business Rule Source Gap for this candidate** — unlike `MADCR-010/011`, this candidate's Business Rule basis is fully within the FOUND, user-locked Title 001–100 baseline, not the missing `MBR-COM`/`MBR-LS` sets.

---

## 5.6 AEP TRACEABILITY

| AEP ID | AEP Title | Source | Relevant Section | Relationship to ADR | Status |
|---|---|---|---|---|---|
| AEP-TITLE-001 (MAEP-assigned ID) | Title Business Rules Baseline v1.0 (AEP) | `AEP_Title_Business_Rules_Baseline_v1_0.md` | §4.2, §5.1, §27 | **DIRECT** — this is the originating AEP for this exact candidate | Proposed |
| CAIA-001 (source-native ID) | Current Architecture Impact Analysis | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §28 `CAIA-ADR-007` | **DIRECT** — independently corroborates the same decision | Analysis Complete |

**No AEP modified.**

---

## 5.7 MADCR DEPENDENCIES

| Field | Value | Cross-check result |
|---|---|---|
| Depends On | None (MADCR v1.1 §6.4: "—") | Consistent across MADCR v1.1, ADR Sequencing Plan |
| Blocked By | None | Consistent |
| Blocks (free-text field) | `MADCR-037–043` | ADR Sequencing Plan §8 independently computed Direct Dependents = `037,038,039,040,043,048,053,057` (8) and Indirect = `041,042,054,055,056` (5), Total Reach = **13 — the single highest in the register**. **The free-text field "MADCR-037–043" is a range shorthand that does NOT literally include `048, 053, 057`, even though those three candidates' own formal `Depends On` fields explicitly list `036`** |
| **DEPENDENCY DISCREPANCY** | **Confirmed** | This is the same pattern already logged as `DISC-06`/`REC-01` in the Pre-ADR Discrepancy Register (there framed as "046↔036"), but this evidence pack additionally surfaces that `036`'s own free-text field also under-states its true fan-out relative to `048/053/057` — **extends DISC-06/11 rather than being a wholly new item** |
| Related Decisions | `MADCR-046` (certificates-vs-Title boundary — its own `Blocks` field names `036`, but `036`'s `Depends On` does not reciprocally list `046`; same `DISC-06` pattern) | — |
| Upstream Decisions | None | — |
| Downstream Decisions | `MADCR-037,038,039,040,041,042,043,048,053,054,055,056,057` (13 total, direct+indirect) | — |

---

## 5.8 OPEN DECISION IMPACT

| Open Decision | Impact on MADCR-036 |
|---|---|
| OPEN-Q1 (MADCR-010) | **NOT AFFECTED** — no source ties Title Definition/Instance modeling to Commercial Entitlement/Quota |
| OPEN-Q2 (MADCR-011) | **NOT AFFECTED** — no source ties this to Payment placement |
| OPEN-C01 (AEP-MON-001 vs AEP-MON-002) | **NOT AFFECTED** — this candidate's evidentiary basis is entirely within the Title domain (AEP-TITLE-001, CAIA), with zero Commercial-AEP citation |

**This candidate is the cleanest of the five with respect to Open Decision entanglement — confirmed by direct source inspection, not assumed.**

---

## 5.9 DOWNSTREAM IMPACT

| Artifact | Impact | Evidence |
|---|---|---|
| ERD (M15 Title core tables) | **DIRECT IMPACT** | MAEP v1.1 §22: "Title (M15) ERD — BLOCKED, blocked by MADCR-036" |
| API | **INDIRECT IMPACT** | Standard downstream chain |
| RBAC | **INDIRECT IMPACT** | Via `MADCR-048, 057` |
| RLS | **INDIRECT IMPACT** | Inferred, no direct statement |
| PRD | **INDIRECT IMPACT** | Standard chain |
| UI | **INDIRECT IMPACT** | Presentation-state candidates (`MADCR-040`) depend on this |
| Workflow | **INDIRECT IMPACT** | Awarding/appeal workflow candidates (`MADCR-037,042`) depend on this |
| Event model | UNKNOWN | EVIDENCE NOT LOCATED |
| Integration | OUT OF SCOPE (no source ties Title to external integrations) | — |
| Migration | **INDIRECT IMPACT** | No new-wave migration exists yet |
| Reporting/Analytics | UNKNOWN | EVIDENCE NOT LOCATED |
| Operational model | UNKNOWN | EVIDENCE NOT LOCATED |
| Implementation | **NO KNOWN IMPACT YET** — 0% implementation | CURRENT-PROJECT-STATE-rev10 |

---

## 5.10 ARCHITECTURE IMPACT

- **M15 Title** (proposed, new module — no existing repository precedent)
- **Data ownership** — foundational data-model split (Definition vs Instance) that all 12 downstream Title/Security candidates build on
- **Existing M04 Learning Center `certificates` table** — explicitly NOT to be conflated with this new model (cross-referenced with `MADCR-046`, CAIA §6.3)

---

## 5.11 DECISION OPTIONS

**NO FORMAL A-VS-B OPTIONS FOUND IN AUTHORITATIVE SOURCES.** Unlike `MADCR-010`/`011`, this candidate's primary source (AEP-TITLE-001 §4.2) presents the separation as a stated architectural requirement ("This separation is an architectural requirement") rather than a choice between named alternatives. **No options invented here** — this is recorded as-is, per §5.11 instruction ("If none exist: write NO FORMAL OPTIONS FOUND").

---

## 5.12 CONSEQUENCE EVIDENCE

Since no competing options exist in the source (§5.11), formal option-by-option consequence analysis is not applicable. The source AEP does state supporting rationale for the *asserted* separation:

| Claim | Classification | Evidence |
|---|---|---|
| "The target architecture should not treat Title as a single flat attribute attached to an agent" | Constraint (stated rationale) | AEP-TITLE-001 §1 |
| Multiple Title authorities/scopes, configurable Awarding Paths, multiple qualification sources, prerequisites, lifecycle states, appeal/Stay Policy, renewal/requalification, independent Primary/Featured presentation all require this separation | Dependency (stated rationale, listed together in §1) | AEP-TITLE-001 §1 |

**No speculative claim beyond what the source states.**

---

## 5.13 APPROVAL PREREQUISITES

| Prerequisite | Status |
|---|---|
| Business decision | None found required — Title Rules are already user-locked/Final |
| Source recovery | None required — Business Rule basis fully FOUND (§5.5) |
| Dependency reconciliation | `DISC-06`/`DISC-11` pattern (free-text `Blocks` field under-states true fan-out) should be corrected in MADCR v1.2, does not block this ADR |
| Security review | Recommended given downstream RBAC impact (`MADCR-048,057`), not explicitly required by source |
| Technology confirmation | None found required |
| Another ADR approval | None — zero Category-A prerequisites |

---

## 5.14 APPROVAL CRITERIA

| ID | Criterion | Evidence Required | Verification Source | Blocking? |
|---|---|---|---|---|
| AC-036-01 | Board confirms the Definition/Instance separation as architecturally adopted (given no competing option exists, this is a confirmation, not a selection among alternatives) | Recorded Board decision | Future ADR | Yes |
| AC-036-02 | Cross-check against all 13 cited Title Rules (003,011–013,021–023,037–038,051–052,093–095) confirms no contradiction | Explicit rule-by-rule review | Title Business Rules Baseline v1.0 Consolidated | Yes |
| AC-036-03 | `MADCR-046` (certificates-vs-Title boundary) is drafted in the same batch/session to ensure consistent M04/M15 data-model boundary framing | Joint Session 1 review | ADR Sequencing Plan §12 | No (recommended, not a hard block) |
| AC-036-04 | Downstream Title ERD authors notified once decision closes | Governance record | Future governance log | Yes |

---

## 6. ADR READINESS SCORE

**READY FOR ADR DRAFTING.**

**Reason:** Zero Category-A dependency; the strongest Business Rule traceability of all 5 Batch-1 candidates (13 specific, Final-status Title Rules cited, 3 independently re-verified verbatim in this pass); zero Open-Decision entanglement (§5.8, uniquely clean among the 5); one dependency-field discrepancy noted (extends `DISC-06/11`, non-blocking); no competing options exist in source, so this is a confirmation-style ADR rather than an A-vs-B selection — arguably the most straightforward of the 5 Batch-1 candidates to draft.
