# RumahAgen R01/WF03 — P3 Revised Module Planning FULL VERSION v1.1

**Gate:** PASS WITH CONTROLLED RESIDUALS  
**Mode:** FULL-VERSION REBUILD — NOT PATCH / NOT APPEND  
**Source boundary:** ONLY the six uploaded ZIPs in this execution  
**Core v1.3:** IMMUTABLE / READ-ONLY  
**P3 implementation/execution:** NOT performed

## 1. Re-validation result

The uploaded P3 v1.0 was deep-scanned together with the five upstream/source archives. A material documentation/planning-control defect was found: the P3 v1.0 final second-scan report stated **15** files although the actual P3 v1.0 archive contains **17** files. More importantly, its 17/17 Core-package coverage was too coarse to demonstrate propagation of the detailed M01–M15/Core-impact obligations found in the supplied recon corpus.

Therefore P3 was **fully rebuilt as v1.1**, not patched.

## 2. Fresh recursive source scan

| Source | File instances | Nested ZIPs | Max depth |
|---|---:|---:|---:|
| P2 v1.2 | 13 | 0 | 0 |
| P1 v1.1 | 12 | 0 | 0 |
| STEP SYNC CORE | 830 | 53 | 2 |
| M01-M15 new recon | 2,374 | 73 | 2 |
| Core v1.3 source pack | 77 | 5 | 1 |
| **TOTAL** | **3,306** | **131** | **2** |

No web or external source was used.

## 3. P3 v1.1 correction findings

1. **P3 final scan count mismatch corrected.**
2. **Core IP-00..IP-16 mapping made granular.**
3. **M01–M15 change traceability expanded from generic four-row/module coverage to detailed source-derived obligations.**
4. **M03 Refresh and field-lock semantics made explicit.**
5. **M06 Developer fields, Marketing Kit, media boundary and Claim initialization made explicit.**
6. **M09 Static Public Content + Announcement/Promotion lifecycle boundary made explicit.**
7. **M11 ten mandatory public surfaces made explicit, including Static Public Content and Announcement/Promotion.**
8. **M13 Provider Catalogue/BYOK discrepancies made explicit.**
9. **M14 commercial Core-contract obligations and additive Refresh Allowance boundary made explicit.**
10. **M12 Organization Public Content / ORG-ADMIN reconciliation made explicit.**

## 4. Module scope confirmation

All **15/15 M01–M15** remain explicitly planned under their locked authority. No module is created, merged, or authority-transferred.

### M01
Identity/Auth. Activation after OTP, deferred KTP path, verification-document privacy/scopes, and M10 boundary are explicit.

### M10
Authorization/RBAC/Scope/RLS. Role, Role Permission, Permission Preset, capability/scope/condition/ownership/organization graph, and logical RLS handoff are explicit. Exact physical IDs remain evidence-gated.

### M02
Profile/Review. Visibility state, explicit CTA opt-in, Superadmin override, review auto-publication/post-publication moderation, and privacy boundary are explicit.

### M12
Organization/Membership/Context. Organization lifecycle, membership/invitation/Join Request, context enforcement, Lead Exit, Public Content ownership wording, and ORG-ADMIN boundary are explicit.

### M06
Developer/Project/Marketing Kit/Claim. Company logo, “Tentang Developer”, canonical Project SEO fields, photo/video media boundary, Marketing Kit authority, and Approved Claim→Agent Listing initialization are explicit.

### M03
Listing/Lifecycle/Refresh. Direct Publish, owner-only Update, four-field lock, Refresh action/eligibility/consumption, M14 allowance contract, operational-day/reset/order/District/server-authoritative rules, and search-card derivative rules are explicit.

### M05
Event/Registration. Event lifecycle, Registration/waitlist/attendance, Event↔Session boundary, guest/late/provider configuration and provider-dependent iframe boundary are explicit.

### M04
Learning/Learning Economy/Session. Learning Core, LP economy, Session/evidence production, Partnership Learning boundary, and downstream physical permission/RLS residuals are explicit.

### M14
Commercial/Payment/Entitlement/Quota/Promotion/Reconciliation. Catalog/order, payment verification, fulfillment, entitlement/quota/promotion, snapshot/confirmed_at, idempotency, reconciliation and additive Refresh Allowance are explicit. **Q01–Q64 remain M14 scope.**

### M15
Qualification/Evidence/Award. Path/rule, evidence evaluation, Award provenance/lifecycle, appeal/presentation and M04 evidence dependency are explicit. M15 does not absorb M14 Q01–Q64.

### M07
DBR scoring/configuration/output and bounded M09 configuration dependency are explicit.

### M08
Projection/notification/source-event contracts and no-mutation guardrail are explicit.

### M09
Admin foundation, configuration, Static Public Content + Announcement/Promotion lifecycle boundary, audit/admin boundary, and conditional—not global—blocking are explicit.

### M11
SEO/Discovery/Analytics. The planning registry explicitly requires the ten mandatory public surfaces:
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

M11 remains discovery/measurement only.

### M13
Provider Catalogue, BYOK lifecycle, protected invocation, transient Chat Frame, Superadmin-only Provider Catalogue mutation, and Agent/User-owned BYOK are explicit.

## 5. Core v1.3 scope assessment

The supplied Core v1.3 remains immutable. **It is not modified by P3.**

All Core implementation packages **IP-00..IP-16** have explicit P3 mappings in the new detailed matrix. The critical distinction is:

> “Covered in P3” means the scope is represented in planning/traceability. It does **not** mean the Core archive has been physically updated or runtime-verified.

Core propagation requirements identified from the uploaded impact analyses are therefore classified as **P3 planning obligations / controlled downstream reconciliation**, not as completed Core mutations.

## 6. Core items requiring downstream propagation

The supplied source corpus identifies controlled propagation requirements including:

- M01 activation/deferred-KTP path;
- M02 profile visibility/CTA/review semantics;
- M03 Publish/Refresh/field-lock/search semantics;
- M04 Partnership Learning physical realization and authorization/RLS;
- M06 Developer fields, Marketing Kit, media, Claim persistence;
- M09 configuration/RLS and public-content lifecycle boundary;
- M11 ten-surface discovery/measurement propagation;
- M12 Organization Public Content wording and ORG-ADMIN mapping;
- M13 Provider Catalogue/BYOK ownership/lifecycle/security;
- M14 commercial contract details, quota chain, reconciliation and additive Refresh Allowance.

These are now represented explicitly in P3 v1.1. No physical Core mutation is claimed.

## 7. Planning waves

0. Foundation Contracts — M01/M10  
1. Context & Platform Foundations — M02/M12/M13  
2. Primary Source Domains — M06/M03/M05/M04/M14/M07  
3. Qualification & Administration — M15/M09  
4. Projection & Discovery — M08/M11  
5. Cross-Domain Hardening — ALL

These are **planning waves, not P5 execution batches**.

## 8. Work packages

Exactly four P3 planning work packages are retained per module = **60 planning WPs**. They are now explicitly aligned to the detailed obligation matrix.

## 9. Cross-layer planning

15 modules × 9 planning layers = **135 mappings**:
Business Rules, Architecture/Dependency, Data, API, RBAC/RLS, Functional/User Flow, Technical, UI/UX, SEO/Analytics.

Exact implementation architecture remains P4/downstream.

## 10. Authority invariants

- M01 = Identity/Auth.
- M10 = Authorization/RBAC/Scope/RLS.
- M03 = Listing/Lifecycle/Refresh action.
- M14 = Commercial allowance/entitlement/quota.
- M04 = Learning/Session/evidence production.
- M15 = Qualification/Award.
- M09 = bounded administration/configuration/audit.
- M11 = discovery/measurement.
- M08 = projection/notification.
- M13 = AI/BYOK/Provider Catalogue.
- M12 = Organization/Membership/Context.
- M06 = Developer/Project/Marketing Kit/Claim.
- M05 = Event/Registration.
- M07 = DBR.
- M02 = Profile/Review.

No authority inversion is introduced.

## 11. Evidence boundary

P3 does not execute:
- API implementation;
- DB migration;
- RLS execution;
- runtime verification;
- production deployment.

No exact permission ID, endpoint, table, column, provider, or RLS SQL is invented where the uploaded source does not establish it.

## 12. Final gate

**P3 v1.1 = PASS WITH CONTROLLED RESIDUALS**

- M01–M15 planning coverage: **15/15**
- Core IP-00..IP-16 planning coverage: **17/17**
- Detailed module obligations: **57**
- Work packages: **60**
- Cross-layer mappings: **135**
- Upstream recursive source scan: **3,306 file instances / 131 nested ZIPs / max depth 2**
- Core v1.3 modified: **NO**
- Runtime proof: **NOT CLAIMED**
- P4 eligibility: **YES**
- P5 execution: **NOT EXECUTED**

The remaining items are controlled downstream reconciliation/physical/runtime matters, not reasons to invent implementation evidence.
