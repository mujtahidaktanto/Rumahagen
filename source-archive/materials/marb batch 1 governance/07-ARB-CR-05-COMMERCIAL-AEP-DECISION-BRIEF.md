# 07-ARB-CR-05-COMMERCIAL-AEP-DECISION-BRIEF.md

# Decision Brief

## Decision ID
CR-05 / OPEN-C01

## Decision Title
Commercial AEP Relationship — AEP-MON-001 vs AEP-MON-002

## Current Status
OPEN-C01 — ARB / BUSINESS AUTHORITY REQUIRED

## Decision Authority
Business Owner (intent clarification) → Architecture Review Board (formal governance recording)

## Why This Decision Exists

Two AEP documents address RumahAgen's Commercial/Monetization domain with overlapping-but-not-identical scope and no explicit statement of their relationship. This affects the evidentiary confidence behind `MADCR-011` (which draws primarily on AEP-MON-001's Payment Gateway content) and, more generally, the interpretive basis for the entire Commercial ADR cluster.

## Canonical Evidence — Full 11-Dimension Comparison Summary

(Full detail: `COMMERCIAL-AEP-RECONCILIATION-v1.0.md`, prepared in the Pre-ADR Governance Reconciliation cycle.)

| Dimension | AEP-MON-001 | AEP-MON-002 | Overlap/Conflict |
|---|---|---|---|
| Subscription (Free/Pro) | Full model | Full model, more operationally detailed | Overlap, no conflict |
| Entitlement | Conceptual separation | Adds ownership/context detail | Overlap, no conflict |
| Add-on (permanent/promotional) | Stated | More detailed (allocation≠ownership edge cases) | Overlap, no conflict |
| Promotion | Policy layer, snapshot | Adds expiry→listing-transfer mechanic | AEP-MON-001 silent here — gap, not conflict |
| Payment Gateway architecture | **Extensive** (§8–13) | **Minimal** (§15 only), explicitly defers "to existing approved documents" without naming AEP-MON-001 | No conflict; clean division of labor **if** the unnamed reference is AEP-MON-001 (unconfirmed) |
| Free Bonus grant model | Framed as ADR candidate (`ADR-MON-002`) | Framed as "Locked Business Direction" | **Terminology/authority mismatch** (`DISC-05`) |
| Add-on validity model | Framed as ADR candidate (`ADR-MON-003`) | Framed as "Locked Business Direction" | Same mismatch pattern |
| Quota allocation vs usage | Framed as ADR candidate (`ADR-MON-009`) | Not directly addressed | No conflict (absence) |
| Agency Closure monetization impact | Not addressed | Extensively addressed | No conflict (AEP-MON-002's unique territory) |
| Idempotency | Payment-specific | Generalized to subscription/entitlement/promotion/listing/membership/closure | No conflict, compatible generalization |
| Document relationship itself | Neither names the other anywhere in either full text | — | **UNKNOWN — this is the core unresolved question** |

## Commercial Implications

Both documents agree on the substantive business direction for subscription/entitlement/add-on mechanics — no conflict found there.

## Entitlement Implications

No conflict — both treat Entitlement as distinct from Subscription and RBAC.

## Quota Implications

No conflict — AEP-MON-001 addresses Agency-Pro-quota-pool mechanics; AEP-MON-002 does not address this area, creating no contradiction.

## Subscription Implications

No conflict, as above.

## Free Bonus Implications

**This is the one substantive framing difference** — whether the Free Bonus grant model is an open ADR candidate (per AEP-MON-001) or an already-Locked Business Direction (per AEP-MON-002) requiring only technical realization.

## Downstream ADR Implications

Affects `MADCR-006` (add-on validity realization) and `MADCR-007` (Free Bonus realization) most directly — both were classified in prior cycles as "business rule already locked, only technical realization open," an interpretation that leans on AEP-MON-002's framing. Also affects `MADCR-011`'s evidentiary chain (Payment Gateway content sourced from AEP-MON-001).

## Existing Decisions

Neither document is confirmed superseded. No authoritative evidence states one replaces the other.

## Business Rules

BR-001–151 is explicitly the "normative business logic" source for AEP-MON-002 (§2, Source-of-Truth Hierarchy) — AEP-MON-001 does not cite this hierarchy explicitly, instead citing "previously approved RumahAgen business-rule decisions" generically.

## AEP References

Both documents are the subject of this brief.

## Existing ADR References

Neither document maps to an existing ADR in either numbering scheme.

## Architecture Impact

If the two are complementary (working hypothesis, unconfirmed), the Commercial architecture can proceed using both as joint input. If one should take precedence where they differ (the Free Bonus/add-on framing question), that precedence needs explicit Board or Business Owner determination.

## Dependencies

Affects confidence in `MADCR-006, 007, 011` specifically; does not block their drafting (already completed as DRAFT ADRs in the prior cycle).

## Options

This brief does not present "options" in the architecture-choice sense (per Master Prompt §10, the goal is determining overlap/complementary/conflict status, not selecting a technical option). The determination itself has three possible outcomes, none selected here:

1. **COMPLEMENTARY** — both remain valid, jointly-informing inputs (the working hypothesis from the Pre-ADR Reconciliation cycle, based on zero found substantive contradiction).
2. **ONE TAKES PRECEDENCE** — for the specific Free Bonus/add-on framing question, Business Owner determines whether "ADR candidate" or "Locked Business Direction" framing governs.
3. **REQUIRES FURTHER SOURCE REVIEW** — if the Business Owner's original intent when commissioning AEP-MON-002 (which appears to have been produced as a "Claude execution instruction" document per its own §"Target Tool" field) was to fully supersede AEP-MON-001, this has never been stated and should be confirmed directly with whoever commissioned it.

## Consequences

Not assessed further — deferred to Business Owner/Board.

## Risks

If left unresolved indefinitely, future ADR drafting for the remaining Commercial cluster (`MADCR-002,003,005,009`) risks inconsistent citation practice.

## Open Questions

1. Was AEP-MON-002 intended to supersede AEP-MON-001, or to complement it?
2. Does the Free Bonus/add-on "ADR candidate vs Locked Business Direction" distinction reflect a deliberate business decision, or an artifact of the two documents being produced at different times/purposes?

## Downstream Impact

Affects evidentiary confidence for `MADCR-006, 007, 011`; does not block Batch-1 completion.

## Recommendation

**Procedural recommendation only:** Business Owner clarification is the most direct path to closing this item, since it concerns original intent behind commissioning two overlapping documents — an architecture-only review cannot resolve authorial intent. **This is a routing suggestion, not a determination.**

## Decision

> **OPEN-C01 — ARB / BUSINESS AUTHORITY REQUIRED**
