# P4 Module Execution Specification Architecture — M10 v1.3
**Authority:** Authorization/RBAC/Scope/RLS  
**Status:** FULL-VERSION / CURRENT SUCCESSOR EXECUTION ARCHITECTURE

## 1. Authority and Execution Boundary
- `M10` remains the semantic authority for its domain: **Authorization/RBAC/Scope/RLS**.
- P4 defines executable architecture, not implementation execution.
- Core v1.3 is immutable/read-only.
- No silent deletion, replacement, authority inversion, or unsupported physical/runtime claim.

## 2. Scope
- Translate current P3 planning into module execution contracts, concrete work-package boundaries, atomic-task schema, dependencies, acceptance, evidence and handoff.

## 3. Non-Scope
- Do not absorb another module's semantic authority.
- Do not invent exact endpoint IDs, permission IDs, table names, RLS SQL, migrations, deployment state, or runtime proof.

## 4. Preserved Capability
- All valid inherited Core/upstream capabilities remain unless an authoritative semantic conflict explicitly supersedes them.

## 5. Current P3 Obligations → Execution Consequence
- **PRESERVE** | Role = actor grouping; Role Permission = baseline; Permission Preset = configurable target of an existing role, never a new role/outside baseline. | `M10-P4-WP01` | consequence: Carry unchanged into execution contract and regression acceptance.
- **CONTROLLED** | M10 remains authorization/RBAC/Scope/RLS authority; exact physical permission IDs remain controlled/open where evidence absent. | `M10-P4-WP02` | consequence: Specify evidence/verification handoff; do not claim physical/runtime completion.
- **PRESERVE** | Condition/ownership/organization graph must remain explicit without transferring domain business authority. | `M10-P4-WP03` | consequence: Carry unchanged into execution contract and regression acceptance.

## 6. Dependency Architecture
- Hard dependencies must be GREEN before dependent execution.
- Conditional dependencies activate only in the governed scenario.
- Projection/observational dependencies do not block source-domain implementation.

## 7. Data Architecture
- Owned data remains canonical within module authority.
- Consumed data remains read/contract input from authoritative upstream modules.
- Projected/observed data cannot become business truth.
- Physical schema realization is downstream/evidence-gated.

## 8. API / Service Architecture
- Existing accepted API contracts are consumed/preserved.
- Server-authoritative mutation, state, error, idempotency, retry and provider-verification semantics are carried where established.
- P4 specifies required contract behavior; it does not invent unsupported endpoint identifiers.

## 9. Authorization / RBAC / RLS Architecture
- M10 remains authorization authority.
- Capability + permission + scope + ownership + organization condition apply as governed.
- Domain module remains owner of domain business outcome.
- Physical permission/RLS proof remains downstream.

## 10. Functional / User Flow Architecture
- Every atomic task must map to a functional/user-flow capability.
- Lifecycle/state transition, entry/exit condition, allowed actor/capability, invalid transition and downstream outcome must be explicit where applicable.

## 11. Technical Execution Architecture
- Follow accepted Technical Specification and W4 physical authority.
- W4-01E/W4-02 are not replaced.
- P4 does not execute SQL, migrations, application code or deployment.

## 12. UI / UX Architecture
- Screen → Flow → Action → Capability → Authorization → Module.
- UI visibility is not authorization enforcement.
- Required loading/empty/success/error/pending/denied/unavailable states are explicit where applicable.

## 13. SEO / Analytics Architecture
- Public resource → M11 discovery/measurement.
- Lifecycle/configuration → M09 or applicable domain.
- No tracking deployment/runtime proof is claimed.

## 14. Cross-Module Execution Contracts
- Upstream authority → consumed contract → expected outcome → prohibited mutation.
- M03/M14: commercial allowance from M14, Refresh action from M03.
- M04/M15: evidence from M04, qualification/Award from M15.
- M09/M11: lifecycle/config from M09/applicable domain, discovery from M11.
- M08: projection only.

## 15. Work-Package Architecture
- **M10-P4-WP01 — Authorization Core**: dependency gate → contract definition → atomic tasks → validation → evidence → checkpoint → handoff.
- **M10-P4-WP02 — Permission Preset Governance**: dependency gate → contract definition → atomic tasks → validation → evidence → checkpoint → handoff.
- **M10-P4-WP03 — Scope/Condition/Ownership/Organization**: dependency gate → contract definition → atomic tasks → validation → evidence → checkpoint → handoff.
- **M10-P4-WP04 — RLS Evidence/Handoff**: dependency gate → contract definition → atomic tasks → validation → evidence → checkpoint → handoff.

## 16. Atomic Task Contract
- Format: `<WP-ID>-TNN`.
- Required fields: objective, authority, scope, non-scope, dependencies, inputs, expected change, validation, evidence, checkpoint, residual, downstream handoff.

## 17. Acceptance Architecture
- Semantic; data; API; security; UX; integration/regression as applicable.
- All current P3 obligations are covered or explicitly CONTROLLED.
- No inherited valid capability is silently removed.

## 18. Negative / Security Tests
- Wrong actor/capability; wrong scope; wrong ownership; wrong Organization context; invalid lifecycle transition; duplicate/replay/stale mutation where applicable; unauthorized cross-module mutation.

## 19. Evidence Architecture
- STATIC, BUILD, DATA, API, SECURITY, UI, INTEGRATION, RUNTIME and RECONCILIATION evidence are distinct.
- Static/build evidence never becomes runtime proof.

## 20. Checkpoint / Rollback
- GREEN / FROZEN / HOLD / BLOCKED / FAILED.
- Rollback returns to last accepted checkpoint without rewriting canonical authority.

## 21. Controlled Residuals
- Unverified physical/runtime/API/RLS items remain controlled and are handed downstream.

## 22. Downstream Handoff
- P5 receives module → WP → atomic task → dependency → acceptance → evidence → checkpoint.

## 23. Do-Not-Change
- No new semantic module, duplicate authority, alternate physical baseline, unsupported identifier, silent deletion/replacement, or runtime/production claim.

## 23. Controlled Findings Reconciled into P4 v1.3

- **D13-04** (High) — PUT /admin/config/dbr is present, but Core wording remains Superadmin-only while M07 semantic authority permits Admin configuration; M10 remains final authorization authority.  
  Routing: `M07-P4-WP02 ↔ M09-P4-WP02 ↔ M10-P4-WP03`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-06** (High) — M10 Permission Preset semantic contract is locked, but no exact current endpoint family is evidenced.  
  Routing: `M10-P4-WP02/WP04`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-10** (High) — M13 FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE administrative interventions are semantically required but exact routes are not evidenced.  
  Routing: `M13-P4-WP01/WP02/WP03`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-12** (Medium/High) — /admin/reports/export authorization wording is broader than the M09-R11 semantic matrix.  
  Routing: `CROSS-DOMAIN P4 CONTRACT/EVIDENCE GATE`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-13** (High) — /admin/audit-logs authorization wording is not aligned with M09-R04 scope.  
  Routing: `CROSS-DOMAIN P4 CONTRACT/EVIDENCE GATE`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-14** (Medium) — M09/M13 physical/RLS/security residuals remain downstream; STEP11-D does not claim runtime or deployed RLS proof.  
  Routing: `M13-P4-WP01/WP02/WP03`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
- **D13-15** (High) — Exact M10 permission-ID mapping remains unresolved and is outside STEP11 endpoint synchronization.  
  Routing: `M10-P4-WP02/WP04`  
  Treatment: Registered as a controlled execution/evidence obligation; no unsupported endpoint, permission ID, schema, SQL or runtime completion is invented.
