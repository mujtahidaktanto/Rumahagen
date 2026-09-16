# Create Listing Field Boundary Verification — WF-09
## Result: OUT OF SCOPE / INTENTIONALLY NOT DUPLICATED
The Core-required Create Listing fields are M03/WIRE-02 fields. WF-09 is System/Operations and must not own their semantic form behavior.

| # | Core field | WF-09 | Correct owner |
|---:|---|---|---|
| 1 | listing_context | OUT OF SCOPE | M03 / WIRE-02 |
| 2 | category | OUT OF SCOPE | M03 / WIRE-02 |
| 3 | transaction_type | OUT OF SCOPE | M03 / WIRE-02 |
| 4 | title | OUT OF SCOPE | M03 / WIRE-02 |
| 5 | property_type | OUT OF SCOPE | M03 / WIRE-02 |
| 6 | price | OUT OF SCOPE | M03 / WIRE-02 |
| 7 | is_negotiable | OUT OF SCOPE | M03 / WIRE-02 |
| 8 | address | OUT OF SCOPE | M03 / WIRE-02 |
| 9 | province | OUT OF SCOPE | M03 / WIRE-02 |
| 10 | city | OUT OF SCOPE | M03 / WIRE-02 |
| 11 | district | OUT OF SCOPE | M03 / WIRE-02 |
| 12 | dispute_free_declared | OUT OF SCOPE | M03 / WIRE-02 |
| 13 | whatsapp_number | OUT OF SCOPE | M03 / WIRE-02 |

### Semantic/dependency/requiredness/conditionality/UX decision
WF-09 does not define these field semantics, dependencies, requiredness, conditionality or input UX because doing so would create an authority inversion and duplicate the M03 Listing form.

WF-09 may expose **authorization/operational status of a Listing action**, but never its Create Listing field inputs.
