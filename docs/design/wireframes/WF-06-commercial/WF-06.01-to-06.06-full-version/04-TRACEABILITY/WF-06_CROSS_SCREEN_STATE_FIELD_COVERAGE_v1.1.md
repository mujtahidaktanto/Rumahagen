# Cross-Screen State / Field Coverage Matrix v1.1

All 18 logical screens have desktop and mobile visual targets. Mobile is a transformation, not a reduced semantic contract.

| Screen family | Required material fields/states | Desktop | Mobile |
|---|---|---|---|
| Catalog/Offer | product/offer, price, eligibility, benefit, CTA, loading/empty/error | PASS | PASS |
| Subscription/Add-on | billing, lifecycle, validity, capacity, dates, CTA | PASS | PASS |
| Promotion | rule, eligibility, benefit, validity, lifecycle | PASS | PASS |
| Order/Checkout | snapshot, amounts, scope, terms, payment method | PASS | PASS |
| Order history | immutable snapshot, lifecycle, references | PASS | PASS |
| Payment | all six payment states, provider return, confirmed_at | PASS | PASS |
| Entitlement | target scope, definition/instance, lifecycle, provenance | PASS | PASS |
| Quota | capacity/pool/allocation/usage/remaining | PASS | PASS |
| Admin configuration | editable vs derived, temporal, provenance, authorized CTA | PASS | PASS |
| Reconciliation | evidence, mismatch, state, resolution, auditability | PASS | PASS |

## Universal state baseline
Loading/skeleton, empty, validation, error/retry, denied/restricted, unavailable provider, stale mutation, duplicate/replay, success/authoritative confirmation are represented by state contracts and contextual UI affordances. No optimistic irreversible outcome.
