# ARCHITECTURE EVOLUTION PROPOSAL
## Monetization, Subscription, Promotion & Payment Gateway — RumahAgen

**Version:** 1.0
**Status:** Proposed
**Scope:** Monetization, Subscription, Promotion, Quota/Add-on and Payment Gateway
**Basis:** Previously approved RumahAgen business-rule decisions

## 1. Executive Summary

RumahAgen requires a monetization architecture that separates commercial products, subscription state, entitlements/quota, promotions, and payment processing.

The target model supports:
- Free and Pro subscription states;
- personal Agent subscription and Agency/Workspace subscription;
- Agency Pro quota allocation by Lead;
- permanent add-ons without promotion;
- promotional add-ons with explicit validity;
- initial Free bonus quota granted once when Agency is activated;
- return from Pro to Free without resetting that initial bonus;
- payment infrastructure that is payment-ready while inactive during free beta;
- provider-independent payment integration;
- verified webhooks, idempotency, reconciliation, auditability, refunds and chargebacks;
- price/promotion snapshots;
- separation of payment source-of-truth from subscription and entitlement state.

## 2. Locked Commercial Principles

### 2.1 Free Bonus

The initial Free bonus quota is a **configurable commercial parameter**, not an immutable business-rule constant.

For the currently approved behavior:
- the Free bonus is granted once when Agency is activated;
- the initial bonus is not reset when an Agency returns from Pro to Free;
- after the Free bonus is fully consumed, the Agency must purchase an add-on or become Pro to obtain additional quota.

The architecture must therefore store grant history/state rather than infer eligibility solely from current plan.

### 2.2 Add-on

Approved distinction:
- add-on purchased without a promotion is **permanent**;
- add-on using a promotion has a **validity period determined by that promotion**.

Returning from Pro to Free does not erase permanent add-ons.

### 2.3 Agency / Personal Subscription

The approved model is hybrid:
- an Agent can have a personal Free/Pro subscription;
- an Agency/Workspace can have its own Free/Pro subscription.

Agency Pro may allocate listing quota to members through the Lead.

When member allocation is reduced below current usage:
- existing listings are not deleted;
- new listing creation is blocked until usage is within allocation;
- returned quota goes back to the Agency pool.

## 3. Target Domain Separation

```text
Commercial Catalog
      │
      ├── Plans
      ├── Add-ons
      └── Promotions
             │
             ▼
        Order / Checkout
             │
             ▼
       Payment Transaction
             │
      ┌──────┴──────┐
      ▼             ▼
 Subscription    Add-on Purchase
      │             │
      └──────┬──────┘
             ▼
        Entitlement
             │
             ▼
       Quota / Usage
```

Payment must not directly mutate RBAC or application permissions.

## 4. Subscription Architecture

Subscription represents the commercial plan relationship.

Entitlement represents what the customer is actually allowed to use.

RBAC represents what the user is authorized to do.

These must remain separate:

```text
Subscription
    ↓
Entitlement
    ↓
Usage / Quota

RBAC ───────────────→ Authorization
```

Plan changes therefore must not be implemented as direct role mutation.

## 5. Quota Architecture

Quota must distinguish:
- entitlement allocation;
- allocation to Agency members;
- actual usage;
- available pool;
- permanent add-on capacity;
- promotional capacity;
- source/provenance.

Agency Pro allocation:

```text
Agency Pro Quota
      │
      ├── Agency Pool
      ├── Member A allocation
      ├── Member B allocation
      └── ...
```

Returned member quota returns to the Agency pool.

## 6. Promotion Architecture

Promotion is a commercial policy layer, not a replacement for the underlying product.

A promotion may define:
- eligibility;
- discount/price;
- bonus;
- validity;
- applicable plan/add-on;
- usage limits;
- start/end;
- redemption conditions.

The exact commercial result must be snapshotted into the order/purchase record so historical transactions do not change when promotion configuration changes.

Promotional add-ons retain their configured validity.

Non-promotional add-ons remain permanent according to the approved rule.

## 7. Subscription Transition

The architecture must explicitly model transitions such as:

```text
Free → Pro
Pro → Free
Free → Add-on
Pro → Add-on
```

A transition must not recreate or reset historical grants unless the business rule explicitly says so.

In particular:

```text
Agency activated
    ↓
Initial Free Bonus granted
    ↓
Pro
    ↓
Free
    ↓
Initial Free Bonus remains consumed/history intact
```

## 8. Payment Gateway Architecture

Payment Gateway is an integration domain.

The architecture should use a provider adapter abstraction:

```text
Payment Domain
     │
     ├── Payment Core
     │
     └── Provider Adapter
            ├── Gateway A
            ├── Gateway B
            └── ...
```

The core application must not be tightly coupled to one gateway.

## 9. Payment Lifecycle

Conceptual lifecycle:

```text
Order Created
    ↓
Payment Pending
    ↓
Gateway Processing
    ↓
Webhook / Verification
    ↓
Payment Confirmed
    ↓
Commercial Fulfillment
    ↓
Entitlement / Subscription Updated
```

Webhook receipt alone is not sufficient evidence of payment success without provider verification according to the configured integration.

## 10. Idempotency

Payment callbacks and retries must be idempotent.

The same provider transaction/event must never:
- create duplicate subscription periods;
- grant duplicate add-ons;
- grant duplicate quota;
- create duplicate commercial fulfillment.

A unique provider transaction/reference and idempotency mechanism must exist.

## 11. Reconciliation

The payment domain must support reconciliation between:
- internal payment records;
- provider transaction status;
- order status;
- subscription state;
- entitlement fulfillment.

Unmatched or inconsistent transactions must be detectable and auditable.

## 12. Refund and Chargeback

Refund and chargeback events must be represented separately from ordinary payment success.

The architecture must define the resulting commercial state without deleting historical payment records.

The effect on subscription, entitlement and add-on validity must be governed by commercial policy.

## 13. Audit

Commercial records must preserve:
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

## 14. Beta Mode

Payment infrastructure should be **payment-ready but inactive during free beta**.

The architecture must therefore allow payment functionality to be enabled later through controlled configuration/feature activation without redesigning the core commercial domain.

## 15. Configurable Commercial Parameters

The following should be configurable rather than hard-coded:
- Free bonus quantity;
- plan prices;
- add-on quantities;
- add-on prices;
- promotion periods;
- promotional validity;
- promotion eligibility;
- quota allocation rules where explicitly configurable;
- payment provider activation;
- supported payment methods.

Changing a configurable commercial parameter must not require changing core business logic.

## 16. Architecture Principles

1. Subscription ≠ Entitlement.
2. Entitlement ≠ RBAC.
3. Payment success ≠ automatic permission mutation.
4. Promotion ≠ Product.
5. Permanent add-on ≠ promotional add-on.
6. Historical commercial transactions are immutable/auditable.
7. Free bonus eligibility is based on grant history, not current plan alone.
8. Payment provider must be replaceable through an adapter boundary.
9. Webhooks must be verified and idempotent.
10. Commercial fulfillment must be traceable to a confirmed payment/order.
11. Configuration changes must not rewrite historical purchases.
12. Agency quota allocation must not delete existing listings when allocation is reduced.

## 17. Architecture Impact

| Area | Impact |
|---|---|
| Monetization Domain | CRITICAL |
| Subscription | CRITICAL |
| Entitlement | CRITICAL |
| Quota | CRITICAL |
| Add-on | HIGH |
| Promotion | HIGH |
| Payment Core | CRITICAL |
| Payment Gateway Adapter | HIGH |
| Webhook | HIGH |
| Reconciliation | HIGH |
| Refund/Chargeback | HIGH |
| RBAC Integration | HIGH |
| Audit | HIGH |
| Configuration | CRITICAL |

## 18. ADR Candidates

### ADR-MON-001
Separate Subscription, Entitlement and RBAC.

### ADR-MON-002
Model Free Bonus as a grant with historical eligibility.

### ADR-MON-003
Separate permanent add-ons from promotional add-ons through entitlement validity.

### ADR-MON-004
Use provider adapters for Payment Gateway integrations.

### ADR-MON-005
Require verified, idempotent payment fulfillment.

### ADR-MON-006
Snapshot price and promotion terms at purchase time.

### ADR-MON-007
Support reconciliation as a first-class payment capability.

### ADR-MON-008
Keep payment infrastructure inactive but architecture-ready during free beta.

### ADR-MON-009
Model Agency quota allocation separately from actual listing usage.

## 19. Downstream Update Order

1. System Architecture
2. ADR
3. Commercial Domain Model
4. ERD
5. Schema
6. Payment Integration Contract
7. API
8. RBAC / Permission Matrix
9. User Flow
10. PRD
11. Engineering Guidebook
12. Test / Business Rule Traceability Matrix

## 20. Final Architecture Direction

```text
                  RUMAHAGEN COMMERCIAL DOMAIN
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Subscription        Promotion           Add-on
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ↓
                        Order
                           ↓
                    Payment Core
                           ↓
                 Provider Adapter(s)
                           ↓
                   Verified Payment
                           ↓
                    Fulfillment
                           ↓
                     Entitlement
                           ↓
                 Quota / Product Access
```

The architecture preserves the approved Free/Pro, add-on, promotion, quota, and payment decisions while keeping commercial state, payment state, entitlement state and authorization state independently governable.

## 21. Status

**AEP Monetization / Subscription / Promotion / Payment Gateway:** v1.0 — Proposed

**Next Gate:** Current Architecture Impact Analysis against the existing RumahAgen Architecture, ERD, Schema, API, RBAC, User Flow, PRD and Payment documentation.

This AEP should be treated as the architectural translation of the approved commercial rules, not as permission to implement before the impact analysis and downstream alignment are completed.
