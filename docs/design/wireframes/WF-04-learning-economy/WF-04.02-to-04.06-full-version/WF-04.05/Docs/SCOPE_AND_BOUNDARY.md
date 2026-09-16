# WF-04.05 — Full Rebuild / Correction v1.2

## Scope
Learning Result/Certificate + Skills/Outcomes + History + Skill/Credential/Partner/Reconciliation administration. M15 owns Qualification/Award/Title.

## Full-rebuild status
This is a whole-step rebuild of the visual and traceability package, not an image-by-image patch.

## UX / authority controls
- M04 owns Learning, Learning Economy/LP, Learning Path, Learning Activity, completion evidence, assessment, Skill and Credential.
- M10 remains authorization/RBAC/RLS authority.
- M14/WIRE-06 owns paid LP purchase, commercial order, payment and fulfillment.
- M15/WIRE-07 owns Qualification, Award and Title.
- M05/WIRE-05 owns detailed Session operations.
- Listing/Create Listing remains M03/WIRE-02 and is intentionally not duplicated here.
- Navigation hide/show/collapse is visual convenience only, never an authorization boundary.
- Dynamic real-world text wraps; no unsupported character limit is invented.
- Long forms/content use vertical scrolling and progressive disclosure.
- Desktop uses multi-column/data-dense patterns where useful; mobile stacks cards/forms and transforms tables into lists/cards.
- Touch targets target approximately 44×44 CSS px and status is not color-only.
- Authoritative completion, LP reward, assessment result, redemption result and credential outcome are never shown optimistically.
- Physical DB/migration/API-runtime/RLS/runtime-authorization/integration/production proof is evidence status, not a wireframe blocker unless it reveals a semantic/authority/UX contradiction.

## State coverage
Each screen has explicit inventory columns for loading, empty, validation, success, error/retry, denied/restricted and offline/interrupted where applicable. The screen-specific wireframe is the primary visual target; generic state sheets are not used as sole proof.

## Scalability
Course Management, My Learning, Learning History, LP Transactions, Learning Path Management, Learning Activity Management, Partnership Learning Result and Learning Reconciliation use pagination or infinite scroll where collection scale warrants it.
