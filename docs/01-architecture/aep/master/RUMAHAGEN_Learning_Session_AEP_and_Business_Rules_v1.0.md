# RUMAHAGEN — Learning Session Architecture Evolution & Business Rules

**Version:** 1.0
**Status:** PROPOSED
**Domain:** Learning
**Capability:** Learning Session / Live Learning
**Documents:** AEP-LS-001 + BR-LS-001
**Implementation:** NOT AUTHORIZED

---

# PART I — ARCHITECTURE EVOLUTION PROPOSAL

## AEP-LS-001 — Learning Session & Live Learning Architecture Evolution

### 1. Executive Summary

RUMAHAGEN extends the Learning Domain with Learning Session as a first-class capability for scheduled learning, live learning, webinar, workshop, mentoring, interactive class, and recorded/on-demand learning.

Learning Session remains inside the Learning Domain. Live providers are infrastructure accessed through a provider abstraction layer.

Target providers:
- Daily
- LiveKit
- Zoom
- Google Meet
- YouTube Live

Daily and LiveKit are candidate native/custom interactive providers. Zoom and Google Meet are candidate embedded external interactive providers. YouTube Live is a candidate broadcast provider.

### 2. Architectural Objective

1. Keep Learning Session inside the Learning Domain.
2. Separate Learning business logic from live-session infrastructure.
3. Provide one provider abstraction contract.
4. Allow provider replacement without rewriting Learning history.
5. Normalize attendance and provider events.
6. Connect valid session completion to Learning Activity and Learning Economy.
7. Preserve auditability and provenance.
8. Keep the architecture ready for recording, AI assistance, and future provider expansion.

### 3. Non-Goals

This AEP does not finalize database tables/columns, ERD, database schema, API endpoints, permission IDs, frontend implementation, provider-specific implementation details, final quota/pricing, event-broker technology, or migration SQL.

### 4. Core Architecture

```text
Learning Domain
      |
Learning Session
      |
Session Orchestrator
      |
Provider Adapter
      |
+------+------+------+------+------+
| Daily |LiveKit| Zoom | GMeet|YouTube|
+------+------+------+------+------+
```

Learning does not directly depend on provider-specific APIs.

### 5. Provider Classification

| Provider | Candidate role |
|---|---|
| Daily | Native interactive |
| LiveKit | Native/custom interactive |
| Zoom | Embedded external interactive |
| Google Meet | Embedded external interactive |
| YouTube Live | Broadcast |

Actual capability, API scope, quota, account plan, pricing, and provider policy remain subject to verification before implementation.

### 6. Session Types

Existing taxonomy is retained:
- `BROADCAST`
- `INTERACTIVE`
- `ON_DEMAND`

Session type and provider are separate concepts.

Examples:
- `INTERACTIVE + DAILY`
- `INTERACTIVE + LIVEKIT`
- `INTERACTIVE + ZOOM`
- `INTERACTIVE + GOOGLE_MEET`
- `BROADCAST + YOUTUBE`

### 7. Session Lifecycle

```text
DRAFT
  |
SCHEDULED
  |
LIVE
  |
ENDED
```

Alternative:
```text
SCHEDULED -> CANCELLED
SCHEDULED/LIVE -> FAILED
```

### 8. System of Record

RUMAHAGEN is the System of Record for Learning Session identity, Learning relationship, instructor, workspace, schedule, lifecycle, participant relationship, attendance outcome, completion, provider reference, recording reference, and audit/provenance.

Provider systems are infrastructure, not Learning authority.

### 9. Attendance Architecture

```text
Provider Participation
        |
Attendance Synchronization
        |
Attendance Evaluation
        |
Completion Policy
        |
Learning Activity Completion
        |
Learning Economy
```

JOIN does not automatically mean COMPLETE.

### 10. Learning Economy Integration

Learning Session does not issue Learning Points directly.

```text
Learning Session
      |
Attendance
      |
Completion Policy
      |
Learning Activity Completed
      |
Learning Points Earned
```

Learning Economy remains responsible for point reward rules and transaction integrity.

### 11. Assessment, Credential and Title Boundary

Session completion is not competency.

```text
Session
  |
Completion
  |
Assessment / Evidence
  |
Competency
  |
Credential
  |
Awarding Path
  |
Title
```

Learning Points are not universal competency or Title requirements.

### 12. Provider Event Architecture

```text
Provider
   |
Webhook / Event
   |
Integration Layer
   |
Validation
   |
Normalization
   |
Idempotency
   |
Learning Session Event
   |
Learning Processing
```

Providers must never directly mutate Learning state.

### 13. Security

Provider credentials, API keys, OAuth secrets, signing secrets, and master tokens must remain protected server-side.

User access follows:

```text
Authenticated User
        |
Learning Session
        |
Eligibility
        |
Authorization
        |
Provider Access
```

Knowing an external meeting/session ID is not authorization.

### 14. Recording

Recording is an optional Learning artifact/reference.

```text
Live Session
     |
Recording Available
     |
Recording Reference
     |
On-Demand Learning
```

Recording may later support transcript and AI processing.

### 15. Workspace

```text
Workspace
  |
Training Program
  |
Learning Path
  |
Learning Session
  |
Attendance
  |
Completion
  |
Dashboard
```

Workspace authorization remains governed by the existing Workspace authorization model.

### 16. Failure Isolation

Provider failure must not destroy Learning history.

```text
Provider Failure
      |
Session = FAILED
      |
Audit
      |
Retry / Reschedule / Recovery
```

### 17. Provider Switching

Provider switching is controlled and must not reset enrollment, progress, valid historical attendance, Learning Activity, or Learning Points.

### 18. AI Readiness

AI is optional and must not become Learning authority.

```text
Live Session
   |
Transcript
   |
AI
 +---- Summary
 +---- Key Points
 +---- Notes
 +---- Questions
```

AI does not independently determine official competency, credentials, Titles, or Learning Points.

### 19. Audit

Candidate lifecycle events:
- LearningSessionCreated
- LearningSessionUpdated
- LearningSessionScheduled
- LearningSessionStarted
- LearningSessionEnded
- LearningSessionCancelled
- LearningSessionFailed
- ProviderConnected
- ProviderDisconnected
- ParticipantJoined
- ParticipantLeft
- AttendanceSynchronized
- LearningSessionCompleted
- RecordingAvailable

### 20. Candidate Architectural Decisions

- ADR-LS-001 — Learning Session remains inside Learning Domain.
- ADR-LS-002 — Provider Adapter abstraction.
- ADR-LS-003 — RUMAHAGEN remains System of Record.
- ADR-LS-004 — Session Type and Provider are separate.
- ADR-LS-005 — Daily and LiveKit as native interactive candidates.
- ADR-LS-006 — Zoom and Google Meet as embedded external candidates.
- ADR-LS-007 — YouTube Live as broadcast candidate.
- ADR-LS-008 — Provider credentials remain server-side.
- ADR-LS-009 — Provider events are normalized and idempotent.
- ADR-LS-010 — Attendance is evidence for Learning Activity completion, not direct point issuance.
- ADR-LS-011 — Provider failure does not destroy Learning history.
- ADR-LS-012 — Learning Session remains provider-agnostic.
- ADR-LS-013 — Recording is a Learning artifact/reference.
- ADR-LS-014 — Learning Session is AI-ready but AI-independent.

### 21. Architecture Impact Areas

**High/Critical:** Learning Domain, Learning Activity, Learning Economy, Assessment, Workspace, RBAC, API, ERD, Database Schema, Activity Log, Notification, Recording, Security/Secrets, Audit.

**Medium:** Credential, Title, AI Assistant, SEO, Monetization/Payment.

### 22. Downstream Order

```text
AEP-LS-001
    |
Business Rules
    |
Current Architecture Impact Analysis
    |
ADR
    |
System Architecture
    |
Domain Model
    |
ERD
    |
Database Schema
    |
Provider Integration Contract
    |
API
    |
RBAC / Permission Matrix
    |
User Flow
    |
PRD
    |
Notification / Activity Log
    |
Engineering Guidebook
    |
Test / Traceability
    |
Implementation
```

Implementation is not authorized until the required downstream artifacts are aligned.

---

# PART II — BUSINESS RULES BASELINE

## BR-LS-001 — Learning Session Business Rules Baseline v1.0

### Rule Numbering

Learning Session uses the `LS-xxx` namespace. Existing Learning Economy rules retain the `LE-xxx` namespace.

## Core Domain Rules

### LS-001 — Learning Session Belongs to Learning Domain
Learning Session is a capability inside Learning, not a separate domain.

### LS-002 — Provider Must Not Become Learning Authority
Providers are infrastructure and do not own Learning completion, points, competency, credentials, or Titles.

### LS-003 — RUMAHAGEN Is Learning Session System of Record
RUMAHAGEN owns authoritative Learning Session business state and provenance.

## Session Type

### LS-004 — Session Type Is Explicit
Baseline values: BROADCAST, INTERACTIVE, ON_DEMAND.

### LS-005 — Session Type and Provider Are Separate
Provider is not encoded as session type.

## Provider

### LS-006 — Provider Adapter Is Mandatory
Provider integrations must be behind the Session Orchestrator / Provider Adapter abstraction.

### LS-007 — Provider Must Be Replaceable
Provider replacement must not require rewriting Learning history.

### LS-008 — Provider Credentials Must Be Protected
Secrets remain server-side and protected.

### LS-009 — Provider Capability Must Be Explicit
Provider capabilities must be verified and represented explicitly before implementation.

### LS-010 — Daily
Candidate native interactive provider.

### LS-011 — LiveKit
Candidate native/custom interactive provider.

### LS-012 — Zoom
Candidate embedded external interactive provider.

### LS-013 — Google Meet
Candidate embedded external interactive provider.

### LS-014 — YouTube Live
Candidate broadcast provider.

## Lifecycle

### LS-015 — Session Lifecycle Must Be Explicit
Baseline: DRAFT -> SCHEDULED -> LIVE -> ENDED. Alternative: SCHEDULED -> CANCELLED; SCHEDULED/LIVE -> FAILED.

### LS-016 — Invalid State Transition Is Prohibited
State transitions must follow an explicit state machine.

### LS-017 — Cancellation Is Not Deletion
Cancelled scheduled sessions remain traceable.

### LS-018 — Failed Session Must Remain Traceable
Failure does not delete the session.

## Scheduling

### LS-019 — Scheduled Session Must Have Deterministic Schedule
Scheduled sessions must have an unambiguous schedule, including timezone.

### LS-020 — Rescheduling Preserves Session Identity
Rescheduling changes schedule, not Learning Session identity.

### LS-021 — Material Session Change Must Be Audited
Material changes must be traceable.

## Participant & Access

### LS-022 — Authentication Precedes Session Access
Users must be identified before controlled session access.

### LS-023 — Eligibility Must Be Evaluated Before Join
Eligibility and authorization precede provider access.

### LS-024 — Provider Session ID Is Not Authorization
External session identifiers are not access credentials.

### LS-025 — Instructor Access Is Role-Controlled
Instructor/host access follows authorization.

## Attendance

### LS-026 — Attendance Is Evidence/Fact
Provider participation data is evidence, not automatically completion.

### LS-027 — Attendance Completion Must Be Determinable
Completion must have a defined policy.

### LS-028 — Attendance Policy Is Configurable
Possible policy dimensions include minimum duration, attendance percentage, instructor confirmation, and assessment.

### LS-029 — Join Alone Does Not Guarantee Completion
JOIN != COMPLETED.

### LS-030 — Early Leave Must Be Evaluated
Leaving early must be evaluated against the completion policy.

### LS-031 — Duplicate Provider Events Must Not Duplicate Attendance
Duplicate provider events must be idempotent.

### LS-032 — Attendance Must Be Reconstructable
Historical attendance must be explainable.

## Learning Activity

### LS-033 — Session Completion Does Not Bypass Learning Activity Rules
If a session maps to a Learning Activity, completion follows activity rules.

### LS-034 — Learning Activity Owns Learning Reward
Learning Activity / Learning Economy owns reward configuration.

### LS-035 — Session Cannot Directly Create Official Points
The session cannot directly create Learning Point transactions.

## Learning Points

### LS-036 — Session Attendance Does Not Automatically Earn Points
Points require qualifying Learning Activity completion and reward configuration.

### LS-037 — Learning Points Remain Configurable
Point rewards are not hard-coded.

### LS-038 — Earned Points Must Preserve Session Provenance
Point transactions must remain traceable to activity/session evidence.

### LS-039 — Retry Must Not Duplicate Session Reward
Retries and duplicate events must not duplicate points.

## Assessment

### LS-040 — Session Completion Is Not Competency
Completion does not equal competency.

### LS-041 — Assessment Requirement Is Independent
Required assessment cannot be bypassed by attendance.

### LS-042 — Session May Provide Assessment Evidence
Session can provide evidence when configured.

## Credential & Title

### LS-043 — Session Does Not Directly Issue Credential
Credential issuance follows configured qualification/awarding rules.

### LS-044 — Session Does Not Directly Award Title
Title awarding remains under the Title/Awarding Path authority.

### LS-045 — Learning Points Are Not Universal Title Requirement
Points only qualify as a Title prerequisite when explicitly configured.

## Provider Events

### LS-046 — Provider Events Must Be Normalized
Provider-specific events must map to internal semantic events.

### LS-047 — Provider Events Must Be Validated
Untrusted events cannot directly alter business state.

### LS-048 — Provider Events Must Be Idempotent
Duplicate events must not create duplicate business outcomes.

### LS-049 — Provider Must Not Directly Mutate Learning State
Provider changes must pass through the integration boundary.

## Synchronization

### LS-050 — Attendance Synchronization Is Preferred Over Aggressive Polling
Use event/synchronization patterns where supported.

### LS-051 — Synchronization Must Be Repeatable
Repeated sync must not duplicate outcomes.

### LS-052 — Provider Failure Must Support Reconciliation
Failed synchronization must support retry/reconciliation.

## Recording

### LS-053 — Recording Is Optional
A session may exist without a recording.

### LS-054 — Recording Availability Is Separate From Session Completion
Ended does not necessarily mean recording is immediately available.

### LS-055 — Recording Must Preserve Learning Provenance
Recording references remain tied to their Learning Session.

### LS-056 — Recording May Become On-Demand Learning
Recording may later become an ON_DEMAND learning source.

## Audit & Provenance

### LS-057 — Material Session Actions Must Be Auditable
Lifecycle and material provider/attendance actions are auditable.

### LS-058 — Learning Outcome Must Preserve Session Provenance
Completion, points, evidence, credentials, and qualifications must be traceable to their source.

### LS-059 — Historical Session State Must Remain Auditable
Historical outcomes remain explainable.

## Configuration

### LS-060 — Session Configuration Must Be Explicit
Relevant session policies must be explicit and versionable where needed.

### LS-061 — Configuration Is Not Historical Mutation
New configuration does not rewrite historical outcomes.

## Workspace

### LS-062 — Workspace Session Access Follows Workspace Authorization
Workspace sessions follow existing authorization.

### LS-063 — Workspace Does Not Change Learning Authority
Learning remains the Learning authority.

## Visibility

### LS-064 — Session Visibility Must Be Explicit
Public/private/workspace/member-only concepts are proposed and require downstream architecture decision.

## Security

### LS-065 — Client Cannot Manufacture Attendance
Client claims alone are not authoritative attendance.

### LS-066 — Client Cannot Manufacture Completion
Client cannot directly set official completion.

### LS-067 — Client Cannot Manufacture Learning Points
Client cannot determine official reward.

### LS-068 — Client Cannot Manufacture Competency
Client-side completion cannot directly issue competency/credential/title outcomes.

## Failure & Recovery

### LS-069 — Provider Outage Does Not Delete Session
Provider outage does not erase Learning history.

### LS-070 — Provider Failure Must Be Visible
Failure must be traceable.

### LS-071 — Recovery Must Be Idempotent
Recovery cannot duplicate business outcomes.

## Provider Switching

### LS-072 — Provider Switching Is Controlled
Only authorized operations may change provider.

### LS-073 — Provider Switching Does Not Reset Learning Progress
Switching provider does not erase progress or historical outcomes.

## AI

### LS-074 — AI Is Optional
Learning Session functions without AI.

### LS-075 — AI Must Not Become Learning Authority
AI is assistive and does not independently issue official Learning outcomes.

## Notification

### LS-076 — Session Lifecycle May Trigger Notification
Candidate events include scheduled, reminder, starting soon, started, cancelled, rescheduled, ended, and recording available.

## Commercial / Payment

### LS-077 — Learning Session Does Not Own Payment Gateway Logic
Payment remains outside Learning Session business logic.

### LS-078 — Free Learning Path Must Remain Governed by Learning Rules
Paid live sessions must not silently replace required free-learning pathways where the Learning Path is defined as free-to-learn.

## Historical Integrity

### LS-079 — Historical Attendance Is Immutable by Default
Historical attendance is not freely mutable; corrections require authorized audited flows.

### LS-080 — Historical Reward Must Preserve Original Context
Historical point outcomes retain the configuration/context applicable when the outcome occurred.

---

# MASTER LEARNING SESSION INVARIANTS

1. Learning Session belongs to Learning Domain.
2. Provider is infrastructure, not Learning authority.
3. Provider-specific logic stays behind Adapter.
4. RUMAHAGEN remains System of Record.
5. Session Type and Provider remain separate.
6. Provider credentials remain protected server-side.
7. Provider events are validated and idempotent.
8. JOIN does not equal COMPLETION.
9. ATTENDANCE does not equal COMPETENCY.
10. SESSION COMPLETION does not automatically equal TITLE.
11. Learning Session cannot directly manufacture Learning Points.
12. Learning Points remain configurable.
13. Learning Points are not universal competency evidence.
14. Learning Points are not universal Title requirements.
15. Required Assessment cannot be bypassed by attendance or purchased points.
16. Historical outcomes remain auditable.
17. Provider failure must not erase Learning history.
18. Provider switching must not reset Learning progress.
19. Payment remains outside Learning Session business logic.
20. AI is assistive, not Learning authority.

# CRITICAL LEARNING CHAIN

```text
LEARNING SESSION
      |
PARTICIPATION
      |
ATTENDANCE
      |
COMPLETION POLICY
      |
SESSION COMPLETION
      |
LEARNING ACTIVITY
      |
LEARNING ECONOMY
      |
LEARNING POINTS / PROGRESSION
      |
ASSESSMENT
      |
COMPETENCY
      |
CREDENTIAL
      |
AWARDING PATH
      |
TITLE
```

The final stages are conditional; session attendance or Learning Points do not universally produce competency, credentials, or Titles.

# RULES NOT YET FINAL

1. exact attendance formula;
2. minimum attendance percentage;
3. late-join policy;
4. early-leave policy;
5. grace period;
6. instructor override;
7. maximum participants;
8. public/private visibility taxonomy;
9. provider fallback;
10. automatic failover;
11. recording retention;
12. recording privacy;
13. transcript policy;
14. replay policy;
15. provider-specific capabilities;
16. OAuth scopes;
17. provider quota/rate limits;
18. provider billing;
19. exact RBAC permissions;
20. exact API contract;
21. exact database schema;
22. exact event schema.

# GOVERNANCE STATUS

**AEP-LS-001:** Proposed
**BR-LS-001:** Proposed Baseline
**Core architecture:** Defined
**Core business rules:** Defined
**Learning Economy alignment:** Defined
**Title boundary:** Defined
**Provider abstraction:** Defined
**Security boundary:** Defined
**Audit/provenance:** Defined
**Exact provider capability:** Pending verification
**Exact attendance formula:** Pending ADR
**Exact RBAC:** Pending impact analysis
**ERD:** Pending
**Schema:** Pending
**API:** Pending
**Implementation:** NOT AUTHORIZED

## NEXT GOVERNANCE GATE

```text
AEP-LS-001
      |
BR-LS-001
      |
CURRENT ARCHITECTURE IMPACT ANALYSIS
      |
ADR-LS-xxx
      |
DOMAIN MODEL
      |
ERD / SCHEMA
      |
API / INTEGRATION CONTRACT
      |
RBAC
      |
USER FLOW / PRD
      |
TEST TRACEABILITY
      |
IMPLEMENTATION
```
