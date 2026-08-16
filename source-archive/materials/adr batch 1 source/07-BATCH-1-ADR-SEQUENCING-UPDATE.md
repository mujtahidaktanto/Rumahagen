# 07-BATCH-1-ADR-SEQUENCING-UPDATE.md
## RUMAHAGEN — Dependency-First Drafting Order

Per Master Prompt §14: sequencing by dependency, not MADCR number.

```text
MADCR-036 → ADR (draftable now) → depends on: none → blocks: 037,038,039,040,043,048,053,057 (13 total reach, highest in register) → downstream: M15 ERD/API/RBAC/UI/Workflow

MADCR-046 → ADR (draftable now) → depends on: none (formal); CR-01 notes possible informal precedence relative to MADCR-036 → blocks: Title ERD (+ disputed MADCR-036) → downstream: ERD/API/RBAC/PRD/User-Flow/Test-strategy (most extensively documented impact of the 4)

MADCR-010 → ADR (draftable now) → depends on: none → blocks: 009,053,055 direct (+4 indirect) → downstream: M14/M12 ERD

MADCR-011 → ADR (draftable now) → depends on: none → blocks: 002,053,055 direct (+6 indirect) → downstream: Payment ERD/API

MADCR-049 → NOT DRAFTED THIS CYCLE (BLOCKED — EVIDENCE GAP) → would depend on: none (formal); CR-02 notes possible cross-batch relationship to MADCR-014/023 → would block: 014,023 (disputed) → downstream: M04-extend ERD (deferred until evidence gap closes)
```

## RECOMMENDED DRAFTING ORDER (evidence-based, not MADCR-numeric)

| Order | MADCR | Rationale |
|---|---|---|
| 1 | `MADCR-036` | Highest total reach in the entire 64-item register (13); strongest evidence; foundational for the largest number of downstream candidates |
| 2 | `MADCR-046` | Closely coupled to `036` (shared Title Rule 013, disputed dependency `CR-01`) — drafting together allows the ordering question to be resolved in the same session |
| 3 | `MADCR-010` | Second/third-highest reach among Gate-1 items (7); Commercial-domain, independent of the Title pair |
| 4 | `MADCR-011` | Parallel-eligible with `010` (no mutual dependency found); Commercial-domain |
| — | `MADCR-049` | **Held — BLOCKED — EVIDENCE GAP.** Recommend a definitional-clarification pass (with the Learning Economy/Session domain owners) before re-attempting this readiness classification |

**Note on parallelization:** `036`+`046` and `010`+`011` form two internally-coupled pairs with **no dependency between the pairs** — both pairs could be drafted in the same governance cycle without sequential blocking, consistent with the ADR Sequencing Plan's original Session 1 grouping. The order above reflects evidentiary/leverage priority, not a hard technical requirement to draft strictly one-at-a-time.

**No MADCR sequencing was changed from the ADR Master Sequencing & Drafting Plan's own Session/Batch structure** — this file adds evidence-based internal ordering *within* Batch 1, it does not move any candidate to a different Batch.
