# 13-ARB-BATCH-1-DOWNSTREAM-CASCADE.md
## RUMAHAGEN — Post-Approval Cascade (informational — no downstream action taken)

**For each decision, IF the Board approves it, this is what happens next. None of these downstream steps are performed by this Decision Pack.**

---

## MADCR-036 (Title Definition ≠ Award Instance)

```text
ARB Approval
    ↓
ADR finalized (pending CR-06 numbering resolution)
    ↓
ADR canonical registration
    ↓
ERD impact analysis — M15 Title core tables (Definition, Awarding Path, Award Instance)
    ↓
API impact analysis — M15 endpoints
    ↓
RBAC/RLS impact analysis — feeds MADCR-048, 057
    ↓
PRD impact analysis — Title-related product requirements
    ↓
Implementation authorization (separate future gate)
```

## MADCR-046 (Certificate vs Title boundary)

```text
ARB Approval
    ↓
ADR finalized (pending CR-06)
    ↓
ADR canonical registration
    ↓
ERD impact analysis — M04/M15 boundary confirmed, no certificates table change
    ↓
API impact analysis — clarifies which endpoints serve which entity
    ↓
RBAC/RLS impact analysis
    ↓
PRD impact analysis
    ↓
Implementation authorization (separate future gate)
```

## MADCR-010 (Entitlement vs Quota)

```text
ARB Approval (selecting Option A or B)
    ↓
ADR finalized (pending CR-06)
    ↓
ADR canonical registration
    ↓
ERD impact analysis — M14/M12 quota-adjacent tables designed per selected option
    ↓
API impact analysis
    ↓
RBAC/RLS impact analysis — feeds MADCR-055
    ↓
PRD impact analysis
    ↓
Implementation authorization (separate future gate)
```

## MADCR-011 (Payment placement)

```text
ARB Approval (selecting Option A or B)
    ↓
ADR finalized (pending CR-06)
    ↓
ADR canonical registration
    ↓
ERD impact analysis — Payment tables housed per selected option
    ↓
API impact analysis — Payment endpoints routed per selected option
    ↓
RBAC/RLS impact analysis — feeds MADCR-055
    ↓
PRD impact analysis
    ↓
Implementation authorization (separate future gate)
```

## CR-06, CR-01, CR-05 (procedural/governance items)

```text
ARB/Business Owner Decision
    ↓
Document Custodian applies governance-convention update (CR-06)
    or records sequencing minutes (CR-01)
    or updates AEP relationship metadata (CR-05)
    ↓
No ERD/API/RBAC/PRD impact directly — these are governance-hygiene actions
```

---

**IMPORTANT — none of the downstream steps illustrated above are performed by this Decision Pack.** Every arrow represents a future, separately-authorized governance/design step. This document exists solely to show the Board what a "yes" unlocks, not to pre-execute it.
