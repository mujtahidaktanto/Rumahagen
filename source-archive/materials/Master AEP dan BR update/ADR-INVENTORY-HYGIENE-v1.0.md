# ADR INVENTORY HYGIENE v1.0
## RUMAHAGEN — Workstream D

**Status:** GOVERNANCE RECONCILIATION ARTIFACT — NO COUNT FORCED TO MATCH

---

# D.1 CATEGORY-A COUNT RECONCILIATION

| Metric | MADCR v1.1 stated value | Independently re-counted (this workstream, direct table count) | Match? |
|---|---|---|---|
| Category-A total | 32 | 32 (counted rows in §6.1–6.5 with Class=A) | **YES** |
| ADR REQUIRED | 9 | 9 (`MADCR-010,011,036,037,039,042,046,049,053`) | **YES** |
| ADR RECOMMENDED | 22 | 22 (counted directly) | **YES** |
| ADR POSSIBLE | 1 (stated in §0/§0A.narrative/§19 summary) | **2** (`MADCR-006` and `MADCR-007`, both explicitly labeled "ADR POSSIBLE" in §6.1 register rows) | **NO — DISCREPANCY** |
| Blocked | 7 | 7 (`MADCR-009,048,053,054,055,056,057`) | **YES** |
| Draftable/ADR-eligible | 25 | 25 (32−7) | **YES** |

**Finding D-01 (= prior-cycle `DISC-09`, re-confirmed by independent recount rather than reasoning alone):** MADCR v1.1's own summary text states "1 ADR POSSIBLE" in three locations (front-matter answer paragraph, §0 Executive Summary, §19 Final Statistics), but the register itself (§6.1, rows for `MADCR-006` and `MADCR-007`) contains exactly 2 rows carrying that label. **This is confirmed a genuine internal MADCR v1.1 arithmetic/labeling inconsistency, not a misreading.** Not corrected here — recorded as `RECONCILIATION REQUIRED`.

---

# D.2 EXISTING-BASELINE ADR COUNT RECONCILIATION

| Source | Stated count | Date/version context |
|---|---|---|
| `docs/02-architecture/technology-decisions-v1.6-FINAL.md` (repo, closing changelog note) | "28 dari 28 ADR Approved secara keseluruhan" | Frozen as of 3 Agustus 2026 (version 1.6 changelog text) |
| `docs/00-governance/project-manifest-v1.28-KONSOLIDASI-FINAL.md` (repo, line 224) | "29 Approved/Approved With Notes (100%), 0 OPEN" | Later snapshot, post-dates ADR-029/ADR-047 cycle |
| `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md` (repo, direct ADR register) | Contains entries up to and including `ADR-047` (Image Duplicate Detection) and `ADR-029` | Confirms the register itself has grown past what `technology-decisions-v1.6` last counted |

**Determination: NOT a duplicate, NOT missing, NOT stale inventory in the sense of being wrong — this is a version-mismatch between two repository documents last synchronized at different points in the same ongoing approval cycle.** `technology-decisions-v1.6-FINAL.md` explicitly states its own review trigger in its changelog: *"Wajib direview ulang setiap kali status ADR ... berubah"* — meaning this document is self-aware that it requires a refresh, and one is due following the ADR-029/047 cycle. **This is recorded as `DISC-10` (carried from MAEP v1.1), not silently corrected.**

**29 is the more current, more precise figure** (direct count from the live ADR register + the manifest's explicit summary line), used as the working reference throughout this reconciliation without altering `technology-decisions-v1.6-FINAL.md` itself.

---

# D.3 ADR INVENTORY ACROSS ALL SOURCES — CROSS-CHECK

| Source | New-wave ADR entries found? |
|---|---|
| Repository `architecture-decision-records-FINAL-v1.1-plus-ADR029.md` | **None** — re-grepped for `ADR-MON-*`, `ADR-LE-*`, `ADR-LS-*`, Title/CAIA-prefixed patterns; zero matches |
| `project-manifest-v1.28` | References only the 29 existing-baseline ADRs; no new-wave ADR listed |
| `CURRENT-PROJECT-STATE-rev10` | Same — no new-wave ADR referenced as Approved |

**Confirms: 0 of the 32 Category-A MADCR candidates have been formalized as repository ADRs.** This matches every prior document's claim (MAEP v1.0 §9.2, MADCR v1.1 §0, ADR Sequencing Plan §3, MAEP v1.1 §10) — **no discrepancy found here.**

---

# D.4 DRAFTABLE VS APPROVED — TERMINOLOGY AUDIT

Checked whether any prior document accidentally used "APPROVED," "FINAL," or "LOCKED" for any of the 32 Category-A candidates:

| Document | Result |
|---|---|
| MAEP v1.0 | Clean — uses PROPOSED/OPEN throughout for new-wave items |
| MADCR v1.1 | Clean — Status column uses OPEN/OPEN-BLOCKED/ALREADY DECIDED only, never APPROVED for Category-A rows |
| ADR Sequencing Plan v1.0 | Clean — explicitly states "0 APPROVED" in its own Readiness Matrix (§20) |
| MAEP v1.1 | Clean — §27 explicitly states "0" for APPROVED |

**No terminology violation found.**

---

# D.5 SUMMARY OF DISCREPANCIES THIS WORKSTREAM

| ID | Finding | Severity | Status |
|---|---|---|---|
| D-01 (= DISC-09) | "1 ADR POSSIBLE" summary vs 2 register rows | LOW | RECONCILIATION REQUIRED, confirmed by independent recount |
| D-02 (= DISC-10) | 28 vs 29 existing-baseline ADR count, timing mismatch | LOW | RECONCILIATION REQUIRED (routine refresh, not a contradiction) |

**No count was forced to match. No ADR inventory was silently modified.**
