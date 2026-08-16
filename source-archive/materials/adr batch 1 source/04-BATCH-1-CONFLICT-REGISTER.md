# 04-BATCH-1-CONFLICT-REGISTER.md
## RUMAHAGEN — Formal Conflict Records

Per Master Prompt §4, each conflict recorded with: conflict ID, source A, source B, exact conflict, authority level A, authority level B, canonical candidate, unresolved question, required owner decision, downstream impact, recommendation. **No conflict resolved unilaterally.**

---

## CR-01 — MADCR-046 ↔ MADCR-036 Dependency Direction

- **Source A:** `MADCR-046` row, MADCR v1.1 §6.4, free-text `Blocks` field: "MADCR-036, Title ERD"
- **Source B:** `MADCR-036` row, MADCR v1.1 §6.4, formal `Depends On` field: "—" (none)
- **Exact conflict:** `046` claims to block `036` (the register's highest-fan-out item); `036` records no such prerequisite
- **Authority level A:** Level 7 (MADCR v1.1, free-text field)
- **Authority level B:** Level 7 (MADCR v1.1, formal field — same document, higher-precision field)
- **Canonical candidate:** Ambiguous — both fields are from the same Level-7 document; the formal `Depends On` field is the more precisely-designed field per MADCR's own methodology (ADR Sequencing Plan §6 treats `Depends On` as authoritative for graph construction), suggesting **B is the working canonical candidate**, but this is a recommendation for the Board, not a resolution
- **Unresolved question:** Does `MADCR-046` genuinely need to close before `MADCR-036`, or is the free-text field simply imprecise?
- **Required owner decision:** MADCR Document Custodian (documentation hygiene) and/or Architecture Review Board (if a genuine ordering dependency exists)
- **Downstream impact:** LOW if free-text is imprecise (both already scheduled in the same Batch 1); MODERATE if a real ordering dependency exists (would require Board to sequence `046` strictly before `036` within the session)
- **Recommendation:** Discuss both in the same Board session; explicitly confirm or deny the ordering dependency as part of that session's minutes — **not decided here**

---

## CR-02 — MADCR-049 ↔ MADCR-014/023 Cross-Batch Dependency

- **Source A:** `MADCR-049` row, MADCR v1.1 §6.5, free-text `Blocks` field: "MADCR-014, MADCR-023"
- **Source B:** `MADCR-014` and `MADCR-023` rows, MADCR v1.1 §6.2/§6.3, formal `Depends On` fields: "—" / "MADCR-022" respectively (neither lists `049`)
- **Exact conflict:** Same pattern as CR-01, but `014`/`023` are sequenced in **Batch 2**, one batch later than `049`
- **Authority level A/B:** Both Level 7
- **Canonical candidate:** Ambiguous, same reasoning as CR-01
- **Unresolved question:** Should Batch-2 approval of `014`/`023` wait on Batch-1 `049`'s resolution?
- **Required owner decision:** Architecture Review Board
- **Downstream impact:** **MODERATE-HIGH** — this is the only Batch-1 dependency discrepancy with cross-batch consequence; if real, it would require adjusting the Batch 2 approval gate
- **Recommendation:** Board explicitly discusses this before Batch 2 *approval* proceeds — does not block Batch 1 or Batch 2 *drafting*

---

## CR-03 — MADCR-010 ↔ MADCR-002 Dependency Field Incompleteness

- **Source A:** `MADCR-010` row, free-text `Blocks` field: "MADCR-002,009,055; M14 ERD"
- **Source B:** `MADCR-002` row, formal `Depends On` field: "MADCR-011" only (no `010`)
- **Exact conflict:** `010` claims to block `002`; `002` does not record this
- **Authority level A/B:** Both Level 7
- **Canonical candidate:** B (formal field) is the working candidate, same reasoning as CR-01
- **Unresolved question:** Is there a genuine secondary dependency of `002` on `010`, or is `010`'s free-text field simply over-inclusive?
- **Required owner decision:** MADCR Document Custodian
- **Downstream impact:** LOW — `002` is already sequenced in Batch 2 regardless
- **Recommendation:** MADCR v1.2 hygiene pass

---

## CR-04 — MADCR-011 ↔ MADCR-053/055 Dependency Field Incompleteness

- **Source A:** `MADCR-011` row, free-text `Blocks` field: "MADCR-002,003; Payment ERD" (does not name `053` or `055`)
- **Source B:** `MADCR-053` and `MADCR-055` rows, formal `Depends On` fields both explicitly list `MADCR-011`
- **Exact conflict:** `011`'s summary field under-states its own true fan-out relative to two Batch-4 items that correctly cite it
- **Authority level A/B:** Both Level 7
- **Canonical candidate:** B (the two Batch-4 items' formal fields, which are more complete)
- **Unresolved question:** None substantive — this is a completeness gap in `011`'s own summary field, not a contradiction
- **Required owner decision:** MADCR Document Custodian
- **Downstream impact:** LOW
- **Recommendation:** MADCR v1.2 hygiene pass — new finding this cycle, extends the pattern already logged as `DISC-06/07/08/11`

---

## CR-05 — AEP-MON-001 ↔ AEP-MON-002 (Commercial AEP relationship)

- **Source A:** `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md` (broad, Payment-Gateway-deep)
- **Source B:** `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` (narrow, BR-001–151-operational-deep)
- **Exact conflict:** No explicit supersession statement in either direction; Free Bonus/add-on model framed as "ADR candidate" in A vs "Locked Business Direction" in B (terminology/authority mismatch, `DISC-05`)
- **Authority level A/B:** Both Level 8/9 (Draft/Proposed AEP)
- **Canonical candidate:** **Neither confirmed superseding** — per full 11-dimension comparison (`COMMERCIAL-AEP-RECONCILIATION-v1.0.md`), the relationship is best classified **OVERLAPPING/COMPLEMENTARY**, not conflicting in substance
- **Unresolved question (= `OPEN-C01`):** What is the intended relationship — are they two complementary layers, or does one take precedence where they differ in framing?
- **Required owner decision:** Business Owner (intent clarification) → Document Custodian (metadata update)
- **Downstream impact:** Affects confidence in `MADCR-011`'s evidentiary chain (§02); does not block `MADCR-010/011` drafting
- **Recommendation:** Clarify before `MADCR-011` moves to *approval*, per prior cycle's finding — **not resolved here**

---

## CR-06 — DUAL ADR NUMBERING SCHEME (NEW, MAJOR FINDING THIS PASS)

- **Source A:** `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md` — self-declared scope: **"29 dari 29 ADR arsitektur/teknis"** (architecture/technical ADRs specifically), using an internally-independent sequential numbering 001–029
- **Source B:** `docs/00-governance/decision-log-FINAL.md` — self-declared scope: **"seluruh keputusan penting proyek — teknis maupun non-teknis"** (all significant project decisions, technical AND non-technical), using its own sequential numbering 001–047, confirmed by direct header inspection this pass (47 headers, `ADR-001` through `ADR-047`, zero gaps)
- **Exact conflict:** The SAME underlying decisions carry DIFFERENT numbers in the two files for at least 8 confirmed cases: Search Strategy (A:`005` / B:`039`), Job Queue (A:`006` / B:`040`), Maps Provider (A:`008` / B:`041`), Caching (A:`018` / B:`042`), Organization Model (A:`026` / B:`043`), Organization Authorization (A:`027` / B:`044`), AI Assistant BYOK (A:`028` / B:`045`), Image Duplicate Detection (A:`029` / B:`047`). **This is explicitly acknowledged and cross-referenced in both source documents** (e.g., decision-log's `ADR-044` entry, line 1484, verbatim: *"Sumber utama keputusan ini adalah `architecture-decision-records.md` ADR-027... yang menggunakan skema penomoran ADR independen dari `decision-log.md`... Tidak menggantikan (Supersedes/Replaces) ADR manapun"*) — **this is a deliberate, documented dual-numbering convention, not an undetected error**
- **Authority level A:** Level 3 (Approved Technology Decisions, architecture-specific curated subset)
- **Authority level B:** Level 0-adjacent — decision-log explicitly states its own role is NOT to supersede other documents but to explain the "why" behind them (*"Decision Log tidak menggantikan dokumen manapun di atas"*) — functionally a Level-1/2 supporting rationale log rather than a competing authority
- **Canonical candidate:** **Neither is wrong** — they measure different things: B (`decision-log`, 47 entries) is the complete master log of all project decisions; A (`architecture-decision-records`, 29 entries) is a curated, independently-renumbered subset specifically scoped to architecture/technical decisions, with 8 confirmed cross-references and an unconfirmed number of additional decision-log-only entries (e.g., `ADR-029`="Migration Murni SQL" in B, `ADR-030`-`037` covering UUID-PK/soft-delete, rendering strategy, role model, Manager scope, DBR tenor units, city FK migration, review/rating feature flag, governance hierarchy — **none of which appear to have a direct counterpart in A**, though this was not exhaustively verified for all 47 entries in this pass)
- **Unresolved question:** What is the single canonical count of "total ADRs" for RumahAgen — 29 (architecture/technical subset) or 47 (complete decision log)? And which numbering scheme should a **new** ADR (e.g., for `MADCR-010/011/036/046`) follow — continue A's curated sequence (next = `030` within A's own scheme) or B's master sequence (next = `048`)?
- **Required owner decision:** Document Custodian / Architecture Review Board — this is a governance-convention decision, not an architecture decision
- **Downstream impact:** Does not block any Batch-1 candidate's drafting (none reference an existing ADR number). **Does affect what number a future APPROVED ADR for `MADCR-010/011/036/046` would receive** — this must be clarified before final ADR numbering, not before drafting
- **Recommendation:** Escalate as its own governance-hygiene item; in the interim, this audit's draft ADRs (§10) use **provisional placeholder identifiers** (`MADCR-XXX` retained, no `ADR-NNN` number assigned) — consistent with the standing rule "MADCR ID ≠ ADR ID... Final ADR number must follow repository ADR numbering convention" (ADR Sequencing Plan §25), now clarified to mean **one of two existing conventions, not yet chosen between**

---

## CR-07 — AEP-ORG-001 Document-Status Mismatch (carried forward, re-verified)

- **Source A:** `Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md` — status field: "Draft — menunggu ARB sign-off"
- **Source B:** `docs/02-architecture/SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5.12 — treats Organization as integrated via `ADR-026`/`ADR-027` (Approved); decision-log confirms via its own `ADR-043`/`ADR-044` cross-referenced entries
- **Exact conflict:** Source document's own status label is stale relative to the decision it proposed, which is Approved in **both** ADR numbering schemes (A: 026/027; B: 043/044)
- **Authority level A:** Level 8 (Draft AEP artifact label)
- **Authority level B:** Level 2/3 (Approved Architecture Decision, confirmed in both files)
- **Canonical candidate:** B — the decision is Approved; only the AEP document's own metadata is outdated
- **Unresolved question:** None substantive — this is a `DOCUMENT GOVERNANCE STATUS MISMATCH`, not a content conflict
- **Required owner decision:** Document Custodian
- **Downstream impact:** None functional (Organization architecture is not in doubt); documentation clarity only
- **Recommendation:** Document Custodian updates `AEP-ORG-001`'s status field to "Approved via ADR-026/027 (or ADR-043/044 per decision-log)" — **not performed here**
