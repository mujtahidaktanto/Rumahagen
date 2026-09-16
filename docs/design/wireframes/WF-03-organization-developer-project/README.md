# RumahAgen WIRE-03 — Organization + Developer + Project
Version: v1.1 CORRECTED / FULL VERSION
Status: CONTROLLED CORRECTION — FINDINGS CLOSED

## Source boundary
This package is derived only from the uploaded current-source corpus:
- WF Wire(3).zip
- Core baru RumahAgen-SaaS-GitHub-Ready(1).zip
- RumahAgen_Integrated_Core_Wireframe_Checklist_v1.0(20260913-080319).xlsx

Recursive source scan used for reconciliation:
- WF Wire(3): 439 archive entries, 15 nested ZIP, max depth 1.
- Core successor: 2,208 recursive archive entries, 96 nested ZIP, max depth 2.
- Checklist: 5 sheets.

## Controlled correction from v1.0
- F-0301 CLOSED: ORG-005 explicitly represents required Organization name and Organization type; optional profile fields are separately labeled. Generated/context fields are not user inputs.
- F-0302 CLOSED: DEV-001 now represents Company name, PIC name, PIC contact, Company logo, and free-text “Tentang Developer”.
- F-0303 CLOSED: DEV-003 now represents Price min and Price max separately, with price semantics dependent on transaction context.
- F-0304 CLOSED: field documentation explicitly separates user inputs from context/inherited, generated, and lifecycle/system fields.

## WIRE-03 scope
Organization + Developer + Project, including members/membership, invitations/join requests, organization lifecycle/context, Developer profile, Developer Project, Project Media, Marketing Kit, Claim, and controlled Project → Agent-owned Listing initialization relationship.

No WIRE-02 Listing lifecycle is reimplemented here. Create/Edit/Publish/Refresh/Quota/Performance remain WIRE-02 concerns.

## Screen inventory
ORG-001..ORG-009: Organization dashboard, settings, members, invitations/join requests, create organization, activity, closure, resources, Listing context.
DEV-001..DEV-008: Developer profile, projects, create/edit project, project detail, project media, marketing kit, claims, Approved Claim → Listing initialization.

## Locked semantic boundaries
- Organization context is a scope/context mechanism, not a new platform Role, entitlement, payment capability, Host capability, or Instructor capability.
- Membership does not imply Listing ownership or unrestricted Organization management.
- M12 owns Organization/Membership/Context semantics; M06 owns Developer/Project/Media/Marketing Kit/Claim semantics; M10 owns authorization; M03 owns Listing semantics and execution; M11 owns public discovery/SEO/measurement; M14 owns applicable commercial entitlement.
- Project Media = photo/video only. Marketing Kit = PDF brochure/pricelist and is separate from Project Media.
- Project.description is not introduced. Project.meta_description is the canonical initial source for Listing description; Project.meta_title is the canonical initial source for Listing title/header.
- Project.land_area and Project.building_area preserve canonical M03 Listing field names.
- Approved Claim belonging to the requesting Agent is required for controlled Project → Agent-owned Listing initialization. Approval does not grant generic M03 Create/Update/Publish/Refresh authority.
- Resulting Listing remains Agent-owned and M03-governed; Project and Agent Listing do not become bidirectionally synchronized.
- No MVP territory/project exclusivity is introduced.

## Physical/runtime boundary
Physical schema, migration, API runtime, RLS, runtime authorization, storage, Claim persistence, Project lifecycle enforcement, Listing initialization runtime and production proof are downstream evidence. Their absence MUST NOT lock/HOLD/STOP WIRE-03. No runtime PASS is claimed. Only unresolved semantic, authority, UX, or scope contradiction can block a WIRE package.

## Accessibility / responsive
WCAG 2.2 AA-oriented baseline, keyboard/focus semantics, semantic labels/headings, accessible names, non-color-only status, dynamic text wrapping, touch targets around 44 CSS px, modal/focus handling where applicable, mobile stacking, and intentional vertical scrolling for long forms.
