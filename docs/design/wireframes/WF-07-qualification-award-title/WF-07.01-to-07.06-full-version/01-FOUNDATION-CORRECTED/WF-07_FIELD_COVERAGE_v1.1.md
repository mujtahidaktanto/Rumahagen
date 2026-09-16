# WF-07 FIELD COVERAGE v1.1

## Corrected M15 field-level UX coverage
- title_authority_scopes: id / title_definition_id are represented by context; scope_type / scope_reference / status are explicit in ADM-M15-001; timestamps remain system/audit fields.
- awarding_path_rules: path_version + rule_version association is explicit in ADM-M15-005.
- awarding_conditions: condition_type, operator, expected_value, sequence_no and group context are explicit.
- qualification_evidence: evidence_type, source_type, source_reference, evidence_payload, captured_at are explicit.
- qualification_evaluations: result, path version, rule version, evaluator type/reference, evaluation time and provenance are explicit.
- award_instances: title, path version, rule version, evaluation, status, issued_at, expires_at, revoked_at, restored_at and historical snapshot are explicit across detail/lifecycle/provenance surfaces.
- title_presentations: presentation type, active state and display order are represented through presentation controls.

## Create Listing boundary
The required M03 Create Listing fields remain entirely outside WF-07. They belong to WIRE-02/M03 and are not duplicated here.
