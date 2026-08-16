# MASTER ARCHITECTURE EVOLUTION PROPOSAL
## MAEP v1.1 — CORRECTION & SYNCHRONIZATION

| Field | Value |
|---|---|
| **Document ID** | MAEP-001 |
| **Version** | 1.1 |
| **Base document** | `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md` v1.0 (preserved unmodified as historical artifact) |
| **Status** | **PROPOSED — PENDING GOVERNANCE REVIEW** |
| **Synchronized against** | `MADCR-v1.1-CORRECTION-CANONICALIZATION.md`, `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` |
| **Companion documents** | `MAEP-v1.1-CHANGE-REGISTER.md` (20 changes, full traceability), `MAEP-v1.1-DISCREPANCY-REGISTER.md` (10 discrepancies, none resolved) |
| **Implementation** | NOT AUTHORIZED |
| **Method** | CORRECT → SYNCHRONIZE → TRACE → CLASSIFY → SURFACE CONFLICTS → PRESERVE AUTHORITY |

---

# 1. EXECUTIVE SUMMARY

MAEP v1.1 is a **correction and synchronization pass** over MAEP v1.0 — it does not redesign RUMAHAGEN's architecture, does not create any ADR, ERD, API, or RBAC artifact, and does not resolve any of the three open architecture questions carried since v1.0.

**What changed (20 items, full detail in the Change Register):** the informal "~48 pending ADR candidates" figure (7 locations) is replaced by MADCR v1.1's exact, deduplicated count of **32 Category-A architecture decision candidates** (9 REQUIRED, 22 RECOMMENDED, 1 POSSIBLE per MADCR v1.1's own summary — with a labeling caveat, see DISC-09); the existing-baseline ADR count is updated from 28 to **29** (a timing difference between two repository documents, not a contradiction); 6 wording/framing corrections carried over from the prior validation cycle are finally applied (corpus count, "production-ready" phrasing, breaking-change framing, AEP ID provenance, AEP-ORG-001 dual status, Target Architecture PROVISIONAL marking); and a new **ADR Sequencing Synchronization** section imports the dependency/blocking logic from the ADR Master Sequencing & Drafting Plan without duplicating it as a competing document.

**What did not change:** Agency = Organization. Learning Session remains an extension of the Learning Domain (M04), never an independent top-level domain. The existing 13-module (M01–M13) baseline. The existing approved technology, RBAC, and security baseline. OPEN-Q1 (`MADCR-010`), OPEN-Q2 (`MADCR-011`), and OPEN-C01 (`MADCR-012`) remain exactly as open as MAEP v1.0 found them. No Google Cloud Platform infrastructure decision was found or introduced anywhere in the baseline (§19).

**10 discrepancies are on record** (5 carried forward unchanged from MAEP v1.0's Conflict Register, 5 newly surfaced during MADCR v1.1/ADR-Sequencing-Plan construction) — none resolved here; full detail in the companion Discrepancy Register.

**Implementation readiness (§28):** **PARTIALLY READY.** The existing 13-module baseline is READY FOR FOUNDATION BUILD once migration canonicalization (`MADCR-059`) completes. The four new-wave domains (Commercial, Title, Learning Economy, Learning Session) remain NOT READY, gated on their respective Category-A ADRs per the ADR Sequencing Plan. This assessment is identical regardless of which implementation tool (including Bolt) is eventually used — architecture readiness is tool-agnostic (§28.2).

---

# 2. PURPOSE

To synchronize MAEP v1.0 with the two governance artifacts produced after it (MADCR v1.1, ADR Master Sequencing & Drafting Plan v1.0), correct the factual/wording issues identified during the intervening validation cycle, and preserve full traceability of every change — without introducing any new architecture decision, without resolving any open decision, and without altering any existing approved/locked decision.

---

# 3. SCOPE

**In scope:** correction, synchronization, reconciliation-surfacing, traceability, status classification (per §34 vocabulary), for all content inherited from MAEP v1.0 plus the two new governance inputs.

**Out of scope (unchanged from MAEP v1.0):** any architecture decision content, ADR creation/approval, ERD, API, RBAC, migration, Business Rule modification, or resolution of OPEN-Q1/OPEN-Q2/OPEN-C01.

---

# 4. GOVERNANCE POSITION

MAEP v1.1 is **not** a new architectural proposal. It is a governance-synchronization artifact whose sole authority is to (a) correct verifiable factual errors in MAEP v1.0, (b) align MAEP v1.0's candidate-count language with MADCR v1.1's canonical, deduplicated inventory, and (c) surface — never resolve — every discrepancy found in the process. Where MAEP v1.0 and a newer source conflict on a matter of *substance* (not wording/count), this document flags it as **RECONCILIATION REQUIRED** (see Discrepancy Register) rather than silently choosing a side.

---

# 5. SOURCE AUTHORITY

Per this task's explicit Source Authority Order, applied on top of the hierarchy already established in MAEP v1.0 §5:

```text
LEVEL 0  — Project Constitution / Governance Constitution (PROJECT-CONSTITUTION-v1.9-FINAL.md)
LEVEL 1  — Locked/Immutable Business Rules (BR-001–151, Title 001–100, LE-001–059)
LEVEL 2  — Existing Approved Architecture Decisions (29 repository-native ADR, incl. ADR-026/027 Organization, ADR-028 AI BYOK)
LEVEL 3  — Existing Approved Technology Decisions (technology-decisions-v1.6-FINAL.md)
LEVEL 3.5 — MADCR v1.1 (candidate inventory & classification — SYNCHRONIZATION INPUT ONLY, cannot override Level 0–3)
LEVEL 3.6 — ADR Master Sequencing & Drafting Plan v1.0 (process ordering — SEQUENCING INPUT ONLY, cannot override Level 0–3.5)
LEVEL 4  — Master Business Rules / Canonical Business Rules (Master BR Final Traceability Gate v1.3, NOT YET LOCKED)
LEVEL 5  — Existing Approved ADR (same set as Level 2 — repeated per this task's numbering for completeness)
LEVEL 6  — MAEP v1.0 (base document for this synchronization)
LEVEL 7  — MADCR v1.1 (repeated per this task's own numbering — see note below)
LEVEL 8  — ADR Master Sequencing & Drafting Plan v1.0 (repeated per this task's own numbering)
LEVEL 9  — AEP / Proposal artifacts (5 domain AEPs, CAIA)
LEVEL 10 — PRD / ERD / API / RBAC / implementation planning
```

**Note on Level 3.5/3.6 vs Level 7/8 duplication:** this task's own Source Authority Order (§2) lists MADCR v1.1 and the ADR Sequencing Plan at both an early position (implied by their synchronization role) and explicitly at Levels 7–8. Both placements are preserved above rather than silently collapsed — the practical rule is unambiguous either way: **MADCR v1.1 and the ADR Sequencing Plan synchronize candidate inventory and process ordering; they never override Level 0–5 architecture/business-rule content.**

**Applied consistently:** every "32 Category-A candidates" statement in this document is sourced to MADCR v1.1 (Level 3.5/7), never elevated to Level 2 (Approved Architecture Decision) status.

---

# 6. EXISTING ARCHITECTURE BASELINE

**Unchanged from MAEP v1.0 §10–19, preserved in full.** Summary (full detail remains authoritative in MAEP v1.0, cross-referenced not reproduced verbatim per the no-unnecessary-duplication principle):

- **Pattern:** Modular monolith — Next.js App Router + Route Handlers as BFF. No microservices split required (CAIA §5.1, re-confirmed, not reopened).
- **Business Architecture:** SaaS B2B2C PropTech, 7-role RBAC (Superadmin/Manager/Admin/Instructor/Agent/DevPartner/Buyer).
- **Domain Architecture:** 13 bounded contexts (M01–M13), see §7 below.
- **Data Architecture:** ~41-entity ERD v1.4-FINAL, migrations `0001`–`0015` written, **0% executed**.
- **API Architecture:** REST convention, `API-Specification-v1.3-FINAL-FIXED`, standardized error response (ADR-013).
- **Security Architecture:** Supabase Auth + custom RBAC (application-layer) + Supabase RLS (data-layer), dual-enforcement — **status: EXISTING, LOCKED, unaffected by any candidate in this document.**
- **AI Architecture:** M13 AI Assistant — BYOK, 4 curated providers (Gemini/Groq/Mistral/GitHub Models), AI as assistive-only, ADR-028 Approved With Notes.
- **Infrastructure:** Vercel + Supabase/PostgreSQL + Supabase Storage + Resend + Sentry + GitHub→Vercel, staged Maps/Search/Queue/Cache migration paths (ADR-005/006/008/018).

**Status classification (per §34 vocabulary):** **LOCKED / APPROVED / EXISTING** throughout this section — no item here carries PROPOSED, OPEN, or BLOCKED status.

---

# 7. EXISTING M01–M13 BASELINE

**Preserved exactly, not rewritten, not renamed, not split, not merged** — per explicit instruction (§17 of this task).

```text
M01 Authentication          M08 Dashboard/Notification
M02 Agent Profile           M09 Admin Panel
M03 Listing                 M10 RBAC
M04 Learning Center         M11 SEO/Analytics
M05 Calendar/Event          M12 Organization
M06 Developer Directory     M13 AI Assistant (BYOK)
M07 DBR/KPR Scoring
```

**Status: LOCKED / APPROVED** for all 13 modules. No candidate in the MADCR v1.1 inventory proposes renaming, splitting, or merging any of these — every new-wave candidate is additive (extends M04, or introduces new modules M14/M15, with M16 status OPEN per §16 below).

---

# 8. ARCHITECTURE EVOLUTION PRINCIPLES

**Unchanged from MAEP v1.0, re-affirmed:**

1. Evolve, don't reinvent — preserve validated decisions, existing contracts, domain boundaries, business rules, and technology where appropriate.
2. No existing FINAL/APPROVED/LOCKED decision is overridden by this synchronization.
3. New-wave domains are additive extensions (M04 extension for Learning Economy/Session; new M14/M15; M16 status OPEN), never restructuring.
4. Architecture governance remains **tool-agnostic** — this synchronization does not modify architecture to suit any particular implementation tool, including Bolt (§28.2, explicit).

---

# 9. MASTER BUSINESS RULE TRACEABILITY

**Unchanged from MAEP v1.0 §7, reproduced by reference, not verbatim** (full 19-item inventory remains authoritative in MAEP v1.0):

- BR-001–151 (legacy) — **LOCKED**, PRESERVE.
- Title 001–100 — **Consolidated, user-locked**, PRESERVE.
- Learning Economy LE-001–059 — **Authoritative**, PRESERVE.
- Learning Session LS-001–080 — **Proposed**, cross-referenced against `MADCR-022`–`035`.
- Commercial COM-BR-001–015 — **Proposed/Reconciled**, cross-referenced against `MADCR-001`–`013`.
- `MBR-COM-001–013`, `MBR-LS-001–015` — **UNKNOWN / SOURCE RECOVERY REQUIRED** (DISC-03, DISC-04) — not reconstructed here.
- 19 proposed Master BR amendments (MBR-TITLE-*, MBR-COM-X0*) — **PROPOSED**, pending Lock Gate, unchanged.

**Status classification:** LOCKED (3 items), PROPOSED (3 items + 19 amendments), UNKNOWN (2 items) — no upgrade to APPROVED performed by this synchronization.

---

# 10. MADCR v1.1 SYNCHRONIZATION

**MAEP v1.1 adopts MADCR v1.1's canonical baseline exactly as published, with zero recalculation:**

```text
82 raw candidate mentions
    ↓
64 canonical candidates
    ↓
A=32  B=14  C=6  D=1  E=4  F=2  G=2  H=0  I=0  J=1  K=2
    ↓ (within Category A, per MADCR v1.1's own summary)
ADR REQUIRED=9   ADR RECOMMENDED=22   ADR POSSIBLE=1 (see DISC-09 — register shows 2 rows with this label)
    ↓
BLOCKED=7   STRUCTURALLY ADR-ELIGIBLE=25
```

**These numbers are not recalculated, not adjusted, and not reconciled with any repository count in this section** — per this task's explicit instruction (§7): *"DO NOT change these numbers. If repository evidence appears inconsistent: FLAG DISCREPANCY. Do not silently recalculate the canonical MADCR."* The one internal inconsistency found (DISC-09, the ADR-POSSIBLE row-count vs summary-count) is flagged in the Discrepancy Register, not corrected here.

**Legacy figure retired:** MAEP v1.0's "~48 pending ADR candidates" (7 locations: former §9.2, §26, §28, §34, §39, §41, §42) is superseded throughout this document by the wording: **"32 Category-A architecture decision candidates are currently tracked in MADCR v1.1. These are candidates, not approved ADRs."** (CH-08).

**Important — "ADR-eligible" clarified (per this task §5):** structural ADR-eligibility does not mean automatically approved, drafted, selected, or implemented. It means only that a candidate is structurally suitable for ADR processing, subject to dependency and Architecture Review Board review.

**Cross-domain finding preserved from MADCR v1.1:** `MADCR-013` (repository-native `OD-11`, "model monetisasi platform") is the **contextual, non-blocking parent business question** behind the entire Commercial cluster (`MADCR-001`–`011`) — not itself a technical blocker (§13, §16 below).

---

# 11. ADR SEQUENCING SYNCHRONIZATION

**MAEP v1.1 imports the dependency/blocking logic from `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` as governance input — it does not reproduce that document's full 24-section content, and does not replace it.**

## 11.1 Sequencing Lanes (reference only)

| Lane | Candidates | Count |
|---|---|---|
| S0 — Foundational/Gate-1 | `MADCR-010, 011, 036, 046, 049` | 5 |
| S1 — Foundational Domain | `MADCR-001, 004, 014, 023, 050, 051` | 6 |
| S2 — Dependent Domain | `MADCR-002, 003, 005, 009, 015, 016, 037, 039, 040` | 9 |
| S3 — Cross-Domain/Dependent-on-Dependent | `MADCR-038, 041, 042, 043` | 4 |
| S3-SEC — Security/RBAC | `MADCR-048, 053, 054, 055, 056, 057` | 6 |
| S4 — Implementation-Shaping (non-A) | `MADCR-052` | 1 (Category D) |
| DEFERRED | `MADCR-006, 007` | 2 |

## 11.2 Highest-Leverage Candidates (by fan-out, per ADR Sequencing Plan §8)

| Candidate | Total Reach (direct+indirect) | Rationale |
|---|---|---|
| `MADCR-036` (Title Definition vs Award Instance) | **13** | Highest in the entire register — 8 direct + 5 indirect dependents |
| `MADCR-011` (OPEN-Q2) | **9** | 3 direct + 6 indirect |
| `MADCR-010` (OPEN-Q1) | **7** | 3 direct + 4 indirect |
| `MADCR-053` (permission taxonomy) | **5** | Single convergence point for the entire Security/RBAC cluster |

## 11.3 Downstream Impact (imported, not re-derived)

- **M14 Commercial ERD** — blocked pending `MADCR-010` (OPEN-Q1) approval.
- **M12 Organization quota-adjacent tables** — blocked pending `MADCR-010` approval (same ambiguity — do not let ERD infer the answer).
- **Payment ERD/API (M14 subdomain or M16 module)** — blocked pending `MADCR-011` (OPEN-Q2) approval.
- **Title (M15) core tables** — blocked pending `MADCR-036` approval (+ its 8 direct dependents for full schema).
- **All new-wave RBAC/API authorization** — blocked pending `MADCR-053` approval, which itself requires `MADCR-010`, `011`, `036` closed first.

## 11.4 Drafting vs Approval (preserved distinction, per §26 of this task)

25 of 32 Category-A candidates are **structurally draftable** (draft-shell: context, problem, decision question, evidence, alternatives — no selected option) without waiting for any blocker. Only 7 (`MADCR-009, 048, 053, 054, 055, 056, 057`) cannot even begin shell-drafting until their prerequisite's own shell exists. **None of the 32 are APPROVED** — confirmed by direct re-verification that the repository's ADR register contains no `ADR-MON-*`, `ADR-LE-*`, `ADR-LS-*`, or Title/CAIA-prefixed entries.

**Full detail (Master Dependency Matrix, Drafting/Approval Waves, Board Session plan) remains in `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` — not duplicated here.**

---

# 12. NEW ARCHITECTURE EVOLUTION

**Status classification applied throughout this section and §13–17: LOCKED / APPROVED / EXISTING / PROPOSED / OPEN / BLOCKED / DEFERRED / UNKNOWN / RECONCILIATION REQUIRED — never "final" unless source authority confirms it.**

The evolution framing from MAEP v1.0 §29 is preserved:

```text
M04 Learning (EXTENDED — status: PROPOSED, candidates MADCR-014,023,049 govern)
    ├── existing Learning Center (LOCKED/APPROVED, unchanged)
    ├── Learning Economy extension (PROPOSED)
    └── Learning Session extension (PROPOSED)

M14 Commercial (NEW — status: PROPOSED, BLOCKED on OPEN-Q1 for full ERD)
M15 Title (NEW — status: PROPOSED, BLOCKED on MADCR-036 for full ERD)
M16 Payment (STATUS: OPEN — subdomain of M14 vs separate module, per OPEN-Q2, not decided)
```

**None of M14, M15, or the M04 extensions are treated as approved implementation architecture** — no authoritative ADR yet exists for any of them (§10, §11.4 re-confirmed).

---

# 13. LEARNING EVOLUTION

| Item | Status | Candidates | Preserved? |
|---|---|---|---|
| Learning Session remains inside M04 Learning Domain | **EXISTING** (consistently applied direction, not yet a numbered repo ADR) | `MADCR-022` (Category G, Already Decided) | **YES — not reopened anywhere in this document** |
| M05 Calendar/Event remains discovery/scheduling layer | **EXISTING** | (unchanged, CAIA §24) | YES |
| Learning Point ledger domain | PROPOSED | `MADCR-014` | Extends M04, not a new module |
| Learning Session Provider Adapter | PROPOSED | `MADCR-023` | Extends M04 |
| Learning Activity vs existing Course/Lesson boundary | OPEN | `MADCR-049` | Genuinely undecided — DISC-07 notes a sequencing ambiguity, not a content decision |

**Explicit confirmation (per §19 of this task):** no new top-level "Learning Session domain" is created anywhere in MAEP v1.1. `MADCR-022`'s Already-Decided status is preserved verbatim from MADCR v1.1.

---

# 14. COMMERCIAL EVOLUTION

## 14.1 Commercial AEP Reconciliation (per this task §16, explicit requirement)

**`AEP-MON-001` vs `AEP-MON-002` — UNRESOLVED, per insufficient evidence for a supersession determination.**

| Dimension | AEP-MON-001 | AEP-MON-002 |
|---|---|---|
| **Scope** | Full commercial/payment domain — subscription, entitlement, quota, promotion, payment core, provider adapter, reconciliation | Narrower — listing/promo/quota-transfer alignment specifically against legacy BR-001–151 |
| **Overlap** | Free Bonus grant model, add-on validity, quota allocation | Same three items, framed as "Locked Business Direction" rather than open ADR candidates |
| **Unique responsibilities** | Payment Gateway architecture (adapter, verification, reconciliation) — not covered by v1.1 | BR-001–151-specific operational alignment (OTP retry limits, promo expiry/transfer mechanics) — not covered by v1.0 |
| **Conflicting statements** | Frames Free-Bonus/add-on model as ADR candidates (ADR-MON-002/003) | Frames the same business direction as already Locked | 
| **Source authority** | Level 9 (Proposed AEP) | Level 9 (Proposed AEP, revised) |
| **Dependency** | Neither document declares itself dependent on or superseding the other | — |
| **ADR needed?** | Yes, for the payment-core/adapter/reconciliation portions unique to v1.0 (`MADCR-002, 003, 005`) | Not separately — its content is treated as informing `MADCR-006, 007, 009`'s "business rule already locked" classification |
| **Supersession?** | **No supersession evidence found either direction** | Same |
| **Unresolved items** | The scope relationship itself (= `MADCR-012` / OPEN-C01) | Same |

**Status: UNRESOLVED / RECONCILIATION REQUIRED (DISC-01).** MAEP v1.1 does not decide whether one document supersedes the other; it treats both as **jointly informing** the Commercial cluster (`MADCR-001`–`013`) until the Business Owner clarifies (§21 Governance Gaps).

## 14.2 Commercial Cluster Status

| Candidate | Status | Blocking |
|---|---|---|
| `MADCR-010` (OPEN-Q1) | **OPEN** | Blocks 7 downstream candidates |
| `MADCR-011` (OPEN-Q2) | **OPEN** | Blocks 6 downstream candidates |
| `MADCR-013` (OD-11) | **CONTEXTUAL / NON-BLOCKING** | Parent business question, not a technical blocker |
| `MADCR-001–009` (structural/mechanics) | PROPOSED, mostly ADR-eligible | See §11.4 |

---

# 15. TITLE EVOLUTION

**Title Definition ≠ Award Instance — preserved, not collapsed.**

| Item | Status | Candidate |
|---|---|---|
| Title Definition vs Award Instance separation | **OPEN** (highest fan-out in entire register — 13 total reach) | `MADCR-036` |
| `certificates`(M04) vs Title(M15) boundary | **OPEN** | `MADCR-046` — `certificates` explicitly must NOT auto-become Title Award Instance |
| Versioned Awarding Paths, Provenance, Lifecycle, Presentation, Revocation/Appeal, Multiple Instances | **OPEN**, dependent on `MADCR-036` | `MADCR-037,038,039,040,041,042,043` |
| Historical Award integrity | **LOCKED invariant** (Gate v1.3 §8) | `MADCR-045` (Category B, not an ADR candidate) |
| Title authority/scope RBAC realization | **OPEN, BLOCKED** | `MADCR-048` |

**No unresolved Title architecture question is decided in this document** — every item above remains exactly as MADCR v1.1 classified it.

---

# 16. PAYMENT / OPEN-Q2

**Preserved verbatim, per explicit instruction (§11 of this task):**

> **OPEN-Q2:** *"Should Payment be modeled as a subdomain of Commercial (M14), or as a separate logical module (M16)?"*
> **Status: OPEN.**

MAEP v1.1 does not choose M14. MAEP v1.1 does not choose M16. The blocking impact is preserved: `MADCR-011` blocks `MADCR-002, 003` (finalization), `MADCR-055` (Commercial admin permissions), and the entire Payment ERD/API phase (§11.3).

**M16 is written throughout this document as "STATUS: OPEN"**, never as an established module, consistent with §12's evolution diagram.

---

# 17. SECURITY / RBAC / RLS

**Preserved exactly:** Supabase Auth + Application RBAC + Supabase RLS, existing 7-role model — **LOCKED, not reopened, no new role invented, no permission taxonomy changed by this document.**

**Unresolved cross-domain permission taxonomy, flagged per MADCR v1.1 (not decided):**

| Candidate | Status | Blocked by |
|---|---|---|
| `MADCR-053` (new cross-domain permission taxonomy) | **OPEN, BLOCKED** | `MADCR-010, 011, 036` |
| `MADCR-048` (Title RBAC realization) | **OPEN, BLOCKED** | `MADCR-053, 036` |
| `MADCR-054` (Learning Session host/instructor authorization) | **OPEN, BLOCKED** | `MADCR-053` |
| `MADCR-055` (Commercial administration permissions) | **OPEN, BLOCKED** | `MADCR-010, 011, 053` |
| `MADCR-056` (Learning Point adjustment permissions) | **OPEN, BLOCKED** | `MADCR-014, 053` |
| `MADCR-057` (Title issuance/revocation/appeal permissions) | **OPEN, BLOCKED** | `MADCR-036, 039, 042, 053` |

All 6 are flagged as **ADR candidates / unresolved decisions**, per this task's explicit instruction — none decided here.

---

# 18. TECHNOLOGY BASELINE

**Preserved exactly, per this task §22 — no addition beyond what the repository explicitly approves:**

| Technology | Status | Evidence |
|---|---|---|
| Next.js App Router | **APPROVED** | ADR-001 |
| Modular Monolith | **APPROVED** | ADR-001, re-confirmed CAIA §5.1 |
| Supabase/PostgreSQL | **APPROVED** | technology-decisions §4 |
| Supabase Auth | **APPROVED** | ADR-002 |
| Supabase RLS | **APPROVED** | technology-decisions §4.9 |
| Custom RBAC (application-layer) | **APPROVED** | Authorization-Access-Control-Specification v1.1 |
| Vercel (hosting) | **APPROVED** | technology-decisions |
| Supabase Storage | **APPROVED** | technology-decisions |
| Resend (email) | **APPROVED** | technology-decisions |
| Sentry (monitoring) | **APPROVED** | technology-decisions |
| GitHub → Vercel (CI/CD) | **APPROVED** | technology-decisions |
| PostgreSQL FTS + pg_trgm → Typesense (Phase 2) | **APPROVED**, staged | ADR-005 |
| Vercel Cron + DB Trigger → QStash (Phase 2) | **APPROVED**, staged | ADR-006 |
| Leaflet+OSM+LocationIQ+Geoapify → Google Maps (Enterprise phase, not active) | **APPROVED**, staged; Google Maps explicitly **DEFERRED**, not adopted | ADR-008 |
| Supabase Postgres rate-limit → Upstash Redis (Phase 2) | **APPROVED**, staged | ADR-018 |

**Explicitly NOT added (per this task §22, §39):** Google Cloud Platform, AWS, Azure, or any new infrastructure provider — **none found to have an authoritative repository decision requiring them.** See §19.2 for the specific Google-related evidence found (narrower than "Google Cloud infrastructure").

---

# 19. EXTERNAL INTEGRATION BASELINE

## 19.1 External Provider Status

| Provider | Purpose | Architecture Status | Account Required? | API Required? | OAuth Required? | Billing Required? | Verified? | Source | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Vercel | Hosting, CI/CD, Cron | **APPROVED** | Yes | N/A | No | Yes (existing) | Yes | technology-decisions | Existing baseline |
| Supabase | Database, Auth, Storage, RLS | **APPROVED** | Yes | Yes | N/A | Yes (existing) | Yes | technology-decisions | Existing baseline |
| Resend | Transactional email | **APPROVED** | Yes | Yes | No | Yes (existing) | Yes | technology-decisions | Existing baseline |
| Sentry | Error monitoring | **APPROVED** | Yes | Yes | No | Yes (existing) | Yes | technology-decisions | Existing baseline |
| Leaflet + OpenStreetMap | Maps (Phase 1) | **APPROVED** | No (OSM self-hosted tiles/self-serve) | Yes | No | No | Yes | ADR-008 | Existing baseline |
| LocationIQ | Geocoding (Primary) | **APPROVED** | Yes | Yes | No | Yes (free tier) | Yes | ADR-008 | Existing baseline |
| Geoapify | Geocoding (Approved Alternative) | **APPROVED** | Yes | Yes | No | Yes (free tier) | Yes | ADR-008 | Existing baseline |
| Google Maps Platform | Maps (Enterprise-phase migration path) | **DEFERRED — NOT ACTIVE** | N/A yet | N/A yet | N/A | N/A | N/A | ADR-008 Review §"pertahankan sebagai jalur migrasi tahap Enterprise, bukan ditolak permanen" | **Not currently adopted — future option only** |
| Google (OAuth2 sign-in) | Authentication method | **APPROVED** | N/A (uses OAuth) | No | **Yes** | No | Yes | ADR-002, SYSTEM-ARCHITECTURE §5.1 | Requires "Google Cloud OAuth Client ID" registration — this is credential registration, **not** Google Cloud infrastructure adoption |
| Google Gemini | AI Assistant provider (BYOK) | **APPROVED WITH NOTES** | User-provided (BYOK) | Yes | No | User-borne | Yes | ADR-028, technology-decisions §4.33 | Free-tier quota "dapat berubah sewaktu-waktu" — not a platform commitment |
| Groq | AI Assistant provider (BYOK) | **APPROVED WITH NOTES** | User-provided (BYOK) | Yes | No | User-borne | Yes | ADR-028 | Same caveat |
| Mistral | AI Assistant provider (BYOK) | **APPROVED WITH NOTES** | User-provided (BYOK) | Yes | No | User-borne | Yes | ADR-028 | Same caveat |
| GitHub Models | AI Assistant provider (BYOK) | **APPROVED WITH NOTES** | User-provided (BYOK) | Yes | No | User-borne | Yes | ADR-028 | Same caveat |
| Typesense | Search (Phase 2, threshold-gated) | **APPROVED, staged, NOT YET ACTIVE** | Yes (future) | Yes (future) | No | Yes (future) | Yes | ADR-005 | Migration criteria explicit, not yet triggered |
| QStash | Job Queue (Phase 2, threshold-gated) | **APPROVED, staged, NOT YET ACTIVE** | Yes (future) | Yes (future) | No | Yes (future) | Yes | ADR-006 | Same pattern |
| Upstash Redis | Cache (Phase 2, threshold-gated) | **APPROVED, staged, NOT YET ACTIVE** | Yes (future) | Yes (future) | No | Yes (future) | Yes | ADR-018 | Same pattern |
| Payment Gateway (vendor unspecified) | Commercial payment processing | **OPEN — VERIFICATION TASK** | TBD | TBD | TBD | TBD | **No — UNVERIFIED** | `MADCR-058` | Vendor selection is a research/verification task, distinct from the adapter-*pattern* decision (`MADCR-002`, an ADR candidate) |
| Daily / LiveKit | Learning Session native interactive provider candidates | **OPEN — VERIFICATION TASK** | TBD | TBD | TBD | TBD | **No — UNVERIFIED** | `MADCR-026` | Capability/OAuth/quota/pricing not yet verified |
| Zoom / Google Meet | Learning Session embedded interactive provider candidates | **OPEN — VERIFICATION TASK** | TBD | TBD | TBD | TBD | **No — UNVERIFIED** | `MADCR-027` | Same |
| YouTube Live | Learning Session broadcast provider candidate | **OPEN — VERIFICATION TASK** | TBD | TBD | TBD | TBD | **No — UNVERIFIED** | `MADCR-028` | Same |

## 19.2 Google Cloud Inference Check (per this task §39, explicit requirement)

**Finding: NOT REQUIRED BY CURRENT MAEP BASELINE.** Direct repository re-verification confirms "Google Cloud" appears in exactly two narrow contexts, neither of which constitutes a Google Cloud Platform infrastructure decision:

1. **"Google Cloud OAuth Client ID"** — required only to register the already-Approved Google OAuth2 sign-in method (ADR-002). This is credential registration for an *authentication method*, not infrastructure hosting.
2. **"Google Cloud Console"** — mentioned only as the configuration console for Google Maps Platform, which is itself explicitly a **deferred, non-active, Enterprise-phase-only** migration option (ADR-008), not the current Maps provider (Leaflet+OSM+LocationIQ+Geoapify is Phase 1 active).

**No inference was made from Gemini's existence, Google OAuth's existence, or a possible future Google Maps migration to conclude that "Google Cloud" is part of the architecture baseline.** This finding is stated explicitly per this task's anti-inference rule.

## 19.3 Architecture Requirement vs Implementation Convenience

| Distinction | Examples |
|---|---|
| **Architecture Requirement** (governed by ADR/technology-decisions) | Supabase, Vercel, Resend, Sentry, staged Search/Queue/Cache providers, 4 curated AI BYOK providers |
| **Implementation Convenience** (not an architecture decision, tool-agnostic) | Which IDE, which coding agent, which local dev tooling is used to *build* the approved architecture — this is explicitly out of MAEP's scope (§28.2) |

---

# 20. ARCHITECTURE DEPENDENCY MODEL

**Imported from `ADR-MASTER-SEQUENCING-DRAFTING-PLAN-v1.0.md` §11 (governance input, not re-derived):**

```text
MADCR-036 (Title Definition≠Instance) ──┬──> 037,038,039,040,043,048,053,057 (8 direct)
MADCR-011 (OPEN-Q2) ──┬──> 002,053,055 (3 direct) ──> +6 indirect
MADCR-010 (OPEN-Q1) ──┬──> 009,053,055 (3 direct) ──> +4 indirect
MADCR-014 (LP ledger) ──┬──> 015,016,056 (3 direct)
MADCR-053 (permission taxonomy) ──┬──> 048,054,055,056,057 (5 direct)
```

**Standard downstream chain (preserved, per this task §27):**

```text
Business Rules → ADR → ERD → API → RBAC/RLS → PRD/UI → Implementation
```

**If an ADR is unresolved, downstream artifacts depending on it must not become authoritative** — this rule is preserved verbatim and applies to every OPEN/BLOCKED item in §14–17.

---

# 21. BLOCKING DECISIONS

| Blocker | Blocks | Status |
|---|---|---|
| `MADCR-010` (OPEN-Q1) | 7 downstream candidates + M14/M12 ERD | **OPEN** |
| `MADCR-011` (OPEN-Q2) | 6 downstream candidates + Payment ERD/API | **OPEN** |
| `MADCR-036` (Title Definition≠Instance) | 8 direct + 5 indirect Title/Security candidates | **OPEN** |
| `MADCR-053` (permission taxonomy) | 5 Security/RBAC candidates | **OPEN, itself BLOCKED** by 010/011/036 |
| `MADCR-059` (migration `-FIXED` canonicalization) | Sprint S0 execution (existing baseline) | **OPEN — independent of all new-wave items** |

**None resolved here.**

---

# 22. DOWNSTREAM ARTIFACT GATES

**No new ERD, API, or RBAC artifact created here — impact identified only, per this task §28–30.**

| Gate | Status | Blocked by |
|---|---|---|
| Existing ERD v1.4-FINAL (41 entities) | **EXISTING, APPROVED** | Not affected by this synchronization |
| M14 Commercial ERD (proposed extension) | **BLOCKED** | `MADCR-010` |
| M12 Organization quota-adjacent tables | **BLOCKED** | `MADCR-010` |
| Payment ERD/API (M14 subdomain vs M16) | **BLOCKED** | `MADCR-011` |
| Title (M15) ERD | **BLOCKED** | `MADCR-036` (+8 direct dependents) |
| M04-extend (Learning Point/Session) ERD | **PROPOSED, largely unblocked** | `MADCR-014, 023` draftable now; `MADCR-049` boundary OPEN |
| Existing API v1.3-FINAL-FIXED | **EXISTING, APPROVED** | Not affected |
| New-wave API surfaces | **BLOCKED / FUTURE** | Respective ERD gates above |
| Existing RBAC (7-role, Authorization Spec v1.1) | **EXISTING, APPROVED** | Not affected |
| New-wave RBAC (Title/Commercial/Learning Session/Point permissions) | **BLOCKED** | `MADCR-053` (itself blocked by 010/011/036) |

---

# 23. GOVERNANCE GAPS

**Preserved from MAEP v1.0 (per explicit instruction: "Do not delete old governance gaps merely because they are inconvenient") plus 5 new items:**

| ID | Gap | Status | First raised |
|---|---|---|---|
| C-01 | Commercial AEP overlap (`AEP-MON-001` vs `AEP-MON-002`) | OPEN | MAEP v1.0 §22 |
| C-02 | `AEP-ORG-001` status ambiguity (document says Draft, decision is Approved) | OPEN (administrative) | MAEP v1.0 §22 |
| C-03 | `MBR-COM-001–013` source gap | OPEN | MAEP v1.0 §22 |
| C-04 | `MBR-LS-001–015` source gap | OPEN | MAEP v1.0 §22 |
| C-05 | ADR-MON-002/003 business-direction vs ADR-candidate framing ambiguity | OPEN | MAEP v1.0 §22 |
| REC-01/DISC-06 | `MADCR-046` `Blocks` vs `MADCR-036` `Depends On` mismatch | OPEN, new | ADR Sequencing Plan §19.2 |
| REC-02/DISC-07 | `MADCR-049` `Blocks` vs `MADCR-014/023` `Depends On` mismatch | OPEN, new | ADR Sequencing Plan §19.2 |
| REC-03/DISC-08 | `MADCR-010` `Blocks` vs `MADCR-002` `Depends On` mismatch | OPEN, new | ADR Sequencing Plan §19.2 |
| REC-04/DISC-09 | MADCR v1.1 "1 ADR POSSIBLE" summary vs 2 register rows | OPEN, new | ADR Sequencing Plan §23 |
| DISC-10 | `technology-decisions` (28 ADR) vs `project-manifest` (29 ADR) timing difference | OPEN, new | This synchronization, §5/§18 |

**Full detail for all 10 in the companion `MAEP-v1.1-DISCREPANCY-REGISTER.md`.**

---

# 24. DISCREPANCY REGISTER

**See companion file `MAEP-v1.1-DISCREPANCY-REGISTER.md` for the full 10-row register with Source A/B, Severity, Impact, Proposed Resolution Path, Decision Owner, and Status columns.** Reproduced here only as the summary table in §23 above, to avoid the exact "duplicate authority" problem this document itself warns against elsewhere.

---

# 25. CHANGE REGISTER

**See companion file `MAEP-v1.1-CHANGE-REGISTER.md` for the full 20-row register with Source, MAEP v1.0 Location, Previous/New Statement, Change Type (A–F), Reason, Authority, Impact, ADR-requirement flag, and Status columns.**

---

# 26. ARCHITECTURE EVOLUTION ROADMAP

Every phase item below has evidence backing (per §36 instruction: "do not fill a phase merely to look complete"):

### Phase 0 — Governance Reconciliation
- Apply CH-01 through CH-20 corrections (this document).
- Resolve DISC-01 (OPEN-C01 scope clarification) — Business Owner action.
- MADCR v1.2 hygiene pass: DISC-06/07/08/09 (Document Custodian).
- `technology-decisions` refresh for ADR-029/047 (DISC-10, Document Custodian).
- Migration `-FIXED` canonicalization (`MADCR-059`) — independent of all above, existing-baseline blocker for Sprint S0.

### Phase 1 — Foundational ADR (Session 1+2, per ADR Sequencing Plan)
- `MADCR-036, 010, 011, 046, 049` (S0) — can begin immediately, no prerequisite.
- `MADCR-001, 004, 014, 023, 050, 051` (S1) — parallel-eligible with S0.

### Phase 2 — Domain Architecture (Session 3a/3b/3c)
- Commercial: `MADCR-002, 003, 005, 009` (after 010/011 close).
- Learning Economy: `MADCR-015, 016` (after 014 closes).
- Title: `MADCR-037, 039, 040` (after 036 closes).

### Phase 3 — Cross-Domain Architecture (Session 4)
- `MADCR-038, 041, 042, 043` (Title layer 2).

### Phase 4 — Security/Authorization (Session 5)
- `MADCR-053, 048, 054, 055, 056, 057` — last, dependency-forced (converges on 053).

### Phase 5 — ERD/API/RBAC Evolution
- Only after respective Phase 1–4 ADRs are APPROVED (not merely drafted) per §11.4/§22.

### Phase 6 — Implementation Readiness
- Test/Traceability Matrix construction, environment readiness, provider verification completion (`MADCR-026,027,028,058`).

### Phase 7 — Implementation
- **Not authorized by this document.** Requires explicit future directive.

**No implementation content appears in Phase 0–5**, per explicit instruction.

---

# 27. ADR READINESS

**Imported from ADR Sequencing Plan §20, not re-derived:**

| Readiness state | Count | Candidates |
|---|---|---|
| DRAFTABLE now (no prerequisite) | 13 | `MADCR-001,004,006,007,010,011,014,023,036,046,049,050,051` |
| DRAFTABLE (shell, prerequisite drafted not approved) | 14 | `MADCR-002,003,005,009,015,016,037,038,039,040,041,042,043,053` |
| BLOCKED (cannot shell-draft yet) | 5 | `MADCR-048,054,055,056,057` |
| READY FOR DECISION | 0 | *(none — no prerequisite is yet APPROVED)* |
| APPROVED | 0 | *(none found — confirmed by repository re-verification)* |
| ALREADY DECIDED (outside the 32) | 2 | `MADCR-022, 029` |

**No candidate is marked APPROVED anywhere in this document**, consistent with §26 of this task's instruction.

---

# 28. IMPLEMENTATION READINESS

## 28.1 Explicit Answer

**"Is RUMAHAGEN ready to be handed to Bolt (or any implementation tool) for full implementation?"**

**Status: PARTIALLY READY.**

This is not "YES" merely because documentation is complete — evaluated explicitly against each dimension required by this task §37:

| Dimension | Existing 13-module baseline | New-wave domains (Commercial/Title/Learning Economy/Session) |
|---|---|---|
| Open architecture decisions | 0 open (29/29 ADR Approved) | **32 Category-A candidates open**, 0 approved |
| Unresolved AEP | `AEP-ORG-001` status-field only (administrative) | `AEP-MON-001` vs `AEP-MON-002` unresolved (DISC-01); 4 other AEPs Proposed, none Approved |
| Missing MBR | None | `MBR-COM-001–013`, `MBR-LS-001–015` — UNKNOWN/SOURCE RECOVERY REQUIRED |
| Unresolved dependency | None | 7 blocked Category-A candidates (§21) |
| ERD readiness | READY (v1.4-FINAL, Approved) | NOT READY (blocked, §22) |
| API readiness | READY (v1.3-FINAL-FIXED, Approved) | NOT READY (blocked, §22) |
| RBAC readiness | READY (v1.1-FINAL, Approved) | NOT READY (blocked on `MADCR-053`, §22) |
| Migration readiness | **NOT READY** — `MADCR-059` (`-FIXED` canonicalization) must complete first | N/A (no new-wave migration exists yet) |
| Environment readiness | Not evaluated by this document (outside architecture-governance scope) | Same |
| External integration readiness | READY (existing providers Approved, §19) | **UNVERIFIED** — Payment vendor, Learning Session providers all `MADCR-058/026/027/028` (Category E, not yet run) |

**Composite status:**
- **Existing 13-module baseline: READY FOR FOUNDATION BUILD** (once `MADCR-059` migration canonicalization completes — this is the only blocker, and it is independent of every new-wave item).
- **New-wave domains: NOT READY** — blocked on 32 Category-A architecture decisions, 0 of which are yet Approved.
- **Overall RUMAHAGEN: PARTIALLY READY** — the existing baseline can proceed to foundation build; the four new-wave domains cannot proceed to any ERD/API/RBAC/implementation work until their respective ADRs close per the roadmap (§26).

## 28.2 Bolt-Neutrality (per explicit instruction §38)

**This assessment is identical regardless of implementation tool.** Bolt, Claude Code, or any other implementation tool would face the exact same readiness picture: a complete, Approved, 0%-implemented existing baseline, and four architecturally-unresolved new-wave domains. **No architecture in this document has been or will be modified to make any particular tool's job easier.** Architecture governance remains tool-agnostic throughout MAEP v1.0 and v1.1 alike.

---

# 29. FINAL GOVERNANCE STATUS

**MAEP v1.1 status: PROPOSED — PENDING GOVERNANCE REVIEW.**

Not marked APPROVED, FINAL, or LOCKED, because no authoritative repository evidence of Architecture Review Board acceptance for this specific synchronized document exists yet.

**No architecture decision, ADR, ERD, API, RBAC artifact, Business Rule, or provider was created, altered, or invented by this document.** Agency=Organization, Learning Session-in-Learning-Domain, the M01–M13 baseline, and all 29 existing-baseline ADRs remain exactly as they were before this synchronization. OPEN-Q1, OPEN-Q2, and OPEN-C01 remain open. 10 discrepancies are on record, none resolved.

**This synchronization's job was:** correct, synchronize, trace, classify, surface conflicts, preserve authority. It did not — and was not instructed to — improve, optimize, fix, or choose between competing architecture options.

---

**— END OF DOCUMENT: MASTER ARCHITECTURE EVOLUTION PROPOSAL v1.1 — CORRECTION & SYNCHRONIZATION —**

**Companion files:** `MAEP-v1.1-CHANGE-REGISTER.md`, `MAEP-v1.1-DISCREPANCY-REGISTER.md`

**Historical artifact preserved unmodified:** `MASTER-ARCHITECTURE-EVOLUTION-PROPOSAL.md` (v1.0)
