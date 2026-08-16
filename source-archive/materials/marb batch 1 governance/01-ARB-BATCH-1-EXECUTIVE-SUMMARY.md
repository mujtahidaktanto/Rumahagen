# 01-ARB-BATCH-1-EXECUTIVE-SUMMARY.md
## RUMAHAGEN — Architecture Review Board Batch-1 Decision Pack

**Prepared by:** ARB Secretariat / Governance Decision-Pack Preparation Lead
**Purpose:** Present 8 decision items to the Architecture Review Board for explicit deliberation. This document makes no decision, selects no option, and assigns no ADR number.

---

## Why ARB is being convened

RumahAgen's governance chain (MAEP v1.1 → MADCR v1.1 → ADR Master Sequencing Plan → ADR Batch-1 Governance Execution) has produced 4 DRAFT ADRs and surfaced 7 formal conflict records, none of which any prior AI-assisted governance step was authorized to resolve. The Board must now make these decisions explicit so the governance chain can proceed to ERD/API/RBAC/PRD work for the affected domains.

## What is already decided (not reopened)

- Agency = Organization (single concept)
- Learning Session is an extension of the Learning Domain (M04), not an independent module
- Existing M01–M13 baseline (13 modules, 47-entry Decision Log, all Approved)
- Title Definition ≠ Award Instance is already established as an architectural requirement in source (AEP-TITLE-001) — what remains OPEN is the Board's formal confirmation, not the underlying distinction itself

## What is NOT decided (the 8 agenda items)

1. **CR-06** — Which of two existing ADR-numbering conventions (curated 29-entry architecture register vs. complete 47-entry Decision Log) governs future ADR numbers
2. **CR-01** — Whether `MADCR-046` must be sequenced before `MADCR-036`, or whether both can be decided together
3. **MADCR-036** — Formal confirmation of Title Definition/Award Instance separation
4. **MADCR-046** — Formal confirmation of the `certificates`(M04)/Title(M15) boundary
5. **CR-05 / OPEN-C01** — Relationship between AEP-MON-001 and AEP-MON-002
6. **MADCR-010 (OPEN-Q1)** — Commercial Entitlement vs Organization Quota authority
7. **MADCR-011 (OPEN-Q2)** — Payment module placement (M14 subdomain vs separate module)
8. **MADCR-049** — Currently BLOCKED on evidence, not ready for a decision brief; instead an Evidence Recovery Request is presented

## What is blocked pending these decisions

M14 Commercial ERD/API, M12 Organization quota-table changes, Payment ERD/API, M15 Title ERD/API/RBAC/UI, and all associated RBAC/permission taxonomy work (`MADCR-053` and its 5 dependents) — full detail in `13-ARB-BATCH-1-DOWNSTREAM-CASCADE.md`.

## What gets unblocked after each decision

See `15-ARB-BATCH-1-DECISION-GRAPH.md` and `13-ARB-BATCH-1-DOWNSTREAM-CASCADE.md` for the full cascade — in summary, resolving items 3–7 unlocks the respective ERD phase for Title, Commercial, and Payment; item 1 (CR-06) unlocks correct final numbering for any ADR the Board approves; item 2 (CR-01) affects only sequencing, not content.

## What remains frozen regardless of this meeting's outcome

All new-wave ERD, API, RBAC/RLS, PRD changes, UI changes, migrations, implementation, and Bolt authorization remain NOT AUTHORIZED until the Board's decisions are formally recorded as APPROVED (not merely discussed) — this Decision Pack does not lift any freeze.
