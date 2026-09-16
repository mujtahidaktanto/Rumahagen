# WIRE-00 — Integrated Core Wireframe Foundation Rules v1.1

**Project:** RumahAgen R01/WF03  
**Mode:** FULL DEEP SCAN / FOUNDATION FREEZE / CORRECTIVE REVALIDATION  
**Source boundary:** ONLY the uploaded `Core baru RumahAgen-SaaS-GitHub-Ready.zip`, uploaded `RumahAgen_Integrated_Core_Wireframe_Checklist_v1.0.xlsx`, and the uploaded RumahAgen logo as visual brand asset. No web/external reference is used.  
**Status:** **WF-00 FOUNDATION LOCK — PASS AFTER CORRECTIVE REVALIDATION**  
**Purpose:** establish the complete foundation rules that all later WIRE work packages must follow.

## 1. Authority, source boundary and stage boundary

1. The uploaded Core remains the semantic/product authority. Wireframes are derived visual representations and cannot change business semantics.
2. WF-00 is a foundation step only: authority precedence, source reconciliation method, IA/navigation, screen decomposition, coverage method, shared visual rules, state/accessibility/responsive rules, evidence boundary and work-package boundaries.
3. Later WIRE steps must not silently resolve controlled Core/API/RLS/runtime residuals by inventing routes, permissions, entities, states, providers, or authority.
4. One integrated application is maintained across M01–M15; WIRE packages are execution slices, not separate applications.
5. Existing valid UX journeys are preserved unless an authoritative successor decision explicitly changes them.
6. The visual design may refine layout, hierarchy, spacing, component composition and interaction presentation without changing semantic behavior.

## 2. Current Core authority chain carried into wireframe work

The wireframe team must resolve semantic questions in this order, using the current uploaded Core chain:

```text
Owner Decision / MADCR / ADR
        ↓
Master Business Rules
        ↓
Current PRD
        ↓
Current User Flow
        ↓
Entity Mapping
        ↓
Current ERD
        ↓
Database Dictionary
        ↓
Database Schema
        ↓
API Contract
        ↓
RBAC / Permission / RLS Contract
        ↓
Functional Specification
        ↓
Technical Specification
        ↓
Current UI/UX Specification
        ↓
WIRE-00 and later WIRE execution
```

If a lower layer appears to conflict with a higher authoritative layer, the wireframe does not invent a compromise. It records the conflict for upstream resolution.

## 3. Physical/runtime proof is NOT a wireframe blocking gate — LOCKED

This is an explicit stage rule:

> **Absence of physical database proof, migration proof, API runtime proof, RLS proof, runtime authorization proof, integration proof or production proof MUST NOT lock, HOLD, STOP or block WIRE-00 or any subsequent WIRE package.**

1. Wireframe work is a documentary/design realization stage and may proceed while physical/runtime layers are `NOT VERIFIED`.
2. Physical/runtime/production evidence is downstream validation evidence. It may later confirm, refine or expose implementation defects; it does not retroactively become a prerequisite for creating the visual wireframe.
3. A controlled residual may block a WIRE package **only** when an unresolved semantic/authority/UX contract contradiction makes a truthful representation impossible. Missing physical/runtime proof alone is never sufficient.
4. When exact physical identifiers, endpoints, RLS policies or runtime states are not evidenced, the wireframe must use the source-semantic concept/label and mark the implementation dependency as evidence-gated; it must not invent identifiers.
5. No WIRE gate may contain an acceptance criterion equivalent to “physical proof exists” or “runtime proof exists” unless that criterion belongs to a later implementation/verification stage and is explicitly outside WIRE scope.
6. `NOT VERIFIED` is an evidence status, not a visual-design prohibition.
7. This rule aligns with the Core's pre-physical/pre-runtime stage boundary and controlled-residual treatment.

## 4. Primary UX philosophy

### 4.1 Easy for a novice, capable for an expert
- Put the next necessary decision first.
- Keep primary actions obvious and limited.
- Use progressive disclosure for advanced/provenance information.
- Do not make users understand the architecture to complete a task.
- Use plain, action-oriented labels; technical terms appear only where the source domain requires them.

### 4.2 One screen does NOT mean one giant screen
A screen serves a coherent user goal. Do not force every requirement into one screen.

Use a new screen when:
- the user goal changes;
- authority/state changes materially;
- information density becomes cognitively heavy;
- a confirmation/review decision deserves focus;
- a long form has independent logical stages;
- desktop and mobile need materially different interaction patterns.

Use a wizard/stepper when:
- the source already defines a sequential flow, including Listing creation;
- the task has natural ordered stages;
- showing all fields at once increases error/cognitive load.

Use progressive disclosure/drawer/modal when:
- secondary information is contextual and short;
- the user should return to the same task without losing context.

Use a dedicated screen when:
- the operation is consequential, data-dense, operational, or needs persistent history.

### 4.3 Vertical scrolling is allowed and expected
- Screens may be vertically scrollable when content is naturally long.
- Never shrink typography/components merely to avoid vertical scroll.
- Long forms use logical sections and sticky/anchored primary actions where useful.
- Mobile prioritizes stacked content and a clear primary CTA.
- Horizontal scrolling is not the default for dense content; transform tables into cards/lists on mobile when clearer.

## 5. Navigation rules

### 5.1 Desktop
Use a modern Material Design-style enterprise shell:
- top app bar: RumahAgen logo, global search, context switcher, notifications, profile;
- collapsible/expandable sidebar;
- breadcrumb where hierarchy helps;
- page title + primary action;
- main content area with generous spacing;
- optional right contextual panel only when it reduces navigation friction.

### 5.2 Mobile
- compact top bar with logo, search, notification, menu;
- navigation through menu/drawer and/or primary bottom navigation for high-frequency destinations;
- stacked content;
- drawers instead of oversized desktop modals;
- sticky primary CTA only when it improves task completion.

### 5.3 Navigation is hide/show, not locked
The sidebar/navigation must be collapsible on desktop and menu/drawer based on mobile. Hiding navigation never removes authorization; authorization remains server/domain controlled.

### 5.4 Context
Authenticated Agent experience is independent-first. Organization context is additional, not forced. Context switching refreshes resource lists, permitted actions and applicable quota/entitlement displays without changing ownership or platform role.

## 6. Information architecture and work-package decomposition

| Step | Scope | Boundary |
|---|---|---|
| WIRE-00 | Foundation/authority/IA/navigation/rules/coverage method | No detailed module UI |
| WIRE-01 | Public + Authentication | Public discovery + M01 auth; no downstream detailed admin scope |
| WIRE-02 | Core Account + Agent + Listing center + DBR/KPR + dashboard/notifications | No organization/developer admin implementation |
| WIRE-03 | Organization + Developer + Project | Organization/developer/project scope only |
| WIRE-04 | Learning + Learning Economy | Learning-owned UX; no M15 outcome creation |
| WIRE-05 | Event + Session | Event/session scope only |
| WIRE-06 | Commercial | Commercial/payment/entitlement/quota/promotion |
| WIRE-07 | Qualification + Award | M15 qualification/evidence/award/title |
| WIRE-08 | Admin + Authorization | M09/M10 administration/authorization |
| WIRE-09 | System/Ops | M13 provider/BYOK and system operations |
| WIRE-10 | Shared states/edge cases | No new domain behavior |
| WIRE-11 | Final integration audit | Cross-package verification only; no semantic mutation |

### 6.1 Client/admin coverage separation
Every WIRE package that contains both user-facing and administrative behavior must maintain separate coverage views:
- **Client/User surface ledger** — user-facing screens and states.
- **Admin/Operational surface ledger** — authorized administrative/operational screens and states.

A requirement cannot be considered covered merely because an administrative screen exists when the client-facing journey is missing, or vice versa.

## 7. Listing placement — LOCKED

**Listing is centered in WIRE-02.** Public Listing discovery/detail is represented in WIRE-01; Developer/Project → Listing relationship is traced in WIRE-03; commercial capacity/Refresh allowance is traced in WIRE-06; shared states are verified in WIRE-10. This is cross-package traceability, not scope duplication.

The source-defined Listing creation sequence remains:
`Context → Category & Transaction → Location → Property Details → Price → Legal → Media → Contact → Preview → Submit`.

WIRE-02 must preserve Listing lifecycle, ownership, field-lock, publish, refresh, expiry, quota/allowance and authoritative-state semantics.

## 8. Screen coverage rule — no source requirement left unrepresented

Every source-defined user journey, operational capability, public surface, materially distinct state, or administrative capability must have at least one explicit wireframe representation in the appropriate WIRE package. A single source requirement may produce multiple screens/states; a single screen may cover multiple related requirements only when this does not overload the user.

Coverage is measured by **obligation → screen/state**, not by artificially minimizing screen count.

### 8.1 Mandatory M11 public discovery surfaces — exactly 10
1. Homepage
2. Listing
3. Agent
4. Organization
5. Developer/Project
6. Event
7. Learning
8. Learning Session
9. Static Public Content
10. Announcement/Promotion

### 8.2 M14 commercial surface preservation
The source UI/UX contract preserves **eight approved commercial surfaces** and their ordered lifecycle. Later WIRE-06 must inventory them explicitly rather than collapsing them into a generic “Commercial” screen.

### 8.3 M01–M15 coverage allocation
- M01 Identity/Auth → WIRE-01
- M02 Profile/Review → WIRE-01 public + WIRE-02 account/profile
- M03 Listing/Lifecycle/Refresh → WIRE-01 public + WIRE-02 center; WIRE-10 states
- M04 Learning/Economy/Session-learning → WIRE-04; downstream qualification trace in WIRE-07
- M05 Event/Registration/Session → WIRE-05
- M06 Developer/Project/Media/Marketing Kit/Claim → WIRE-03; Claim→Listing handoff trace to WIRE-02
- M07 DBR/KPR → WIRE-02 user experience; Bank Master administration → WIRE-08
- M08 Dashboard/Notification → WIRE-02; shared state handling → WIRE-10
- M09 Admin/Configuration/Audit/Public-content lifecycle → WIRE-08; public representations → WIRE-01
- M10 Authorization/Role/Permission/Preset/Scope → WIRE-08; denial/restricted states → WIRE-10
- M11 SEO/Public Discovery/Analytics → WIRE-01 public surfaces; authorized measurement/admin views → WIRE-08 where applicable
- M12 Organization/Membership/Context → WIRE-03
- M13 Provider Catalogue/BYOK/AI → WIRE-09, with assistive AI entry from authenticated shell where needed
- M14 Commercial/Payment/Entitlement/Quota/Promotion → WIRE-06
- M15 Qualification/Evidence/Award/Title → WIRE-07

## 9. Shared state rule

Every stateful screen must account, where applicable, for:
`Loading → Ready/Populated → Empty → Pending → Success/Confirmed → Rejected → Failed → Expired → Unauthorized → Protected non-existence → Retry/Recovery → Offline/Interrupted`.

Forms additionally cover untouched, dirty, valid, invalid, submitting, submitted, and server error.

Loading must never imply a successful mutation. Consequential outcomes such as Payment Confirmed, LP Granted, Award Issued, Session Completed, or Listing Published require authoritative response.

Empty states must distinguish no resource, no authorized resource, no configured benefit, no transaction, and no eligible action.

## 10. Dynamic / real-world content length rules

The Core source does not freeze universal UI character limits. WF-00 does not invent business maximum lengths.

- components tolerate realistic short/medium/long content;
- text wraps by default where meaning must remain visible;
- truncation/ellipsis is allowed only where full content is available through detail/tooltip/expand interaction and does not hide a critical decision;
- titles/headings handle multi-line content without breaking layout;
- cards accommodate long names, project names, organization names, addresses and announcement titles;
- tables use responsive representations rather than fixed widths;
- user-entered content follows server-defined validation limits once established by the authoritative data/API contract;
- no visual mockup may imply a shorter business limit than the source contract.

## 11. Forms and wizard rules

- Every field has a visible label; placeholder is never the label.
- Client validation is convenience; server validation remains authoritative.
- Long forms show top-level error summary plus field-level errors.
- Multi-step forms preserve dirty-state protection: Save Draft / Leave / Cancel where applicable.
- File upload displays filename, size, progress, validation, retry, delete, and privacy classification where applicable.
- Stepper progress shows where the user is and what remains without unnecessary technical detail.
- Back/Next controls remain predictable; primary action is visually clear.
- Never hide a required consequential action only inside a secondary menu.

## 12. Tables, search and scalability

Use tables for operational workflows such as users, listings, orders, payments, reconciliation, entitlements, organization members, session evidence and awarding operations.

Mobile representation: `table → card/list` when clearer than horizontal scrolling.

Search/filter:
- public Listing filters use AND logic;
- active filters are removable chips;
- shareable URL query state is preserved where the source requires it;
- admin and Learning filtering remains scoped to the owning domain.

Pagination/infinite scroll:
- use pagination for operational/dense datasets where users need positional control;
- use infinite scroll only where continuous discovery is appropriate and position restoration remains usable;
- never use infinite scroll for precise auditing, reconciliation or predictable record location unless the source flow explicitly supports it.

## 13. Typography hierarchy

Use a highly legible sans-serif with semantic hierarchy:
`Display → H1 → H2 → H3 → Body → Body Small → Caption → Label → Numeric Emphasis`.

Price, quota, LP and other important numbers receive clear numeric emphasis. Typography remains readable on mobile; density is controlled by spacing/grouping, not excessively small text.

## 14. Accessibility baseline

Target the source's WCAG 2.2 AA-oriented UX baseline:
- keyboard navigation;
- visible focus;
- semantic headings;
- visible form labels;
- error association;
- accessible control names;
- sufficient contrast;
- no color-only status;
- meaningful image alt text;
- decorative images excluded from assistive technology;
- modal focus trapping and Escape behavior;
- screen-reader-friendly status updates;
- reduced motion support;
- sufficiently large touch targets and adequate spacing;
- accessible chart text summaries;
- map fallback/list view;
- accessible file-upload feedback.

## 15. Security / privacy UX baseline

Wireframes must preserve the source security/privacy boundary:
- sensitive identity/KTP data is never presented as public content;
- secrets/API credentials are never displayed as ordinary content;
- protected-resource non-existence is not leaked;
- visibility does not imply authorization;
- UI controls are not treated as the security boundary;
- privacy classification and access context are visible where needed to make safe user decisions;
- client-side hiding is never represented as proof of server enforcement.

## 16. Responsive / breakpoint rules

Use content-driven breakpoints, not device-specific assumptions.

Desktop: sidebar, multi-column dashboards, full tables where useful, side-by-side forms where comprehension benefits.

Tablet: collapsible sidebar, reduced columns, responsive tables/cards.

Mobile: compact navigation, cards, stacked forms, sticky primary CTA where useful, drawers instead of large desktop modals.

Mobile-critical source flows remain fully usable: login, registration, listing creation/publish, WhatsApp CTA, Learning Activity, Session join, Organization invite, commercial checkout, payment status, LP view, DBR, notifications.

## 17. Performance UX baseline

Represent perceived-performance patterns from the source:
- skeleton loading;
- lazy loading;
- progressive image loading;
- pagination/infinite scroll where appropriate;
- authoritative mutation feedback;
- no client-side success claims before authoritative response.

## 18. Cross-module connection rules

Cross-module navigation must show relationships without transferring authority.

Examples:
- M14 allowance → M03 Refresh eligibility/action → M10 authorization.
- Order → Checkout → trusted verification → Confirmed → Fulfillment → Entitlement.
- M04 Learning evidence → M15 Qualification Evidence → Qualification → Award/Title.
- Organization context → Listing/session context where authorized; membership never implies ownership/entitlement.
- M06 Approved Claim → Agent-owned Listing initialization → M03 lifecycle.
- M09 owning-domain public content lifecycle → M11 discovery/measurement.
- M13 Provider/BYOK → assistive AI; AI cannot create canonical outcomes.

## 19. Legacy UX preservation

The following source journeys must be explicitly checked for preservation during WIRE execution:
registration/OTP, login, profile, review, listing, listing media, listing search, developer, project, DBR, course/lesson/quiz, event/registration/session distinction, organization/context, notifications, admin, RBAC, AI BYOK, SEO/public discovery, analytics, commercial, payment, entitlement/quota, Learning Economy and Learning Session.

## 20. Do-not-invent list

Wireframe must never invent:
- role;
- permission/capability;
- entitlement;
- ownership;
- organization authority;
- API endpoint/resource identifier;
- database table/column;
- provider authority;
- business state;
- automatic provider failover;
- client-side official outcome;
- new Owner decision.

## 21. Evidence annotation rules

When a requirement is semantically accepted but its physical/runtime realization is not evidenced, the wireframe may represent the intended UI/state and annotate it as:
- `Evidence-gated`
- `Implementation dependency`
- `Runtime verification pending`

Do not convert these annotations into disabled screens, blocked WIRE steps, or invented technical placeholders.

## 22. WF-00 acceptance gate

WF-00 passes when:
- IA and sitemap foundation are defined;
- authority precedence and source-only boundary are explicit;
- desktop/mobile shell is defined;
- navigation is hide/show/collapsible and not an authorization boundary;
- screen decomposition prevents overloaded screens;
- wizard/stepper is explicitly allowed where justified;
- vertical scrolling is explicitly supported;
- dynamic-content behavior is defined without inventing business limits;
- empty/loading/error/recovery/edge states are defined;
- responsive/breakpoint behavior is defined;
- accessibility and click/touch target baseline is defined;
- typography hierarchy is defined;
- pagination/infinite-scroll rules are defined;
- security/privacy UX boundary is defined;
- desktop/mobile folder separation is defined;
- uploaded RumahAgen logo is registered as canonical brand asset;
- all M01–M15 have an assigned downstream WIRE scope;
- client/admin coverage separation is required;
- Listing is locked to WIRE-02 as primary center with cross-package traceability;
- exactly ten mandatory M11 public surfaces are protected from omission;
- M14's eight commercial surfaces are protected from collapse/omission;
- later steps have explicit scope boundaries;
- absence of physical/runtime/production proof is explicitly non-blocking for wireframe execution;
- no implementation/runtime authorization is implied.

## 23. Locked execution order

`WIRE-00 → WIRE-01 → WIRE-02 → WIRE-03 → WIRE-04 → WIRE-05 → WIRE-06 → WIRE-07 → WIRE-08 → WIRE-09 → WIRE-10 → WIRE-11`

**WIRE-00 v1.1 is the corrected foundation baseline for all subsequent wireframe execution.**
