# RUMAHAGEN — ARB-02 ACTIVE DECISION RECORD
## MADCR-036 — Title Definition vs Award Instance

**Document ID:** ARB-02-MADCR-036-ACTIVE  
**Decision Record:** MADCR-036  
**ARB Batch:** Batch-1 Foundation  
**Decision Status:** **ACTIVE — CANONICAL GOVERNING DECISION**  
**Decision Type:** Architecture  
**Domain:** M15 — Title  
**Decision Scope:** Title Definition / Award Instance semantic separation  
**Formal Approval:** Project Owner / ARB

---

## 1. Decision Statement

RumahAgen formally adopts the separation between:

`TITLE DEFINITION ≠ AWARD INSTANCE`

as an **immutable semantic architectural invariant** for M15 — Title.

The invariant is semantic/domain-level. It does not prescribe a particular database schema, table name, API structure, ORM model, storage mechanism, or other physical implementation.

An earned Award Instance must retain sufficient minimal historical provenance to identify the applicable Title Definition and applicable definition/rule version under which the award was earned.

---

## 2. Formal ARB Decisions

### Q1 — Adopt Definition/Instance separation

**DECISION: A — ADOPT**

Title Definition and Award Instance are separate semantic concepts.

### Q2 — Invariant strength

**DECISION: A — IMMUTABLE ARCHITECTURAL INVARIANT**

The separation must not be removed or collapsed into a single semantic lifecycle object without a new architecture review/decision.

### Q3 — Scope of immutability

**DECISION: A — SEMANTIC INVARIANT ONLY**

The architectural invariant applies to the domain meaning/boundary.

The following remain evolvable unless governed by another decision:

- physical ERD;
- database schema;
- table names;
- API structure;
- storage strategy;
- ORM/model implementation;
- service boundaries.

### Q4 — Historical provenance/version

**DECISION: A — REQUIRED**

An Award Instance must retain sufficient provenance to identify the applicable Title Definition / definition-rule version under which it was earned.

### Q5 — Provenance scope

**DECISION: A — MINIMAL PROVENANCE**

The invariant requires semantic traceability to:

`Title Definition + Applicable Version`

It does not, by this decision alone, require full awarding context.

### Q6 — Rename behavior

**DECISION: B — BUSINESS RULE**

Rename behavior remains governed by the authoritative Title Business Rules and is not elevated into an additional architectural invariant by MADCR-036.

### Q7 — Historical preservation / retirement

**DECISION: B — BUSINESS RULE**

Retirement, deactivation, catalog behavior, and hard-delete prohibition remain governed by the applicable Title Business Rules and are not elevated into additional architectural invariants by MADCR-036.

### Q8 — Credential relationship

**DECISION: B — BUSINESS RULE**

The Title ↔ Credential relationship remains governed by the applicable business/domain rules and is not locked as an architectural invariant by MADCR-036.

---

## 3. Canonical Architectural Invariants

Only the following are locked by MADCR-036:

### Invariant 1 — Definition/Instance separation

```text
TITLE DEFINITION
       ≠
AWARD INSTANCE
```

### Invariant 2 — Semantic boundary

The distinction is a domain/semantic invariant, not a prescribed physical implementation.

### Invariant 3 — Minimal historical provenance

```text
AWARD INSTANCE
      │
      ├── TITLE DEFINITION
      │
      └── APPLICABLE VERSION
```

Historical award meaning must not depend solely on the current version of a Title Definition.

---

## 4. Explicit Non-Decisions

MADCR-036 does **not** decide:

- final entity names;
- final table names;
- primary/foreign key design;
- cardinality;
- physical ERD;
- database migration;
- API contracts;
- service boundaries;
- RBAC;
- RLS;
- UI;
- storage technology;
- snapshot vs FK vs event implementation;
- full awarding context;
- evaluator/approval-chain modeling;
- credential relationship implementation;
- retirement/deactivation implementation.

These remain subject to downstream architecture/business decisions.

---

## 5. Business Rule Boundary

The following remain outside the architectural invariant scope of MADCR-036:

```text
Rename behavior
Retirement / deactivation
Catalog visibility
Hard-delete prohibition
Title ↔ Credential relationship
```

This boundary is intentional.

MADCR-036 establishes the foundation needed by downstream Title/Award decisions without absorbing the entire M15 business-rule surface.

---

## 6. Conceptual Model

```text
┌──────────────────────────┐
│      TITLE DEFINITION    │
│                          │
│ identity / definition    │
│ rules / version          │
│ lifecycle / catalog     │
└────────────┬─────────────┘
             │
             │ applicable definition/version
             ▼
┌──────────────────────────┐
│       AWARD INSTANCE     │
│                          │
│ earned occurrence        │
│ recipient                │
│ awarded-at               │
│ historical provenance    │
└──────────────────────────┘
```

This is a semantic model, not a final physical ERD.

---

## 7. Evidence Basis

The decision is grounded in the authoritative MADCR-036 evidence package and its Title Rules.

The evidence establishes:

- Title Definition and earned Award Instance are distinct concepts.
- Title may stand alone or relate to Credential.
- Material changes can produce a new Title/Awarding Rule version while prior awards retain their historical version context.
- Rename is not a new award.
- Previously awarded Titles have historical lifecycle considerations.

MADCR-036 was identified as a high-impact foundation decision with downstream reach across the Title architecture.

No unsupported implementation detail is introduced by this record.

---

## 8. Downstream Impact

MADCR-036 is a prerequisite/foundation for downstream Title/Award decisions, including the dependency set identified in the evidence package.

The architectural decision should be consumed by downstream work without treating the downstream ERD/API/RBAC details as already decided.

The downstream dependency register must continue to be reconciled against the canonical decision register established by CR-06.

---

## 9. Decision Consequences

### Positive

- Clear distinction between reusable Title definitions and earned historical occurrences.
- Historical award provenance can remain stable across definition/version changes.
- Downstream Title/Award design has a stable semantic foundation.
- Physical implementation remains free to evolve.
- Business-rule concerns remain separated from architecture invariants.

### Constraints

- Downstream designs must preserve semantic separation.
- Award Instance designs must support minimum provenance.
- A future architecture decision that intentionally collapses the semantic distinction must undergo formal review.

---

## 10. Readiness Boundary

MADCR-036 being ACTIVE means:

**AUTHORIZED**

- use this decision as canonical architectural input;
- draft/reconcile downstream architecture decisions;
- perform dependency and impact analysis based on this invariant.

**NOT AUTHORIZED solely by MADCR-036**

- production implementation;
- database migration;
- final ERD publication;
- API implementation;
- RBAC/RLS implementation;
- Bolt implementation.

Those require their own readiness/approval gates.

---

## 11. Formal Approval

The Project Owner formally approved activation of MADCR-036 after the eight ARB questions were decided.

**Approval status:** APPROVED

**Canonical status:** ACTIVE

**Authority:** Project Owner / ARB

**Approval scope:** The exact decision and boundaries recorded in this document.

---

## 12. Final Status

# ACTIVE — CANONICAL GOVERNING DECISION

`MADCR-036` is now an ACTIVE architectural decision for RumahAgen.

It must be treated as canonical input by downstream decision-making until superseded by a formally approved and activated architecture decision.

---

## 13. Next Governance Step

The next downstream activity is reconciliation and drafting of the dependent Title/Award decisions.

MADCR-036 must not be used to infer decisions that are explicitly listed above as non-decisions.

