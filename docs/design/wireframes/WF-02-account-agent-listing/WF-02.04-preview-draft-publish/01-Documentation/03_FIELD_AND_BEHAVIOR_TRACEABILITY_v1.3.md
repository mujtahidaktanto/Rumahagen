# WIRE-02.04 Field and Behavior Traceability v1.3

## AGT-008 — Listing Preview
- Carries the complete canonical Listing review surface from Create Listing.
- Required fields remain represented; conditional fields remain conditional.
- Listing title remains distinct from SEO `meta_title`.
- Project initialization/provenance remains visibly secondary.
- Listing identity now includes a cover slot and explicit no-source-photo fallback.
- Preview is not a mutation-success surface.

## AGT-009 — Save Draft
- Receives the current Listing payload prepared by the Create Listing flow.
- Save summary includes Listing identity/cover slot.
- Save action enters Saving only after user intent.
- Success means authoritative Draft persistence confirmed.
- Error/Retry does not imply persistence.
- Dirty-state protection explicitly interrupts navigation when unsaved changes exist.
- Empty state is explicit when there is no current Listing content to persist.

## AGT-010 — Publish Listing
- Publication path remains `DRAFT → PUBLISH → PUBLISHED`; no normal Pending Review approval gate is introduced.
- Publication summary includes Listing identity/cover slot.
- Before publication, the UI represents an authoritative publication eligibility/quota check.
- No quota number is invented.
- Success means authoritative Published confirmation.
- Validation-blocked/error/protected/empty states remain distinct.

## Authority boundaries
- M03: Listing lifecycle, ownership/edit, publication/refresh semantics.
- M10: authorization evaluation.
- M14: commercial entitlement/quota values.
- AGT-009/010 do not administer M14 configuration.
