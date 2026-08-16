# ADR BATCH 1 — DRAFTING CONTROL & EVIDENCE PACK v1.0
## RUMAHAGEN — Pre-Draft ADR Control Gate

| Field | Value |
|---|---|
| **Document ID** | ADR-B1-CTRL-001 |
| **Mode** | Pre-Draft Governance Control — NOT ADR Drafting |
| **Batch** | Batch 1 — Foundation |
| **Candidates** | `MADCR-010, 011, 036, 046, 049` (exactly 5, none added, none removed) |
| **Companion files** | `ADR-BATCH-1-EVIDENCE-PACK-MADCR-010.md`, `-011.md`, `-036.md`, `-046.md`, `-049.md`, `ADR-BATCH-1-DEPENDENCY-MATRIX-v1.0.md`, `ADR-BATCH-1-CROSS-CONFLICT-CHECK-v1.0.md` |

---

## 1. PURPOSE

Make the Batch 1 decision package complete, traceable, evidence-based, and safe for the next governance stage (ADR drafting). **No architecture decision, business decision, ERD, API, RBAC, or implementation content was created.** OPEN-Q1, OPEN-Q2, and OPEN-C01 remain exactly as open as found.

---

## 2. SOURCE HIERARCHY

Applied exactly as specified in this task's §2 (Level 0–10), consistent with the hierarchy already established across MAEP v1.1 and the Pre-ADR Reconciliation cycle. Where two sources differed (found in 4 instances — see §9 below), neither was silently chosen; both are recorded.

---

## 3. BATCH CANDIDATES

| MADCR ID | Title (as found, primary source) |
|---|---|
| `MADCR-010` | OPEN-Q1: Commercial Entitlement vs Organization Quota (Gate v1.3 §4.1) |
| `MADCR-011` | OPEN-Q2: Payment placement, M14 subdomain vs separate module (Gate v1.3 §4.2) |
| `MADCR-036` | Separate Title Definition from Award Instance (AEP-TITLE-001 §27, ADR Candidate 1) |
| `MADCR-046` | Certificate/Credential vs Title separation (CAIA-ADR-010) |
| `MADCR-049` | Learning Activity vs existing Course model (CAIA Gate 1, item 2) |

**No candidate added. No candidate removed.** One `CANDIDATE VALIDITY OBSERVATION` recorded for `MADCR-049` (its core term "Learning Activity" is not independently defined in either relevant domain AEP) — **not treated as grounds for deletion**, per this task's explicit instruction (§4).

---

## 4. BATCH READINESS SUMMARY

| MADCR ID | Readiness (from individual evidence pack §6) |
|---|---|
| `MADCR-010` | READY FOR ADR DRAFTING |
| `MADCR-011` | READY FOR ADR DRAFTING |
| `MADCR-036` | READY FOR ADR DRAFTING |
| `MADCR-046` | READY WITH CONDITIONS |
| `MADCR-049` | READY WITH CONDITIONS |

---

## 5. EVIDENCE COMPLETENESS

| MADCR ID | Evidence items | Confidence distribution |
|---|---|---|
| `MADCR-010` | 5 | 4 HIGH, 1 MEDIUM |
| `MADCR-011` | 5 | 3 HIGH, 2 MEDIUM |
| `MADCR-036` | 7 | 7 HIGH |
| `MADCR-046` | 6 | 6 HIGH |
| `MADCR-049` | 6 | 4 HIGH (existence/absence findings), 2 MEDIUM (content/detail) |

**No evidence item was found to not support its stated claim** (self-check per §17 of this task, re-verified across all 5 packs).

---

## 6. DECISION-QUESTION COMPLETENESS

| MADCR ID | Question type | Completeness |
|---|---|---|
| `MADCR-010` | PRIMARY QUESTION with explicit Option A/B | Complete |
| `MADCR-011` | PRIMARY QUESTION with explicit two named options | Complete |
| `MADCR-036` | PRIMARY QUESTION (assertion-framed, no A/B options in source) | Complete, framing noted |
| `MADCR-046` | PRIMARY QUESTION (assertion-framed, no A/B options in source) | Complete, framing noted |
| `MADCR-049` | **DECISION QUESTION GAP — partial.** Only a terse label found in every source; no elaborating sentence | **Incomplete relative to the other 4** — recorded as a gap, not filled with an invented question |

---

## 7. BUSINESS RULE TRACEABILITY

| MADCR ID | BR basis | Gap? |
|---|---|---|
| `MADCR-010` | Legacy BR §3/§6 (general principle only), `MBR-COM-X03` (Gate v1.3 §3) | Partial — `MBR-COM-001–013` itself remains a source gap |
| `MADCR-011` | AEP-MON-001 §16 Principle 8 (adapter-replaceable) only | Partial — no direct BR citation found; also affected by `MBR-COM` gap |
| `MADCR-036` | **13 specific, Final-status Title Rules** (003,011–013,021–023,037–038,051–052,093–095) | **None — strongest BR basis of the 5** |
| `MADCR-046` | Title Rule 013 only | Minor — thinner than `036` but present, no M04-side rule found |
| `MADCR-049` | **BUSINESS RULE SOURCE GAP** — none found | **Full gap — weakest BR basis of the 5** |

---

## 8. AEP TRACEABILITY

| MADCR ID | Direct AEP(s) | Notes |
|---|---|---|
| `MADCR-010` | CAIA-001 (direct); AEP-MON-001 (indirect, quota architecture context) | — |
| `MADCR-011` | CAIA-001 (direct); AEP-MON-001 (direct, Payment Gateway architecture); AEP-MON-002 (reference only) | OPEN-C01 caveat applies (§10 below) |
| `MADCR-036` | AEP-TITLE-001 (direct, originating); CAIA-001 (direct) | — |
| `MADCR-046` | CAIA-001 (direct, sole originating); AEP-TITLE-001 (indirect, shares Rule 013) | — |
| `MADCR-049` | CAIA-001 (direct, sole originating); AEP-LE-001 and AEP-LS-001 both checked, **neither uses the term "Learning Activity"** (reference only) | Candidate Validity Observation |

**No AEP modified by this control gate.**

---

## 9. DEPENDENCY STATUS

**Full detail: `ADR-BATCH-1-DEPENDENCY-MATRIX-v1.0.md`.** Summary: all 5 candidates have **zero formal Category-A prerequisite**. **4 dependency-field discrepancies found** across the batch (all pre-existing in the Pre-ADR Discrepancy Register, re-verified here directly against source text, not newly invented):

| Discrepancy | Candidates | Cross-batch? |
|---|---|---|
| `DISC-06` | `MADCR-046` claims to block `MADCR-036`; unmirrored | No — both in Batch 1 |
| `DISC-07` | `MADCR-049` claims to block `MADCR-014, 023`; unmirrored | **Yes — reaches into Batch 2** |
| `DISC-08` | `MADCR-010` claims to block `MADCR-002`; unmirrored | Yes — `002` is Batch 2 |
| (extension, this cycle) | `MADCR-011`'s `Blocks` field incomplete relative to `053`/`055`'s own `Depends On` fields | Yes — `053/055` are Batch 4 |

**SEQUENCING VALIDATION REQUIRED** flagged for `DISC-06` and `DISC-07` specifically, per Dependency Matrix §"SEQUENTIAL/PARALLEL DETERMINATION". **Not fixed here.**

---

## 10. OPEN DECISION IMPACT

| MADCR ID | OPEN-Q1 | OPEN-Q2 | OPEN-C01 |
|---|---|---|---|
| `MADCR-010` | IS OPEN-Q1 | AFFECTED BUT NOT BLOCKED | AFFECTED BUT NOT BLOCKED |
| `MADCR-011` | AFFECTED BUT NOT BLOCKED | IS OPEN-Q2 | **REQUIRES GOVERNANCE RECONCILIATION** — its primary Payment-architecture evidence (AEP-MON-001) rests on an unconfirmed relationship to AEP-MON-002 |
| `MADCR-036` | NOT AFFECTED | NOT AFFECTED | NOT AFFECTED |
| `MADCR-046` | NOT AFFECTED | NOT AFFECTED | NOT AFFECTED |
| `MADCR-049` | NOT AFFECTED | NOT AFFECTED | NOT AFFECTED |

**None of the three OPEN decisions resolved here.**

---

## 11. DOWNSTREAM IMPACT

| MADCR ID | Strongest documented downstream impact |
|---|---|
| `MADCR-010` | DIRECT: ERD (M14/M12) |
| `MADCR-011` | DIRECT: ERD, API (Payment) |
| `MADCR-036` | DIRECT: ERD (M15); INDIRECT: API, RBAC, UI, Workflow |
| `MADCR-046` | **DIRECT: ERD, API, RBAC, PRD, User Flow, Test strategy — most extensively documented of the 5** (CAIA §6.3 explicitly enumerates all six) |
| `MADCR-049` | DIRECT: ERD (M04-extend); rest largely INDIRECT or UNKNOWN |

**No downstream artifact modified.**

---

## 12. CROSS-ADR CONFLICT STATUS

**Full detail: `ADR-BATCH-1-CROSS-CONFLICT-CHECK-v1.0.md`.** Summary: 10 pairs checked; **7 NO CONFLICT, 3 OVERLAP, 0 POTENTIAL CONFLICT, 0 DIRECT CONFLICT.** The 3 OVERLAP pairs (`010×011`, `036×046`, `046×049`) reflect genuine domain/methodological adjacency, not scope duplication or contradictory outcomes. **No conflict resolved or merged.**

---

## 13. BASELINE INTEGRITY

Explicitly re-verified for Batch 1 specifically (extending the Pre-ADR Reconciliation's Workstream F, not merely repeating it):

| Baseline item | Batch 1 impact check | Result |
|---|---|---|
| Agency = Organization | None of the 5 candidates touch this concept | **No violation** |
| M01–M13 baseline | `MADCR-036/046/049` propose new/extended structures (M15, M04-extend) but do not rename/split/merge any existing M01–M13 module | **No violation** |
| Learning Session = M04 extension | `MADCR-049` is adjacent but does not reopen this — confirmed `MADCR-022` (the governing candidate for this specific placement) is untouched by any Batch-1 item | **No violation** |
| Existing Supabase/Auth/RBAC/RLS architecture | None of the 5 candidates propose infrastructure changes | **No violation** |
| Existing approved technology decisions (29 ADR) | None contradicted | **No violation** |
| Existing approved ADRs | None superseded or altered | **No violation** |

**No BASELINE CHANGE REQUIRED found for any Batch 1 candidate.**

---

## 14. COMMERCIAL BOUNDARY CHECK

Per this task §10, explicit check for whether any Batch 1 candidate crosses Commercial architecture boundaries, given `OPEN-C01`/`AEP-MON-001`/`AEP-MON-002`/`MBR-COM` all remain unresolved:

| MADCR ID | Crosses Commercial boundary? |
|---|---|
| `MADCR-010` | **YES — it IS a Commercial-boundary question** (`COMMERCIAL DEPENDENCY` recorded) |
| `MADCR-011` | **YES — it IS a Commercial-boundary question** (`COMMERCIAL DEPENDENCY` recorded) |
| `MADCR-036` | No — confirmed zero Commercial citation in its evidence pack §5.8 |
| `MADCR-046` | No — confirmed zero Commercial citation |
| `MADCR-049` | No — confirmed zero Commercial citation |

**`COMMERCIAL DEPENDENCY` recorded for `MADCR-010` and `MADCR-011`.** Given both also carry a `MBR-COM-001–013` source-gap caveat (via their evidence packs §5.5) and `MADCR-011` additionally carries the `OPEN-C01` caveat (§10 above), **these two candidates carry more governance-reconciliation weight than `036/046/049`, even though all five are equally "READY" or "READY WITH CONDITIONS" for drafting.** Not resolved here.

---

## 15. APPROVAL PREREQUISITES (batch-level synthesis)

| MADCR ID | Key prerequisite before APPROVAL (not drafting) |
|---|---|
| `MADCR-010` | None hard-blocking; `MBR-COM` gap limits confidence only |
| `MADCR-011` | `OPEN-C01` clarification recommended before approval |
| `MADCR-036` | None hard-blocking |
| `MADCR-046` | `DISC-06` ordering question should be discussed with `MADCR-036` before approval |
| `MADCR-049` | `DISC-07` cross-batch ordering question should be discussed before approval; term "Learning Activity" should be clarified during drafting |

---

## 16. APPROVAL CRITERIA (batch-level synthesis)

Each candidate's full criteria are in its individual evidence pack (§5.14). Common pattern across all 5: (1) Board formally records its decision, (2) consistency with cited Business Rules/principles is confirmed, (3) any flagged dependency discrepancy is at minimum discussed, (4) downstream artifact owners are notified once the decision closes. **No criterion's satisfaction is decided here.**

---

## 17. PER-ADR READINESS

See §4 (Batch Readiness Summary) above and each individual evidence pack's §6.

---

## 18. BATCH-LEVEL READINESS

**Batch 1 overall: READY WITH CONDITIONS.**

3 of 5 candidates (`010, 011, 036`) are unconditionally READY FOR ADR DRAFTING. 2 of 5 (`046, 049`) are READY WITH CONDITIONS — in both cases the condition concerns a dependency-field discrepancy requiring Board discussion, not a drafting blocker. No candidate is BLOCKED, SOURCE RECOVERY REQUIRED, or GOVERNANCE RECONCILIATION REQUIRED at the drafting-eligibility level (though `MADCR-011` carries a governance-reconciliation recommendation *before approval*, per §10).

---

## 19. BLOCKING CONDITIONS

**None of the 5 candidates are blocked from drafting.** For approval (not drafting), the following are recommended, not mandatory-and-verified-here:
1. `DISC-06` (`046`↔`036` ordering) — Board discussion recommended, ideally same session.
2. `DISC-07` (`049`↔`014/023` cross-batch ordering) — Board discussion recommended.
3. `OPEN-C01` clarification — recommended before `MADCR-011` approval.
4. `MBR-COM-001–013` source-recovery status — affects confidence for `MADCR-010/011`, does not block drafting.

---

## 20. RECOMMENDED NEXT ACTION

**PROCEED WITH CONDITIONS.**

(Not a re-selection among the allowed vocabulary's other options: not "PROCEED TO ADR DRAFTING" unconditionally, because 2 of 5 candidates carry Board-discussion recommendations that should accompany, not necessarily precede, drafting; not "HOLD," "GOVERNANCE RECONCILIATION REQUIRED," "BUSINESS DECISION REQUIRED," or "SOURCE RECOVERY REQUIRED" as the *batch-level* verdict, because none of these rise to a batch-blocking level — they are per-candidate conditions attached to an otherwise-proceeding batch.)

---

# ADR BATCH 1 CONTROL GATE RESULT

## MADCR-010

- **Decision question:** Is Commercial Entitlement the source of Agency/Organization quota capacity (Option A), or is the existing Organization quota model itself the authoritative commercial entitlement representation (Option B)? (Gate v1.3 §4.1, verbatim options)
- **Evidence status:** Complete — 5 items, 4 HIGH / 1 MEDIUM confidence
- **Business Rule status:** Partial — general BR principles only; `MBR-COM-001–013` remains a source gap
- **AEP status:** DIRECT (CAIA), INDIRECT (AEP-MON-001)
- **Dependency status:** Zero formal prerequisite; 1 minor discrepancy (`DISC-08`, unmirrored `Blocks`-field claim toward `MADCR-002`)
- **Open decision impact:** IS OPEN-Q1; `COMMERCIAL DEPENDENCY` recorded
- **Downstream impact:** DIRECT — M14/M12 ERD
- **Approval prerequisites:** None hard-blocking
- **Readiness:** READY FOR ADR DRAFTING
- **Blocking issue:** None

## MADCR-011

- **Decision question:** Should Payment be a Commercial (M14) subdomain, or a separate logical module bounded behind Commercial? (Gate v1.3 §4.2, verbatim options)
- **Evidence status:** Complete — 5 items, 3 HIGH / 2 MEDIUM confidence
- **Business Rule status:** Partial — one architecture principle citation only; `MBR-COM` gap applies
- **AEP status:** DIRECT (CAIA, AEP-MON-001), REFERENCE ONLY (AEP-MON-002)
- **Dependency status:** Zero formal prerequisite; `Blocks`-field incompleteness found relative to `MADCR-053/055`
- **Open decision impact:** IS OPEN-Q2; `COMMERCIAL DEPENDENCY` and `OPEN-C01` governance-reconciliation recommendation both recorded
- **Downstream impact:** DIRECT — Payment ERD/API
- **Approval prerequisites:** `OPEN-C01` clarification recommended before approval
- **Readiness:** READY FOR ADR DRAFTING
- **Blocking issue:** None (drafting); governance-reconciliation recommended before approval

## MADCR-036

- **Decision question:** Should Title Definition be modeled as a separate object from an earned Award Instance? (AEP-TITLE-001 §4.2/§27, stated as an architectural requirement, not an A/B choice)
- **Evidence status:** Complete — 7 items, all HIGH confidence — strongest of the 5
- **Business Rule status:** Strongest of the 5 — 13 specific, Final-status Title Rules cited, 3 independently re-verified verbatim
- **AEP status:** DIRECT (AEP-TITLE-001, CAIA)
- **Dependency status:** Zero formal prerequisite; highest total reach in the entire 64-item MADCR register (13); disputed edge with `MADCR-046` (`DISC-06`)
- **Open decision impact:** NOT AFFECTED by any of the three OPEN decisions — cleanest of the 5
- **Downstream impact:** DIRECT — M15 ERD
- **Approval prerequisites:** None hard-blocking
- **Readiness:** READY FOR ADR DRAFTING
- **Blocking issue:** None

## MADCR-046

- **Decision question:** Where is the boundary between the existing `certificates` table (M04) and the new Title/Award Instance model (M15)? (CAIA §6.3, stated as a prohibition/requirement, not an A/B choice)
- **Evidence status:** Complete — 6 items, all HIGH confidence
- **Business Rule status:** Minor — Title Rule 013 only, shared with `MADCR-036`
- **AEP status:** DIRECT (CAIA, sole originating source)
- **Dependency status:** Zero formal prerequisite; disputed edge claiming to block `MADCR-036` (`DISC-06`) — the most consequential discrepancy in the batch given `036`'s register-wide highest fan-out
- **Open decision impact:** NOT AFFECTED
- **Downstream impact:** **Most extensively documented of the 5** — DIRECT: ERD, API, RBAC, PRD, User Flow, Test strategy (CAIA §6.3 explicitly enumerates all six)
- **Approval prerequisites:** `DISC-06` ordering question should be discussed with `MADCR-036`, ideally same session
- **Readiness:** READY WITH CONDITIONS
- **Blocking issue:** None for drafting; ordering discussion recommended before approval

## MADCR-049

- **Decision question:** What is the boundary between the new "Learning Activity" concept and the existing Course/Lesson model (M04)? — **DECISION QUESTION GAP, partial**: only a terse two-word label found in every source, no elaborating sentence
- **Evidence status:** Complete but weakest of the 5 — 6 items; includes 2 explicit absence-findings (term not used in either domain-specific AEP)
- **Business Rule status:** **BUSINESS RULE SOURCE GAP — full gap, weakest of the 5**
- **AEP status:** DIRECT (CAIA, sole originating source); REFERENCE ONLY (AEP-LE-001, AEP-LS-001 — neither uses the term)
- **Dependency status:** Zero formal prerequisite; disputed edge claiming to block `MADCR-014, 023` (`DISC-07`) — the only Batch-1 discrepancy with **cross-batch** consequence (reaches into Batch 2)
- **Open decision impact:** NOT AFFECTED
- **Downstream impact:** DIRECT — M04-extend ERD; rest largely INDIRECT/UNKNOWN
- **Approval prerequisites:** `DISC-07` cross-batch ordering question should be discussed; "Learning Activity" term should be clarified during drafting
- **Readiness:** READY WITH CONDITIONS
- **Blocking issue:** None for drafting; **`CANDIDATE VALIDITY OBSERVATION`** recorded (term not independently sourced) — not grounds for deletion, per instruction

---

# BATCH 1 OVERALL STATUS: **READY WITH CONDITIONS**

**No architecture decision was made. No business decision was made. No ADR was created. OPEN-Q1, OPEN-Q2, and OPEN-C01 remain exactly as open as found.**
