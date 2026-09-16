# WIRE-03 Traceability v1.1

## Finding closure
| Finding | Correction | Status |
|---|---|---|
| F-0301 | ORG-005 explicit `organization_name` and `organization_type`; optional Organization fields separately labeled; system/context fields excluded from ordinary input | CLOSED |
| F-0302 | DEV-001 explicit `company_name`, `pic_name`, `pic_contact`, `company_logo`, `Tentang Developer` | CLOSED |
| F-0303 | DEV-003 explicit `price_min` + `price_max`, distinct fields | CLOSED |
| F-0304 | Field matrix classifies user input vs context/inherited vs generated/lifecycle/system | CLOSED |

## Current Core authority
- M12: Organization, Membership, Invitation/Join Request, Organization Context and Organization lifecycle.
- M06: Developer, Developer Project, Project Media, Marketing Kit, Claim/Approved Claim semantics.
- M10: authorization/RLS authority. UI visibility is not enforcement.
- M03: Listing lifecycle, content truth, ownership, publication and Listing actions.
- M11: public discovery/SEO/measurement.
- M14: commercial entitlement where applicable.

## Critical invariants
1. Organization context does not mutate membership, ownership, permission, Listing authority or Personal Context.
2. Membership alone does not expose every Organization Listing.
3. Organization Listing operation = M12 context + M10 authorization + M03 execution.
4. Organization close = ACTIVE → CLOSING → CLOSED; Close ≠ Delete.
5. Project status = coming_soon / active / sold_out / inactive; Update ≠ Publish/Activate.
6. Project Media = photo/video; brochure/pricelist are Marketing Kit.
7. Marketing Kit permissions remain governed; UI is not enforcement.
8. Claim = PENDING → APPROVED/REJECTED/WITHDRAWN/REVOKED where lifecycle permits.
9. Approved Claim does not grant ordinary M03 Listing Create/Update/Publish/Refresh authority.
10. Project existence alone cannot initialize an M03 Listing; Approved Claim belonging to requesting Agent is required.
11. Resulting Listing is Agent-owned and remains M03-governed.
12. Project source does not become bidirectionally synchronized with Agent Listing edits.
13. No MVP territory/project exclusivity.

## Create Listing boundary
The current Core M03 Create Listing required set remains owned by WIRE-02. WIRE-03 does not duplicate the full Listing form. Only Project source fields relevant to Project semantics and controlled initialization are represented.

## Source provenance
Current authoritative Core reference: `Core baru RumahAgen-SaaS-GitHub-Ready(1).zip`.
