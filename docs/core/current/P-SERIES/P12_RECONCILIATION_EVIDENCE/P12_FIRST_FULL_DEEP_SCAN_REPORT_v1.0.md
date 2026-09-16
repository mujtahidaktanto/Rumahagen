# P12_RECONCILIATION_EVIDENCE FULL DEEP SCAN REPORT — v1.0

## Scope
Ten uploaded ZIP packages were recursively scanned, including nested ZIP archives.

## Scan totals
- Top-level uploads: 10
- Recursive extracted files: 3,507
- Unique SHA256 content groups: 1,754
- Duplicate files beyond first: 1,753

## Current-source integrity checks
- P11_AI_CONTEXT 15-module scope rows: 15/15
- P11_AI_CONTEXT WP context contracts: 62/62
- P11_AI_CONTEXT Core finding routes: 223/223
- P11_AI_CONTEXT dependency routes: 65/65
- P11_AI_CONTEXT P10_AI_BLUEPRINT section routes: 34/34
- P11_AI_CONTEXT operational controls: 14/14
- P11_AI_CONTEXT residual carry-forward: 47/47
- P11_AI_CONTEXT Core routes with invalid/mismatched WP: 0
- Dependency self loops: 0
- Dependency duplicate rows: 0
- Core preserved YES: 223
- Core modified NO: 223

## Stage evidence audit
Current P9 WP runtime claim distribution: {'NOT_VERIFIED': 62}
Current P9 Core runtime status distribution: {'EVIDENCE_GATED': 223}
Current P11_AI_CONTEXT Core runtime status distribution: {'EVIDENCE_GATED': 223}

These states are retained as documentary provenance. They are not converted into a P12_RECONCILIATION_EVIDENCE physical/runtime gate.

## Findings
No material documentary contradiction was found.
Three controlled boundaries are carried/reconciled:
1. Governance Checklist v2.5 standalone source boundary.
2. Historical downstream STEP12 physical/runtime artifacts inside recursive provenance.
3. Applicability boundary between Core implementation-stage STOP rules and the current P12_RECONCILIATION_EVIDENCE documentary stage.

## Result
PASS WITH CONTROLLED RESIDUALS.
