# WIRE-10 Scope & Visual Rules v1.0

## 1. Scope lock
WIRE-10 = Cross-screen States / Quality. It is a shared presentation and interaction layer,
not a new domain owner.

### In scope
- Loading / skeleton
- Ready / populated
- Empty variants: no resource, no authorized resource, no configured benefit, no transaction,
  no eligible action
- Validation / inline error
- Domain error / retry
- Pending / processing
- Success / confirmed
- Rejected / failed
- Expired
- Unavailable / degraded
- Unauthorized / denied / restricted
- Protected non-existence
- Destructive confirmation / dirty-state protection
- Offline / interrupted / recovery
- Session expiry / re-authentication
- Duplicate / replay handling presentation
- Long content / pagination
- Cross-module handoff / context preservation

### Out of scope
- Creating new roles, permissions, scopes, capabilities, ownership or entitlements.
- Redefining M01–M15 lifecycle semantics.
- Inventing API routes, tables, providers or runtime proof.
- Rebuilding domain-specific screens already owned by WIRE-01…WIRE-09.

## 2. Source authority
The uploaded Core is the semantic authority. The uploaded WIRE-00 foundation rules are the
wireframe execution authority. The uploaded checklist defines WIRE-10 as Cross-screen States.

## 3. One screen = one coherent goal
Do not compress all state variants into one giant screen. Dedicated screens/patterns are used
where a state changes user intent, recovery action, cognitive load or consequence. Wizard/stepper
remains allowed only for naturally sequential flows; WIRE-10 does not create new domain wizards.

## 4. Navigation
Desktop uses a Material Design-style enterprise shell with RumahAgen logo, global search,
context switcher, notifications, profile, breadcrumb, title and collapsible sidebar.
Mobile uses compact top bar, menu/drawer and stacked content.
Navigation is hide/show/collapsible and is never an authorization boundary.

## 5. Vertical scrolling
Vertical scroll is explicitly allowed and expected for naturally long content. Typography and
touch targets are never shrunk merely to avoid scrolling. Long content uses logical grouping and
sticky/anchored primary actions only when helpful.

## 6. Dynamic / real-world content length
No universal business character limit is invented. Titles, names, addresses, descriptions and
other content wrap naturally. Truncation is allowed only when the full value remains accessible
without hiding a critical decision. Multi-line headings must not break the layout.

## 7. Responsive behavior
- Desktop: full shell, multi-column where useful, tables for operational datasets.
- Tablet: collapsible navigation, reduced columns, responsive data presentation.
- Mobile: stacked cards/lists, drawers, contextual actions and touch-first controls.
- Breakpoints are content-driven; no fixed desktop density is forced onto mobile.
- Operational tables transform to cards/lists where clearer than horizontal scrolling.

## 8. State semantics
The UI presents authoritative state; it never turns local UI events into business outcomes.
Loading never implies success. Pending/processing is qualified by the owning domain.
Success/confirmed appears only after authoritative response. Rejected/failed shows a reason only
when the user is authorized to see it. Protected non-existence must not disclose protected data.
Provider/service unavailable is distinct from revocation/ownership.

## 9. Empty-state distinctions
The UI distinguishes:
1. No resource
2. No authorized resource
3. No configured benefit
4. No transaction
5. No eligible action
Each has a plain-language explanation and a safe next action when one exists.

## 10. Accessibility
WCAG 2.2 AA-oriented baseline carried from the uploaded foundation:
keyboard operation, visible focus, semantic headings, visible labels, error association,
accessible names, sufficient contrast, no color-only status, meaningful alt text, modal focus
management, screen-reader status updates, reduced motion, adequate touch targets/spacing,
accessible chart summaries, map fallback/list view, and accessible file-upload feedback.

## 11. Scalability
Use pagination for operational/dense datasets requiring positional control. Infinite scroll is
reserved for continuous discovery where appropriate and position restoration is usable. Do not
use infinite scroll for precise auditing/reconciliation unless explicitly supported by the source.

## 12. Security/privacy
Mask sensitive information. Never expose credentials/API keys. UI visibility is not authorization.
Protected resources must not leak through error/empty/analytics states.

## 13. Mutation and recovery
Consequential destructive operations require explicit confirmation and authoritative result feedback.
Duplicate/replay should preserve the existing authoritative outcome. Offline/interrupted states must
not claim authoritative success.

## 14. Cross-module continuity
Cross-module navigation may expose relationships and safe handoffs, but must not transfer:
- ownership
- role/permission/scope
- entitlement/quota
- completion/attendance
- payment confirmation
- award/title authority

## 15. Implementation boundary
Absence of physical DB, migration, API runtime, RLS, runtime authorization, integration or production
proof is evidence status, not a WIRE blocker. Only unresolved semantic/authority/UX contradiction can
block the wireframe.
