# ADR BATCH 1 — EVIDENCE PACK — MADCR-011
## RUMAHAGEN — Pre-Draft Evidence Pack (NOT AN ADR)

**Status: PRE-DRAFT GOVERNANCE CONTROL ARTIFACT.**

---

## 5.1 IDENTITY

| Field | Value |
|---|---|
| MADCR ID | MADCR-011 |
| Canonical decision title (per MADCR v1.1 §6.1) | "Should Payment be modeled as a subdomain of Commercial (M14), or as a separate logical module (M16)?" |
| Title variation 1 | `OPEN-Q2` (Gate v1.3 §4.2 label) |
| Title variation 2 | "Whether Payment is a Commercial subdomain or separate logical module" (CAIA §29, Gate 1, item 6) |
| Title variation 3 | "Payment placement" (Gate v1.3 §4.2 heading) |
| **All three recorded verbatim, no canonical title chosen** | — |
| Current MADCR status | OPEN |
| Category | A — Mandatory Architecture Decision |
| Priority | ADR REQUIRED (MADCR v1.1 §7, rank 23) |
| Current sequencing batch | BATCH 1 — Foundation |
| Source file (primary) | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` |
| Source section (primary) | §4.2 "Payment placement" |
| Source file (secondary) | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` |
| Source section (secondary) | §29, Gate 1, item 6 |

---

## 5.2 DECISION QUESTION

**PRIMARY QUESTION** (verbatim, Gate v1.3 §4.2):

> *"The Master BR does not decide whether Payment is: [a] a Commercial subdomain; or [b] a separate logical module bounded behind Commercial. The existing Commercial AEP/ADR candidates must settle this. This is architecture, not a Business Rule."*

**SECONDARY QUESTION** (CAIA §29, Gate 1, item 6): *"Whether Payment is a Commercial subdomain or separate logical module."*

**Notable primary-source instruction:** Gate v1.3 §4.2 explicitly assigns resolution responsibility to *"the existing Commercial AEP/ADR candidates"* — i.e., it does not claim to answer this itself and explicitly hands it to the ADR process this evidence pack is preparing for. **Not answered here either.**

---

## 5.3 DECISION SCOPE

| Scope dimension | Status | Evidence |
|---|---|---|
| Business scope | INDIRECT — Gate v1.3 §4.2 explicitly states "This is architecture, not a Business Rule" | Gate v1.3 §4.2 |
| Architecture scope | IN SCOPE — explicitly framed as architecture | Gate v1.3 §4.2 |
| Module scope | IN SCOPE — M14 vs M16 | Gate v1.3 §4.2, CAIA §29 |
| Organization scope | OUT OF SCOPE — no source ties this to Organization/Agency | — |
| Data scope | IN SCOPE (implied) — module boundary determines table/schema ownership | MAEP v1.1 §22 "Payment ERD/API (M14 subdomain vs M16)" |
| Integration scope | IN SCOPE — Payment Gateway provider integration sits within whichever module is chosen | AEP-MON-001 §8 |
| Security scope | INDIRECT — feeds `MADCR-055` (Commercial admin permissions) | MADCR v1.1 §6.1 dependency field |
| Operational scope | UNKNOWN | EVIDENCE NOT LOCATED |

---

## 5.4 EVIDENCE PACK

| Evidence ID | Source | Repository Path | Section/Heading | Exact Reference | What It Proves | Authority Level | Confidence |
|---|---|---|---|---|---|---|---|
| EV-011-01 | Master BR Final Traceability Gate v1.3 | `/mnt/user-data/uploads/RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` | §4.2 | "STATUS: OPEN... The existing Commercial AEP/ADR candidates must settle this." | Confirms OPEN status and explicit deferral to ADR process | LEVEL 4 | HIGH |
| EV-011-02 | CAIA v1.0 | `/mnt/user-data/uploads/RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §29, Gate 1, item 6 | "Whether Payment is a Commercial subdomain or separate logical module." | Corroborates independently, confirms Gate-1 classification | LEVEL 9 | HIGH |
| EV-011-03 | AEP Monetization v1.0 | `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` | §8 "Payment Gateway Architecture" | "Payment Gateway is an integration domain. The architecture should use a provider adapter abstraction... The core application must not be tightly coupled to one gateway." | Describes Payment's *internal* adapter architecture, but does not state whether Payment sits inside M14 or as separate M16 | LEVEL 9 | MEDIUM — relevant context, does not answer the module-boundary question |
| EV-011-04 | AEP Monetization v1.1 (AEP-MON-002) | `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` | §15 "Billing/Payment Boundary" | "Exact payment gateway, pricing and tax behavior must be inherited from existing approved documents rather than invented by this proposal." | Confirms AEP-MON-002 explicitly does not address the module-placement question, deferring elsewhere | LEVEL 9 | MEDIUM |
| EV-011-05 | Repository re-verification | `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md`, `docs/01-product/PRD-RUMAHAGEN-v1.3-FINAL.md` | Full-text search | No "M16" module exists anywhere in the 13-module (M01–M13) baseline; no existing ADR addresses Payment module placement | Confirms 0% formalized, M16 is a candidate label, not an approved module | LEVEL 2/8 (PRD) | HIGH |

---

## 5.5 BUSINESS RULE TRACEABILITY

| Business Rule | Source | Exact Reference | Relevance | Status | Conflict? |
|---|---|---|---|---|---|
| AEP-MON-001 Architecture Principle 8 | `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` §16 | "Payment provider must be replaceable through an adapter boundary." | Establishes a principle Payment must satisfy *regardless* of module placement — informs but does not answer this question | Proposed | No conflict |
| Legacy BR (OTP/security invariants) | `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.docx` §23-equivalent | OTP request/verification/retry limits | Not directly about module placement — **BUSINESS RULE SOURCE GAP** for this specific question | LOCKED (for its own scope) | No conflict — simply not relevant to module boundary |
| `MBR-COM-001–013` (referenced) | Cited by Commercial BR Reconciliation | — | Potentially relevant if it addresses Payment domain ownership | **BUSINESS RULE SOURCE GAP** — NOT FOUND | UNKNOWN | Cannot assess |

**No Business Rule directly and explicitly answers the M14-vs-M16 module-placement question — confirmed genuine architecture-only question, consistent with Gate v1.3 §4.2's own framing.**

---

## 5.6 AEP TRACEABILITY

| AEP ID | AEP Title | Source | Relevant Section | Relationship to ADR | Status |
|---|---|---|---|---|---|
| AEP-MON-001 | Monetization, Subscription, Promotion & Payment Gateway | `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` | §8–14 (full Payment Gateway architecture) | **DIRECT** — this AEP's entire §8–14 content describes Payment's internal design, and is the single most relevant document for whichever module houses it | Proposed |
| AEP-MON-002 | Monetization, Subscription & Promotion Architecture Alignment | `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` | §15 | **REFERENCE ONLY** — explicitly defers Payment specifics elsewhere | Revised |
| CAIA-001 | Current Architecture Impact Analysis | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | §29 Gate 1 item 6 | **DIRECT** — explicit Gate-1 listing | Analysis Complete |

**Note (per Commercial AEP Reconciliation, Workstream A of Pre-ADR cycle):** the relationship between AEP-MON-001 and AEP-MON-002 is itself `OPEN-C01`/unresolved — see §5.8 below for how this affects `MADCR-011`.

---

## 5.7 MADCR DEPENDENCIES

| Field | Value | Cross-check result |
|---|---|---|
| Depends On | None (MADCR v1.1 §6.1: "—") | Consistent |
| Blocked By | None | Consistent |
| Blocks (free-text field) | `MADCR-002,003; Payment ERD` | ADR Sequencing Plan §8 independently computed Direct Dependents = `002, 053, 055` (3), Indirect = `003, 005, 048, 054, 056, 057` (6), Total Reach = 9 — **the free-text field's `003` claim is actually an *indirect* dependent (via 002), not a direct one, and the free-text field omits `053` and `055` despite both explicitly listing `MADCR-011` in their own formal `Depends On` fields** |
| **DEPENDENCY DISCREPANCY** | **Confirmed, new finding** | `MADCR-011`'s free-text `Blocks` field is *incomplete* relative to the formal `Depends On` fields of `053` and `055`, both of which correctly list `011` as a prerequisite. This is a variant of the same pattern already logged as `DISC-06/07/08/11` in the Pre-ADR Discrepancy Register — **not previously itemized for this specific direction (011→053/055), recorded here as an extension, not fixed** |
| Related Decisions | `MADCR-002` (Payment adapter, most directly dependent) | — |
| Upstream Decisions | None | — |
| Downstream Decisions | `MADCR-002, 003, 005, 048, 054, 055, 056, 057` (per full transitive closure) | — |

---

## 5.8 OPEN DECISION IMPACT

| Open Decision | Impact on MADCR-011 |
|---|---|
| OPEN-Q1 (MADCR-010) | **AFFECTED BUT NOT BLOCKED** — both feed `MADCR-055` jointly, but resolving one does not require resolving the other first |
| OPEN-Q2 | **This candidate IS OPEN-Q2** |
| OPEN-C01 (AEP-MON-001 vs AEP-MON-002) | **REQUIRES GOVERNANCE RECONCILIATION** — since AEP-MON-001 is the primary source for Payment's internal architecture (§5.6) and AEP-MON-002 explicitly defers to "existing approved documents" without naming AEP-MON-001, the ADR drafter should be aware this citation chain rests on an unconfirmed document relationship (Commercial AEP Reconciliation, Workstream A, Pre-ADR cycle) |

**Not resolved here.**

---

## 5.9 DOWNSTREAM IMPACT

| Artifact | Impact | Evidence |
|---|---|---|
| ERD (Payment tables, wherever housed) | **DIRECT IMPACT** | MAEP v1.1 §22: "Payment ERD/API (M14 subdomain vs M16) — BLOCKED, blocked by MADCR-011" |
| API | **DIRECT IMPACT** | Same |
| RBAC | **INDIRECT IMPACT** | Via `MADCR-055` |
| RLS | **INDIRECT IMPACT** | No direct statement, inferred from standard chain |
| PRD | **INDIRECT IMPACT** | Standard chain |
| UI | UNKNOWN | EVIDENCE NOT LOCATED |
| Workflow | UNKNOWN | EVIDENCE NOT LOCATED |
| Event model | **INDIRECT IMPACT** | Payment lifecycle events (AEP-MON-001 §9) would be scoped by whichever module owns Payment |
| Integration | **DIRECT IMPACT** | Payment Gateway provider integration (AEP-MON-001 §8) |
| Migration | **INDIRECT IMPACT** | No new-wave migration exists yet |
| Reporting/Analytics | UNKNOWN | EVIDENCE NOT LOCATED |
| Operational model | UNKNOWN | EVIDENCE NOT LOCATED |
| Implementation | **NO KNOWN IMPACT YET** — 0% implementation | CURRENT-PROJECT-STATE-rev10 |

---

## 5.10 ARCHITECTURE IMPACT

- **M14 Commercial** (proposed) — candidate host for Payment if Option "subdomain" is chosen
- **M16** — candidate new module label if Option "separate module" is chosen (not an existing module — `M01–M13` baseline unaffected either way)
- **Integration boundary** — Payment Gateway provider adapter pattern (existing precedent: Search/Maps/Job-Queue adapter pattern already established for M01–M13, per `technology-decisions-v1.6` §4.29–4.32, cited as a reusable pattern in prior MAEP work — not itself authoritative for this specific decision, offered as architectural-pattern context only)
- **Data ownership** — which module's schema owns payment transaction records

---

## 5.11 DECISION OPTIONS

**Formal options ARE found in the authoritative source** (Gate v1.3 §4.2, verbatim):

> **Option [a]:** "a Commercial subdomain"
>
> **Option [b]:** "a separate logical module bounded behind Commercial"

**Reproduced exactly as stated — neither recommended nor evaluated further.**

---

## 5.12 CONSEQUENCE EVIDENCE

**No evidence-supported consequence analysis exists in any authoritative source.** Gate v1.3 §4.2 states the two options and defers entirely to "the existing Commercial AEP/ADR candidates" without itself analyzing trade-offs.

| Option | Positive | Negative | Risk | Constraint | Dependency | Unknown |
|---|---|---|---|---|---|---|
| [a] Commercial subdomain | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED | Must satisfy AEP-MON-001 §16 Principle 8 (adapter-replaceable) regardless | — | All consequence dimensions |
| [b] Separate M16 module | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED | Would introduce a 14th+ module beyond the existing M01–M13 baseline — no source discusses this cost | — | All consequence dimensions |

---

## 5.13 APPROVAL PREREQUISITES

| Prerequisite | Status |
|---|---|
| OPEN-C01 clarification (AEP-MON-001 vs AEP-MON-002 relationship) | Recommended before this ADR's *approval* — the primary evidentiary basis (AEP-MON-001 §8–14) rests on an unconfirmed document relationship |
| Business decision on OD-11 (overall monetization model) | Non-blocking context per MADCR v1.1 §0A.4 |
| Source recovery for `MBR-COM-001–013` | Not confirmed required, but limits independent verification |
| Dependency reconciliation | The new `Blocks`-field-incompleteness finding (§5.7) should be corrected in a future MADCR v1.2 pass |
| Security review | Not explicitly required by source, but downstream RBAC impact (`MADCR-055`) suggests prudence |
| Technology confirmation | None found required |
| Another ADR approval | None — zero Category-A prerequisites |

---

## 5.14 APPROVAL CRITERIA

| ID | Criterion | Evidence Required | Verification Source | Blocking? |
|---|---|---|---|---|
| AC-011-01 | Board has formally selected one of the two documented options | Recorded Board decision | Future ADR | Yes |
| AC-011-02 | Selected option's consistency with AEP-MON-001 §16 Principle 8 (adapter-replaceable) is confirmed | Explicit cross-check | AEP-MON-001 | Yes |
| AC-011-03 | OPEN-C01 (AEP-MON-001/002 relationship) is at minimum acknowledged in the ADR's evidence section, even if not fully resolved | Explicit citation-chain disclosure | ADR draft itself | No (documentation quality, not a hard block) |
| AC-011-04 | Downstream Payment ERD/API authors notified once decision closes | Governance record | Future governance log | Yes |

---

## 6. ADR READINESS SCORE

**READY FOR ADR DRAFTING.**

**Reason:** Zero Category-A dependency; both options explicitly documented verbatim in a Level-4 authoritative source (Gate v1.3 §4.2); evidence pack complete (5 items, 3 HIGH + 2 MEDIUM confidence). One new dependency-field discrepancy found (§5.7) and one AEP-relationship caveat (§5.8, OPEN-C01) are both non-blocking for drafting — they affect approval-stage confidence, not draftability. Proceeds to ADR draft shell.
