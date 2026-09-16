# M09 — P7 FOCUSED EXECUTION PACK
## FULL VERSION REBUILD v1.1
**Domain:** Administration / Configuration / Audit | **Batch:** B03

## Authority Guardrail
Bounded admin/config/audit; domain business authority remains with owning module.
## Change Obligations
- P3-OBL-032 [PRESERVE] → M09 admin/config/audit remains bounded; domain modules retain business authority. | Core IP-12
- P3-OBL-033 [AUGMENT] → Static Public Content and Announcement/Promotion lifecycle/configuration are explicitly represented in M09 planning where M09/applicable domain owns lifecycle. | Core IP-12/IP-13
- P3-OBL-034 [CONTROLLED] → system_configs semantic view/manage is Superadmin-only; broader physical SELECT is a downstream M10/RLS hardening item. | Core IP-01/IP-12
- P3-OBL-035 [PRESERVE] → M09 must not become a universal prerequisite; only affected domain paths block on relevant configuration/moderation/reconciliation. | Core IP-12

## M09-P4-WP01 — Administrative Foundation
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `PROP-M09-03` as classified (CONTROLLED): Core M09 physical execution spec.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `PROP-M09-06` as classified (CONTROLLED): Reconciliation physical actions.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M09-P4-WP02 — Domain Administration/Configuration
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `PROP-M09-04` as classified (CONTROLLED): M10/RLS system_configs SELECT.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `PROP-M09-05` as classified (CONTROLLED): Provider catalogue physical routing.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M09-P4-WP03 — Static Content + Announcement/Promotion
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Execute the P4 work-package contract. 2. Validate dependencies and obligations. 3. Record evidence without runtime inference.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## M09-P4-WP04 — Audit/Reconciliation
**Dependencies:** verify upstream identity/authorization/context and the module-specific counterpart contracts before execution.
**Contract:** preserve all assigned semantic obligations and Core details; no authority transfer.
**Atomic execution:**
1. Implement/verify `PROP-M09-01` as classified (CONTROLLED): Core API /admin/reports/export.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
1. Implement/verify `PROP-M09-02` as classified (CONTROLLED): Core API /admin/audit-logs.
2. Validate ownership/scope/state and downstream handoff against authority boundaries.
3. Record only supplied/produced evidence; leave physical/API/RLS/runtime gaps controlled.
**Validation:** obligation + Core-row coverage, authority integrity, no deletion/replacement, evidence classification.
**Checkpoint:** batch gate. **Handoff:** P7-09/B08.

## Core Scope
6 Core findings; 0 incorporated; 6 controlled.
