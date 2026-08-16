# RUMAHAGEN — CURRENT ARCHITECTURE IMPACT ANALYSIS

**Document ID:** CAIA-001  
**Version:** 1.0  
**Status:** ANALYSIS COMPLETE — TARGET CHANGES IDENTIFIED  
**Implementation:** NOT AUTHORIZED  
**Analysis Date:** 14 August 2026

---

# 1. PURPOSE

This document evaluates the impact of:

- `RUMAHAGEN_MASTER_AEP_v1.0`
- `RUMAHAGEN_MASTER_BUSINESS_RULES_v1.0`

against the latest/final architecture corpus available in the uploaded RUMAHAGEN ZIP and the latest domain AEP/Business Rule documents.

The objective is NOT to immediately redesign the system.

The objective is to determine:

1. what can be retained;
2. what must evolve;
3. what is missing;
4. what conflicts or semantic gaps exist;
5. which documents must be updated;
6. which ADRs must be created/promoted;
7. whether ERD/API/RBAC/PRD should be changed now or later;
8. whether existing physical implementation creates migration risk.

---

# 2. SOURCE PRECEDENCE USED

The analysis follows the project's existing governance hierarchy and the new Master documents.

## 2.1 Highest authority

1. `PROJECT-CONSTITUTION-v1.9-FINAL`
2. Locked Business Rules, especially `BR-001–BR-151`
3. Approved ADRs
4. Current/final Master Business Rules
5. Current/final Master AEP
6. Current Baseline System Architecture
7. Technology Decisions
8. Dependency Manifest
9. ERD / Schema
10. API
11. Authorization/RBAC
12. User Flow
13. PRD
14. Functional / UI / Technical Specifications
15. Module Planning / Engineering artifacts

Where a newer domain AEP introduces a capability not yet reflected in the existing System Architecture, it is treated as an architectural delta, not silently inserted into the old architecture.

---

# 3. CURRENT BASELINE SNAPSHOT

The uploaded ZIP contains the current architecture corpus, including:

- System Architecture v1.6 Final;
- ERD / Database v1.4 Final;
- API Specification v1.3 Final-FIXED;
- Authorization & Access Control v1.1 Final;
- PRD v1.3 Final;
- User Flow v1.2 Final;
- Functional Specification v1.0 Final;
- UI Specification v1.0 Final;
- Technical Specification v1.0 Final;
- Entity Mapping v1.0;
- Technology Decisions v1.6;
- Dependency Manifest v1.6;
- Project Manifest v1.28;
- Project Constitution v1.9;
- ADR master;
- Current Project State rev10;
- 13 Module Planning documents.

The current architecture already contains 13 logical modules, including Learning Center, Calendar/Event, RBAC, Organization Management and AI Assistant.

The current physical implementation state remains **pre-development**: migration SQL has been written, but the current project state says the migrations have not been executed against the live database and Sprint S0 has not yet been executed.

This is strategically important: most new architecture changes can still be absorbed without production-data migration, provided the migration files are corrected/normalized before execution.

---

# 4. MASTER DELTA

The Master AEP introduces major architectural capabilities that are not yet represented as first-class domains in the current v1.6 System Architecture:

| New/Expanded Capability | Current Baseline | Impact |
|---|---|---|
| Learning Economy | Learning Center only | CRITICAL |
| Learning Point Ledger | Not first-class | CRITICAL |
| Purchased vs Earned Points | Not modeled | CRITICAL |
| Learning Session | Calendar/Event only | CRITICAL |
| Provider Adapter | Not present as Learning boundary | HIGH |
| Attendance / Completion boundary | Basic event registration | CRITICAL |
| Title / Achievement domain | Badge/certificate presentation only | CRITICAL |
| Awarding Path | Not modeled | CRITICAL |
| Award Instance | Not modeled | CRITICAL |
| Award provenance/versioning | Not modeled | HIGH |
| Appeal / Revocation lifecycle | Not modeled | HIGH |
| Commercial Subscription | Payment placeholder | CRITICAL |
| Entitlement / Quota | Existing organization/listing concepts, not commercial domain | CRITICAL |
| Payment Core / Provider Adapter | Placeholder only | HIGH/CRITICAL |
| Reconciliation | Not modeled as first-class | HIGH |
| Promotion snapshot | Not modeled as first-class | HIGH |
| Cross-domain event contracts | Limited | HIGH |
| Governed configuration | Existing system config, but domain policy expansion required | HIGH |
| Audit/provenance | Existing audit concepts, but scope expands | HIGH |

---

# 5. WHAT CAN BE RETAINED

## 5.1 Technology Foundation — RETAIN

No master-level requirement forces replacement of the existing:

- Next.js App Router;
- Supabase/PostgreSQL;
- UUID primary keys;
- SQL migrations;
- Route Handlers/BFF architecture;
- existing RBAC foundation;
- existing notification foundation;
- Vercel Cron + Postgres-trigger strategy;
- existing storage architecture;
- existing organization authorization foundation.

The Master AEP is compatible with a modular monolith approach.

There is no requirement to split the application into microservices.

## 5.2 Existing Learning Center — RETAIN AS FOUNDATION

The existing:

- courses;
- course lessons;
- quizzes;
- enrollments;
- quiz attempts;
- certificates

remain useful.

They should become the foundation of the broader Learning domain rather than being discarded.

## 5.3 Existing Calendar/Event — RETAIN AS DISCOVERY/SCHEDULE LAYER

`events` and `event_registrations` remain useful for:

- calendar discovery;
- RSVP;
- event categorization;
- reminders.

However, they are insufficient to become the authoritative Learning Session model.

## 5.4 Existing Organization Module — RETAIN, BUT SEMANTICALLY REVIEW

The current Organization model can remain technically useful.

However, a critical business-language decision is required:

> Is the current `Organization` the same business concept as the locked `Agency`, or are Agency and Organization separate concepts?

This must be resolved before final ERD/API design.

Do not silently rename database structures merely to match terminology.

---

# 6. CRITICAL IMPACT — LEARNING

## 6.1 Current state

Current Learning is course-centric:

```text
Course
  ↓
Lesson
  ↓
Enrollment
  ↓
Quiz
  ↓
Certificate
```

## 6.2 Target

Master architecture requires:

```text
Learning
├── Course / Learning Activity
├── Learning Path
├── Learning Session
├── Assessment
├── Evidence
├── Learning Economy
│   ├── Point Account
│   ├── Earned Transactions
│   ├── Purchased Transactions
│   └── Redemption Transactions
└── Skill / Credential integration
```

## 6.3 Impact

**CRITICAL — ERD, API, PRD, User Flow, RBAC, System Architecture and test strategy all change.**

The current `certificates` table must not automatically become the new Title Award Instance.

Certificate/Credential and Title/Award must remain separate.

---

# 7. CRITICAL IMPACT — LEARNING ECONOMY

New first-class concepts are required:

```text
Learning Point Account
       │
       ├── Earned Point Transaction
       ├── Purchased Point Transaction
       └── Redemption Transaction
```

The current ERD has no equivalent transaction ledger.

### Required architectural change

Do NOT add only:

```text
learning_points_balance
```

to `users` or `agent_profiles`.

The transaction/provenance model is mandatory.

### Additional consequences

The platform must support:

- point source;
- transaction type;
- provenance;
- purchase linkage;
- learning activity linkage;
- redemption;
- idempotency;
- audit;
- optional expiration;
- balance reconstruction.

---

# 8. CRITICAL IMPACT — LEARNING SESSION

The current Calendar/Event model is insufficient as the authoritative session model.

Current:

```text
Event
 ↓
Registration
 ↓
Reminder
```

Target:

```text
Learning Session
      ↓
Session Orchestrator
      ↓
Provider Adapter
      ↓
Provider
```

Candidate providers:

- Daily;
- LiveKit;
- Zoom;
- Google Meet;
- YouTube Live.

These remain candidate providers until actual capability, OAuth, quota, plan and policy verification.

### Required new concepts

At minimum:

- session;
- session type;
- session lifecycle;
- provider binding;
- provider session reference;
- participant/attendance evidence;
- attendance synchronization;
- recording metadata;
- provider event processing;
- idempotency;
- audit.

### Important boundary

`event` can remain the calendar/discovery representation.

`learning_session` should own live-learning business state.

---

# 9. CRITICAL IMPACT — ATTENDANCE

Current `event_registrations.status` has:

```text
registered
waitlist
attended
cancelled
```

This is insufficient for the Master Business Rules.

Attendance must distinguish:

```text
Registration
      ↓
Participation Evidence
      ↓
Attendance Evaluation
      ↓
Completion
      ↓
Learning Activity Completion
```

Do not use `attended = true` as the sole source for Learning completion.

The exact attendance formula remains pending and must not be invented.

---

# 10. CRITICAL IMPACT — TITLE / ACHIEVEMENT

This is the largest domain evolution.

Current architecture exposes certificates/badges through Learning/Profile.

Master architecture requires:

```text
Title Definition
      ↓
Awarding Path
      ↓
Qualification / Evaluation
      ↓
Award Instance
      ↓
Lifecycle
      ↓
Presentation
```

Cross-cutting:

```text
Authority
Scope
RBAC
Versioning
Provenance
Audit
Configuration
```

### Required changes

The current profile-level badge/certificate presentation must be refactored so that:

- Certificate is not automatically a Title;
- Title Definition is not Award Instance;
- Award Instance is durable;
- multiple Awarding Paths are supported;
- Awarding Rules are versioned;
- provenance is preserved;
- lifecycle is explicit;
- appeal/reinstatement exists;
- Primary and Featured presentation are independent.

---

# 11. CRITICAL IMPACT — COMMERCIAL / MONETIZATION

Current architecture has a payment placeholder for future premium membership.

Master architecture requires a real commercial domain:

```text
Catalog
 ├── Plan
 ├── Add-on
 └── Promotion
        ↓
      Order
        ↓
 Payment Core
        ↓
 Provider Adapter
        ↓
 Confirmed Payment
        ↓
 Fulfillment
        ↓
 Subscription / Entitlement
        ↓
 Quota / Usage
```

### Required separation

```text
Subscription ≠ Entitlement ≠ RBAC
```

This must be reflected in ERD, API, authorization, state transitions and tests.

---

# 12. CRITICAL IMPACT — PAYMENT

The current payment placeholder is not sufficient for:

- provider webhook verification;
- idempotency;
- reconciliation;
- refund;
- chargeback;
- payment-to-entitlement fulfillment;
- payment-to-learning-point purchase;
- promotion snapshot.

Payment must be treated as a provider-independent integration boundary.

---

# 13. HIGH IMPACT — RBAC

Current RBAC is a strong foundation and should be retained.

However, new permissions are required for:

### Learning

- create/edit/publish learning;
- manage learning sessions;
- host;
- instructor controls;
- attendance correction;
- recording management.

### Learning Economy

- configure point rewards;
- adjust points;
- approve/manual correction;
- commercial point package administration.

### Title

- create Title;
- configure Awarding Path;
- issue;
- revoke;
- reinstate;
- review appeal;
- manage presentation;
- manage scope/authority.

### Commercial

- manage plans;
- promotions;
- add-ons;
- payment reconciliation;
- refund/chargeback operations.

Exact permission IDs remain downstream work.

---

# 14. HIGH IMPACT — API

The current API v1.3 must be extended rather than rewritten.

New API families are expected:

```text
/learning/activities
/learning/paths
/learning/sessions
/learning/sessions/{id}/attendance
/learning/points
/learning/points/transactions
/learning/assessments

/titles
/titles/{id}/awarding-paths
/awards
/awards/{id}
/awards/{id}/appeals
/awards/{id}/presentation

/plans
/promotions
/add-ons
/orders
/payments
/entitlements
/quota
```

Exact endpoint naming must be decided in the API design phase.

---

# 15. HIGH IMPACT — ERD / SCHEMA

### Existing entities to retain

- courses;
- course_lessons;
- quizzes;
- quiz_questions;
- quiz_options;
- enrollments;
- quiz_attempts;
- certificates;
- events;
- event_registrations.

### New logical entity families required

#### Learning Economy

- learning_point_accounts;
- learning_point_transactions;
- point_sources/provenance where required;
- point_packages/purchases where commercialized.

#### Learning Session

- learning_sessions;
- session_provider_bindings;
- session_participants/attendance;
- provider_event_receipts/idempotency;
- recordings.

#### Title

- title_definitions;
- title_authorities/scopes;
- awarding_paths;
- awarding_rule_versions;
- qualification/evaluation records;
- award_instances;
- award_provenance;
- award_lifecycle/revocation;
- appeals;
- presentation preferences.

#### Commercial

- plans;
- subscriptions;
- add_ons;
- promotions;
- orders;
- payments;
- payment_events;
- entitlements;
- quota allocations;
- fulfillment/reconciliation records.

These are logical requirements, NOT finalized table names.

---

# 16. HIGH IMPACT — EVENTS / INTEGRATION

The existing event/job foundation is reusable.

However, domain integration events need a formal contract.

Candidate events:

```text
LearningActivityCompleted
LearningSessionScheduled
LearningSessionStarted
LearningSessionEnded
AttendanceSynchronized
LearningPointsEarned
LearningPointsPurchased
AwardQualificationSucceeded
AwardIssued
AwardRevoked
AwardReinstated
PaymentConfirmed
PaymentRefunded
EntitlementGranted
EntitlementRevoked
AgencyClosing
AgencyClosed
```

Events are integration mechanisms, not automatically the system of record.

---

# 17. HIGH IMPACT — AUDIT / PROVENANCE

Audit scope expands substantially.

Must support explainability for:

- ownership;
- Agency/Organization context;
- payment;
- entitlement;
- quota;
- Learning Points;
- attendance;
- assessment;
- evidence;
- Title qualification;
- Award issuance;
- revocation;
- appeal;
- provider integration;
- configuration.

### Critical exception

The locked Agency rules prohibit preserving deleted Lead History content through audit.

Therefore:

> Audit the fact of deletion/event, not prohibited deleted content.

---

# 18. HIGH IMPACT — CONFIGURATION

Current `system_configs` / configuration mechanisms can be retained as infrastructure.

But policy domains need explicit ownership.

Candidate governed configurations:

- Learning Point rewards;
- point expiration;
- assessment;
- attendance;
- session policy;
- provider selection;
- recording policy;
- Title awarding;
- Title validity;
- appeal;
- promotion;
- pricing;
- quota;
- payment provider activation.

Historical outcomes must remain tied to the configuration context that produced them.

---

# 19. IMPORTANT SEMANTIC GAP — AGENCY VS ORGANIZATION

This is a **GATE-1 issue**.

Current technical architecture uses:

```text
Organization
organizations
organization_members
organization_invitations
```

The locked business baseline uses:

```text
Agency
Lead
Member
Agency Listing
Agency Entitlement
Agency Closure
```

Before ERD evolution, the Owner must explicitly decide:

### Option A — Organization is the technical implementation of Agency

Then:

- Organization becomes the technical entity;
- Agency remains business terminology;
- documentation needs a canonical glossary;
- current Organization lifecycle must be aligned to Agency lifecycle;
- `CLOSING` must be introduced;
- closure rules must be applied.

### Option B — Agency and Organization are separate

Then a new relationship/domain boundary is required.

**Recommendation:** do not decide this implicitly during schema design.

---

# 20. IMPORTANT BUSINESS GAP — EXISTING ORGANIZATION LIFECYCLE

Current Organization uses:

```text
active
closed
```

The locked Agency model requires:

```text
ACTIVE
  ↓ OTP
CLOSING
  ↓ processing
CLOSED
```

Therefore the current Organization lifecycle is insufficient if Organization = Agency.

Additional requirements include:

- OTP gate;
- irreversible CLOSING;
- operational freeze;
- in-flight listing cancellation;
- membership termination;
- listing transfer;
- promo forfeiture;
- add-on ownership resolution;
- retry;
- exception;
- idempotency;
- historical page.

---

# 21. IMPORTANT DATA GAP — LISTING CONTEXT

Current architecture already has Organization-linked listing concepts.

The locked Agency rules require explicit separation:

```text
Owner
Current Context
Historical Origin
```

The design must preserve:

```text
owner = agent
current_context = PERSONAL | AGENCY
origin = historical
```

A transfer must not create a duplicate listing.

---

# 22. IMPORTANT GAP — QUOTA

Current listing quota concepts must be separated from:

- subscription;
- entitlement;
- member allocation;
- actual usage;
- permanent add-on;
- promotional quota.

Target:

```text
Agency Entitlement
      ↓
Agency Pool
      ├── Member Allocation A
      ├── Member Allocation B
      └── Available Pool

Usage remains separate.
```

Reducing allocation below current usage must not delete existing listings.

---

# 23. IMPORTANT GAP — CERTIFICATE VS TITLE

Current Learning Center has:

```text
Certificate
```

and Profile displays certificate/badge information.

Master architecture requires:

```text
Certificate / Credential
        ≠
Title
        ≠
Award Instance
        ≠
Presentation
```

This distinction is mandatory before changing the profile schema.

---

# 24. IMPORTANT GAP — LEARNING SESSION VS EVENT

Current Learning uses:

```text
Event
Event Registration
```

Master requires:

```text
Calendar Event
      ↕
Learning Session
      ↓
Provider Adapter
```

Recommended architecture:

- Event = discovery/scheduling/calendar/business event.
- Learning Session = live-learning execution/business state.
- Provider Adapter = external infrastructure.
- Attendance = Learning evidence.
- Learning Activity = learning outcome.

Do not overload `events` until the semantics become ambiguous.

---

# 25. CURRENT PHYSICAL IMPLEMENTATION RISK

The project is unusually well positioned for this evolution because:

- the database has not been executed live;
- Sprint S0 has not started;
- migrations exist as source artifacts;
- the current state explicitly distinguishes written migrations from live schema.

However, the ZIP contains both original migration files and `-FIXED` variants for several modules.

The current project state identifies the need to replace the buggy canonical migration files with their corrected `-FIXED` versions before Sprint S0.

Therefore:

> **Do not generate a new final migration set from the current ERD until the migration canonicalization issue is closed.**

---

# 26. DOCUMENT IMPACT MATRIX

| Document | Impact | Action |
|---|---|---|
| Master Business Rules | CRITICAL | Keep as master; resolve pending rules through change control |
| Master AEP | CRITICAL | Keep as master; update after CAIA approval |
| PROJECT-CONSTITUTION | HIGH | Check only if new architecture creates higher-level governance rules |
| ADR Master | CRITICAL | Create/promote ADRs |
| System Architecture | CRITICAL | Major revision |
| Technology Decisions | HIGH | Add only dependencies/technology decisions approved by ADR |
| Dependency Manifest | HIGH | Update after technology decisions |
| ERD | CRITICAL | Major revision |
| Migration | CRITICAL | Rebuild canonical migration plan before execution |
| API Specification | CRITICAL | Major extension |
| Authorization/RBAC | HIGH/CRITICAL | Major extension |
| PRD | CRITICAL | Learning/Commercial/Title/session requirements |
| User Flow | CRITICAL | New flows |
| Functional Specification | HIGH/CRITICAL | New screens and behavior |
| UI Specification | HIGH | New learning/session/title/commercial UI |
| Technical Specification | CRITICAL | Consolidate new architecture |
| Module Planning | CRITICAL | New/expanded module plans |
| Test Matrix | CRITICAL | New rule traceability |
| Project Manifest | HIGH | Add new artifacts and dependencies |
| Current Project State | HIGH | Update only after approved changes are synchronized |

---

# 27. RECOMMENDED TARGET MODULE STRUCTURE

Do NOT immediately create microservices.

Use logical domains/modules inside the existing modular application:

```text
M01 Authentication
M02 Agent Profile
M03 Listing
M04 Learning
    ├── Learning Activity
    ├── Learning Economy
    ├── Learning Session
    ├── Assessment
    └── Credential
M05 Calendar/Event
M06 Developer
M07 DBR
M08 Dashboard/Notification
M09 Admin
M10 RBAC
M11 SEO/Analytics
M12 Agency/Organization
M13 AI Assistant
M14 Commercial / Monetization
M15 Title / Achievement
M16 Payment Integration
```

Whether M16 remains a separate logical module or is treated as a Commercial subdomain should be decided by ADR.

---

# 28. ADR CANDIDATES GENERATED BY CAIA

## CAIA-ADR-001
Agency vs Organization canonical domain identity.

## CAIA-ADR-002
Learning Economy as a first-class domain.

## CAIA-ADR-003
Learning Point ledger and provenance model.

## CAIA-ADR-004
Learning Session as separate domain capability from Calendar Event.

## CAIA-ADR-005
Learning Session Provider Adapter abstraction.

## CAIA-ADR-006
Attendance evidence vs Learning Activity completion.

## CAIA-ADR-007
Title Definition vs Award Instance.

## CAIA-ADR-008
Versioned Awarding Paths and Awarding Rules.

## CAIA-ADR-009
Award lifecycle vs prerequisite lifecycle.

## CAIA-ADR-010
Certificate/Credential vs Title separation.

## CAIA-ADR-011
Subscription vs Entitlement vs RBAC.

## CAIA-ADR-012
Payment Provider Adapter and verified idempotent fulfillment.

## CAIA-ADR-013
Commercial reconciliation architecture.

## CAIA-ADR-014
Historical provenance/configuration snapshot strategy.

## CAIA-ADR-015
Cross-domain event contract strategy.

---

# 29. GATE DECISIONS

## GATE 1 — MUST RESOLVE BEFORE ERD

1. Agency vs Organization identity.
2. Learning Activity vs existing Course model.
3. Certificate/Credential vs Title boundary.
4. Calendar Event vs Learning Session boundary.
5. Commercial Entitlement vs existing Organization quota concepts.
6. Whether Payment is a Commercial subdomain or separate logical module.

## GATE 2 — MUST RESOLVE BEFORE API/RBAC

1. New permission taxonomy.
2. Authority/scope model for Titles.
3. Learning Session host/instructor authorization.
4. Commercial administration permissions.
5. Point adjustment permissions.
6. Award issuance/revocation/appeal permissions.

## GATE 3 — MUST RESOLVE BEFORE IMPLEMENTATION

1. Exact provider capability matrix.
2. Exact attendance formula.
3. Recording retention/privacy.
4. Payment provider.
5. Commercial pricing/configuration.
6. Exact Title awarding configurations.
7. Migration canonicalization.
8. Final event contracts.

---

# 30. REQUIRED UPDATE ORDER

```text
CAIA
 ↓
Resolve Gate 1
 ↓
ADR
 ↓
System Architecture
 ↓
Domain Model
 ↓
ERD
 ↓
Migration Plan
 ↓
API
 ↓
RBAC
 ↓
PRD
 ↓
User Flow
 ↓
Functional Spec
 ↓
UI Spec
 ↓
Technical Spec
 ↓
Module Planning
 ↓
Test / Traceability
 ↓
Project Manifest
 ↓
Current Project State
 ↓
Sprint S0
```

---

# 31. FINAL CAIA DECISION

The current architecture is **not rejected**.

It is a valid foundation for the Master architecture, but it is **not yet aligned** with the Master AEP + Master Business Rules.

The largest deltas are:

1. Learning Economy;
2. Learning Session;
3. Title/Achievement;
4. Commercial/Monetization;
5. Payment;
6. Entitlement/Quota;
7. expanded RBAC;
8. cross-domain provenance/event architecture;
9. Agency vs Organization semantic identity.

The strongest strategic advantage is that the project remains pre-production and the database has not been executed live. This allows the architecture to evolve before production-data migration becomes a major constraint.

**CAIA STATUS: COMPLETE — ARCHITECTURAL EVOLUTION REQUIRED**

**IMPLEMENTATION STATUS: NOT AUTHORIZED**

**NEXT GOVERNANCE GATE: ADR + GATE-1 RESOLUTION**

