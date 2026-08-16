# RUMAHAGEN MASTER ARCHITECTURE EVOLUTION PROPOSAL

**Document ID:** MASTER-AEP-001  
**Version:** 1.0  
**Status:** PROPOSED — GOVERNANCE BASELINE  
**Implementation:** NOT AUTHORIZED

## 1. Authority and Source

This Master AEP consolidates the uploaded RUMAHAGEN architecture materials: the locked RUMAHAGEN Business Rules Baseline BR-001–BR-151; Monetization/Subscription/Promotion/Payment AEP; Learning Economy AEP; Title AEP and consolidated Title rules; Learning Session Architecture v2; and the later Learning Session AEP + Business Rules.

The Master AEP is an architectural baseline. It does not replace domain AEPs or Business Rules.

## 2. Master Architecture Principles

1. Locked Business Rules are normative.
2. Every authoritative business state has an owning domain.
3. Ownership, membership, current context and authorization remain separate.
4. Subscription, Entitlement and RBAC remain separate.
5. External providers are infrastructure, not business authority.
6. Cross-domain direct mutation is prohibited; use controlled contracts/workflows/events.
7. Historical business outcomes remain explainable and auditable.
8. Configuration changes do not rewrite history.
9. Retriable business operations are idempotent.
10. Security is server-enforced.
11. Provider-specific implementation stays behind adapters.
12. Qualification, lifecycle, ownership and presentation are separate concerns.

## 3. Logical Domain Map

```text
RUMAHAGEN
├── Identity / RBAC
├── Organization / Agency
├── Workspace
├── Learning
│   ├── Internal Learning
│   ├── Learning Economy
│   ├── Learning Session
│   └── Partnership Learning
├── Assessment / Skill / Credential
├── Title / Achievement
├── Commercial / Monetization
│   ├── Plan
│   ├── Promotion
│   ├── Add-on
│   ├── Order
│   ├── Payment
│   └── Entitlement / Quota
├── Agent Profile
└── Cross-cutting: Audit / Notification / Configuration / Integration
```

These are logical domains/capabilities, not a mandate to create separate microservices.

## 4. Authority / System-of-Record Baseline

| Capability | Authority |
|---|---|
| Agency lifecycle | Organization/Agency |
| Membership | Organization/Agency |
| Listing ownership/context | Listing/Agency rules |
| Subscription | Commercial |
| Promotion | Commercial |
| Payment transaction | Payment/Commercial |
| Entitlement / quota | Commercial/Entitlement |
| Learning activity | Learning |
| Learning Points | Learning Economy |
| Learning Session | Learning |
| External live provider | Provider Adapter / Integration |
| Assessment | Assessment/Learning |
| Skill | Competency/Skill |
| Credential | Credential |
| Title definition / awarding / award | Title |
| Authorization | Identity/RBAC |
| Audit | Cross-cutting Audit |

## 5. Cross-Domain Architecture

### Commercial

```text
Plan / Add-on / Promotion
          ↓
        Order
          ↓
   Payment Verification
          ↓
      Fulfillment
          ↓
Subscription / Entitlement
          ↓
       Quota / Usage

RBAC → Authorization
```

Payment must not directly mutate RBAC.

### Learning Economy

```text
Learning Activity
      ↓
Completion
      ↓
Learning Point Transaction
      ↓
Progress / Unlock
      ↓
Assessment / Evidence
      ↓
Skill / Credential / Title
```

Payment may accelerate progression but cannot replace required assessment.

### Title

```text
Title Definition
      ↓
Awarding Path
      ↓
Qualification / Evaluation
      ↓
Award Instance
      ↓
Lifecycle / Validity
      ↓
Presentation
```

Title Definition is not an Award Instance. Presentation is not ownership.

### Learning Session

```text
Learning
   ↓
Learning Session
   ↓
Session Orchestrator
   ↓
Provider Adapter
   ↓
Daily / LiveKit / Zoom / Google Meet / YouTube Live
```

Candidate providers remain subject to capability, plan, quota, OAuth and policy verification.

Session types: `BROADCAST`, `INTERACTIVE`, `ON_DEMAND`.

Session lifecycle baseline:

```text
DRAFT → SCHEDULED → LIVE → ENDED
             ├→ CANCELLED
             └→ FAILED
```

RUMAHAGEN remains System of Record for Learning Session business state.

## 6. Learning Session Attendance

```text
Provider Participation
        ↓
Attendance Synchronization
        ↓
Attendance Evaluation
        ↓
Completion Policy
        ↓
Learning Activity Completion
        ↓
Learning Economy
```

JOIN does not automatically equal COMPLETE. Learning Session cannot directly manufacture Learning Points.

## 7. Provider Integration Security

```text
Authenticated User
       ↓
Eligibility
       ↓
Authorization
       ↓
Provider Access
```

Provider secrets, OAuth credentials, API keys and signing secrets remain server-side.

Provider events must be verified, validated, normalized, idempotently processed and audited.

## 8. Agency / Ownership Architecture

```text
Agency Context ≠ Personal Context
Membership ≠ Ownership
Origin ≠ Current Context
```

Agency lifecycle is:

```text
ACTIVE → CLOSING → CLOSED
```

CLOSING is irreversible; CLOSED is final. Successful OTP is the gate into CLOSING. Server state is authoritative. Closure processing is idempotent.

## 9. Learning Economy Boundary

Internal Learning follows:

> **Learn for free. Grind to earn. Pay to accelerate. Prove to certify.**

Earned and purchased Learning Points retain separate provenance. Learning Points are not universal competency evidence and are not a universal Title requirement.

Partnership Learning does not automatically inherit Internal Learning Economy rules and retains partner provenance.

## 10. Title Boundary

Title architecture must support authority, scope, Awarding Paths, qualification, provenance, versioning, lifecycle, appeal, validity, repeat/renewal and presentation.

Critical rules include:

- multiple Awarding Paths;
- no duplicate Award merely because multiple paths qualify;
- material awarding-rule changes create new versions;
- rename does not create a new Award;
- prerequisite expiry/revocation does not automatically invalidate an earned Award unless policy explicitly couples them;
- Primary is 0–1;
- Featured is 0–3;
- Expired may remain Featured with clear status;
- Revoked cannot remain Featured.

## 11. Cross-Domain Invariants

1. Locked Business Rules remain authoritative.
2. A domain cannot directly mutate another domain's authoritative state.
3. Provider state is not Learning authority.
4. Payment success is not RBAC mutation.
5. Subscription is not RBAC.
6. Entitlement is not RBAC.
7. Learning Points are not competency.
8. Learning Points are not a universal Title requirement.
9. Attendance is not automatically completion.
10. Session completion is not automatically competency.
11. Title Definition is not Award Instance.
12. Award is not presentation.
13. Membership is not ownership.
14. Historical origin is not current context.
15. Configuration does not rewrite historical outcomes.
16. Retryable operations are idempotent.
17. Server state is authoritative.
18. Client-side claims cannot manufacture official business outcomes.
19. Provider credentials remain protected.
20. Implementation follows architecture and governance gates.

## 12. Architecture Decision Candidates

- Separate Subscription, Entitlement and RBAC.
- Use Payment Provider Adapter.
- Model Learning Points as transaction-based domain data.
- Separate earned and purchased point provenance.
- Keep Learning Session inside Learning.
- Use Learning Session Provider Adapter.
- Normalize and idempotently process provider events.
- Separate Title Definition and Award Instance.
- Version Awarding Paths and rules.
- Separate Award lifecycle from prerequisite lifecycle.
- Separate presentation from award state.
- Preserve historical Agency/Listing/Award/Point/Payment integrity.
- Use explicit, idempotent Agency closure processing.

## 13. Impact Classification

| Area | Impact |
|---|---|
| System Architecture | CRITICAL |
| Business Rules | CRITICAL |
| Learning | CRITICAL |
| Learning Economy | CRITICAL |
| Title | CRITICAL |
| Monetization / Payment | CRITICAL |
| Entitlement / Quota | CRITICAL |
| Agency / Organization | CRITICAL |
| RBAC | CRITICAL |
| ERD / Schema | CRITICAL |
| API / Integration | CRITICAL |
| Audit | CRITICAL |
| Notification | HIGH |
| Recording | HIGH |
| Workspace | HIGH |
| AI | MEDIUM/HIGH |
| Analytics | HIGH |

## 14. Governance Flow

```text
Master Business Rules
        ↓
Master AEP
        ↓
Current Architecture Impact Analysis
        ↓
ADR
        ↓
System Architecture
        ↓
Domain Model
        ↓
ERD / Schema
        ↓
Integration / Event Contract
        ↓
API
        ↓
RBAC
        ↓
User Flow / PRD
        ↓
Engineering
        ↓
Test / Traceability
        ↓
Implementation
```

## 15. Explicit Non-Goals

This Master AEP does not finalize exact tables, columns, indexes, API URLs, provider SDK implementation, OAuth scopes, payment gateway choice, event broker, permission IDs, attendance formula, recording retention, or microservice boundaries.

## 16. Governance Status

**Master AEP:** Proposed v1.0  
**Business Rule authority:** Locked where explicitly locked in source  
**Domain AEPs:** Retained as supporting documents  
**ERD / Schema / API / RBAC:** Pending impact analysis  
**Implementation:** NOT AUTHORIZED

The next gate is **Current Architecture Impact Analysis**.
