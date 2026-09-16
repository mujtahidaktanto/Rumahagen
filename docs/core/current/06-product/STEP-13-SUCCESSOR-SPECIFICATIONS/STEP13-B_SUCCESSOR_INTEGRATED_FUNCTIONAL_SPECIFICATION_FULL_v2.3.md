# RUMAHAGEN — FUNCTIONAL SPECIFICATION
## STEP13-B — Successor Integrated Functional Implementation Contract
### STEP13-B Full Rebuild v2.3 — Semantic-to-Functional Synchronization

> **Artifact mode:** FULL VERSION / WHOLE-ARTIFACT REBUILD / NOT PATCH / NOT APPEND
>
> **Normative downstream input:** accepted STEP13-A Successor Integrated PRD v3.7.
>
> **Frozen reference:** Core v1.3. Core v1.3 is not modified by this artifact.
>
> **Purpose:** translate accepted product requirements and current M01–M15 semantic authority into a complete functional contract while preserving valid Core functional detail.


**Version:** 2.1 — W4-02A.6.18  
**Date:** 19 August 2026  
**Status:** **CURRENT FUNCTIONAL IMPLEMENTATION CONTRACT — GREEN / FULLY CONSOLIDATED**  
**Predecessor:** `RUMAHAGEN_FUNCTIONAL_SPECIFICATION_v2.0_WAVE3_STEP3.9_FULL_CONSOLIDATED_SYNCHRONIZED.md`  
**Current upstream chain:** M01–M15 semantic authority → Core v1.3 frozen valid detail → STEP08 Business Rules → STEP09 Architecture/Dependencies → STEP10 ERD/Dictionary/Schema → STEP11 API → STEP12 RBAC/RLS → STEP13-A Successor PRD v3.7 → STEP13-B Functional v2.3  
**Document type:** **FULL CURRENT CONSOLIDATION — NOT PATCH / NOT ADDENDUM / NOT MAEP-ONLY**  
**Implementation authorization:** NOT GRANTED  
**Migration authorization:** NOT GRANTED  
**Production/runtime claim:** NONE

> This document is the complete functional contract for the known RumahAgen product baseline. It preserves valid legacy functionality even when unaffected by MAEP/AEP, and synchronizes the governed Learning Economy, Learning Session, Commercial/Payment, Organization, Authorization, Title/Awarding and SEO/Analytics evolution. Historical OPEN/DEFERRED wording is provenance only where later closure authority exists.

---

# 0. EXECUTION RULES

1. Current Owner-approved MADCR/ADR/Decision Log closure has highest authority.
2. Master BR-001–BR-151 remains normative.
3. Closed Commercial BR MBR-COM-001–013 are normative downstream input.
4. STEP13-A Successor Integrated PRD v3.7 is the immediate accepted product requirement authority for STEP13-B. Core PRD v2.1 is preserved only as the frozen predecessor baseline.
5. Core User Flow v2.1 is consumed as predecessor journey/state-transition detail for preservation and reconciliation; STEP13-C is the stage that will produce the successor User Flow authority.
6. Entity Mapping v2.0 remains the conceptual entity authority.
7. Accepted STEP10 ERD baseline is the current data-relationship reference for STEP13-B; no successor ERD is created here.
8. Accepted STEP10 Database Dictionary baseline is the current logical-to-physical data meaning reference for STEP13-B.
9. Accepted STEP11 API baseline is the current API capability reference for STEP13-B; exact new endpoint IDs are not invented.
10. Accepted STEP12 RBAC/RLS baseline is the current authorization reference for STEP13-B; runtime authorization remains NOT VERIFIED.
11. SEO/Analytics v2.0 remains the M11 contract authority.
12. Historical artifacts remain provenance; they are not silently rewritten.
13. No lower-level artifact may reopen a later Owner closure.
14. No business value, threshold, permission ID, endpoint, entity, role, state or physical table is invented solely to fill a documentation gap.
15. A downstream configurable/implementation detail is explicitly marked as such rather than treated as an unresolved Owner decision.
16. Functional behavior must preserve authority boundaries:
    - Payment ≠ Entitlement.
    - Entitlement ≠ RBAC.
    - Organization ≠ Entitlement.
    - Visibility ≠ Authorization.
    - Course Enrollment ≠ Session Enrollment.
    - Event Registration ≠ Session Enrollment.
    - Provider identity ≠ Session identity.
    - Provider evidence ≠ Attendance/Completion.
    - Learning Activity completion ≠ LP transaction.
    - LP ≠ competency.
    - Completion ≠ Award.
    - Title Definition ≠ Award Instance.
    - Host ≠ Instructor.
17. Client-side claims cannot create authoritative business outcomes.
18. Retry-sensitive mutations must be idempotent where the governing rule requires it.
19. Historical outcomes must remain explainable after configuration changes.
20. This document does not authorize implementation, migration, seed execution, provider activation or production deployment.

---


# STEP13-B SUCCESSOR FUNCTIONAL SYNCHRONIZATION CONTRACT

## B-01 Functional authority and preservation model

The current Functional Specification is the successor functional contract for STEP13-B. It preserves valid predecessor functionality and integrates accepted STEP13-A requirements using:

| Treatment | Functional meaning |
|---|---|
| PRESERVE | Existing Core functional behavior remains valid and is retained. |
| AUGMENT | Existing function remains and receives additional current rules, states, fields, conditions, dependencies or authorization behavior. |
| ADD-NEW | A valid capability/function absent from the predecessor is introduced from accepted semantic/product authority. |
| UPDATE-RECONCILE | Only the conflicting functional interpretation is changed; unrelated valid detail remains preserved. |
| SUPERSEDED / PROVENANCE | Historical wording remains evidence only and is not normative current behavior. |

**Synchronization ≠ deletion. Update ≠ replacement.**

## B-02 Current functional authority chain

```text
M01–M15 current semantic authority
          ↓
Core v1.3 valid functional detail
          ↓
STEP08 Business Rules
          ↓
STEP09 Architecture / Dependencies
          ↓
STEP10 ERD / Dictionary / Schema
          ↓
STEP11 API
          ↓
STEP12 RBAC / RLS
          ↓
STEP13-A Successor Integrated PRD v3.7
          ↓
STEP13-B Successor Functional Specification v2.3
```

Physical/runtime evidence is consumed only where available. Absence of runtime proof does not invalidate a semantically accepted functional requirement.

## B-03 M01 — Identity / Authentication / Verification

### FR-M01-S01 — OTP activation

**Preconditions**
- Registration data is valid.
- OTP challenge exists and is within its governed validity.
- Submitted OTP is correct.

**Main flow**
1. Agent submits OTP.
2. System validates OTP.
3. Successful OTP establishes the authenticated Agent as **ACTIVE**.
4. Session/authentication state is established according to the existing authentication contract.
5. KTP requirement is evaluated independently from RBAC.

**Rules**
- Successful OTP → ACTIVE is the default Agent activation path.
- `PENDING_REVIEW` is not a default Agent activation prerequisite.
- A separately governed account/application review workflow may still use Pending Review where its own authority requires it.
- KTP is an eligibility/requirement condition, not an RBAC permission.
- Conditional/deferred KTP completion does not create a new permission or role.

### FR-M01-S02 — Conditional KTP / deferred completion

1. Determine whether KTP is currently required for the relevant eligibility condition.
2. If the product permits deferred completion, allow the Agent to continue through the permitted flow.
3. Record/retain the requirement state according to the identity/verification contract.
4. Enforce later eligibility-dependent actions through their owning domain/authorization rules.

**Boundary:** M01 owns identity/authentication/activation/verification semantics; M10 owns authorization.

## B-04 M02 — Profile / Visibility / Review / Outcome Presentation

### FR-M02-S01 — Public profile visibility

1. Agent controls governed public profile visibility through the approved visibility model.
2. Sensitive/private fields remain outside public representation.
3. Public visibility does not itself grant authorization to mutate the underlying resource.

### FR-M02-S02 — Public CTA opt-in

1. Eligible public profile surface may expose the CTA only when the owner has opted in.
2. Administrative override is restricted to the governed **Superadmin-only** override.
3. CTA visibility does not transfer ownership or domain authority.

### FR-M02-S03 — Review auto-approval and moderation

**Main flow**
```text
Buyer/Agent review submission
        ↓
AUTO-APPROVED
        ↓
Published / Viewable
        ↓
Admin moderation after publication when required
```

- Review AUTO-APPROVE is the current semantic behavior.
- Admin moderation is post-publication moderation, not a publication approval gate.
- Valid moderation capability is preserved; its interpretation as a mandatory pre-publication approval gate is superseded.
- Aggregate rating uses approved reviews under the current review-counting rules.

### FR-M02-S04 — Outcome Presentation

Outcome Presentation consumes authoritative outcomes from their owning domains.
- It does not own Learning completion.
- It does not own Award/Title issuance.
- It does not own Organization lifecycle.
- It does not mutate upstream authoritative outcomes.

## B-05 M03 — Listing / Publication / Refresh

### FR-M03-S01 — Normal Listing publication

```text
Draft Listing
   ↓
validate required Listing conditions
   ↓
authorized publication
   ↓
PUBLISHED
```

- Normal Listing publication has **no Pending Review gate**.
- Separately governed account/application Pending Review semantics remain independent.
- Publication remains M03 Listing lifecycle authority.
- M10 authorization is evaluated before the domain action.
- M14 quota/entitlement conditions are evaluated where commercial rules require capacity.

### FR-M03-S02 — Refresh allowance and action enforcement

**Commercial-to-action chain**
```text
M14 configurable commercial allowance / entitlement
        ↓
M03 Listing Refresh action enforcement
        ↓
M10 authorization
```

Functional rules:
1. Default allowance is **5 successful Refreshes per Agent per operational day**, subject to configurable commercial allowance.
2. Operational day is **Asia/Jakarta**.
3. Unused allowance does not carry forward.
4. Maximum successful Refresh per Listing is **1 per Listing per operational day**.
5. Agent may distribute available allowance across eligible Listings.
6. Refresh repositions the Listing only within the governed **District-local** rule.
7. Server transaction timestamp is authoritative for the successful action.
8. If timestamps are exactly equal, the first recorded action wins the ordering/tie-break rule.
9. A failed Refresh does not consume allowance.
10. A successful Refresh:
   - updates the Listing's Refresh timestamp/state;
   - consumes one available allowance;
   - records the required audit/provenance event.
11. M14 owns the commercial/configurable allowance; M03 owns Listing Refresh action behavior; M10 owns authorization.
12. Exact endpoint identifiers remain downstream and are not invented here.

### FR-M03-S03 — Refresh failure behavior

If authorization, allowance, Listing eligibility, frequency, district-local, or other governed precondition fails:
- Refresh is rejected;
- no successful Refresh is recorded;
- no allowance is consumed;
- an appropriate functional failure is returned;
- audit/provenance may record the attempted/failed action where the existing audit contract requires it.

## B-06 M04 — Learning / Learning Economy / Learning Session

### FR-M04-S01 — Learning authority

M04 remains the authority for Learning, Learning Economy and Learning Session behavior.

### FR-M04-S02 — Learning Economy

The functional chain remains:
```text
Learning discovery
 → learning activity
 → completion
 → Learning Points (LP) outcome
 → progression / redemption
```

Free-to-Learn remains available within the approved model. Purchased LP is an optional pay-to-accelerate path where enabled.

### FR-M04-S03 — Learning Session

Session creation, visibility, enrollment, host/instructor distinction, provider binding, attendance, completion and session artifact behavior remain within M04. Session behavior does not transfer Learning authority to M15.

### FR-M04-S04 — Evidence boundary

Learning-owned evidence is produced by M04. M15 consumes the accepted evidence for qualification; M15 does not redefine Learning completion semantics.

## B-07 M05 — Event / Registration

### FR-M05-S01 — Participant mode

Event registration evaluates the governed `participant_mode` and participant semantics.

### FR-M05-S02 — Guest registration

Guest registration is functionally supported where the Event configuration permits it.

- Guest email is a notification/contact destination.
- Guest email is not by itself canonical platform identity.
- Registration confirmation may include an Event/meeting link only when an available governed destination exists.
- The system must not fabricate an Event/meeting link.
- Event-start notification is sent to Registered/Waitinglist participants when an available notification destination exists.
- Waitinglist behavior remains distinct from confirmed registration.
- Anonymous Guest persistence remains a physical/documentary residual where the source corpus does not prove its final physical representation.

## B-08 M06 — Developer / Project / Media / Marketing Kit / Claim

### FR-M06-S01 — Developer semantic profile

Developer management exposes the approved:
- company logo (`company_logo`);
- free-text **Tentang Developer** description.

### FR-M06-S02 — Project semantic fields

Developer Project carries the approved semantic field expansion from current M06 authority and remains compatible as a source for Listing M03 integration.

### FR-M06-S03 — Project Media

Project Media is semantically bounded to **photo/video**. A physical artifact that exposes additional media types does not broaden semantic authority.

### FR-M06-S04 — Marketing Kit

Marketing Kit is a distinct semantic capability/resource.

Authorization behavior:
- Developer: own-scope Create/Edit/Delete/View.
- Admin/Superadmin: All scope.
- Manager/Agent: View + Download.
- Buyer/Partner: no Marketing Kit access.

No physical Marketing Kit entity/table/endpoint identifier is invented at this stage.

### FR-M06-S05 — Claim / Approval Claim

Claim lifecycle is distinct from ordinary Listing lifecycle.

```text
Developer Project
   ↓
Claim
   ↓
Approval Claim
   ↓
approved
   ↓
Agent-owned Listing initialization dependency
```

Approved Claim may initialize/seed the Agent-owned Listing context as governed by M06/M03 integration.

**Critical boundary:** Claim approval does not grant ordinary M03 Listing Create, Update, Publish or Refresh authority.

## B-09 M07 — DBR / Bank Master

### FR-M07-S01 — DBR

DBR calculation and pre-screening remain M07 authority.

### FR-M07-S02 — Bank Master

Bank Master remains a semantic/master-data requirement. The absence of a proven physical representation is not converted into an invented table or schema.

## B-10 M08 — Dashboard / Notification

### FR-M08-S01 — Projection

Dashboard aggregates authoritative domain state and does not mutate the source domain.

### FR-M08-S02 — Notification

Notification communicates domain events/state and does not become the authority for Listing, Learning, Payment, Authorization, Awarding or Organization mutations.

## B-11 M09 — Administration / Configuration / Audit

### FR-M09-S01 — System Configuration

System Configuration exposes only governed configurable parameters and remains subject to M10 authorization.

### FR-M09-S02 — Administrative Audit

Administrative actions use the existing audit/provenance mechanism where applicable.

### FR-M09-S03 — Administrative Export

Administrative Export is **Superadmin-only under the governed M09-R11 boundary**.

### FR-M09-S04 — Review / Escalate / Manual Correction

These are distinct administrative behaviors:
- Review evaluates an administrative case;
- Escalate transfers the case for the governed higher authority;
- Manual Correction is a controlled correction action with provenance.

M09 does not become a super-domain authority. Provider execution, payment execution, Learning completion, Listing action execution and other domain mutations remain owned by their respective domains.

## B-12 M10 — Authorization / RBAC / RLS

### FR-M10-S01 — Authorization resolution

Functional authorization evaluates:
```text
Role
 → Role Permission
 → Capability
 → Permission
 → Scope
 → Condition
 → Ownership
 → Organization context
```

- Role = actor grouping.
- Role Permission = default/baseline permission matrix.
- Permission Preset = optional configurable authorization targeted to an existing Role.
- Permission Preset is never a new Role.
- Permission Preset cannot create capabilities/permissions outside the target Role baseline.
- Preset resolution cannot bypass ownership, organization, domain, scope, state or separation-of-duty constraints.
- Entitlement is not permission.
- Membership is not ownership.
- Public visibility is not authorization.

### FR-M10-S02 — RLS / runtime boundary

RLS and runtime authorization remain downstream evidence-gated. Current status is **NOT VERIFIED**. This functional contract does not invent RLS SQL, permission IDs, scope enums or endpoint IDs.

## B-13 M11 — Public Discovery / SEO / Measurement

### FR-M11-S01 — Ten mandatory public surfaces

M11 discovery/measurement covers exactly:
1. Homepage
2. Listing
3. Agent
4. Organization
5. Developer/Project
6. Event
7. Learning
8. Learning Session
9. Static Public Content
10. Announcement/Promotion

### FR-M11-S02 — Static Public Content

Static Public Content is a mandatory public discovery surface. Lifecycle/configuration mutation belongs to M09 or the applicable owning domain. Current governed lifecycle:
```text
Draft → Published → Unpublished → Archived
```
Only eligible Published public representations are discovery/sitemap candidates.

### FR-M11-S03 — Announcement/Promotion

Public Announcement/Promotion is:
- public;
- scheduled;
- dismissible;
- non-segmented in V1.

M11 discovers/measures the public representation; administrative configuration remains outside M11.

### FR-M11-S04 — Public SEO boundary

Each indexable public representation has one canonical URL. Sitemap participation is limited to eligible canonical public URLs. Robots policy is discovery policy, not authorization.

Public SEO/analytics must not expose private/sensitive identity, authorization or commercial data and cannot mutate authoritative business outcomes.

## B-14 M12 — Organization / Membership / Context

### FR-M12-S01 — Organization context

Agency is the Organization semantic context. Personal Context remains distinct.

### FR-M12-S02 — Membership / ownership / entitlement

Membership, ownership and commercial entitlement are separate concepts.

Organization Lead is organization-scoped authority; Member/Agent is normal membership role. Physical `ORG-ADMIN` labels do not create a new platform role.

### FR-M12-S03 — Lead Exit

Where the governed closure path applies:
```text
Lead Exit
   ↓
CLOSING
   ↓
CLOSED
```

No Lead Transfer or successor privilege inheritance is implied.

### FR-M12-S04 — Organization Public Content

Organization Public Content ownership remains with the Organization/applicable M12 context owner. M11 only discovers/measures its public representation.

M12 supplies Organization context to M03/M10/M11/M14 without absorbing their domain authority.

## B-15 M13 — Provider / BYOK

### FR-M13-S01 — Provider Catalogue

Provider Catalogue mutation is **Superadmin-only**.

### FR-M13-S02 — BYOK

BYOK/provider connection ownership is **Agent/User / OWN**.

Provider mechanics must respect M10 authorization and security boundaries.

### FR-M13-S03 — AI authority restriction

AI remains assistive and cannot become the authority for:
- business rules;
- payment confirmation;
- entitlement;
- authorization;
- Learning completion;
- attendance;
- LP;
- credential;
- qualification;
- award/title.

## B-16 M14 — Commercial / Payment / Entitlement / Quota / Promotion

### FR-M14-S01 — Commercial lifecycle

Functional commercial flow:
```text
Subscription
 → Add-on
 → Order / Checkout
 → Payment / Provider Result / Webhook
 → Verification
 → Fulfillment
 → Entitlement
 → Quota
 → Operational Pool
 → Allocation
 → Usage
 → Reconciliation
```

### FR-M14-S02 — Subscription

Subscription lifecycle:
```text
PENDING → ACTIVE → PAUSED → ACTIVE → EXPIRED
ACTIVE → CANCELLED
ACTIVE → TERMINATED
```

### FR-M14-S03 — Add-on

Add-on lifecycle:
```text
ACTIVE → INACTIVE → ARCHIVED
```
Validity may be permanent, fixed-period or usage-based as governed.

### FR-M14-S04 — Promotion

Promotion lifecycle:
```text
DRAFT → SCHEDULED → ACTIVE → EXPIRED
```
with governed DISABLED path.

### FR-M14-S05 — Order / Checkout

Order lifecycle:
```text
DRAFT → PENDING_PAYMENT → PAID → FULFILLED
```
with governed cancellation/expiry/refund branches.

Checkout is part of Order. Client totals are never authoritative.

### FR-M14-S06 — Verification / Fulfillment

Provider callback/result alone is insufficient for confirmed payment/fulfillment.

Trusted verification precedes confirmed payment. Idempotency is required before commercial fulfillment.

### FR-M14-S07 — Entitlement

Entitlement is commercial right/state and is not RBAC permission.

**Payment Success ≠ Permission Grant.**

### FR-M14-S08 — Historical purchase integrity

Confirmed purchase snapshots remain immutable. Later configuration changes do not rewrite historical purchase facts.

### FR-M14-S09 — Refresh Allowance

`daily_refresh_allowance` is a configurable M14 commercial entitlement/allowance consumed by M03.

M14 does not own Refresh action authority.

### FR-M14-S10 — Q boundary

Current M14 question inventory is preserved. **Q01–Q64 remain M14**, including **Q40, Q54, Q61 and Q62**. M15 must not absorb these questions.

### FR-M14-S11 — Reconciliation

Commercial reconciliation is first-class, auditable and does not silently authorize arbitrary remediation.

## B-17 M15 — Qualification / Evidence / Award / Title

### FR-M15-S01 — Qualification / Evidence

M15 consumes qualifying evidence from authoritative source domains.

### FR-M15-S02 — Developer Learning evidence dependency

```text
Developer Learning
      ↓
M04 Learning-owned evidence
      ↓
M15 Qualification Evidence
      ↓
Qualification
      ↓
Award
      ↓
Title presentation
```

M15 does not redefine M04 Learning completion or absorb M04 authority.

### FR-M15-S03 — Awarding

Qualification, Award and Title remain distinct functional concepts. Existing stable Title Identity and Award Instance separation are preserved.

## B-18 Cross-domain functional chains

### Chain 1 — Refresh
`M14 allowance/entitlement → M03 Refresh enforcement → M10 authorization`

### Chain 2 — Learning evidence
`M04 Learning → M04-owned evidence → M15 Qualification/Award/Title`

### Chain 3 — Claim initialization
`M06 approved Claim → Agent-owned Listing initialization → M03 Listing authority`

### Chain 4 — Public discovery
`Owning domain/M09 lifecycle → public representation → M11 discovery/measurement`

### Chain 5 — Organization context
`M12 Organization context → M03/M10/M11/M14 evaluation`

### Chain 6 — Commercial payment
`Offer → Order/Checkout → Payment → Verification → Fulfillment → Entitlement → Quota/Usage → Reconciliation`

Arrows represent dependency/consumption/authorization relationships, not transfer of domain authority.

## B-19 Non-negotiable functional invariants

- Core v1.3 remains immutable.
- Valid predecessor functionality is preserved.
- M01 successful OTP activates Agent; KTP is eligibility/requirement, not RBAC permission.
- M02 review is AUTO-APPROVED with post-publication moderation.
- M03 normal Listing publication has no Pending Review gate.
- M03 Refresh rules are enforced by M03 using M14 allowance and M10 authorization.
- M04 remains Learning authority.
- M06 Claim approval does not grant ordinary M03 Listing authority.
- M08 remains projection/communication.
- M09 does not become super-domain authority.
- M10 Permission Preset targets an existing Role and cannot expand beyond its baseline.
- M11 has ten mandatory public surfaces.
- M12 Lead Exit follows CLOSING → CLOSED where applicable; no successor privilege inheritance.
- M13 Provider Catalogue mutation is Superadmin-only; BYOK is Agent/User-owned.
- M14 Q01–Q64 remain M14.
- M14 Entitlement is not RBAC permission.
- M15 consumes M04-owned evidence and does not absorb M04/M14 authority.
- Physical/API/RLS/runtime proof remains evidence-gated.

# 1. SOURCE-CORPUS / RECONCILIATION AUDIT

## 1.1 STEP13-B current authority chain

```text
M01–M15 current semantic authority
        ↓
Core v1.3 frozen valid functional detail
        ↓
STEP08 accepted Business Rules baseline
        ↓
STEP09 accepted Architecture / Dependencies baseline
        ↓
STEP10 accepted ERD / Dictionary / Schema baseline
        ↓
STEP11 accepted API baseline
        ↓
STEP12 accepted RBAC / RLS baseline
        ↓
STEP13-A Successor Integrated PRD v3.7
        ↓
STEP13-B Successor Functional Specification v2.3
```

Core W4-02A.6 predecessor artifacts remain preservation/reference inputs. They are not treated as a higher current authority than the accepted STEP13-A v3.7 PRD.

## 1.2 Current uploaded source corpus

The STEP13-B revalidation uses **only the files uploaded in the current conversation turn**. No web or external source is used. The current upload set contains **9 artifacts: 8 ZIP packages + 1 Markdown gate report**.

The 8 ZIP packages were recursively expanded through ZIP-in-ZIP members for this revalidation. Direct recursive scan result:

- Top-level ZIP uploads: **8**
- Governance/Markdown uploads: **1**
- Total current uploads: **9**
- Recursive archive member instances: **3196**
- Nested ZIP instances: **118**
- Leaf artifacts after recursive expansion: **3078**
- ZIP integrity/testzip errors: **0**

The current STEP13-B package itself is treated as the candidate artifact under review, while the other uploaded packages provide accepted upstream, semantic, Core, API, data, authorization, and governance evidence. Duplicate archive members are treated as provenance unless an authority source promotes a copy.

### Current upload set

1. STEP13-B Successor Integrated Functional Specification package v2.2 — candidate under revalidation.
2. STEP13-A Successor Integrated PRD package v3.7 — immediate accepted PRD authority.
3. STEP13-00 Input/Currentness/Authority Gate v1.1 — currentness and Core immutability gate.
4. M01–M15 current reconciliation package — semantic authority and Core Impact evidence.
5. STEP SYNC CORE package — accepted cross-step/core synchronization evidence.
6. Core v1.3 frozen/reference package — preservation baseline.
7. Step11 Sync Core package — API baseline/evidence.
8. PRE-00 gate package — upstream semantic/governance evidence.
9. STEP12 sync Core package — RBAC/RLS baseline and readiness evidence.

## 1.3 Legacy preservation rule

The following remain functional requirements even when not directly affected by MAEP/AEP:

- registration/authentication;
- OTP;
- login/logout/session management;
- password recovery;
- agent verification;
- agent profile;
- public profile;
- reviews;
- listing CRUD;
- listing moderation;
- listing search/filter/map;
- listing lifecycle;
- listing price history;
- listing leads/views;
- developer directory;
- project claims;
- learning course/lesson/quiz;
- course enrollment;
- quiz attempts;
- certificates;
- event calendar/registration;
- DBR;
- notifications;
- admin configuration;
- audit log;
- RBAC;
- regional references;
- URL redirects;
- Organization;
- AI BYOK;
- SEO;
- analytics.

The Database Dictionary explicitly confirms these legacy structures remain retained. fileciteturn47file5

---

# 2. DECISION / OPEN-STATE GATE

## 2.1 Current Owner-level unresolved count

**0**

The current chain explicitly closes and propagates:

| Decision | Current state | Functional consequence |
|---|---|---|
| MADCR-010 | CLOSED / GOVERNING | Commercial Entitlement owns commercial capacity/access. |
| MADCR-011 | CLOSED / GOVERNING | Payment belongs to M14 Commercial. |
| MADCR-002 | CLOSED / GOVERNING | Payment Core is provider-independent behind Provider Adapter. |
| MADCR-003 | CLOSED / GOVERNING | Payment verification and idempotent fulfillment required. |
| MADCR-005 | CLOSED / GOVERNING | Reconciliation is first-class. |
| MADCR-036 | CLOSED / GOVERNING | Title Definition and Award Instance are separate. |
| MADCR-049 | CLOSED / GOVERNING — Option A | Learning Activity is completion/reward boundary. |
| MADCR-053 | CLOSED / GOVERNING | Authorization = Capability + Permission + Scope. |
| MADCR-054 | CLOSED / GOVERNING | Host and Instructor are separate capabilities. |
| OPEN-C01 / MADCR-012 | CLOSED | Commercial architecture has explicit boundaries. |
| AEP3-OD-01 | CLOSED | Stable Title Identity; no Title Identity Version. |
| AEP3-OD-02 | CLOSED | One authority source at a time. |
| AEP3-OD-03 | CLOSED | Existing audit/history reused. |
| AEP3-OD-04 | CLOSED | No mandatory parent Rule Version lineage. |
| AEP3-OD-05 | CLOSED | Qualification selects applicable Rule Version; Award snapshots it. |
| AEP4-OD-08 | CLOSED | No automatic provider failover; switching manual/admin controlled. |
| AEP4-OD-16 | APPROVED | Session Enrollment lifecycle exists. |
| AEP4-OD-17 | APPROVED | PENDING → ACTIVE → COMPLETED. |
| MADCR-058 | CLOSED | Midtrans MVP behind Provider Adapter. |
| MBR-COM-001–013 | OWNER APPROVED / CLOSED | Commercial BR baseline is normative. |
| TECH-27/28 | CLOSED/FROZEN DESIGN | Instructor Session permission family; Host remains resource capability. |

The Wave 3 PRD explicitly records that no current Owner-level MADCR/OD remains unresolved at the PRD gate. fileciteturn47file13

## 2.2 Stale OPEN handling

Historical artifacts may still show OPEN/DEFERRED/RESEARCH for items later closed. They are retained as historical provenance only.

Examples include:

```text
AEP4-OD-08
MADCR-058
older Commercial BR evidence-gap wording
older AEP3/AEP4 snapshots
```

Current downstream documents already apply the later closure states. The current ERD explicitly records the stale-vs-current reconciliation. fileciteturn46file1

## 2.3 Controlled residuals — not OPEN Owner decisions

The following remain downstream implementation/configuration/runtime gates:

- exact physical schema for some newly introduced logical domains;
- exact runtime RLS execution verification;
- provider OAuth/webhook mechanics;
- provider credentials/accounts;
- attendance numeric configuration;
- recording retention/privacy configuration;
- migration execution;
- production activation;
- GA4/GTM/Search Console runtime configuration.

They are not promoted to Owner decisions.

---

# 3. FUNCTIONAL MODEL

## 3.1 Functional requirement structure

Every requirement is expressed through:

```text
Actor
→ Preconditions
→ Trigger
→ Main Flow
→ Alternate / Exception Flow
→ State Change
→ Side Effects
→ Authorization
→ Audit / Notification
→ Acceptance Criteria
```

## 3.2 State ownership rule

A functional state belongs to its owning domain.

Examples:

```text
Payment state
    → Commercial/Payment

Entitlement state
    → Commercial

Listing state
    → Listing

Enrollment state
    → Learning or Session according to enrollment type

Attendance
    → Session evaluation

Learning Activity completion
    → Learning

Qualification
    → Awarding

Award
    → Awarding
```

A dashboard, notification, analytics event or client UI state cannot become the authoritative source.

---

# 4. ACTOR AND CONTEXT MODEL

## 4.1 Platform actors

| Actor | Functional role |
|---|---|
| Guest | Unauthenticated public discovery/inquiry state. |
| Buyer | Registered consumer for favorites/inquiry/review where supported. |
| Agent | Independent-first property-agent actor. |
| Instructor | Existing platform learning role with governed Session permissions. |
| Developer Partner | External developer/project collaboration actor. |
| Admin | Operational platform actor. |
| Manager | Internal supervisory actor. |
| Superadmin | Highest application-level administrative authority. |
| Organization Lead | Organization-scoped authority, not a platform Admin. |
| Organization Member/Agent | Organization participant. |
| Host | Resource-level Session capability, not a platform role. |

RBAC confirms Guest is not a physical role row and Host is not a role. fileciteturn48file3

## 4.2 Contexts

```text
PERSONAL
ORGANIZATION
PUBLIC
ORGANIZATION
PARTNER
PRIVATE
```

Visibility is separate from authorization.

Organization membership is separate from ownership and entitlement.

---

# 5. GLOBAL AUTHORIZATION FUNCTION

For every protected operation:

```text
Authenticate actor
      ↓
Resolve platform role
      ↓
Resolve permission/capability
      ↓
Resolve platform scope: all / own / none
      ↓
Resolve domain authority / Organization context where applicable
      ↓
Resolve resource capability where applicable
      ↓
Check entitlement where applicable
      ↓
Apply server validation
      ↓
Apply RLS
      ↓
Execute state transition
```

RBAC v2.0 explicitly requires application authorization plus database RLS and rejects client-supplied scope/capability/Organization/entitlement claims as proof. fileciteturn48file9

---

# 6. MODULE 1 — REGISTRATION & AUTHENTICATION

## 6.1 FR-M01-001 — Agent registration

**Actor:** prospective Agent

### Preconditions
- No active conflicting account for the registration identity.
- Required fields available.

### Main flow

```text
Open registration
→ enter identity/contact
→ verify OTP
→ create account
→ upload required verification documents
→ submit review
→ if a separately governed account/application review is required, enter that workflow; otherwise successful OTP activates the Agent
→ notify reviewer
```

### Alternate flows

- OTP invalid → reject verification and allow retry.
- OTP expired → require resend.
- Required field missing → validation error.
- Duplicate identity → registration blocked.
- Upload invalid → reject file and retain form.
- Reviewer rejects → account = REJECTED and reason recorded.
- Reviewer approves → account = ACTIVE.

### Rules
- Agent cannot publish listing while not ACTIVE.
- Approval may be performed by Superadmin/Admin/Manager where permission allows.
- KTP/NPWP is protected compliance data.

### Acceptance
- OTP verification works.
- A separately governed Pending Review state is not treated as Active; it is not the default Agent activation state after successful OTP.
- Approval/rejection is auditable.
- Rejection reason is retained.

## 6.2 FR-M01-002 — Login

Supported:

```text
email/password
Google SSO
```

Apple SSO is future/roadmap and is not an active implementation requirement in current PRD. fileciteturn47file13

### Flow

```text
Submit credentials
→ authenticate
→ resolve current account status
→ if ACTIVE → authenticated session
→ otherwise → status-specific handling
```

Suspended/rejected/pending accounts cannot be treated as active operational actors.

## 6.3 FR-M01-003 — Password recovery

```text
Forgot password
→ identify account
→ issue reset mechanism
→ validate reset
→ set new password
→ invalidate/revoke applicable sessions
→ login
```

## 6.4 FR-M01-004 — Session management

Supported baseline:

- login;
- logout;
- logout all devices;
- session revocation;
- current authenticated identity.

Authentication ≠ authorization.

---

# 7. MODULE 2 — AGENT PROFILE

## 7.1 FR-M02-001 — View profile

Agent may view own full permitted profile.

Public users may view only public profile data.

Global authorized administrators may view/edit according to permission.

## 7.2 FR-M02-002 — Edit profile

```text
Agent
→ edit own profile
→ validate
→ save non-sensitive fields
```

Sensitive fields may require approval.

### Sensitive field flow

```text
edit sensitive field
→ submit
→ PENDING_APPROVAL
→ reviewer
→ approve / reject
```

## 7.3 FR-M02-003 — Public profile

Public profile may expose:

- public name;
- profile photo;
- public bio;
- specialization;
- service area;
- permitted statistics;
- permitted badges;
- permitted contact CTA.

Private identity/legal documents must never be public.

## 7.4 FR-M02-004 — Review

```text
Buyer
→ select Agent
→ submit review
→ AUTO-APPROVED
→ Published/Viewable
→ post-publication moderation if moderation action is required
```

Current PRD preserves:

- one active Buyer review per Agent;
- later submission replaces prior active review;
- Buyer may review multiple Agents;
- Agent self-review is allowed;
- Agent self-review is auto-approved;
- AUTO-APPROVED reviews contribute to aggregate rating subject to the approved-review counting rule;
- aggregate rating is shown only when at least one approved review exists.

These rules are explicit in the current PRD. fileciteturn47file13

---

# 8. MODULE 3 — PROPERTY LISTING

## 8.1 FR-M03-001 — Create Listing

### Preconditions
- Agent = ACTIVE.
- Actor has listing creation permission.
- If Organization context, active Organization membership and relevant authority exist.

### Context selection

```text
Create Listing
→ PERSONAL
or
→ ORGANIZATION
```

One Listing remains one canonical entity.

## 8.2 FR-M03-002 — Listing content

Required functional groups:

- title;
- category;
- transaction purpose;
- property type;
- Province;
- City/Kabupaten;
- District;
- optional area keyword;
- address;
- map point;
- price;
- transaction unit for rent;
- negotiation/fixed state;
- description;
- highlights;
- property specifications;
- legal status;
- media;
- permitted contact data;
- tags.

Administrative region fields use canonical reference data; area keyword is supplemental free text.

## 8.3 FR-M03-003 — Listing lifecycle

```text
DRAFT
→ PENDING_REVIEW
→ PUBLISHED
→ SOLD / RENTED
→ EXPIRED
```

Alternative moderation:

```text
PENDING_REVIEW
→ REJECTED
→ DRAFT / revision
```

Take-down may move a published resource out of public visibility according to existing moderation policy.

## 8.4 FR-M03-004 — Listing ownership

Agent can CRUD own Listing.

Agent cannot mutate another Agent's Listing merely because a client supplies another owner ID or claims global scope.

RBAC explicitly preserves hard ownership boundaries independent of `granted_scope`. fileciteturn48file9

## 8.5 FR-M03-005 — Primary listing

Primary Listing may link to Developer Project.

Official developer-controlled price/specification data must remain authoritative where the BR requires it.

Agent may add permitted marketing content without overriding official data.

## 8.6 FR-M03-006 — Secondary listing

Agent supplies and owns responsibility for the data.

Legal statement remains agent representation subject to moderation.

## 8.7 FR-M03-007 — Media duplicate check

At submission:

```text
exact hash
→ 100% identical
→ BLOCK

perceptual similarity 90–99%
→ WARNING / non-blocking

<90%
→ no duplicate warning
```

Comparison is limited to the same Agent's relevant listings, preserving legitimate reuse of Primary project imagery across different Agents.

This legacy requirement is explicitly retained in PRD v2.0. fileciteturn47file13

## 8.8 FR-M03-008 — WhatsApp CTA

```text
Public Listing
→ Chat via WhatsApp
→ open WhatsApp template
→ record CTA/lead event
```

If WhatsApp number is invalid/missing:

```text
disable WhatsApp CTA
→ show permitted fallback contact
```

Analytics observes the event; it does not become lead-conversion authority.

## 8.9 FR-M03-009 — Search

Filters include:

- category;
- transaction purpose;
- property type;
- location;
- radius;
- price;
- land/building area;
- bedroom/bathroom minimum;
- legal status;
- keyword;
- sort.

Filters combine using AND logic.

List and Map views are supported.

## 8.10 FR-M03-010 — Expiration

Admin-configured expiration period is applied.

Historical expiration must remain explainable.

Renewal must follow the authorized lifecycle transition.

---

# 9. MODULE 4 — LEARNING CENTER / LEARNING ECONOMY

## 9.1 FR-M04-001 — Learning discovery

```text
Agent
→ Learning Center
→ discover Program/Path
→ inspect prerequisites
→ inspect unlock/progression
→ inspect assessment requirements
→ select eligible activity
```

## 9.2 FR-M04-002 — Free-to-Learn

Eligible free content can be consumed without purchasing LP.

```text
Start Activity
→ consume content
→ complete Activity
→ server validates completion
→ if configured, grant earned LP
→ update progression
```

No paid LP purchase is mandatory.

## 9.3 FR-M04-003 — Learning Activity boundary

Course/Module remains content/product structure.

Learning Activity is the canonical completion/reward boundary.

This is MADCR-049 Option A and is explicitly propagated by the PRD. fileciteturn47file13

## 9.4 FR-M04-004 — Completion

Completion must be validated by the Learning authority.

Analytics cannot manufacture completion.

Session evidence may become completion evidence only through the governed Session → Learning Activity evaluation chain.

## 9.5 FR-M04-005 — Learning Points

LP has two major provenance classes:

```text
EARNED
PURCHASED
```

The system must preserve transaction history.

Current balance is a projection of transactions where applicable.

## 9.6 FR-M04-006 — Earn LP

```text
Learning Activity
→ completion validation
→ evaluate reward configuration
→ create LP transaction if eligible
```

Duplicate completion/retry must not double-grant the same reward when the business rule requires idempotency.

## 9.7 FR-M04-007 — Purchase LP

```text
Select LP package
→ Commercial Order
→ Payment
→ verification
→ confirmed
→ Commercial fulfillment
→ purchased LP grant
→ LP transaction
```

Payment retry/callback cannot duplicate the grant.

## 9.8 FR-M04-008 — Pay to accelerate

Purchased LP may unlock eligible progression.

It cannot:

- purchase competency;
- force assessment pass;
- manufacture credential;
- manufacture Title;
- manufacture Award.

## 9.9 FR-M04-009 — Assessment

```text
Activity / Path
→ assessment required?
→ if no → continue
→ if yes → attempt
→ evaluate
→ pass / fail
```

Assessment result remains distinct from LP balance and Activity completion.

## 9.10 FR-M04-010 — Credential

Where governed Learning requirements are met:

```text
Learning evidence
→ credential qualification
→ Certificate / approved credential outcome
```

Certificate is not Award Instance.

## 9.11 FR-M04-011 — Partnership Learning

```text
discover partner learning
→ partner-specific enrollment/access
→ partner delivery
→ partner result
→ retain partner provenance
```

Partner learning is not silently converted into Internal Learning Economy state.

---

# 10. MODULE 4 EXTENSION — LEARNING SESSION

Learning Session is an extension of M04, not a new top-level module.

## 10.1 FR-M04-S01 — Create Session

Authorized actor:

- Instructor within permission/scope;
- Admin;
- Manager;
- other explicitly authorized operator.

Flow:

```text
Create Session
→ choose type:
   BROADCAST / INTERACTIVE / ON_DEMAND
→ enter content/schedule
→ choose visibility:
   PUBLIC / ORGANIZATION / PARTNER / PRIVATE
→ optional Organization
→ optional canonical Event
→ configure provider binding
→ save DRAFT
```

## 10.2 FR-M04-S02 — Session lifecycle

```text
DRAFT
→ SCHEDULED
→ LIVE
→ ENDED
```

Exceptions:

```text
SCHEDULED → CANCELLED
SCHEDULED/LIVE → FAILED
```

State transitions are server-controlled.

## 10.3 FR-M04-S03 — Session Enrollment

Session Enrollment is separate from Course Enrollment and Event Registration.

Lifecycle:

```text
PENDING
→ ACTIVE
→ COMPLETED
```

The current User Flow explicitly propagates this lifecycle. fileciteturn47file12

### Rules

- learner may create PENDING enrollment;
- learner cannot self-set ACTIVE;
- learner cannot self-set COMPLETED;
- payment success alone does not define ACTIVE;
- provider participation does not define enrollment state.

## 10.4 FR-M04-S04 — Session visibility

### PUBLIC
Public discovery permitted.

### ORGANIZATION
Organization context required where applicable.

### PARTNER
Partner semantics may exist, but MVP has no physical Session↔Partner relation.

### PRIVATE
Existing authorization/enrollment/resource context is used.

No dedicated MVP audience table is introduced.

## 10.5 FR-M04-S05 — Session → Organization

A Session may reference zero or one Organization.

Organization membership remains a second-layer authority, not Host/Instructor capability.

## 10.6 FR-M04-S06 — Session → Event

A Session may reference zero or one canonical Event representation.

Event remains calendar/discovery context.

## 10.7 FR-M04-S07 — Host / Instructor assignment

```text
Session
→ explicit resource assignment
→ HOST
or
→ INSTRUCTOR
```

Same actor may hold both only through explicit assignment.

Host is not a platform role.

Instructor role does not imply Host.

Host capability does not imply Instructor.

TECH-28 freezes this authorization direction. fileciteturn48file7

## 10.8 FR-M04-S08 — Provider binding

```text
Session
→ Provider Binding
→ Provider Adapter
→ external provider
```

Provider-specific session ID is not canonical Session identity.

Provider credentials are infrastructure-controlled.

## 10.9 FR-M04-S09 — Provider evidence

```text
Provider event
→ validate
→ normalize
→ idempotency check
→ correlate
→ Participation Evidence
```

Provider callback does not directly create Attendance or Completion.

## 10.10 FR-M04-S10 — Attendance

```text
Participation Evidence
→ attendance evaluation
→ attendance outcome
```

Exact numeric attendance/grace configuration remains downstream/configurable and is not invented here.

## 10.11 FR-M04-S11 — Completion

```text
Attendance / governed evidence
→ completion evaluation
→ Completion Outcome
```

Completion Outcome may become evidence for a qualifying Learning Activity.

It does not directly:

- mint LP;
- issue Certificate;
- issue Title;
- create Award.

## 10.12 FR-M04-S12 — Provider switching

```text
authorized operator
→ replace Provider Binding
→ preserve Session identity/history
```

No automatic provider failover.

Manual/admin switching only.

This follows AEP4-OD-08 closure. fileciteturn46file1

## 10.13 FR-M04-S13 — Session artifact

Recording/media/artifact may be referenced.

Artifact existence does not establish attendance or completion.

Retention/privacy/replay is configurable downstream.

---

# 11. MODULE 5 — EVENT CALENDAR

## 11.1 FR-M05-001 — Create Event

Authorized actor creates event with:

- category;
- title;
- schedule;
- location/online context;
- description;
- permitted media;
- registration settings.

## 11.2 FR-M05-002 — Event Registration

```text
User
→ Event detail
→ RSVP
→ Event Registration
```

Event Registration is not Session Enrollment.

## 11.3 FR-M05-003 — Session association

Event may reference a canonical Session representation.

Event does not own:

- Session lifecycle;
- provider evidence;
- attendance;
- Learning Activity completion.

The current PRD explicitly establishes this boundary. fileciteturn47file13

---

# 12. MODULE 6 — DEVELOPER DIRECTORY / PROJECT

## 12.1 FR-M06-001 — Developer management

Authorized operator can:

- create developer;
- update developer;
- create project;
- update project;
- manage project media;
- publish/activate according to moderation.

## 12.2 FR-M06-002 — Agent project claim

```text
Agent
→ Project
→ claim/request association
→ authorization
→ approved claim
```

## 12.3 FR-M06-003 — Primary Listing integration

Primary Listing may use official project information.

Developer data authority remains separate from Agent-owned marketing content.

## 12.4 FR-M06-004 — Non-exclusivity

No MVP territory/project exclusivity.

A project may be marketed by multiple eligible Agents.

---

# 13. MODULE 7 — DBR / KPR PRE-SCREENING

## 13.1 FR-M07-001 — Calculate DBR

```text
Agent
→ DBR Calculator
→ enter applicant financial inputs
→ select configured bank
→ calculate
→ DBR result
```

## 13.2 FR-M07-002 — Bank selection

Current closed rule:

- Admin-controlled bank master;
- maximum four displayed banks;
- fixed 10-percentage-point interpretation bands.

DBR is pre-screening, not bank approval.

## 13.3 FR-M07-003 — Result history

Simulation result may be saved for permitted use.

A DBR result does not become a bank decision.

---

# 14. MODULE 8 — DASHBOARD / NOTIFICATION

## 14.1 FR-M08-001 — Dashboard aggregation

Dashboard may aggregate:

- listings;
- leads/views;
- learning progress;
- LP;
- sessions;
- commercial entitlement/quota;
- awards/titles;
- notifications.

Dashboard is a projection surface.

## 14.2 FR-M08-002 — Notifications

Notifications may be generated for:

- registration;
- moderation;
- organization membership;
- listing lifecycle;
- learning;
- session;
- payment;
- entitlement;
- awarding.

Notification delivery does not mutate the underlying state.

---

# 15. MODULE 9 — ADMIN / CONFIGURATION / AUDIT

## 15.1 FR-M09-001 — Moderation

Authorized Admin/Manager/Superadmin can review governed queues.

Possible outcomes:

```text
APPROVE
REJECT
TAKE DOWN
```

Where rejection is applicable, reason must be retained.

## 15.2 FR-M09-002 — Configuration

Admin may change explicitly configurable parameters.

Examples include:

- listing expiration;
- commercial configuration;
- Learning Economy configuration;
- DBR bank configuration;
- permitted system settings.

Configuration changes must not rewrite immutable historical transactions.

## 15.3 FR-M09-003 — Audit

Governed mutations create audit/history according to the existing AuditLog architecture.

A separate appeal/history subsystem is not introduced.

AEP3-OD-03 explicitly closes this boundary. fileciteturn46file1

---

# 16. MODULE 10 — RBAC / PERMISSION / RLS

## 16.1 FR-M10-001 — Role resolution

Current physical roles:

```text
superadmin
manager
admin
instructor
agent
developer_partner
buyer
```

Guest is unauthenticated state, not a physical role row. fileciteturn48file3

## 16.2 FR-M10-002 — Permission resolution

Permission identity is:

```text
(module_code, action_code)
```

Current platform scope vocabulary:

```text
all
own
none
```

Organization scope is a second-layer domain authority, not a new platform scope enum.

## 16.3 FR-M10-003 — Permission editing

- Superadmin may modify governed permission rows.
- Manager may modify Agent permission rows where explicitly allowed.
- Manager cannot modify Admin/Manager/Superadmin permission rows.
- Agent cannot modify own permission matrix.
- Instructor cannot modify RBAC.
- Buyer cannot modify RBAC.
- Developer Partner cannot modify RBAC.

These rules are explicitly preserved by current RBAC. fileciteturn48file9

## 16.4 FR-M10-004 — RLS

RLS must enforce database-level boundaries.

Required negative protections:

- no client scope bypass;
- no client Organization bypass;
- no client capability bypass;
- no client entitlement bypass;
- no protected-resource disclosure;
- cross-Organization isolation;
- evidence/artifact scope isolation.

## 16.5 FR-M10-005 — Session authorization

Frozen Session permission direction includes:

- Create/View/Update/Delete/Manage Learning Session;
- Create/View Session Enrollment;
- View Session Evidence;
- Manage Session Attendance;
- Manage Session Completion;
- View Session Artifact;
- Assign Learning Session;
- Manage Session Provider;
- Manage Session Visibility.

TECH-28 records the frozen permission family and role direction. fileciteturn48file7

## 16.6 FR-M10-006 — Session negative authorization

| Actor | Session mutation |
|---|---|
| Agent | DENY |
| Instructor | ALLOW only within permission/scope/assignment |
| Manager | ALLOW/global according to permission |
| Admin | ALLOW/global according to permission |
| Developer Partner | DENY by default |
| Buyer | DENY by default |
| Guest | DENY |

Host operations require Host assignment plus Host permission.

Instructor-only access does not authorize provider mutation.

---

# 17. MODULE 11 — SEO / ANALYTICS

## 17.1 FR-M11-001 — Public SEO

SEO-enabled public surfaces include, where visibility permits:

- public Listing;
- Agent Profile;
- Organization;
- Developer/Project;
- public Event;
- permitted Learning/Session discovery.

## 17.2 FR-M11-002 — SEO metadata

Supported:

- title;
- description;
- canonical URL;
- Open Graph;
- Twitter Card;
- structured data;
- sitemap.

## 17.3 FR-M11-003 — protected indexing

Do not publicly index:

- Dashboard;
- Admin;
- private Learning;
- Payment;
- Authorization;
- private Organization;
- private Session;
- private/personalized data.

## 17.4 FR-M11-004 — Listing lifecycle SEO

Sold/Rented Listing may remain SEO-visible when policy permits.

Expired Listing follows lifecycle/noindex policy.

Draft is not public SEO. Normal Listing publication has no Pending Review gate; separately governed account/application review states remain private.

## 17.5 FR-M11-005 — Analytics

Analytics may observe:

- views;
- CTA;
- discovery;
- permitted Learning interaction;
- permitted Session interaction;
- commercial funnel;
- Award presentation.

Analytics cannot:

- confirm payment;
- grant entitlement;
- complete Learning;
- establish attendance;
- grant LP;
- issue Award;
- change RBAC.

The current SEO/Analytics baseline explicitly preserves this authority boundary. fileciteturn47file11

---

# 18. MODULE 12 — ORGANIZATION / AGENCY

## 18.1 FR-M12-001 — Create Organization

```text
Agent
→ Create Organization
→ enter data
→ validate
→ Organization created
→ creator becomes Lead
```

Personal Context remains intact.

## 18.2 FR-M12-002 — Invite member

```text
Lead
→ invite Agent
→ invitation
→ Agent accepts
→ membership ACTIVE
```

## 18.3 FR-M12-003 — Join request

```text
Agent
→ request join
→ Lead review
→ accept/reject
```

## 18.4 FR-M12-004 — Leave Organization

```text
Member
→ leave
→ membership terminated
→ resolve Organization-context Listings
→ resolve governed commercial/promotion consequences
→ Personal Context retained
```

## 18.5 FR-M12-005 — Forced removal

```text
Lead
→ remove member
→ record reason
→ terminate membership
→ resolve listings/promotions according to governed rules
```

## 18.6 FR-M12-006 — Organization closure

```text
Lead
→ initiate closure
→ confirm
→ OTP
→ Organization = CLOSING
→ block new member/listing/commercial operations
→ resolve active resources
→ Organization = CLOSED
```

Closure processing is idempotent.

## 18.7 FR-M12-007 — Organization authority

Organization:

- is not RBAC;
- is not Entitlement;
- is not Payment;
- is not Host capability;
- is not Instructor capability.

Membership provides Organization context only where the relevant permission/rule also allows the action.

---

# 19. MODULE 13 — AI BYOK

## 19.1 FR-M13-001 — Connect provider

```text
User
→ AI Assistant
→ select provider
→ enter own credential
→ server validation
→ encrypted connection storage
```

Credential is not returned in normal API responses.

## 19.2 FR-M13-002 — Use AI

```text
User
→ select connection
→ submit prompt
→ server-side provider call
→ response
→ display
```

## 19.3 FR-M13-003 — AI authority restriction

AI output cannot directly:

- approve listing;
- confirm payment;
- grant entitlement;
- complete Learning;
- establish attendance;
- issue Certificate;
- issue Title;
- issue Award;
- change RBAC;
- create Host capability.

---

# 20. MODULE 14 — COMMERCIAL / PAYMENT

## 20.1 FR-M14-001 — Commercial catalog

Approved MVP commercial surfaces are limited to:

1. listing quota add-ons;
2. Learning Point packages;
3. Free membership;
4. Pro monthly;
5. Pro annual;
6. paid listing boost/premium promotion;
7. paid internal RumahAgen Learning classes;
8. paid partner Learning classes.

The PRD explicitly limits MVP monetization to this approved scope. fileciteturn47file13

## 20.2 FR-M14-002 — Order

```text
User
→ select commercial offer
→ create Order
→ calculate commercial snapshot
→ checkout
→ Payment
```

Order remains the commercial purchase context.

## 20.3 FR-M14-003 — Payment

```text
Order
→ Payment Transaction
→ Payment Core
→ Provider Adapter
→ Midtrans MVP
→ provider result
→ verification
→ confirmed / failed / pending / expired / cancelled
```

Payment Core remains provider-independent.

Midtrans is MVP implementation provider behind the adapter.

## 20.4 FR-M14-004 — Verification

Client success UI is not sufficient.

Payment must be verified by the trusted payment path.

## 20.5 FR-M14-005 — Idempotent fulfillment

For a repeated callback/retry:

```text
same business payment outcome
→ same fulfillment result
→ no duplicate entitlement/LP/quota
```

## 20.6 FR-M14-006 — Entitlement

```text
confirmed payment
→ Commercial fulfillment
→ Commercial Entitlement
```

Entitlement is commercial access/capacity authority.

It is not RBAC.

## 20.7 FR-M14-007 — Quota

Conceptual chain:

```text
Entitlement
→ Quota Capacity
→ Operational Quota Pool
→ Allocation
→ Usage
```

Allocation ≠ Usage.

Organization membership ≠ quota authority.

## 20.8 FR-M14-008 — Listing quota

Where a Listing is published and quota is required:

```text
authorized publish
→ validate available quota capacity
→ consume according to commercial rules
→ publish
```

If quota is unavailable:

```text
publish blocked
→ explain required commercial action
```

## 20.9 FR-M14-009 — Promotion

Promotion lifecycle must preserve:

- offer;
- start/end;
- entitlement/benefit;
- expiration;
- historical purchase context.

Expiration must not rewrite historical payment records.

## 20.10 FR-M14-010 — Reconciliation

```text
detect inconsistency
→ create Reconciliation Case
→ investigate
→ resolve
→ retain audit/provenance
```

Reconciliation is first-class.

---

# 21. MODULE 15 — TITLE / AWARDING

## 21.1 FR-M15-001 — Title Definition

Title Definition is the stable identity of a Title.

Stable identity is preserved.

No Title Identity Version entity is introduced.

## 21.2 FR-M15-002 — Awarding Path

```text
Title
→ Awarding Path
→ Path Version
→ Rule Version
```

Versioning exists to preserve historical applicability.

## 21.3 FR-M15-003 — Qualification

```text
Learning / Session / Assessment / other governed evidence
→ Qualification Evidence
→ Qualification Evaluation
→ select applicable Rule Version
→ qualify / not qualify
```

## 21.4 FR-M15-004 — Award

If qualified:

```text
Qualification Evaluation
→ Award Instance
→ snapshot qualifying path/rule provenance
→ Award lifecycle
```

Award Instance is not Title Definition.

## 21.5 FR-M15-005 — Award history

Existing audit/history architecture is reused.

No separate appeal/history subsystem.

## 21.6 FR-M15-006 — Presentation

Current approved presentation model:

```text
Primary presentation = max 1
Featured presentations = max 3
```

The exact physical storage remains downstream where not already frozen.

## 21.7 FR-M15-007 — One authority source

At any point, one applicable authority source determines the official Awarding outcome.

Conflicting authority must not result in duplicate official Awards.

---

# 22. CROSS-DOMAIN FUNCTIONAL CHAINS

## 22.1 Commercial → Entitlement

```text
Order
→ verified Payment
→ Commercial fulfillment
→ Entitlement
```

Never:

```text
analytics
→ entitlement
```

Never:

```text
client success flag
→ entitlement
```

## 22.2 Commercial → Learning

```text
verified Payment
→ paid Learning entitlement/access
→ authorized Learning access
```

Payment does not complete Learning.

## 22.3 Commercial → LP

```text
verified Payment
→ purchased LP grant
→ LP transaction
```

No duplicate grant on retry.

## 22.4 Session → Learning

```text
Session
→ Provider Evidence
→ Attendance Evaluation
→ Completion Outcome
→ qualifying Learning Activity
→ Learning completion/reward
```

Session is evidence source.

Learning Activity remains completion/reward boundary.

## 22.5 Learning → Awarding

```text
Learning Activity / Assessment / Credential evidence
→ Qualification Evaluation
→ applicable Rule Version
→ Award Instance
```

Completion alone does not automatically create Award.

## 22.6 Organization → Listing

```text
Organization membership/context
→ authorized Organization Listing operation
```

Organization is context.

It does not become listing ownership authority beyond the governed context model.

## 22.7 Organization → Session

```text
Organization context
→ Session organization relation
→ membership/authority evaluation
```

Organization membership does not automatically grant Host or Instructor.

---

# 23. DATA INTEGRITY / IDEMPOTENCY

## 23.1 General

Mutations that can be retried must define an idempotent business key or equivalent guard where the owning domain requires it.

## 23.2 Payment

No duplicate commercial fulfillment.

## 23.3 LP

No duplicate reward/grant for the same qualifying event.

## 23.4 Session evidence

Provider event reprocessing must not create duplicate authoritative evidence.

## 23.5 Enrollment

Duplicate active Session Enrollment for the same learner/session must be prevented according to the current logical model.

## 23.6 Organization closure

Repeated closure request must not produce multiple closure side effects.

---

# 24. SECURITY / PRIVACY FUNCTIONAL REQUIREMENTS

The system must protect:

- passwords;
- OTP;
- KTP;
- NPWP;
- legal verification documents;
- payment credentials;
- provider credentials;
- BYOK API credentials;
- private Organization data;
- private Session evidence;
- private Learning evidence;
- internal administrative data.

Protected resource access must avoid information disclosure.

RBAC defines the 404-vs-403 principle according to whether disclosure itself would leak protected-resource existence. fileciteturn48file9

---

# 25. PUBLIC / PRIVATE FUNCTIONAL BOUNDARY

## Public

May include:

- public listings;
- public agent profiles;
- public developer/project;
- public organization representation;
- public event;
- public Session where permitted.

## Protected

Includes:

- Dashboard;
- Admin;
- private Learning;
- private Session;
- payment;
- authorization;
- private organization information;
- private evidence;
- credentials.

Public visibility never grants mutation authority.

---

# 26. ERROR / FAILURE BEHAVIOR

## 26.1 Validation error

Return field-level validation feedback.

No partial authoritative mutation.

## 26.2 Authorization failure

```text
authenticated but unauthorized
→ 403 where disclosure is safe
```

Protected-resource non-disclosure may use:

```text
404
```

according to API contract. fileciteturn48file9

## 26.3 Payment failure

No entitlement/paid access grant unless trusted confirmed payment exists.

## 26.4 Provider failure

Provider failure must not be converted into Session completion.

No automatic provider failover.

Manual/admin switching remains the approved operational behavior.

## 26.5 Analytics failure

Analytics failure must not become a business-state failure unless a separately approved business dependency exists.

## 26.6 Notification failure

Notification failure must not reverse the authoritative domain state.

## 26.7 Configuration failure

Invalid configuration must fail validation rather than silently inventing a default business rule.

---

# 27. AUDIT / PROVENANCE FUNCTIONAL REQUIREMENTS

Every domain must preserve enough provenance to answer:

```text
What happened?
Who caused it?
Under what authority?
When?
Against which resource?
Which rule/configuration applied?
What evidence supported the result?
```

Historical outcomes must remain explainable.

Current configuration must not rewrite historical Award, Payment, LP, Session or other authoritative outcomes.

---

# 28. LEGACY FEATURE COMPLETENESS MATRIX

| Legacy area | Preserved | Synchronized |
|---|---:|---:|
| Registration/OTP | ✓ | Authorization |
| Login/password | ✓ | Security |
| Agent verification | ✓ | RBAC |
| Agent profile | ✓ | Public/private boundary |
| Agent review | ✓ | Moderation |
| Listing CRUD | ✓ | Organization context + quota |
| Listing media | ✓ | Duplicate-image rule |
| Listing price history | ✓ | Historical integrity |
| Listing leads/views | ✓ | Analytics boundary |
| Learning Course | ✓ | Activity boundary |
| Course Lesson | ✓ | Activity structure |
| Quiz | ✓ | Assessment |
| Course Enrollment | ✓ | Separate from Session Enrollment |
| Quiz Attempt | ✓ | Qualification evidence |
| Certificate | ✓ | Separate from Award |
| Event | ✓ | Session context |
| Event Registration | ✓ | Separate from Session Enrollment |
| Developer Partner | ✓ | Project/claim boundary |
| Developer Project | ✓ | Listing integration |
| DBR | ✓ | Closed bank configuration |
| Notifications | ✓ | Domain projections |
| System Config | ✓ | Configurable parameters |
| Audit Log | ✓ | Shared provenance |
| Roles | ✓ | Capability/Permission/Scope |
| Permissions | ✓ | Session permission family |
| Role Permissions | ✓ | Frozen mapping |
| Regional references | ✓ | Canonical location |
| URL Redirects | ✓ | SEO lifecycle |
| Organization | ✓ | Agency=Organization |
| Organization Membership | ✓ | Second-layer authority |
| Organization Invitations | ✓ | Join flow |
| AI Provider | ✓ | BYOK |
| AI Connection | ✓ | Credential isolation |
| SEO | ✓ | Public/private boundary |
| Analytics | ✓ | Observation only |
| Learning Economy | — | ✓ |
| Learning Session | — | ✓ |
| Commercial/Payment | — | ✓ |
| Entitlement/Quota | — | ✓ |
| Title/Awarding | — | ✓ |

---

# 29. FUNCTIONAL ACCEPTANCE MASTER CHECKLIST

## M01
- [x] Registration.
- [x] OTP.
- [x] Review.
- [x] Approval/rejection.
- [x] Login.
- [x] Password reset.
- [x] Session management.

## M02
- [x] Profile.
- [x] Public profile.
- [x] Sensitive-field approval.
- [x] Review moderation.
- [x] Aggregate rating rules.

## M03
- [x] Listing creation.
- [x] Personal/Organization context.
- [x] Draft/review/publish lifecycle.
- [x] Sold/Rented/Expired.
- [x] Media.
- [x] Duplicate image control.
- [x] Search/filter/map.
- [x] WhatsApp CTA.
- [x] Lead event.
- [x] Price history.
- [x] Ownership boundary.

## M04
- [x] Learning discovery.
- [x] Free-to-Learn.
- [x] Learning Activity.
- [x] Completion.
- [x] LP earned/purchased.
- [x] Progression.
- [x] Assessment.
- [x] Credential.
- [x] Partner Learning.
- [x] Learning Session.

## Session
- [x] Session creation.
- [x] Session type.
- [x] Visibility.
- [x] Organization relation.
- [x] Event relation.
- [x] Enrollment lifecycle.
- [x] Provider binding.
- [x] Participation evidence.
- [x] Attendance evaluation.
- [x] Completion outcome.
- [x] Host/Instructor assignment.
- [x] Manual provider switching.
- [x] Artifact reference.

## M05
- [x] Event lifecycle.
- [x] Registration.
- [x] Session representation boundary.

## M06
- [x] Developer.
- [x] Project.
- [x] Media.
- [x] Agent claim.
- [x] Non-exclusive marketing.

## M07
- [x] DBR calculation.
- [x] Admin bank configuration.
- [x] Fixed 10pp interpretation.
- [x] Pre-screening boundary.

## M08
- [x] Dashboard aggregation.
- [x] Notifications.

## M09
- [x] Moderation.
- [x] Configuration.
- [x] Audit.

## M10
- [x] Role.
- [x] Permission.
- [x] Scope.
- [x] Organization second-layer authority.
- [x] Resource capability.
- [x] RLS.
- [x] Negative authorization.
- [x] Permission editability.

## M11
- [x] SEO metadata.
- [x] SSR/SSG-capable public surfaces.
- [x] Open Graph/Twitter.
- [x] Structured data.
- [x] Sitemap.
- [x] Lifecycle SEO.
- [x] Protected noindex.
- [x] Analytics observation.
- [x] Google ownership configurability.

## M12
- [x] Organization creation.
- [x] Invite.
- [x] Join.
- [x] Leave.
- [x] Forced removal.
- [x] Closure.
- [x] Personal Context preservation.

## M13
- [x] Provider connection.
- [x] Credential isolation.
- [x] AI proxy.
- [x] AI authority restriction.

## M14
- [x] Approved MVP catalog.
- [x] Order.
- [x] Payment.
- [x] Provider Adapter.
- [x] Midtrans MVP.
- [x] Verification.
- [x] Idempotency.
- [x] Entitlement.
- [x] Quota.
- [x] Promotion.
- [x] Reconciliation.

## M15
- [x] Stable Title Identity.
- [x] Awarding Path.
- [x] Versioning.
- [x] Qualification.
- [x] Rule Version snapshot.
- [x] Award Instance.
- [x] Award history.
- [x] Presentation.

---

# 30. STEP13-A v3.7 CURRENT DELTA FUNCTIONAL ACCEPTANCE

This section is the explicit STEP13-B functional acceptance bridge to the accepted STEP13-A PRD v3.7. It is normative for this successor artifact and is not a new authority. Each item must be represented by one or more functional sections, while valid Core functionality remains preserved elsewhere in this document.

| Current requirement family | Functional realization | Status |
|---|---|---|
| M01 OTP → ACTIVE; KTP eligibility/deferred completion | FR-M01-S01..S02 + preserved M01 functions | COVERED |
| M02 visibility/CTA; AUTO-APPROVED review; post-publication moderation; non-owning Outcome Presentation | FR-M02-S01..S04 + preserved M02 functions | COVERED |
| M03 no-Pending-Review normal publication; complete Refresh contract | FR-M03-S01..S03 + preserved Listing lifecycle | COVERED |
| M04 Learning/Learning Economy/Learning Session authority | FR-M04-S01..S04 + preserved session functions | COVERED |
| M05 participant_mode; Guest; Guest contact; conditional link; Waitinglist; Event-start notification | FR-M05-S01..S02 + preserved Event functions | COVERED |
| M06 Developer fields; Project; photo/video Media; Marketing Kit; Claim/Approval Claim | FR-M06-S01..S05 + preserved integration functions | COVERED |
| M07 DBR and Bank Master semantic boundary | FR-M07-S01..S02 | COVERED / physical residual retained |
| M08 projection/notification boundary | FR-M08-S01..S02 + preserved dashboard/notification functions | COVERED |
| M09 System Configuration; Admin Audit; Administrative Export; Review/Escalate/Manual Correction | FR-M09-S01..S04 | COVERED |
| M10 Role/Role Permission/Capability/Scope/Condition/Ownership/Organization; Permission Preset | FR-M10-S01..S02 + preserved authorization functions | COVERED |
| M11 all 10 mandatory public discovery surfaces; Static Public Content; Announcement/Promotion | FR-M11-S01..S04 + preserved SEO/analytics functions | COVERED |
| M12 organization context; membership; Lead Exit → CLOSING → CLOSED; no successor privilege inheritance; public content | FR-M12-S01..S04 + preserved organization functions | COVERED |
| M13 Superadmin-only Provider Catalogue; Agent/User-owned BYOK | FR-M13-S01..S03 | COVERED |
| M14 complete commercial lifecycle; Refresh Allowance; Q01–Q64 boundary | FR-M14-S01..S11 + preserved commercial functions | COVERED |
| M15 Qualification/Evidence/Award/Title; Developer Learning → M04 evidence → M15 evidence | FR-M15-S01..S03 + preserved awarding functions | COVERED |

# 30. TRACEABILITY TO CURRENT W4-02A.6 SOURCES

| Source | Current authority | Functional propagation |
|---|---|---|
| W4-02A.6 Execution Prompt v1.1 | Execution discipline | Full-source consolidation, carry-forward audit, stop rules |
| W4-02A.6.0 Base Track v1.1 | Ordering authority | 6.18 position and dependency chain |
| W4-02A.6.10 Business Rules v1.2 | Normative business logic | BR invariants and current Commercial closure |
| STEP13-A Successor Integrated PRD v3.7 | Immediate accepted product requirement authority | M01–M15 product behavior and successor requirements |
| Core PRD v2.1 / W4-02A.6.11 | Frozen predecessor product baseline | Valid predecessor detail preservation and reconciliation |
| Core User Flow v2.1 / W4-02A.6.12 | Predecessor journey/state reference | Valid functional behavior preservation and reconciliation; successor flow is STEP13-C |
| Entity Mapping v2.0 | Conceptual entity authority | Entity ownership/context boundaries |
| W4-02A.6.13 ERD v2.1 | Logical relationship authority | Relationships/cardinalities and domain boundaries |
| W4-02A.6.14 Dictionary v2.2 | Logical-to-physical meaning | Data semantics and current 86-table meaning |
| W4-02A.6.15 Schema v2.7 | Current physical reference | Current physical table/reference reality; W4-01E/W4-02 remain underneath |
| W4-02A.6.16 API v2.1 | API contract | Endpoint capability families, request/result semantics |
| W4-02A.6.17 RBAC/RLS v2.1 | Authorization contract | Permission, scope, capability, organization authority, RLS boundary |
| SEO/Analytics v2.0 | M11 contract | Public discovery and measurement |
| Master BR-001–BR-151 | Normative business rules | Business invariants |
| MBR-COM-001–013 | CLOSED — OWNER APPROVED | Commercial behavior |
| MADCR-010 | Governing | Entitlement authority |
| MADCR-011 | Governing | Payment placement in M14 |
| MADCR-002 | Governing | Provider-independent Payment Core + Adapter |
| MADCR-003 | Governing | Verification/idempotent fulfillment |
| MADCR-005 | Governing | Reconciliation |
| MADCR-036 | Governing | Title Definition / Award Instance separation |
| MADCR-049 | Governing — Option A | Learning Activity completion/reward boundary |
| MADCR-053 | Governing | Capability + Permission + Scope |
| MADCR-054 | Governing | Host ≠ Instructor |
| AEP3-OD-01 | Closed | Stable Title Identity |
| AEP3-OD-02 | Closed | One authority source at a time |
| AEP3-OD-03 | Closed | Existing audit/history reuse |
| AEP3-OD-04 | Closed | No mandatory parent Rule lineage |
| AEP3-OD-05 | Closed | Qualification selects Rule Version; Award snapshots it |
| AEP4-OD-08 | Closed | No automatic provider failover |
| AEP4-OD-16 | Approved | Session Enrollment lifecycle |
| AEP4-OD-17 | Approved | PENDING → ACTIVE → COMPLETED |
| MADCR-058 | Closed / Governing | Midtrans MVP behind Provider Adapter |
| TECH-27/28 | Closed / Frozen design | Instructor Session permission family; Host remains resource capability |

The immediate 6.17 authorization handoff explicitly requires 6.18 to consume PRD, User Flow, API, ERD and Schema and prohibits invention of roles, permissions, scope enums, Session authority or RLS semantics.

# 31. IMPLEMENTATION HANDOFF RULES

W4-02A.6.19 Technical Specification and later implementation/execution documents must consume this document as the current functional authority.

They must not:

- reinterpret a legacy feature as removed merely because MAEP did not touch it;
- convert analytics into business authority;
- merge Course Enrollment and Session Enrollment;
- merge Event Registration and Session Enrollment;
- merge Certificate and Award Instance;
- merge Payment and Entitlement;
- merge Organization and RBAC;
- infer Host from Instructor;
- infer Instructor from Host;
- allow client claims to establish scope/capability/entitlement;
- introduce automatic provider failover;
- invent missing business values;
- execute migration/production from this document.

---

# 32. DOWNSTREAM CONTROLLED RESIDUAL REGISTER

The W4-02A.6.13–6.17 chain materially reduces the residuals carried by the Wave 3 functional artifact. The current 86-table physical reference is now established by 6.15 and reconciled to W4-01E/W4-02; therefore physical schema definition is no longer an unresolved functional-spec residual.

| Residual | Classification | Blocking this functional baseline? |
|---|---|---:|
| Runtime RLS / PostgreSQL / Supabase execution verification | Runtime gate | No |
| Provider OAuth/webhook operational mechanics | Integration implementation | No |
| Provider credentials/accounts/runtime configuration | Environment/integration gate | No |
| Attendance numeric/configuration values where intentionally configurable | Config/implementation | No |
| Recording retention/privacy runtime configuration | Config/privacy implementation | No |
| Exact production deployment/migration execution | Controlled execution | No |
| Production provider activation | Production gate | No |
| GA4/GTM/Search Console runtime IDs/configuration | Environment/config | No |
| Final automated test execution/evidence | Verification gate | No |

**Important current-state correction:** Learning Activity, Commercial/Payment, Entitlement/Quota and Awarding are represented in the current 86-table physical reference of W4-02A.6.15. This functional contract therefore treats their physical existence as a current schema-reference fact, while still not treating this document as executable SQL authority or runtime verification.

No row above is an unanswered Owner decision.

# 33. LEGACY PREDECESSOR FUNCTIONAL GATE — PROVENANCE ONLY

## Result

**LEGACY / PRESERVED FOR PROVENANCE — NOT THE STEP13-B CURRENT GATE**

The historical W4-02A.6.18 predecessor gate is retained because it is part of the valid Core functional provenance. Its historical `GREEN` status must not be interpreted as the current STEP13-B gate result. The current STEP13-B gate is defined only in Section B-26 below and supersedes this predecessor checkpoint.

### Gate checklist

- [x] W4-02A.6.10 Business Rules v1.2 consumed.
- [x] W4-02A.6.11 PRD v2.1 consumed.
- [x] W4-02A.6.12 User Flow v2.1 consumed.
- [x] Entity Mapping v2.0 consumed.
- [x] W4-02A.6.13 ERD v2.1 consumed.
- [x] W4-02A.6.14 Database Dictionary v2.2 consumed.
- [x] W4-02A.6.15 Database Schema v2.7 consumed.
- [x] W4-02A.6.16 API v2.1 consumed.
- [x] W4-02A.6.17 RBAC/Permission/RLS v2.1 consumed.
- [x] SEO/Analytics baseline retained where functionally relevant.
- [x] Legacy functional baseline preserved.
- [x] Commercial/Payment boundaries synchronized.
- [x] Learning Economy synchronized.
- [x] Learning Session synchronized.
- [x] Organization synchronized.
- [x] Title/Awarding synchronized.
- [x] Authorization/RLS semantics synchronized.
- [x] Current 86-table physical reference respected without creating a competing SQL baseline.
- [x] Stale OPEN/DEFERRED wording not reintroduced as current authority.
- [x] No new Owner decision invented.
- [x] No runtime PASS claimed.
- [x] No migration/production authorization implied.
- [x] Functional specification remains an integrated-system contract, not an independent module specification.


# 34. CARRY-FORWARD AUDIT

| Field | Result |
|---|---|
| Predecessor artifact | `RUMAHAGEN_FUNCTIONAL_SPECIFICATION_v2.0_WAVE3_STEP3.9_FULL_CONSOLIDATED_SYNCHRONIZED.md` |
| New artifact | `RUMAHAGEN_W4-02A.6.18_FUNCTIONAL_SPECIFICATION_CURRENT_FUNCTIONAL_IMPLEMENTATION_CONTRACT_v2.1.docx` |
| Content units reviewed | 34 major predecessor sections, plus subsection/function inventories and acceptance matrix |
| CARRY FORWARD | Entire valid M01–M15 functional baseline; global functional model; actor/context model; authorization model; all module requirements; Session; Commercial/Payment; Awarding; cross-domain chains; idempotency; security/privacy; public/private boundary; error behavior; audit/provenance; legacy completeness; acceptance checklist; implementation handoff; historical boundaries |
| UPDATE | Current 6.10–6.17 authority chain; PRD/User Flow/ERD/Dictionary/Schema/API/RBAC current versions; current 86-table physical reference; current Midtrans closure; current Host/Instructor authorization; current runtime boundary; W4-02A.6.18 gate and downstream handoff |
| SUPERSEDE | Wave 3 current-state wording that named v2.0 downstream contracts as current; residual wording that treated Learning Activity/Commercial/Awarding physical schema as still undefined; Wave 3 Step 3.9 gate and next-step labels |
| HISTORICAL / PROVENANCE | Wave 3 Step 3.9 chronology; older v1.x functional lineage; older AEP/MAEP status snapshots; earlier evidence-gap statements where later W4 closure exists |
| REMOVED | 0 valid predecessor content intentionally removed |
| Missing valid content | 0 identified |
| Untraced new substantive content | 0 |
| Material conflict | 0 unresolved |
| Owner decision required | 0 |
| Audit result | **PASS** |

### Carry-forward completeness proof

The predecessor was treated as a complete functional master, not as a delta source. All functional modules M01–M15 and all major cross-cutting sections remain present. No valid predecessor section was removed merely because its content was unaffected by the W4 synchronization.

The only current-state replacements are those required by later authoritative W4 artifacts: version/source authority updates, physical-schema residual reclassification, current authorization/API boundaries, current gate/handoff, and historical labeling.

# 35. INTERNAL RECONCILIATION / CONFLICT SCAN

| Check | Result | Treatment |
|---|---|---|
| W4-02A.6.10 BR alignment | PASS | Current normative rules retained |
| PRD ↔ Functional | PASS | Current PRD v2.1 product boundaries propagated |
| User Flow ↔ Functional | PASS | Current journeys/state transitions propagated |
| ERD ↔ Functional | PASS | Entity/relationship semantics preserved |
| Dictionary ↔ Functional | PASS | Data meaning constraints respected |
| Schema ↔ Functional | PASS | Current 86-table physical reference acknowledged; no SQL invented |
| API ↔ Functional | PASS | API capability/result boundaries reflected |
| RBAC/RLS ↔ Functional | PASS | Authorization chain, Session capability and RLS boundaries reflected |
| Commercial ↔ Functional | PASS | Payment/Entitlement/RBAC separation preserved |
| Learning ↔ Functional | PASS | Learning Activity / LP / assessment boundaries preserved |
| Session ↔ Functional | PASS | Session identity, enrollment, provider evidence, attendance, completion preserved |
| Awarding ↔ Functional | PASS | Title/Path/Rule/Qualification/Award separation preserved |
| Organization ↔ Functional | PASS | Membership/context not confused with ownership or entitlement |
| SEO/Analytics ↔ Functional | PASS | Observation/discovery not elevated to business authority |
| Historical OPEN leakage | PASS | Stale states remain provenance only |
| Runtime claims | PASS | None introduced |
| Physical-schema fork | PASS | None introduced |
| Legacy feature loss | PASS | No valid legacy functional section removed |
| New untraced authority | PASS | None |
| Owner conflict | PASS | 0 unresolved Owner decisions |

### Current-state reconciliation conclusion

No material conflict blocks W4-02A.6.18. The major correction versus the Wave 3 functional artifact is **current-state synchronization**, not a redesign of functional behavior.

# 36. FINAL CURRENT FUNCTIONAL CHAIN

```text
OWNER DECISION / NORMATIVE BR
        ↓
W4-02A.6.10 BUSINESS RULES / TRACEABILITY v1.2
        ↓
W4-02A.6.11 PRD v2.1
        ↓
W4-02A.6.12 USER FLOW v2.1
        ↓
ENTITY MAPPING v2.0
        ↓
W4-02A.6.13 ERD v2.1
        ↓
W4-02A.6.14 DATABASE DICTIONARY v2.2
        ↓
W4-02A.6.15 DATABASE SCHEMA v2.7
        ↓
W4-02A.6.16 API v2.1
        ↓
W4-02A.6.17 RBAC / PERMISSION / RLS v2.1
        ↓
THIS DOCUMENT
W4-02A.6.18 FUNCTIONAL SPECIFICATION v2.1
        ↓
W4-02A.6.19 TECHNICAL SPECIFICATION
        ↓
W4-02A.6.20 UI / UX SPECIFICATION
```


# STEP13-B RECONCILIATION / COVERAGE / HANDOFF

## B-20 PRD ↔ Functional Traceability Matrix

| PRD requirement area | Functional coverage | Treatment | Authority |
|---|---|---|---|
| M01 OTP → ACTIVE | FR-M01-S01 | UPDATE-RECONCILE | M01 |
| M01 KTP eligibility/deferred completion | FR-M01-S02 | AUGMENT | M01 |
| M02 visibility / CTA / review / outcome | FR-M02-S01..S04 | AUGMENT / UPDATE-RECONCILE | M02 |
| M03 publication / Refresh | FR-M03-S01..S03 | UPDATE-RECONCILE / ADD-NEW | M03 + M14 + M10 |
| M04 Learning / Economy / Session | FR-M04-S01..S04 | PRESERVE / AUGMENT | M04 |
| M05 participant / Guest / waitinglist | FR-M05-S01..S02 | AUGMENT | M05 |
| M06 Developer / Project / Media | FR-M06-S01..S03 | AUGMENT / UPDATE-RECONCILE | M06 |
| M06 Marketing Kit / Claim | FR-M06-S04..S05 | ADD-NEW / AUGMENT | M06 + M10/M03 |
| M07 DBR / Bank Master | FR-M07-S01..S02 | PRESERVE / CONTROLLED | M07 |
| M08 projection / notification | FR-M08-S01..S02 | PRESERVE | M08 |
| M09 configuration / audit / export | FR-M09-S01..S04 | AUGMENT | M09 + M10 |
| M10 RBAC / Permission Preset | FR-M10-S01..S02 | UPDATE-RECONCILE / AUGMENT | M10 |
| M11 ten public surfaces | FR-M11-S01..S04 | ADD-NEW / AUGMENT | M11 + M09/domain |
| M12 organization / closure / content | FR-M12-S01..S04 | AUGMENT | M12 |
| M13 Provider Catalogue / BYOK | FR-M13-S01..S03 | UPDATE-RECONCILE | M13 + M10 |
| M14 commercial lifecycle / Refresh allowance | FR-M14-S01..S11 | AUGMENT / ADD-NEW | M14 |
| M15 qualification/evidence/award/title | FR-M15-S01..S03 | AUGMENT | M15 + M04 |

## B-21 Capability / Function Coverage Matrix

| Capability family | Existing predecessor | Successor functional coverage | Status |
|---|---:|---:|---|
| Registration / OTP / session | Yes | M01-S01 + preserved M01 functions | COVERED |
| KTP eligibility / deferred completion | Partial | M01-S02 | COVERED |
| Profile / public visibility / CTA | Yes | M02-S01..S02 | COVERED |
| Review / moderation / outcome presentation | Yes/partial | M02-S03..S04 | COVERED |
| Listing CRUD / lifecycle / publication | Yes | M03-S01 + preserved M03 functions | COVERED |
| Listing Refresh | Partial | M03-S02..S03 | COVERED |
| Learning / Economy / Session | Yes | M04-S01..S04 + preserved session functions | COVERED |
| Event / participant / Guest | Partial | M05-S01..S02 + preserved event functions | COVERED |
| Developer / Project / Media | Yes | M06-S01..S03 | COVERED |
| Marketing Kit | No explicit predecessor function | M06-S04 | ADD-NEW / COVERED |
| Claim / Approval Claim | Partial | M06-S05 | COVERED |
| DBR / Bank Master | Yes/partial | M07-S01..S02 | COVERED / physical residual |
| Dashboard / Notification | Yes | M08-S01..S02 | COVERED |
| Administration / Configuration / Audit | Yes | M09-S01..S04 | COVERED |
| RBAC / Permission / Preset | Yes/partial | M10-S01..S02 | COVERED / runtime NOT VERIFIED |
| Public discovery ten surfaces | Partial | M11-S01..S04 | COVERED |
| Organization / closure / context | Yes | M12-S01..S04 | COVERED |
| Provider Catalogue / BYOK | Yes/partial | M13-S01..S03 | COVERED |
| Commercial lifecycle | Yes | M14-S01..S11 + preserved M14 functions | COVERED |
| Qualification / Award / Title | Yes | M15-S01..S03 + preserved M15 functions | COVERED |

## B-22 Functional finding register

| ID | Finding | Classification | Resolution |
|---|---|---|---|
| B-001 | Predecessor M01 wording could treat Pending Review as default Agent activation | UPDATE-RECONCILE | Rebuilt M01 flow: successful OTP → ACTIVE; separate review workflows remain separately governed. |
| B-002 | Predecessor M02 review flow used PENDING → moderation → approval | UPDATE-RECONCILE | Rebuilt as AUTO-APPROVED → Published/Viewable → post-publication moderation. |
| B-003 | Predecessor SEO wording coupled Draft with Pending Review | UPDATE-RECONCILE | Current Listing SEO rule states Draft is non-public; normal Listing publication has no Pending Review gate. |
| B-004 | Refresh contract absent as a complete functional behavior | ADD-NEW / AUGMENT | Added FR-M03-S02/S03 with full allowance/reset/frequency/timestamp/audit boundary. |
| B-005 | Developer company_logo / Tentang Developer absent from predecessor Functional | ADD-NEW | Added FR-M06-S01. |
| B-006 | Marketing Kit capability absent from predecessor Functional | ADD-NEW | Added FR-M06-S04 with approved authorization direction. |
| B-007 | Claim approval dependency insufficiently explicit | AUGMENT | Added FR-M06-S05 and cross-domain Chain 3; no M03 authority transfer. |
| B-008 | Permission Preset semantics absent from predecessor Functional | AUGMENT | Added FR-M10-S01 with Role/Role Permission/Preset resolution. |
| B-009 | Static Public Content and Announcement/Promotion absent from predecessor Functional | ADD-NEW | Added FR-M11-S01..S03. |
| B-010 | Provider Catalogue/BYOK ownership needed current reconciliation | UPDATE-RECONCILE | Added FR-M13-S01..S02. |
| B-011 | M14 Refresh allowance and Q boundary needed explicit functional coverage | AUGMENT | Added FR-M14-S09..S10. |
| B-012 | M15 Developer Learning evidence dependency needed explicit functional trace | AUGMENT | Added FR-M15-S02. |
| B-013 | STEP13-B retained legacy W4-02A.6 source hierarchy as if it were current authority after accepted STEP13-A v3.7 | UPDATE-RECONCILE / PROVENANCE | Rebuilt authority hierarchy: STEP13-A v3.7 is immediate product authority; Core/W4 artifacts are predecessor preservation/reference sources. |
| B-014 | Historical predecessor gate marked `GREEN` could be read as the current STEP13-B gate and conflict with the later STEP13-B gate result | UPDATE-RECONCILE / PROVENANCE | Reclassified Section 33 as legacy provenance-only and made B-26 the sole current STEP13-B gate. |
| B-015 | Current STEP13-A v3.7 delta coverage was distributed across module sections but not explicitly enumerated as a single functional acceptance bridge | AUGMENT / TRACEABILITY | Added Section 30 current-delta functional acceptance matrix covering M01–M15 before the source traceability section. |

No unresolved semantic authority decision is opened by these findings.

## B-23 Source traceability contract

| Upstream source | Functional use |
|---|---|
| STEP13-A Successor Integrated PRD v3.7 | Immediate product requirement authority |
| STEP13-00 v1.1 gate | Currentness, source boundary, Core immutability, M01–M15 propagation findings |
| STEP08 Business Rules v1.1 | Normative business invariants |
| STEP09 Architecture / Dependencies | Domain dependency and authority boundaries |
| STEP10 ERD / Dictionary / Schema | Data semantics and physical-reference awareness |
| STEP11 API | Existing endpoint capability families and API contract context |
| STEP12 RBAC/RLS | Authorization behavior and evidence boundary |
| Core Functional v2.1 | Full predecessor functional baseline and preservation source |
| Current M01–M15 packages | Current semantic authority and Core Impact propagation evidence |

## B-24 Physical / runtime boundary

This document does not claim:
- runtime authorization PASS;
- runtime RLS PASS;
- production authorization;
- database migration execution;
- new physical tables;
- exact endpoint IDs;
- exact permission IDs;
- RLS SQL;
- provider credentials;
- production payment activation.

Where the source corpus contains a physical/API gap, the functional requirement remains semantically valid while realization stays downstream and evidence-gated.

## B-25 Second full deep scan protocol

The rebuilt artifact was scanned after generation for:
- required M01–M15 module coverage;
- mandatory M03 Refresh invariants;
- M10 Permission Preset boundary;
- M11 complete ten-surface inventory;
- M14 Q01–Q64 boundary;
- M15 evidence dependency;
- Core immutability language;
- prohibited invention patterns;
- known predecessor contradiction phrases.

## B-26 Final STEP13-B gate

**Acceptance criteria**
- Accepted STEP13-A PRD is reflected in the Functional Specification.
- Valid Core v1.3 / predecessor functionality is preserved.
- Current M01–M15 functional additions/updates are covered or explicitly classified.
- Cross-domain authority boundaries are explicit.
- PRD ↔ Functional traceability exists.
- Capability/function coverage exists.
- Finding register and provenance exist.
- No blocking semantic conflict remains.
- Physical/runtime absence is not used to reject semantic requirements.

**Result:** `PASS WITH CONTROLLED RESIDUALS — FULL REBUILD / SECOND DEEP SCAN CLEAN AT SEMANTIC-FUNCTIONAL GATE LEVEL`

**STEP13-C = READY**

## B-27 Required handoff to STEP13-C

STEP13-C must consume this successor Functional Specification as the current functional authority and rebuild the User Flow as an end-to-end behavioral bridge.

STEP13-C must preserve:
- all valid predecessor functional detail;
- all accepted M01–M15 functional synchronizations;
- authority/dependency boundaries;
- public-surface inventory;
- commercial/Refresh chain;
- Learning → evidence → qualification chain;
- Guest/Event semantics;
- physical/runtime evidence separation.


# 37. REQUIRED END-OF-STEP RESPONSE

**Status:** COMPLETE / GREEN

**What was fully consolidated:** The complete Wave 3 Functional Specification v2.0 was rebuilt as a current W4-02A.6.18 functional implementation contract, preserving all valid legacy and evolved M01–M15 behavior while synchronizing the current 6.10–6.17 contract chain.

**Source authorities used:** W4-02A.6 Execution Prompt v1.1; W4-02A.6.0 Base Track v1.1; W4-02A.6.10–6.17; Entity Mapping v2.0; SEO/Analytics v2.0; governing BR/MADCR/AEP/TECH closure sources; historical Wave 3 Functional Specification v2.0.

**Conflicts found and resolution:** No unresolved material conflict. Stale Wave 3 current-state/version wording was superseded by the current W4 chain. Physical-schema residuals were reclassified because W4-02A.6.15 now provides the current 86-table physical reference.

**Carry-Forward Audit:** PASS — missing valid content 0; untraced new substantive content 0; unauthorized removals 0; Owner decision required 0.

**Cross-domain dependencies verified:** Identity, Agent, Organization, Listing, Learning, Session, Event, Awarding, Commercial, Payment, Entitlement, RBAC, Permission, RLS, API, ERD, Database Schema, AI, Notification, Analytics and Module Execution boundaries.

**Historical/provenance boundary:** Wave 3 v2.0 and older artifacts remain lineage/provenance. They do not override W4-02A.6 current authority.

**Artifact file:** `RUMAHAGEN_W4-02A.6.18_FUNCTIONAL_SPECIFICATION_CURRENT_FUNCTIONAL_IMPLEMENTATION_CONTRACT_v2.1.docx`

**NEXT STEP = W4-02A.6.19 — TECHNICAL SPECIFICATION CURRENT TECHNICAL IMPLEMENTATION CONTRACT**

**Execution stops here. No W4-02A.6.19 or later work is executed in this artifact.**
