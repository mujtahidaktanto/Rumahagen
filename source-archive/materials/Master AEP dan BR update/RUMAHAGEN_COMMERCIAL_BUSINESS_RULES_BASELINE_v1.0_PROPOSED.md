# RUMAHAGEN — COMMERCIAL BUSINESS RULES BASELINE v1.0

**Status:** PROPOSED — GOVERNANCE REVIEW  
**Source:** Monetization / Subscription / Promotion / Payment Gateway AEP v1.0 + Commercial Traceability Audit v1.0 + existing MBR-COM-001–013  
**Authority:** NOT YET LOCKED  
**Implementation:** NOT AUTHORIZED BY THIS DOCUMENT

## 1. Purpose

This document creates the dedicated Commercial Business Rules baseline requested by the Commercial Traceability Audit.

It consolidates the existing 13 Commercial Master Business Rules with only the material Commercial business constraints identified by traceability audit. It intentionally does not convert every AEP architectural statement into a Business Rule.

The Monetization AEP remains Proposed and is the architectural source for the commercial model. The AEP explicitly separates Subscription, Entitlement and RBAC, defines payment verification/idempotency/reconciliation, preserves commercial history, and lists ADR-MON-001 through ADR-MON-009 as architectural decisions. These decisions remain ADR candidates until resolved.

## 2. Governance principles

1. **No Silent Loss** — every normative commercial constraint must be traceable.
2. **No Duplicate Rule** — an existing MBR is reused where it already provides sufficient coverage.
3. **Business Rule ≠ ADR** — architecture choices remain ADR candidates.
4. **Business Rule ≠ Technical Detail** — schema, API, SDK and implementation mechanics are downstream.
5. **Historical Commercial Integrity** — configuration or later changes must not rewrite historical purchases.
6. **Cross-domain boundaries are explicit** — Commercial owns commercial/payment outcomes; Learning, RBAC and Organization consume governed results according to their own authority boundaries.

## 3. Commercial Rule Set

### COM-BR-001 — Subscription / Entitlement / RBAC Boundary
**Status:** PROPOSED / Consolidated from MBR-COM-001–003.

1. Subscription state is not the same thing as Entitlement state.
2. Entitlement state is not the same thing as RBAC authorization.
3. Subscription changes must not directly mutate RBAC authority.
4. Commercial fulfillment may create/update governed entitlement state, while authorization remains governed by the authorization domain.

**Traceability:** MBR-COM-001, MBR-COM-002, MBR-COM-003; AEP §4 and Architecture Principles 1–2.

### COM-BR-002 — Free Bonus Grant Integrity
**Status:** PROPOSED / Material audit gap.

1. Free Bonus eligibility is determined from grant history, not current plan alone.
2. The initial Free Bonus is granted according to the approved activation/grant policy.
3. Returning from Pro to Free does not create a second initial Free Bonus when the original grant has already been consumed or recorded as granted.
4. Bonus grant history remains auditable.

**Traceability:** Commercial Audit COM-TRACE-001; AEP §2.1 and Architecture Principle 7.

### COM-BR-003 — Add-on Validity
**Status:** PROPOSED / Consolidated.

1. Permanent add-ons remain permanent according to the approved rule.
2. Promotional add-ons carry their configured promotional validity.
3. Add-on validity is represented separately from subscription plan identity.
4. A subscription transition must not silently erase a valid permanent add-on.

**Traceability:** MBR-COM-005/006; AEP §2.2, §6 and Architecture Principle 5.

### COM-BR-004 — Agency Subscription and Member Allocation
**Status:** PROPOSED / Gate-1 dependency where Organization semantics are involved.

1. Agency subscription capacity and member allocation are distinct commercial concepts.
2. Member allocation must be traceable to the Agency-level commercial entitlement/pool.
3. Allocation changes must not be interpreted as deletion of the underlying Agency entitlement.
4. Final cross-context authority semantics remain subject to the Agency vs Organization Gate-1 decision.

**Traceability:** Commercial Audit COM-TRACE-002; AEP §2.3; CAIA Gate-1.

### COM-BR-005 — Quota Allocation vs Actual Usage
**Status:** PROPOSED / CRITICAL.

1. Commercial quota allocation is distinct from actual listing/resource usage.
2. The system must preserve the distinction between Agency entitlement, Agency pool, member allocation, actual usage, available pool and returned allocation.
3. Permanent and promotional quota capacity must remain provenance-distinguishable where their commercial semantics differ.
4. If member allocation is reduced below existing usage, existing listings are not deleted solely because of the allocation reduction.
5. New listing/resource creation is blocked when available allocation is insufficient.
6. Returned member quota goes back to the Agency pool according to the approved policy.
7. Quota usage and allocation changes must remain auditable.

**Traceability:** Commercial Audit COM-TRACE-002; AEP §2.3, §5 and Architecture Principle 12; ADR-MON-009.

### COM-BR-006 — Promotion Policy and Purchase Snapshot
**Status:** PROPOSED / Consolidated.

1. Promotion is a commercial policy layer, not a replacement product.
2. A promotion may define eligibility, price/discount, bonus, validity, applicable plan/add-on, usage limits, start/end and redemption conditions.
3. The effective commercial terms applied to a purchase must be snapshotted into the order/purchase record.
4. Later promotion configuration changes must not rewrite historical purchase terms.

**Traceability:** MBR-COM-007; Commercial Audit COM-TRACE-005; AEP §6, §15–16; ADR-MON-006.

### COM-BR-007 — Subscription Transition Integrity
**Status:** PROPOSED / Material lifecycle rule.

1. Commercial subscription transitions must be explicit.
2. Supported transition examples include Free→Pro, Pro→Free, Free→Add-on and Pro→Add-on.
3. A transition must not recreate or reset historical grants unless a governing business rule explicitly requires it.
4. Historical grant provenance survives a subscription transition.

**Traceability:** Commercial Audit COM-TRACE-004; AEP §7; ADR-MON-002.

### COM-BR-008 — Order / Payment / Fulfillment Boundary
**Status:** PROPOSED / Material boundary rule.

1. Payment success is not itself the final entitlement or permission state.
2. Commercial fulfillment occurs only from a governed confirmed payment/order result.
3. The conceptual controlled sequence is:
   Order Created → Payment Pending → Gateway Processing → Verification → Payment Confirmed → Commercial Fulfillment → Entitlement/Subscription Update.
4. Downstream authorization must not infer entitlement solely from an unverified payment event.

**Traceability:** Commercial Audit COM-TRACE-003; AEP §9 and Architecture Principle 3/10.

### COM-BR-009 — Verified Payment and Idempotent Fulfillment
**Status:** PROPOSED / Consolidated.

1. Webhook receipt alone is insufficient evidence of payment success without provider verification according to the configured integration.
2. Payment callbacks and retries must be idempotent.
3. The same provider transaction/event must not create duplicate subscription periods, add-ons, quota grants or commercial fulfillment.
4. A unique provider transaction/reference and idempotency mechanism must exist.

**Traceability:** MBR-COM-008/009; AEP §9–10; ADR-MON-005.

### COM-BR-010 — Commercial Reconciliation
**Status:** PROPOSED / Consolidated.

1. Commercial payment processing must support reconciliation between internal payment records, provider transaction status, order status, subscription state and entitlement fulfillment.
2. Unmatched or inconsistent transactions must be detectable and auditable.
3. Reconciliation must not silently rewrite historical commercial records.

**Traceability:** MBR-COM-010; AEP §11; ADR-MON-007.

### COM-BR-011 — Refund / Chargeback Integrity
**Status:** PROPOSED / Material gap.

1. Refund and chargeback are distinct from ordinary payment success.
2. Historical payment records must not be deleted because of refund or chargeback.
3. The commercial effect on subscription, entitlement and add-on validity must follow an explicit commercial policy.
4. Refund/chargeback processing must remain auditable and reconcilable.

**Traceability:** MBR-COM-011; Commercial Audit COM-TRACE-006; AEP §12.

### COM-BR-012 — Commercial Provenance
**Status:** PROPOSED / Material gap.

Commercial history must preserve, at minimum:
- product/plan purchased;
- price;
- promotion applied;
- promotion validity;
- transaction/reference;
- payment provider;
- payment status;
- fulfillment result;
- entitlement source;
- subscription transition.

**Traceability:** Commercial Audit COM-TRACE-008; AEP §13.

### COM-BR-013 — Commercial Configuration Governance
**Status:** PROPOSED / Material gap.

1. Configurable commercial parameters must not require core business-logic changes for ordinary policy changes.
2. Configurable parameters include free bonus quantity, plan prices, add-on quantities/prices, promotion periods/validity/eligibility, configurable quota allocation rules, payment provider activation and supported payment methods.
3. Configuration changes must not rewrite historical purchases.
4. Historical records remain bound to the commercial terms applicable at the time of purchase.

**Traceability:** Commercial Audit COM-TRACE-007; AEP §15–16.

### COM-BR-014 — Provider Independence
**Status:** PROPOSED / Consolidated.

1. Payment Gateway integrations are behind a provider adapter boundary.
2. Core Commercial logic must not be tightly coupled to one provider.
3. Provider replacement must preserve the Commercial domain contract.

**Traceability:** MBR-COM-013; AEP §8 and Architecture Principle 8; ADR-MON-004.

### COM-BR-015 — Beta Payment Activation Governance
**Status:** PROPOSED / Consolidated.

1. Payment infrastructure may be payment-ready while inactive during free beta.
2. Payment functionality may later be enabled through controlled configuration/feature activation.
3. Enabling payment must not require redesign of the core Commercial domain.

**Traceability:** MBR-COM-012; AEP §14; ADR-MON-008.

## 4. Explicitly NOT converted into Commercial BR

The following remain architectural decisions or downstream technical concerns:
- exact provider SDK/API implementation;
- webhook endpoint implementation;
- database tables/indexes;
- exact payment status enum;
- exact event payloads;
- exact reconciliation job mechanism;
- exact entitlement/RBAC API;
- exact promotion rule-engine implementation.

## 5. ADR boundary

The following remain ADR candidates and must not be silently “decided” by this baseline:

- ADR-MON-001 — Subscription vs Entitlement vs RBAC.
- ADR-MON-002 — Free Bonus as historical grant.
- ADR-MON-003 — Permanent vs promotional add-on validity.
- ADR-MON-004 — Provider adapter architecture.
- ADR-MON-005 — Verified/idempotent payment fulfillment.
- ADR-MON-006 — Purchase-time price/promotion snapshot.
- ADR-MON-007 — Reconciliation architecture.
- ADR-MON-008 — Payment-ready inactive beta.
- ADR-MON-009 — Agency quota allocation vs actual usage.

The AEP itself lists these as ADR candidates.

## 6. Cross-domain invariants

### Learning Economy
Commercial owns payment outcome. Learning may consume only governed confirmed purchase results. Purchased Learning Points cannot bypass the Learning Economy rules.

### Learning Session
Learning Session does not own Payment Gateway logic. Paid live sessions cannot silently replace required free learning paths.

### Title
Commercial purchase/entitlement does not directly create or mutate Title achievement. Title Awarding Path remains the authority for Title qualification and awarding.

### RBAC
Commercial entitlement does not equal authorization. RBAC remains independently governed.

### Agency / Organization
COM-BR-004 and COM-BR-005 are subject to the final Agency vs Organization Gate-1 decision where the underlying scope/authority semantics are not yet frozen.

## 7. Traceability coverage target

The Commercial source AEP must be mapped to:
- COM-BR-001–015;
- existing global MBR where applicable;
- ADR-MON-001–009;
- Gate-1/Gate-2 pending decisions;
- downstream technical artifacts.

No Commercial source rule may remain unmapped without an explicit disposition.

## 8. Status and Gate

**BASELINE STATUS: PROPOSED — NOT LOCKED**

This document is ready for:
1. line-by-line Commercial BR reconciliation;
2. cross-domain conflict check;
3. Gate-1/Gate-2 dependency check;
4. final Master BR consolidation.

It is NOT authorization to implement.

## 9. Recommended next sequence

Commercial BR Baseline v1.0 Proposed
→ Commercial BR Reconciliation
→ Cross-domain Master BR Conflict Check
→ Final Master BR Consolidation
→ Final Master BR Traceability Gate
→ Master ADR Register
→ ADR prioritization.

