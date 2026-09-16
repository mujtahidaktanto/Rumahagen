# WF-02.06 UX State / Accessibility Matrix — v1.1

| Screen | Ready | Loading | Empty | Error/Retry | Protected | Offline | Special |
|---|---|---|---|---|---|---|---|
| AGT-013 | ✓ | ✓ | N/A with eligibility/resource explanation | ✓ | ✓ | ✓ | Checking, Success, Allowance unavailable, Not eligible |
| AGT-016 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Context changed, Capacity reached |
| AGT-017 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No performance data distinguished from error |

Ready-state metric semantics are explicit: AGT-013 configured/used/remaining; AGT-016 total/allocated/used/available; AGT-017 views/CTA clicks/leads/freshness.

Mobile ready layouts use stacked metric cards where three/four columns would clip dynamic labels. Offline states never imply successful mutation.
