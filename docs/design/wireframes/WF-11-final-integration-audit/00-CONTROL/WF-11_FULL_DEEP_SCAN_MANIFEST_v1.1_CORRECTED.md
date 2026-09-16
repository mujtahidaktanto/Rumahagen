# WF-11 Full Deep Scan Manifest v1.1 CORRECTED

Source-only audit. No web or external reference.

## Actual recursive scan
- Top-level ZIP inputs: 4? (WF-11, WF-10, WF Wire, Core) = 4
- XLSX: 1
- Recursive ZIP archives discovered: 125
- ZIP entries: 3345
- Extracted/inspected file instances: 3313
- Text-bearing files: 2314
- Text characters: 45752917
- Maximum nested ZIP depth: 2
- Extraction errors: 0
- Checklist sheets: 5/5

This replaces any earlier hard-coded scan counts. The audit counts above were computed directly from the uploaded bytes in this execution.

## Source precedence
1. Current Core successor for product/semantic requirements.
2. WF-00 Integrated Core Wireframe Foundation for wireframe execution rules and canonical module→WIRE allocation.
3. WIRE packages in WF Wire and current WF-10/WF-11 packages for actual design coverage.
4. Integrated Core Wireframe Checklist for gate/scope/traceability checks; stale rows are findings, not silent authority changes.

## Critical WF-11 boundary
WF-11 is an integration audit/gate. It is NOT a domain form package.
The 13 Core-required Create Listing fields are NOT supposed to be physically duplicated into WF-11. Their semantic/dependency/requiredness/conditionality/UX behavior are audited here against their authoritative WIRE-02/M03 implementation and state patterns.
