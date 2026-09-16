# WF-02 Scope Lock v1.0

## 1. Objective
Design the authenticated Agent experience for account/profile, dashboard, DBR/KPR,
notifications, and the complete Listing Center without moving authority into UI.

## 2. Primary authority map
- M01: identity/authentication context; already handled in WIRE-01.
- M02: Agent profile/review/outcome semantics; WIRE-02 owns authenticated self-profile presentation while public presentation remains WIRE-01.
- M03: Listing lifecycle, Listing ownership, ordinary Listing CRUD, Publish and Refresh action semantics.
- M07: DBR/KPR calculation and bank-master semantic boundary.
- M08: Dashboard/Notification projection only.
- M14: commercial entitlement/quota semantics; WIRE-02 presents quota/allowance context but does not become M14 authority.
- M10: authorization remains the authorization boundary; WIRE-02 must not invent permissions.

## 3. Client/Admin separation
WIRE-02 is primarily an authenticated client/Agent package. No dedicated Admin management
screens are invented here. Bank Master administration and authorization administration
are handed to WIRE-08. Any admin-related state referenced by source is a trace/hand-off,
not a WIRE-02 admin screen.

## 4. Listing creation sequence — locked
Context → Category & Transaction → Location → Property Details → Price → Legal → Media →
Contact → Preview → Submit.

The checklist's three Create Listing screens are preserved as three logical form stages;
the content inside each stage may vertically scroll and may use sections/progressive
disclosure.

## 5. Core Listing invariants
- One Listing remains one canonical entity.
- Agent may CRUD own Listing; ownership cannot be bypassed by client-supplied owner IDs or broad scope claims.
- Normal publication is DRAFT → PUBLISH → PUBLISHED; no Admin approval gate for the normal M03 publish path.
- SUSPENDED is enforcement/ethics state, not publication approval.
- After first successful publication, Address, Property Type, Land Size and Building Size are permanently locked.
- Sold/Rented listings are excluded from public Search/Discovery inventory while historical profile counters remain a separate presentation concern.
- Refresh action remains M03; commercial Refresh allowance remains M14; authorization remains M10.
- Default Refresh allowance is 5 successful Refreshes per Agent per operational day, configurable, Asia/Jakarta reset, no carry-forward, one successful Refresh per Listing/day, District-local repositioning, server-authoritative ordering, and failed Refresh consumes zero allowance.
- M06 Approved Claim may initialize an Agent-owned Listing context but does not grant ordinary Listing Create/Update/Publish/Refresh authority.
- Listing quota is presented as commercial capacity context; allocation and usage remain distinct.
