# RUMAHAGEN BUSINESS FLOW MASTER v1.0

**Status:** DRAFT — MASTER FLOW STRUCTURE  
**Purpose:** canonical business-flow inventory before visual rendering  
**Source authority:** RumahAgen Core current baseline, STEP08 Business Rules, STEP13-B Successor Integrated Functional Specification v2.3, M01–M15 semantic authority  
**Rendering standard:** 3 swimlanes only — APPLICATION / AGENT / ADMIN  
**Important:** This document models business journeys, not API endpoints. One business flow may use multiple APIs, DB functions, tables, permissions and notifications.

## 1. Modeling rule

The initial synthesis produced **37 canonical business flows**. During decomposition, the former combined governance/discovery ecosystem flow is split into **10 renderable diagram sheets**. Therefore:

- **37 canonical business-flow records**
- **46 detailed diagram sheets**
- No API-count-to-flow-count assumption
- No new business rule, role, permission, state, endpoint or physical entity is invented merely to complete a diagram
- Every decision point belongs in the lane that owns the decision
- Cross-lane handoffs are explicitly labelled
- Payment ≠ Entitlement
- Entitlement ≠ RBAC
- Organization ≠ Entitlement
- Visibility ≠ Authorization
- Course Enrollment ≠ Session Enrollment
- Event Registration ≠ Session Enrollment
- Provider identity ≠ Session identity
- Provider evidence ≠ Attendance/Completion
- Learning completion ≠ LP transaction
- LP ≠ competency
- Completion ≠ Award
- Title Definition ≠ Award Instance
- Host ≠ Instructor

## 2. Canonical master matrix

| ID | Business Flow | Primary | Supporting | Trigger | APPLICATION | AGENT | ADMIN | Main decision / outcome | Diagram |
|---|---|---|---|---|---|---|---|---|---|
| BF-01 | Registration → OTP → Account Activation | M01 | M10 | New registration | Validate registration, issue/verify OTP, activate account/session | Register and submit OTP | Exception/review only where governed | Valid OTP → ACTIVE | D01 |
| BF-02 | Login → Session → Password/OAuth Recovery | M01 | M10 | Agent authentication | Authenticate, establish session, recover credential | Login/recover account | Governed support/admin intervention | Authenticated session or controlled failure | D02 |
| BF-03 | KTP / Verification / Eligibility | M01 | M10 | Eligibility-dependent action | Evaluate verification requirement/state | Submit/complete required verification | Handle governed exception | Eligible / deferred / blocked according to rule | D03 |
| BF-04 | Agent Profile → Visibility → Public CTA → Review | M02 | M08,M11,M10 | Profile/public interaction | Publish governed representation, CTA, review projection | Maintain profile, opt-in CTA, receive reviews | Moderation/override where governed | Public representation and review outcome | D04 |
| BF-05 | Agency Creation → Membership → Organization Context | M12 | M10,M03 | Agent creates/joins organization context | Create organization and establish governed membership/context | Create/accept membership | Admin oversight where governed | Active organization context | D05 |
| BF-06 | Invitation → Join Request → Membership Activation | M12 | M10,M08 | Invitation/join request | Validate invite/request, activate membership | Invite, accept/request join | Resolve exception | Membership ACTIVE | D06 |
| BF-07 | Member Leave / Forced Removal → Ownership Resolution | M12 | M03,M10 | Leave/removal | End membership and resolve affected ownership | Leave or continue operations | Forced removal / resolution where authorized | Ownership safely resolved | D07 |
| BF-08 | Agency Closure → CLOSING → CLOSED | M12 | M10,M03,M08 | Closure request | OTP gate, freeze governed operations, transition lifecycle | Request/confirm closure | Execute/approve governed closure actions | ACTIVE → CLOSING → CLOSED | D08 |
| BF-09 | Agency Closure → Listing / Add-on / Membership Resolution | M12 | M03,M14,M10 | Agency enters closure | Resolve listings, add-ons, memberships and related records | Respond to allowed resolution choices | Execute governed resolution | Closure dependencies resolved before final CLOSED | D09 |
| BF-10 | Create Listing → Draft → Publish | M03 | M10,M14 | New listing | Validate, authorize, publish | Create/edit and publish | Moderation only where separately governed | Draft → PUBLISHED | D10 |
| BF-11 | Listing Edit → Media → Price → Visibility | M03 | M10 | Listing maintenance | Validate changes and lifecycle constraints | Edit permitted listing fields/media | Governed moderation/override | Valid updated listing | D11 |
| BF-12 | Listing View → CTA → Lead → Lead Status | M03 | M02,M08,M11 | Buyer/public interaction | Render listing, capture CTA/lead, project status | Receive/manage lead | Admin intervention where governed | Lead created and status maintained | D12 |
| BF-13 | Listing Refresh → Allowance → Reposition → Audit | M03 | M14,M10,M08 | Refresh action | Check entitlement/allowance, authorization, listing eligibility; reposition and audit | Request refresh | Configure allowance/resolve exception | Successful refresh consumes allowance; failed refresh does not | D13 |
| BF-14 | Developer → Project → Media → Marketing Kit | M06 | M03,M10 | Developer content operation | Maintain project/media/marketing-kit resources | Developer actor manages owned resources | Admin all-scope access where governed | Resource available within scope | D14 |
| BF-15 | Project Claim → Approval → Agent-owned Listing | M06 | M03,M10 | Claim submission | Validate claim, approval, initialize listing dependency | Submit/manage claim | Review and approve/reject | Approved claim initializes governed listing context; does not itself grant unrelated listing authority | D15 |
| BF-16 | DBR Calculator → Prospect → Bank → PDF | M07 | M03,M08 | Financing pre-screen | Calculate DBR, use governed bank master, generate output | Enter prospect/financial data | Maintain governed master/configuration | DBR result and PDF output | D16 |
| BF-17 | Event Create → Publish → Registration → Waiting List | M05 | M08,M10 | Event lifecycle | Create/publish event and manage registration state | Register/participate | Manage event/configuration | Confirmed or waiting-list registration | D17 |
| BF-18 | Guest Registration → Notification → Attendance | M05 | M08 | Guest registration/event start | Store governed guest registration, send available notification | Guest registers/attends | Event administration | Registration and attendance evidence where supported | D18 |
| BF-19 | Learning Catalog → Course → Enrollment → Learning Activity | M04 | M11,M10 | Learning discovery | Expose catalog, enroll, track activity | Discover/enroll/learn | Configure/manage governed learning | Active learning participation | D19 |
| BF-20 | Learning Activity → Quiz → Completion → Certificate | M04 | M08,M10 | Completion | Evaluate activity/quiz and issue governed completion artifact | Complete learning/quiz | Governed correction/configuration | Completion recorded; certificate when applicable | D20 |
| BF-21 | Learning Session → Provider → Enrollment → Attendance → Completion | M04 | M08,M10 | Session participation | Bind session/provider, manage enrollment/attendance/completion | Enroll/attend/complete | Configure/session administration | Session completion from governed evidence | D21 |
| BF-22 | Learning Points → Earn → Adjust → Redeem | M04 | M14,M10 | LP event/action | Record LP transaction, validate redemption | Earn/redeem LP | Governed adjustment/configuration | LP balance/transaction outcome | D22 |
| BF-23 | Partnership Learning → Learning Result → Evidence | M04 | M15,M10 | Partner learning activity | Accept governed partner result/evidence | Participate via partner | Manage partner configuration/evidence exceptions | Evidence available to qualification domain | D23 |
| BF-24 | Evidence → Qualification Evaluation → Qualification Result | M15 | M04,M10 | Evidence becomes evaluable | Evaluate governed evidence against qualification rules | Provide/complete required evidence | Evaluate/resolve governed exceptions | Qualification result | D24 |
| BF-25 | Awarding Path → Rules → Evaluation → Award → Presentation | M15 | M04,M10,M08 | Qualification outcome | Apply award rules, create award instance, present result | Meet qualification requirements | Governed awarding/evaluation | Award instance issued/presented | D25 |
| BF-26 | Award Appeal → Admin Decision → Restore/Reject | M15 | M10,M08 | Appeal submitted | Route and preserve award state/provenance | Submit appeal | Review and decide | Award restored/retained or appeal rejected | D26 |
| BF-27 | Title Definition → Eligibility → Award Instance → Profile Presentation | M15 | M02,M10 | Title eligibility/award | Resolve title definition/award instance and presentation | Earn/hold title | Configure/evaluate governed title rules | Title presentation reflects authoritative award | D27 |
| BF-28 | Commercial Catalog → Add-on → Promotion → Purchase | M14 | M10 | Commercial selection | Resolve catalog/add-on/promotion and create purchase intent | Select/purchase commercial item | Configure catalog/promotion | Purchase intent/order created | D28 |
| BF-29 | Order → Checkout → Midtrans → Webhook → Verification → Fulfillment | M14 | M10,M08 | Payment checkout | Create order, send checkout, process webhook, verify payment, fulfill | Complete payment | Monitor/configure governed payment integration | Verified payment leads to fulfillment; payment success alone is not RBAC grant | D29 |
| BF-30 | Entitlement → Quota → Allocation → Usage → Reconciliation | M14 | M03,M10 | Entitlement becomes consumable | Resolve entitlement and usage state, reconcile | Consume entitled capacity | Configure/reconcile governed commercial rules | Usage remains bounded by entitlement | D30 |
| BF-31 | Commercial Exception → Failed/Expired/Cancelled Transaction | M14 | M08,M10 | Transaction exception | Preserve order/payment/entitlement separation and record governed outcome | Retry or respond where allowed | Resolve governed exception | No unauthorized entitlement/permission side effect | D31 |
| BF-32 | Admin Configuration | M09 | M10,M14,M04,M11 | Configuration change | Validate scope and persist governed configuration | No normal agent mutation | Configure permitted parameters | Configuration changed with authority/provenance | D32 |
| BF-33 | Administrative Audit → Review → Escalate → Manual Correction | M09 | M10, owning domain | Admin case/action | Record/provide authoritative audit context | May be affected subject | Review, escalate or perform controlled correction | Corrected state remains explainable | D33 |
| BF-34 | Authorization / Permission Resolution | M10 | M12,M14, all domains | Protected action | Resolve role → permission → scope → condition → ownership → org context | Request action | Admin uses governed privileges | Allow/deny without bypassing domain constraints | D34 |
| BF-35 | Provider Catalogue / Provider Identity | M13/M04 | M10 | Provider configuration | Maintain provider catalogue/binding data | Consume provider-backed service | Configure provider identity/catalogue | Provider identity remains distinct from session identity | D35 |
| BF-36 | BYOK / AI Connection | M13 | M10 | AI provider connection | Validate/store/use governed BYOK connection | Configure/use own AI connection where permitted | Governed provider/credential administration | Connection available without bypassing authorization | D36 |
| BF-37 | Governance, Provider, Discovery, Notification & Measurement Ecosystem | M09/M11/M13/M08 | M10 | Cross-domain platform/public event | Orchestrate governed projections, notifications, discovery and provider/AI interactions | Consume public/notification/AI capabilities | Configure/govern administrative capabilities | Domain authority remains with owning module | D37A–D37J |

## 3. Detailed decomposition of BF-37

BF-37 remains **one canonical master record** but is rendered as ten separate diagrams because a single visual would be too dense.

| Diagram | Detailed flow | Primary |
|---|---|---|
| D37A | Admin Configuration | M09 |
| D37B | Administrative Audit & Action | M09 |
| D37C | Notification Dispatch & Delivery | M08 |
| D37D | Authorization / Permission Resolution | M10 |
| D37E | Provider Catalogue / Provider Binding | M13/M04 |
| D37F | BYOK / AI Connection | M13 |
| D37G | AI Assistant Interaction | M13 |
| D37H | Public Discovery / SEO / Measurement | M11 |
| D37I | Static Public Content Lifecycle → Public Discovery | M11/M09 |
| D37J | Announcement / Promotion Discovery | M11/M09 |

**Result:** 37 canonical business-flow records → 46 renderable diagram sheets.

## 4. Standard swimlane contract

Every detailed diagram uses exactly these three lanes:

### APPLICATION
- validation
- state transition
- business-rule evaluation
- authorization check
- entitlement check
- persistence/projection
- notification trigger
- audit/provenance
- success/failure response

### AGENT
- registration/login
- profile/listing/organization actions
- learning participation
- commercial purchase/payment
- developer/project actions where the actor is an Agent/partner user
- appeal/request/confirmation actions

### ADMIN
- governed configuration
- moderation
- approval/rejection
- organization intervention
- commercial configuration/reconciliation
- qualification/awarding administration
- audit/manual correction
- provider/AI administration where authorized

**No fourth swimlane is introduced.** Buyer, Developer, Partner, Instructor, Guest and other actor distinctions are represented as actor types within the Agent/User lane or as Admin-side responsibility where the Core assigns the action there.

## 5. Required metadata on each rendered diagram

Each Dxx diagram should show:

- Flow ID
- Business Flow Name
- Primary Module
- Trigger
- Preconditions
- Main success path
- Decision points
- Exception/failure path
- Success outcome
- Core boundary/invariant where relevant
- Authorization dependency
- Entitlement dependency where relevant
- Notification dependency where relevant
- Audit requirement
- Cross-flow dependency
- Source authority reference

## 6. Rendering pipeline

```text
GitHub RumahAgen Core
        ↓
Business Flow Master Matrix
        ↓
Mermaid source
        ↓
Mermaid validation/render
        ↓
diagrams.net
        ↓
final .drawio
        ↓
SVG / PNG / PDF
```

Mermaid supports swimlane diagrams where lanes represent responsibility and cross-lane arrows represent handoffs. The current Mermaid documentation identifies `swimlane-beta` as the swimlane syntax. citeturn0search0

For maximum portability, the production source should remain plain Mermaid/Markdown in GitHub, while diagrams.net is used as the visual editing/export layer.

## 7. Next controlled step

Do **not** render all 46 sheets immediately.

Next sequence:

1. Validate BF-01–BF-37 against Core/BR/Functional authority.
2. Lock the master matrix.
3. Generate Mermaid source for D01–D10 first.
4. Validate layout/readability using the required three lanes.
5. Continue in waves until D46.
6. Store Mermaid source and final diagrams in the repository.

**This document does not alter business rules or implementation authorization. It is a modeling artifact derived from the current functional baseline.**
