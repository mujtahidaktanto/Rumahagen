# ADR-[TBD, pending CR-06 resolution — provisional reference: MADCR-011 / OPEN-Q2] — Payment Module Placement (M14 Subdomain vs Separate Module)

**Status:** DRAFT — **DECISION PENDING (options presented, not selected)**

**Decision Owner:** TBD / per RumahAgen governance (Architecture Review Board)

**Date:** 2026-08-15 (draft prepared)

---

## Context

RumahAgen's proposed Commercial domain (M14) includes Payment Gateway architecture — provider adapter abstraction, verified/idempotent fulfillment, reconciliation, refund/chargeback handling (AEP-MON-001 §8–14). The Master Business Rules Final Traceability Gate v1.3 explicitly leaves undecided whether Payment is a subdomain of Commercial or a distinct module: *"The Master BR does not decide whether Payment is: a Commercial subdomain; or a separate logical module bounded behind Commercial. The existing Commercial AEP/ADR candidates must settle this. This is architecture, not a Business Rule."* (Gate v1.3 §4.2).

## Problem Statement

Payment ERD and API design cannot proceed without knowing which module owns Payment's data and endpoints.

## Business Drivers

- Payment provider must be replaceable through an adapter boundary regardless of module placement (AEP-MON-001 §16, Principle 8).
- Payment success must not directly mutate RBAC/permissions (AEP-MON-001 §16, Principle 3).

## Canonical Inputs

- `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` §4.2 (primary)
- `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` §29 Gate 1 item 6 (corroborating)
- `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` §8–14 (Payment Gateway architecture detail)

## Business Rules

| Rule/source | Text | Status |
|---|---|---|
| `MBR-COM-001–013` | Referenced by Commercial BR Reconciliation | **NOT FOUND — SOURCE RECOVERY REQUIRED** |
| No Business Rule found directly answering the module-placement question | — | Confirms this is genuinely an architecture-only question, consistent with Gate v1.3's own framing |

## AEP Inputs

- **AEP-MON-001** §8 "Payment Gateway Architecture": *"Payment Gateway is an integration domain. The architecture should use a provider adapter abstraction... The core application must not be tightly coupled to one gateway."* — describes Payment's internal design; does not itself state whether Payment sits inside M14 or as separate M16.
- **AEP-MON-002** §15 "Billing/Payment Boundary": *"Exact payment gateway, pricing and tax behavior must be inherited from existing approved documents rather than invented by this proposal."* — explicitly defers Payment specifics without naming AEP-MON-001. **This citation chain rests on an unconfirmed relationship between AEP-MON-001 and AEP-MON-002** (`OPEN-C01`, `CR-05`) — noted, not resolved.

## Existing Architecture

M01–M13 baseline unaffected either way. No "M16" module exists in the approved baseline — it is a candidate label only, not an approved module.

## Existing ADR Dependencies

None — re-verified against both ADR numbering schemes (`CR-06`); no existing ADR addresses Payment module placement.

## Decision Drivers

- Must satisfy AEP-MON-001 §16 Principle 8 (adapter-replaceable) regardless of chosen module.
- If Option [b] (separate module) is chosen, this would introduce a module beyond the existing M01–M13 approved baseline — no source discusses this specific cost/benefit.

## Options Considered

**Option [a]** (Gate v1.3 §4.2, verbatim): "a Commercial subdomain"

**Option [b]** (Gate v1.3 §4.2, verbatim): "a separate logical module bounded behind Commercial"

No consequence analysis for either option exists in any authoritative source.

## Decision

**NOT DECIDED.** This ADR intentionally does not select between Option [a] and Option [b]. Per RumahAgen's standing governance rule, `OPEN-Q2` must not be resolved by an AI-assisted drafting process — it requires explicit Architecture Review Board deliberation.

## Non-Goals

This ADR does not decide `MADCR-002/003` (Payment adapter/verification architecture, which depend on this decision), `MADCR-055` (Commercial admin permissions, which also depends on this decision plus `OPEN-Q1`), the actual Payment Gateway vendor (`MADCR-058`, a separate research task), or any ERD/schema design.

## Consequences

**Cannot be assessed until an option is selected.** Selecting Option [a] would keep Payment data/API surfaces inside M14. Selecting Option [b] would introduce a 14th+ module (M16). **Neither consequence path is evaluated further here.**

## Security / RBAC / RLS Impact

INDIRECT — feeds `MADCR-055` (Commercial administration permissions), which depends on this decision plus `MADCR-010` and `MADCR-053`.

## Data Model Impact

CRITICAL — determines schema ownership for Payment transaction records.

## API Impact

DIRECT — determines API surface owner/routing.

## PRD / UX Impact

INDIRECT — standard downstream chain.

## Migration Impact

None yet — no Payment migration exists.

## Operational Impact

Not assessed — no source addresses this.

## Observability Impact

Not assessed — no source addresses this.

## Dependencies

**Depends on:** None (zero Category-A prerequisite).
**Blocks (per MADCR v1.1, cross-checked against dependents' own formal fields):** `MADCR-002` (direct — `002`'s own `Depends On` field correctly lists `011`), `MADCR-003, 005` (indirect, via `002`), `MADCR-053, 055` (direct — both dependents' own formal fields correctly list `011`).
**Dependency-field discrepancy (`CR-04`):** this candidate's own free-text field is incomplete — it names only `002,003` and omits `053,055`, even though both of the latter correctly cite `011` in their own formal fields. Recorded, not resolved.

## Risks

- `OPEN-C01` (`CR-05`): the primary evidentiary basis for Payment's *internal* architecture (AEP-MON-001 §8–14) rests on an unconfirmed relationship to AEP-MON-002. Does not affect the module-placement question's own clarity (sourced independently from Gate v1.3), but should be disclosed to the Board.
- `CR-06` (dual ADR numbering) applies to this draft's eventual number.

## Open Questions

1. Which option ([a] or [b]) does the Architecture Review Board select?
2. Should `OPEN-C01` (AEP-MON-001 vs AEP-MON-002 relationship) be clarified before or alongside this decision?
3. `CR-04` — should `MADCR-011`'s free-text `Blocks` field be corrected to include `053,055`?

## Traceability

AEP-MON-001 §8–16 → CAIA §29 Gate1.6 → Gate v1.3 §4.2 (`OPEN-Q2`) → MADCR-011 → this draft ADR.

## Evidence

See `ADR-BATCH-1-EVIDENCE-PACK-MADCR-011.md` for the complete evidence pack (5 items, 3 HIGH / 2 MEDIUM confidence).

## Approval Requirements

1. Architecture Review Board selects Option [a], Option [b], or an explicitly-justified third option.
2. Selected option's consistency with AEP-MON-001 §16 Principle 8 is confirmed.
3. `OPEN-C01` is at minimum acknowledged in this ADR's evidence trail (done, this draft) — full resolution recommended before final approval, not strictly required to open Board deliberation.
4. Downstream Payment ERD/API authors notified once decision closes.

**This ADR remains DRAFT, with NO OPTION SELECTED, until the Architecture Review Board formally decides. No implementation, ERD, API, or RBAC work is authorized by this draft.**
