# WF-02 Visual Wireframe Rules v1.0

## A. UX PRINCIPLES
1. One coherent user goal per screen. Never create a giant screen merely to prove coverage.
2. Put the next necessary decision first.
3. Limit primary actions; move secondary/provenance detail into progressive disclosure.
4. Use plain action-oriented labels. Do not make the Agent understand architecture.
5. Vertical scrolling is normal. Never shrink typography/components to avoid scroll.
6. Use wizard/stepper for Listing creation because the source defines an ordered multi-stage flow.
7. Keep task context visible: step position, save state, current Listing status, and next action.
8. Consequential actions require explicit confirmation where appropriate.
9. Client UI is never the security boundary and never claims authoritative success before the authoritative response.

## B. MATERIAL-STYLE LAYOUT
- Desktop baseline: 1440px canvas family, consistent with uploaded WIRE-01 visual artifacts.
- Mobile baseline: 390px canvas family, consistent with uploaded WIRE-01 visual artifacts.
- Enterprise shell: top app bar + collapsible sidebar on desktop; compact top bar + drawer/menu on mobile.
- Navigation is hide/show/collapsible and never an authorization boundary.
- Page pattern: title/context → primary action → content sections → contextual secondary actions.
- Prefer cards, sections, tabs/segmented controls, dialogs and drawers only when they reduce cognitive load.
- Dense operational data uses table/list on desktop and card/list transformation on mobile.

## C. INFORMATION DENSITY
- Dashboard: prioritize action/status summary, not every metric.
- My Listings: prioritize search/filter/status, listing identity, price, location, freshness, status and next action.
- Listing detail: prioritize state, core facts, owner actions and lifecycle explanation.
- Listing creation: one logical group per step; no unrelated cross-domain controls.
- Preview: render the listing as a reviewable whole; keep Edit by step and Publish/Save Draft actions clear.
- Quota/Performance/DBR: use dedicated focused surfaces rather than overloading Dashboard.

## D. LISTING WIZARD
Step 1 — Context + Category & Transaction.
Step 2 — Location + Property Details.
Step 3 — Price + Legal + Media + Contact + Tags.

Rules:
- Stepper shows current/complete/remaining steps.
- Back/Next is predictable.
- Save Draft is available without pretending that the Listing is Published.
- Dirty-state protection is explicit before leaving.
- Top-level error summary plus field-level error.
- Server validation remains authoritative.
- Long step content scrolls vertically.
- Do not invent character limits not established by source contracts.
- Media upload must show filename, size, progress, validation, retry and delete behavior where applicable.
- Exact duplicate media at submission is blocked; 90–99% perceptual similarity is warning/non-blocking; below 90% has no duplicate warning. Comparison is within the same Agent's relevant listings.

## E. STATE MODEL
Every material screen covers, as applicable:
Loading → Ready/Populated → Empty → Pending → Success/Confirmed → Rejected →
Failed → Expired → Unauthorized → Protected non-existence → Retry/Recovery → Offline/Interrupted.

Forms additionally cover:
Untouched → Dirty → Valid/Invalid → Submitting → Submitted → Server Error.

Important:
- Empty is not automatically error.
- No authorized resource must not reveal protected existence.
- Failed mutation must not be presented as success.
- Refresh failure consumes zero allowance.
- Notification is projection only; it does not mutate Listing truth.

## F. REAL-WORLD CONTENT LENGTH
- Allow multi-line headings/titles.
- Long project/organization/address/listing names must wrap safely.
- Truncation is allowed only when full content remains available through a clear detail/expand interaction.
- Do not imply a shorter business maximum than the source contract.
- Price/quota/LP-like numeric information uses stable numeric emphasis without forcing fixed-width assumptions.

## G. RESPONSIVENESS
Content-driven breakpoints:
- Desktop: multi-column where comprehension benefits; sidebar; full operational table when usable.
- Tablet: collapsible navigation; fewer columns; responsive cards.
- Mobile: stacked sections; drawer navigation; card/list transformation; sticky primary CTA only when useful.
- Avoid horizontal scrolling for normal listing workflows.
- Preserve action order and meaning across breakpoints.

## H. ACCESSIBILITY / ACTION TARGETS
- Every control has a visible or programmatically associated label.
- Keyboard navigation and visible focus are required.
- Do not use color alone for state.
- Status uses text/icon plus semantic meaning.
- Touch/click targets should be designed at approximately 44×44 CSS px or larger with adequate spacing; this is a visual-design target, not a business rule.
- Destructive actions are separated from common actions and require confirmation where appropriate.
- Dialogs trap focus and provide predictable Escape behavior.
- File upload progress/error/retry is perceivable.
- Charts have text summaries.

## I. TYPOGRAPHY
Hierarchy:
Display → H1 → H2 → H3 → Body → Body Small → Caption → Label → Numeric Emphasis.

Use density through grouping/spacing, not tiny type. Numeric emphasis is reserved for price,
quota/capacity, performance values and other source-important numbers.

## J. SEARCH / FILTER / SCALABILITY
- Listing filters follow source AND logic.
- Active filters are visible/removable.
- Operational datasets use pagination when positional control matters.
- Infinite scroll is reserved for continuous discovery-like lists; it is not the default for operational/audit-style records.
- Listing lists must preserve usable position and filter context when navigating to detail and back.

## K. CROSS-MODULE CONNECTIONS
- Dashboard projects state from authoritative domains; it does not mutate them.
- Listing Refresh: M14 allowance → M03 Refresh enforcement → M10 authorization.
- M06 Approved Claim → Agent-owned Listing initialization → M03 Listing lifecycle.
- M07 DBR result is a pre-screening result, not bank approval.
- M14 quota/entitlement presentation does not become RBAC.
- Organization membership does not become Listing ownership.
- Public Listing presentation remains WIRE-01; WIRE-02 owns authenticated management.

## L. DO NOT INVENT
Never invent roles, permissions, capability IDs, endpoint IDs, database fields,
ownership, entitlement semantics, provider authority, new lifecycle states, or
official outcomes.

## M. VISUAL CONSISTENCY
Reuse the uploaded canonical RumahAgen logo and the established WIRE-01 shell proportions.
Do not redesign the logo. Shared navigation/components/tokens should be reusable across
desktop and mobile, while interaction patterns may differ by breakpoint.
