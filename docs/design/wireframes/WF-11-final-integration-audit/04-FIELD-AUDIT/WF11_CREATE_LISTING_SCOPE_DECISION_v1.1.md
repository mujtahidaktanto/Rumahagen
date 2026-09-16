# WF-11 Create Listing Scope Decision

**Decision: PASS — audited, not duplicated.**

The 13 Core-required Create Listing fields belong to WIRE-02/M03. WF-11 must not create duplicate Create Listing controls.

WF-11 verifies:
- all 13 exist in the authoritative WIRE-02/M03 design corpus;
- their semantic/dependency/requiredness/conditionality/UX behavior is consistent;
- WIRE-10 shared states can be applied to them;
- cross-module handoffs do not transfer Listing authority.

A requirement to make all 13 fields literally appear inside a WF-11 screen would be a scope violation and authority inversion.
