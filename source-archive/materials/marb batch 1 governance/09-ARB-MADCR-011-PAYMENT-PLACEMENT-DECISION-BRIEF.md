# 09-ARB-MADCR-011-PAYMENT-PLACEMENT-DECISION-BRIEF.md

# Decision Brief

## Decision ID
MADCR-011 (OPEN-Q2)

## Decision Title
Payment Placement / Boundary

## Current Status
OPEN — ARB REQUIRED (DRAFT ADR exists, options presented not selected)

## Decision Authority
Architecture Review Board

## Why This Decision Exists

Gate v1.3 explicitly leaves undecided whether Payment is a Commercial subdomain or a separate logical module: *"The Master BR does not decide whether Payment is: a Commercial subdomain; or a separate logical module bounded behind Commercial. The existing Commercial AEP/ADR candidates must settle this. This is architecture, not a Business Rule."*

## Canonical Evidence

- Gate v1.3 §4.2 (verbatim above)
- CAIA §29, Gate 1, item 6
- AEP-MON-001 §8–14 (full Payment Gateway architecture — provider adapter, verification, idempotency, reconciliation, refund/chargeback, beta-mode)
- AEP-MON-002 §15 (explicitly defers Payment specifics to "existing approved documents," unnamed — see `CR-05`)

## Existing Decisions Preserved

None of the M01–M13 baseline is affected either way — "M16" is not an approved module, only a candidate label.

## Business Rules

`MBR-COM-001–013` referenced, **NOT FOUND**. No Business Rule directly answers the module-placement question — consistent with Gate v1.3's own framing that this is architecture, not a business rule matter.

## AEP References

AEP-MON-001 (direct, Payment Gateway architecture detail); AEP-MON-002 (reference only, `CR-05` caveat applies).

## Existing ADR References

None in either numbering scheme.

## Architecture Impact — Existing Decision Question, Options A/B

**Option A: within M14 Commercial subdomain** (Gate v1.3 §4.2, "a Commercial subdomain")

**Option B: separate logical Payment module / M16** (Gate v1.3 §4.2, "a separate logical module bounded behind Commercial")

*No third option is invented.*

## Evaluation Dimensions (per Master Prompt §12, evidence-based only where evidence exists)

| Dimension | Option A (M14 subdomain) | Option B (separate M16) |
|---|---|---|
| Bounded context | Payment logic co-located with Subscription/Entitlement/Promotion | Payment logic isolated as its own bounded context |
| Domain ownership | M14 owns Payment data/API | New module owns Payment data/API, "bounded behind Commercial" per source wording |
| Transaction lifecycle | AEP-MON-001 §9 lifecycle applies regardless of module choice | Same |
| Provider integration | Adapter pattern (AEP-MON-001 §8) applies regardless | Same |
| Reconciliation | AEP-MON-001 §11 applies regardless | Same |
| Webhook | AEP-MON-001 §9–10 applies regardless | Same |
| Subscription/Entitlement coupling | Tighter co-location with Subscription/Entitlement (same module) | Looser coupling, explicit boundary crossing required |
| Audit | AEP-MON-001 §13 applies regardless | Same |
| Security | Feeds `MADCR-055` either way | Same |
| PCI/security implications | EVIDENCE NOT LOCATED — no source discusses compliance-scope implications of either placement | EVIDENCE NOT LOCATED |
| Future payment provider abstraction | AEP-MON-001 §16 Principle 8 (adapter-replaceable) applies regardless | Same |
| Operational ownership | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED |

**No dimension marked "EVIDENCE NOT LOCATED" is filled with speculation.**

## Dependencies

**Blocks (if resolved):** `MADCR-002` (direct), `MADCR-003, 005` (indirect), `MADCR-053, 055` (direct, jointly with `MADCR-010`).

## Consequences

Deferred to Board judgment where evidence is silent.

## Risks

`OPEN-C01`/`CR-05` affects confidence in the Payment-architecture evidentiary chain (sourced from AEP-MON-001, whose relationship to AEP-MON-002 is unconfirmed) but does not affect the module-placement question's own clarity (sourced independently from Gate v1.3). `CR-04` minor dependency-field incompleteness. `CR-06` numbering.

## Open Questions

Which option does the Board select? Should `OPEN-C01` be resolved before or alongside this decision?

## Downstream Impact

DIRECT: Payment ERD, API.

## Recommendation

**No procedural recommendation offered for the substantive choice** — both options are presented with equal evidentiary standing. **Procedural note only:** the Board may find it efficient to review `CR-05`/`OPEN-C01` (agenda item 05) immediately before this item (agenda item 07), since the Payment-architecture evidence base is shared.

## Decision

> **OPEN — ARB REQUIRED**

*(Full DRAFT ADR: `ADR-DRAFT-MADCR-011.md`, prepared in the prior cycle, unchanged — Decision field explicitly states "NOT DECIDED.")*
