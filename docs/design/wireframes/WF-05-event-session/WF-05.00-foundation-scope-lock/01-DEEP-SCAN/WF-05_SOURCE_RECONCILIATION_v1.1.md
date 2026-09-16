# WF-05 Source Reconciliation v1.1 — Corrected

## Deep scan
Seven uploaded files were scanned recursively, including ZIP-in-ZIP:
- ZIP containers/layers: 118
- archive members: 2,934
- corrupt/unreadable records: 0

## Authority
- M05 = Event / Calendar / Event Registration.
- M04 = Learning Session / Session Enrollment / Session access / provider / attendance / completion / evidence.
- M10 = authorization.
- M08 = notification/projection.
- M11 = public discovery/measurement.
- M14 = commercial entitlement/quota.
- M15 = qualification/award/title.

## WF-00 compliance
WF-05 inherits the integrated shell, novice-first decomposition, collapsible navigation, vertical scrolling, responsive/accessibility/state rules, coverage-by-obligation and physical/runtime non-blocking rule.

## Corrected M05 coverage
The earlier foundation omitted an explicit Event Provider Configuration/Binding surface and did not explicitly inventory the Core Event field semantics/lifecycle timing. These are corrected in v1.1 with ADM-EVT-005, the Event Field Semantic UX Matrix, and M05 Obligation Coverage Matrix.

## Checklist traceability residual
The uploaded checklist Traceability sheet maps M07 → WIRE-05 and labels it Event/session. The same uploaded Core authority chain identifies M05 as Event/Registration and M07 as DBR, while WF-00 allocates M05 Event/Registration/Session to WIRE-05. Therefore the checklist row is stale/inconsistent. It is a source-traceability residual, not a semantic authority blocker.

## Create Listing
The 13 Core-required Create Listing fields are not WF-05 requirements. They are WIRE-02 requirements. This is intentional and correct. WF-05 must only consume contextual relationships (e.g. Project) where source-defined; it must not duplicate Listing creation inputs.
