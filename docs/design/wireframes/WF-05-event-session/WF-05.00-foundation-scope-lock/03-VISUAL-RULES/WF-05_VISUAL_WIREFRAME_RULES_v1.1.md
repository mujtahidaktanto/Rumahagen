# WF-05 Visual Wireframe Rules v1.1 — Corrected

## Core visual rules
Modern Material Design-inspired enterprise UI; canonical uploaded RumahAgen logo on every visual target; shared WF-00 shell; collapsible navigation; vertical scroll allowed; responsive desktop/tablet/mobile; novice-first progressive disclosure; no screen overloaded merely to reduce screen count.

## Event
- Event lifecycle status is explicit where operationally relevant: pending_approval, published, rejected, cancelled.
- Event publication approval and participant registration approval are visually separate.
- Registration default is auto-confirm; closed/manual approval is an Event Owner configuration.
- Quota means maximum Registered participants, not commercial entitlement and not Session capacity.
- Waitinglist never displays queue number/rank.
- Registration cutoff is start_at + 1 hour.
- Pre-start cancellation returns one Event quota slot only after authoritative outcome.
- Attendance is optional; no-show does not auto-cancel registration.
- Guest email is contact/notification destination, never canonical identity.
- Meeting link appears only when a governed destination exists.
- Event Provider Configuration is a distinct admin operation/surface; provider must be determined before Event start. Provider-specific details are progressive and evidence-gated.
- Provider policy: LiveKit primary, Zoom fallback 1, Daily fallback 2, Google Meet external. Do not claim automatic runtime failover.

## Session
- Session remains M04-owned despite being in WF-05.
- Session types: BROADCAST / INTERACTIVE / ON_DEMAND.
- Visibility: PUBLIC / ORGANIZATION / PARTNER / PRIVATE.
- Session lifecycle: DRAFT → SCHEDULED → LIVE → ENDED; SCHEDULED→CANCELLED; SCHEDULED/LIVE→FAILED.
- Enrollment: PENDING → ACTIVE → COMPLETED. Client cannot self-set state.
- Host and Instructor remain distinct.
- Active enrollment is the access condition; provider participation/payment success alone is not enrollment state.
- Provider evidence is not automatically attendance/completion.
- Session completion never visually implies LP, Certificate, Title or Award without authoritative downstream evidence.

## Listing boundary
All 13 Core-required Create Listing fields belong to WIRE-02. WF-05 must not duplicate them as Event/Session fields. Same labels with different entities are explicitly distinguished (e.g., Event title vs Listing title; Event location vs Listing address; Event category vs Listing category).

## Accessibility / dynamic / scalability
Approx. 44×44 touch targets; visible focus; semantic labels; no color-only status; long text wraps; no invented character limits; desktop tables become mobile cards/lists; pagination for operational collections; discovery may use infinite scroll only where state recovery is safe.
