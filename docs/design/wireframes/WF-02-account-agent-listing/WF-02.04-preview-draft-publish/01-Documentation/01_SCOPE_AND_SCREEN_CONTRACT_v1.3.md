# WIRE-02.04 Scope and Screen Contract v1.3

| Screen | Goal | In scope | Out of scope |
|---|---|---|---|
| AGT-008 | Review complete Listing before next action | canonical review, validation summary, Listing identity/cover slot, stage edit hand-offs, Preview states, explicit global-state applicability mapping | detailed Save Draft / Publish mutation flows |
| AGT-009 | Save current Listing as Draft | draft persistence intent, Listing identity/cover slot, saving state, authoritative success/error, empty/protected/offline states, dirty-state navigation protection | publish, refresh, quota administration |
| AGT-010 | Publish Listing | publication confirmation, Listing identity/cover slot, authoritative validation/block, publication eligibility/quota check, publishing, success, failure/retry, protected/empty handling | refresh, expiry, archive/delete, quota administration, public SEO/discovery |

Exactly 3 logical screens. State variants, overlays, and confirmation interactions do not count as additional logical screens.
