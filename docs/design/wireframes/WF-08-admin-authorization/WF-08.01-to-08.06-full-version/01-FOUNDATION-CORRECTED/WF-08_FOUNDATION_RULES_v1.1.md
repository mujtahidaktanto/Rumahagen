# WF-08 Foundation Rules v1.1 — Corrected Full Version
## Scope
WIRE-08 = Admin + Authorization. M09 = Administration/Configuration/Audit; M10 = Authorization/RBAC/Scope/RLS.

## Core scope carried into WIRE-08
Admin Dashboard, Users, Organizations, Content/Public Communication, Moderation, Learning administration, Commercial administration, Bank Master administration, System Configuration, Roles, Permission Catalogue, Role Permission Matrix, Permission Presets, Capability/Scope/Effective Authorization, Audit/Export, Notification Template/Content Configuration, and cross-module authorization review.

## M10 invariants
- Role = actor grouping.
- Role Permission = default/baseline matrix.
- Permission identity = (module_code, action_code).
- Platform granted scope vocabulary = ALL / OWN / NONE.
- Permission Preset = optional configuration targeted to an existing Role.
- Preset is never a new Role and cannot create permissions/capabilities outside target-role baseline.
- Preset assignment is zero-or-one active preset.
- Preset assignment never changes Role.
- Target-role mismatch fails closed.
- Effective authorization resolution is Role → Role Permission → Preset contribution → Capability → Permission → Scope → Condition → Ownership → Organization context → Effective Result.
- Guest is unauthenticated state, not a physical Role row.

## M09 invariants
- System Configuration is an M09 administrative surface.
- GET /admin/config/system and PUT /admin/config/system are source-evidenced current API records.
- Static Public Content and Announcement/Promotion lifecycle/configuration remain M09/applicable-domain administrative surfaces; public discovery remains M11.
- Notification Template/Content Configuration is represented semantically; exact current endpoint/storage contract is controlled and not invented.
- Moderation operations Review / Escalate / Manual Correction remain distinct.
- M09 does not become universal business-domain authority.

## Cross-module boundaries
- M03 Listing business semantics remain M03; WIRE-08 may represent authorization to actions.
- M04 Learning semantics remain M04.
- M14 commercial truth remains M14.
- M15 qualification/award semantics remain M15.
- M07 DBR/KPR business semantics remain M07; Bank Master administration is represented in WIRE-08.
- Navigation hide/show is never an authorization boundary.
