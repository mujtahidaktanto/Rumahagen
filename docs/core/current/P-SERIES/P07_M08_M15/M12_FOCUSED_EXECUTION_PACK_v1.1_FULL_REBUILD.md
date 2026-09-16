# M12 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** Organization / Membership / Context | **Batch:** B03

## Authority Guardrail
Organization/membership/context; not permission/ownership/visibility/entitlement/host authority.
## Change Obligations
- P3-OBL-043 [RECONCILE] → Organization Public Content ownership wording must preserve M12 context/ownership, M09 applicable admin/config, M11 discovery. | Core IP-02/IP-12/IP-13
- P3-OBL-044 [CONTROLLED] → Physical ORG-ADMIN label must not create a new platform Organization Admin role. | Core IP-01/IP-02
- P3-OBL-045 [PRESERVE] → Lead Exit → CLOSING → CLOSED; no Lead Transfer/successor/privilege inheritance. | Core IP-02

## M12-P4-WP01 — Organization Core
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M12-CI-004` as classified (AUGMENT): ORG-ADMIN action/permission boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-006` as classified (PRESERVE): M12 → M10 authorization dependency.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-007` as classified (PRESERVE): M12 → M11 discovery dependency.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-009` as classified (CONTROLLED): Physical implementation status.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-010` as classified (CONTROLLED): Runtime status.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M12-P4-WP02 — Membership/Invitation/Join Request
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M12-CI-001` as classified (PRESERVE): M12 Organization/Membership/Context ownership.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M12-P4-WP03 — Context & Ownership Boundary
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M12-CI-003` as classified (CONTROLLED): Organization Public Content ownership clarification.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-005` as classified (PRESERVE): M12 → M03 organization-context dependency.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M12-CI-008` as classified (PRESERVE): M12 → M14 commercial-context dependency.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M12-P4-WP04 — Lifecycle/Validation
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M12-CI-002` as classified (PRESERVE): Lead Exit → CLOSING → CLOSED; no Lead Transfer/successor inheritance.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
10 Core findings; 7 incorporated; 3 controlled.
