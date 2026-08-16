# ADR MASTER SEQUENCING & DRAFTING PLAN
## RUMAHAGEN — v1.0

| Field | Value |
|---|---|
| **Document ID** | ADR-SEQ-001 |
| **Mode** | Governance Planning Only |
| **Architecture Decision Authorized** | NO |
| **ADR Creation Authorized** | NO |
| **Implementation Authorized** | NO |
| **Primary Input** | `MADCR-v1.1-CORRECTION-CANONICALIZATION.md` (canonical candidate inventory — used as-is, not rebuilt) |
| **Supporting Inputs** | Full repository re-scan, `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md`, `MAEP-v1.0-VALIDATION-REPORT.md` |
| **Status** | **PROPOSED — PENDING ARCHITECTURE REVIEW BOARD ACCEPTANCE** |

---

# 1. EXECUTIVE SUMMARY

This plan sequences the **32 canonical Category-A Mandatory Architecture Decisions** established by MADCR v1.1 into a dependency-ordered, evidence-based drafting and review program. It answers one question only: **in what order should these decisions be reviewed, drafted, decided, and recorded** — it does not answer any of the decisions themselves.

**Sequencing method:** a directed dependency graph was built strictly from each candidate's own `Depends On` field in MADCR v1.1 §6 (not from free-text `Blocks` summaries, which are descriptive and in 3 cases do not exactly mirror the formal `Depends On` field — see §19 Reconciliation Required). Topological layering of that graph, cross-checked against fan-out (direct + indirect dependents), cross-domain reach, data/security impact, and reversibility, produced **7 sequencing lanes** and **6 Architecture Review Board sessions**.

**Headline finding:** **MADCR-036** (Title Definition vs Award Instance) has the single highest fan-out in the entire candidate set — **8 direct + 5 indirect = 13 total downstream dependents** — making it, by evidence, the single highest-leverage candidate to resolve first, ahead even of OPEN-Q1/OPEN-Q2 in raw fan-out terms (though OPEN-Q1/Q2 remain equally Gate-1-critical on cross-domain and blocking grounds). MADCR-011 (OPEN-Q2) has the second-highest total reach (9), MADCR-010 (OPEN-Q1) third (7).

**25 of 32 Category-A candidates are structurally draftable today** (ADR draft-shell preparation — context, problem, decision question, evidence, alternatives — with no selected option) **without waiting for any blocker to close.** Only **7 are blocked from drafting entirely** pending prerequisite resolution; the remaining candidates that show a dependency in MADCR v1.1 can still have draft shells prepared in advance (Draft Dependency ≠ Approval Dependency, per §15).

**No architecture option is selected anywhere in this document.** OPEN-Q1, OPEN-Q2, OPEN-C01, Agency=Organization, and Learning Session's domain placement are all preserved exactly as MADCR v1.1 recorded them.

---

# 2. SCOPE

**In scope:** sequencing, dependency mapping, drafting-wave planning, Architecture Review Board session planning, ADR-readiness classification, downstream-artifact-gate identification, for all 64 MADCR v1.1 candidates (32 Category-A in primary focus; 32 non-A candidates mapped for completeness and NOT-ADR routing).

**Out of scope:** any architecture decision, ADR content/approval, ERD, API, RBAC, migration, Business Rule change, MAEP/MADCR modification, provider-capability fabrication, dependency fabrication.

---

# 3. SOURCE AUTHORITY

| Level | Source | Role in this plan |
|---|---|---|
| 0 | Repository actual state (live clone re-scanned) | Verification of MADCR v1.1 claims where evidence paths were cited |
| 1 | FINAL/APPROVED/LOCKED decisions (29 existing-baseline ADRs, Agency=Organization, M01–M13 baseline) | Preserved boundary — no candidate may reopen these |
| 3 | Master BR Final Traceability Gate v1.3 | Source of OPEN-Q1/OPEN-Q2 exact wording |
| 9 (primary input) | **`MADCR-v1.1-CORRECTION-CANONICALIZATION.md`** | **Canonical candidate inventory — used as-is** |
| 9 | `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md`, `MAEP-v1.0-VALIDATION-REPORT.md` | Cross-reference only |

**Repository verification performed:** re-confirmed via direct grep that the repository's ADR register (`architecture-decision-records-FINAL-v1.1-plus-ADR029.md`) contains no `ADR-MON-*`, `ADR-LE-*`, `ADR-LS-*`, or Title/CAIA-prefixed entries — consistent with MADCR v1.1's claim that none of the 32 Category-A candidates have yet been formalized as repository ADRs. **No discrepancy found** between MADCR v1.1 and repository state on this point.

---

# 4. MADCR v1.1 BASELINE (unchanged, reproduced for traceability)

```text
82 raw candidate mentions
    ↓
64 canonical candidates
    ↓
A=32  B=14  C=6  D=1  E=4  F=2  G=2  H=0  I=0  J=1  K=2
    ↓ (within Category A)
ADR REQUIRED=9  ADR RECOMMENDED=22  ADR POSSIBLE=1
    ↓
BLOCKED=7  STRUCTURALLY ADR-ELIGIBLE=25
```

**These counts are used exactly as published in MADCR v1.1 and are NOT recalculated here.** Where this plan's own dependency-graph analysis (§8, §19) surfaces a discrepancy against MADCR v1.1's free-text `Blocks` annotations, it is flagged as **RECONCILIATION REQUIRED**, not silently corrected in either document.

---

# 5. GOVERNANCE PRINCIPLES

1. **Sequencing ≠ Deciding.** Every recommendation in this plan concerns *order*, never *content*.
2. **MADCR ID ≠ ADR ID.** No candidate's final ADR number is assigned here (§25 rule preserved) — sequence position is expressed by Wave/Session, not by a fabricated ADR number.
3. **Drafting ≠ Decision ≠ Approval.** Three distinct states are tracked separately throughout (§15, §26–28).
4. **Draft Dependency ≠ Approval Dependency.** A candidate may have its ADR draft shell (context/problem/evidence/alternatives) prepared before its prerequisite closes; it cannot be *approved* before that prerequisite closes (§17).
5. **No hidden decision in a sequencing recommendation.** Every priority statement in this plan is phrased as an ordering rationale, never as a preferred option (self-checked in §23).
6. **Preserve existing baseline.** Agency=Organization, Learning Session-in-Learning-Domain, M01–M13, existing technology/RBAC baseline are never candidates for reopening; any apparent conflict is flagged, not resolved (§9, §21).
7. **Evidence only.** Every dependency edge, fan-out count, and session grouping in this plan traces to a MADCR v1.1 `Depends On`/`Blocks` field or a directly re-verified repository fact.

---

# 6. SEQUENCING METHOD

Per Master Prompt §12, sequencing criteria applied (in combination, not any single one alone): **Dependency, Blocking, Architectural Fan-Out, Data Impact, Security Impact, Cross-Domain Impact, Reversibility, Governance Authority.**

**Procedure:**
1. Extract the formal `Depends On` field for all 32 Category-A candidates from MADCR v1.1 §6 (authoritative edge list).
2. Build a directed graph; compute topological layers (a candidate's layer = 1 + max layer of its Category-A prerequisites; layer 0 = no Category-A prerequisite).
3. Compute **Direct Dependents** (reverse edges) and **Indirect Dependents** (transitive reverse closure minus direct) for every candidate — this is the fan-out figure.
4. Cross-check each candidate's layer/fan-out against its MADCR-v1.1-recorded Data/Security/Cross-domain-impact and Reversibility to assign a final **Sequencing Lane** (§13 taxonomy: S0/S1/S2/S3/S3-SEC/S4/DEFERRED).
5. Group lanes into **Architecture Review Board Sessions** based on shared prerequisite-closure points, not on arbitrary batch size.
6. Cross-check every free-text `Blocks` annotation in MADCR v1.1 against the formal `Depends On` field of the claimed target — 3 discrepancies found and flagged (§19).

**Explicitly not used:** filename order, MADCR numeric ID order, alphabetical order, or unsourced business urgency.

---

# 7. MASTER ADR SEQUENCE

Sequencing lanes (per Master Prompt §13, populated from the dependency-graph analysis in §8 below, cross-checked against fan-out/impact/reversibility — not from ID order):

- **S0 — Foundational/Gate-1** (5): candidates with zero Category-A prerequisite AND explicitly Gate-1-flagged (CAIA §29 Gate 1) or maximal fan-out.
- **S1 — Foundational Domain Architecture** (6): zero-prerequisite candidates that are domain-local foundations, not Gate-1-flagged.
- **S2 — Dependent Domain Architecture** (9): depend on exactly one S0/S1 item, still domain-local.
- **S3 — Cross-Domain / Dependent-on-Dependent Architecture** (4): depend on an S2 item within the same cluster (Title refinement layer).
- **S3-SEC — Security/RBAC Architecture** (6): all permission-taxonomy candidates, grouped regardless of raw layer number because they share Gate-2 sequencing and a common owning concern.
- **S4 — Implementation-Shaping** (0 Category-A; 1 Category-D child item, MADCR-052, listed for completeness).
- **DEFERRED — Possible/Low-Priority ADR** (2): `ADR POSSIBLE`-classified, zero fan-out, business-rule-locked-already, lowest urgency.

| Seq | Wave | MADCR ID | Decision Question (short) | Class | Dependency | Blocking | Drafting Status | Review Status | Approval Dependency | Downstream Impact | Priority | Rec. Board Session | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | S0 | MADCR-036 | Title Definition vs Award Instance | A | None | Blocks 8 direct/5 indirect | DRAFTABLE | NOT REVIEWED | None | Title ERD, 7 other Title/Sec candidates | P0 | Session 1 | Highest fan-out in entire set (13) |
| 2 | S0 | MADCR-011 | OPEN-Q2: Payment M14 vs M16 | A | None | Blocks 3 direct/6 indirect | DRAFTABLE | NOT REVIEWED | None | Payment ERD/API, Security cluster | P0 | Session 1 | 2nd-highest fan-out (9); Gate-1 per CAIA |
| 3 | S0 | MADCR-010 | OPEN-Q1: Entitlement vs Org Quota | A | None | Blocks 3 direct/4 indirect | DRAFTABLE | NOT REVIEWED | None | M14 ERD, Security cluster | P0 | Session 1 | 3rd-highest fan-out (7); Gate-1 per CAIA |
| 4 | S0 | MADCR-046 | `certificates`(M04) vs Title(M15) boundary | A | None (formal) | Blocks Title ERD; disputed vs 036 — see §19 | DRAFTABLE | NOT REVIEWED | None | Title ERD | P0 | Session 1 | Gate-1 per CAIA (Gate1.3); reconciliation flagged |
| 5 | S0 | MADCR-049 | Learning Activity vs Course boundary | A | None (formal) | Disputed vs 014/023 — see §19 | DRAFTABLE | NOT REVIEWED | None | Learning Economy/Session ERD | P0 | Session 1 | Gate-1 per CAIA (Gate1.2); reconciliation flagged |
| 6 | S1 | MADCR-001 | Subscription vs Entitlement vs RBAC | A | MADCR-013 (context, non-blocking) | No | DRAFTABLE | NOT REVIEWED | None | M14 ERD | P1 | Session 2 | Parallel to S0, not dependent on it |
| 7 | S1 | MADCR-004 | Purchase-time price/promo snapshot | A | None | No | DRAFTABLE | NOT REVIEWED | None | Order/Purchase ERD | P1 | Session 2 | — |
| 8 | S1 | MADCR-014 | Learning Point ledger domain | A | None | Blocks 3 | DRAFTABLE | NOT REVIEWED | None | M04-extend ERD | P1 | Session 2 | — |
| 9 | S1 | MADCR-023 | Learning Session Provider Adapter | A | MADCR-022 (G, satisfied) | No (within A-graph) | DRAFTABLE | NOT REVIEWED | None | M04-extend ERD/API | P1 | Session 2 | Prerequisite already Already-Decided |
| 10 | S1 | MADCR-050 | Cross-domain provenance/snapshot pattern | A | None | No | DRAFTABLE | NOT REVIEWED | None | 4 domains' snapshot design | P1 | Session 2 | Recommended early to reduce rework |
| 11 | S1 | MADCR-051 | Cross-domain event contract strategy | A | None | Feeds MADCR-052 (D) | DRAFTABLE | NOT REVIEWED | None | Event architecture | P1 | Session 2 | — |
| 12 | S2 | MADCR-002 | Payment Gateway adapter architecture | A | MADCR-011 (soft) | Feeds 003 | DRAFTABLE (shell) | NOT REVIEWED | MADCR-011 closed | Payment ERD/API | P1 | Session 3a | Approval waits for OPEN-Q2 |
| 13 | S2 | MADCR-003 | Payment verification/idempotency | A | MADCR-002 | Feeds 005 | DRAFTABLE (shell) | NOT REVIEWED | MADCR-002 | Payment implementation | P1 | Session 3a | — |
| 14 | S2 | MADCR-005 | Commercial reconciliation architecture | A | MADCR-001, 003 | No | DRAFTABLE (shell) | NOT REVIEWED | MADCR-001+003 | Commercial ops tooling | P2 | Session 3a | — |
| 15 | S2 | MADCR-009 | Quota allocation vs actual usage model | A | MADCR-010 | No | NOT YET DRAFTABLE | NOT REVIEWED | MADCR-010 | M14/M12 ERD | P1 | Session 3a | Blocked until OPEN-Q1 closes |
| 16 | S2 | MADCR-015 | Earned/purchased LP provenance | A | MADCR-014 | No | DRAFTABLE (shell) | NOT REVIEWED | MADCR-014 | M04-extend ERD | P2 | Session 3b | — |
| 17 | S2 | MADCR-016 | Idempotent LP purchase allocation | A | MADCR-014 | No | DRAFTABLE (shell) | NOT REVIEWED | MADCR-014 | M04-extend API | P2 | Session 3b | — |
| 18 | S2 | MADCR-037 | Versioned Awarding Paths | A | MADCR-036 | Feeds 038,041 | DRAFTABLE (shell) | NOT REVIEWED | MADCR-036 | Title ERD/API | P1 | Session 3c | — |
| 19 | S2 | MADCR-039 | Award Lifecycle vs Prerequisite Lifecycle | A | MADCR-036 | Feeds 042,057 | DRAFTABLE (shell) | NOT REVIEWED | MADCR-036 | Title ERD/API | P1 | Session 3c | — |
| 20 | S2 | MADCR-040 | Presentation State vs Award State | A | MADCR-036 | No | DRAFTABLE (shell) | NOT REVIEWED | MADCR-036 | Title UI/API | P2 | Session 3c | — |
| 21 | S3 | MADCR-038 | Award Provenance persistence | A | MADCR-036, 037 | Feeds 043 | DRAFTABLE (shell) | NOT REVIEWED | 036+037 | Title ERD | P2 | Session 4 | — |
| 22 | S3 | MADCR-041 | Awarding Rule versioning w/o new identity | A | MADCR-037 | No | DRAFTABLE (shell) | NOT REVIEWED | 037 | Title ERD | P2 | Session 4 | — |
| 23 | S3 | MADCR-042 | Revocation/Appeal as lifecycle | A | MADCR-039 | Feeds 057 | DRAFTABLE (shell) | NOT REVIEWED | 039 | Title ERD/API/RBAC | P1 | Session 4 | — |
| 24 | S3 | MADCR-043 | Multiple Award Instances support | A | MADCR-036, 038 | No | DRAFTABLE (shell) | NOT REVIEWED | 036+038 | Title ERD | P2 | Session 4 | — |
| 25 | S3-SEC | MADCR-053 | New cross-domain permission taxonomy | A | MADCR-010, 011, 036 | Blocks 048,054,055,056,057 (5) | DRAFTABLE (shell) | NOT REVIEWED | 010+011+036 | All new-wave RBAC/API | P0 | Session 5 | Highest-leverage Security item |
| 26 | S3-SEC | MADCR-048 | Title authority/scope → RBAC realization | A | MADCR-053, 036 | No | NOT YET DRAFTABLE | NOT REVIEWED | 053+036 | Title RBAC | P1 | Session 5 | — |
| 27 | S3-SEC | MADCR-054 | Learning Session host/instructor authorization | A | MADCR-053 | No | NOT YET DRAFTABLE | NOT REVIEWED | 053 | Learning Session RBAC | P2 | Session 5 | — |
| 28 | S3-SEC | MADCR-055 | Commercial administration permissions | A | MADCR-010, 011, 053 | No | NOT YET DRAFTABLE | NOT REVIEWED | 010+011+053 | Commercial RBAC | P1 | Session 5 | — |
| 29 | S3-SEC | MADCR-056 | Learning Point adjustment permissions | A | MADCR-014, 053 | No | NOT YET DRAFTABLE | NOT REVIEWED | 014+053 | Learning Economy RBAC | P2 | Session 5 | — |
| 30 | S3-SEC | MADCR-057 | Title issuance/revocation/appeal permissions | A | MADCR-036, 039, 042, 053 | No | NOT YET DRAFTABLE | NOT REVIEWED | 036+039+042+053 | Title RBAC | P1 | Session 5 | — |
| 31 | DEFERRED | MADCR-006 | Add-on validity technical realization | A | None | No | DRAFTABLE | NOT REVIEWED | None | M14 ERD | P3 | Session 6 | ADR POSSIBLE only; business rule already locked |
| 32 | DEFERRED | MADCR-007 | Free Bonus grant technical realization | A | None | No | DRAFTABLE | NOT REVIEWED | None | M14 ERD | P3 | Session 6 | ADR POSSIBLE only; business rule already locked |

**Non-A items are sequenced separately** — see §16 (Non-ADR routing) and §17 (Parallelizable Work); they do not occupy Sequence slots above since they require no ADR.

---

# 8. MASTER ADR DEPENDENCY MATRIX

Fan-out computed strictly from each candidate's `Depends On` field (reverse-edge closure). Sorted by Total Reach (Direct+Indirect) descending — this is the evidence-based leverage ranking.

| Candidate | Decision Question (short) | Parent (Depends On) | Direct Dependents | Indirect Dependents | Total Reach | Blocking | Release Condition | Draftable? | Approvable? | Parallelizable? | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-036 | Title Definition vs Award Instance | — (none) | 037,038,039,040,043,048,053,057 (8) | 041,042,054,055,056 (5) | **13** | Yes — Title cluster + shares 048/053 w/ Security cluster | None (no prerequisite) | YES | YES | YES | MADCR v1.1 §6.4 |
| MADCR-011 | OPEN-Q2: Payment M14 vs M16 | — (none) | 002,053,055 (3) | 003,005,048,054,056,057 (6) | **9** | Yes — Payment ERD/API + Security cluster | None | YES | YES | YES | MADCR v1.1 §6.1, Gate v1.3 §4.2 |
| MADCR-010 | OPEN-Q1: Entitlement vs Org Quota | — (none) | 009,053,055 (3) | 048,054,056,057 (4) | **7** | Yes — M14 ERD + Security cluster | None | YES | YES | YES | MADCR v1.1 §6.1, Gate v1.3 §4.1 |
| MADCR-053 | New cross-domain permission taxonomy | 010, 011, 036 | 048,054,055,056,057 (5) | — (0) | **5** | Yes — entire Security/RBAC cluster | 010+011+036 all closed | NOT YET (blocked) | NO | Draft-shell only, in parallel with S0 | MADCR v1.1 §6.5 |
| MADCR-014 | Learning Point ledger domain | — (none) | 015,016,056 (3) | — (0) | **3** | Partial — Learning Economy sub-items | None | YES | YES | YES | MADCR v1.1 §6.2 |
| MADCR-037 | Versioned Awarding Paths | 036 | 038,041 (2) | 043 (1) | **3** | Yes — 2 Title sub-items | 036 closed | YES (shell) | Only after 036 | YES (shell), parallel with 036 review | MADCR v1.1 §6.4 |
| MADCR-039 | Award Lifecycle vs Prerequisite Lifecycle | 036 | 042,057 (2) | — (0) | **2** | Yes — 042, and feeds 057 | 036 closed | YES (shell) | Only after 036 | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-002 | Payment Gateway adapter architecture | 011 (soft/context per §7 note) | 003 (1) | 005 (1) | **2** | Partial — finalization only | 011 closed (for approval; drafting unaffected) | YES | Only after 011 | YES | MADCR v1.1 §6.1 |
| MADCR-001 | Subscription vs Entitlement vs RBAC | 013/OD-11 (Category B, external context — non-blocking per v1.1 §0A.4) | 005 (1) | — (0) | **1** | No (context dependency only) | None (OD-11 is non-blocking) | YES | YES | YES | MADCR v1.1 §6.1 |
| MADCR-003 | Payment verification/idempotency | 002 | 005 (1) | — (0) | **1** | Partial | 002 drafted/approved | YES (shell) | Only after 002 | YES (shell) | MADCR v1.1 §6.1 |
| MADCR-038 | Award Provenance persistence | 036, 037 | 043 (1) | — (0) | **1** | Yes — feeds 043 | 036+037 closed | YES (shell) | Only after both | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-042 | Revocation/Appeal as lifecycle | 039 | 057 (1) | — (0) | **1** | Yes — feeds 057 | 039 closed | YES (shell) | Only after 039 | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-004 | Purchase-time price/promo snapshot | — (none) | — | — | **0** | No | None | YES | YES | YES | MADCR v1.1 §6.1 |
| MADCR-006 | Add-on validity technical realization | — (none) | — | — | **0** | No | None | YES | YES | YES | MADCR v1.1 §6.1 |
| MADCR-007 | Free Bonus grant technical realization | — (none) | — | — | **0** | No | None | YES | YES | YES | MADCR v1.1 §6.1 |
| MADCR-009 | Quota allocation vs actual usage model | 010 | — | — | **0** | No further downstream | 010 closed | YES (shell) | Only after 010 | YES (shell) | MADCR v1.1 §6.1 |
| MADCR-015 | Earned/purchased LP provenance | 014 | — | — | **0** | No | 014 closed (drafting unaffected) | YES (shell) | Only after 014 | YES (shell) | MADCR v1.1 §6.2 |
| MADCR-016 | Idempotent LP purchase allocation | 014 | — | — | **0** | No | 014 closed | YES (shell) | Only after 014 | YES (shell) | MADCR v1.1 §6.2 |
| MADCR-023 | Learning Session Provider Adapter | 022 (Already Decided — prerequisite satisfied) | 026,027,028 finalization (non-A, E-category) | — | **0** (within A-graph) | No | None (022 already closed) | YES | YES | YES | MADCR v1.1 §6.3 |
| MADCR-040 | Presentation State vs Award State | 036 | — | — | **0** | No | 036 closed | YES (shell) | Only after 036 | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-041 | Awarding Rule versioning w/o new identity | 037 | — | — | **0** | No | 037 closed | YES (shell) | Only after 037 | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-043 | Multiple Award Instances support | 036, 038 | — | — | **0** | No | 036+038 closed | YES (shell) | Only after both | YES (shell) | MADCR v1.1 §6.4 |
| MADCR-046 | `certificates`(M04) vs Title(M15) boundary | — (none, formal); **RECONCILIATION REQUIRED vs its own `Blocks` field which names MADCR-036 — see §19** | — (formal) | — | **0 (formal) / disputed** | Yes (per its own Blocks text, Title ERD) | None (formal) | YES | YES | YES, but see §19 | MADCR v1.1 §6.4 |
| MADCR-048 | Title authority/scope → RBAC realization | 053, 036 | — | — | **0** | No further | 053+036 closed | NOT YET (blocked) | NO | Draft-shell only after 036 | MADCR v1.1 §6.4 |
| MADCR-049 | Learning Activity vs Course boundary | — (none, formal); **RECONCILIATION REQUIRED — its own `Blocks` field names MADCR-014 and MADCR-023, neither of which lists 049 in `Depends On` — see §19** | — (formal) | — | **0 (formal) / disputed** | Disputed | None (formal) | YES | YES | YES, but see §19 | MADCR v1.1 §6.5 |
| MADCR-050 | Cross-domain provenance/snapshot pattern | — (none) | — | — | **0** | No (recommended, not required) | None | YES | YES | YES | MADCR v1.1 §6.5 |
| MADCR-051 | Cross-domain event contract strategy | — (none) | — | — | **0** | No (non-A child MADCR-052 depends on it) | None | YES | YES | YES | MADCR v1.1 §6.5 |
| MADCR-005 | Commercial reconciliation architecture | 001, 003 | — | — | **0** | No | 001+003 closed | YES (shell) | Only after both | YES (shell) | MADCR v1.1 §6.1 |
| MADCR-054 | Learning Session host/instructor authorization | 053 | — | — | **0** | No | 053 closed | NOT YET (blocked) | NO | Draft-shell only after 053 drafted | MADCR v1.1 §6.5 |
| MADCR-055 | Commercial administration permissions | 010, 011, 053 | — | — | **0** | No | 010+011+053 closed | NOT YET (blocked) | NO | Draft-shell only | MADCR v1.1 §6.5 |
| MADCR-056 | Learning Point adjustment permissions | 014, 053 | — | — | **0** | No | 014+053 closed | NOT YET (blocked on 053) | NO | Draft-shell only (014 already satisfiable) | MADCR v1.1 §6.5 |
| MADCR-057 | Title issuance/revocation/appeal permissions | 036, 039, 042, 053 | — | — | **0** | No | All 4 closed | NOT YET (blocked) | NO | Draft-shell only after 036/039/042 | MADCR v1.1 §6.5 |

**Verification:** 32 rows = 32 Category-A candidates ✓.

---

# 9. BLOCKING DECISIONS

Using the vocabulary required by §18: BLOCKED / READY AFTER DEPENDENCY / READY FOR REVIEW / DRAFTABLE / APPROVABLE.

| Blocked Candidate | Blocker(s) | Reason | Release Condition | Next State Once Released |
|---|---|---|---|---|
| MADCR-009 | MADCR-010 | Quota allocation model cannot be finalized until Entitlement-vs-Quota authority is decided | MADCR-010 APPROVED | DRAFTABLE → APPROVABLE |
| MADCR-048 | MADCR-053, MADCR-036 | RBAC realization needs both the permission taxonomy and the Title Definition/Instance split settled | MADCR-053 APPROVED AND MADCR-036 APPROVED | DRAFTABLE(shell exists) → APPROVABLE |
| MADCR-053 | MADCR-010, MADCR-011, MADCR-036 | Cross-domain permission taxonomy cannot be finalized until the 3 domain-boundary Gate-1 items close | All 3 APPROVED | DRAFTABLE(shell) → APPROVABLE |
| MADCR-054 | MADCR-053 | LS host/instructor authorization is a sub-decision of the taxonomy | MADCR-053 APPROVED | DRAFTABLE(shell) → APPROVABLE |
| MADCR-055 | MADCR-010, MADCR-011, MADCR-053 | Commercial admin permissions depend on both Commercial Gate-1 items and the taxonomy | All 3 APPROVED | DRAFTABLE(shell) → APPROVABLE |
| MADCR-056 | MADCR-014, MADCR-053 | LP adjustment permissions depend on the ledger model and the taxonomy | MADCR-014 APPROVED (likely early) AND MADCR-053 APPROVED | DRAFTABLE(shell) → APPROVABLE |
| MADCR-057 | MADCR-036, MADCR-039, MADCR-042, MADCR-053 | Title RBAC needs the full Title lifecycle chain plus the taxonomy | All 4 APPROVED | DRAFTABLE(shell) → APPROVABLE |

**Existing-baseline blocker (independent track, not a new-wave A-candidate):** MADCR-059 (migration `-FIXED` canonicalization, Category F) blocks Sprint S0 execution — confirmed independent of every candidate above (§17 Parallelizable Work).

**No candidate above is blocked from DRAFTING** except MADCR-009, 048, 053(partially — its own draft shell IS preparable in parallel with S0 review since its content doesn't require the S0 decisions' outcome, only their closure for approval), 054, 055, 056, 057 — draft-shell preparation for 053-057 can begin once 036/010/011 drafting (not approval) is underway, since a draft shell requires only the decision question, context, and known alternatives, not a resolved prerequisite (§17 principle).

---

# 10. DRAFTING WAVES

Each wave = candidates whose ADR **draft shell** (context, problem, evidence, decision question, known alternatives — no selected option) can be prepared together, given the drafting rule that a shell does not require its prerequisite to be *approved*, only *identified*.

## Drafting Wave 1 (can start immediately, no prerequisite of any kind)
**Candidates:** MADCR-036, 046, 049, 011, 010 (S0) + MADCR-001, 004, 014, 023, 050, 051 (S1) + MADCR-006, 007 (DEFERRED)
**Count:** 13
**Reason for placement:** zero Category-A `Depends On` entries (or only a non-blocking Category-B context per §7 of MADCR v1.1).
**Downstream artifacts affected once drafted (not yet approved):** none — drafting alone has no downstream effect.
**Governance gate:** none required to *begin drafting*; Architecture Review Board acceptance of this plan (§24) is the only prerequisite.

## Drafting Wave 2 (shells preparable once Wave-1 candidates are drafted, even before Wave-1 approval)
**Candidates:** MADCR-002, 009, 015, 016, 037, 039, 040, 053
**Count:** 8
**Reason for placement:** each has exactly one Wave-1 prerequisite; the decision question and known alternatives for these can be written once the *prerequisite's own draft* exists (their shells can reference "pending MADCR-036 outcome" as an explicit open variable).
**Downstream artifacts affected:** none until approved.
**Governance gate:** Wave-1 draft shells must exist (not be approved) before Wave-2 shells reference them.

## Drafting Wave 3 (shells preparable once Wave-2 candidates are drafted)
**Candidates:** MADCR-003, 005, 038, 041, 042, 048, 054, 055, 056, 057
**Count:** 10
**Reason for placement:** each depends on ≥1 Wave-2 candidate (or, for 048/054/055/056/057, on MADCR-053's shell existing).
**Downstream artifacts affected:** none until approved.

## Drafting Wave 4 (shells preparable once Wave-3 candidates are drafted)
**Candidates:** MADCR-043
**Count:** 1
**Reason for placement:** depends on MADCR-038 (Wave 3).

**Verification: 13+8+10+1 = 32 ✓**

**Key distinction preserved throughout:** "drafted" above never means "decided" or "approved" — see §11 for the separate, stricter Approval sequence.

---

# 11. APPROVAL WAVES

Approval is strictly gated by prerequisite **APPROVAL** (not merely drafting) — this is the stricter, dependency-respecting sequence.

## Approval Wave A (no prerequisite — approvable as soon as Architecture Review Board reviews them)
MADCR-036, 046, 049, 011, 010, 001, 004, 014, 023, 050, 051, 006, 007
**Count: 13**

## Approval Wave B (approvable only after ALL of their respective Wave-A prerequisites are APPROVED)
- MADCR-009 — after 010
- MADCR-002 — after 011
- MADCR-015, 016 — after 014
- MADCR-037, 039, 040 — after 036
- MADCR-053 — after 010 + 011 + 036 (all three)
**Count: 8**

## Approval Wave C (approvable only after ALL of their respective Wave-B prerequisites are APPROVED)
- MADCR-003 — after 002
- MADCR-005 — after 001 + 003 (003 is Wave C itself — so MADCR-005 is actually Wave D, corrected below)
- MADCR-038, 041 — after 037
- MADCR-042 — after 039
- MADCR-048, 054, 055, 056 — after 053 (+ 010/011/036/014 already satisfied in Wave A/B)
**Count: 9** (005 moved to Wave D — see correction note)

## Approval Wave D (approvable only after ALL Wave-C prerequisites are APPROVED)
- MADCR-005 — after 001 (Wave A) + 003 (Wave C)
- MADCR-043 — after 036 (Wave A) + 038 (Wave C)
- MADCR-057 — after 036 (A) + 039 (B) + 042 (C) + 053 (B)
**Count: 3**

**Verification: 13+8+9+3 = 33** — one over 32. **Correction applied transparently:** MADCR-005 was double-listed while re-deriving Wave C/D by hand (once tentatively in Wave C, then correctly moved to Wave D). The correct, final count is **Wave A=13, Wave B=8, Wave C=8 (005 excluded), Wave D=3 → 13+8+8+3=32 ✓**. This arithmetic correction is shown here rather than silently fixed, consistent with this plan's own no-silent-correction principle.

---

# 12. ARCHITECTURE REVIEW BOARD SESSIONS

Not the generic six-session template — sessions below are optimized against the actual dependency graph (§6 Sequencing Method step 5), with explicit note on which sessions can run in parallel.

| Session | Focus | Candidates | Count | Can run in parallel with | Prerequisite to open session |
|---|---|---|---|---|---|
| **Session 1** | Gate-1 foundational (S0) | MADCR-036, 011, 010, 046, 049 | 5 | — (first session) | Architecture Review Board acceptance of this plan |
| **Session 2** | Foundational domain architecture (S1) | MADCR-001, 004, 014, 023, 050, 051 | 6 | **Session 1** (no dependency between S0 and S1 sets) | Same as Session 1 |
| **Session 3a** | Dependent Commercial architecture | MADCR-002, 003, 005, 009 | 4 | Session 3b, 3c | Session 1 (010/011) + Session 2 (001) closed |
| **Session 3b** | Dependent Learning Economy architecture | MADCR-015, 016 | 2 | Session 3a, 3c | Session 2 (014) closed |
| **Session 3c** | Dependent Title architecture (layer 1) | MADCR-037, 039, 040 | 3 | Session 3a, 3b | Session 1 (036) closed |
| **Session 4** | Title architecture (layer 2, dependent-on-dependent) | MADCR-038, 041, 042, 043 | 4 | — (needs Session 3c closed) | Session 3c closed |
| **Session 5** | Security/RBAC architecture | MADCR-053, 048, 054, 055, 056, 057 | 6 | — (needs Sessions 1–4 substantially closed) | Session 1 (010/011/036) + Session 4 (039/042, for 057) closed |
| **Session 6** | Deferred/possible-ADR review | MADCR-006, 007 | 2 | Any session (lowest priority, can slot in opportunistically) | None |

**Sessions 1 and 2 can run concurrently** — this is the single largest available time-saving in the plan, since 11 of 32 Category-A candidates (34%) have zero mutual dependency and can be reviewed the same week.

**Session 5 is deliberately last-but-one** because it aggregates prerequisites from Sessions 1, 3c, and 4 — starting it earlier would force re-opening RBAC ADRs as their Title/Commercial prerequisites evolve.

---

# 13. COMMERCIAL ADR CLUSTER

| Candidate | Sub-theme | Dependency | Blocking | Parent Business Context | Cross-Module Impact | Session |
|---|---|---|---|---|---|---|
| MADCR-010 | Entitlement vs Org Quota (OPEN-Q1) | None | Blocks 009, 053, 055 (+indirect 048,054,056,057) | MADCR-013/OD-11 (non-blocking parent context per MADCR v1.1 §0A.4) | Yes — M14 + M12 | 1 |
| MADCR-011 | Payment M14 vs M16 (OPEN-Q2) | None | Blocks 002, 053, 055 (+indirect) | MADCR-013/OD-11 (non-blocking context) | Yes — Payment + Security | 1 |
| MADCR-001 | Subscription≠Entitlement≠RBAC | MADCR-013 (non-blocking context) | Feeds 005 | MADCR-013/OD-11 | Yes | 2 |
| MADCR-002 | Payment adapter architecture | MADCR-011 (soft) | Feeds 003 | — | Moderate | 3a |
| MADCR-003 | Payment verification/idempotency | MADCR-002 | Feeds 005 | — | Moderate | 3a (shell) |
| MADCR-004 | Purchase-time snapshot | None | — | — | Low | 2 |
| MADCR-005 | Commercial reconciliation | MADCR-001, 003 | — | — | Moderate | 3a (shell) |
| MADCR-006 | Add-on validity realization | None | — | Business rule already locked (AEP-MON-002 §4) | Low | 6 (Deferred) |
| MADCR-007 | Free Bonus grant realization | None | — | Business rule already locked (AEP-MON-002 §7) | Low | 6 (Deferred) |
| MADCR-009 | Quota allocation vs usage | MADCR-010 | — | Business rule largely locked; realization open | Moderate | 3a (shell) |
| MADCR-055 | Commercial admin permissions | MADCR-010, 011, 053 | — | — | High (Security) | 5 |

**Parent business context, made explicit (per §7 rule):** `MADCR-013` (repo-native `OD-11`, "model monetisasi platform") is the business question this entire cluster architecturally answers. Per MADCR v1.1 §0A.4, it is canonicalized as a **CONTEXTUAL / NON-BLOCKING** dependency — none of the 11 Commercial candidates above are technically blocked from being drafted or approved by OD-11 remaining open; OD-11 is background context that a Business Owner will likely want informed by this cluster's outcome, not the reverse.

**Cross-module impact:** MADCR-010/011 reach into M12 (Organization) and the Security cluster (§16) respectively — the two highest-leverage decisions in this cluster by fan-out (§8).

---

# 14. TITLE ADR CLUSTER

Dependency structure around MADCR-036, the cluster's foundation (highest fan-out in the entire register):

```text
MADCR-036 (Title Definition ≠ Award Instance) — S0, Session 1, NO PREREQUISITE
    │
    ├──> MADCR-037 (Versioned Awarding Paths) — S2, Session 3c
    │        ├──> MADCR-038 (Provenance) — S3, Session 4
    │        │        └──> MADCR-043 (Multiple Instances) — S3, Session 4
    │        └──> MADCR-041 (Versioning w/o new identity) — S3, Session 4
    │
    ├──> MADCR-039 (Award Lifecycle ≠ Prerequisite Lifecycle) — S2, Session 3c
    │        └──> MADCR-042 (Revocation/Appeal) — S3, Session 4
    │                 └──> [feeds MADCR-057, Security cluster, Session 5]
    │
    ├──> MADCR-040 (Presentation State ≠ Award State) — S2, Session 3c
    │
    └──> [feeds MADCR-048, MADCR-057, Security cluster, Session 5]

MADCR-046 (`certificates` vs Title boundary) — S0, Session 1, NO FORMAL PREREQUISITE
    (RECONCILIATION REQUIRED: its own `Blocks` field names MADCR-036 — §19)
```

**Settled Title business rules NOT reopened here (per Master Prompt §36):** eligibility criteria, appeal windows, awarding thresholds — these are MADCR-044/045/047 (Categories C/B), correctly routed to Non-ADR (§16), not included in this architecture cluster.

**Sequencing rationale:** MADCR-036 must be reviewed first within this cluster — it has zero prerequisite and unlocks 8 direct + 5 indirect dependents, more than any other single candidate register-wide.

---

# 15. LEARNING ADR CLUSTER

| Sub-domain | Candidates | Dependency | Session | Domain-Leakage Check |
|---|---|---|---|---|
| **Learning Activity boundary** | MADCR-049 (vs existing M04 Course/Lesson) | None (formal) | 1 | Foundational; feeds Learning Economy + Learning Session per its own `Blocks` text (disputed — §19) |
| **Learning Point (Economy)** | MADCR-014 (ledger domain) | None | 2 | — |
| | MADCR-015 (earned/purchased provenance) | MADCR-014 | 3b | — |
| | MADCR-016 (idempotent purchase) | MADCR-014 | 3b | — |
| | MADCR-056 (point adjustment permissions) | MADCR-014, MADCR-053 | 5 | Security-cluster item, listed here for completeness only |
| **Learning Session (provider architecture)** | MADCR-023 (Provider Adapter) | MADCR-022 (Already Decided, satisfied) | 2 | — |
| | MADCR-054 (host/instructor authorization) | MADCR-053 | 5 | Security-cluster item |
| **Course/Lesson boundary (existing M04)** | No open candidate | — | — | Confirmed unchanged; only its boundary (MADCR-049) is open, not the model itself |

**Ensure Learning Session remains inside Learning Domain (per Master Prompt §37 explicit instruction):** confirmed — MADCR-022 (Already Decided, Category G) is the governing candidate for this placement and is **not** included in this sequencing plan's Category-A drafting/approval sequence; it requires only formal ADR-numbering as a governance-record action (§16 below), never re-review of the placement itself.

**Domain-leakage check: PASS** — no Learning Economy candidate redefines Learning Session scope or vice versa; MADCR-049 is the sole boundary-setting item and touches the *existing* M04 Course/Lesson model, not Learning Session directly.

---

# 16. SECURITY / RBAC ADR CLUSTER

| Candidate | Decision Question (short) | Prerequisites | Blocked Candidates (downstream) | Session |
|---|---|---|---|---|
| MADCR-053 | New cross-domain permission taxonomy | MADCR-010, 011, 036 | 048, 054, 055, 056, 057 (all 5 remaining Security items) | 5 |
| MADCR-048 | Title authority/scope → RBAC realization | MADCR-053, 036 | — | 5 |
| MADCR-054 | Learning Session host/instructor authorization | MADCR-053 | — | 5 |
| MADCR-055 | Commercial administration permissions | MADCR-010, 011, 053 | — | 5 |
| MADCR-056 | Learning Point adjustment permissions | MADCR-014, 053 | — | 5 |
| MADCR-057 | Title issuance/revocation/appeal permissions | MADCR-036, 039, 042, 053 | — | 5 |

**Structural finding:** MADCR-053 is a **single point of convergence** — every other Security/RBAC candidate depends on it, and it itself depends on 3 of the 5 Session-1 (Gate-1) candidates. This makes Session 5 (Security) the natural final Category-A session, not an arbitrary "last" placement — it is dependency-forced.

**Existing 7-role RBAC model and RLS dual-enforcement are not reopened by any candidate in this cluster** — all 6 items are additive permission-taxonomy extensions for the 4 new-wave domains, consistent with the Architecture Preservation check (§21).

---

# 16B. NON-ADR ROUTING (the 32 non-Category-A candidates)

The 32 non-Category-A MADCR v1.1 candidates require no ADR and are routed as follows — reproduced from MADCR v1.1 §8 for completeness, unchanged:

| Route | Candidates | Action Owner |
|---|---|---|
| Business Rule (14) | MADCR-013(OD-11), 018, 019, 020, 021, 024, 025, 030, 031, 032, 033, 035, 045, 060(OD-12) | Business Owner / already governing |
| Configuration (6) | MADCR-008, 008B, 017, 034, 044, 047 | Technical Team / Product Owner |
| Implementation (1) | MADCR-052 | Technical Team, after MADCR-051 approved |
| Verification/Research (4) | MADCR-026, 027, 028, 058 | Technical Team |
| Governance (2) | MADCR-012(OPEN-C01), 059 | Document Custodian / Technical Team |
| Already Decided (2) | MADCR-022, 029 | Formal ADR-numbering only, no re-review |
| Not a Decision (1) | MADCR-061(OD-09) | Document Custodian |
| Unknown (2) | MADCR-062, 063 | Document Custodian, source recovery |

**MADCR-022 (Learning Session placement) formalization is recommended as a low-cost governance action** — assign it the next available repository ADR number without reopening the underlying, already-consistent decision.

---

# 17. PARALLELIZABLE WORK MATRIX

| Item | Status | Evidence |
|---|---|---|
| MADCR-036, 010, 011, 046, 049 (Session 1 drafting) | CAN RUN NOW | §7, §10 Wave 1 |
| MADCR-001, 004, 014, 023, 050, 051 (Session 2 drafting) | CAN RUN NOW, in parallel with Session 1 | §12 — zero mutual dependency confirmed |
| MADCR-006, 007 (Deferred) | CAN RUN NOW, opportunistically | §7 — zero dependency, lowest priority |
| MADCR-002, 009, 015, 016, 037, 039, 040, 053 (Wave 2 shells) | CAN DRAFT IN PARALLEL with Session 1/2 review (shell only, not approval) | §10 Wave 2, §17 drafting rule |
| MADCR-003, 005, 038, 041, 042, 048, 054, 055, 056, 057 (Wave 3 shells) | MUST WAIT for their Wave-2 prerequisite's shell to exist before their own shell is meaningful | §10 Wave 3 |
| MADCR-043 (Wave 4 shell) | MUST WAIT for MADCR-038 shell | §10 Wave 4 |
| MADCR-009, 048, 054, 055, 056, 057 (approval) | CONDITIONAL — approvable only after named prerequisites are APPROVED (not just drafted) | §11 Approval Waves |
| MADCR-062, 063 (source recovery for `MBR-COM-001–013`/`MBR-LS-001–015`) | CAN RUN NOW, fully independent | MADCR v1.1 §6.7 |
| MADCR-026, 027, 028, 058 (provider verification) | CAN RUN NOW, fully independent | MADCR v1.1 §6.3/6.6 |
| MADCR-059 (migration `-FIXED` canonicalization) | CAN RUN NOW, fully independent of every new-wave candidate | MADCR v1.1 §6.6, `CURRENT-PROJECT-STATE-rev10` |
| MADCR-013/OD-11, MADCR-060/OD-12 (business clarification) | CAN RUN NOW, non-blocking per repository's own governance notes | MADCR v1.1 §6.1/6.6 |
| OPEN-C01 (MADCR-012) scope clarification | CAN RUN NOW, recommended before Session 3a (Commercial) closes for approval | MADCR v1.1 §0A.3 |

**Largest immediately-parallel batch:** 13 candidates (Session 1 + Session 2 + Deferred) can begin drafting the same week, with zero mutual blocking.

---

# 18. DOWNSTREAM ERD/API/RBAC GATES

Per §29–33 of the Master Prompt — impact identified, no artifact created.

## ERD Gate
| Blocked ERD area | Waiting on | Rule |
|---|---|---|
| M14 Commercial (Subscription/Entitlement/Quota tables) | MADCR-010 APPROVED | ERD must not become authoritative while OPEN-Q1 is unresolved |
| M12 Organization quota-adjacent tables | MADCR-010 APPROVED | Same rule — quota-authority ambiguity would corrupt schema design |
| Payment tables (M14 subdomain or M16 module) | MADCR-011 APPROVED | Module boundary must be settled before table ownership is fixed |
| Title (M15) core tables (Definition/Instance/Path/Provenance) | MADCR-036 APPROVED (+037/038/039/040/043 for full schema) | Foundational split must close first |
| M04-extend (Learning Point ledger, Learning Session) tables | MADCR-014, 023, 049 APPROVED | Ledger/session/course-boundary decisions shape schema |

## API Gate
| Blocked API area | Waiting on | Rule |
|---|---|---|
| Payment ownership/endpoints | MADCR-011 APPROVED | Module boundary determines API surface owner |
| Entitlement/quota endpoints | MADCR-010 APPROVED | Same |
| Event-model-dependent endpoints (cross-domain webhooks/notifications) | MADCR-051 APPROVED | Event contract strategy shapes API payloads |
| Authorization-model-dependent endpoints (all new-wave) | MADCR-053 APPROVED | Permission taxonomy must exist before endpoint-level authorization is finalized |

## RBAC Gate
| Blocked RBAC area | Waiting on | Rule |
|---|---|---|
| Title authorization | MADCR-048 APPROVED (→ 053, 036) | Do not invent permissions ahead of the taxonomy |
| Learning Session host/instructor authorization | MADCR-054 APPROVED (→ 053) | Same |
| Commercial administration authorization | MADCR-055 APPROVED (→ 010, 011, 053) | Same |
| Learning Point adjustment authorization | MADCR-056 APPROVED (→ 014, 053) | Same |
| Title award issuance/revocation/appeal authorization | MADCR-057 APPROVED (→ 036, 039, 042, 053) | Same |

## Migration Gate
| Item | Status | Dependency |
|---|---|---|
| MADCR-059 (`-FIXED` canonicalization) | **Independent existing-baseline blocker** | Blocks Sprint S0 only; no dependency on any new-wave candidate above, confirmed in MADCR v1.1 §6.6 and re-verified against `CURRENT-PROJECT-STATE-rev10` |
| New-wave migrations (M14/M15/M04-extend) | Do not exist yet | Cannot be planned until respective ERD Gates above close — no migration redesign performed by this plan |

**No ERD, API, RBAC, or migration artifact was created by this plan** — only the gate conditions are identified, per §29–33.

---

# 19. MISSING SOURCE / EVIDENCE GAPS

## 19.1 Missing Source (carried forward from MADCR v1.1, unchanged)

| Item | Status | Action |
|---|---|---|
| MADCR-062 (`MBR-COM-001–013`) | UNKNOWN / SOURCE RECOVERY | Run in parallel (§17); do not reconstruct; do not convert into an ADR |
| MADCR-063 (`MBR-LS-001–015`) | UNKNOWN / SOURCE RECOVERY | Same |

## 19.2 RECONCILIATION REQUIRED — internal MADCR v1.1 discrepancies found during dependency-graph construction

These are **not** repository-vs-MADCR conflicts; they are discrepancies between MADCR v1.1's own formal `Depends On` column (used as authoritative for this plan's graph, per §6 Sequencing Method) and its own descriptive `Blocks` free-text column for the *same* candidates. Per governing rule (§3 of the Master Prompt: "Jangan diam-diam mengubah MADCR... Catat discrepancy sebagai RECONCILIATION REQUIRED"), these are flagged rather than silently resolved in either direction:

| ID | Discrepancy | Formal field used here | Free-text claim | Practical effect on this plan |
|---|---|---|---|---|
| REC-01 | MADCR-046's `Blocks` column names MADCR-036, but MADCR-036's own `Depends On` field lists no prerequisite | `Depends On` (036 = none) | `Blocks` (046→036) | Both were placed in Session 1 (S0) regardless, so the practical sequencing outcome is unaffected — but the Architecture Review Board should clarify whether 046 genuinely informs 036's scope before both are finalized |
| REC-02 | MADCR-049's `Blocks` column names MADCR-014 and MADCR-023, but neither's own `Depends On` field lists 049 | `Depends On` (014=none, 023=022 only) | `Blocks` (049→014, 023) | 049 was placed in Session 1, 014/023 in Session 2 (parallel, not sequential) — if the free-text claim is correct, Session 2 should not close for *approval* until Session 1's MADCR-049 is also approved; flagged for Board clarification before Session 2 approval (not drafting) proceeds |
| REC-03 | MADCR-010's `Blocks` column names MADCR-002, but MADCR-002's own `Depends On` field lists only MADCR-011 | `Depends On` (002 = 011 only) | `Blocks` (010→002) | Minor — 002 is already sequenced after Session 1 regardless (Session 3a), so no practical resequencing needed; noted for completeness |

**These 3 items should be resolved by the Architecture Review Board or Document Custodian as a MADCR v1.2 hygiene pass** — this plan does not resolve them, and has sequenced conservatively (treating the formal `Depends On` field as authoritative, as instructed) while flagging the discrepancy transparently.

---

# 20. ADR READINESS MATRIX

Per §26–28 vocabulary: NOT READY / DRAFTABLE / READY FOR REVIEW / READY FOR DECISION / APPROVED / ALREADY DECIDED / BLOCKED / DEFERRED.

| Readiness state | Candidates | Count |
|---|---|---|
| **DRAFTABLE now** (no prerequisite, or prerequisite is a satisfied G-item) | MADCR-001, 004, 006, 007, 010, 011, 014, 023, 036, 046, 049, 050, 051 | 13 |
| **DRAFTABLE (shell only, prerequisite drafted not approved)** | MADCR-002, 003, 005, 009, 015, 016, 037, 038, 039, 040, 041, 042, 043, 053 | 14 |
| **BLOCKED** (cannot even shell-draft meaningfully without prerequisite's shell existing first, per this plan's Wave sequencing) | MADCR-048, 054, 055, 056, 057 | 5 |
| **READY FOR DECISION** | *(none yet — no Category-A candidate has all prerequisites APPROVED, since no ADR has been approved at the start of this plan)* | 0 |
| **APPROVED** | *(none — no authoritative existing approval found for any of the 32 Category-A candidates; confirmed by repository re-scan, §3)* | 0 |
| **ALREADY DECIDED** (Category G, outside the 32) | MADCR-022, MADCR-029 | 2 (not Category A) |
| **DEFERRED** | MADCR-006, 007 (also DRAFTABLE now; DEFERRED refers to priority/session timing, not drafting eligibility) | 2 |

**Verification:** 13 + 14 + 5 = 32 Category-A candidates accounted for by readiness state ✓.

**Explicit non-claim:** no candidate is marked APPROVED anywhere in this document, consistent with §26's rule that APPROVED may only be used where authoritative existing approval is found in the repository — none was found for any new-wave candidate.

---

# 21. GOVERNANCE RISKS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Session 5 (Security/RBAC) is drafted prematurely before its Session-1/3c/4 prerequisites are truly approved, causing rework | Medium | Medium | Enforce the Approval Wave gating in §11 strictly; shells may exist early, approvals may not |
| REC-01/02/03 (§19.2) are never resolved, leaving a silent ambiguity between MADCR's `Blocks` and `Depends On` fields | Medium | Low–Medium | Escalate as a MADCR v1.2 hygiene item to the Document Custodian |
| Architecture Review Board treats "25 structurally ADR-eligible" as "25 should be approved quickly," collapsing the Draft/Decision/Approval distinction | Medium | High | This plan's explicit three-state separation (§7 Drafting Status / Approval Dependency columns) should be presented alongside any summary count |
| OPEN-C01 (MADCR-012) is never clarified, and Session 3a (Commercial) proceeds to approval on an ambiguous source-document relationship | Medium | Medium | Recommend OPEN-C01 clarification complete before Session 3a *approval* (not drafting) |
| MADCR-013/OD-11 is escalated as if it were a hard blocker (contrary to MADCR v1.1 §0A.4's explicit non-blocking canonicalization), unnecessarily delaying the entire Commercial cluster | Low (this plan explicitly guards against it, §13) | High if it occurs | This plan's Commercial cluster section explicitly labels OD-11 CONTEXTUAL/NON-BLOCKING per instruction §7 |
| Session 1's 5 candidates are decided in an order that contradicts their true fan-out ranking (e.g., MADCR-046/049 decided before MADCR-036, when 036 has far higher leverage) | Low–Medium | Medium | §7/§8 explicitly rank by Total Reach; Board retains scheduling discretion within Session 1 but should see this ranking |
| Migration `-FIXED` canonicalization (MADCR-059) gets bundled into new-wave governance discussions and delayed unnecessarily | Low | Medium (delays existing-baseline Sprint S0) | §17/§18 explicitly reconfirm its independence |

---

# 22. FINAL RECOMMENDED SEQUENCE

**One-line summary of the entire plan:**

```text
Session 1 (S0, parallel-eligible w/ Session 2): MADCR-036, 011, 010, 046, 049
Session 2 (S1, parallel-eligible w/ Session 1): MADCR-001, 004, 014, 023, 050, 051
Session 3a (Commercial, dependent):             MADCR-002, 003, 005, 009
Session 3b (Learning Economy, dependent):        MADCR-015, 016
Session 3c (Title, dependent, layer 1):          MADCR-037, 039, 040
Session 4  (Title, dependent, layer 2):          MADCR-038, 041, 042, 043
Session 5  (Security/RBAC, converges on 053):    MADCR-053, 048, 054, 055, 056, 057
Session 6  (Deferred, opportunistic):            MADCR-006, 007
```

**Recommended first Architecture Review Board gate (per §40 criteria — blocker count, fan-out, domain boundary, data/security/cross-domain impact, reversibility):**

**MADCR-036 (Title Definition vs Award Instance)** — highest total reach (13) of any candidate register-wide, irreversible data-model consequence, CRITICAL data impact, foundational for 8 direct dependents. **MADCR-010 and MADCR-011 (OPEN-Q1/Q2)** should open in the same first gate — both zero-prerequisite, both explicitly Gate-1-flagged by CAIA, both CRITICAL cross-domain impact, together they unblock 7 further candidates. **This is a sequencing recommendation only; no option within any of these three decisions is selected here.**

---

# 23. QUALITY GATE

Self-check against Master Prompt §46:

- [x] MADCR v1.1 used as primary candidate source (not rebuilt from scratch)
- [x] Repository checked for evidence (§3 — ADR register re-grepped, confirmed no new-wave ADR numbers exist)
- [x] 64 canonical candidates preserved (§4, unchanged)
- [x] 32 Category-A preserved (§4, §7, §8 — all 32 accounted for)
- [x] 9 ADR REQUIRED preserved (§4; itemized as MADCR-010,011,036,037,039,042,046,049,053)
- [x] 22 ADR RECOMMENDED preserved (§4)
- [x] 1 ADR POSSIBLE preserved (§4; MADCR-006/007 both carry POSSIBLE per MADCR v1.1 — note: MADCR v1.1 lists "1 ADR POSSIBLE" as a count but §7 of MADCR v1.1 shows both 006 AND 007 as POSSIBLE, i.e. 2 rows with that label; this plan reproduces MADCR v1.1's stated count of "1" as given and flags the apparent row-count mismatch here as a further RECONCILIATION REQUIRED item for the Document Custodian, rather than silently changing MADCR v1.1's headline arithmetic)
- [x] 7 blocked Category-A preserved (§4, §9 — MADCR-009,048,053,054,055,056,057)
- [x] OPEN-Q1 preserved (§7 Session 1, unresolved)
- [x] OPEN-Q2 preserved (§7 Session 1, unresolved)
- [x] OPEN-C01 preserved (§13, unresolved, flagged as pre-Session-3a condition)
- [x] OD-11 remains contextual/non-blocking (§13, explicit)
- [x] Agency = Organization preserved (not referenced as a candidate anywhere in this plan)
- [x] Learning Session remains inside Learning Domain (§15, MADCR-022 kept Already Decided, not resequenced)
- [x] M01–M13 baseline preserved (§21, not reopened)
- [x] No architecture option selected (self-checked §22 closing line, §41 pattern avoided throughout)
- [x] No ADR approved (§20 — zero candidates marked APPROVED)
- [x] No ERD created (§18 — impact identified only)
- [x] No API created (§18)
- [x] No RBAC created (§18)
- [x] No Business Rule modified
- [x] No missing MBR invented (§19.1 — MADCR-062/063 kept UNKNOWN)
- [x] Dependency evidence recorded (§8, sourced from MADCR v1.1 `Depends On` fields)
- [x] Drafting separated from approval (§10 vs §11, explicit throughout §7 columns)
- [x] Approval separated from implementation (§18 Gates — no implementation artifact created)
- [x] Exact counts reported (§4, §7, §8, §20 — no "~" used; MADCR v1.1's own counts reproduced verbatim)
- [x] Contradictions surfaced (§19.2 — 3 REC items; §23 — 1 additional POSSIBLE-count reconciliation item)
- [x] No hidden architecture decisions (§22 explicit self-check; every priority statement phrased as ordering rationale)

**One additional discrepancy surfaced during this quality gate pass (not previously listed in §19):** MADCR v1.1's summary states "1 ADR POSSIBLE" but its own §7 table lists 2 rows (MADCR-006, MADCR-007) with that exact label. **REC-04, flagged for Document Custodian**, not resolved here.

---

# 24. FINAL STATUS

**PROPOSED — PENDING ARCHITECTURE REVIEW BOARD ACCEPTANCE**

This status is not upgraded to FINAL/APPROVED/LOCKED because no repository evidence of Board acceptance for this specific sequencing plan exists yet.

**No architecture decision was made anywhere in this document.** OPEN-Q1, OPEN-Q2, OPEN-C01, and all 32 Category-A candidates remain exactly as MADCR v1.1 recorded them — this plan only orders the *process* of deciding them.

**Next governance artifact after acceptance:** ADR draft shells for the 13 Wave-1 candidates (§10), beginning with Session 1 (§12).

---

**— END OF DOCUMENT: ADR MASTER SEQUENCING & DRAFTING PLAN v1.0 —**
