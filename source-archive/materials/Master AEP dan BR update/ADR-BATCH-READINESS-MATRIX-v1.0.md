# ADR BATCH READINESS MATRIX v1.0
## RUMAHAGEN — Batch Preparation (NOT ADR Drafting)

**Status:** GOVERNANCE PLANNING ARTIFACT — NO ADR CONTENT WRITTEN
**Basis:** Dependency evidence imported from `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` (Sessions 1–6, S0–S4/DEFERRED lanes) — remapped into the BATCH 0–6 taxonomy required by this task, not re-derived from scratch.

---

# BATCH 0 — ADR GOVERNANCE SETUP

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-022` | Formalize Learning Session-in-Learning-Domain as numbered repo ADR | G (Already Decided) | None | — | Yes | None | No | No — already settled | N/A (governance record only) | BATCH 0 | Consistent direction across every source, only needs formal ADR numbering |
| `MADCR-029` | Formalize provider-credentials-server-side as numbered repo ADR (inherits existing security architecture) | G (Already Decided) | None | — | Yes | None | No | No | N/A | BATCH 0 | Same pattern |
| `MADCR-059` | Migration `-FIXED` canonicalization | F (Governance) | None | Sprint S0 | Yes | None | No | No | N/A (execution task) | BATCH 0 | Independent existing-baseline blocker, not a new-wave item |
| `MADCR-012` (OPEN-C01) | AEP-MON-001 vs AEP-MON-002 relationship clarification | F (Governance) | None | Session/Batch 2 Commercial cluster approval | Partial — see Commercial AEP Reconciliation (Workstream A) | Relationship never explicitly documented in either source | Yes — Business Owner intent | No | N/A | BATCH 0 | Recommended closed before Commercial ADRs move to approval |
| DISC-06/07/08 (MADCR dependency hygiene) | MADCR v1.2 hygiene pass | F (Governance) | None | None (low practical impact) | Yes | None | No | No | N/A | BATCH 0 | Document Custodian action |
| D-01/D-02 (ADR inventory hygiene) | MADCR v1.2 count correction; `technology-decisions` refresh | F (Governance) | None | None | Yes | None | No | No | N/A | BATCH 0 | Document Custodian action |

---

# BATCH 1 — FOUNDATION

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-036` | Title Definition vs Award Instance | A | None | 8 direct + 5 indirect (13 total) | Yes | None | No | **Yes** | DRAFTABLE | BATCH 1 | Highest fan-out in entire register |
| `MADCR-011` | OPEN-Q2: Payment M14 vs M16 | A | None | 3 direct + 6 indirect (9 total) | Yes | None | Partial (business-model framing via OD-11 context) | **Yes** | DRAFTABLE | BATCH 1 | 2nd-highest fan-out; CAIA Gate-1 |
| `MADCR-010` | OPEN-Q1: Entitlement vs Org Quota | A | None | 3 direct + 4 indirect (7 total) | Yes | None | Partial (same OD-11 context) | **Yes** | DRAFTABLE | BATCH 1 | 3rd-highest fan-out; CAIA Gate-1 |
| `MADCR-046` | `certificates`(M04) vs Title(M15) boundary | A | None (formal); disputed vs 036 (§C.2) | Title ERD | Yes | REC-01 discrepancy noted | No | **Yes** | DRAFTABLE | BATCH 1 | CAIA Gate-1 |
| `MADCR-049` | Learning Activity vs Course boundary | A | None (formal); disputed vs 014/023 (§C.2) | Learning Economy/Session ERD | Yes | REC-02 discrepancy noted | No | **Yes** | DRAFTABLE | BATCH 1 | CAIA Gate-1 |

---

# BATCH 2 — DOMAIN ARCHITECTURE

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-001` | Subscription≠Entitlement≠RBAC | A | `MADCR-013` (context, non-blocking) | `MADCR-005` | Yes | None | No | **Yes** | DRAFTABLE | BATCH 2 | Domain-local Commercial foundation |
| `MADCR-004` | Purchase-time price/promo snapshot | A | None | — | Yes | None | No | **Yes** | DRAFTABLE | BATCH 2 | — |
| `MADCR-014` | Learning Point ledger domain | A | None | 3 (`015,016,056`) | Yes | None | No | **Yes** | DRAFTABLE | BATCH 2 | — |
| `MADCR-023` | Learning Session Provider Adapter | A | `MADCR-022` (satisfied) | — | Yes | None | No | **Yes** | DRAFTABLE | BATCH 2 | — |
| `MADCR-002` | Payment Gateway adapter architecture | A | `MADCR-011` (soft) | `MADCR-003` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | Approval waits for `MADCR-011` |
| `MADCR-003` | Payment verification/idempotency | A | `MADCR-002` | `MADCR-005` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-005` | Commercial reconciliation architecture | A | `MADCR-001, 003` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-006` | Add-on validity technical realization | A (POSSIBLE) | None | — | Yes | Business rule already locked per AEP-MON-002 §4 | No | Yes, but low-controversy | DRAFTABLE | BATCH 2 (note: also eligible for BATCH 6, see cross-note) | See D.1 discrepancy — counted among the 2 POSSIBLE items |
| `MADCR-007` | Free Bonus grant technical realization | A (POSSIBLE) | None | — | Yes | Business rule already locked per AEP-MON-002 §7 | No | Yes, but low-controversy | DRAFTABLE | BATCH 2 (note: also eligible for BATCH 6) | Same |
| `MADCR-009` | Quota allocation vs actual usage model | A | `MADCR-010` | — | Yes | None | No | **Yes** | **NOT YET DRAFTABLE** | BATCH 2 (blocked until Batch 1 closes) | — |
| `MADCR-015` | Earned/purchased LP provenance | A | `MADCR-014` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-016` | Idempotent LP purchase allocation | A | `MADCR-014` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-037` | Versioned Awarding Paths | A | `MADCR-036` | `MADCR-038,041` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-039` | Award Lifecycle vs Prerequisite Lifecycle | A | `MADCR-036` | `MADCR-042,057` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |
| `MADCR-040` | Presentation State vs Award State | A | `MADCR-036` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 2 | — |

---

# BATCH 3 — CROSS-DOMAIN ARCHITECTURE

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-038` | Award Provenance persistence | A | `MADCR-036, 037` | `MADCR-043` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 3 | — |
| `MADCR-041` | Awarding Rule versioning w/o new identity | A | `MADCR-037` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 3 | — |
| `MADCR-042` | Revocation/Appeal as lifecycle | A | `MADCR-039` | `MADCR-057` | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 3 | — |
| `MADCR-043` | Multiple Award Instances support | A | `MADCR-036, 038` | — | Yes | None | No | **Yes** | DRAFTABLE (shell) | BATCH 3 | — |
| `MADCR-050` | Cross-domain provenance/snapshot pattern | A | None | 4 domains' snapshot design (soft) | Yes | None | No | **Yes** | DRAFTABLE | BATCH 3 | Recommended early to reduce rework, but not a hard dependency for others |
| `MADCR-051` | Cross-domain event contract strategy | A | None | `MADCR-052` (D, non-A) | Yes | None | No | **Yes** | DRAFTABLE | BATCH 3 | — |

---

# BATCH 4 — SECURITY / AUTHORIZATION

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-053` | New cross-domain permission taxonomy | A | `MADCR-010, 011, 036` | `MADCR-048,054,055,056,057` (5) | Yes | REC discrepancy noted (§C.2) | No | **Yes** | DRAFTABLE (shell) | BATCH 4 | Single convergence point |
| `MADCR-048` | Title authority/scope RBAC realization | A | `MADCR-053, 036` | — | Yes | Business principle already locked (Title Rules 002/025/071–074); RBAC mapping open | No | **Yes** | **NOT YET DRAFTABLE** | BATCH 4 | Blocked until 053 shell exists |
| `MADCR-054` | Learning Session host/instructor authorization | A | `MADCR-053` | — | Yes | None | No | **Yes** | **NOT YET DRAFTABLE** | BATCH 4 | Same |
| `MADCR-055` | Commercial administration permissions | A | `MADCR-010, 011, 053` | — | Yes | None | No | **Yes** | **NOT YET DRAFTABLE** | BATCH 4 | Same |
| `MADCR-056` | Learning Point adjustment permissions | A | `MADCR-014, 053` | — | Yes | None | No | **Yes**, but LOCAL scope | **NOT YET DRAFTABLE** | BATCH 4 | Same |
| `MADCR-057` | Title issuance/revocation/appeal permissions | A | `MADCR-036, 039, 042, 053` | — | Yes | None | No | **Yes** | **NOT YET DRAFTABLE** | BATCH 4 | Same |

---

# BATCH 5 — INTEGRATION / PLATFORM

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MADCR-026` | Daily/LiveKit provider capability verification | E (not A) | None | `MADCR-023` finalization | No — capability unverified | Provider OAuth/quota/pricing not yet checked | No | No — research task | RESEARCH REQUIRED | BATCH 5 | Not an ADR |
| `MADCR-027` | Zoom/Google Meet provider capability verification | E (not A) | None | Same | No | Same | No | No | RESEARCH REQUIRED | BATCH 5 | Not an ADR |
| `MADCR-028` | YouTube Live provider capability verification | E (not A) | None | Same | No | Same | No | No | RESEARCH REQUIRED | BATCH 5 | Not an ADR |
| `MADCR-058` | Payment Gateway vendor selection | E (not A) | None | Payment implementation | No — vendor unverified | Vendor evaluation not yet run | Yes — contract/billing decision | No | RESEARCH REQUIRED | BATCH 5 | Distinct from `MADCR-002` adapter-pattern ADR |
| `MADCR-052` | Final concrete event contract schemas | D (not A) | `MADCR-051` | Implementation only | Partial | Depends on 051 closing | No | No — technical spec | NOT YET (waits on 051) | BATCH 5 | Implementation-shaping, not an ADR |

---

# BATCH 6 — FINAL ARCHITECTURE GATE

| MADCR ID | Decision | Category | Dependencies | Blocks | Evidence Ready? | Source Gaps | Business Decision Needed? | Architecture Decision Needed? | Draftability | Recommended Batch | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Cross-check: all 25 draftable candidates' shells reviewed for internal consistency before any moves to READY FOR DECISION | Governance activity, not a candidate | — | Batches 1–5 substantially drafted | Implementation planning | N/A | — | No | No | N/A | BATCH 6 | Final consolidation gate, per this task's own downstream chain (§19 of prior MAEP prompt) |
| `MADCR-062, 063` (MBR source recovery follow-up) | Confirm `MADCR-063` reclassification (found this cycle, §B.2) and continued pursuit of `MADCR-062` | K (not A) | None | Confidence in Commercial/Learning-Session "already covered" claims | Partial (063 now resolved evidentially, 062 still open) | `MADCR-062` (MBR-COM) unresolved | No | No | Governance/documentation task | BATCH 6 | Should close before final gate, not before Batch 1 |

**Total Category-A candidates accounted for across Batches 1–4: 5+15+6+6 = 32 ✓** (Batch 5/6 hold non-A items: E, D, K categories, plus governance activities.)
