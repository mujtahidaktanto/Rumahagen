# M03 Create Listing Protection / WF-06 Boundary v1.1

The 13 canonical Create Listing fields remain exclusively WIRE-02 / M03:

1. `listing_context`
2. `category`
3. `transaction_type`
4. `title`
5. `property_type`
6. `price`
7. `is_negotiable`
8. `address`
9. `province`
10. `city`
11. `district`
12. `dispute_free_declared`
13. `whatsapp_number`

WF-06 may expose downstream commercial context such as entitlement, quota capacity, remaining commercial allowance and Daily Refresh Allowance, but it does not author or semantically redefine these Listing fields.

Label collisions are prohibited: Listing title ≠ product/offer name; Listing price ≠ commercial purchase amount; Listing address ≠ commercial context; Listing category ≠ commercial category.
