# RUMAHAGEN — ARB-01 ACTIVE GOVERNANCE RECORD
## CR-06 — Canonical Decision Register / ADR Register Governance

**Document ID:** ARB-01-ACTIVE-CR06  
**Decision Record:** ARB-DECISION-RECORD-001  
**ARB Batch:** Batch-1  
**Decision Scope:** Governance / Decision Identity / Register Canonicalization  
**Status:** **ACTIVE — CANONICAL GOVERNING DECISION**  
**Formal Approval:** Project Owner  
**Approval Basis:** Explicit formal approval recorded in ARB Batch-1 Session 01

---

## 1. Executive Decision

RumahAgen establishes **one new Canonical Decision Register** as the canonical authority for project decisions.

The canonical identifier is:

`CDR-XXX — Canonical Decision Record`

The historical Architecture ADR Register and historical Master Decision Log remain preserved as historical/legacy source records. They are not destructively deleted or renumbered.

This decision authorizes the **canonicalization and reconciliation workstream**. It does **not** by itself authorize implementation changes.

---

## 2. Formal Approval

The Project Owner formally approved:

> “ARB-DECISION-RECORD-001 (CR-06) sebagai keputusan governing untuk arah Canonical Decision Register RumahAgen dan mengizinkan pekerjaan canonicalization/reconciliation selanjutnya sesuai constraint dan downstream gate yang telah ditetapkan.”

Therefore:

- `DECIDED` → complete
- `APPROVED` → complete
- `ACTIVE` → **YES**
- Canonical governing authority → **ACTIVE**

---

## 3. Approved Governance Rules

### 3.1 One Canonical Register

The Architecture ADR Register and Master Decision Log are no longer treated as two separate canonical authorities.

They remain preserved as historical records.

### 3.2 New Canonical Register

A new Canonical Decision Register will be established.

Neither legacy register is automatically selected as the numbering backbone.

### 3.3 Canonical Identifier

Primary identifier:

`CDR-XXX`

`CDR` means **Canonical Decision Record**.

Decision type remains a separate field.

Examples of decision type may include:

- ARCHITECTURE
- BUSINESS
- PRODUCT
- GOVERNANCE

The type must not be inferred merely from the CDR prefix.

### 3.4 Historical IDs Are Immutable

Historical identifiers remain preserved.

No destructive operation may:

- erase a legacy ID;
- silently rename it;
- overwrite its historical meaning;
- remove its traceability.

### 3.5 One Underlying Decision = One CDR

Two historical records may be mapped to one CDR only when evidence establishes that they represent the same underlying decision.

Number similarity alone is insufficient.

### 3.6 Unmapped Historical Records

Historical entries that cannot yet be reconciled remain:

`UNMAPPED — REQUIRES RECONCILIATION`

No CDR may be assigned through assumption.

### 3.7 CDR Assignment

A CDR number is assigned when a decision formally enters the `CANDIDATE` state.

The identifier is never reused.

### 3.8 Rejected / Withdrawn Records

`REJECTED` and `WITHDRAWN` CDRs remain retained for auditability.

Their identifiers are never reused.

### 3.9 Canonical Governing State

Only:

`ACTIVE`

is the canonical governing state.

Therefore:

`DECIDED ≠ APPROVED`

`APPROVED ≠ ACTIVE`

`ACTIVE ≠ IMPLEMENTATION READY`

`IMPLEMENTATION READY ≠ BOLT READY`

---

## 4. Canonical Lifecycle

```text
CANDIDATE
    │
    ▼
UNDER REVIEW
    │
    ├──────────────► DEFERRED
    │
    ├──────────────► WITHDRAWN
    │
    ▼
DECIDED
    │
    └──────────────► REJECTED
    │
    ▼
APPROVED
    │
    ▼
ACTIVE
    │
    ▼
SUPERSEDED
```

A rejected or withdrawn record remains in the historical record.

A superseded record remains traceable to the decision that replaced it.

---

## 5. Historical Traceability Model

Each canonical record should support, where applicable:

```text
CDR ID
│
├── Decision Type
├── Legacy Architecture ADR ID
├── Legacy Decision Log ID
├── MADCR ID
├── Evidence References
├── Decision Authority
├── Decision Date
├── Lifecycle Status
├── Supersession Relationship
└── Downstream Impact References
```

The mapping must be evidence-based.

---

## 6. Authorization Boundary

### Authorized by this ACTIVE decision

The following workstreams are authorized:

- canonical register specification;
- historical cross-mapping;
- evidence reconciliation;
- CDR mapping;
- canonicalization planning;
- dependency reconciliation planning.

### Not authorized by this decision

This decision does **not** authorize:

- destructive historical renumbering;
- silent ADR rewriting;
- ERD changes;
- API changes;
- RBAC/RLS changes;
- PRD changes;
- UI changes;
- database migrations;
- production implementation;
- Bolt implementation;
- approval of MADCR-010;
- approval of MADCR-011;
- approval of MADCR-036;
- approval of MADCR-046;
- resolution of MADCR-049.

Each downstream architectural or business decision remains subject to its own ARB/authority process.

---

## 7. Required Next Workstream

The next authorized governance activity is:

### Canonicalization & Reconciliation Workstream

```text
CR-06 ACTIVE
      │
      ▼
Historical Cross-Mapping
      │
      ▼
Evidence Reconciliation
      │
      ▼
Canonical CDR Mapping
      │
      ▼
Canonical Register Draft
      │
      ▼
Review / Validation
      │
      ▼
Migration Authorization
      │
      ▼
Repository Mutation
```

No repository mutation should be inferred merely because this decision is ACTIVE.

---

## 8. Historical Records With Evidence Gaps

The existing decision package identified historical Decision Log entries that had not been exhaustively mapped.

Those entries must remain explicitly marked as unresolved until evidence is recovered.

They must not be converted into canonical CDR records merely to make the register appear complete.

---

## 9. Downstream Readiness Gates

The following gates remain separate:

```text
CDR ACTIVE
    ↓
Canonicalization
    ↓
Dependency Reconciliation
    ↓
Architecture Impact Analysis
    ↓
ARCHITECTURE READY
    ↓
IMPLEMENTATION READY
    ↓
BOLT READY
```

No gate may be skipped by interpreting `ACTIVE` as implementation authorization.

---

## 10. Integrity / Audit Rules

The following are mandatory:

1. Every CDR must have a unique identifier.
2. CDR identifiers are never reused.
3. Historical IDs remain traceable.
4. Evidence gaps remain explicit.
5. No decision may be silently promoted from draft to ACTIVE.
6. ACTIVE status requires formal approval.
7. CDR identity and decision type are separate concepts.
8. Canonicalization must preserve historical provenance.
9. Downstream implementation requires separate readiness authorization.
10. AI-generated synthesis cannot become canonical governance evidence without source support.

---

## 11. ARB-01 Session Decision Trail

The recorded decisions were:

| Question | Decision |
|---|---|
| Q1 — One canonical register? | **YES** |
| Q2 — New canonical register? | **YES** |
| Q3 — Primary identifier? | **CDR-XXX** |
| Q4 — Canonicalization rules? | **APPROVED** |
| Q5-A — Assign CDR at Candidate? | **YES** |
| Q5-B — Retain Rejected/Withdrawn? | **YES** |
| Q5-C — ACTIVE is governing state? | **YES** |

---

## 12. Final Status

# **ACTIVE — CANONICAL GOVERNING DECISION**

**Decision:** ARB-DECISION-RECORD-001  
**Change Request:** CR-06  
**Scope:** Canonical Decision Register governance  
**Authority:** Project Owner / ARB  
**Downstream canonicalization:** **AUTHORIZED**  
**Implementation authorization:** **NOT AUTHORIZED**  
**Bolt authorization:** **NOT AUTHORIZED**

---

## 13. Next ARB Agenda

With CR-06 ACTIVE, the next ARB agenda item is:

# ARB-02 — MADCR-036
## Title Definition vs Award Instance

ARB-02 must be handled independently.

CR-06 provides the governance mechanism for recording the decision; it does not predetermine the architectural answer to MADCR-036.
