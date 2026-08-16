# 16-ARB-BATCH-1-PRE-READ.md
## RUMAHAGEN — Architecture Review Board Pre-Read

*(Read this before the meeting. ~2–3 pages.)*

---

### Why this meeting is happening

RumahAgen's governance process has moved 4 architecture decisions and 4 procedural/governance items from evidence-gathering to Board-ready status. This is the first Architecture Review Board session for the "new-wave" domains (Commercial, Title, Learning) since the 13-module existing baseline was approved. Nothing has been decided yet — this pack exists to make sure the Board decides with complete, traceable evidence rather than by default or by drift.

### What is already decided (do not reopen)

- **Agency = Organization.** One concept, not two. This was resolved in a prior governance gate and is not on today's agenda.
- **Learning Session lives inside the Learning Domain (M04)**, not as an independent module. Also already settled.
- **The existing 13-module baseline (M01–M13) is fully approved**, 47-entry Decision Log, 0% implemented. Not on today's agenda.
- **Title Definition and Award Instance must be architecturally separate** — this specific *fact* is not in dispute in any source document; what's on today's agenda is the Board's formal confirmation of it (`MADCR-036`).

### What is NOT decided (today's 8 items)

1. Should ADR numbering follow the 29-entry curated architecture register, the 47-entry master Decision Log, or a new namespaced hybrid? (`CR-06`)
2. Does `MADCR-046` need to be decided before `MADCR-036`, or can both go together? (`CR-01`)
3. Formal confirmation: Title Definition ≠ Award Instance. (`MADCR-036`)
4. Formal confirmation: the existing `certificates` table and the new Title system stay separate. (`MADCR-046`)
5. What's the relationship between our two Commercial architecture documents (AEP-MON-001, AEP-MON-002)? (`CR-05`/`OPEN-C01`)
6. Is Commercial Entitlement the source of Organization quota, or is it the other way around? (`MADCR-010`)
7. Does Payment live inside the Commercial module, or does it get its own module? (`MADCR-011`)
8. We don't yet know what "Learning Activity" means as a term — not ready for a decision, only a recovery request. (`MADCR-049`)

### What's blocked right now

The entire Title, Commercial, and Payment data-model design (ERD/API/RBAC) is on hold until items 3, 4, 6, and 7 above are decided. Nothing in the existing 13-module baseline is affected.

### What gets unblocked after approval

Approving items 3–7 opens the door to ERD design for their respective domains — but ERD design itself is a *separate*, future governance step, not something this meeting authorizes directly.

### What stays frozen no matter what

No ERD, API, RBAC/RLS, PRD change, UI work, migration, or Bolt/implementation work on any new-wave domain — regardless of today's outcome — until the Board's decisions are formally recorded and each respective ADR reaches Approved status (not just Discussed or Drafted).

### One important finding worth knowing before the meeting

While preparing this pack, we discovered that RumahAgen actually has **two different ADR-numbering systems** running in parallel — one with 29 entries focused specifically on architecture/technical decisions, and one with 47 entries covering every project decision, technical and non-technical. At least 8 decisions carry two different numbers depending on which register you're reading. Both systems know about each other and cross-reference correctly — this isn't a mistake, just something that's never been explicitly reconciled. Item 1 on the agenda exists to fix that going forward.
