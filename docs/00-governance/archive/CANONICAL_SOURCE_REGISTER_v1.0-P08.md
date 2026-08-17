# RUMAHAGEN — CANONICAL SOURCE REGISTER
## Wave 1 Artifact 07 — v1.0-P08

**Date:** 17 August 2026  
**Status:** **DONE — LOCAL CANONICAL ARTIFACT**  
**Scope:** Wave 1 Governance / Project-Control Canonical Closure  
**Purpose:** Menetapkan source authority per truth domain setelah Constitution, Governance Register, Manifest, Current Project State, Decision Log, dan Changelog Wave 1 diperbarui.

---

# 1. AUTHORITY PRINCIPLE

The Canonical Source Register is an **authority map**, not a replacement for source documents.

The project must distinguish:

```text
Decision Authority
        ↓
Canonical Semantic Architecture
        ↓
Intended Physical Model
        ↓
Executed Development State
        ↓
Runtime Verified State
```

A lower layer cannot silently override a higher layer.

The project-wide control plan requires reconciliation across governance, product, architecture, AEP/MADCR/ADR, technical execution, GitHub, project source, and Supabase Development before the final Canonical Project Baseline is declared. fileciteturn197file6

---

# 2. SOURCE AUTHORITY MATRIX

| Truth Domain | Primary Authority | Supporting / Propagation Sources | Actual-State Authority | Rule |
|---|---|---|---|---|
| Business Rules | Locked Master Business Rules BR-001–BR-151 | approved MADCR/AEP/Decision Log where they explicitly affect rules | actual implementation only for drift/gap evidence | Implementation must not silently redefine locked rules |
| Approved Architecture Decisions | Approved MADCR / ADR / Decision Log within explicit scope | MAEP / Cross-AEP consolidation | implementation as evidence only | Later approved decision supersedes only within its explicit boundary |
| Architecture Evolution | AEP #1–#4 + approved MADCR/ADR | Cross-AEP / MAEP reconciliation | downstream artifacts show propagation state | AEP is governing input, not an invitation to create a new AEP |
| Project Governance | Project Constitution | Governance Register, Decision Log, Changelog | N/A | Constitution governs project-wide engineering/governance rules |
| Document Lifecycle | Document Governance & Baseline Register | Constitution, Manifest | N/A | Version/status/lifecycle follows document governance |
| Project Inventory / Index | Project Manifest | Dependency Manifest, Current Project State | repository/source evidence | Manifest is project-control index, not runtime truth |
| Current Physical / Project State | Current Project State | TECH/runtime evidence, Manifest | Supabase Development + verified technical evidence | Reports actual state; does not redefine semantic decisions |
| Technical Architecture | System Architecture + approved Technical Decisions/ADR | ERD, API, RBAC, DB Dictionary | actual implementation for drift | Intended architecture must be separated from executed state |
| Logical Data Model | ERD | DB Dictionary, System Architecture, approved decisions | actual DB for drift/schema evidence | Do not rewrite intended model solely from actual DB drift |
| Database Definition | Database Dictionary + approved migration/schema artifacts | ERD, Technical Specification | executed Supabase Development schema | Actual DB establishes executed state, not automatically design authority |
| API Contract | Approved API Specification | System Architecture, PRD, User Flow, Technical Specification | source/runtime implementation for drift | Runtime cannot silently redefine approved contract |
| Authorization Semantics | Approved Authorization/RBAC baseline + MADCR/ADR decisions | RBAC catalogue, System Architecture | executed RLS/RBAC evidence | Actual permissions reveal implementation gaps; do not silently create new roles |
| Product Requirements | PRD | Business Rules, User Flow, approved decisions | implementation for gap evidence | Product implementation must trace to approved requirements |
| User Interaction | User Flow | PRD, UI Specification | frontend runtime when verified | Runtime evidence does not silently alter approved product semantics |
| UI Specification | UI Specification | PRD, User Flow, design artifacts | frontend implementation | UI drift is implementation evidence unless formally approved |
| Planning / Delivery | Development Roadmap / Playbook / Module Planning | Task Template, validation planning | actual execution state | Planning is not approval authority |
| Decision Chronology | Decision Log | ADR/MADCR/AEP references | N/A | Append-only; historical decisions are not rewritten |
| Change Chronology | Changelog | Decision Log, document revisions | N/A | Append-only; records actual completed changes |
| Technical Execution | TECH artifacts and explicit execution gates | migrations, seed packages, validation artifacts | Supabase Development/runtime evidence | TECH status cannot be inferred from documentation alone |
| Source Code | GitHub repository + project source corpus | task/technical artifacts | running application when runtime verified | Repository is read-only reference during current Wave 1 pass |
| Development Database | Supabase Development | migration/seed evidence, TECH artifacts | actual Supabase state | Supabase Main = DEVELOPMENT; never silently call it production |
| Runtime | Verified runtime evidence | TECH runtime artifacts, frontend source | actual executed application/environment | No runtime PASS from static inspection alone |
| Historical Evidence | Historical baseline / archived artifacts | Changelog, prior snapshots | N/A | Preserved for provenance; does not override later governing records |

---

# 3. DOCUMENT-STATE DIMENSIONS

The following dimensions are intentionally separate:

| Dimension | Meaning |
|---|---|
| **Document Version** | Formal version according to the document's lifecycle |
| **Synchronization State** | Process state such as D6 or P08 |
| **Baseline Status** | Draft / Approved / Baseline / Deprecated / Archived |
| **Local Artifact Completion** | Reconciled + internally validated + saved locally |
| **Repository Promotion State** | Whether the local artifact has been promoted to GitHub |

### Binding rule

> **Repository Promotion State must not determine Local Artifact Completion.**

The owner-approved Option C and Wave 1 governance rule explicitly separate these dimensions.

GitHub is therefore used as a reference/evidence source in this pass. Final local artifacts will be promoted later through local Git/Git Bash.

---

# 4. HISTORICAL PRESERVATION RULE

Historical artifacts remain available as provenance.

Examples:

```text
Constitution rev. prior
Governance Register rev. prior
Manifest rev. prior
Current Project State rev.11
legacy ADR corpus
AEP #1–#4
MADCR history
TECH history
```

A later canonical artifact does not erase the historical artifact.

The Project Knowledge Refresh explicitly states that historical snapshots remain audit evidence and do not override later governing records. fileciteturn197file0

---

# 5. CURRENT WAVE 1 CANONICAL ARTIFACTS

| Artifact | Current Wave 1 Local Version | Status |
|---|---:|---|
| Project Constitution | v1.11 | DONE |
| Document Governance & Baseline Register | v1.13 | DONE |
| Project Manifest | v1.30 | DONE |
| Current Project State | rev.12 | DONE |
| Decision Log | Wave 1 append | DONE |
| Changelog | v0.7.22 append | DONE |
| Canonical Source Register | v1.0-P08 | DONE |
| Wave 1 Final Reconciliation | pending | NEXT |

These artifacts together form the **Wave 1 governance/project-control closure set**. They do not yet constitute the final full Canonical Project Baseline required by Phase 08 of the wider synchronization plan.

---

# 6. CURRENT KNOWN RESIDUALS

This register does not close residuals merely by listing them.

Carry forward:

- OPEN-C01 / MADCR-012 provenance/relationship;
- MBR-COM-001–013 provenance/content where not formally locked;
- AEP3 physical residuals;
- AEP4 provider capability/failover residuals;
- exact downstream permission IDs where not approved;
- frontend runtime entry point/runtime verification;
- physical Commercial/Payment synchronization not yet executed;
- production authorization/migration gates.

The Knowledge Refresh explicitly states that physical baseline synchronization and implementation authorization were not granted by that refresh. fileciteturn197file7

---

# 7. NON-AUTHORITY SOURCES

The following must not silently become authority:

- filename alone;
- D6 filename suffix alone;
- an outdated document copied with a newer file timestamp;
- an implementation artifact that contradicts an approved semantic decision;
- a planning document treated as approval;
- a migration candidate treated as executed state;
- GitHub presence treated as runtime proof;
- Supabase presence treated as production authorization.

---

# 8. CONFLICT HANDLING

When sources conflict:

```text
Conflict
   ↓
Classify truth domain
   ↓
Identify primary authority
   ↓
Check approved decision
   ↓
Compare downstream propagation
   ↓
Classify:
MATCH / DRIFT / SUPERSEDED /
OPEN DECISION / IMPLEMENTATION GAP
   ↓
Record resolution
   ↓
Update affected canonical artifact
```

No silent overwrite is permitted.

---

# 9. WAVE 1 COMPLETION GATE

This register is **DONE locally**.

Wave 1 remains open only for its final cross-document reconciliation:

```text
01 Constitution                  DONE
02 Governance Register           DONE
03 Project Manifest              DONE
04 Current Project State         DONE
05 Decision Log                  DONE
06 Changelog                     DONE
07 Canonical Source Register     DONE
08 Final Wave 1 Reconciliation   NEXT
```

The final reconciliation must verify that the seven completed artifacts do not contradict one another and that all known residuals are explicitly carried forward.

---

# 10. GATE RESULT

> **CANONICAL SOURCE REGISTER v1.0-P08 = DONE — LOCAL CANONICAL ARTIFACT**

No new architecture decision was created by this register.

No AEP, MADCR, ADR, TECH, T1–T4 or other historical identifier was renumbered.

The next and final Wave 1 activity is:

> **Artifact 08 — Wave 1 Final Cross-Document Reconciliation**
