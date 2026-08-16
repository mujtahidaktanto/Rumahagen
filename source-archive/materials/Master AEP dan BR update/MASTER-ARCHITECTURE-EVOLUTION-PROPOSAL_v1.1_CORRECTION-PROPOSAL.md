# MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL_v1.1_CORRECTION-PROPOSAL.md
## RUMAHAGEN — MAEP Correction Proposal (v1.0 → v1.1)

**Status:** PROPOSED CORRECTION SET — v1.0 remains the historical artifact and is NOT overwritten.
**Basis:** MAEP v1.0 Validation & Correction Review (`MAEP-VAL-001`), §15 Correction Register.
**Implementation:** NOT AUTHORIZED.

This document lists every change proposed for v1.1, each with what changed, why, evidence, authority, and impact. **No OPEN decision (OPEN-Q1, OPEN-Q2, OPEN-C01) is resolved here.** No new Business Rule, ADR, ERD, API, or code is created here. Agency=Organization, Learning Session/Learning Domain boundary, and all other approved domain boundaries are unchanged.

---

## CHANGE 1 (P1) — ADR Candidate Count Correction

**What changed:** Every instance of "~48 pending ADR candidates" (7 locations in v1.0: §9.2, §26, §28, §34, §39, §41, §42) is replaced with:

> "~24 genuinely distinct Mandatory Architecture Decisions (Category A) remain pending, alongside ~9 items already covered by existing/locked Business Rules (Category B, no separate ADR needed), ~3 Configuration decisions (Category C, Technical Team authority, no ADR needed), and ~3 Provider-verification tasks (Category E, Technical Team authority, no ADR needed). An additional ~12 `CAIA-ADR-*` items were found to duplicate decisions already counted within the domain-specific candidate lists and are not counted separately."

**Why:** The original figure summed every candidate label across 5 source lists (ADR-MON-001–009, ADR-LE-001–008, ADR-LS-001–007+, Title ADR 1–10, CAIA-ADR-001–015) as if fully additive, without checking for conceptual overlap or for items that are not actually architecture decisions.

**Evidence:** MAEP-VAL-001 §8 (ADR Candidate Classification Matrix), full item-by-item recategorization.

**Authority:** Architecture Governance Reviewer (this review); does not require Owner/ARB approval to correct a counting error, but the resulting ~24-item list itself still requires ARB approval to become "Approved ADR."

**Impact:** Corrects Roadmap (§34) sequencing estimate and Correction Plan (§14) scope; does not change which items are OPEN vs decided (OPEN-Q1/Q2 remain exactly as open as before).

---

## CHANGE 2 (P2) — Backward Compatibility Framing

**What changed:** §32 closing statement changes from:
> "No breaking changes identified against the existing 13-module baseline for any proposed evolution, provided the OPEN Q1 ... is resolved deliberately..."

to:

> "No confirmed breaking change identified against the existing 13-module baseline for any proposed evolution. Potential breaking impact remains unresolved for the Commercial/Organization-quota boundary pending OPEN-Q1 resolution."

**Why:** Avoids an affirmative-first sentence structure that could be read as an unconditional guarantee.

**Evidence:** MAEP-VAL-001 §4 (F-03), Gate v1.3 §13.

**Authority:** Documentation Custodian (wording precision only, no substantive change).

**Impact:** None on decisions; improves reader accuracy.

---

## CHANGE 3 (P2) — AEP Inventory ID Provenance

**What changed:** §8 AEP Inventory table gains a new column, "ID Provenance":

| AEP | ID Provenance |
|---|---|
| AEP-ORG-001 | MAEP-assigned |
| AEP-MON-001 | MAEP-assigned |
| AEP-MON-002 | MAEP-assigned |
| AEP-LE-001 | MAEP-assigned |
| AEP-LS-001 | **Source-native** (literal ID in source document) |
| AEP-TITLE-001 | MAEP-assigned |
| CAIA-001 | **Source-native** (literal "Document ID: CAIA-001" in source) |

**Why:** Prevents future readers/AI agents from searching source text for MAEP-invented IDs and concluding the referenced document is missing.

**Evidence:** MAEP-VAL-001 §7 (F-05).

**Authority:** Documentation Custodian.

**Impact:** None on decisions; improves traceability integrity.

---

## CHANGE 4 (P2) — AEP-ORG-001 Dual-Status Clarification

**What changed:** §24 AEP Reconciliation, AEP-ORG-001 row Action column splits into two lines:
- "Decision: EXISTING — PRESERVE (already Approved via ADR-026/ADR-027, integrated into System-Architecture-v1.6-FINAL §5.12)"
- "Artifact: EXISTING — VALIDATE (source AEP document's own status field still reads 'Draft — menunggu ARB sign-off' and should be corrected by its Document Custodian to reflect the approval that has, in fact, already occurred)"

**Why:** The prior single "EVOLVE" label implied the underlying decision was still in flux, when only the document's own status metadata is stale.

**Evidence:** MAEP-VAL-001 §7 (F-06).

**Authority:** Documentation Custodian (for the artifact correction); no Architecture Review Board action needed (the decision itself is not reopened).

**Impact:** None on decisions.

---

## CHANGE 5 (P2) — Target Architecture Heading

**What changed:** §29.2 heading changes from "Target Architecture (evolutionary, not rewrite)" to:

> "TARGET ARCHITECTURE — PROVISIONAL, SUBJECT TO ADR RESOLUTION (M14/M16 boundary pending OPEN-Q1/OPEN-Q2; not to be treated as FINAL/APPROVED/LOCKED)"

**Why:** Diagram content already annotated M16 as "OPEN" inline, but the section heading itself did not carry the same caveat, risking a skim-reader treating the whole diagram as settled.

**Evidence:** MAEP-VAL-001 §9.

**Authority:** Documentation Custodian.

**Impact:** None on decisions; clarifies status only.

---

## CHANGE 6 (P3) — Business Rule Reconciliation Source Labeling

**What changed:** §23 "Duplicate/contradiction found?" row changes from "None found" to:

> "None found, per Gate v1.3 self-assessment (secondary source). Not independently re-verifiable against primary `MBR-COM-001–013`/`MBR-LS-001–015` text, which remains NOT FOUND."

**Why:** Distinguishes a claim MAEP could verify directly (against primary text) from one it could only inherit from another document's own self-report.

**Evidence:** MAEP-VAL-001 §6 (F-15).

**Authority:** Documentation Custodian.

**Impact:** None on decisions; improves evidence-chain honesty.

---

## CHANGE 7 (P3) — Corpus Count Correction

**What changed:** "16 files" → "17 files" in the front-matter table and in §43 Appendix (2 locations).

**Why:** Actual upload directory and MAEP's own enumerated list both contain 17 files.

**Evidence:** MAEP-VAL-001 §4 (F-01).

**Authority:** Documentation Custodian.

**Impact:** None — all 17 files were, in fact, read and used; only the summary count was wrong.

---

## CHANGE 8 (P3) — "Production-Ready" Wording

**What changed:** §26 "existing baseline is production-ready from a documentation/governance standpoint" → "existing baseline is **documentation/governance baseline ready**."

**Why:** Avoids conflating documentation-completeness with production-readiness when 0% of the code exists and 0% of migrations have executed.

**Evidence:** MAEP-VAL-001 §4 (F-02).

**Authority:** Documentation Custodian.

**Impact:** None on decisions.

---

## WHAT IS EXPLICITLY NOT CHANGED IN v1.1

Per governance rule, v1.1 does **not**:
- resolve OPEN-Q1, OPEN-Q2, or OPEN-C01;
- create any new Business Rule;
- create any final ADR;
- create any ERD, API, or code;
- change Agency = Organization;
- change the Learning Session / Learning Domain boundary;
- change any approved domain boundary;
- alter any of the 9 items in the Architecture Preservation Register.

## APPLYING THIS PROPOSAL

v1.1 is produced by applying Changes 1–8 above to a **copy** of `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md`, saved as a new versioned file. `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md` (v1.0) remains unmodified as the historical artifact, per governance rule (Master Prompt §34/§35).
