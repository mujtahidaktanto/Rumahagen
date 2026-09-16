# WF-09 Foundation / Visual Wireframe Rules v1.1 — Corrected
## Scope lock
WIRE-09 = System / Operations. Primary M13 scope is Provider/BYOK/AI; operational integration, API/webhook, audit, reconciliation and recovery surfaces are included by the uploaded checklist/Core successor UX.

### Substeps
WF-09.01 System Operations & Health
WF-09.02 Provider Catalogue Operations
WF-09.03 BYOK Connection & AI Operations
WF-09.04 Payment & Learning Integration Operations
WF-09.05 API / Webhook Integration Operations
WF-09.06 Operational Audit, Reconciliation & Recovery

## M13 semantic coverage
Provider Catalogue:
- View/Add/Edit/Enable/Disable/Remove-Retire/Integration-Configuration Management.
- Mutation is Superadmin-only.
- Agent cannot register arbitrary provider/endpoint outside approved catalogue.

Own BYOK:
- Agent/User owns connection and credential; scope OWN.
- Create/View/Save/Update/Configure/Test/Rotate-Replace/Enable/Disable/Disconnect-Delete/Reconnect.
- Select provider for AI use.
- No Admin/Manager approval.
- One active connection per provider per Agent/User.
- No sharing/delegation/ownership transfer.
- Raw credentials never exposed.

Administrative intervention:
- Authorized Admin/Superadmin within governed scope may FORCE_REVOKE, FORCE_DISCONNECT, FORCE_DISABLE another user's connection.
- Intervention is not ownership.
- No raw credential access, rotation, update, testing or ownership transfer.
- Reason/audit traceability is required.

AI invocation:
- Applicable feature authorization + own connection + VALID/ACTIVE + provider available/reachable.
- Connection existence alone is insufficient.
- AI remains assistive and non-authoritative.

Provider lifecycle:
CREATE → UNVERIFIED → VALID/ACTIVE → INVALID/ERROR
ACTIVE → DISABLED/REVOKED/DISCONNECTED/DELETED
Temporary outage ≠ revocation.

## Cross-domain operational boundaries
M14 owns payment/commercial truth. M04 owns Learning truth. M10 owns authorization. M09 owns administrative configuration/audit where applicable. WIRE-08 owns detailed Admin/RBAC configuration. WIRE-05 owns Event/Session provider configuration where applicable. WIRE-10 owns shared state normalization. WIRE-11 owns final integration audit.

## UX
One coherent goal per screen; wizard/progressive disclosure allowed; vertical scrolling allowed; desktop table → mobile card/list; no invented character limits; dynamic wrapping; Loading/Empty/Ready/Pending/Success/Rejected/Failed/Expired/Unauthorized/Protected non-existence/Retry/Offline where applicable; 44×44 touch baseline; keyboard/focus/contrast/status accessibility; content-driven responsive breakpoints; navigation hide/show is never authorization.
