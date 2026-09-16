# WF-07 FOUNDATION RULES v1.1 — CORRECTED

## Source boundary
Uploaded sources only. Recursive ZIP extraction includes nested ZIP content. No external reference is used.

## Scope and authority
M15 owns Qualification / Evidence / Award / Title semantics. M04 owns Learning completion, Learning Activity, assessment and Learning/Session evidence production; M15 consumes governed evidence. M10 remains authorization/RBAC/RLS authority. M14 owns commercial/payment/entitlement/quota and Q01–Q64. M11 owns public discovery/SEO/measurement.

## UX decomposition
One screen = one coherent goal. Do not force all requirements into one screen. Wizards/progressive disclosure are permitted for sequential configuration. Vertical scrolling is explicitly allowed. Dense operational data uses tables on desktop and cards/lists on mobile.

## Navigation
Navigation is collapsible/hide-show and is never an authorization boundary. Visibility of a menu item must not be interpreted as permission.

## Responsive/accessibility
Desktop reference 1440×1024; mobile 390×844. Content-driven breakpoints. Touch targets approximately 44×44 CSS px. Keyboard focus, semantic headings, accessible names, non-color-only status, reduced motion, screen-reader status and dynamic text wrapping are baseline rules.

## State coverage
Every material surface accounts for Ready, Loading, Empty, Validation, Error/Retry, Success and Denied/Restricted where applicable, plus relevant lifecycle states. Authoritative outcomes are not optimistic.

## Corrected semantic controls
1. Title authority scope is explicitly represented by scope type, scope reference and scope status without inventing a dedicated endpoint.
2. Awarding Path Version and Rule Version association is explicit before condition composition.
3. `condition_type` is distinct from `operator`, `expected_value` and `sequence_no`.
4. `evidence_payload` is represented through human-readable expandable Evidence Details, not raw JSON in the primary screen.
5. Evaluation provenance is explicit and follows evidence → evaluator → path/rule versions → authoritative evaluation time.
6. Award lifecycle exposes issued_at, expires_at, revoked_at and restored_at when state-relevant.
7. Developer Learning and Partner Learning are retained as governed evidence-source contexts without inventing new authority.

## Create Listing protection
The 13 M03 Create Listing fields remain in WIRE-02/M03 and are not duplicated into WF-07. Cross-module dependency may be referenced, but M15 does not own Listing creation.

## Physical/runtime evidence rule
Absence of physical DB proof, migration proof, API runtime proof, RLS proof, authorization runtime proof, integration proof or production proof does not block wireframe execution. Such evidence is classified as NOT VERIFIED/downstream. Only unresolved semantic, authority or UX contradiction can block a wireframe.
