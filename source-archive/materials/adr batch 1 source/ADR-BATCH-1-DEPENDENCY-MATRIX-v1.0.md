# ADR BATCH 1 DEPENDENCY MATRIX v1.0
## RUMAHAGEN — Pre-Draft Control Artifact

**Status: PRE-DRAFT GOVERNANCE CONTROL ARTIFACT — NO SEQUENCING CHANGED.**

---

# BATCH 1 DEPENDENCY MATRIX

| ADR (MADCR ID) | Depends On | Blocks | Shared Dependencies | Shared Business Rules | Shared AEP | Shared Open Decisions | Potential Ordering Issue | Status |
|---|---|---|---|---|---|---|---|---|
| `MADCR-010` (OPEN-Q1) | None (formal) | `009,053,055` (direct); `048,054,056,057` (indirect) | None with other Batch-1 items | None shared with other Batch-1 items directly (own basis: Gate v1.3 §4.1, AEP-MON-001) | None shared | Is itself OPEN-Q1; shares `055` downstream with `MADCR-011` | None found within Batch 1 | Evidence-pack complete (§madcr010) |
| `MADCR-011` (OPEN-Q2) | None (formal) | `002,053,055` (direct); `003,005,048,054,056,057` (indirect) | None with other Batch-1 items | None shared with other Batch-1 items directly | None shared | Is itself OPEN-Q2; shares `055` downstream with `MADCR-010` | None found within Batch 1 | Evidence-pack complete (§madcr011) |
| `MADCR-036` (Title Definition≠Instance) | None (formal); **DISPUTED** — `MADCR-046`'s free-text `Blocks` field names `036` | `037,038,039,040,043,048,053,057` (direct); `041,042,054,055,056` (indirect) — highest reach in register (13) | None with `010/011/049`; **disputed shared edge with `046`** | Title Rules 003,011–013,021–023,037–038,051–052,093–095 — **none shared with other Batch-1 items** | AEP-TITLE-001, CAIA-001 (CAIA shared with `046` and `049`) | None | **YES — DISC-06: `046` claims to block `036`; if accurate, `046` should resolve before `036`, but both currently sequenced together in Batch 1 with no internal order specified** | Evidence-pack complete (§madcr036) |
| `MADCR-046` (certificates vs Title) | None (formal); its own free-text field claims dependency-target `036` | `036` (claimed, disputed), Title ERD | None with `010/011/049` (formal); **disputed shared edge with `036`** | Title Rule 013 (shared with `MADCR-036`) | CAIA-001 (shared with `036` and `049`) | None | **YES — same DISC-06 issue, other direction** | Evidence-pack complete (§madcr046) |
| `MADCR-049` (Learning Activity vs Course) | None (formal); its own free-text field claims dependency-targets `014, 023` | `014, 023` (claimed, disputed — both are **Batch 2** items) | None with `010/011/036/046` | None found (Business Rule Source Gap, §5.5 of its evidence pack) | CAIA-001 (shared with `036` and `046`) | None | **YES — DISC-07: cross-BATCH implication. If `049`'s claimed blocking of `014`/`023` is accurate, two Batch-2 items' *approval* may need to wait on a Batch-1 item's resolution — this is the only Batch-1 discrepancy with cross-batch consequence** | Evidence-pack complete (§madcr049), CANDIDATE VALIDITY OBSERVATION also flagged |

---

# SHARED-EVIDENCE CROSS-REFERENCE

| Shared element | Candidates | Note |
|---|---|---|
| CAIA-001 as a direct source | `MADCR-036, 046, 049` | All three cite CAIA directly; `010, 011` cite CAIA only as secondary corroboration (primary is Gate v1.3) |
| Gate v1.3 as a direct/primary source | `MADCR-010, 011` | Both are explicitly Gate v1.3 §4.1/§4.2 "OPEN" items; `036/046/049` are only indirectly touched by Gate v1.3 §4.3's terse "remaining open" list |
| Title Rule 013 | `MADCR-036, 046` | Both cite the same rule ("Title dapat berdiri sendiri atau berhubungan dengan Credential") as supporting evidence for their respective (related but distinct) Title/Credential boundary questions |
| `MADCR-055` (Commercial admin permissions, Batch 4) as a shared downstream dependent | `MADCR-010, 011` | Both feed the same Batch-4 item jointly |

---

# SEQUENTIAL / PARALLEL DETERMINATION

**Can the five Batch-1 candidates be drafted SEQUENTIALLY, IN PARALLEL, or PARTIALLY IN PARALLEL?**

**Determination: PARTIALLY IN PARALLEL.**

**Reasoning:**
- All five have **zero formal Category-A prerequisite** (each row's `Depends On` field is "—" in MADCR v1.1 §6) — this alone would suggest full parallel drafting is possible.
- However, **two disputed edges exist entirely within this batch**: `MADCR-046`↔`MADCR-036` (DISC-06) and, if the free-text claim is trusted, a directional suggestion that `046` precedes `036`.
- **`MADCR-010` and `MADCR-011` have no disputed or formal relationship to each other or to `036/046/049`** — these two can proceed fully in parallel with each other and with the Title-domain pair.
- **`MADCR-049` has a claimed (disputed) dependency reaching *outside* Batch 1 into Batch 2** (`014, 023`) — this does not prevent `049` itself from being drafted in parallel with the rest of Batch 1, but it means `049`'s *resolution timing* has a knock-on implication for Batch 2 that the current sequencing does not explicitly flag.

**Recommended grouping (governance observation, not a re-sequencing decision):**
- **Parallel-safe pair:** `MADCR-010`, `MADCR-011` (zero shared or disputed dependency with anything in Batch 1)
- **Requires internal-order discussion before Board session:** `MADCR-036`, `MADCR-046` (DISC-06)
- **Requires cross-batch timing awareness:** `MADCR-049` (DISC-07)

**SEQUENCING VALIDATION REQUIRED** — flagged per §7 instruction, since evidence (the free-text `Blocks` fields) is not fully consistent with the current "all five in one undifferentiated Batch 1" treatment found in the ADR Sequencing Plan / ADR Batch Readiness Matrix. **The official Batch 1 grouping itself is NOT changed here** — this is a recommendation for the Board's scheduling discretion within the session, not a re-sequencing.
