# 15-ARB-BATCH-1-DECISION-GRAPH.md
## RUMAHAGEN — Decision Dependency Graph (text form)

```text
CR-06 (ADR numbering convention)
  ↓ (affects final numbering only, no content dependency)
  → applies to: MADCR-010, MADCR-011, MADCR-036, MADCR-046 (once each is Approved)

CR-01 (036 ↔ 046 sequencing, disputed/procedural)
  ↓
  MADCR-036 (Title Definition ≠ Award Instance) — zero formal prerequisite, highest
             register-wide fan-out (13: 8 direct + 5 indirect)
  ↓ (disputed direction, per CR-01 — evidence does not confirm which way)
  MADCR-046 (Certificate vs Title Award boundary) — zero formal prerequisite
  ↓ (once 036 approved, unlocks:)
  MADCR-037, 038, 039, 040, 041, 042, 043 (Title cluster, Batch 2/3)
  ↓ (jointly with CR-06 resolution + MADCR-053, unlocks:)
  MADCR-048, 057 (Title RBAC, Batch 4)

CR-05 / OPEN-C01 (AEP-MON-001 vs AEP-MON-002)
  ↓ (affects evidentiary confidence, not formal blocking)
  → MADCR-011 (Payment placement) evidentiary chain
  → MADCR-006, 007 (Free Bonus/add-on realization, already DRAFT from prior cycle, out of this session's scope)

MADCR-010 (Entitlement vs Organization Quota) — zero formal prerequisite
  ↓ (once approved, unlocks:)
  MADCR-009 (quota allocation vs usage technical model, Batch 2)
  ↓ (jointly with MADCR-011 + MADCR-053, unlocks:)
  MADCR-055 (Commercial admin permissions, Batch 4)

MADCR-011 (Payment placement) — zero formal prerequisite
  ↓ (once approved, unlocks:)
  MADCR-002 (Payment adapter architecture, Batch 2)
  ↓
  MADCR-003 (Payment verification, Batch 2)
  ↓
  MADCR-005 (Commercial reconciliation, Batch 2, jointly with MADCR-001)

MADCR-049 (Learning Activity vs Course) — BLOCKED, evidence gap
  ↓
  Evidence Recovery (domain-owner definitional clarification)
  ↓
  Future re-submission as Decision Brief
  ↓ (disputed, per CR-02/DISC-07)
  → possible relationship to MADCR-014, MADCR-023 (Batch 2, currently proceeding independently)
```

**No dependency above was invented** — every edge traces to a MADCR v1.1 `Depends On`/`Blocks` field, a Conflict Record (`CR-01` through `CR-07`), or the ADR Batch Readiness Matrix's own Batch assignments, all previously established and re-verified in this governance chain.
