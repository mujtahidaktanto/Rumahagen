# RumahAgen WIRE-02.05 — Published / Edit / Expired / Archive-Delete

Status: PASS — v1.2 CORRECTED / READY FOR WF-02.06
Source boundary: only the files uploaded for this execution were used; no web/external source was used.

## Logical screen contract
1. AGT-011 Published Listing Management — published state actions + visibility/lifecycle context.
2. AGT-012 Edit Listing — owner edit + four post-first-publish field locks.
3. AGT-014 Expired Listing — EXPIRED → DRAFT/revision path and explanation.
4. AGT-015 Listing Archive / Delete — governed archive/delete action + confirmation.

AGT-013 Refresh Listing, AGT-016 Listing Quota / Capacity, and AGT-017 Listing Performance remain WIRE-02.06 and are deliberately not absorbed here.

## Visual system
Modern Material Design-style enterprise composition; desktop and mobile are separate folders. Navigation is collapsible/hide-show and is never treated as an authorization boundary. Long content uses vertical scroll.

## UX rules
- One coherent goal per logical screen; state variants do not create new logical screens.
- Dynamic text must wrap; no invented business character limits.
- Required states are represented where applicable: ready, loading, empty, error/retry, protected; validation/success/offline are included where material.
- Consequential archive/delete uses explicit confirmation.
- Disabled/blocked actions explain what is blocked, why, and what the user can do next.
- Approx. 44×44 CSS px touch targets with spacing.
- Responsive: desktop multi-column where useful; mobile stacked cards/forms and vertical scroll.
- Accessibility: semantic hierarchy, labels, focus order, keyboard support, non-color-only status.
- UI presents authoritative domain state; client state does not create official outcomes.
- Physical DB/API/RLS/runtime/production evidence is not a WIRE blocker; missing implementation evidence is not converted into invented UI identifiers.


## v1.2 correction
Listing identity screens now visibly reserve the Listing cover/media area. Because no actual unit-photo asset exists in the uploaded source set, the visual uses an explicit no-source-photo placeholder and does not fetch or invent imagery.


## v1.2 correction — F-0205-01
AGT-012 now presents the complete user-facing Listing edit field surface from the current Core, using progressive-disclosure sections and vertical scrolling. The four post-first-publish locked fields remain visible and locked. System-generated fields are not fabricated as editable inputs.


## v1.2 correction — F-0205-01 CLOSED
AGT-012 Edit Listing now covers the complete user-facing Listing edit field surface from the current Core. The form is intentionally long and vertically scrollable, with progressive-disclosure sections. Four post-first-publish locked fields remain visible and locked. System-generated fields are not fabricated as inputs. See the v1.2 deep-scan, screen contract, field coverage and state matrix documents.
