# WF-02.03 Field Semantic Matrix v1.2

| Field / obligation | Screen | Requiredness | Conditionality / dependency | UX behavior |
|---|---|---|---|---|
| Listing context | AGT-005 | Required | Personal or Organization | Segmented/context control; does not mutate ownership |
| Organization | AGT-005 | Conditional | Required only when Organization context selected; relevant membership/authority applies | Progressive disclosure |
| Listing title | AGT-005 | Required | May be source-initialized by approved Project/Claim context | Editable/displayed as Listing title; do not equate to SEO meta_title |
| Category | AGT-005 | Required | — | Canonical selection |
| Transaction purpose/type | AGT-005 | Required | Drives transaction-dependent fields | Selection |
| Property type | AGT-005 | Required | — | Canonical selection |
| Province | AGT-006 | Required | Canonical region dependency | Search/select |
| City/Kabupaten | AGT-006 | Required | Depends on Province | Search/select |
| District | AGT-006 | Required | Depends on City/Kabupaten | Search/select |
| Area keyword | AGT-006 | Optional | Supplemental free text | Wrap safely |
| Address | AGT-006 | Required | Independent from optional map point | Long-text safe |
| Map point / coordinates | AGT-006 | Optional | Supplemental location | Optional map + non-map fallback |
| Land Size | AGT-006 | Optional unless a later authoritative transaction/property rule makes it required | Property-dependent | Numeric field |
| Building Size | AGT-006 | Optional unless authoritative condition applies | Property-dependent | Numeric field |
| Bedrooms | AGT-006 | Optional | Property-dependent | Numeric field |
| Bathrooms | AGT-006 | Optional | Property-dependent | Numeric field |
| Floors | AGT-006 | Optional | Property-dependent | Numeric field |
| Carport Capacity | AGT-006 | Optional | Property-dependent | Numeric field |
| Electrical Power | AGT-006 | Optional | Property-dependent | Select/entry |
| Water Source | AGT-006 | Optional | Property-dependent | Select/entry |
| Furnishing | AGT-006 | Optional | Property-dependent | Select/entry |
| Year Built | AGT-006 | Optional | Property-dependent | Year entry |
| Amenities | AGT-006 | Optional | Property-dependent | Multi-select/list |
| Price | AGT-007 | Required | — | Numeric input |
| Price unit | AGT-007 | Conditional | Appears when applicable to transaction | Progressive disclosure |
| Negotiation / fixed | AGT-007 | Required | — | Choice control |
| Certificate type | AGT-007 | Optional | Legal applicability | Structured control |
| Certificate transferred | AGT-007 | Optional | Legal applicability | Boolean/status control |
| IMB status | AGT-007 | Optional | Legal applicability | Structured control |
| Dispute-free declaration | AGT-007 | Required | — | Explicit declaration + validation |
| Description | AGT-007 | Optional | May be initialized from Project meta_description where crosswalk applies | Textarea; long content wraps |
| Highlights | AGT-007 | Optional | — | Text/list input |
| Media | AGT-007 | Source-requiredness handled by authoritative Listing/media contract | Media-specific | Photo/video, cover, order, alt text, progress/retry/remove |
| WhatsApp number | AGT-007 | Required | — | Explicit contact field; validation feedback |
| Tags | AGT-007 | Optional | — | Tokenized input; long content safe |
