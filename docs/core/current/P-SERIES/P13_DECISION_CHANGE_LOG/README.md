# RumahAgen R01/WF03 — P13_DECISION_CHANGE_LOG Decision + Change Log Full Rebuild v1.2

Purpose:
P13_DECISION_CHANGE_LOG freezes the material decision and change history accumulated through P1–P12_RECONCILIATION_EVIDENCE and provides one authoritative ledger for P14_PROJECT_MANIFEST onward.

This is a FULL VERSION REBUILD, not a patch or append.

Key correction versus P13_DECISION_CHANGE_LOG v1.1:
- 57/57 M01-M15 material change obligations are now explicit decision records.
- Decision→Change traceability is rebuilt.
- Provenance is restricted to the files uploaded in the current request.
- Core IP-00..IP-16 are explicitly represented in P13_DECISION_CHANGE_LOG scope.
- P13_DECISION_CHANGE_LOG v1.1 is superseded.

Boundary:
- P12_RECONCILIATION_EVIDENCE v1.1 remains last confirmed upstream baseline.
- Core v1.3 is immutable/read-only.
- P13_DECISION_CHANGE_LOG does not create new requirements.
- Physical/runtime/API/RLS claims remain evidence-gated.
- Historical STEP13 material in recursive archives is provenance only.

Outputs include Decision Register, Change Log, Decision→Change Traceability, P1–P12_RECONCILIATION_EVIDENCE Coverage, 57-row M01-M15 Obligation Coverage, M01-M15 Reconciliation, Core v1.3 Preservation, Core Scope Gap Check, Supersession Register, Controlled Residuals, Provenance Manifest, Finding Register, First/Second Deep Scan, Final Gate, SHA256 manifest and DOCX.
