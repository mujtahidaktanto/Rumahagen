# Expanded M14 Field Semantic Matrix v1.1

| Field/concept | Semantic owner | UX class | Requiredness | Conditionality / dependency | Behavior |
|---|---|---|---|---|---|
| product_id | M14 | reference | required in product context | product exists | display authoritative reference; never invent |
| offer_id | M14 | reference | required when offer selected | eligible offer | server-authoritative eligibility |
| product_code | M14 | identity | required for configured product | managed product | display/configure as authorized |
| price / purchase amount | M14 | monetary | required for purchase | purchasable offer | checkout total authoritative |
| billing period | M14 | configuration | conditional | subscription | monthly/annual where configured |
| subscription status | M14 | lifecycle | conditional | subscription exists | state-specific CTA |
| starts_at / ends_at / renews_at | M14 | temporal | conditional | lifecycle requires dates | display authoritative dates |
| add-on validity_type | M14 | configuration | conditional | add-on | controls whether validity_days is shown |
| validity_days | M14 | quantity/temporal | conditional | fixed-period validity | show only when fixed-period |
| capacity_type | M14 | configuration | conditional | capacity-bearing add-on/benefit | determines capacity_value semantics |
| capacity_value | M14 | quantity | conditional | capacity-bearing product | display/configure approved value |
| promotion_id | M14 | reference | conditional | promotion applies | preserve provenance |
| promotion rule_configuration | M14 | configuration | conditional | promotion | rule semantics, not eligibility |
| eligibility_configuration | M14 | configuration | conditional | promotion/offer | evaluated by server; not user-editable |
| benefit_configuration | M14 | configuration | conditional | promotion/entitlement | describes resulting benefit |
| valid_from / valid_to | M14 | temporal | conditional | promotion/config | date-bound activation |
| order reference | M14 | reference | required after order creation | order exists | historical identity |
| immutable purchase snapshot | M14 | historical | required for confirmed order | confirmed purchase | read-only; never rewritten |
| order status | M14 | lifecycle | required | order exists | Created/Checkout/Pending/Processing/Confirmed/Failed/Expired/Cancelled |
| provider return state | M14 | evidence | conditional | provider redirect/return | informational only |
| payment status | M14 | lifecycle | required when payment exists | payment flow | distinct pending/processing/confirmed/failed/expired/cancelled |
| confirmed_at | M14 | temporal | conditional | trusted verification success | never shown as confirmed before verification |
| fulfillment status | M14 | lifecycle | conditional | confirmed commercial state | idempotent; no duplicate benefit |
| entitlement definition | M14 | configuration | conditional | commercial benefit definition | definition ≠ instance |
| entitlement instance | M14 | commercial authority | conditional | successful fulfillment | concrete granted benefit |
| beneficiary target | M14 | scope | required for scoped entitlement | personal/org entitlement | Personal vs Organization |
| entitlement status | M14 | lifecycle | conditional | entitlement exists | active/expired/revoked/etc supplied state |
| entitlement starts_at / ends_at | M14 | temporal | conditional | time-bound entitlement | display authoritative dates |
| quota capacity | M14 | capacity | conditional | quota-bearing entitlement | commercial capacity |
| operational quota pool | M14 | capacity | conditional | pooled capacity | separates source capacity from allocation |
| quota allocation | M14 | allocation | conditional | allocation exists | show allocated amount/scope |
| quota usage | M14 | usage | conditional | usage exists | derived authoritative usage |
| granted / used / remaining | M14 | derived quantity | conditional | quota chain | never allow arbitrary client mutation |
| consuming resource | M14/M03 context | reference | conditional | quota usage | identifies downstream consumer |
| Daily Refresh Allowance | M14 | commercial config | conditional | approved M14 allowance | display/configure; M03 owns action |
| reconciliation case | M14 | case | conditional | mismatch/reconciliation | evidence-first workflow |
| resolution state | M14 | lifecycle | conditional | case exists | authorized resolution only |

## UX classes
Editable configuration ≠ derived value ≠ authoritative lifecycle ≠ historical snapshot. All labels must be user-readable; physical field names are traceability only.
