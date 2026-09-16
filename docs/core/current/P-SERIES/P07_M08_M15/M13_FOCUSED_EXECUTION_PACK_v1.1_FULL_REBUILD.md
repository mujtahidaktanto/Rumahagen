# M13 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** AI / BYOK / Provider Catalogue | **Batch:** B03

## Authority Guardrail
AI/provider semantics; Provider Catalogue Superadmin governance; BYOK own-scope; M10 auth remains authoritative.
## Change Obligations
- P3-OBL-046 [RECONCILE] → Provider Catalogue mutation is Superadmin-only; historical Admin-curated wording must not persist. | Core IP-14/IP-01
- P3-OBL-047 [RECONCILE] → BYOK ownership is Agent/User OWN; no broad internal-role ownership. | Core IP-14/IP-01
- P3-OBL-048 [AUGMENT] → Complete connection lifecycle, invocation precondition, raw-credential privacy, provider retirement/outage and bulk-revoke execution mode must be explicit. | Core IP-14/IP-01
- P3-OBL-049 [CONTROLLED] → Exact lifecycle/API/RLS/uniqueness/disconnect/force-action details remain downstream evidence-gated. | Core IP-14/IP-01

## M13-P4-WP01 — Provider Catalogue
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M13-CI-001` as classified (RECONCILE): Provider Catalogue mutation = SUPERADMIN ONLY. Admin/Manager do not mutate catalogue. Agent cannot register arbitrary provider endpoint outside approved catalogue..
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M13-CI-003` as classified (PRESERVE): M10 authorization boundary.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `M13-CI-004` as classified (CONTROLLED): Physical/runtime implementation.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M13-P4-WP02 — BYOK Connection Lifecycle
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `M13-CI-002` as classified (RECONCILE): Agent/User owns own BYOK connection and may create/view/save/update/configure/rotate/replace/test/enable/disable/disconnect/delete/reconnect own connection without Admin/Manager approval; no sharing/delegation/transfer..
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M13-P4-WP03 — Protected Invocation/Security
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Execute the P4 work-package contract. 2. Validate dependencies and obligations. 3. Record evidence without runtime inference.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M13-P4-WP04 — Transient Chat Frame/Validation
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Execute the P4 work-package contract. 2. Validate dependencies and obligations. 3. Record evidence without runtime inference.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
4 Core findings; 3 incorporated; 1 controlled.
