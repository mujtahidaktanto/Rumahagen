# WF-01.05 — RumahAgen Authentication v1.1
**Status:** FULL VERSION / CORRECTED / READY FOR WF-01.06

This package preserves the four assigned authentication screens and strengthens explicit M01 state
traceability. KTP Deferred/Completion remains in WF-01.06.

Canonical activation:
REGISTER → OTP VERIFIED → ACCOUNT ACTIVE

KTP is optional at activation and is not an RBAC permission. No default Pending Review activation gate exists.

## Evidence boundary — LOCKED
Wireframe execution is not gated by physical/runtime proof. Missing database proof, API runtime proof,
RLS proof, runtime authorization proof, provider/integration proof, migration proof or production proof
MUST NOT lock, HOLD, STOP or block this WIRE package.

Only an unresolved semantic, authority or UX-contract contradiction may block the affected WIRE package.
`NOT VERIFIED` is an evidence status, not a visual-design prohibition. Exact physical IDs/endpoints are
not invented when they are not evidenced.
