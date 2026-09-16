# P15_PROJECT_CURRENT_STATE FIRST FULL DEEP SCAN — v1.1 correction pass
Scope: uploaded files only.
Uploaded archives: 13
Recursive instances: 2776
Nested ZIP instances: 83
Corrupt: 0
Unique SHA256 variants: 1132
Duplicate-content groups: 455

Material findings found:
- P15_PROJECT_CURRENT_STATE v1.0 did not populate exact M01–M15 artifact/version/SHA identity.
- P15_PROJECT_CURRENT_STATE v1.0 omitted the uploaded P7 archive from the provenance/deep-scan source set.
- P15_PROJECT_CURRENT_STATE v1.0 did not explicitly snapshot Core IP-00..IP-16 and IP-16's verification boundary.

All three are corrected in this full rebuild. Core v1.3 remains immutable. The 47 controlled residuals remain evidence-gated and are not falsely closed.
