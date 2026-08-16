# ARCHITECTURE EVOLUTION PROPOSAL
## Learning Economy — RumahAgen Internal Learning

**Document Type:** Architecture Evolution Proposal (AEP)  
**Domain:** Learning / Learning Economy  
**Version:** 1.0  
**Status:** Proposed — based on locked Learning decisions  
**Scope:** Internal Learning RumahAgen  
**Explicit Exclusion:** Partnership Learning is not required to use the RumahAgen Learning Economy.

---

# 1. Executive Summary

RumahAgen Internal Learning uses a **Learning Economy** model rather than a conventional paid-course model.

The locked principle is:

> **Learn for free. Grind to earn. Pay to accelerate. Prove to certify.**

The architecture must therefore support a system in which an agent can:

1. learn without mandatory payment;
2. perform learning activities and earn Learning Points;
3. use Learning Points to unlock or access learning pathways and related learning progression;
4. optionally purchase Learning Points to accelerate progression;
5. never use payment as a substitute for passing assessment;
6. demonstrate competency through assessment/evidence;
7. obtain skill/credential outcomes only through the required proof process.

Learning Points are therefore an **economic/progression mechanism**, not a competency certificate.

The architecture must also distinguish **earned Learning Points** from **purchased Learning Points** for provenance and policy purposes.

---

# 2. Scope Boundary

## 2.1 Internal Learning

Internal Learning RumahAgen uses the Learning Economy.

Conceptual flow:

```text
Free Learning
     ↓
Learning Activities
     ↓
Earn Learning Points
     ↓
Unlock / Progress
     ↓
Assessment
     ↓
Evidence / Proof
     ↓
Skill / Credential
```

Purchased points may accelerate the progression but cannot bypass required competency proof.

## 2.2 Partnership Learning

Partnership Learning uses a partner-defined/general learning model.

It is **not forced into the RumahAgen Learning Economy**.

Partner learning results and credentials retain their original source/provenance and do not automatically become RumahAgen Verified Skills.

Both Internal Learning and Partnership Learning may contribute to the Agent Profile.

---

# 3. Core Business Principles

## Principle 1 — Free-to-Learn

An agent must have a genuine free path to participate in Internal Learning.

Payment must not be the mandatory entry condition for learning.

## Principle 2 — Earn Through Learning

Learning activities can generate Learning Points.

The quantity and earning mechanism are configurable rather than an immutable architecture constant.

## Principle 3 — Pay to Accelerate

An agent may purchase Learning Points to accelerate progression.

Purchased points are an acceleration mechanism.

They are not a replacement for learning proof.

## Principle 4 — Never Pay to Pass

Payment cannot automatically produce competency.

If a Skill/Credential requires assessment, the assessment remains mandatory regardless of how many points the agent owns.

## Principle 5 — Prove to Certify

Credential/competency outcomes require the configured assessment/evidence/proof mechanism.

Learning Points alone do not establish competency.

---

# 4. Learning Point Domain

Learning Points should be modeled as a first-class domain concept rather than a simple balance field.

The architecture should distinguish:

- current balance;
- earned points;
- purchased points;
- point transactions;
- earning source;
- purchase source;
- redemption/use;
- expiration where configured;
- audit/provenance.

Conceptually:

```text
Learning Point Account
        │
        ├── Earned Transactions
        ├── Purchased Transactions
        └── Redemption Transactions
```

A balance may be derived or maintained as a controlled projection, but the transaction history must remain auditable.

---

# 5. Point Provenance

Earned and purchased points must retain provenance.

```text
Learning Point Transaction
        │
        ├── type = EARNED
        │      └── learning activity/source
        │
        ├── type = PURCHASED
        │      └── payment transaction/source
        │
        └── type = REDEEMED / USED
```

This separation enables future policy without changing the core architecture.

The architecture must not assume that earned and purchased points are always interchangeable for every future policy.

---

# 6. Learning Activity Architecture

Learning activities are the mechanism through which an agent learns and may earn points.

Possible activity categories may include:

- learning content;
- course/module completion;
- practice;
- assignment;
- mission;
- other configured learning activities.

The architecture should not hard-code a single activity type.

Each activity can have configurable:

- Learning Point reward;
- completion condition;
- prerequisite;
- availability;
- progression relationship;
- assessment requirement.

---

# 7. Learning Path Architecture

Internal Learning should support structured learning progression.

Conceptually:

```text
Learning Program
      ↓
Learning Path
      ↓
Module / Activity
      ↓
Learning Completion
      ↓
Learning Points
      ↓
Skill / Credential Path
```

A Learning Path may require points to unlock or progress, according to configuration.

Points therefore function as a controlled progression economy.

---

# 8. Unlock vs Competency

The architecture must explicitly separate:

### Access / Unlock State

Determines whether the agent can access or progress through a configured learning opportunity.

### Competency State

Determines whether the agent has demonstrated the required skill.

These are not the same state.

```text
Points
  ↓
Unlock / Access
  ↓
Learning
  ↓
Assessment
  ↓
Competency
```

An agent having sufficient points does not imply competency.

---

# 9. Assessment Architecture

Assessment is an independent competency gate.

A Skill/Credential can define:

- assessment required;
- assessment type;
- passing criteria;
- attempts;
- evidence requirements;
- reviewer requirements where applicable.

The architecture must prevent purchased points from being interpreted as an assessment pass.

---

# 10. Skill Architecture

Skill and Credential are distinct concepts.

A Skill represents demonstrated competency according to the configured skill assessment model.

A Credential represents a formal recognition outcome according to its own rules.

Conceptually:

```text
Learning
   ↓
Assessment / Evidence
   ↓
Demonstrated Skill
   ↓
Credential / Certification
```

Not every learning completion automatically creates a verified skill.

---

# 11. Learning Points and Credentialing

Learning Points can be used to unlock or enter a credential pathway where configured.

However:

```text
Learning Points ≠ Competency
Learning Points ≠ Automatic Credential
Payment ≠ Passing Assessment
```

The architecture must preserve these boundaries.

---

# 12. Pay-to-Accelerate Architecture

Purchased Learning Points are optional.

The architecture must support:

```text
Free Path
   └── Learn → Earn Points → Progress

Accelerated Path
   └── Learn → Earn Points
                 +
              Purchase Points
                 ↓
              Accelerate
```

The accelerated path must converge on the same required competency/assessment gate where the Skill/Credential requires proof.

---

# 13. Free User Economic Path

Free participation must remain viable.

A free agent should be able to progress through effort and learning activity rather than being forced to purchase points.

This is a core product/business-rule requirement, not merely a pricing feature.

---

# 14. Commercial Boundary

Payment belongs to the commercial/payment domain.

Learning Economy consumes the successful purchase result but should not own gateway-specific payment logic.

Conceptually:

```text
Payment Gateway
      ↓
Payment Transaction
      ↓
Purchase Confirmation
      ↓
Learning Point Transaction
      ↓
Learning Point Balance
```

The Learning domain should therefore integrate with the Payment domain through a controlled contract/event rather than embedding Midtrans or another gateway directly into learning logic.

---

# 15. Point Purchase Integrity

A successful point purchase must be idempotent.

Repeated gateway callbacks or retries must not create duplicate Learning Point grants.

The payment transaction/reference must be traceable to the resulting purchased-point transaction.

---

# 16. Learning Point Configuration

Learning Point economics should be configurable.

Examples of configurable parameters include:

- points earned per activity;
- unlock threshold;
- progression threshold;
- purchase packages;
- purchase price;
- bonus points;
- earning limits;
- expiration policy if introduced;
- redemption rules.

These are commercial/product configuration parameters and must not be hard-coded into core business logic.

---

# 17. Learning Economy Audit

The architecture must provide traceability for:

- why points were earned;
- why points were purchased;
- when points were granted;
- how points were used;
- what learning activity generated earned points;
- which payment generated purchased points;
- what unlock/progression resulted from point usage.

This is necessary for dispute handling and commercial reconciliation.

---

# 18. Partnership Learning Boundary

Partnership Learning remains architecturally compatible with the broader Learning domain but does not inherit Internal Learning Economy rules automatically.

```text
                 LEARNING DOMAIN
                       │
          ┌────────────┴────────────┐
          │                         │
 Internal Learning          Partnership Learning
          │                         │
 Learning Economy            Partner Model
          │                         │
 RumahAgen Rules             Partner Rules
```

Partner credentials/results retain provenance.

A partner credential does not automatically become a RumahAgen Verified Skill.

---

# 19. Agent Profile Integration

Both Internal Learning and Partnership Learning may contribute learning-related information to the Agent Profile.

However, Profile presentation must preserve provenance.

Example:

```text
Agent Profile
   ├── RumahAgen Verified Skill
   └── Partner Credential / Achievement
           └── Source: Partner
```

The profile must not imply that a partner credential was issued by RumahAgen unless it actually was.

---

# 20. RBAC Implications

The Learning Economy requires authorization boundaries for:

- learning configuration;
- point configuration;
- awarding points;
- manual adjustments;
- purchase reconciliation;
- assessment;
- competency verification;
- credential issuance;
- partner result ingestion;
- administrative audit.

Agents may earn and purchase points but must not arbitrarily create official point transactions or verified competency.

---

# 21. Event Architecture

Recommended conceptual events include:

```text
LearningActivityCompleted
LearningPointsEarned
LearningPointsPurchased
LearningPointsRedeemed
LearningPathUnlocked
AssessmentSubmitted
AssessmentPassed
AssessmentFailed
SkillVerified
CredentialIssued
PartnerCredentialRecorded
```

Payment events remain owned by the payment domain.

Learning consumes the appropriate confirmed payment outcome.

---

# 22. Failure and Consistency Handling

The architecture must account for failures between payment and point allocation.

Required conceptual state:

```text
Payment Successful
       ↓
Point Grant Pending
       ↓
Point Grant Confirmed
```

A payment success must not silently disappear because point allocation failed.

Conversely, retries must not grant the same purchased points twice.

This requires idempotency and reconciliation.

---

# 23. Architecture Impact Classification

| Area | Impact | Rules / Principle |
|---|---|---|
| Learning Domain | CRITICAL | Learning Economy |
| Learning Point Ledger | CRITICAL | Earned/Purchased/Used |
| Learning Activity | HIGH | Earn-to-learn |
| Learning Path | HIGH | Unlock/progression |
| Assessment | CRITICAL | Prove to certify |
| Skill | HIGH | Competency |
| Credential | HIGH | Formal recognition |
| Payment Integration | HIGH | Pay-to-accelerate |
| Payment Gateway | MEDIUM | External commercial domain |
| Provenance | CRITICAL | Earned vs purchased / partner source |
| RBAC | HIGH | Admin/issuer/assessment |
| Event/Audit | HIGH | Point and competency traceability |
| Agent Profile | MEDIUM/HIGH | Internal vs Partner source |
| Configuration | CRITICAL | Learning Economy parameters |

---

# 24. Downstream Architecture Changes

After approval, the following documents should be updated in order:

1. System Architecture
2. ADR
3. Learning Domain Model
4. ERD
5. Schema
6. Payment ↔ Learning Integration Contract
7. API
8. RBAC / Permission Matrix
9. User Flow
10. PRD
11. Engineering Guidebook
12. Test Strategy / Business Rule Test Matrix

---

# 25. ADR Candidates

### ADR-LE-001
Learning Points are modeled as a transaction-based economic/progression domain.

### ADR-LE-002
Earned and purchased Learning Points retain separate provenance.

### ADR-LE-003
Purchased Learning Points accelerate progression but cannot bypass competency assessment.

### ADR-LE-004
Internal Learning and Partnership Learning use different economic models.

### ADR-LE-005
Learning does not directly own Payment Gateway logic.

### ADR-LE-006
Skill and Credential are distinct from Learning Completion.

### ADR-LE-007
Learning Point purchase allocation is idempotent and reconcilable.

### ADR-LE-008
Learning Economy parameters are governed configuration rather than hard-coded constants.

---

# 26. Traceability Model

Every implementation decision should trace back to the locked Learning Economy principles:

```text
Learning Economy Rule
       ↓
AEP Decision
       ↓
ADR
       ↓
ERD / Schema
       ↓
API / Integration
       ↓
RBAC
       ↓
User Flow / PRD
       ↓
Implementation
       ↓
Test
```

No downstream technical artifact should reinterpret:

> **Learn for free. Grind to earn. Pay to accelerate. Prove to certify.**

in a way that turns the model into pay-to-pass.

---

# 27. Final Architecture Direction

The proposed Learning Economy architecture is:

```text
                         LEARNING DOMAIN
                               │
              ┌────────────────┴────────────────┐
              │                                 │
      INTERNAL LEARNING                  PARTNERSHIP LEARNING
              │                                 │
       LEARNING ECONOMY                    PARTNER MODEL
              │                                 │
       ┌──────┼───────┐                         │
       │      │       │                         │
    Activity Points  Path                    Result
       │      │       │                         │
       │   Ledger   Unlock                      │
       │      │       │                         │
       └──────┼───────┘                         │
              ↓                                 │
           Learning                             │
              ↓                                 │
         Assessment                             │
              ↓                                 │
        Skill / Credential                      │
              │                                 │
              └──────────────┬──────────────────┘
                             ↓
                       AGENT PROFILE
                    (with provenance)
```

The architecture therefore preserves the approved economic philosophy while keeping commercial payment infrastructure, competency verification, and partner learning models properly separated.

---

# 28. Status and Next Gate

**AEP Learning Economy:** v1.0 — Proposed  
**Business Model:** Locked at principle level  
**Implementation:** Not yet authorized by this document  
**Next Gate:** Learning Economy Current Architecture Impact Analysis

The next analysis should compare this AEP against the existing RumahAgen:

- System Architecture;
- Business Rules Baseline;
- ERD;
- Schema;
- API;
- RBAC;
- User Flow;
- PRD;
- Payment Architecture;
- existing Learning documentation.

The objective is to determine exactly which existing components can be retained, which must evolve, and which new components are genuinely required.
