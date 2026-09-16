# WIRE-02.04 Visual UX Rules v1.3

## Common
- Material-style authenticated shell; collapsible navigation is not an authorization boundary.
- Desktop and Mobile are separate visual surfaces.
- Vertical scrolling is allowed and preferred over shrinking content.
- Dynamic text must wrap; no invented business character limits.
- Primary action hierarchy must remain predictable.
- Touch targets are approximately 44×44 CSS px or larger where practical.
- Loading, empty, validation, error/retry, protected, offline/interrupted states are explicit where applicable.
- Authoritative outcomes are not shown optimistically.

## Cover-first Listing Identity Rule
Every AGT-008, AGT-009, and AGT-010 state that represents an available Listing exposes a compact Listing identity/cover slot before or alongside the primary review/save/publish content.

- Cover is visual identity, not a new media-management scope.
- The component reserves space for the authoritative cover asset and preserves aspect ratio.
- No unit/property photo is fabricated when the source set has none.
- The placeholder explicitly says **No source unit photo available**.
- Loading, empty, protected, error and offline states use neutral state-appropriate placeholders.
- Mobile uses a stacked cover component and vertical scrolling; it must not force horizontal overflow.
- The cover remains subordinate to the primary action and must not make the screen unnecessarily busy.

## AGT-008
Preview remains review-only. It may expose Edit by Step, Save Draft and Continue to Publish hand-offs, but it must not claim that a Draft or Publish mutation succeeded. Global states that do not semantically apply are explicitly mapped as N/A/delegated in the state matrix.

## AGT-009
Save Draft has a visible dirty-state interruption: when unsaved changes exist and the user attempts to leave, the same logical screen presents Save Draft / Leave without saving / Cancel. Empty means no current Listing content is available to persist as Draft.

## AGT-010
Publish exposes an authoritative publication eligibility/quota check before the mutation. The UI may show a neutral checking state and authoritative failure/success, but must not invent allowance numbers or turn the screen into quota administration. M14 remains commercial entitlement authority; M10 remains authorization authority. Empty means no publishable Listing is currently available.

## Scope containment
Do not absorb Refresh, Expired, Archive/Delete, public SEO/discovery, quota administration, or later WIRE-02.05 flows.
