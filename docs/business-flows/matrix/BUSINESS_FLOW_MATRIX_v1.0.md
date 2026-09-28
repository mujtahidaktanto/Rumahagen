# RUMAHAGEN BUSINESS FLOW MATRIX v1.0

**Status:** LOCKED / GREEN  
**Validation type:** Core Cross-Check — BF-01 through BF-37  
**Date:** 29 September 2026  
**Repository:** `mujtahidaktanto/Rumahagen`  
**Purpose:** Controlled business-flow authority for subsequent Mermaid and diagrams.net rendering.

## 1. Lock statement

BF-01 through BF-37 have been cross-checked against the current available RumahAgen authority chain:

```
M01–M15 Semantic Authority
        ↓
Core v1.3 valid detail
        ↓
STEP08 Business Rules BR-001–BR-151
        ↓
STEP09 Architecture / Dependencies
        ↓
STEP10 ERD / Dictionary / Schema
        ↓
STEP11 API
        ↓
STEP12 RBAC / RLS
        ↓
STEP13-A Successor PRD v3.7
        ↓
STEP13-B Successor Functional Specification v2.3
        ↓
BUSINESS FLOW MATRIX v1.0
```

The matrix is **locked for diagram generation**. Locking this matrix does not modify or supersede Core, Business Rules, PRD, Functional Specification, API, RBAC/RLS or implementation authority.

### Cross-check verdict

- **37/37** business-flow records have an identified authority basis.
- **0** new business rule was introduced to make a flow complete.
- **0** new role, permission ID, endpoint ID, physical entity/table or state was invented.
- Preserved predecessor behavior is explicitly marked **PRESERVE** where STEP13-B does not restate every legacy detail.
- Actor placement follows the required three-lane visual model: **APPLICATION / AGENT / ADMIN**.
- Buyer, Developer, Partner, Instructor, Guest and similar user types are not promoted into extra swimlanes.
- Exact runtime/RLS/API verification is not inferred from the functional contract.

## 2. Core boundary checks applied to every flow

1. Payment ≠ Entitlement.
2. Entitlement ≠ RBAC.
3. Organization ≠ Entitlement.
4. Visibility ≠ Authorization.
5. Course Enrollment ≠ Session Enrollment.
6. Event Registration ≠ Session Enrollment.
7. Provider identity ≠ Session identity.
8. Provider evidence ≠ Attendance/Completion.
9. Learning Activity completion ≠ LP transaction.
10. LP ≠ competency.
11. Completion ≠ Award.
12. Title Definition ≠ Award Instance.
13. Host ≠ Instructor.
14. Client-side claims cannot create authoritative business outcomes.
15. Server/domain authority determines state and business outcomes.
16. Historical outcomes remain explainable after configuration changes.
17. Idempotency is preserved where the governing business rules require it.

## 3. Locked matrix

| ID | Flow | Primary | Core / BR basis | Functional basis | Cross-check | Lock note |
|---|---|---|---|---|---|---|
| BF-01 | Registration → OTP → Account Activation | M01 | M01 semantic authority; activation rules | FR-M01-S01 | GREEN | OTP success establishes Agent ACTIVE; Pending Review is not the default activation gate. |
| BF-02 | Login → Session → Password/OAuth Recovery | M01 | Core identity/authentication preservation | M01 identity/authentication contract | GREEN / PRESERVE | Keep existing authentication/recovery behavior; do not invent new auth states. |
| BF-03 | KTP / Verification / Eligibility | M01 | M01-CI-007; M01-CI-009 | FR-M01-S02 | GREEN | KTP is eligibility/requirement semantics, not RBAC. Deferred KTP does not create a role/permission. |
| BF-04 | Agent Profile → Visibility → Public CTA → Review | M02 | M02-CI-008; M02-CI-009 | FR-M02-S01–S04 | GREEN | Review is AUTO-APPROVED; moderation is post-publication. CTA does not grant ownership/authorization. |
| BF-05 | Agency Creation → Membership → Organization Context | M12 | BR-001–BR-015; BR-105–109 | FR-M12-S01–S02 | GREEN | Organization context is distinct from personal context, ownership and entitlement. |
| BF-06 | Invitation → Join Request → Membership Activation | M12 | BR-002, BR-016–018, BR-066–067 | FR-M12-S02 | GREEN / PRESERVE | Membership activation remains governed by organization lifecycle/authorization; no new role invented. |
| BF-07 | Member Leave / Forced Removal → Ownership Resolution | M12 | BR-016–034, BR-044–046, BR-105–117, BR-124 | FR-M12-S02 | GREEN | Leave and forced removal have equivalent listing/add-on outcome with distinct trigger/audit reason. |
| BF-08 | Agency Closure → CLOSING → CLOSED | M12 | BR-051–103, BR-118–123, BR-137–143, BR-151 | FR-M12-S03 | GREEN | Lead-only initiation; warning/confirmation/OTP; ACTIVE→CLOSING→CLOSED; no regression/reopen. |
| BF-09 | Agency Closure → Listing / Add-on / Membership Resolution | M12 | BR-065–090, BR-125–151 | FR-M12-S03; FR-M14 entitlement boundary | GREEN | Closure resolves members, Agency Listings, promo and add-on ownership; Personal Listing/Personal Entitlement are not reclaimed. |
| BF-10 | Create Listing → Draft → Publish | M03 | Core listing lifecycle; M03 semantic authority | FR-M03-S01 | GREEN | No Pending Review publication gate. M10 authorization and M14 capacity are dependencies where applicable. |
| BF-11 | Listing Edit → Media → Price → Visibility | M03 | Core listing CRUD/ownership/visibility rules | M03 preserved predecessor behavior | GREEN / PRESERVE | Diagram must not invent edit restrictions beyond the governed listing contract. |
| BF-12 | Listing View → CTA → Lead → Lead Status | M03 | Core listing/lead behavior; M02 visibility | M03/M02/M08 preserved behavior | GREEN / PRESERVE | Public visibility does not equal authorization; lead state remains owning-domain behavior. |
| BF-13 | Listing Refresh → Allowance → Reposition → Audit | M03 | Refresh semantic authority | FR-M03-S02–S03; FR-M14-S09 | GREEN | Default 5 successful refreshes/Agent/Jakarta operational day; max 1 successful refresh/Listing/day; failed refresh does not consume allowance. |
| BF-14 | Developer → Project → Media → Marketing Kit | M06 | M06 semantic authority | FR-M06-S01–S04 | GREEN | Project Media is photo/video; Marketing Kit scope is preserved; no physical entity invented in the flow model. |
| BF-15 | Project Claim → Approval → Agent-owned Listing | M06 | M06 Claim semantic authority | FR-M06-S05 | GREEN | Claim approval may initialize listing context but does not grant ordinary M03 Create/Update/Publish/Refresh authority. |
| BF-16 | DBR Calculator → Prospect → Bank → PDF | M07 | M07 semantic authority | FR-M07-S01–S02 | GREEN | DBR remains M07 authority; Bank Master is semantic/master-data authority without invented physical schema. |
| BF-17 | Event Create → Publish → Registration → Waiting List | M05 | M05 semantic authority; Event lifecycle preservation | FR-M05-S01–S02 | GREEN / PRESERVE | Registration and waiting-list semantics are authoritative; exact event-creator role is not invented. |
| BF-18 | Guest Registration → Notification → Attendance | M05 | Guest/waiting-list semantic authority | FR-M05-S02 | GREEN | Guest email is contact/notification destination, not canonical identity; no fabricated meeting link. |
| BF-19 | Learning Catalog → Course → Enrollment → Learning Activity | M04 | M04 Learning authority | FR-M04-S01–S02 | GREEN | Learning discovery, enrollment and activity remain M04-owned. |
| BF-20 | Learning Activity → Quiz → Completion → Certificate | M04 | M04 completion/certificate semantics | FR-M04-S01–S02 | GREEN / PRESERVE | Completion is not Award; certificate is only issued where applicable under the learning contract. |
| BF-21 | Learning Session → Provider → Enrollment → Attendance → Completion | M04 | M04 session/provider boundary | FR-M04-S03 | GREEN | Session identity remains distinct from provider identity; host/instructor distinction preserved. |
| BF-22 | Learning Points → Earn → Adjust → Redeem | M04 | M04 Learning Economy authority | FR-M04-S02 | GREEN | LP transaction is distinct from learning completion and competency. |
| BF-23 | Partnership Learning → Learning Result → Evidence | M04 | M04 partner/evidence semantics | FR-M04-S04 | GREEN | M04 owns Learning evidence; M15 consumes accepted evidence without redefining completion. |
| BF-24 | Evidence → Qualification Evaluation → Qualification Result | M15 | M15 qualification/evidence authority | FR-M15-S01–S02 | GREEN | M15 evaluates accepted evidence; it does not become the source of Learning completion. |
| BF-25 | Awarding Path → Rules → Evaluation → Award → Presentation | M15 | M15 Award/Title separation | FR-M15-S02–S03 | GREEN | Qualification, Award and Title remain distinct; Award instance is not Title Definition. |
| BF-26 | Award Appeal → Admin Decision → Restore/Reject | M15 | M15 awarding/administrative semantic preservation | M15 preserved predecessor behavior | GREEN / PRESERVE | Appeal is modeled as a governed administrative path; no new appeal state or permission is invented. |
| BF-27 | Title Definition → Eligibility → Award Instance → Profile Presentation | M15 | Title/Award separation | FR-M15-S02–S03 | GREEN | Profile presentation consumes authoritative award/title outcomes and does not issue them. |
| BF-28 | Commercial Catalog → Add-on → Promotion → Purchase | M14 | M14 commercial rules | FR-M14-S01–S04 | GREEN | Catalog/add-on/promotion remain commercial configuration; purchase intent is not payment confirmation. |
| BF-29 | Order → Checkout → Midtrans → Webhook → Verification → Fulfillment | M14 | Commercial/payment closure | FR-M14-S01, S05–S07 | GREEN | Provider callback alone is insufficient; trusted verification and idempotency precede confirmed fulfillment. |
| BF-30 | Entitlement → Quota → Allocation → Usage → Reconciliation | M14 | M14 entitlement/quota boundary | FR-M14-S01, S07, S09, S11 | GREEN | Entitlement is commercial right/state, not RBAC permission; reconciliation is auditable. |
| BF-31 | Commercial Exception → Failed/Expired/Cancelled Transaction | M14 | M14 order/payment/entitlement separation | FR-M14-S05–S11 | GREEN | Exception handling cannot silently create permission or entitlement side effects. |
| BF-32 | Admin Configuration | M09 | M09 configuration authority | FR-M09-S01 | GREEN | Only governed configurable parameters; M10 authorization applies. |
| BF-33 | Administrative Audit → Review → Escalate → Manual Correction | M09 | M09 audit/provenance authority | FR-M09-S02–S04 | GREEN | Manual correction is controlled and explainable; M09 does not become super-domain authority. |
| BF-34 | Authorization / Permission Resolution | M10 | BR role/permission boundary; M10 authority | FR-M10-S01–S02 | GREEN | Role→permission→capability→scope→condition→ownership→organization context; entitlement/membership/visibility remain distinct. |
| BF-35 | Provider Catalogue / Provider Identity | M13/M04 | Provider authority boundary | FR-M13-S01; FR-M04-S03 | GREEN | Provider Catalogue mutation is Superadmin-only; provider identity remains distinct from session identity. |
| BF-36 | BYOK / AI Connection | M13 | M13 BYOK authority | FR-M13-S02–S03 | GREEN | BYOK ownership is Agent/User OWN; AI remains assistive and cannot authorize business outcomes. |
| BF-37 | Governance, Provider, Discovery, Notification & Measurement Ecosystem | M09/M11/M13/M08 | M08/M09/M11/M13 semantic authorities | FR-M08-S01–S02; FR-M09-S01–S04; FR-M11-S01–S04; FR-M13-S01–S03 | GREEN / DECOMPOSED | Canonical record retained, but rendered as D37A–D37J to prevent an overloaded diagram. |

## 4. BF-37 decomposition lock

BF-37 remains one canonical business-flow record. It is not 10 additional canonical business flows.

| Sheet | Renderable flow |
|---|---|
| D37A | Admin Configuration |
| D37B | Administrative Audit & Action |
| D37C | Notification Dispatch & Delivery |
| D37D | Authorization / Permission Resolution |
| D37E | Provider Catalogue / Provider Binding |
| D37F | BYOK / AI Connection |
| D37G | AI Assistant Interaction |
| D37H | Public Discovery / SEO / Measurement |
| D37I | Static Public Content Lifecycle → Public Discovery |
| D37J | Announcement / Promotion Discovery |

## 5. Mandatory corrections/controls before rendering

The cross-check does not require removing any BF-01–BF-37 record, but the following controls are locked into the diagrams:

### C-01 Agency closure
D08/D09 must explicitly show:
- Lead-only initiation.
- Explicit continuation.
- Email OTP gate.
- Failed/expired/incomplete OTP leaves Agency ACTIVE.
- Maximum 3 OTP requests per closure flow.
- Maximum 3 verification attempts per OTP.
- Three verification failures reset the closure flow.
- Successful OTP causes ACTIVE → CLOSING.
- CLOSING cannot regress to ACTIVE.
- CLOSING blocks new member/listing/Agency entitlement operations.
- Closure processes Agency Listings but not Personal Listings.
- Closure resolves add-on ownership.
- Membership termination must complete before CLOSED.
- Exactly one automatic retry applies to governed closure processing failure.
- Retry failure may create TRANSFER_EXCEPTION.
- TRANSFER_EXCEPTION does not itself prevent closure when mandatory membership termination is complete.
- CLOSED is final and historical, not operational.

### C-02 Member exit
D07 must explicitly distinguish:
- Voluntary Leave vs Forced Removal trigger/audit reason.
- Equivalent governed listing/add-on outcome.
- Published + PROMO_ACTIVE exception during ordinary member exit.
- Promo expiry triggers automatic transfer evaluation.
- Transfer is not a new Listing.
- Ownership remains with the original agent.
- Agency origin/history remains preserved.
- Lead History is not migrated into Personal context.

### C-03 Listing publication
D10 must explicitly show:
- Draft validation.
- M10 authorization.
- M14 quota/entitlement dependency where applicable.
- No mandatory Pending Review publication gate.
- PUBLISHED as the normal successful outcome.

### C-04 Listing refresh
D13 must explicitly show:
- M14 allowance/entitlement → M03 action → M10 authorization.
- 5 successful refreshes default per Agent/Asia-Jakarta operational day.
- Max 1 successful refresh per Listing/day.
- Failed refresh does not consume allowance.
- Successful refresh is audited.
- District-local reposition rule.
- Server timestamp authority.

### C-05 Payment / entitlement
D28–D31 must never show:
```
Payment Success → RBAC Permission
```
The controlled chain is:
```
Order
 → Checkout
 → Provider Result/Webhook
 → Trusted Verification
 → Fulfillment
 → Entitlement
 → Quota/Allocation/Usage
```

### C-06 Learning / Award
D19–D27 must preserve:
```
Learning Completion ≠ LP Transaction
LP ≠ Competency
Completion ≠ Award
Title Definition ≠ Award Instance
Provider Evidence ≠ Attendance/Completion
```

### C-07 Authorization
D34 is a resolution dependency, not a generic approval step. It must not be drawn as if every domain action requires Admin approval.

## 6. Rendering authorization

The matrix is now **LOCKED FOR DIAGRAM GENERATION**.

Approved rendering sequence:

1. D01–D10
2. D11–D20
3. D21–D30
4. D31–D37
5. D37A–D37J as the detailed decomposition sheets

The visual layer may improve layout/readability but may not change business semantics. Any semantic change requires a new matrix revision rather than an undocumented diagram-only edit.

## 7. Revision rule

If later Core authority changes:
- do not silently edit an existing diagram;
- update the matrix revision;
- record the affected BF ID(s);
- regenerate only impacted diagrams;
- preserve the prior version as provenance.

**LOCKED BASELINE: BUSINESS_FLOW_MATRIX v1.0 — GREEN**
