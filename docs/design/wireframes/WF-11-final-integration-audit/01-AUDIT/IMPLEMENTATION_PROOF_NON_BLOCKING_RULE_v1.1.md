# Implementation-Proof Non-Blocking Rule

WF-11 confirms the WF-00 rule:

Absence of physical DB proof, migration proof, API runtime proof, RLS proof, runtime authorization proof, integration proof, or production proof MUST NOT lock, hold, stop, or block wireframe execution.

Those are implementation/evidence statuses.

Only an unresolved:
- semantic contradiction,
- authority contradiction, or
- UX contradiction
may block a wireframe gate.

WF-11 therefore does not defer wireframe completion because implementation proof is missing.
