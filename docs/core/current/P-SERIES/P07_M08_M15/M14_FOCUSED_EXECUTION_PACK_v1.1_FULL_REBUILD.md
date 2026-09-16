# M14 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** Commercial / Payment / Entitlement / Quota / Promotion | **Batch:** B03

## Authority Guardrail
Commercial/payment/entitlement/quota/promotion truth; Q01-Q64 remain M14; M03 owns Refresh action.
## Change Obligations
- P3-OBL-050 [AUGMENT] → Subscription/add-on lifecycle and temporal invariants require explicit Core contract mapping. | Core IP-07
- P3-OBL-051 [AUGMENT] → Purchase snapshot and confirmed_at invariants must be explicit. | Core IP-07
- P3-OBL-052 [AUGMENT] → Trusted payment verification, idempotent fulfillment, entitlement lifecycle, quota chain and reconciliation require explicit mapping. | Core IP-07
- P3-OBL-053 [AUGMENT] → Refresh Allowance is additive M14 authority; M14 owns allowance, M03 owns action/eligibility/consumption; no new M14 permission. | Core IP-07/IP-04
- P3-OBL-054 [PRESERVE] → Q01–Q64 belong to M14; do not reattribute them to M15. | Core IP-07

## M14-P4-WP01 — Catalog/Offer
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M14-CI-001` as classified (PRESERVE): M14 commercial authority.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-005` as classified (AUGMENT): Eight approved commercial surfaces.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-006` as classified (AUGMENT): Subscription lifecycle.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-007` as classified (AUGMENT): Add-on lifecycle/validity.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-015` as classified (AUGMENT): Operational Pool.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-016` as classified (AUGMENT): Allocation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-017` as classified (AUGMENT): Usage.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-018` as classified (AUGMENT): Refund / chargeback.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-019` as classified (AUGMENT): Reconciliation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M14-P4-WP02 — Order/Payment Core
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M14-CI-002` as classified (PRESERVE): Payment belongs to M14.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-009` as classified (AUGMENT): Immutable purchase snapshot.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-010` as classified (AUGMENT): Order confirmation invariant.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-011` as classified (AUGMENT): Trusted payment verification.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M14-P4-WP03 — Verification/Fulfillment
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M14-CI-003` as classified (PRESERVE): Entitlement ≠ RBAC.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-012` as classified (AUGMENT): Idempotent fulfillment.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-013` as classified (AUGMENT): Entitlement lifecycle.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M14-P4-WP04 — Promotion/Reconciliation/Quota
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M14-CI-004` as classified (PRESERVE): Quota is commercial capacity.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-008` as classified (AUGMENT): Promotion lifecycle.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-014` as classified (AUGMENT): Quota Capacity.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M14-CI-020` as classified (AUGMENT): Refresh Allowance.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
20 Core findings; 20 incorporated; 0 controlled.
