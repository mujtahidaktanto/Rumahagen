# 08-ARB-MADCR-010-ENTITLEMENT-QUOTA-DECISION-BRIEF.md

# Decision Brief

## Decision ID
MADCR-010 (OPEN-Q1)

## Decision Title
Commercial Entitlement vs Organization Quota Authority

## Current Status
OPEN — ARB REQUIRED (DRAFT ADR exists, options presented not selected)

## Decision Authority
Architecture Review Board

## Why This Decision Exists

M14 Commercial and M12 Organization both have quota-adjacent concepts. The Master BR Final Traceability Gate v1.3 explicitly states: *"The identity question is resolved, but the architecture still needs to decide whether: A. Commercial Entitlement is the source of Agency/Organization quota capacity, with the operational quota pool consuming that entitlement; or B. the existing Organization quota model is itself the authoritative commercial entitlement representation. This must be resolved before ERD."*

## Canonical Evidence

- Gate v1.3 §4.1 (verbatim above)
- CAIA §29, Gate 1, item 5: "Commercial Entitlement vs existing Organization quota concepts"
- AEP-MON-001 §5 "Quota Architecture" (Agency Pro Quota → Pool → Member allocation structure, does not itself resolve the authority question)
- `MBR-COM-X03` (Gate v1.3 §3): quota allocation ≠ usage invariant, applies regardless of which option is chosen

## Existing Decisions Preserved

Agency = Organization identity question is **already resolved** (Gate v1.3 §2) and is NOT reopened by this brief — only the *technical model* for how Commercial Entitlement relates to that single Agency/Organization's quota remains open.

## Business Rules

Legacy BR §3/§6 (allocation≠consumption, general principle, LOCKED); `MBR-COM-X03` (quota-allocation-vs-usage invariant, PROPOSED/CRITICAL); `MBR-COM-001–013` referenced but **NOT FOUND** (source recovery required, does not block this decision per Gate v1.3's own sufficiency as authority).

## AEP References

AEP-MON-001 §5, §18 (`ADR-MON-009`, a related-but-narrower sub-question about allocation vs usage specifically, not the entitlement-authority question itself).

## Existing ADR References

None in either numbering scheme.

## Architecture Impact — Minimum Options From Evidence

**Option A** (Gate v1.3 §4.1, verbatim): *"Commercial Entitlement is authoritative for organization quota enforcement"* (paraphrased per Master Prompt §11 framing; original: "Commercial Entitlement is the source of Agency/Organization quota capacity, with the operational quota pool consuming that entitlement")

**Option B** (Gate v1.3 §4.1, verbatim): *"Organization quota is authoritative, with entitlement as commercial capability definition"* (paraphrased per Master Prompt §11 framing; original: "the existing Organization quota model is itself the authoritative commercial entitlement representation")

*No third option is invented — these are the only two found in source.*

## For Each Option — Consequence Dimensions (per Master Prompt §11, evidence-based only where evidence exists)

| Dimension | Option A | Option B |
|---|---|---|
| Business consequence | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED |
| Architecture consequence | M14 becomes source-of-truth for quota capacity; M12 reflects/consumes it | M12 remains source-of-truth; M14 Entitlement (if modeled) would reference/derive from M12 |
| Organization impact | M12 quota tables would consume from M14 | M12 quota tables remain authoritative, unchanged in role |
| Subscription impact | Consistent with AEP-MON-001 §4 principle "Subscription ≠ Entitlement" either way | Same |
| Quota impact | Quota becomes a derived/consumption concept under Commercial | Quota remains the primary concept; Entitlement becomes descriptive |
| Entitlement impact | Entitlement is the primary, authoritative concept | Entitlement is secondary/definitional only |
| Upgrade/downgrade impact | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED |
| Future billing impact | EVIDENCE NOT LOCATED | EVIDENCE NOT LOCATED |
| Audit impact | Must satisfy `MBR-COM-X03`'s auditability requirement either way | Same |
| Security impact | Feeds `MADCR-055` (Commercial admin permissions) either way | Same |
| Implementation impact | Not yet assessed — 0% implementation exists for either | Same |

**No consequence dimension marked "EVIDENCE NOT LOCATED" is filled with speculation.**

## Dependencies

**Blocks (if resolved):** `MADCR-009` (direct), `MADCR-048, 054, 056, 057` (indirect via `MADCR-053`), `MADCR-055` (direct, jointly with `MADCR-011`).

## Consequences

See table above — deferred to Board judgment where evidence is silent.

## Risks

`MBR-COM-001–013` non-recovery limits independent verification; `CR-06` numbering; `CR-03` minor dependency-field discrepancy (this candidate's field over-claims a link to `MADCR-002`).

## Open Questions

Which option does the Board select? Does recovered `MBR-COM` content (if ever found) affect either option's viability?

## Downstream Impact

DIRECT: M14 ERD, M12 quota-table ERD — explicitly gated by Gate v1.3 itself ("must be resolved before ERD").

## Recommendation

**No procedural recommendation offered for this item** — unlike the sequencing/numbering items, this is a substantive architecture question where the Master Prompt explicitly prohibits any AI-assisted leaning. Both options are presented with equal evidentiary standing; the Board's deliberation is the only path forward.

## Decision

> **OPEN — ARB REQUIRED**

*(Full DRAFT ADR: `ADR-DRAFT-MADCR-010.md`, prepared in the prior cycle, unchanged — Decision field explicitly states "NOT DECIDED.")*
