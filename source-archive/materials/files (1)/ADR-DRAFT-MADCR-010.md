# ADR-[TBD, pending CR-06 resolution — provisional reference: MADCR-010 / OPEN-Q1] — Commercial Entitlement vs Organization Quota Authority

**Status:** DRAFT — **DECISION PENDING (options presented, not selected)**

**Decision Owner:** TBD / per RumahAgen governance (Architecture Review Board)

**Date:** 2026-08-15 (draft prepared)

---

## Context

RumahAgen's proposed Commercial domain (M14) introduces an Entitlement concept (governing what a subscriber is allowed to use, per AEP-MON-001 §4: "Entitlement represents what the customer is actually allowed to use"). The existing, approved M12 Organization module already has its own quota concepts (Agency Pro quota allocation by Lead, member allocation, pool return, per AEP-MON-001 §5 and legacy BR-001–151 §3/§6). The Master Business Rules Final Traceability Gate v1.3 explicitly identifies the relationship between these two as unresolved: *"The identity question is resolved, but the architecture still needs to decide whether: A. Commercial Entitlement is the source of Agency/Organization quota capacity, with the operational quota pool consuming that entitlement; or B. the existing Organization quota model is itself the authoritative commercial entitlement representation."* (Gate v1.3 §4.1).

## Problem Statement

M14 ERD and M12 quota-adjacent table design cannot proceed without knowing which model is authoritative — Gate v1.3 explicitly states *"This must be resolved before ERD."*

## Business Drivers

- Agency quota allocation must not delete existing listings when allocation is reduced (AEP-MON-001 §16, Principle 12; legacy BR).
- Allocation and usage history must remain auditable (Gate v1.3 §3, `MBR-COM-X03`).
- Returned allocation follows the approved Agency/Organization pool policy (Gate v1.3 §3).

## Canonical Inputs

- `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx` §4.1 (primary)
- `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` §29 Gate 1 item 5 (corroborating)
- `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` §5, §18 `ADR-MON-009` (related context)

## Business Rules

| Rule/source | Text | Status |
|---|---|---|
| Legacy BR §3, §6 | General allocation≠ownership/consumption principle | LOCKED |
| `MBR-COM-X03` (Gate v1.3 §3) | "quota allocation ≠ actual usage; reducing allocation below existing usage does not delete existing listings solely because of the reduction; new listing/resource creation may be blocked when available allocation is insufficient; returned allocation follows the approved Agency/Organization pool policy; allocation and usage history must remain auditable. The exact technical model remains an ADR/ERD concern." | PROPOSED, CRITICAL |
| `MBR-COM-001–013` | Referenced by Commercial BR Reconciliation, Master BR v1.2 | **NOT FOUND — SOURCE RECOVERY REQUIRED** |

## AEP Inputs

- AEP-MON-001 §5 "Quota Architecture" — describes Agency Pro Quota → Agency Pool → Member allocation structure, but does not itself resolve the Entitlement-authority question.
- AEP-MON-001 §18, `ADR-MON-009` — "Model Agency quota allocation separately from actual listing usage" — a related but narrower/distinct sub-question (allocation-vs-usage, not entitlement-vs-quota-model-authority).

## Existing Architecture

M12 Organization (existing, approved) — its quota concept is directly implicated. M14 Commercial (proposed, not yet existing).

## Existing ADR Dependencies

None — re-verified against both `architecture-decision-records-FINAL-v1.1-plus-ADR029.md` and `decision-log-FINAL.md` (47 entries); no existing ADR in either scheme addresses this question.

## Decision Drivers

- Must remain consistent with existing Organization/Agency quota business rules (BR-001–151 §3, §6).
- Must remain consistent with Commercial architecture principles (AEP-MON-001 §16: "Subscription ≠ Entitlement").
- Must enable, not contradict, `MBR-COM-X03`'s allocation≠usage invariant regardless of which option is chosen.

## Options Considered

**Option A** (Gate v1.3 §4.1, verbatim): *"Commercial Entitlement is the source of Agency/Organization quota capacity, with the operational quota pool consuming that entitlement."*

**Option B** (Gate v1.3 §4.1, verbatim): *"the existing Organization quota model is itself the authoritative commercial entitlement representation."*

No consequence analysis for either option exists in any authoritative source (Gate v1.3 states the two options and immediately defers resolution without evaluating trade-offs).

## Decision

**NOT DECIDED.** This ADR intentionally does not select between Option A and Option B. Per RumahAgen's standing governance rule (carried through MAEP v1.1, MADCR v1.1, and every intermediate governance artifact in this chain), `OPEN-Q1` must not be resolved by an AI-assisted drafting process — it requires explicit Architecture Review Board deliberation and decision.

## Non-Goals

This ADR does not decide `MADCR-009` (quota allocation vs usage technical model, which depends on this decision), `MADCR-053/055` (permission taxonomy / Commercial admin permissions, which also depend on this decision), or any ERD/schema design.

## Consequences

**Cannot be assessed until an option is selected.** Selecting Option A would make Commercial Entitlement the M14-owned source of truth, with M12 Organization consuming/reflecting it. Selecting Option B would make the existing M12 Organization quota model authoritative, with Commercial Entitlement (if modeled at all) deferring to it. **Neither consequence path is evaluated further here** — this is explicitly deferred to the Board's own deliberation, informed by this evidence pack.

## Security / RBAC / RLS Impact

INDIRECT — feeds `MADCR-055` (Commercial administration permissions), which depends on this decision plus `OPEN-Q2` and `MADCR-053`.

## Data Model Impact

CRITICAL — Gate v1.3 explicitly ties this to ERD authorization for M14 and M12 quota-adjacent tables.

## API Impact

INDIRECT — standard downstream chain, no direct source statement.

## PRD / UX Impact

INDIRECT — standard downstream chain.

## Migration Impact

None yet — no M14/M12-quota migration exists; this ADR (even once approved) does not itself authorize one.

## Operational Impact

Not assessed — no source addresses this.

## Observability Impact

Not assessed — no source addresses this.

## Dependencies

**Depends on:** None (zero Category-A prerequisite).
**Blocks (per MADCR v1.1):** `MADCR-009` (direct), `MADCR-048, 054, 056, 057` (indirect, via `MADCR-053`), `MADCR-055` (direct).
**Dependency-field discrepancy (`CR-03`):** this candidate's free-text field claims to block `MADCR-002`, unmirrored in `002`'s own formal field — recorded, not resolved.

## Risks

- Deciding without full `MBR-COM-001–013` recovery risks missing an already-locked business constraint on this exact question — mitigated by the fact that Gate v1.3 (Level 4-equivalent) already frames both options in a manner consistent with everything else that IS found in the located Business Rule corpus.
- `CR-06` (dual ADR numbering) applies to this draft's eventual number.

## Open Questions

1. Which option (A or B) does the Architecture Review Board select?
2. Does `MBR-COM-001–013`, if recovered, materially affect either option's viability?
3. `CR-03` — is there a genuine secondary dependency of `MADCR-002` on this decision?

## Traceability

Legacy BR §3/§6, `MBR-COM-X03` → AEP-MON-001 §5/§18 → CAIA §29 Gate1.5 → Gate v1.3 §4.1 (`OPEN-Q1`) → MADCR-010 → this draft ADR.

## Evidence

See `ADR-BATCH-1-EVIDENCE-PACK-MADCR-010.md` for the complete evidence pack (5 items, 4 HIGH / 1 MEDIUM confidence).

## Approval Requirements

1. Architecture Review Board selects Option A, Option B, or an explicitly-justified third option not currently in the source record.
2. Selected option's consistency with BR-001–151 §3/§6 is confirmed.
3. `CR-03` dependency-field discrepancy is acknowledged or reconciled.
4. Downstream M14/M12 ERD authors notified once decision closes.

**This ADR remains DRAFT, with NO OPTION SELECTED, until the Architecture Review Board formally decides. No implementation, ERD, API, or RBAC work is authorized by this draft.**
