# M08 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** Dashboard / Notification Projection | **Batch:** B07

## Authority Guardrail
Projection/notification only; never source business truth or mutation.
## Change Obligations
- P3-OBL-030 [PRESERVE] → M08 remains projection/notification-only and cannot manufacture or mutate source business outcomes. | Core IP-11
- P3-OBL-031 [PRESERVE] → Source event/status contracts must precede projection behavior; M08 must not block core source domains. | Core IP-11

## M08-P4-WP01 — Projection Core
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M08-IA-01` as classified (PRESERVE): Dashboard Projection.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-05` as classified (PRESERVE): M10 boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-09` as classified (PRESERVE): Event/status producers.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-10` as classified (PRESERVE): Actor lifecycle.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-11` as classified (PRESERVE): Projection boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-12` as classified (PRESERVE): Idempotency/retry.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-13` as classified (PRESERVE): Provenance/audit.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-14` as classified (PRESERVE): Supersession.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-15` as classified (PRESERVE): Physical/runtime gate.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-16` as classified (PRESERVE): Permission cardinality.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-18` as classified (CONTROLLED): Master progress.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M08-P4-WP02 — Notification/Communication
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M08-IA-02` as classified (PRESERVE): Notification State.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-04` as classified (PRESERVE): Notification reference protection.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-06` as classified (PRESERVE): Notification state representation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-07` as classified (PRESERVE): Notification operations.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-08` as classified (PRESERVE): Admin notification push.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M08-P4-WP03 — Source Event Contracts
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M08-IA-03` as classified (PRESERVE): Source-domain visibility.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M08-IA-17` as classified (PRESERVE): Source authority preservation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M08-P4-WP04 — Validation/No-Mutation
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Execute the P4 work-package contract. 2. Validate dependencies and obligations. 3. Record evidence without runtime inference.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
18 Core findings; 17 incorporated; 1 controlled.
