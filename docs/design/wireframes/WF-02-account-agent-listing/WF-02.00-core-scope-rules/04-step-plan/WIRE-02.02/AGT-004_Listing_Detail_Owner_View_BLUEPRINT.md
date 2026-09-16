# AGT-004 — Listing Detail — Owner View

Substep: WIRE-02.02
Audience: Client
Scope: M03 owner detail + actions by state

## Layout intent
- Modern Material Design-style enterprise composition.
- One coherent user goal.
- Desktop: authenticated shell + collapsible sidebar + page title/context + primary action + content.
- Mobile: compact top bar + drawer + stacked content + vertical scroll.
- Long content scrolls; no forced compression.

## Required UX
- Clear current context and resource state.
- Primary action is visible and predictable.
- Secondary/provenance information uses progressive disclosure.
- Loading, ready, empty, error/retry and authorization/protected states are represented where applicable.
- Dynamic text wraps safely; no invented business character limits.
- Interactive targets are designed at approximately 44×44 CSS px or larger with adequate spacing.
- Accessibility: labels, focus, keyboard, non-color-only status, semantic hierarchy.

## Authority
The UI presents authoritative domain state; it does not create it.
