# COMMERCIAL AEP RECONCILIATION v1.0
## RUMAHAGEN — Workstream A

**Status:** GOVERNANCE RECONCILIATION ARTIFACT — NO DECISION MADE
**Scope:** `AEP-MON-001` vs `AEP-MON-002` only, per Master Prompt §5.

---

# A.1 EXTRACT — AEP-MON-001

| Field | Value |
|---|---|
| Document path | `/mnt/user-data/uploads/AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` |
| Title | "ARCHITECTURE EVOLUTION PROPOSAL — Monetization, Subscription, Promotion & Payment Gateway — RumahAgen" |
| Version | 1.0 |
| Status (self-declared) | Proposed |
| Stated scope | Monetization, Subscription, Promotion, Quota/Add-on, Payment Gateway (§header) |
| Domain | Commercial (full domain, including Payment Gateway integration) |
| Entities (conceptual, not literal ERD) | Plans, Add-ons, Promotions, Order/Checkout, Payment Transaction, Subscription, Add-on Purchase, Entitlement, Quota/Usage (§3 diagram) |
| Business capabilities | Free/Pro subscription (personal + Agency), Agency Pro quota allocation by Lead, permanent/promotional add-ons, one-time initial Free bonus, payment-ready-inactive-beta, provider-independent payment, verified webhook/idempotency/reconciliation/audit/refund/chargeback, price/promo snapshot (§1) |
| Dependencies (self-declared) | "Basis: Previously approved RumahAgen business-rule decisions" (§header) — not itemized by BR ID |
| Referenced Business Rules | Generic reference only, no specific BR-IDs cited |
| Referenced ADR | None existing cited; proposes 9 new candidates: `ADR-MON-001`–`009` (§18) |
| Referenced ERD | None (explicitly pre-ERD; §21 "Next Gate: Current Architecture Impact Analysis...") |
| Referenced API | None (pre-API) |
| Referenced RBAC | Conceptual only — "Payment must not directly mutate RBAC" (§3), "RBAC → Authorization" kept separate (§4 diagram); no specific permission IDs |
| Implementation assumptions | Explicitly disclaimed: "This AEP should be treated as the architectural translation of the approved commercial rules, not as permission to implement" (§21) |
| Downstream order specified | System Architecture → ADR → Commercial Domain Model → ERD → Schema → Payment Integration Contract → API → RBAC → User Flow → PRD → Engineering Guidebook → Test/Traceability Matrix (§19) |
| Unique content vs AEP-MON-002 | Full Payment Gateway architecture: Provider Adapter pattern (§8), Payment Lifecycle (§9), Idempotency (§10), Reconciliation (§11), Refund/Chargeback (§12), Audit fields (§13), Beta Mode (§14) |

---

# A.2 EXTRACT — AEP-MON-002

| Field | Value |
|---|---|
| Document path | `/mnt/user-data/uploads/RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` |
| Title (body text, line 3) | "*Monetization, Subscription & Promotion Architecture Alignment v1.0*" — **note: body title text says "v1.0", while the document metadata table (line 8) and the filename both say "v1.1"** — internal title/version inconsistency, evidence-recorded, not resolved (see B-01 discrepancy below) |
| Version (metadata table) | 1.1 |
| Status (self-declared) | "Revised — Configuration Model Clarified" |
| Business Logic Reference | "Business Rules Baseline v1.0 — BR-001–BR-151" (explicit, unlike AEP-MON-001) |
| Primary Scope (self-declared) | "Monetization, Subscription, Promotion, Entitlement, Agency Lifecycle" |
| Target Tool (self-declared) | "Claude — document/architecture synchronization" |
| Important Constraint (self-declared) | "Do not invent pricing, product tiers, or commercial values not explicitly defined in source documents" |
| Domain | Commercial — narrower, BR-001–151-operational-alignment focus |
| Stated Source-of-Truth Hierarchy (§2, self-declared, 4 levels) | 1) BR-001–151 (normative) → 2) Existing ADR/System Architecture/Tech Decision → 3) Existing PRD/ERD/Schema/API/Permission Matrix/User Flow/SEO → 4) This AEP itself. **`AEP-MON-001` is not mentioned anywhere in this hierarchy.** |
| Business capabilities | Free↔Pro transition mechanics, add-on permanence/promo-validity, one-time Free-bonus-of-20 grant persistence, promotion expiry/automatic-transfer-evaluation, Agency-closure monetization impact, Free/Pro/Add-on Decision Matrix, listing/monetization interaction (§4–11) |
| Dependencies (self-declared) | BR-001–151 (explicit, primary); existing ADR/System Architecture/Technology Decision documents (§2) |
| Referenced Business Rules | **Explicit**: BR-001–151 named directly and repeatedly |
| Referenced ADR | None existing cited by number; §18 lists "Architecture Decisions Claude Must Validate Against Existing Documents" (9 verification questions, not new ADR proposals in the `ADR-MON-*` numbering style) |
| Referenced ERD | Impact-only — "Required Domain/Data Model Evolution" (§12), no ERD content itself |
| Referenced API | Impact-only — "API/Service Architecture Evolution" (§13) |
| Referenced RBAC | Impact-only — "Permission/RBAC Impact" (§14) |
| Payment Gateway coverage | **Narrow** — §15 "Billing/Payment Boundary" states only that payment status must be separated from entitlement status, and explicitly defers: *"Exact payment gateway, pricing and tax behavior must be inherited from existing approved documents rather than invented by this proposal"* (line 351–352) — **does not name which document**, consistent with never citing `AEP-MON-001` |
| Implementation assumptions | Explicitly disclaimed twice: "This proposal does not supersede Business Rules Baseline v1.0" (§"Baseline relationship", appears twice, lines 541 and 616) |
| Downstream order specified | Similar 13-item list (§19), includes "SEO where subscription/public Agency state affects indexed pages" — a downstream artifact not mentioned by AEP-MON-001 |
| Unique content vs AEP-MON-001 | BR-001–151-specific operational mechanics: promotion-expiry-triggers-automatic-transfer (§8), Agency-closure monetization impact incl. promo forfeiture (§9–10), Free/Pro/Add-on Decision Matrix (§11), explicit Configuration-vs-Invariant classification table incl. OTP retry limits as Business/Security Invariants (§23), explicit "Claude Execution Instructions" operational directive (§20) |

---

# A.3 COMMERCIAL AEP COMPARISON MATRIX

| Dimension | AEP-MON-001 | AEP-MON-002 | Overlap | Difference | Conflict | Evidence | Governance Impact |
|---|---|---|---|---|---|---|---|
| Subscription (Free/Pro) | Full model, §2.3, §7 | Full model, §4–5 | **Yes** — both describe Free↔Pro, one-time Free bonus, non-reset on downgrade | AEP-MON-002 adds explicit "durable marker/entitlement record" persistence requirement (§7) not stated as explicitly in AEP-MON-001 | **No conflict** — same business direction, AEP-MON-002 more operationally specific | Both docs §2.1/§4 (MON-001) vs §4/§7 (MON-002) | Low — content is additive/refining, not contradictory |
| Entitlement | Conceptual separation from Subscription/RBAC, §4 | Conceptual separation, plus explicit ownership/context-carrying requirement, §6 | **Yes** | AEP-MON-002 adds Agency-vs-Personal entitlement-ownership detail (§6) not present in AEP-MON-001 | No conflict | §4 (MON-001) vs §6 (MON-002) | Low |
| Add-on (permanent vs promotional) | Stated, §2.2, §6 | Stated with more mechanics (allocation≠ownership, unallocated-on-closure, Lead-cannot-reclaim), §6 | **Yes** | AEP-MON-002 is materially more detailed on ownership-transfer edge cases | No conflict | §2.2/§6 (MON-001) vs §6 (MON-002) | Low |
| Promotion | Policy layer, snapshot requirement, §6 | Policy layer, plus explicit expiry→automatic-transfer-evaluation mechanic tied to Listing rules, §8 | **Yes** | AEP-MON-002's promotion-expiry-triggers-listing-transfer mechanic is **not present at all** in AEP-MON-001 | No direct conflict — AEP-MON-001 simply doesn't address this cross-domain (Commercial↔Listing) mechanic | §6 (MON-001) vs §8 (MON-002) | **Medium** — this is a genuine scope gap, not a contradiction; AEP-MON-002 covers ground AEP-MON-001 never touches |
| Order/Checkout | Explicit domain object, §3 diagram | Not modeled as a distinct object; folded into general "purchase"/"grant" language | Partial | AEP-MON-001 is structurally explicit here; AEP-MON-002 is silent | No conflict (absence, not contradiction) | §3 (MON-001) | Low |
| Payment Gateway architecture (adapter, verification, idempotency, reconciliation, refund/chargeback) | **Extensive** — §8–13, the single largest block of the document | **Minimal** — §15 only, explicitly defers detail to "existing approved documents" (unnamed) | **Minimal overlap** | AEP-MON-001's unique responsibility — this is its core distinguishing content | No conflict — AEP-MON-002 explicitly does not compete on this ground | §8–13 (MON-001) vs §15 (MON-002) | **Low** — no contradiction, clean division of labor if the "existing approved documents" reference is read as pointing to AEP-MON-001 (unverified — see A.4) |
| Free Bonus grant model | "Configurable commercial parameter... currently approved behavior: granted once..." (§2.1) — frames as **already-approved behavior** | "Configurable activation grant... default value may be 20... classification: CONFIGURABLE COMMERCIAL PARAMETER" plus **"Locked Business Direction"** heading (§4) and a dedicated Configuration-vs-Invariant table (§23) | **Yes, same substance** | AEP-MON-001 lists it as ADR candidate `ADR-MON-002` ("Model Free Bonus as a grant with historical eligibility") — an open architecture question. AEP-MON-002 treats the *business direction* as already "Locked" and only the *configuration mechanism* as needing architecture work | **Potential terminology conflict** — is this a Locked Business Rule or an open ADR candidate? | §18 `ADR-MON-002` (MON-001) vs §4/§23 (MON-002) | **Medium** — this is DISC-05 / C-05, carried forward unresolved from MAEP v1.0 |
| Add-on validity model | Listed as ADR candidate `ADR-MON-003` | Treated as "Locked Business Direction" (§4) | Same substance | Same pattern as Free Bonus row | Same potential conflict | §18 (MON-001) vs §4 (MON-002) | Medium — same DISC-05 pattern |
| Quota allocation vs usage | Listed as ADR candidate `ADR-MON-009` | Not directly addressed — AEP-MON-002 focuses on listing/promo mechanics, not Agency-Pro-member-quota-pool allocation | Minimal | AEP-MON-001's unique territory | No conflict (absence) | §18 (MON-001) | Low |
| Agency Closure monetization impact | Not addressed | Extensively addressed — promo forfeiture, add-on ownership resolution on closure (§9–10) | Minimal | AEP-MON-002's unique territory | No conflict (absence) | §9–10 (MON-002) | Low |
| Idempotency | Payment-specific (§10) | Broad — applied to subscription, entitlement, promotion-expiry-evaluation, listing-transfer, membership-termination, closure (§17) | **Yes**, broader scope in MON-002 | AEP-MON-002 generalizes the idempotency principle beyond payment | No conflict — compatible generalization | §10 (MON-001) vs §17 (MON-002) | Low |

---

# A.4 CONFLICT CLASSIFICATION

| Item | Classification |
|---|---|
| Subscription/Entitlement/Add-on core model | **NO CONFLICT** — same direction, MON-002 more operationally detailed |
| Payment Gateway architecture division of labor | **OVERLAP → COMPLEMENTARY (unverified)** — MON-002's "inherit from existing approved documents" (§15) plausibly refers to MON-001, but **this is not explicitly stated anywhere in either document** |
| Free Bonus / Add-on validity: "ADR candidate" vs "Locked Business Direction" framing | **POTENTIAL CONFLICT** — terminology/authority mismatch, not a substantive business-direction conflict (both agree on the *outcome*: one-time grant, no reset, permanent add-on survives downgrade) |
| Promotion-expiry-triggers-listing-transfer mechanic | **NO CONFLICT** — MON-001 is simply silent on this; MON-002 fills a genuine gap |
| Document relationship (which supersedes, which is primary) | **UNKNOWN** — neither document names or references the other anywhere in either document's full text |

---

# A.5 RELATIONSHIP STATUS DETERMINATION

**Status: COMPLEMENTARY (working hypothesis, NOT CONFIRMED) — RECONCILIATION REQUIRED for the terminology/authority mismatch specifically.**

Evidence supporting COMPLEMENTARY: zero substantive business-direction contradiction found across 11 compared dimensions (A.3); each document's unique content (MON-001: Payment Gateway depth; MON-002: BR-001–151 operational mechanics, esp. promotion↔listing interaction) fills a gap the other leaves open; MON-002 explicitly defers payment-gateway specifics to an unnamed "existing approved document," consistent with (but not proof of) MON-001 being that document.

Evidence preventing a stronger conclusion: **no explicit supersession statement exists in either document.** Per Master Prompt §5.6, this precludes marking either as "SUPERSEDING." The Free-Bonus/Add-on "ADR candidate vs Locked Business Direction" terminology mismatch is a genuine, unresolved authority-framing question — not decided here.

**Per Master Prompt §5.6: since no explicit supersession exists, this is NOT marked SUPERSEDED, POTENTIALLY SUPERSEDING, or CONFLICTING. It is marked OVERLAPPING / COMPLEMENTARY, with one open terminology-authority question flagged as RECONCILIATION REQUIRED.**

---

# A.6 COMMERCIAL AEP RECONCILIATION RESULT

**Final status: GOVERNANCE RECONCILIATION REQUIRED.**

(Not CLEARED — the terminology mismatch is unresolved. Not ADR REQUIRED — no architecture-content decision is blocked by this specific finding; `MADCR-001`–`013` can proceed to ADR drafting informed by both documents jointly, per MAEP v1.1 §14.1. Not BUSINESS DECISION REQUIRED as the *primary* classification, though the underlying question has a business-direction component. Not SOURCE GAP — both source documents were fully located and read. Not BLOCKED — nothing downstream is prevented by leaving this open.)

**The question, stated neutrally, not answered:**

> *"What is the intended relationship between `AEP-MON-001` (broad Commercial/Payment domain model) and `AEP-MON-002` (narrower BR-001–151 operational alignment) — are they two complementary layers of one Commercial architecture, or does one take precedence over the other where their treatment of the Free Bonus/Add-on model as 'ADR candidate' vs 'Locked Business Direction' differs?"*

**This is `OPEN-C01` / `MADCR-012`, unchanged, carried forward — not answered by this reconciliation.**

---

# A.7 NEW DISCREPANCY SURFACED DURING THIS WORKSTREAM

| ID | Finding | Evidence | Severity |
|---|---|---|---|
| B-01 | `AEP-MON-002`'s own body title text reads "v1.0" (line 3: *"Monetization, Subscription & Promotion Architecture Alignment v1.0"*) while its metadata table (line 8) and filename both say "v1.1" | `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx`, title line vs metadata table | LOW — cosmetic, does not affect content interpretation, but is a genuine internal document inconsistency worth recording |
