# M10 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** Authorization / RBAC / Permission / Scope / RLS | **Batch:** B02

## Authority Guardrail
Authorization/RBAC/Scope/RLS authority; Permission Preset never creates a new role or exceeds baseline.
## Change Obligations
- P3-OBL-036 [PRESERVE] → Role = actor grouping; Role Permission = baseline; Permission Preset = configurable target of an existing role, never a new role/outside baseline. | Core IP-01
- P3-OBL-037 [CONTROLLED] → M10 remains authorization/RBAC/Scope/RLS authority; exact physical permission IDs remain controlled/open where evidence absent. | Core IP-01
- P3-OBL-038 [PRESERVE] → Condition/ownership/organization graph must remain explicit without transferring domain business authority. | Core IP-01/IP-02

## M10-P4-WP01 — Authorization Core
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M10-CORE-01` as classified (PRESERVE): Core RBAC.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-02` as classified (AUGMENT): Core Permission.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-03` as classified (AUGMENT): Core Scope.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-05` as classified (AUGMENT): Core UI/UX.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-06` as classified (AUGMENT): Core API.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-07` as classified (AUGMENT): Core ERD / DB.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-08` as classified (PRESERVE): Core lifecycle.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-09` as classified (PRESERVE): Core actor/role.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-12` as classified (AUGMENT): Core cross-module authorization.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-13` as classified (CONTROLLED): Core implementation/downstream.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-14` as classified (PRESERVE): Privilege escalation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-15` as classified (PRESERVE): Effective authorization resolution.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-17` as classified (CONTROLLED): WF03 legacy baseline.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M10-P4-WP02 — Permission Preset Governance
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M10-CORE-16` as classified (PRESERVE): Preset lifecycle/recovery.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M10-P4-WP03 — Scope/Condition/Ownership/Organization
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M10-CORE-10` as classified (PRESERVE): Core organization boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M10-CORE-11` as classified (PRESERVE): Core ownership boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M10-P4-WP04 — RLS Evidence/Handoff
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M10-CORE-04` as classified (AUGMENT): Core RLS.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
17 Core findings; 15 incorporated; 2 controlled.
