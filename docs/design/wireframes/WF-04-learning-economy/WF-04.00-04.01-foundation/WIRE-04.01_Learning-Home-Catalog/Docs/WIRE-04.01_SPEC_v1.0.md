# WIRE-04.01 — LRN-001 Learning Home & Catalog

Purpose: first client learning discovery surface.

## Scope
Learning catalog discovery, Learning Path discovery entry, and Partner Learning discovery/access entry. This screen does not own course enrollment details, activity execution, LP redemption, assessment, Session management, commercial checkout, or qualification/award operations.

## UX
Search is discoverability, not authorization. Cards are responsive and wrap dynamic text. Desktop uses a collapsible navigation shell; mobile uses compact menu/bottom navigation. Vertical scroll is expected.

## States
Ready, Loading, Empty, Error/Retry, Access Restricted. Offline/interrupted follows WIRE-00 cross-screen state rules.

## Authority
M04 Learning semantics; M10 authorization; M11 public/discovery consumption where applicable. No unsupported permission or API is invented.
