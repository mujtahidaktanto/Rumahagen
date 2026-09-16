# WIRE-02.03 Visual Wireframe Rules v1.2

1. Exactly 3 logical screens: AGT-005, AGT-006, AGT-007.
2. Use one integrated Create Listing wizard; state variants are not new screens.
3. Keep each stage coherent; use vertical scrolling and progressive disclosure rather than compressing fields.
4. Desktop: authenticated Material-style shell + collapsible sidebar. Mobile: compact top bar + drawer/menu.
5. Navigation hide/show/collapse is never authorization.
6. Listing field semantics come from the current Core/M03 contract; WF-02.03 composes their UX placement but cannot invent semantic fields.
7. AGT-005: Listing context, conditional Organization selection, Listing title, Category, Transaction purpose, Property type, and source/provenance initialization behavior.
8. AGT-006: Province, City/Kabupaten, District, Area keyword, Address, optional map/coordinates, Land Size, Building Size, Bedrooms, Bathrooms, Floors, Carport Capacity, Electrical Power, Water Source, Furnishing, Year Built, Amenities.
9. AGT-007: Price, conditional Price unit, Negotiation/Fixed state, Certificate type, Certificate transferred, IMB status, required Dispute-free declaration, Description, Highlights, Media, required WhatsApp number, Tags.
10. Do not equate Listing title with SEO meta_title. If source initialization provides a title/header value, show it as source-backed initialization/provenance.
11. Project meta_description may initialize Listing Description where the source crosswalk applies; it does not create a new authority.
12. Rental price-unit UI is conditional on the applicable transaction type.
13. Legal fields use structured controls and progressive disclosure; do not collapse distinct legal semantics into one generic field.
14. Media UX must support photo/video entry, cover, order, alt text, progress, retry and remove. Duplicate exact matches may block and high-similarity matches may warn at authoritative validation; the wireframe must not pretend to own the duplicate algorithm.
15. Requiredness is explicit where authoritative; optional fields are not falsely presented as mandatory.
16. No new business character limits. Long real-world content wraps safely.
17. Accessibility: visible labels, semantic hierarchy, keyboard/focus, associated errors, non-color-only status, accessible names, adequate contrast and ~44×44 CSS px touch targets.
18. Responsive: desktop grouping, tablet reduction, mobile stacking, vertical scroll, no forced horizontal overflow.
19. Form state coverage: initial/ready, dirty, valid, invalid, loading, submitting, server error/retry, protected where applicable, offline/interrupted.
20. Physical/runtime proof is never a WIRE blocker. Only semantic/authority/UX contradiction may block truthful representation.
