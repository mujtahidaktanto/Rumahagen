# MASTER ARCHITECTURE DECISION CANDIDATE REGISTER (MADCR)
## RUMAHAGEN — v1.1 — CORRECTION & CANONICALIZATION

| Field | Value |
|---|---|
| **Document ID** | MADCR-001-DOC |
| **Mode** | Architecture Decision Inventory, Correction & Canonicalization |
| **Implementation** | NOT AUTHORIZED |
| **ADR Creation** | NOT AUTHORIZED |
| **Architecture Change** | NOT AUTHORIZED |
| **Method** | DISCOVER → EXTRACT → NORMALIZE → DEDUPLICATE → CLASSIFY → TRACE → PRIORITIZE → CANONICALIZE |
| **Inputs read in full** | `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md` (v1.0), `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL_v1.1_CORRECTION-PROPOSAL.md`, `MAEP-v1.0-VALIDATION-REPORT.md`, all 17 uploaded source documents, full repository re-scan |
| **Legend (Impact)** | N=NONE, L=LOW, M=MEDIUM, H=HIGH, C=CRITICAL |
| **Legend (Classification)** | A=Mandatory Architecture Decision · B=Business Rule Decision · C=Configuration Decision · D=Implementation Decision · E=Verification/Research Task · F=Governance Decision · G=Already Decided · H=Duplicate · I=Superseded · J=Not a Decision · K=Unknown |

**Central question this document answers:** *Setelah seluruh repository, MAEP, AEP, ADR, dan Business Rules direkonsiliasi, berapa dan apa saja keputusan yang benar-benar masih membutuhkan keputusan arsitektur formal?*

**Answer (exact count, no "~"):** Of **82 raw candidate mentions** discovered across 5 domain AEPs, CAIA's 3 Gate lists, and the repository's own native Open-Decision register, deduplication yields **64 unique canonical decision candidates**. Of those 64, exactly **32 are genuine Mandatory Architecture Decisions (Category A)** that have not yet been decided and are not duplicates of each other. The remaining 32 are: 14 Business Rule Decisions (B), 6 Configuration Decisions (C), 1 Implementation Decision (D), 4 Verification/Research Tasks (E), 2 Governance Decisions (F), 2 Already Decided (G), 1 Not a Decision (J), 2 Unknown/missing-source (K).

---

# 0. MADCR VALIDATION REPORT — EXECUTIVE SUMMARY

**Central finding:** Of 82 raw architecture-decision mentions discovered across the repository, 17-file upload corpus, and the prior MAEP/validation cycle, deduplication produces **64 unique canonical decision candidates**. Exactly **32 are genuine, non-duplicate Mandatory Architecture Decisions (Category A)** still requiring formal resolution — this is the corrected, exact figure superseding the prior cycle's informal "~48" and "~24" estimates.

Of those 32 Category-A items: **9 are ADR REQUIRED** (foundational/blocking), **22 are ADR RECOMMENDED**, **1 is ADR POSSIBLE**. **7 of the 32 are currently BLOCKED as architecture candidates** pending Gate-1-level decisions (OPEN-Q1 = MADCR-010, OPEN-Q2 = MADCR-011, and 5 Gate-2 RBAC items that cascade from Gate-1). **25 of the 32 are structurally eligible for ADR drafting without an A-candidate dependency blocker; however, the Commercial cluster remains subject to OPEN-C01 (MADCR-012) scope clarification before those Commercial ADRs are treated as a clean, authoritative cluster.**

The remaining 32 non-A candidates break down as: 14 Business Rule Decisions (already governed, no ADR needed), 6 Configuration Decisions, 1 Implementation Decision, 4 Verification/Research Tasks, 2 Governance Decisions, 2 Already Decided (in practice — recommend formal ADR-numbering only), 1 Not a Decision, 2 Unknown (missing primary source).

**One major cross-domain finding:** the repository's own native Open-Decision register (`decision-log.md`/`project-manifest.md`) still lists **OD-11 ("model monetisasi platform")** as OPEN — and this is, in substance, the **parent business question** that the entire uploaded Commercial/Monetization AEP cluster (MADCR-001 through MADCR-013) is a detailed architectural proposal to answer. This was not previously cross-referenced in the prior MAEP/validation cycle.

**No decision was made by this document.** OPEN-Q1, OPEN-Q2, OPEN-C01, and all 32 Category-A items remain exactly as open as they were found. Agency=Organization and Learning Session-as-Learning-Domain-extension were both re-confirmed unchanged (Existing Decision Register, §2).

**Readiness verdict:** **CONDITIONALLY READY** for ADR preparation — see §20.

## 0A. v1.1 CORRECTION & CANONICALIZATION NOTICE

This v1.1 revision is a **documentation/governance correction only**. It does not create, approve, reject, or alter any architecture decision, Business Rule, domain boundary, module boundary, technology choice, or implementation plan.

### Canonical corrections applied

1. **Canonical candidate count:** corrected all summary claims from **63 → 64** where the statement referred to the total canonical candidate count. `63` remains only where it is part of a candidate identifier such as `MADCR-063`.
2. **Classification count:** corrected **Configuration 5 → 6**. The six canonical configuration candidates are `MADCR-008`, `MADCR-008B`, `MADCR-017`, `MADCR-034`, `MADCR-044`, and `MADCR-047`.
3. **Category-A readiness wording:** replaced the unqualified "25 can proceed immediately" formulation with the more precise statement that 25 Category-A candidates are structurally ADR-eligible, while the Commercial cluster remains subject to `OPEN-C01` scope clarification.
4. **OD-11 dependency semantics:** `MADCR-013 / OD-11` is canonicalized as a **non-blocking parent business question / contextual dependency**, not as a hard technical blocker for every Commercial ADR. Any row that previously displayed `MADCR-013` as a dependency must be read with this qualification.
5. **Learning Session formalization:** `MADCR-022` remains **Already Decided**. Any ADR numbering is governance formalization only and must not reopen the already-settled Learning Session placement.
6. **Missing-source items:** `MADCR-062` and `MADCR-063` remain `UNKNOWN / SOURCE RECOVERY`. No Business Rule content is reconstructed from inference.
7. **Existing baseline preservation:** `Agency = Organization`, Learning Session as an extension of Learning Domain, existing M01–M13 baseline, and existing technology/RBAC baseline are preserved unchanged.

### Canonical count verification

`32 + 14 + 6 + 1 + 4 + 2 + 2 + 1 + 2 = 64`

`9 + 22 + 1 = 32 Category-A`

`25 + 7 = 32 Category-A`

`25 ADR-eligible Category-A + 39 non-ADR-ready / blocked / non-A rows = 64`

**Canonical status:** Proposed v1.1 — pending formal Architecture Review Board acceptance.

---

# 1. MADCR SOURCE INVENTORY

| Source ID | File | Type | Status | Authority | Relevant Decisions |
|---|---|---|---|---|---|
| SRC-01 | `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` | AEP | Proposed | Level 9 | ADR-MON-001–009 (9) |
| SRC-02 | `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` | AEP (narrower variant) | Revised, Proposed | Level 9 | No new numbered ADR list; contributes OPEN-C01 (relationship to SRC-01) |
| SRC-03 | `AEP_Learning_Economy_v1_0.md` | AEP | Proposed | Level 9 | ADR-LE-001–008 (8) |
| SRC-04 | `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` | AEP + BR | Proposed | Level 9 | ADR-LS-001–014 (14) |
| SRC-05 | `AEP_Title_Business_Rules_Baseline_v1_0.md` | AEP | Proposed | Level 9 | Title ADR Candidates 1–10 (10) |
| SRC-06 | `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` | Cross-domain analysis | Analysis Complete | Level 9 | CAIA-ADR-001–015 (15) + Gate 1 (6) + Gate 2 (6) + Gate 3 (8) = 35 |
| SRC-07 | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` | Master BR Gate | Governance Gate, NOT LOCKED | Level 3 | Confirms OPEN-Q1/OPEN-Q2 exact wording; confirms Agency=Organization RESOLVED |
| SRC-08 | `docs/00-governance/decision-log-FINAL.md` (repo) | Decision Log | Active | Level 1 (for resolved items) | OD-11, OD-12 confirmed still OPEN (repo-native) |
| SRC-09 | `docs/00-governance/project-manifest-v1.28-KONSOLIDASI-FINAL.md` (repo) | Manifest | Active | Level 1 | §7 Open Decision table — confirms exactly 2 OPEN (OD-11, OD-12) + 1 Partial (OD-09) out of 25 total logged |
| SRC-10 | `docs/02-architecture/technology-decisions-v1.6-FINAL.md` (repo) | Tech Decisions | FINAL/Baseline | Level 6 | §9 confirms 0 open technology/architecture questions; only OD-11/OD-12 (business) remain, explicitly stated as non-architectural |
| SRC-11 | `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md` (repo) | ADR Register | 29 Approved (per SRC-09 line 224, superseding the 28 figure used in the prior validation cycle) | Level 4 | Confirms 0 existing-baseline ADR still open |
| SRC-12 | `docs/02-architecture/Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md` (repo) | AEP | Document label: Draft; underlying decision: Approved via ADR-026/027 | Level 5 (decision) / Level 9 (artifact label) | G — Already Decided |
| SRC-13 | `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md` | Prior MAEP | Proposed | Level 9 | Cross-checked; superseded ~48 figure corrected here |
| SRC-14 | `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL_v1.1_CORRECTION-PROPOSAL.md` | Correction proposal | Proposed | Level 9 | Confirms P1 finding (ADR inflation) that this MADCR resolves in full |
| SRC-15 | `MAEP-v1.0-VALIDATION-REPORT.md` | Validation report | Complete | Level 9 | Source of the preliminary ~24-item estimate, now superseded by this document's exact 32-item recount |

**Note on ADR total (SRC-09/SRC-11):** the repository's own manifest (line 224, dated during the OD-25/ADR-029/ADR-047 cycle) states **29 Approved/Approved With Notes (100%), 0 OPEN**, one more than the "28" figure cited in the prior MAEP/validation cycle (which pre-dated cross-checking this specific manifest line). This MADCR uses **29** as the current, most-precise repository-confirmed count of existing-baseline ADRs, all Approved, none of which are new-wave candidates.

---

# 2. EXISTING DECISION REGISTER

| Existing Decision ID | Decision | Source | Status | Authority | Domain | Still Active? |
|---|---|---|---|---|---|---|
| EXIST-01 | Agency = Organization (single concept) | Gate v1.3 §2 (SRC-07) | APPROVED (governance-level; not yet a numbered repo ADR) | Level 3 | Organization | Yes |
| EXIST-02 | Learning Session remains inside Learning Domain (not independent, not merged into Calendar/Event) | AEP-LS-001 §2.1 (SRC-04), consistently applied across all new-wave docs with zero contradiction | Consistently stated direction (not yet formalized as numbered repo ADR) | Level 5 (consistent across Level 9 docs) | Learning | Yes |
| EXIST-03 | Organization Management System (Workspace→Organization rename, Join Request, org-scoped authorization) | ADR-026, ADR-027 (SRC-11) | APPROVED | Level 4 | Organization | Yes |
| EXIST-04 | AI Assistant Integration — BYOK, 4 curated providers, AI as assistive-only | ADR-028 (SRC-11) | APPROVED WITH NOTES | Level 4 | AI | Yes |
| EXIST-05 | Image Duplicate Detection (exact+perceptual hash) | ADR-029/ADR-047 (SRC-11) | APPROVED | Level 4 | Listing (M03) | Yes |
| EXIST-06 | 29 existing-baseline technology/architecture ADRs (search, job queue, maps, caching, backend architecture, deployment, RBAC foundation, etc.) | `architecture-decision-records-FINAL-v1.1-plus-ADR029.md` (SRC-11) | 29/29 APPROVED, 0 OPEN | Level 4 | Platform-wide | Yes |
| EXIST-07 | 13-module bounded-context baseline (M01–M13) | PRD v1.3-FINAL, System-Architecture v1.6-FINAL | FINAL/BASELINE | Level 6/8 | Cross-domain | Yes |
| EXIST-08 | 7-role RBAC model (Superadmin/Manager/Admin/Instructor/Agent/DevPartner/Buyer) | Authorization-Access-Control-Specification-v1.1-FINAL | FINAL | Level 7 | Security | Yes |
| EXIST-09 | Subscription/Entitlement/RBAC boundary — MBR-COM-001–013 (referenced only; primary text NOT FOUND) | Cited by Commercial BR Reconciliation v1.1 (upload), Master BR v1.2 (upload) | **UNKNOWN** — cannot confirm APPROVED status independently; treated provisionally as EXPLICIT per citing documents | Level 2 (claimed) / Level 9 (actual verifiable evidence) | Commercial | Provisionally yes, unverified |
| EXIST-10 | Learning Session MBR-LS-001–015 (referenced only; primary text NOT FOUND) | Cited by Master BR v1.2 §3 (upload) | **UNKNOWN**, same caveat as EXIST-09 | Level 2 (claimed) / Level 9 (actual) | Learning | Provisionally yes, unverified |

**Note:** EXIST-09 and EXIST-10 are listed here (not purely under "Missing Source," §17) because they are *claimed* to already be existing/approved decisions by their citing documents — MADCR records that claim faithfully while flagging it cannot independently verify it, consistent with §19 of this Master Prompt ("jangan membuat decision berdasarkan asumsi").

---

# 3. CANDIDATE EXTRACTION METHOD

Extraction targeted every occurrence of: explicit "ADR candidate" labels (source-native `ADR-MON-*`, `ADR-LE-*`, `ADR-LS-*`, `CAIA-ADR-*`, "ADR Candidate N"), CAIA's three Gate lists (§29), repository-native Open Decision entries still marked OPEN in `decision-log-FINAL.md`/`project-manifest-v1.28`, and cross-document relationship ambiguities identified during the prior MAEP validation cycle (OPEN-C01). Full-text search was run for "decision required," "open decision," "TBD," "TBC," "pending," "needs decision," "requires approval," and "architecture review required" across all 17 uploaded documents and the repository's governance/architecture folders — no additional un-labelled candidates were found beyond the sources already listed in §1.

**Raw candidate count (exact): 82.** Breakdown: ADR-MON (9) + ADR-LE (8) + ADR-LS (14) + Title ADR Candidates (10) + CAIA-ADR (15) + CAIA Gate 1 (6) + CAIA Gate 2 (6) + CAIA Gate 3 (8) + OD-11 (1) + OD-12 (1) + OD-09 (1) + OPEN-C01 (1) + MBR-COM-001–013 existence question (1) + MBR-LS-001–015 existence question (1) = **82**.

---

# 4. CLASSIFICATION METHOD

Each of the 82 raw mentions was normalized into a neutral Decision Question (per §9–10, §34 of the Master Prompt — no preferred answer embedded), then classified A–K per the definitions in the Master Prompt §12, then run through the ADR Necessity Test (§13) if classified A. Deduplication (§5 below) was performed by comparing decision question, scope, domain, and impact — not by ID string matching — per Master Prompt §11/§15/§16/§17.

---

# 5. DECISION DEDUPLICATION MATRIX

All 82 raw candidates mapped to their canonical candidate. "Same Decision?" = Yes means the raw item is folded into the canonical row in §6 and does not get its own register row.

| Raw Candidate | Potential Duplicate | Same Decision? | Authority | Canonical Candidate |
|---|---|---|---|---|
| ADR-MON-001 | CAIA-ADR-011 | Yes | Level 9 (both) | MADCR-001 |
| CAIA-ADR-011 | ADR-MON-001 | Yes | Level 9 | MADCR-001 |
| ADR-MON-004 | CAIA-ADR-012 (partial) | Yes (adapter half) | Level 9 | MADCR-002 |
| ADR-MON-005 | CAIA-ADR-012 (partial) | Yes (verification half) | Level 9 | MADCR-003 |
| CAIA-ADR-012 | ADR-MON-004 + ADR-MON-005 | Yes (splits into both) | Level 9 | MADCR-002, MADCR-003 |
| ADR-MON-006 | — | No (unique) | Level 9 | MADCR-004 |
| ADR-MON-007 | CAIA-ADR-013 | Yes | Level 9 | MADCR-005 |
| CAIA-ADR-013 | ADR-MON-007 | Yes | Level 9 | MADCR-005 |
| ADR-MON-003 | — | No (unique; business-locked, technical realization open) | Level 9 | MADCR-006 |
| ADR-MON-002 | — | No (unique; business-locked, technical realization open) | Level 9 | MADCR-007 |
| ADR-MON-008 | — | No (unique) | Level 9 | MADCR-008 |
| ADR-MON-009 | — | No (related to but distinct from OPEN-Q1) | Level 9 | MADCR-009 |
| CAIA Gate1.5 | OPEN-Q1 (Gate v1.3 §4.1) | Yes | Level 3 (Gate v1.3) | MADCR-010 |
| CAIA Gate1.6 | OPEN-Q2 (Gate v1.3 §4.2) | Yes | Level 3 | MADCR-011 |
| OPEN-C01 | — | No (unique, doc-relationship question) | Level 9 (discovered) | MADCR-012 |
| OD-11 | — | No (unique; repo-native, PARENT of entire Commercial cluster MADCR-001–011) | Level 1 | MADCR-013 |
| ADR-LE-001 | CAIA-ADR-002, CAIA-ADR-003 (partial) | Yes | Level 9 | MADCR-014 |
| CAIA-ADR-002 | ADR-LE-001 | Yes | Level 9 | MADCR-014 |
| CAIA-ADR-003 | ADR-LE-001, ADR-LE-002 (splits) | Yes | Level 9 | MADCR-014, MADCR-015 |
| ADR-LE-002 | CAIA-ADR-003 (partial) | Yes | Level 9 | MADCR-015 |
| ADR-LE-007 | — | No (unique) | Level 9 | MADCR-016 |
| ADR-LE-008 | — | No (unique) | Level 9 | MADCR-017 |
| ADR-LE-003 | — | No (unique; already-locked principle) | Level 9 | MADCR-018 |
| ADR-LE-004 | — | No (unique; already-locked principle) | Level 9 | MADCR-019 |
| ADR-LE-005 | Gate v1.3 §6.2 (Learning Session≠Payment owner, adjacent not identical) | No (distinct: LE-owns-Payment vs LS-owns-Payment are separate boundary statements) | Level 9 | MADCR-020 |
| ADR-LE-006 | — | No (unique; already-locked principle) | Level 9 | MADCR-021 |
| ADR-LS-001 | CAIA-ADR-004, CAIA Gate1.4 | Yes (all three) | Level 9 | MADCR-022 |
| CAIA-ADR-004 | ADR-LS-001, CAIA Gate1.4 | Yes | Level 9 | MADCR-022 |
| CAIA Gate1.4 | ADR-LS-001, CAIA-ADR-004 | Yes | Level 3 (CAIA Gate) | MADCR-022 |
| ADR-LS-002 | CAIA-ADR-005 | Yes | Level 9 | MADCR-023 |
| CAIA-ADR-005 | ADR-LS-002 | Yes | Level 9 | MADCR-023 |
| ADR-LS-009 | ADR-LS-002 (same adapter-architecture scope) | Yes (child/same ADR scope) | Level 9 | MADCR-023 |
| ADR-LS-012 | ADR-LS-002 (same principle, different wording) | Yes | Level 9 | MADCR-023 |
| ADR-LS-003 | — | No (unique; already-stated principle) | Level 9 | MADCR-024 |
| ADR-LS-004 | — | No (unique; taxonomy note) | Level 9 | MADCR-025 |
| ADR-LS-005 | CAIA Gate3.1 (partial) | Yes (partial — provider capability verification) | Level 9 | MADCR-026 |
| ADR-LS-006 | CAIA Gate3.1 (partial) | Yes (partial) | Level 9 | MADCR-027 |
| ADR-LS-007 | CAIA Gate3.1 (partial) | Yes (partial) | Level 9 | MADCR-028 |
| CAIA Gate3.1 | ADR-LS-005/006/007 (Learning Session) + Payment provider capability (new) | Yes (splits) | Level 3 | MADCR-026, MADCR-027, MADCR-028, MADCR-058 (payment-vendor part) |
| ADR-LS-008 | — | No (unique; inherits existing security architecture, effectively already decided) | Level 9 | MADCR-029 |
| ADR-LS-010 | CAIA-ADR-006 | Yes | Level 9 | MADCR-030 |
| CAIA-ADR-006 | ADR-LS-010 | Yes | Level 9 | MADCR-030 |
| ADR-LS-011 | — | No (unique; already-stated invariant) | Level 9 | MADCR-031 |
| ADR-LS-013 | — | No (unique; data-model note) | Level 9 | MADCR-032 |
| ADR-LS-014 | — | No (unique; already-stated principle, consistent w/ M13) | Level 9 | MADCR-033 |
| CAIA Gate3.2 (attendance formula) | — | No (unique) | Level 3 | MADCR-034 |
| CAIA Gate3.3 (recording retention/privacy) | — | No (unique) | Level 3 | MADCR-035 |
| Title ADR Candidate 1 | CAIA-ADR-007 | Yes | Level 9 | MADCR-036 |
| CAIA-ADR-007 | Title ADR Candidate 1 | Yes | Level 9 | MADCR-036 |
| Title ADR Candidate 2 | CAIA-ADR-008 | Yes | Level 9 | MADCR-037 |
| CAIA-ADR-008 | Title ADR Candidate 2 | Yes | Level 9 | MADCR-037 |
| Title ADR Candidate 3 | — | No (unique) | Level 9 | MADCR-038 |
| Title ADR Candidate 4 | CAIA-ADR-009 | Yes | Level 9 | MADCR-039 |
| CAIA-ADR-009 | Title ADR Candidate 4 | Yes | Level 9 | MADCR-039 |
| Title ADR Candidate 5 | — | No (unique) | Level 9 | MADCR-040 |
| Title ADR Candidate 6 | — | No (related to Candidate 2 but distinct sub-question) | Level 9 | MADCR-041 |
| Title ADR Candidate 7 | — | No (unique) | Level 9 | MADCR-042 |
| Title ADR Candidate 8 | — | No (unique) | Level 9 | MADCR-043 |
| Title ADR Candidate 9 | — | No (unique; configuration) | Level 9 | MADCR-044 |
| Title ADR Candidate 10 | — | No (unique; already-locked invariant) | Level 9 | MADCR-045 |
| CAIA-ADR-010 | CAIA Gate1.3 | Yes | Level 9 | MADCR-046 |
| CAIA Gate1.3 | CAIA-ADR-010 | Yes | Level 3 | MADCR-046 |
| CAIA Gate3.6 (exact Title awarding config) | — | No (unique; configuration) | Level 3 | MADCR-047 |
| CAIA Gate2.2 (Authority/scope model for Titles) | — | No (business principle locked; RBAC realization open) | Level 3 | MADCR-048 |
| CAIA Gate1.2 (Learning Activity vs Course) | — | No (unique, genuinely new) | Level 3 | MADCR-049 |
| CAIA-ADR-014 | — | No (unique, cross-domain) | Level 9 | MADCR-050 |
| CAIA-ADR-015 | — | No (unique, cross-domain) | Level 9 | MADCR-051 |
| CAIA Gate3.8 (final event contracts) | CAIA-ADR-015 (child/realization of) | Partial (technical-spec child, not identical scope) | Level 3 | MADCR-052 |
| CAIA Gate2.1 (new permission taxonomy) | — | No (unique, cross-domain) | Level 3 | MADCR-053 |
| CAIA Gate2.3 (LS host/instructor auth) | — | No (unique) | Level 3 | MADCR-054 |
| CAIA Gate2.4 (Commercial admin permissions) | — | No (unique, depends on MADCR-010/011) | Level 3 | MADCR-055 |
| CAIA Gate2.5 (Point adjustment permissions) | — | No (unique, local scope) | Level 3 | MADCR-056 |
| CAIA Gate2.6 (Award issuance/revocation/appeal permissions) | — | No (unique) | Level 3 | MADCR-057... |
| CAIA Gate3.4 (Payment provider vendor selection) | CAIA Gate3.1 (partial, provider-capability theme) | Partial (distinct target — payment vendor, not learning-session provider) | Level 3 | MADCR-058 |
| CAIA Gate3.5 (Commercial pricing/configuration) | — | No (unique; configuration) | Level 3 | (folds into MADCR-008 scope as related config item; kept separate as) MADCR-008b — **see note below** |
| CAIA Gate3.7 (Migration canonicalization) | GAP-14/E-10 (prior MAEP finding, existing-baseline) | Yes | Level 3 / repo | MADCR-059 |
| OD-12 | — | No (unique; repo-native, unrelated to new-wave) | Level 1 | MADCR-060 |
| OD-09 | — | No (unique; repo-native, administrative/partial) | Level 1 | MADCR-061 |
| MBR-COM-001–013 (existence question) | — | No (unique; missing-source meta-item) | N/A | MADCR-062 |
| MBR-LS-001–015 (existence question) | — | No (unique; missing-source meta-item) | N/A | MADCR-063 |

**Correction applied during matrix construction:** CAIA Gate3.5 ("Commercial pricing/configuration") is a distinct configuration item from MADCR-008 (beta-mode payment *activation*, a feature-flag/governance decision). To keep the canonical count precise and avoid an artificial merge, **CAIA Gate3.5 is assigned its own canonical ID, MADCR-008B**, immediately adjacent to MADCR-008 in the register (both Category C, both Commercial-domain configuration, genuinely two different parameters). This is noted explicitly here rather than silently folded, per the "no silent correction" principle carried over from the prior validation cycle.

**Final canonical count: MADCR-001 through MADCR-063, plus MADCR-008B = 64 total canonical rows.** The earlier `63` statement in the v1.0 executive header was a documentation inconsistency; v1.1 canonicalizes the document to the verified total of **64**.

**Duplicate count:** 82 raw mentions − 64 canonical (net of the MADCR-008B split, which added one item back from what would have been an under-count) = **18 raw mentions folded as duplicates/children** (H classification) into a canonical row they do not have their own register row for.

---

# 6. MASTER ARCHITECTURE DECISION CANDIDATE REGISTER

Columns: ID | Canonical Decision Question | Source | Source Type | Domain | Scope | Classification | Status | ADR Required | Blocking | Depends On | Blocks | Business Impact | Technical Impact | Data Impact | API Impact | Security Impact | Migration Impact | Reversibility | Owner | Required Artifact | Evidence | Notes

## 6.1 Commercial / Monetization / Payment Cluster (14)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-001 | What is the authoritative boundary/relationship between Subscription state, Entitlement state, and RBAC authorization? | ADR-MON-001, CAIA-ADR-011 | AEP+CAIA | Commercial | Cross-domain | A | OPEN | ADR RECOMMENDED | Non-blocking (principle already stated; realization pending) | MADCR-013 (context only; non-blocking) | M14 ERD | H | H | H | M | H | N | Hard to reverse | Architecture Review Board | ADR | SRC-01 §18, SRC-06 §28 | Dup of CAIA-ADR-011 |
| MADCR-002 | What adapter/integration architecture should Payment Gateway providers use? | ADR-MON-004, CAIA-ADR-012(partial) | AEP+CAIA | Commercial/Payment | Cross-module | A | OPEN | ADR RECOMMENDED | Blocking M16/Payment ERD | MADCR-011 | Payment ERD/API | M | H | M | H | M | N | Moderately reversible | Architecture Review Board | ADR | SRC-01 §18 | — |
| MADCR-003 | What verification/idempotency architecture is required for payment fulfillment? | ADR-MON-005, CAIA-ADR-012(partial) | AEP+CAIA | Commercial/Payment | Cross-module | A | OPEN | ADR RECOMMENDED | Blocking Payment implementation | MADCR-002 | Payment implementation | M | H | M | M | H | N | Hard to reverse | Architecture Review Board | ADR | SRC-01 §18 | — |
| MADCR-004 | How should price/promotion terms be snapshotted at purchase time? | ADR-MON-006 | AEP | Commercial | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | — | Order/Purchase ERD | M | M | H | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-01 §18 | — |
| MADCR-005 | What reconciliation architecture is required between payment/order/subscription/entitlement records? | ADR-MON-007, CAIA-ADR-013 | AEP+CAIA | Commercial | Cross-module | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-001, MADCR-003 | Commercial audit/ops tooling | M | H | H | M | M | N | Moderately reversible | Architecture Review Board | ADR | SRC-01 §18, SRC-06 §28 | — |
| MADCR-006 | How should permanent-vs-promotional add-on validity be technically represented (business rule already locked)? | ADR-MON-003 | AEP | Commercial | Local | A | OPEN | ADR POSSIBLE | Non-blocking | — | M14 ERD | L | M | M | L | N | N | Moderately reversible | Architecture Review Board | ADR | SRC-01 §18; AEP-MON-002 §4 (business rule locked) | Business direction already locked; only data model open |
| MADCR-007 | How should the one-time Free Bonus grant be technically modeled/persisted (business rule already locked)? | ADR-MON-002 | AEP | Commercial | Local | A | OPEN | ADR POSSIBLE | Non-blocking | — | M14 ERD | L | M | M | L | N | N | Moderately reversible | Architecture Review Board | ADR | SRC-01 §18; AEP-MON-002 §7 | Business rule locked; only persistence mechanism open |
| MADCR-008 | Should payment infrastructure activation (beta→live) be a governed feature-flag/configuration decision? | ADR-MON-008 | AEP | Commercial | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | — | — | L | L | L | N | L | N | Easily reversible | Technical Team | Configuration | SRC-01 §18 | — |
| MADCR-008B | What Commercial pricing/plan/promo parameters must be configurable at launch? | CAIA Gate3.5 | CAIA | Commercial | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | Easily reversible | Business Owner (values) / Technical Team (mechanism) | Configuration | SRC-06 §29 Gate3.5 | Explicitly out-of-scope-for-invention per every source AEP |
| MADCR-009 | How should Agency/Organization quota allocation be technically modeled separately from actual usage (business rule largely locked)? | ADR-MON-009 | AEP | Commercial/Organization | Cross-domain | A | OPEN, BLOCKED | ADR RECOMMENDED | **BLOCKING** — cannot finalize until MADCR-010 resolves | MADCR-010 | M14/M12 ERD | M | H | H | M | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-01 §18 | — |
| MADCR-010 | **[OPEN-Q1]** What is the authoritative relationship between Commercial Entitlement and the existing Organization Quota model — is Entitlement the source of quota capacity, or is the existing Organization quota model itself the entitlement representation? | Gate v1.3 §4.1, CAIA Gate1.5 | Governance Gate + CAIA | Commercial/Organization | Cross-domain | A | OPEN | ADR REQUIRED | **BLOCKING** — M14 ERD, ADR-MON-009, Commercial admin permissions | — | MADCR-002,009,055; M14 ERD | H | H | C | H | M | N | Irreversible (defines core Commercial data model) | Architecture Review Board | ADR | SRC-07 §4.1, SRC-06 §29 Gate1.5 | Explicitly OPEN per source-of-truth; not resolved by this or any prior document |
| MADCR-011 | **[OPEN-Q2]** Should Payment be modeled as a subdomain of Commercial (M14), or as a separate logical module (M16)? | Gate v1.3 §4.2, CAIA Gate1.6 | Governance Gate + CAIA | Commercial/Payment | Platform | A | OPEN | ADR REQUIRED | **BLOCKING** — Payment ERD/API, MADCR-002/003 | — | MADCR-002,003; Payment ERD | M | H | H | H | M | N | Hard to reverse | Architecture Review Board | ADR | SRC-07 §4.2, SRC-06 §29 Gate1.6 | Explicitly OPEN |
| MADCR-012 | **[OPEN-C01]** What is the scope relationship between AEP-MON-001 (broad) and AEP-MON-002 (narrow) — merge, subset, or independently scoped? | MAEP-VAL-001 §7 (discovered during validation) | Discovered/Governance | Commercial | Governance | F | OPEN | ADR NOT REQUIRED (governance clarification, not architecture) | Blocking clean ADR-MON drafting | — | MADCR-001–011 drafting quality | L | L | N | N | N | N | Easily reversible | Business Owner (intent) → Document Custodian (label) | Governance Record | SRC-14, SRC-15 | — |
| MADCR-013 | **[OD-11]** What should the overall RUMAHAGEN platform monetization business model be? | `decision-log-FINAL.md`, `project-manifest-v1.28` §7 | Repo-native Open Decision | Commercial | Platform | B | OPEN | ADR NOT REQUIRED (business decision; ADR follows once decided) | Non-blocking (repo notes: "tidak memblokir selama configurable") | — | MADCR-001–011 (this is their PARENT business question) | C | M | L | L | N | N | Hard to reverse | Business Owner | Business Rule / Decision Log entry | SRC-08, SRC-09 line 278 | **Critical cross-reference: this repo-native OD-11 is the root business question that the entire new-wave Commercial/Monetization AEP cluster (MADCR-001–011) is a detailed architectural proposal to answer.** |

## 6.2 Learning Economy Cluster (8)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-014 | Should Learning Points be modeled as a transaction-based ledger domain (vs a single balance field)? | ADR-LE-001, CAIA-ADR-002, CAIA-ADR-003(partial) | AEP+CAIA | Learning Economy | Local (M04-extend) | A | OPEN | ADR RECOMMENDED | Non-blocking | — | M04-extend ERD | M | H | C | M | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-03 §25, SRC-06 §28 | — |
| MADCR-015 | Should earned and purchased Learning Points retain independently trackable provenance within the ledger? | ADR-LE-002, CAIA-ADR-003(partial) | AEP+CAIA | Learning Economy | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-014 | M04-extend ERD | L | M | H | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-03 §25 | Child of MADCR-014 |
| MADCR-016 | What idempotency mechanism is required for Learning Point purchase allocation? | ADR-LE-007 | AEP | Learning Economy | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-014, MADCR-003 (parallel pattern) | M04-extend API | L | M | M | M | M | N | Moderately reversible | Architecture Review Board | ADR | SRC-03 §25 | Parallels Payment idempotency pattern (MADCR-003), different domain |
| MADCR-017 | What Learning Economy parameters should be governed configuration vs hard-coded? | ADR-LE-008 | AEP | Learning Economy | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | — | — | L | L | L | N | N | N | Easily reversible | Technical Team | Configuration | SRC-03 §25 | — |
| MADCR-018 | (Principle, already locked) Purchased Learning Points accelerate progression but cannot bypass competency assessment | ADR-LE-003 | AEP | Learning Economy | Local | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | N/A | — | No artifact (already governing business logic) | LE-004, LE Master Invariant #3–4 | Locked at principle level per source |
| MADCR-019 | (Principle, already locked) Internal Learning and Partnership Learning use different economic models | ADR-LE-004 | AEP | Learning Economy | Local | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | N/A | — | No artifact | Learning Economy AEP §2.2 (locked) | — |
| MADCR-020 | (Principle, already locked) Learning Economy does not directly own Payment Gateway logic | ADR-LE-005 | AEP | Learning Economy/Commercial | Cross-domain | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | L | L | N | N | L | N | N/A | — | No artifact | Gate v1.3 §6.2 (PASS) | Distinct from LS-077 (Learning Session≠Payment owner) — same theme, different sub-domain |
| MADCR-021 | (Principle, already locked) Skill and Credential are distinct from Learning Completion | ADR-LE-006 | AEP | Learning Economy/Title | Cross-domain | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | N/A | — | No artifact | LE §10, consistent w/ Title boundary | Overlaps conceptually with Title cluster but stated independently in LE source |

## 6.3 Learning Session Cluster (14)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-022 | Where should Learning Session sit — inside the Learning Domain, merged into Calendar/Event, or as an independent domain? | ADR-LS-001, CAIA-ADR-004, CAIA Gate1.4 | AEP+CAIA | Learning | Cross-module | G | **ALREADY DECIDED IN PRACTICE** (consistently applied, zero contradiction, across every source document) | ADR RECOMMENDED (formalize only) | Non-blocking | — | — | M | M | M | L | N | N | Hard to reverse (if changed later) | Architecture Review Board (formalize as numbered ADR) | Governance Record → ADR | SRC-04 §2.1, SRC-06 §28/29 Gate1.4, verified clean in MAEP §12.3 | Direction is settled; only needs formal ADR numbering to close the loop with repo's own ADR register |
| MADCR-023 | What Provider Adapter architecture should Learning Session use (incl. event normalization/idempotency, provider-agnostic core)? | ADR-LS-002, ADR-LS-009, ADR-LS-012, CAIA-ADR-005 | AEP+CAIA | Learning Session | Local (M04-extend) | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-022 | M04-extend ERD/API | M | H | M | H | M | N | Hard to reverse | Architecture Review Board | ADR | SRC-04 §20 | Parallels Payment Adapter pattern (MADCR-002), different domain |
| MADCR-024 | (Principle, low controversy) RUMAHAGEN remains System of Record for Learning Session data | ADR-LS-003 | AEP | Learning Session | Local | B | OPEN (uncontested) | ADR NOT REQUIRED | Non-blocking | — | — | L | M | M | L | L | N | Moderately reversible | Architecture Review Board (confirm only) | No ADR needed; confirm in Technical Spec | SRC-04 §20/§8 | — |
| MADCR-025 | (Data-model note) Should Session Type and Provider be modeled as separate taxonomy dimensions? | ADR-LS-004 | AEP | Learning Session | Local | B | OPEN (uncontested) | ADR NOT REQUIRED | Non-blocking | MADCR-023 | M04-extend ERD | L | L | M | L | N | N | Easily reversible | Technical Team | Technical Specification | SRC-04 §20/§6 | — |
| MADCR-026 | Does Daily have the capability/OAuth/quota/pricing to serve as a native interactive provider? | ADR-LS-005, CAIA Gate3.1(partial) | AEP+CAIA | Learning Session | Local | E | OPEN | ADR NOT REQUIRED (pending verification) | Non-blocking | — | MADCR-023 finalization | L | M | N | M | L | N | N/A | Technical Team | Research Task | SRC-04 §5, §"Rules Not Yet Final" | — |
| MADCR-027 | Do Zoom/Google Meet have the capability/OAuth/quota/pricing to serve as embedded interactive providers? | ADR-LS-006, CAIA Gate3.1(partial) | AEP+CAIA | Learning Session | Local | E | OPEN | ADR NOT REQUIRED | Non-blocking | — | MADCR-023 finalization | L | M | N | M | L | N | N/A | Technical Team | Research Task | SRC-04 §5 | — |
| MADCR-028 | Does YouTube Live have the capability to serve as the broadcast provider? | ADR-LS-007, CAIA Gate3.1(partial) | AEP+CAIA | Learning Session | Local | E | OPEN | ADR NOT REQUIRED | Non-blocking | — | MADCR-023 finalization | L | L | N | M | L | N | N/A | Technical Team | Research Task | SRC-04 §5 | — |
| MADCR-029 | (Principle, inherits existing security architecture) Provider credentials/secrets remain server-side only | ADR-LS-008 | AEP | Learning Session/Security | Local | G | ALREADY DECIDED (inherits existing security boundary) | ADR NOT REQUIRED | Non-blocking | — | — | L | L | N | L | M | N | N/A | — | No artifact — confirm alignment with existing security architecture only | SRC-04 §13; existing Authorization Spec | — |
| MADCR-030 | (Principle, already stated) Attendance is evidence for Learning Activity completion, not direct Learning Point issuance | ADR-LS-010, CAIA-ADR-006 | AEP+CAIA | Learning Session/Economy | Cross-domain | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | N/A | — | No artifact | SRC-04 §9–10, Master Invariants #8–9 | — |
| MADCR-031 | (Principle, already stated) Provider failure does not destroy Learning history | ADR-LS-011 | AEP | Learning Session | Local | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | L | L | L | N | N | N | N/A | — | No artifact | SRC-04 §16, Master Invariant #17 | — |
| MADCR-032 | (Data-model note) Recording is an optional Learning artifact/reference | ADR-LS-013 | AEP | Learning Session | Local | B | OPEN (uncontested) | ADR NOT REQUIRED | Non-blocking | MADCR-023 | M04-extend ERD | L | L | M | L | N | N | Easily reversible | Technical Team | Technical Specification | SRC-04 §14/§20 | — |
| MADCR-033 | (Principle, already stated, consistent w/ M13) Learning Session is AI-ready but AI-independent | ADR-LS-014 | AEP | Learning Session/AI | Cross-domain | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | L | L | N | N | L | N | N/A | — | No artifact | SRC-04 §18, LS-074/075; verified clean in MAEP §17 | Fully consistent with existing M13 BYOK boundary |
| MADCR-034 | What is the exact attendance formula, minimum percentage, late-join/grace-period policy? | CAIA Gate3.2 | CAIA | Learning Session | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | MADCR-023 | Attendance implementation | M | L | L | N | N | N | Easily reversible | Product Owner / Technical Team | Configuration | SRC-06 §29 Gate3.2; SRC-04 "Rules Not Yet Final" §1–5 | — |
| MADCR-035 | What is the recording retention duration and privacy policy? | CAIA Gate3.3 | CAIA | Learning Session | Local | B | OPEN | ADR NOT REQUIRED (policy decision, not architecture) | Non-blocking | MADCR-032 | Recording implementation | M | L | L | N | H | N | Moderately reversible | Business Owner (policy) / Security Owner (privacy) | Governance Record / Configuration | SRC-06 §29 Gate3.3; SRC-04 "Rules Not Yet Final" §11–13 | Privacy dimension has Security impact = H |

## 6.4 Title Cluster (13)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-036 | Should Title Definition be modeled as a separate object from an earned Award Instance? | Title ADR Candidate 1, CAIA-ADR-007 | AEP+CAIA | Title | Local (M15) | A | OPEN | ADR REQUIRED | **BLOCKING** — foundational for all other Title ADRs | — | MADCR-037–043 | H | H | C | M | L | N | Irreversible | Architecture Review Board | ADR | SRC-05 §27, SRC-06 §28 | Foundational — recommended to decide first among Title cluster |
| MADCR-037 | Should Awarding Paths be modeled as versioned qualification routes? | Title ADR Candidate 2, CAIA-ADR-008 | AEP+CAIA | Title | Local | A | OPEN | ADR REQUIRED | Blocking Awarding Engine design | MADCR-036 | Title ERD/API | M | H | H | M | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-05 §27 | — |
| MADCR-038 | How should Award Provenance (primary + additional qualifying paths) be persisted? | Title ADR Candidate 3 | AEP | Title | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-036, MADCR-037 | Title ERD | M | M | H | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-05 §27 | — |
| MADCR-039 | Should Award Lifecycle (Active/Expired/Revoked) be modeled separately from Prerequisite Lifecycle? | Title ADR Candidate 4, CAIA-ADR-009 | AEP+CAIA | Title | Local | A | OPEN | ADR REQUIRED | Blocking Title lifecycle/appeal design | MADCR-036 | Title ERD/API | H | H | H | M | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-05 §27, SRC-06 §28 | — |
| MADCR-040 | Should Presentation State (Primary/Featured) be modeled separately from Award State? | Title ADR Candidate 5 | AEP | Title | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-036 | Title UI/API | M | M | M | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-05 §27 | — |
| MADCR-041 | How should Awarding Rule versioning work without creating a new Title identity on rename? | Title ADR Candidate 6 | AEP | Title | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-037 | Title ERD | L | M | M | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-05 §27 | Related to MADCR-037 but distinct sub-question (identity-preservation on rename) |
| MADCR-042 | How should Revocation and Appeal be modeled as explicit lifecycle processes? | Title ADR Candidate 7 | AEP | Title | Local | A | OPEN | ADR REQUIRED | Blocking Title appeal/dispute implementation | MADCR-039 | Title ERD/API/RBAC | H | H | M | M | M | N | Hard to reverse | Architecture Review Board | ADR | SRC-05 §27 | — |
| MADCR-043 | Should the system support multiple Award Instances per Title? | Title ADR Candidate 8 | AEP | Title | Local | A | OPEN | ADR RECOMMENDED | Non-blocking | MADCR-036, MADCR-038 | Title ERD | M | M | M | L | L | N | Moderately reversible | Architecture Review Board | ADR | SRC-05 §27 | — |
| MADCR-044 | What Title policies should be governed configuration vs hard-coded? | Title ADR Candidate 9 | AEP | Title | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | — | — | L | L | L | N | N | N | Easily reversible | Technical Team | Configuration | SRC-05 §27 | — |
| MADCR-045 | (Principle, already locked invariant) Historical Award integrity must be preserved | Title ADR Candidate 10 | AEP | Title | Local | B | ALREADY DECIDED | ADR NOT REQUIRED | Non-blocking | — | — | M | L | L | N | N | N | N/A | — | No artifact | Gate v1.3 §8 (Historical Integrity Gate, PASS) | — |
| MADCR-046 | Where is the boundary between the existing `certificates` table (M04) and the new Title/Award Instance model (M15) — are they ever the same record? | CAIA-ADR-010, CAIA Gate1.3 | CAIA | Title/Learning | Cross-module | A | OPEN | ADR REQUIRED | **BLOCKING** — Title ERD cannot finalize without this | — | MADCR-036, Title ERD | H | H | H | M | L | N | Irreversible (data model) | Architecture Review Board | ADR | SRC-06 §23, §28 Gate1.3 | CAIA explicitly warns `certificates` must NOT auto-become Title Award Instance |
| MADCR-047 | What are the exact per-Title awarding configurations (thresholds, evidence requirements, etc.)? | CAIA Gate3.6 | CAIA | Title | Local | C | OPEN | ADR NOT REQUIRED | Non-blocking | MADCR-036–044 | Title implementation | M | L | L | N | N | N | Easily reversible | Product Owner | Configuration | SRC-06 §29 Gate3.6 | — |
| MADCR-048 | How should the already-locked Title authority/scope model (RumahAgen/Partner/Agency-Organization) be realized in the RBAC permission taxonomy? | CAIA Gate2.2 | CAIA | Title/Security | Cross-domain | A | OPEN, BLOCKED | ADR RECOMMENDED | Blocking Title RBAC/API | MADCR-053 (Gate 2 sequencing), MADCR-036 | Title RBAC | M | H | M | H | H | N | Hard to reverse | Architecture Review Board | ADR | SRC-06 §29 Gate2.2; Title Rules 002/025/071–074 (business principle already locked) | Business principle locked; RBAC mapping is the open piece |

## 6.5 Cross-Domain Cluster (9)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-049 | What is the boundary between the new Learning Activity concept (Learning Economy/Session) and the existing Course/Lesson model (M04)? | CAIA Gate1.2 | CAIA | Learning | Local (M04) | A | OPEN | ADR REQUIRED | Blocking Learning Economy/Session ERD | — | MADCR-014, MADCR-023 | M | H | H | M | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-06 §29 Gate1.2 | Genuinely new — no domain-specific AEP explicitly frames it this way |
| MADCR-050 | Should all 4 new-wave domains share one historical-provenance/configuration-snapshot pattern, or design independently? | CAIA-ADR-014 | CAIA | Cross-domain | Platform | A | OPEN | ADR RECOMMENDED | Non-blocking (each domain can proceed with local pattern meanwhile) | — | MADCR-004, 015, 038, 041 (each domain's own snapshot/provenance decision) | M | H | M | L | L | N | Hard to reverse | Architecture Review Board | ADR | SRC-06 §28 | Cross-cutting; could reduce duplicated design effort if decided early |
| MADCR-051 | Should a shared cross-domain event contract strategy be established for the 4 new-wave domains? | CAIA-ADR-015 | CAIA | Cross-domain | Platform | A | OPEN | ADR RECOMMENDED | Non-blocking | — | MADCR-052 | M | H | L | H | M | N | Hard to reverse | Architecture Review Board | ADR | SRC-06 §28 | — |
| MADCR-052 | What are the final concrete event contract schemas for each new-wave domain event? | CAIA Gate3.8 | CAIA | Cross-domain | Platform | D | OPEN | ADR NOT REQUIRED (technical spec, child of MADCR-051) | Blocking implementation only, not ERD | MADCR-051 | Implementation | L | M | L | M | L | N | Easily reversible | Technical Team | Technical Specification | SRC-06 §29 Gate3.8 | — |
| MADCR-053 | What new cross-domain permission taxonomy is needed to cover Learning Session, Commercial, Title actions? | CAIA Gate2.1 | CAIA | Security | Platform | A | OPEN, BLOCKED | ADR REQUIRED | Blocking all new-wave RBAC/API | MADCR-010, MADCR-011, MADCR-036, MADCR-022 (Gate 1 items must close first per CAIA sequencing) | MADCR-054–057 | M | H | L | H | H | N | Hard to reverse | Architecture Review Board | ADR | SRC-06 §29 Gate2.1 | CAIA explicitly sequences Gate 2 after Gate 1 |
| MADCR-054 | What authorization model governs Learning Session host/instructor actions? | CAIA Gate2.3 | CAIA | Learning Session/Security | Local | A | OPEN, BLOCKED | ADR RECOMMENDED | Blocked by MADCR-053 | MADCR-022, MADCR-053 | Learning Session RBAC | M | M | L | M | M | N | Moderately reversible | Architecture Review Board | ADR | SRC-06 §29 Gate2.3 | — |
| MADCR-055 | What administration permissions govern Commercial operations? | CAIA Gate2.4 | CAIA | Commercial/Security | Local | A | OPEN, BLOCKED | ADR RECOMMENDED | Blocked by MADCR-010/011/053 | MADCR-010, MADCR-011, MADCR-053 | Commercial RBAC | M | M | L | M | H | N | Moderately reversible | Architecture Review Board | ADR | SRC-06 §29 Gate2.4 | — |
| MADCR-056 | What permissions govern manual Learning Point adjustments? | CAIA Gate2.5 | CAIA | Learning Economy/Security | Local | A | OPEN, BLOCKED | ADR RECOMMENDED | Blocked by MADCR-014, MADCR-053 | MADCR-014, MADCR-053 | Learning Economy RBAC | L | L | L | L | M | N | Easily reversible | Architecture Review Board | ADR | SRC-06 §29 Gate2.5 | Small scope; Category A only because it is a security/RBAC boundary decision per definition |
| MADCR-057 | What permissions govern Title award issuance, revocation, and appeal actions? | CAIA Gate2.6 | CAIA | Title/Security | Local | A | OPEN, BLOCKED | ADR RECOMMENDED | Blocked by MADCR-036/039/042/053 | MADCR-036, MADCR-039, MADCR-042, MADCR-053 | Title RBAC | M | M | L | M | H | N | Moderately reversible | Architecture Review Board | ADR | SRC-06 §29 Gate2.6 | — |

## 6.6 Verification & Existing-Baseline Governance Cluster (4)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-058 | Which payment gateway provider (vendor) should RUMAHAGEN integrate with? | CAIA Gate3.4 | CAIA | Commercial/Payment | Local | E | OPEN | ADR NOT REQUIRED (research/vendor-evaluation task; ADR follows for the adapter pattern, already MADCR-002) | Non-blocking | — | Payment implementation | M | M | N | M | M | N | N/A | Technical Team / Business Owner (contract) | Research Task | SRC-06 §29 Gate3.4 | — |
| MADCR-059 | Which of the two migration file variants (original vs `-FIXED`) should be canonical before Sprint S0? | CAIA Gate3.7 | CAIA / repo `CURRENT-PROJECT-STATE-rev10` | Infrastructure | Platform | F | OPEN | ADR NOT REQUIRED (governance/process decision, answer is evident: use `-FIXED`) | **BLOCKING Sprint S0** (existing baseline; independent of all new-wave items above) | — | Sprint S0 execution | L | L | N | N | H | H | Easily reversible (rename operation) | Technical Team | Governance Record (rename/archive action) | SRC-09, `CURRENT-PROJECT-STATE-rev10` baris 16–18 | Answer is not architecturally ambiguous — `-FIXED` files already contain the audited-correct RLS policies; this is an execution task, not a genuine open question |
| MADCR-060 | **[OD-12]** What should the final DBR (Debt-to-Burden-Ratio) threshold be, and what is the Manager promotion/demotion policy? | `decision-log-FINAL.md`, `project-manifest-v1.28` §7 | Repo-native Open Decision | M07 DBR / RBAC | Local | B | OPEN | ADR NOT REQUIRED | Non-blocking (repo notes: "dapat ditunda hingga Sprint S14") | — | — | M | L | L | N | L | N | Easily reversible | Business Owner | Business Rule / Configuration | SRC-08, SRC-09 line 279 | Unrelated to any new-wave domain |
| MADCR-061 | **[OD-09]** Are Resend and Sentry integration details fully synchronized into System Architecture §23? | `project-manifest-v1.28` §7 | Repo-native, Partial | Infrastructure | Local | J | PARTIAL (documentation verification, not a decision) | ADR NOT REQUIRED | Non-blocking | — | — | N | L | N | N | N | N | N/A | Document Custodian | Documentation verification | SRC-09 line 277, 309 | Listed for completeness; genuinely "Not a Decision" per Category J definition |

## 6.7 Missing-Source Meta-Items (2)

| ID | Canonical Decision Question | Source | Type | Domain | Scope | Class | Status | ADR? | Blocking | Depends On | Blocks | Biz | Tech | Data | API | Sec | Mig | Reversibility | Owner | Artifact | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MADCR-062 | Does a primary source document for `MBR-COM-001–013` exist, and if so, what does it actually decide? | Cited by SRC-01/upload Commercial Reconciliation, Master BR v1.2 | Meta (missing-evidence) | Commercial | Governance | K | UNKNOWN | N/A — not an architecture decision itself | Non-blocking, but affects confidence in MADCR-001/006/007 "already covered" claims | — | Validity of EXIST-09 | N | N | N | N | N | N | N/A | Document Custodian | Source Recovery | MAEP-VAL-001 §7 (F-05 lineage), C-03 | Do not reconstruct content from assumption per Master Prompt §19 |
| MADCR-063 | Does a primary source document for `MBR-LS-001–015` exist, and if so, what does it actually decide? | Cited by Master BR v1.2 §3 | Meta (missing-evidence) | Learning Session | Governance | K | UNKNOWN | N/A | Non-blocking, but affects confidence in EXIST-10 | — | Validity of EXIST-10 | N | N | N | N | N | N | N/A | Document Custodian | Source Recovery | MAEP-VAL-001 §7, C-04 | Same caveat as MADCR-062 |

---

# 7. ADR-READY CANDIDATE LIST

Definition applied: Classification = A, Status = OPEN (not blocked), ADR? = REQUIRED or RECOMMENDED or POSSIBLE. This maps to the Master Prompt's "READY FOR ADR" status label. **25 candidates qualify**, ordered per §37 priority (1. Blocking, 2. Cross-domain impact, 3. Security/data impact, 4. Dependency, 5. Business criticality):

| Rank | ID | Decision Question (short) | ADR? | Cross-domain? | Data/Sec Impact | Depends On |
|---|---|---|---|---|---|---|
| 1 | MADCR-036 | Title Definition vs Award Instance | REQUIRED | No (local, but foundational for 6 others) | Data=C | — |
| 2 | MADCR-046 | `certificates`(M04) vs Title(M15) boundary | REQUIRED | Yes | Data=H | — |
| 3 | MADCR-039 | Award Lifecycle vs Prerequisite Lifecycle | REQUIRED | No | Data=H, Sec=L | MADCR-036 |
| 4 | MADCR-042 | Revocation/Appeal as lifecycle | REQUIRED | No | Sec=M | MADCR-039 |
| 5 | MADCR-037 | Versioned Awarding Paths | REQUIRED | No | Data=H | MADCR-036 |
| 6 | MADCR-049 | Learning Activity vs Course boundary | REQUIRED | Yes | Data=H | — |
| 7 | MADCR-001 | Subscription vs Entitlement vs RBAC | RECOMMENDED | Yes | Data=H, Sec=H | MADCR-013 |
| 8 | MADCR-005 | Commercial reconciliation architecture | RECOMMENDED | No | Data=H | MADCR-001, 003 |
| 9 | MADCR-050 | Cross-domain provenance/snapshot pattern | RECOMMENDED | Yes | Data=M | — |
| 10 | MADCR-051 | Cross-domain event contract strategy | RECOMMENDED | Yes | API=H | — |
| 11 | MADCR-002 | Payment Gateway adapter architecture | RECOMMENDED | No | API=H | MADCR-011(non-blocking dep, see note) |
| 12 | MADCR-003 | Payment verification/idempotency | RECOMMENDED | No | Sec=H | MADCR-002 |
| 13 | MADCR-014 | Learning Point ledger domain | RECOMMENDED | No | Data=C | — |
| 14 | MADCR-023 | Learning Session Provider Adapter | RECOMMENDED | No | API=H | MADCR-022(G, non-blocking) |
| 15 | MADCR-038 | Award Provenance persistence | RECOMMENDED | No | Data=H | MADCR-036, 037 |
| 16 | MADCR-040 | Presentation State vs Award State | RECOMMENDED | No | Data=M | MADCR-036 |
| 17 | MADCR-041 | Awarding Rule versioning w/o new identity | RECOMMENDED | No | Data=M | MADCR-037 |
| 18 | MADCR-043 | Multiple Award Instances support | RECOMMENDED | No | Data=M | MADCR-036, 038 |
| 19 | MADCR-015 | Earned/purchased LP provenance | RECOMMENDED | No | Data=H | MADCR-014 |
| 20 | MADCR-016 | Idempotent LP purchase allocation | RECOMMENDED | No | API=M | MADCR-014 |
| 21 | MADCR-004 | Purchase-time price/promo snapshot | RECOMMENDED | No | Data=H | — |
| 22 | MADCR-010 | **[OPEN-Q1]** Entitlement vs Org Quota | REQUIRED | Yes | Data=C | — |
| 23 | MADCR-011 | **[OPEN-Q2]** Payment M14 vs M16 | REQUIRED | Yes | Data=H | — |
| 24 | MADCR-006 | Add-on validity technical realization | POSSIBLE | No | Data=M | — |
| 25 | MADCR-007 | Free Bonus grant technical realization | POSSIBLE | No | Data=M | — |

**Note on MADCR-010/011 ranking:** although both are individually CRITICAL and BLOCKING for *other* candidates (MADCR-009, 048, 053–057), they are themselves classified "OPEN" (not "OPEN, BLOCKED") because nothing blocks *them* from being decided — they are ready for ADR drafting today and should, if anything, be prioritized earliest in practice despite their rank position here (rank reflects the requested ordering criteria, which favor Title's cluster on raw cross-domain-count + dependency-fan-out; **Architecture Review Board scheduling discretion is a RECOMMENDATION, not a decision, made explicit here**).

**RECOMMENDATION — NOT A DECISION:** given that MADCR-010 and MADCR-011 block 7 other candidates (MADCR-009, 048, 053, 054, 055, 056, 057) plus the entire M14/M16 ERD phase, an Architecture Review Board may wish to sequence them first in practice notwithstanding their table rank. This is offered as a recommendation only; the Board retains full discretion.

---

# 8. NON-ADR DECISION LIST

**39 items** (64 total − 25 non-blocked-A − 7 blocked-A shown separately in §9 = wait, correction: this list holds every non-A-Ready item, i.e. all 64 minus the 25 in §7 = 39, which includes the 7 blocked-A items since they are not yet "ready"):

## Business Rule (14) — already governed, ADR not needed
MADCR-013(OD-11, parent business question), MADCR-018, MADCR-019, MADCR-020, MADCR-021, MADCR-024, MADCR-025, MADCR-030, MADCR-031, MADCR-032, MADCR-033, MADCR-035, MADCR-045, MADCR-060(OD-12)

## Configuration (6)
MADCR-008, MADCR-008B, MADCR-017, MADCR-034, MADCR-044, MADCR-047

## Implementation (1)
MADCR-052

## Verification/Research (4)
MADCR-026, MADCR-027, MADCR-028, MADCR-058

## Governance (2)
MADCR-012(OPEN-C01), MADCR-059(migration canonicalization)

## Already Decided (2)
MADCR-022(Learning Session domain placement — recommend formal ADR-numbering only), MADCR-029(provider credentials server-side)

## Duplicate (0 as separate register rows — 18 raw mentions folded during dedup, see §5; no canonical row is itself a duplicate)

## Superseded (0)

## Not a Decision (1)
MADCR-061(OD-09)

## Unknown (2)
MADCR-062, MADCR-063

## Blocked-A, not yet ADR-ready (7 — held here pending Gate-1 resolution, see §9)
MADCR-009, MADCR-048, MADCR-053, MADCR-054, MADCR-055, MADCR-056, MADCR-057

**Total: 14+6+1+4+2+2+1+2+7 = 39.** (25 ADR-Ready + 39 Non-ADR-Ready = 64 ✓)

---

# 9. BLOCKING DECISIONS

Only decisions with confirmed evidence of blocking downstream architecture artifacts:

| Blocker | Blocked Artifacts | Reason | Evidence |
|---|---|---|---|
| MADCR-010 (OPEN-Q1) | M14 Commercial ERD; MADCR-009, MADCR-048, MADCR-055 | Gate v1.3 explicitly states this must resolve "before ERD"; CAIA lists it as Gate 1 | SRC-07 §4.1, SRC-06 §29 Gate1.5 |
| MADCR-011 (OPEN-Q2) | Payment ERD/API; MADCR-002/003 finalization; MADCR-055 | Gate v1.3 explicitly states this must resolve before ERD | SRC-07 §4.2, SRC-06 §29 Gate1.6 |
| MADCR-053 (new permission taxonomy) | MADCR-054, 055, 056, 057 (all Gate-2 RBAC items) | CAIA explicitly sequences Gate 2 (API/RBAC) after Gate 1 (identity/boundary) closes | SRC-06 §29 |
| MADCR-059 (migration canonicalization) | Sprint S0 execution (existing 13-module baseline) | `-FIXED` files must replace buggy originals before any migration runs live | SRC-09, `CURRENT-PROJECT-STATE-rev10` baris 16–18 |
| MADCR-036 (Title Definition vs Award Instance) | MADCR-037, 038, 040, 041, 043 (5 other Title-cluster candidates) | Foundational — every other Title decision depends on this separation being settled first | SRC-05 §4.2 |

**Note:** MADCR-059 blocks the *existing baseline's* Sprint S0, completely independently of every new-wave item above — confirmed as an independent track (see §10 Parallelizable Work).

---

# 10. PARALLELIZABLE WORK

Work that can proceed today without waiting on any blocking decision above:

| Work item | Type | Evidence | Blocked by anything? |
|---|---|---|---|
| Migration `-FIXED` canonicalization (rename/archive) | Existing-baseline governance task (MADCR-059) | `CURRENT-PROJECT-STATE-rev10` baris 16–18 | No — independent of all 32 new-wave A-items |
| Documentation cleanup (16→17 file count, "production-ready" wording, etc. per prior validation cycle) | Documentation | MAEP-VAL-001 §15 | No |
| Source recovery for `MBR-COM-001–013` / `MBR-LS-001–015` (MADCR-062, 063) | Source recovery | C-03/C-04 | No |
| Provider verification: Daily/LiveKit/Zoom/GMeet/YouTube (MADCR-026–028), payment vendor (MADCR-058) | Verification/Research | SRC-04, SRC-06 Gate3 | No — can run in parallel with any ADR drafting |
| 25 ADR-Ready candidates (§7) | ADR drafting | §7 | No — all confirmed non-blocked |
| OD-11, OD-12 business-model clarification (MADCR-013, 060) | Business decision | SRC-08/09 | No — repo itself notes both are "tidak memblokir selama configurable" |

**Repository's own governance system independently confirms this Track A / Track B separation:** `technology-decisions-v1.6-FINAL.md` §9 explicitly states OD-11/OD-12 "tidak memengaruhi Official Technology Stack" — i.e., the existing-baseline technology decisions do not wait on these business decisions, and vice versa.

---

# 11. DECISION DEPENDENCY GRAPH

Built strictly from the "Depends On" / "Blocks" columns in §6 — no assumed edges.

```text
MADCR-010 (OPEN-Q1) ──┬──> MADCR-009 (quota allocation model)
                       ├──> MADCR-048 (Title authority/scope RBAC)
                       └──> MADCR-055 (Commercial admin permissions)

MADCR-011 (OPEN-Q2) ──┬──> MADCR-002 (Payment adapter) [finalization]
                       ├──> MADCR-003 (Payment verification) [finalization]
                       └──> MADCR-055 (Commercial admin permissions)

MADCR-013 (OD-11, business model) ──> MADCR-001..011 (entire Commercial cluster,
                                       parent business question)

MADCR-036 (Title Definition≠Instance) ──┬──> MADCR-037 (Versioned Awarding Paths)
                                          ├──> MADCR-038 (Provenance)
                                          ├──> MADCR-039 (Lifecycle) ──> MADCR-042 (Revocation/Appeal)
                                          ├──> MADCR-040 (Presentation)
                                          └──> MADCR-043 (Multiple Instances)

MADCR-037 ──> MADCR-041 (versioning w/o new identity)

MADCR-014 (LP ledger) ──┬──> MADCR-015 (provenance)
                         └──> MADCR-016 (idempotent purchase)

MADCR-022 (LS domain placement, G) ──> MADCR-023 (Provider Adapter) ──┬──> MADCR-026/027/028 (provider verification, finalization)
                                                                        └──> MADCR-025, MADCR-032 (taxonomy/recording notes)

MADCR-051 (cross-domain event contracts) ──> MADCR-052 (final event schemas, D)

MADCR-053 (new permission taxonomy) ──┬──> MADCR-054 (LS host/instructor auth)
   [itself blocked by MADCR-010/011/  ├──> MADCR-055 (Commercial admin)
    036/022 per Gate1→Gate2 sequence] ├──> MADCR-056 (LP adjustment)
                                       └──> MADCR-057 (Title issuance/revocation/appeal)

MADCR-059 (migration canonicalization) ──> Sprint S0 (existing baseline; NO edge to any node above)
```

**Standard downstream chain (per every source AEP, unchanged):**

```text
Decision (MADCR candidate)
    ↓
Architecture Review Board Decision
    ↓
ADR (formal)
    ↓
Architecture Baseline update
    ↓
ERD
    ↓
API
    ↓
RBAC
    ↓
Implementation
```

No edge in this graph was inferred without a §6 "Depends On"/"Blocks" citation.

---

# 12. MONETIZATION DECISION CLUSTER

All Commercial/Subscription/Entitlement/Organization-Quota/Promotion/Payment/Payment-Gateway candidates (14 total, MADCR-001–013 + 008B):

| Sub-theme | Candidates | Duplicate? | Dependency | Blocking? | Required Artifact | Open Question (neutral) |
|---|---|---|---|---|---|---|
| Structural boundary | MADCR-001 | Dup of CAIA-ADR-011 | MADCR-013 (context only; non-blocking) | No | ADR | What is the boundary between Subscription, Entitlement, and RBAC? |
| Payment integration | MADCR-002, 003 | MADCR-002 dup CAIA-ADR-012(partial); MADCR-003 dup CAIA-ADR-012(partial) | MADCR-011 | MADCR-002/003 finalization depends on MADCR-011 | ADR ×2 | What adapter/verification architecture for Payment Gateway? |
| Purchase mechanics | MADCR-004 | No | — | No | ADR | How is price/promo snapshotted? |
| Reconciliation | MADCR-005 | Dup of CAIA-ADR-013 | MADCR-001, 003 | No | ADR | What reconciliation architecture? |
| Add-on/Bonus realization | MADCR-006, 007 | No | — | No | ADR ×2 | How are already-locked add-on/bonus rules technically persisted? |
| Configuration | MADCR-008, 008B | No | — | No | Configuration ×2 | Beta activation flag; pricing/plan parameters |
| Quota | MADCR-009 | No | MADCR-010 | **Yes, blocked by MADCR-010** | ADR | How is quota allocation modeled separately from usage? |
| **OPEN-Q1** | MADCR-010 | No | — | **Yes, blocks 3 others** | ADR | Entitlement vs Organization Quota authority |
| **OPEN-Q2** | MADCR-011 | No | — | **Yes, blocks 3 others** | ADR | Payment M14 vs M16 |
| **OPEN-C01** | MADCR-012 | No | — | Blocks clean ADR-MON drafting | Governance Record | AEP-MON-001 vs AEP-MON-002 relationship |
| **Root business question** | MADCR-013 (OD-11) | No — repo-native, PARENT of all above | — | No (repo notes non-blocking) | Business Rule | What should RUMAHAGEN's monetization business model be? |

**No business decision is taken here.** OPEN-Q1, OPEN-Q2, and OD-11 remain exactly as open as found in the source repository/governance documents.

---

# 13. LEARNING DECISION CLUSTER

Separated per Master Prompt §43 requirement — Learning Economy, Learning Session, existing Learning (M04 Course/Lesson), Calendar/Event kept distinct, **no domain leakage**:

| Sub-domain | Candidates | Notes |
|---|---|---|
| **Learning Economy** (Learning Point ledger) | MADCR-014, 015, 016, 017, 018, 019, 020, 021 (8) | All extend M04; none touch Calendar/Event or Learning Session directly except via MADCR-020's cross-reference to Commercial |
| **Learning Session** (live learning) | MADCR-022–035 (14) | All extend M04, per MADCR-022 (Learning Domain placement, already-decided-in-practice). None merge into Calendar/Event (M05) — M05 remains the discovery/scheduling layer per CAIA §24, unchanged by this cluster |
| **Learning Activity vs Course boundary** | MADCR-049 | Cross-cutting between Learning Economy/Session and existing M04 Course/Lesson model — the one item that touches "existing Learning" directly |
| **Existing Learning (M04 Course/Lesson/Quiz/Enrollment/Certificate)** | No open candidate found | Confirmed FINAL/unchanged baseline; only its *boundary* with new-wave items (MADCR-049, MADCR-046) is open, not the existing model itself |
| **Calendar/Event (M05)** | No open candidate found | Confirmed retained as discovery/schedule layer only, per CAIA §24 (already stated, not reopened here) |
| **Title cross-reference** | MADCR-021 (Skill/Credential≠Completion), MADCR-030 (Attendance≠direct points) | Listed here because their source is Learning-domain AEPs, but they touch the Title boundary — cross-referenced in §14, not duplicated as separate rows |

**Domain leakage check: PASS.** No Learning Economy candidate was found redefining Learning Session scope, and no Learning Session candidate was found redefining Learning Economy's point-ledger ownership.

---

# 14. TITLE DECISION CLUSTER

Separated per Master Prompt §44 — lifecycle, eligibility, appeal, configuration, architecture, governance kept distinct; **no business policy elevated to ADR merely because it is complex**:

| Sub-theme | Candidates | Classification | Notes |
|---|---|---|---|
| **Core architecture** (Definition/Instance/Path/Provenance separation) | MADCR-036, 037, 038, 043 | A | Foundational structural decisions |
| **Lifecycle** (Award vs Prerequisite; Revocation/Appeal) | MADCR-039, 042 | A | Genuine architecture boundary — state-machine design |
| **Presentation** (Primary/Featured vs Award state) | MADCR-040 | A | Genuine architecture boundary |
| **Versioning** (Awarding Rule version w/o new identity) | MADCR-041 | A | Genuine architecture decision |
| **M04↔M15 boundary** | MADCR-046 | A, CRITICAL | Genuinely cross-module |
| **Configuration** (governed policy, exact awarding params) | MADCR-044, 047 | C | Correctly kept OUT of ADR — these are business/product parameters, not architecture boundaries, even though the underlying Title system is complex |
| **Eligibility/business policy already locked** (historical integrity) | MADCR-045 | B | Already an invariant per Gate v1.3 §8; not elevated to ADR |
| **Authority/scope (RBAC realization)** | MADCR-048, 057 | A | Business principle (hybrid RumahAgen/Partner/Agency-Organization authority) already locked in Title Rules 002/025/071–074; only the RBAC *permission-taxonomy realization* is the open architecture piece — correctly NOT re-opening the already-decided business policy itself |

**Check against Master Prompt §44 instruction ("jangan mengubah business policy menjadi ADR hanya karena policy tersebut kompleks"):** confirmed — MADCR-044, 045, 047 (the most policy-heavy, most complex items in the Title cluster) are correctly classified C/B, not A, despite Title being the most rule-dense new-wave domain (100 source rules).

---

# 15. SECURITY DECISION CLUSTER

Candidates affecting authentication, authorization, RBAC, RLS, tenant/organization isolation, data ownership, audit, AI access:

| Candidate | Security dimension | Classification | Blocking? |
|---|---|---|---|
| MADCR-001 | Subscription≠Entitlement≠RBAC boundary | A | No (but Sec impact = H) |
| MADCR-003 | Payment verification/idempotency | A | No (Sec impact = H) |
| MADCR-029 | Provider credentials server-side | G — inherits existing security architecture | No |
| MADCR-035 | Recording privacy policy | B (policy, not architecture) | No |
| MADCR-048 | Title authority/scope → RBAC realization | A | Yes, blocked by MADCR-053 |
| MADCR-053 | New cross-domain permission taxonomy | A | **Yes — blocks 054/055/056/057** |
| MADCR-054 | Learning Session host/instructor authorization | A | Blocked by MADCR-053 |
| MADCR-055 | Commercial administration permissions | A | Blocked by MADCR-010/011/053 |
| MADCR-056 | Learning Point adjustment permissions | A | Blocked by MADCR-053 |
| MADCR-057 | Title issuance/revocation/appeal permissions | A | Blocked by MADCR-036/039/042/053 |
| MADCR-060 (OD-12) | Manager promotion/demotion policy (RBAC-adjacent) | B | No |

**Existing security baseline (7-role RBAC, RLS dual-enforcement) is unaffected** — confirmed unchanged by every candidate above; all are *additions* to the permission taxonomy, not modifications of the existing model. This is explicitly, independently re-verified here (not merely inherited from the prior validation cycle's finding).

---

# 16. AI DECISION CLUSTER

Candidates touching AI Assistant, BYOK, model provider, knowledge/RAG, prompt, AI authorization, AI audit, AI data boundary, AI cost, AI fallback:

| Candidate | AI dimension | Classification | Notes |
|---|---|---|---|
| MADCR-033 | Learning Session is AI-ready but AI-independent | B — Already Decided | Explicitly consistent with existing M13 BYOK boundary (EXIST-04); not a new architecture decision |
| (none other found) | — | — | No candidate touches model-provider selection, RAG, prompt governance, AI cost control, or AI fallback — the existing M13 AI Assistant (BYOK, 4 curated providers) is untouched by every new-wave AEP |

**Separation confirmed (Architecture Decision vs Provider Verification vs Configuration):** the sole AI-related candidate (MADCR-033) is a **principle-level Architecture Decision** already resolved by consistent statement across sources — there is no AI Provider Verification task and no AI Configuration item among the 64 canonical candidates, because the new-wave domains treat AI purely as an optional, non-authoritative future enhancement (recording transcripts/summaries) rather than a structural dependency.

**Existing M13 (BYOK, ADR-028) is unaffected by any new-wave candidate.**

---

# 17. UNKNOWN / MISSING EVIDENCE

| ID | What is unknown | Why | Impact | Action needed |
|---|---|---|---|---|
| MADCR-062 | Whether `MBR-COM-001–013` exists as a real, findable primary source, and what it actually says | Cited repeatedly by Commercial BR Reconciliation/Master BR v1.2, but no such file found in repository or 17-file upload corpus | Cannot independently verify Commercial "no duplication" claims (affects confidence in MADCR-001, 006, 007's "already covered" framing) | Document Custodian: source recovery |
| MADCR-063 | Same, for `MBR-LS-001–015` | Same pattern | Cannot independently verify Learning Session "no duplication" claims | Document Custodian: source recovery |
| EXIST-09/EXIST-10 | Whether the above two rule-sets are genuinely APPROVED (as claimed by citing documents) or merely asserted | Same missing-source issue | Downstream ADR drafting for MADCR-001 should treat "Subscription≠Entitlement≠RBAC is already partially explicit" as an **unverified claim**, not a fact, until source recovery succeeds | Same |

**No content was reconstructed from assumption for any of the above**, per Master Prompt §19.

---

# 18. GOVERNANCE RISKS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Architecture Review Board treats "~48" (prior-cycle figure) instead of this document's exact 32 as the ADR workload estimate | Low (this document supersedes it explicitly) | Medium — inflated workload estimate could cause unnecessary schedule padding or, conversely, under-resourcing if the number is dismissed entirely | Reference this MADCR as canonical going forward; retire the "~48" figure |
| MADCR-010/011 (OPEN-Q1/Q2) decided informally/implicitly during ERD work for a *different* domain (e.g., Title ERD accidentally assumes an Entitlement-Quota relationship) | Medium | High — would violate Gate v1.3 §13's explicit warning | Enforce via governance checkpoint: no ERD work on M14/M12-quota-adjacent tables until MADCR-010 formally closes |
| OD-11 (monetization business model) never gets a Business Owner decision, leaving MADCR-001–011 permanently "Proposed" | Medium | High for Commercial cluster; None for other clusters | Escalate OD-11 explicitly as the Commercial cluster's root blocker in the next Owner-facing governance cycle |
| 7 blocked-A candidates (MADCR-009,048,053-057) get drafted as ADRs prematurely, before their blockers close | Low–Medium | Medium — rework risk | Enforce Gate 1 → Gate 2 sequencing already established by CAIA §29 |
| `MBR-COM-001–013`/`MBR-LS-001–015` source recovery never happens, and downstream ADRs are drafted assuming their unverified content is accurate | Medium | Medium | Track as an explicit governance backlog item, not silently forgotten |
| Learning Session's domain-placement decision (MADCR-022) never gets formally numbered as a repository ADR, remaining permanently "consistently stated but not authoritative" | Low | Low (practically settled either way) | Low-cost fix: assign it the next available ADR number in a routine governance cycle |

---

# 19. FINAL STATISTICS (exact, audited counts — no "~")

| Metric | Count |
|---|---|
| Total raw candidate mentions discovered | **82** |
| Unique canonical candidates (after deduplication) | **64** |
| Raw mentions folded as duplicates/children | **18** |
| — Classification A (Mandatory Architecture Decision) | **32** |
| — Classification B (Business Rule Decision) | **14** |
| — Classification C (Configuration Decision) | **6** |
| — Classification D (Implementation Decision) | **1** |
| — Classification E (Verification/Research Task) | **4** |
| — Classification F (Governance Decision) | **2** |
| — Classification G (Already Decided) | **2** |
| — Classification H (Duplicate, as a canonical row) | **0** (duplicates removed at dedup stage, not retained as rows) |
| — Classification I (Superseded) | **0** |
| — Classification J (Not a Decision) | **1** |
| — Classification K (Unknown) | **2** |
| **Verification: A+B+C+D+E+F+G+J+K** | 32+14+6+1+4+2+2+1+2 = **64 ✓** |
| Of the 32 Category-A items: ADR REQUIRED | **9** |
| Of the 32 Category-A items: ADR RECOMMENDED | **22** |
| Of the 32 Category-A items: ADR POSSIBLE | **1** |
| **Verification: 9+22+1** | **32 ✓** |
| Category-A items currently BLOCKED | **7** (MADCR-009, 048, 053, 054, 055, 056, 057) |
| Category-A items READY FOR ADR now (non-blocked) | **25** |
| **Verification: 25+7** | **32 ✓** |
| Existing-baseline ADRs (repository-native, all Approved) | **29** (per SRC-09/SRC-11; corrects the "28" figure used in the prior validation cycle) |
| Existing-baseline Open Decisions still genuinely OPEN | **2** (OD-11, OD-12) + **1 Partial** (OD-09) |
| Blocking decisions (confirmed, §9) | **5** (MADCR-010, 011, 053, 059, 036) |
| Fully independent parallel work streams (§10) | **6** |

---

# 20. ADR PREPARATION READINESS

## CONDITIONALLY READY

**Not READY outright** because: (a) 2 missing-source items (MADCR-062, 063) mean 2 of the 64 candidates cannot be fully authority-verified yet; (b) OPEN-C01 (MADCR-012) means the Commercial cluster's source documents (AEP-MON-001 vs -002) have an unresolved scope relationship that should be clarified before ADR drafting begins on that cluster specifically; (c) 7 of the 32 Category-A candidates are genuinely blocked and not yet draftable.

**Not NOT READY** because: 25 of 32 Category-A candidates (78%) are fully canonical, non-duplicate, neutrally-phrased, and have clear authority/dependency mapping — they can enter ADR drafting today with no further inventory work required. The blocking structure itself is fully known and evidenced (§9), not ambiguous.

**Conditions for full READY status:**
1. MADCR-062/063 source recovery attempted (does not need to succeed — attempting and documenting the outcome is sufficient to close the ambiguity).
2. OPEN-C01 (MADCR-012) scope relationship clarified by the Document Custodian/Business Owner for the Commercial cluster.
3. Architecture Review Board formally accepts this MADCR v1.1 as the canonical candidate list (superseding the prior cycle's ~48/~24 figures).
4. The 64-count and 32-Category-A arithmetic remains internally consistent across the document.

None of these three conditions require resolving OPEN-Q1, OPEN-Q2, or any other substantive architecture question — they are inventory-hygiene conditions only.

---

# 21. RECOMMENDATION

1. **Propose this MADCR v1.1 for Architecture Review Board acceptance** as the canonical, superseding candidate inventory — retire the prior cycle's informal "~48 pending ADR candidates" and "~24 genuine architecture decisions" figures in favor of the exact counts in §19.
2. **ADR drafting may be prepared** for the 25 structurally ADR-eligible Category-A candidates (§7), but no ADR becomes authoritative until the normal Architecture Review Board approval process is completed.
3. **Commercial-cluster ADR drafting must respect OPEN-C01** until the relationship between AEP-MON-001 and AEP-MON-002 is clarified.
4. OPEN-Q1 and OPEN-Q2 remain formal decision questions; this MADCR does not resolve them.
3. **Do not draft ADRs yet** for the 7 blocked Category-A candidates (§9) until their listed blockers close.
4. **Escalate MADCR-010 (OPEN-Q1) and MADCR-011 (OPEN-Q2) as the highest-leverage decisions** — closing these two unblocks 7 other candidates and the entire M14/M16 ERD phase; this is a scheduling recommendation, not a decision on their content.
5. **Escalate MADCR-013 (OD-11) to the Business Owner explicitly as the parent question behind the entire Commercial cluster** — this cross-reference was not previously surfaced and materially reframes how the Commercial cluster's priority should be communicated.
6. **Attempt source recovery for MADCR-062/063** in parallel with ADR drafting — non-blocking, but should not be indefinitely deferred.
7. **Clarify OPEN-C01 (MADCR-012)** before drafting ADRs specifically within the Commercial cluster, to avoid basing an ADR on an ambiguous source-document relationship.
8. **Formalize MADCR-022 (Learning Session domain placement) as a numbered repository ADR** — low-cost, closes a governance gap where a consistently-applied direction has never received a formal ADR number.
9. **No ERD, API, RBAC, or implementation work should begin** on any candidate still marked OPEN/BLOCKED in §6 — this MADCR authorizes inventory and prioritization only.

**This MADCR makes no architecture decision.** OPEN-Q1, OPEN-Q2, OPEN-C01, Agency=Organization (unchanged), and Learning Session's domain placement (unchanged, only formal-numbering recommended) all remain exactly as this document found them.

---

**— END OF DOCUMENT: MASTER ARCHITECTURE DECISION CANDIDATE REGISTER (MADCR) v1.0 —**

**Next step in the governance chain (not performed here):** MADCR → Decision Review → Owner/Architecture Review Board Decision → ADR → Architecture Baseline → ERD → API → RBAC → Implementation.


---

# 22. v1.1 CANONICALIZATION STATUS

**Document status:** PROPOSED — CANONICALIZATION PENDING ARCHITECTURE REVIEW BOARD ACCEPTANCE

**What v1.1 changes:** only inventory arithmetic, classification wording, dependency semantics, and governance wording identified during the ChatGPT review of MADCR v1.0.

**What v1.1 does NOT change:**
- no architecture decision;
- no Business Rule;
- no domain boundary;
- no module boundary;
- no Agency/Organization decision;
- no Learning Session placement decision;
- no technology decision;
- no ERD;
- no API;
- no RBAC implementation;
- no code.

**Next governance artifact after acceptance:** `ADR MASTER SEQUENCING & DRAFTING PLAN`.

**Important:** Do not create 25 ADR files automatically from the count alone. ADR drafting must follow the canonical candidate IDs, dependency graph, authority chain, and Architecture Review Board sequencing.
