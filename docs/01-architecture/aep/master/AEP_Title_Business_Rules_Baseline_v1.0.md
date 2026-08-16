# ARCHITECTURE EVOLUTION PROPOSAL
## Title Business Rules Baseline v1.0

**Document Type:** Architecture Evolution Proposal (AEP)
**Domain:** Title / Achievement / Awarding System
**Baseline Input:** Title Business Rules Baseline v1.0 — Rules 001–100
**Status:** Proposed
**Version:** 1.0
**Purpose:** Define the architectural evolution required to support the consolidated and conflict-resolved Title Business Rules Baseline.

---

# 1. Executive Summary

The Title Business Rules Baseline v1.0 establishes a Title system that is materially more capable than a simple badge or static achievement table.

The baseline requires the system to support:

- multiple Title authorities and scopes;
- configurable Awarding Paths;
- multiple qualification sources;
- prerequisites;
- Learning Points;
- assessment and evidence;
- multiple Awarding Paths for one Title;
- provenance;
- versioned Awarding Rules;
- persistent Award Instances;
- lifecycle states including Active, Expired, Revoked and Restored;
- appeal and Stay Policy;
- renewal, requalification, repeat awards and progression;
- independent Primary and Featured presentation;
- agent-controlled Featured ordering;
- historical retention;
- RBAC-controlled issuer and administrative actions.

Therefore, the existing architecture should not treat Title as a single flat attribute attached to an agent.

The target architecture should separate:

1. **Title Definition**
2. **Awarding Configuration / Awarding Path**
3. **Qualification / Evaluation**
4. **Award Instance**
5. **Award Provenance**
6. **Award Lifecycle**
7. **Appeal / Dispute**
8. **Presentation**
9. **Authority / Scope**
10. **Versioning and Audit**

This proposal does not directly finalize the ERD, database schema, API contract, or implementation details. It establishes the architectural direction and identifies the changes that those downstream documents must subsequently absorb.

---

# 2. Source of Truth and Scope

This AEP is derived from the consolidated Title Business Rules Baseline v1.0, Rules 001–100.

The business-rule decisions are treated as authoritative.

This proposal does not replace the Business Rules Baseline. It translates business-rule implications into architectural requirements.

## 2.1 Architectural interpretation principle

A business rule is not automatically a new technical component.

Each rule must first be classified as one or more of:

- business-only;
- configuration impact;
- data-model impact;
- workflow impact;
- authorization/RBAC impact;
- API impact;
- event/audit impact;
- architectural boundary impact.

Only rules that require structural technical change should drive architectural evolution.

---

# 3. Current-State Architectural Assumption

The current architecture is assumed to have a simpler Title representation in which an agent can be associated with earned Titles and profile presentation.

The exact current ERD, schema, API and implementation are not redefined by this document.

Accordingly, this AEP does not claim that a specific current table, endpoint, or service already exists unless supported by the current architecture documents.

The architectural gap is therefore expressed as a target capability gap rather than an unsupported claim about implementation details.

---

# 4. Business Rule Drivers

## 4.1 Authority and Scope

Rules 002, 025, 053, 071–074 and 079 require Title authority to be separated from Title ownership.

The architecture must support:

- RumahAgen authority;
- Partner authority;
- Agency/Organization authority;
- issuer identity;
- issuer scope;
- authorization boundary;
- scope-dependent Title behavior.

### Architectural implication

Authority should not be encoded only as a static Title attribute.

A dedicated authority/scope model or equivalent domain capability is required.

---

## 4.2 Title Definition vs Award Instance

Rules 003, 011–013, 021, 022, 023, 037–038, 051–052 and 093–095 establish a critical separation:

> A Title definition is not the same object as an earned Award Instance.

### Required conceptual separation

```text
Title Definition
      │
      ├── Awarding Paths
      │      └── Awarding Configuration / Version
      │
      └── Award Instances
             ├── Owner
             ├── Award Date
             ├── Lifecycle
             ├── Provenance
             └── Presentation eligibility
```

This separation is an architectural requirement.

---

# 5. Target Domain Model

The target architecture should conceptually contain the following domains/components.

## 5.1 Title Definition

Responsible for:

- Title identity;
- canonical name;
- display/short name;
- description;
- icon;
- category;
- authority;
- scope;
- lifecycle policy;
- validity policy;
- progression configuration;
- presentation eligibility policy.

Rules primarily driving this component:

001–005, 013, 021–024, 031–034, 055–070, 071–075, 091.

---

## 5.2 Awarding Path

Responsible for defining one qualifying route toward a Title.

A Title may contain multiple Awarding Paths.

Rules:

014, 021, 037–039, 042–050, 052.

### Required architectural characteristics

- configurable;
- versionable;
- independently identifiable;
- linked to a Title;
- capable of defining prerequisites;
- capable of referencing Learning Points;
- capable of referencing assessment;
- capable of defining evidence requirements;
- capable of supporting automatic/manual/verified/application flows.

---

## 5.3 Qualification / Awarding Evaluation

This component evaluates whether a subject satisfies an Awarding Path.

It should conceptually process:

```text
Event / Claim / Application
        ↓
Awarding Path
        ↓
Prerequisites
        ↓
Evidence
        ↓
Assessment
        ↓
Condition Evaluation
        ↓
Qualification Result
```

Rules:

014–020, 036–050.

The evaluation engine must support:

- AND;
- OR;
- grouped conditions;
- configurable prerequisites;
- completion-only paths;
- Learning Point conditions;
- assessment conditions;
- evidence policy;
- multiple qualifying paths.

Rule 049 explicitly excludes NOT conditions from the Awarding Condition model.

---

# 6. Award Instance Architecture

When an Awarding Path is successfully satisfied, the system should create or update an Award Instance according to Repeat/Renewal/Progression policy.

The Award Instance must preserve at minimum conceptually:

- Title identity;
- owner;
- award timestamp;
- effective lifecycle state;
- validity information;
- Awarding Path provenance;
- Awarding Rule version;
- issuer;
- scope;
- evidence/proof references where applicable;
- restoration/revocation history;
- presentation-relevant state.

Rules:

019, 021, 023–028, 035–040, 051, 075–078, 089–095.

---

# 7. Provenance Architecture

Rules 037–038 and 051 require provenance.

One Title may have multiple Awarding Paths.

A single event may trigger multiple Title Awards.

One Title must not automatically produce duplicate Awards simply because multiple paths were satisfied.

Therefore the architecture should distinguish:

```text
Award Instance
   │
   ├── Primary Awarding Path
   │
   └── Additional Qualifying Paths
```

This preserves explainability without creating duplicate Title ownership records.

---

# 8. Versioning Architecture

Rules 021 and 052 require versioning.

The architecture must distinguish at least:

### Title Identity

Stable identity of the Title.

### Title Presentation / Naming

Current canonical and display names.

### Awarding Rule Version

The exact business logic applicable when qualification occurred.

### Awarding Path Version

The version of the path used for evaluation.

### Award Instance

The historical result created under those versions.

### Resolution

Rename does not create a new Award.

Material Awarding Rule changes create a new version.

Therefore:

```text
Title Identity
   │
   ├── Current Name
   │
   ├── Awarding Path V1
   │      └── Awarding Rule V1
   │
   ├── Awarding Path V2
   │      └── Awarding Rule V2
   │
   └── Award Instances
          ├── Instance A → V1
          └── Instance B → V2
```

---

# 9. Lifecycle Architecture

Rules 004–005, 026–028, 035, 078, 083–090 and 091–092 require an explicit lifecycle model.

The architecture should not reduce lifecycle to a single `is_active` flag.

At minimum, the conceptual lifecycle must distinguish:

- Active;
- Expired;
- Revoked;
- Under Appeal / effective Stay state where applicable;
- Restored;
- Historical.

### Critical rule

Prerequisite expiration/revocation does not automatically invalidate an already earned Award.

This is established by Rule 040.

Therefore:

```text
Prerequisite State
        ≠
Award Instance State
```

unless the Title's own configured validity policy explicitly makes them coupled.

---

# 10. Revocation and Reinstatement

Rules 025–028 and 078–080 require controlled revocation.

The architecture must support:

- authorized revocation;
- issuer/scope validation;
- revocation timestamp;
- revocation reason;
- notification;
- appeal eligibility;
- reinstatement;
- presentation restoration;
- audit history.

Reinstatement restores the existing Award Instance rather than creating a new Award Instance.

---

# 11. Appeal and Stay Architecture

Rules 081–090 require a dedicated appeal workflow.

Conceptually:

```text
Revoked
   ↓
Appeal Window
   ↓
Appeal Submitted
   ↓
Issuer Review
   ↓
Optional RumahAgen Escalation
   ↓
Decision
 ┌─┴───────────────┐
 ▼                 ▼
Restore          Remain Revoked
```

Stay Policy controls the effective behavior during appeal.

Appeal Window is calculated from the **Revocation timestamp**, not notification delivery/opening.

This means notification infrastructure must not be the source of truth for appeal deadline calculation.

---

# 12. Presentation Architecture

Rules 003, 005–010, 027–030 and 094–100 require presentation state to be separated from award ownership.

The architecture should support:

```text
Award Instance
      │
      └── Presentation Preference
             ├── Primary: 0–1
             └── Featured: 0–3
```

Primary and Featured are independent.

The agent controls Featured ordering.

Removing a Featured Title does not modify:

- Award;
- Award Instance;
- validity;
- provenance;
- historical record.

This separation prevents presentation changes from mutating achievement records.

---

# 13. Expired vs Revoked Presentation

Rules 096–098 establish a deliberate distinction:

- Expired Title may remain Featured;
- Revoked Title cannot remain Featured;
- Expired status must be visibly clear;
- Under Appeal eligibility follows effective validity and Stay Policy.

Therefore presentation eligibility must be calculated from lifecycle state and policy, rather than stored as a permanent boolean alone.

---

# 14. Learning Architecture

Rules 041–047 establish Learning Points as an optional qualification mechanism rather than a universal Title requirement.

The architecture should allow:

```text
Learning Activity
      ↓
Learning Points
      ↓
Awarding Path Condition
      ↓
Qualification
```

Learning Points should not be consumed merely because they were used as a milestone/qualification metric.

Learning Point metric configuration must remain separate from the Award Instance lifecycle.

---

# 15. Assessment and Evidence

Rules 016, 018, 020, 042 and 043 require configurable assessment/evidence capabilities.

The architecture must support:

- evidence required/not required;
- evidence visibility;
- assessment required/not required;
- assessment criteria;
- completion-only paths;
- manual award exceptions where policy allows.

Public evidence exposure is not a universal requirement.

---

# 16. Category and Progression

Rules 031–035 require:

- one primary category per Title;
- optional additional category by scope;
- optional level/progression;
- sequential/direct/mixed progression;
- no automatic downgrade of earned Titles.

Progression must therefore not be implemented as a destructive replacement of the previous Title.

---

# 17. Multiple Award Instances

Rules 011, 093–095 require support for multiple Award Instances.

The architecture must distinguish:

```text
Same Title
   ├── Award Instance #1
   ├── Award Instance #2
   └── Award Instance #3
```

Whether multiple instances are created depends on Repeat/Renewal policy.

Presentation policy determines which instance, if any, is representative.

---

# 18. Historical Integrity

Rules 023–024 and 075–077 require historical integrity.

Once a Title has been awarded, the architecture must avoid destructive deletion of the historical Award Instance.

Removing a Title from the active catalog is not equivalent to deleting historical ownership.

Permanent deletion, where permitted, must be an exceptional controlled process.

---

# 19. RBAC and Authority Evolution

The Title architecture must integrate with the existing RBAC model.

At minimum, permissions must distinguish:

- agent/owner;
- issuer;
- agency/organization authority;
- partner authority;
- RumahAgen administrator;
- escalation authority.

RBAC must govern:

- Title creation;
- Title configuration;
- awarding;
- evidence access;
- revocation;
- reinstatement;
- appeal review;
- translation;
- presentation management.

The exact permission matrix remains a downstream artifact and should be updated after this AEP is approved.

---

# 20. Event and Audit Architecture

Rules 036, 052, 080, 089 and historical rules imply event/audit requirements.

The architecture should preserve meaningful domain events such as:

- AwardQualificationSucceeded;
- AwardIssued;
- AwardRevoked;
- AppealSubmitted;
- AppealReviewed;
- AwardReinstated;
- TitleExpired;
- FeaturedTitleChanged;
- PrimaryTitleChanged;
- FeaturedOrderChanged.

Events should not be treated as the sole source of current state unless the existing architecture explicitly adopts event sourcing.

The requirement here is **traceability and auditability**, not necessarily full event sourcing.

---

# 21. Configuration Architecture

A major architectural requirement from Rules 004, 011, 014–016, 033–034, 037, 039, 041–043, 047, 052, 085–087 and 091–094 is that many Title behaviors are configurable.

The architecture should therefore avoid hard-coding these behaviors directly into application logic.

Configurable policy areas include:

- lifecycle;
- awarding mechanism;
- self-claim;
- evidence;
- assessment;
- Learning Point metric;
- progression;
- prerequisites;
- repeat;
- renewal;
- validity;
- appeal attempts;
- appeal window;
- Stay Policy;
- presentation.

Configuration must remain bounded by platform-level governance rules.

---

# 22. Architectural Principles

The target evolution must preserve these principles.

### Principle 1 — Definition vs Instance

A Title definition must not be treated as an earned Award.

### Principle 2 — Qualification vs Lifecycle

Qualification determines whether an Award can be earned.

Lifecycle determines the current status of an existing Award.

### Principle 3 — Prerequisite vs Award Validity

A prerequisite changing state does not automatically change an earned Award unless the Award's own policy says so.

### Principle 4 — Award vs Presentation

Primary and Featured are presentation preferences, not evidence of ownership.

### Principle 5 — Identity vs Version

Title identity survives rename; material Awarding Rule changes create new versions.

### Principle 6 — History Is Durable

Historical Award Instances must remain explainable and traceable.

### Principle 7 — Authority Is Scoped

Issuer capability is governed by authority, scope and RBAC.

### Principle 8 — Configuration Over Hard Coding

Where the baseline explicitly says configurable, implementation should expose a governed configuration mechanism rather than embed the rule as immutable logic.

---

# 23. Architecture Impact Classification

| Area | Impact | Main Rules |
|---|---|---|
| Title Domain Model | HIGH | 001–005, 013, 021–024 |
| Award Instance Model | CRITICAL | 021, 023, 036–040, 089–095 |
| Awarding Engine | CRITICAL | 014, 036–050 |
| Awarding Path | CRITICAL | 037–039, 051–052 |
| Provenance | HIGH | 038, 051 |
| Versioning | HIGH | 021, 052 |
| Lifecycle | CRITICAL | 004–005, 026–028, 078, 083–092 |
| Appeal | HIGH | 081–090 |
| Presentation | HIGH | 003, 005–010, 027–030, 094–100 |
| Learning | MEDIUM/HIGH | 041–047 |
| Assessment | MEDIUM | 042–043 |
| Evidence | MEDIUM | 016–020 |
| Authority/RBAC | HIGH | 002, 018, 025, 053–054, 066, 079 |
| Scope | HIGH | 071–074 |
| History/Audit | HIGH | 023–024, 075–077, 089–090 |
| API | HIGH | Multiple domains |
| Event/Audit | HIGH | 036, 080, 089 |
| UI/Profile | HIGH | 006–010, 096–100 |

---

# 24. Required Downstream Document Changes

After AEP approval, the following documents should be updated in dependency order.

## Phase 1 — Architecture

1. System Architecture
2. Architecture Decision Records
3. Technology/Architecture Decision documentation

## Phase 2 — Data

4. ERD
5. Database Schema
6. Migration Plan

## Phase 3 — Access

7. RBAC / Permission Matrix
8. Authority and Scope model

## Phase 4 — Application Contract

9. API Specification
10. Event Contract / Audit Contract

## Phase 5 — Product

11. User Flow
12. PRD
13. UI/UX behavior specification

## Phase 6 — Engineering

14. Engineering Guidebook
15. Engineering Playbook
16. Test Strategy / Business Rule Test Matrix

The downstream documents must not independently reinterpret the business rules.

---

# 25. Migration Strategy Requirement

The AEP requires a migration assessment before implementation.

Existing Title/Award data must be evaluated for:

- Title identity mapping;
- Award Instance mapping;
- historical award date;
- issuer;
- scope;
- lifecycle state;
- existing presentation;
- missing Awarding Path;
- missing version;
- missing provenance;
- missing validity information.

Where historical data cannot fully reconstruct a new attribute, the migration strategy must define an explicit legacy/default state rather than fabricate historical facts.

---

# 26. Non-Goals

This AEP does not finalize:

- exact table names;
- exact column names;
- exact API URLs;
- exact frontend components;
- exact framework implementation;
- exact microservice boundaries;
- exact event broker technology;
- final permission IDs;
- final database indexes.

Those decisions belong to downstream architecture/design artifacts.

---

# 27. ADR Candidates

The following decisions should be promoted to ADRs during the next architecture phase:

### ADR Candidate 1
**Separate Title Definition from Award Instance**

### ADR Candidate 2
**Model Awarding Paths as Versioned Qualification Routes**

### ADR Candidate 3
**Persist Award Provenance**

### ADR Candidate 4
**Separate Award Lifecycle from Prerequisite Lifecycle**

### ADR Candidate 5
**Separate Presentation State from Award State**

### ADR Candidate 6
**Version Awarding Rules Without Creating New Title Identity**

### ADR Candidate 7
**Model Revocation and Appeal as Explicit Lifecycle Processes**

### ADR Candidate 8
**Support Multiple Award Instances**

### ADR Candidate 9
**Use Governed Configuration for Configurable Title Policies**

### ADR Candidate 10
**Preserve Historical Award Integrity**

---

# 28. AEP Decision

Based on the Title Business Rules Baseline v1.0, the architecture should evolve from a simple Title/achievement representation into a configurable Title Recognition domain with explicit separation between:

```text
TITLE DEFINITION
      ↓
AWARDING PATH
      ↓
QUALIFICATION
      ↓
AWARD INSTANCE
      ↓
LIFECYCLE
      ↓
PRESENTATION
```

with cross-cutting:

```text
AUTHORITY
SCOPE
RBAC
VERSIONING
PROVENANCE
AUDIT
CONFIGURATION
```

This is the architectural direction proposed by the Business Rules Baseline.

The next step is not to implement immediately.

The next step is to perform **Current Architecture Impact Analysis** against the existing System Architecture, ERD, Schema, API, RBAC, User Flow and PRD, then finalize the target architecture and ADRs.

---

# 29. Traceability Requirement

Every architectural change introduced from this AEP should retain traceability back to one or more Business Rules 001–100.

Recommended format:

```text
AEP-DEC-XXX
    ↓
Business Rule(s)
    ↓
Architecture Decision
    ↓
ADR
    ↓
ERD / Schema / API / RBAC / Flow
    ↓
Implementation
    ↓
Test Case
```

No downstream technical decision should silently override a locked Business Rule.

---

# 30. Final Status

**Business Rules Baseline:** v1.0 — Consolidated & Conflict Resolved
**AEP:** v1.0 — Proposed
**Architecture implementation:** Not yet authorized by this document
**Next gate:** Current Architecture Impact Analysis
**Primary objective:** Preserve all locked business rules while evolving the architecture without unnecessary structural complexity.
