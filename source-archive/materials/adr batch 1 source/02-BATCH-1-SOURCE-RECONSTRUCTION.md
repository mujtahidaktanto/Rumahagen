# 02-BATCH-1-SOURCE-RECONSTRUCTION.md
## RUMAHAGEN — Batch-1 Source Reconstruction (NOT ADR drafting)

Per Master Prompt §3, 15-point reconstruction for each of 5 MADCR candidates, built from primary-source re-verification (evidence packs cross-checked, not merely copied).

---

# MADCR-010

1. **MADCR identity:** OPEN-Q1, "Commercial Entitlement vs Organization Quota"
2. **Decision question:** Is Commercial Entitlement the source of Agency/Organization quota capacity (Option A), or is the existing Organization quota model itself the authoritative entitlement representation (Option B)? — verbatim, Gate v1.3 §4.1
3. **Business problem:** Two candidate architectural models for how commercial capacity relates to Organization-level quota exist, with no decision yet made; ERD cannot proceed without resolving which model is authoritative
4. **Business Rules involved:** Legacy BR §3/§6 (allocation≠consumption principle, general); `MBR-COM-X03` (Gate v1.3 §3, "exact technical model remains an ADR/ERD concern"); `MBR-COM-001–013` referenced but **NOT FOUND**
5. **AEP involved:** AEP-MON-001 (§5 Quota Architecture, indirect); CAIA-001 (§29 Gate1.5, direct)
6. **Existing ADR involved:** **None** — re-verified against both `architecture-decision-records-FINAL-v1.1-plus-ADR029.md` and `decision-log-FINAL.md` (47 total entries) — no existing ADR (in either numbering scheme) addresses Commercial-Entitlement-vs-Organization-Quota
7. **Existing architecture involved:** M12 Organization (existing, approved — its quota concept is directly implicated); M14 Commercial (proposed, not yet existing)
8. **Dependencies:** None formal. Free-text `Blocks` field claims `MADCR-002` — **unmirrored in `002`'s own `Depends On` field** (`DISC-08`)
9. **Downstream impact:** DIRECT — M14/M12 ERD (Gate v1.3 §4.1 explicit: "must be resolved before ERD")
10. **Conflicts:** None substantive found; `DISC-08` dependency-field discrepancy only
11. **Evidence available:** Gate v1.3 §4.1 (Level 4, explicit A/B options) — strong
12. **Evidence missing:** `MBR-COM-001–013` primary text
13. **Current status:** OPEN
14. **Is ADR drafting authorized?** **YES** — primary source exists (Level 4), authority sufficient, decision question clear (explicit options), dependencies understood, no unresolved higher-order conflict blocking the question itself
15. **Architecture decision or documentation reconciliation only?** **Genuine architecture decision** — determines core M14/M12 data-model authority

---

# MADCR-011

1. **MADCR identity:** OPEN-Q2, "Payment placement"
2. **Decision question:** Should Payment be a Commercial (M14) subdomain, or a separate logical module bounded behind Commercial? — verbatim, Gate v1.3 §4.2
3. **Business problem:** Payment module boundary undecided; Gate v1.3 explicitly defers this to "the existing Commercial AEP/ADR candidates" — i.e., to this very ADR process
4. **Business Rules involved:** AEP-MON-001 §16 Principle 8 (adapter-replaceable) only; no direct BR citation found; `MBR-COM-001–013` referenced, **NOT FOUND**
5. **AEP involved:** AEP-MON-001 (§8–14, direct, Payment Gateway architecture); AEP-MON-002 (§15, reference only, explicitly defers Payment specifics elsewhere without naming AEP-MON-001); CAIA-001 (§29 Gate1.6, direct)
6. **Existing ADR involved:** **None** in either numbering scheme
7. **Existing architecture involved:** M01–M13 baseline unaffected either way; would introduce first content into "M14" or a new "M16" label — **M16 does not exist as an approved module**
8. **Dependencies:** None formal. Free-text field incomplete relative to `MADCR-053`/`055`'s own `Depends On` fields (both list `011` correctly, but `011`'s own `Blocks` field only names `002,003`)
9. **Downstream impact:** DIRECT — Payment ERD/API
10. **Conflicts:** `OPEN-C01` (AEP-MON-001↔AEP-MON-002 relationship) affects confidence in the evidentiary chain for *how* Payment would be built, not whether the module-placement question itself is well-formed
11. **Evidence available:** Gate v1.3 §4.2 (Level 4, explicit two named options) — strong
12. **Evidence missing:** `MBR-COM-001–013`; confirmed relationship between AEP-MON-001/002
13. **Current status:** OPEN
14. **Is ADR drafting authorized?** **YES** — same reasoning as `MADCR-010`; `OPEN-C01` recorded as an Open Question within the future ADR, not a drafting blocker
15. **Architecture decision or documentation reconciliation only?** **Genuine architecture decision**

---

# MADCR-036

1. **MADCR identity:** "Separate Title Definition from Award Instance" (ADR Candidate 1, AEP-TITLE-001 §27) / CAIA-ADR-007
2. **Decision question:** Should Title Definition be modeled as a separate object from an earned Award Instance? — source states this as an architectural requirement, not an open A/B choice
3. **Business problem:** Title system requires multiple authorities/scopes, configurable Awarding Paths, multiple qualification sources, lifecycle states, appeal/Stay Policy, independent Primary/Featured presentation — none of which are representable if Title is a single flat agent attribute
4. **Business Rules involved:** **13 specific Title Rules, Final status**: 003, 011–013, 021–023, 037–038, 051–052, 093–095 (AEP-TITLE-001 §4.2) — 6 independently re-verified verbatim this pass (003,011,012,013,021,022,023)
5. **AEP involved:** AEP-TITLE-001 (§1, §4.2, §5.1, §27, direct originating); CAIA-001 (§28 `CAIA-ADR-007`, direct)
6. **Existing ADR involved:** **None** — no Title/Award entity exists in either ADR file or the current ERD v1.4
7. **Existing architecture involved:** M15 Title (proposed, new — no existing precedent); existing M04 `certificates` explicitly must remain distinct (cross-reference to `MADCR-046`)
8. **Dependencies:** None formal. Highest total reach in the entire 64-item MADCR register (13: 8 direct + 5 indirect). Disputed edge: `MADCR-046`'s free-text field claims to block `036` (`DISC-06`), unmirrored in `036`'s own `Depends On` field
9. **Downstream impact:** DIRECT — M15 ERD; INDIRECT — API, RBAC (via `048,057`), UI (via `040`), Workflow (via `037,042`)
10. **Conflicts:** None substantive; `DISC-06` dependency-field discrepancy only (shared with `046`)
11. **Evidence available:** Strongest of the 5 candidates — 7 items, all HIGH confidence
12. **Evidence missing:** None material — Business Rule basis fully within the FOUND, user-locked Title 001–100 baseline
13. **Current status:** OPEN
14. **Is ADR drafting authorized?** **YES** — cleanest of the 5: zero Open-Decision entanglement, strongest BR basis, clear (if assertion-framed) decision question
15. **Architecture decision or documentation reconciliation only?** **Genuine, foundational architecture decision** — the single highest-leverage item in the register

---

# MADCR-046

1. **MADCR identity:** "Certificate/Credential vs Title separation" (CAIA-ADR-010) / "Certificate/Credential vs Title boundary" (CAIA Gate1.3, Gate v1.3 §4.3)
2. **Decision question:** Where is the boundary between the existing `certificates` table (M04) and the new Title/Award Instance model (M15)? Source states a prohibition ("must not automatically become") and a requirement ("must remain separate"), not an open A/B choice
3. **Business problem:** Without an explicit boundary, `certificates` could be accidentally conflated with the new Title system during implementation, corrupting both models
4. **Business Rules involved:** Title Rule 013 ("Title dapat berdiri sendiri atau berhubungan dengan Credential") — shared with `MADCR-036`; no M04-side rule found explicitly addressing this boundary — **Business Rule Source Gap for the M04 side**
5. **AEP involved:** CAIA-001 (§6.3, §28, §29, direct, sole originating source); AEP-TITLE-001 (indirect, shares Rule 013 only)
6. **Existing ADR involved:** **None** — `certificates` table exists (M04, migration `0009`) with no Title-related columns/FKs, confirmed by direct ERD/migration inspection
7. **Existing architecture involved:** M04 Learning Center `certificates` table (existing, approved, **explicitly to be RETAINED**, CAIA §5.2); M15 Title (proposed)
8. **Dependencies:** None formal. Free-text field claims to block `MADCR-036` — **unmirrored in `036`'s own `Depends On` field** (`DISC-06`) — this is the most consequential of the batch's dependency discrepancies given `036`'s register-wide highest fan-out
9. **Downstream impact:** **Most extensively documented of the 5** — CAIA §6.3 explicitly enumerates: ERD, API, RBAC, PRD, User Flow, System Architecture, test strategy, all CRITICAL
10. **Conflicts:** `DISC-06` (see above)
11. **Evidence available:** 6 items, all HIGH confidence, including independent Level-4 corroboration (Gate v1.3 §4.3)
12. **Evidence missing:** M04-side Business Rule explicitly addressing Title interaction (minor gap — CAIA's own prohibition is sufficient authority regardless)
13. **Current status:** OPEN
14. **Is ADR drafting authorized?** **YES** — evidence complete and strong; `DISC-06` is a documentation-consistency issue about ordering, not a substantive block on the decision content itself
15. **Architecture decision or documentation reconciliation only?** **Genuine architecture decision**, though closely coupled to `MADCR-036` (recommend joint Board session, not merged decision)

---

# MADCR-049

1. **MADCR identity:** "Learning Activity vs existing Course model" (CAIA Gate1.2) / "Learning Activity vs Course" (Gate v1.3 §4.3)
2. **Decision question:** **DECISION QUESTION GAP — partial.** Only a terse two-word-pair label found in every source; no elaborating sentence anywhere in CAIA or Gate v1.3 beyond the label itself
3. **Business problem:** Unclear from source — inferred only from adjacent context (CAIA §6.1–6.2's Course→Lesson→Enrollment→Quiz→Certificate current-state pipeline and "Course / Learning Activity" combined target-diagram node)
4. **Business Rules involved:** **NONE FOUND — full Business Rule Source Gap.** No Business Rule set (legacy BR-001–151, LE-001–059, LS-001–080, Title 001–100) explicitly defines "Learning Activity" as a term
5. **AEP involved:** CAIA-001 (§6, §29 Gate1.2, direct, sole originating source); AEP-LE-001 and AEP-LS-001 **both independently searched this pass — neither uses the exact term "Learning Activity"** as a defined concept
6. **Existing ADR involved:** **None** in either numbering scheme
7. **Existing architecture involved:** M04 Learning Center (existing, approved — `courses/course_lessons/enrollments/quizzes`); M04-extend (proposed, Learning Economy/Session)
8. **Dependencies:** None formal. Free-text field claims to block `MADCR-014, 023` — **unmirrored in either's own `Depends On` field** (`DISC-07`) — the only Batch-1 discrepancy reaching across into Batch 2
9. **Downstream impact:** DIRECT — M04-extend ERD; most other artifacts UNKNOWN (no direct source statement)
10. **Conflicts:** `DISC-07`; **CANDIDATE VALIDITY OBSERVATION** — the term "Learning Activity" is not independently sourced outside CAIA's own summary language
11. **Evidence available:** 6 items, but 2 are absence-findings (confirming the term is NOT defined elsewhere) rather than positive content
12. **Evidence missing:** A clear, elaborated decision question; any Business Rule basis; a definitional source for "Learning Activity" itself
13. **Current status:** OPEN
14. **Is ADR drafting authorized?** **NO — under the strict test in Master Prompt §5** ("decision question is clear" fails; Business Rule basis is a full gap, not partial) — **BLOCKED — EVIDENCE GAP**
15. **Architecture decision or documentation reconciliation only?** **Cannot be determined yet** — the underlying question (how do new Learning Economy/Session data flows relate to the existing Course/Lesson pipeline?) is plausibly a genuine architecture decision, but the specific term "Learning Activity" requires definitional clarification first — this may turn out to be partly a documentation/terminology reconciliation task feeding into the eventual architecture decision, not purely one or the other
