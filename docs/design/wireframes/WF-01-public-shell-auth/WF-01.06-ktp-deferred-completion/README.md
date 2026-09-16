# WF-01.06 — RumahAgen KTP Deferred + Completion v1.0

**Status: FULL VERSION / WIREFRAME EXECUTION**

Logical screen allocation:
- AUTH-03 — KTP Deferred Decision
- AUTH-04 — KTP Completion / Verification Document Submission

AUTH-04 uses a wizard/stepper for progressive disclosure. It remains one logical flow/screen allocation;
the stepper prevents a dense single-screen experience.

Locked semantic contract:
`OTP VERIFIED → ACCOUNT ACTIVE`
then KTP requirement is evaluated independently from RBAC.
- Complete now → AUTH-04.
- `ISI NANTI` → `DEFERRED / NOT_PROVIDED`, account remains ACTIVE.
- KTP is an eligibility/requirement condition, not an RBAC permission.
- KTP and verification documents are protected/private.
- `PENDING_REVIEW` is not inserted as the default Agent activation gate.

Physical/runtime evidence rule:
Missing database/API/RLS/runtime/production proof MUST NOT lock, hold, stop or block wireframe creation.
Only a genuine unresolved semantic/authority/UX contradiction may block the affected WIRE package.
