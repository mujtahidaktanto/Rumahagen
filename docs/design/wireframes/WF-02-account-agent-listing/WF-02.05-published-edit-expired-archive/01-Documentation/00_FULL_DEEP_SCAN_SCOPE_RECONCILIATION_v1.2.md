# WF-02.05 v1.2 — Full Deep Scan & Scope Reconciliation

## Source boundary
Only the uploaded RumahAgen source set for this execution is used. No web/external reference is used.

## Correction target
F-0205-01 — AGT-012 Editable Listing Field Coverage Incomplete.

## Scope
The WIRE-02.05 logical screen contract remains exactly:
- AGT-011 Published Listing Management
- AGT-012 Edit Listing
- AGT-014 Expired Listing
- AGT-015 Listing Archive / Delete

AGT-013 Refresh, AGT-016 Quota/Capacity and AGT-017 Performance remain WIRE-02.06.

## Core reconciliation
The current Core LISTINGS semantic register includes Listing context, category, transaction type, title, description, property type, price, price unit, negotiation flag, address/location hierarchy, optional map coordinates, property specifications, legal fields, dispute-free declaration, WhatsApp, lifecycle/system fields, counters and freshness. Listing media includes cover/order/alt-text semantics.

AGT-012 now represents the user-facing edit surface with field-level treatment rather than exposing every physical/system attribute as an input. Required Create Listing fields remain semantically represented; post-publish locks affect editability, not semantic existence.

### Locked post-first-publish fields
1. Address
2. Property Type
3. Land Size
4. Building Size

These remain locked through EXPIRED → DRAFT. Other fields remain editable according to their own authoritative field-level rules.

### Dependency / conditionality
- Province → City/Kabupaten → District hierarchy is preserved.
- Transaction context drives applicable transaction-dependent semantics including Price Unit.
- Listing title remains distinct from SEO meta_title.
- Listing description remains distinct from SEO meta_description.
- Legal fields remain distinct.
- Amenities remain structured content.
- Media preserves cover/order/alt-text semantics.

### System/projection fields
id, slug, status, rejection reason, counters, lifecycle timestamps and last_refreshed_at are not fabricated as ordinary edit inputs.

## UX correction
AGT-012 is one logical screen implemented as a long, vertically scrollable form with progressive-disclosure sections. Desktop uses a two-column form where useful; mobile stacks sections and fields. This avoids squeezing the complete edit surface into one viewport.

## Evidence boundary
Physical DB, migration, API runtime, RLS, runtime authorization, integration and production proof remain downstream evidence. Missing proof does not block WIRE creation and does not justify invented identifiers.

## Decision
F-0205-01 CLOSED. No unresolved semantic, authority or UX contradiction remains in WIRE-02.05 v1.2.
