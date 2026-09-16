# WF-06 Lifecycle & UX Contract v1.1

## Subscription
Configured → Active → Paused → Active → Expired; Active may transition to Cancelled/Terminated where governed. UI shows state, dates and state-specific actions only when authoritative/authorized.

## Add-on
Configured → Purchasable → Fulfilled/Active → Expired/Consumed/Inactive as supplied by contract. `validity_type` controls `validity_days`; `capacity_type` controls `capacity_value` semantics.

## Promotion
Draft → Active → Inactive/Expired. Rule, Eligibility and Benefit are distinct. Eligibility is evaluated by authoritative commercial logic; user cannot self-declare eligibility.

## Order
Created → Checkout → Pending/Processing → Confirmed / Failed / Expired / Cancelled.

## Payment
Initiated → Pending/Processing → Confirmed / Failed / Expired / Cancelled. Provider return is informational; trusted verification establishes confirmation.

## Fulfillment
Confirmed eligible commercial state → idempotent fulfillment → entitlement/benefit outcome. Replay/duplicate must not duplicate grants.

## Entitlement
Entitlement Definition → valid fulfillment → Entitlement Instance → lifecycle. Target scope is Personal or Organization where configured. Entitlement is not RBAC.

## Quota
Entitlement → Quota Capacity → Operational Pool → Allocation → Usage → Remaining. Quota is commercial capacity, not permission.

## Reconciliation
Case → evidence review → authorized resolution. Resolution does not silently rewrite historical purchase records.

## Mobile parity
All material required/operational fields remain available on mobile. Tables become cards/lists; forms stack; secondary configuration uses drawers/accordions; vertical scrolling is expected.
