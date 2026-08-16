# 08-BATCH-1-DOWNSTREAM-IMPACT.md
## RUMAHAGEN — Downstream Freeze List

Per Master Prompt §17: ERD/API/RBAC/RLS/PRD/UI/Bolt implementation NOT AUTHORIZED for any artifact touched by an unapproved ADR. Existing approved baseline explicitly distinguished from new-wave change.

---

## EXISTING APPROVED BASELINE (NOT frozen — already authorized, independent of Batch 1)

| Artifact | Status | Evidence |
|---|---|---|
| ERD v1.4-FINAL (41 entities, M01–M13) | **APPROVED, existing** | `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md` |
| API v1.3-FINAL-FIXED | **APPROVED, existing** | `docs/04-api/` |
| RBAC/RLS (7-role model) | **APPROVED, existing** | `docs/06-security/Authorization-Access-Control-Specification-v1.1-FINAL.md` |
| PRD v1.3-FINAL | **APPROVED, existing** | `docs/01-product/` |
| Migrations `0001–0015` (+ `-FIXED` variants) | **Written, APPROVED design, NOT executed** | Independent blocker (`MADCR-059`), unrelated to Batch 1 |

**None of these require Batch-1 ADR approval to remain valid or to proceed to Sprint S0** (pending only their own independent migration-canonicalization blocker).

---

## NEW-WAVE ARTIFACTS — FROZEN pending ADR approval

| Artifact | Frozen because | Unfreezes when |
|---|---|---|
| M14 Commercial ERD (Entitlement/Quota tables) | Depends on `MADCR-010` | `MADCR-010` ADR **APPROVED** (not merely drafted) |
| M12 Organization quota-adjacent table changes | Same | Same |
| Payment ERD/API (M14 subdomain or M16 module) | Depends on `MADCR-011` | `MADCR-011` ADR **APPROVED** |
| M15 Title ERD/API/RBAC/UI (Definition/Instance/Path/Provenance/Lifecycle) | Depends on `MADCR-036` (+ its 8 direct dependents) | `MADCR-036` ADR **APPROVED**, and progressively its dependents as they close |
| M04/M15 boundary implementation (any code touching both `certificates` and future Title tables) | Depends on `MADCR-046` | `MADCR-046` ADR **APPROVED** |
| M04-extend (Learning Economy/Session) ERD elements specifically shaped by the Course-boundary question | Depends on `MADCR-049` | `MADCR-049` evidence gap closed AND a future ADR **APPROVED** — currently BLOCKED even for drafting |
| Any RBAC/permission entries for Title, Commercial admin, Learning Session host/instructor, Learning Point adjustment | Depends on `MADCR-053` (itself blocked by `010,011,036`) | Cascades from the above |

**Explicit freeze statement (per §17):** ERD = NOT AUTHORIZED, API = NOT AUTHORIZED, RBAC/RLS = NOT AUTHORIZED, PRD change = NOT AUTHORIZED, UI implementation = NOT AUTHORIZED, Bolt implementation = NOT AUTHORIZED — for every artifact listed in this section — **until the respective ADR is APPROVED, not merely drafted.** Drafting 4 ADRs in this cycle (§10/companion files) does not lift any freeze.
