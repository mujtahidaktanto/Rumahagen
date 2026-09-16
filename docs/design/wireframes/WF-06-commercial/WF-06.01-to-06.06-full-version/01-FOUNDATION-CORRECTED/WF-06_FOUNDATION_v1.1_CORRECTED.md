# WF-06 Foundation v1.1 — Controlled Correction

**Status:** CORRECTED FOUNDATION / READY FOR FULL VISUAL EXECUTION
**Authority:** M14 Commercial / Payment / Entitlement / Quota / Promotion / Reconciliation
**Source boundary:** uploaded source corpus only. No web/external source used.

## Corrections applied from WF06-FND-001 … 009
1. Added explicit 8 Commercial Surface → Screen Traceability.
2. Expanded M14 field semantic matrix with temporal, lifecycle, quantity, provenance and configuration fields.
3. Added Subscription lifecycle UX contract.
4. Added Add-on validity/capacity UX contract.
5. Separated Promotion Rule / Eligibility / Benefit semantics.
6. Added Entitlement target/scope model: Personal vs Organization; definition vs instance.
7. Added full Quota Capacity → Operational Pool → Allocation → Usage → Remaining representation.
8. Explicitly separated M14 commercial reconciliation business-state authority from bounded M09 administration surface.
9. Classified Daily Refresh Allowance as controlled additive Core-contract residual; no physical key/table/endpoint invented.
10. Added cross-screen state/field coverage matrix.
11. Added explicit desktop/mobile parity rule: required fields are transformed, never silently removed.
12. Reasserted all 13 M03 Create Listing fields remain outside WF-06.

## Non-blocking implementation evidence rule
Absence of physical DB proof, migration proof, API runtime proof, RLS proof, provider credential proof, integration proof, deployment proof or production proof MUST NOT lock, hold or block wireframe execution. Such status is evidence/verification state. Only unresolved semantic, authority or UX-contract contradiction may block a truthful wireframe.

## M14 commercial causal chain
Product/Offer → immutable Order Snapshot → Checkout → Payment → Trusted Verification → Idempotent Fulfillment → Entitlement → Quota/Benefit → Downstream Consumption → Reconciliation.

## Payment truth
Provider callback/redirect/return is evidence/input, not canonical confirmation. `confirmed_at` is visible only after trusted verification. No optimistic entitlement/quota grant.

## Historical integrity
Confirmed historical purchases render immutable purchase terms/snapshot. Current catalog/promotion/configuration cannot silently rewrite historical commercial outcomes.

## Refresh Allowance
M14 owns approved commercial allowance/configuration. M03 owns Refresh action/eligibility/consumption. Default semantic allowance remains 5 successful Refreshes per Agent per Asia/Jakarta operational day, no carry-forward, one successful Refresh per Listing/day. This is a controlled additive Core-contract residual; the UI may represent it without inventing physical schema/API.

## Create Listing boundary
The following remain M03/WIRE-02 and are excluded from WF-06 authoring semantics: `listing_context`, `category`, `transaction_type`, `title`, `property_type`, `price`, `is_negotiable`, `address`, `province`, `city`, `district`, `dispute_free_declared`, `whatsapp_number`.

## Gate
**G-W06.00 = PASS / READY FOR VISUAL EXECUTION**
