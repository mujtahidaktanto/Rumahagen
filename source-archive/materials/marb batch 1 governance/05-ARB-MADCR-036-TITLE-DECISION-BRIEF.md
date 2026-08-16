# 05-ARB-MADCR-036-TITLE-DECISION-BRIEF.md

# Decision Brief

## Decision ID
MADCR-036

## Decision Title
Title Definition vs Award Instance

## Current Status
OPEN — ARB REQUIRED (DRAFT ADR exists, not yet Board-reviewed)

## Decision Authority
Architecture Review Board

## Why This Decision Exists

RumahAgen's proposed Title/Achievement system (M15) must support multiple Title authorities/scopes, configurable Awarding Paths, multiple qualification sources, prerequisites, Learning Points integration, lifecycle states (Active/Expired/Revoked/Restored), appeal/Stay Policy, renewal/requalification, independent Primary/Featured presentation, and historical retention. None of this is representable if Title is modeled as a single flat attribute on an agent record — hence the source AEP's assertion that Definition and Instance must be architecturally separated.

## Canonical Evidence

- `AEP_Title_Business_Rules_Baseline_v1_0.md` §4.2: *"Rules 003, 011–013, 021, 022, 023, 037–038, 051–052 and 093–095 establish a critical separation: 'A Title definition is not the same object as an earned Award Instance.'... This separation is an architectural requirement."*
- `AEP_Title_Business_Rules_Baseline_v1_0.md` §27, "ADR Candidate 1": "Separate Title Definition from Award Instance"
- `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md` §28, `CAIA-ADR-007`: "Title Definition vs Award Instance" (independent corroboration)

## Existing Decisions

**PRESERVED, not reopened:** the canonical distinction Title Definition ≠ Award Instance, as already established in source. This Decision Brief presents it for **formal Board confirmation**, not for re-derivation or alternative design.

## Business Rules (Final status, Title 001–100 baseline)

| Rule | Text |
|---|---|
| 003 | "Semua earned Title dapat menjadi Primary. Tidak ada pembatasan source yang otomatis melarang Primary." |
| 011 | "Repeat, Renewal, dan Progression merupakan policy configurable per Title." |
| 012 | "Ketika agen memperoleh level berikutnya, Title level sebelumnya tetap Active kecuali policy menentukan sebaliknya." |
| 013 | "Title dapat berdiri sendiri atau berhubungan dengan Credential." |
| 021 | "Perubahan material terhadap business rule menghasilkan new Awarding Rule/Title version. Award lama tetap terkait version saat award diberikan." |
| 022 | "Rename Title berlaku global terhadap Title/award terkait." (Rename ≠ new Award) |
| 023 | "Title yang pernah diberikan tidak boleh hard-delete." |
| 037–038, 051–052, 093–095 | Cited by AEP §4.2 (range reference, not individually re-extracted) |

## AEP References

AEP-TITLE-001 (originating), CAIA-001 (corroborating) — see Canonical Evidence.

## Existing ADR References

None found in either numbering scheme (`CR-06`).

## Affected Modules

M15 Title (proposed, new — zero existing precedent). M04 `certificates` explicitly must remain distinct (see companion brief, `MADCR-046`).

## Architecture Impact

**Highest-leverage item in the entire 64-candidate MADCR register** — 8 direct + 5 indirect dependents (13 total reach). Foundational for: Awarding Path versioning (`037`), Award Provenance (`038`), Lifecycle separation (`039`), Presentation-state modeling (`040`), Rule versioning (`041`), Revocation/Appeal (`042`), Multiple Award Instances (`043`), and downstream RBAC (`048, 057`).

## Dependencies

**Depends on:** None (zero Category-A prerequisite).
**Disputed:** `MADCR-046` claims (via free-text field) to block this decision — see companion brief `04-ARB-CR-01-...` for the sequencing question.

## Options

**No alternative architecture exists in any source.** AEP-TITLE-001 presents the Definition/Instance separation as a stated requirement, not a choice among named alternatives. Per Master Prompt §8 instruction ("Jika source tidak memiliki alternative architecture: JANGAN membuat alternatif baru"), **no invented option is presented.** The only matter for the Board is whether to **formally confirm** this sourced requirement.

## Consequences

Confirming unlocks (but does not itself complete) 8 direct and 5 indirect dependent decisions. Declining or deferring this confirmation blocks the entire Title/Achievement domain's ERD.

## Risks

- `CR-01` sequencing question relative to `MADCR-046`.
- `CR-06` numbering convention affects this decision's final ADR identifier once approved.

## Open Questions

Same as `CR-01` companion brief: does `MADCR-046` substantively inform this decision's scope?

## Downstream Impact

DIRECT: M15 ERD. INDIRECT: API, RBAC, UI, Workflow (via 8 direct dependents).

## Recommendation

**Procedural recommendation only:** given the strength and consistency of the cited evidence (13 Title Rules, all Final status, corroborated independently by CAIA), and the absence of any competing architectural alternative in any source, **the Board may find this the most straightforward of the Batch-1 items to confirm.** This is not a substitute for Board deliberation — it is an observation about evidence completeness, not a decision.

## Decision

> **OPEN — ARB REQUIRED**

*(Full DRAFT ADR available: `ADR-DRAFT-MADCR-036.md`, prepared in the prior governance-execution cycle, unchanged, provided as supporting material for this Board session — not itself an approval.)*
