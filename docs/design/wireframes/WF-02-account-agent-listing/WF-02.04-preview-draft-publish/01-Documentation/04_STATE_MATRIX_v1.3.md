# WF-02.04 State Matrix v1.3

| State | AGT-008 Preview | AGT-009 Save Draft | AGT-010 Publish |
|---|---|---|---|
| Ready | Visual + cover identity | Visual + cover identity | Visual/Confirm + cover identity |
| Loading | Visual + cover loading placeholder | Visual + cover loading placeholder | Visual + cover loading placeholder |
| Empty | Visual + explicit no-current-listing/no-cover treatment | Visual + explicit no-current-listing/no-cover treatment | Visual + explicit no-publishable-listing/no-cover treatment |
| Validation-blocked | Visual | N/A / delegated | Visual |
| Error / Retry | Visual + cover/error placeholder | Visual + cover/error placeholder | Visual + cover/error placeholder |
| Protected / Unauthorized | Visual + unavailable cover treatment | Visual + unavailable cover treatment | Visual + unavailable cover treatment |
| Offline / Interrupted | Visual + unavailable/stale-safe cover treatment | Visual + unavailable/stale-safe cover treatment | Visual where applicable + unavailable/stale-safe cover treatment |
| Saving | N/A / delegated | Visual + cover identity | N/A |
| Publishing | N/A / delegated | N/A | Visual + cover identity |
| Eligibility / quota checking | N/A / delegated | N/A | Visual + cover identity |
| Success | N/A for Preview mutation; delegated | Visual: Draft persisted + cover identity | Visual: Published confirmed + cover identity |
| Pending Review | N/A — normal Listing publication has no approval gate | N/A | N/A — not introduced |
| Rejected | N/A / delegated to authoritative Listing state | N/A / delegated | N/A / delegated to authoritative failure state |
| Expired | N/A / delegated to later lifecycle screen | N/A / delegated to later lifecycle screen | N/A / delegated to later lifecycle screen |

## Dirty-state protection
AGT-009 includes an interaction state for unsaved changes. It is not a fourth logical screen. The user can Cancel, Leave without saving, or Save Draft.

## Authoritative outcome rule
Mutation success is displayed only after authoritative confirmation: AGT-009 Draft persisted; AGT-010 Published confirmed.

## Media/cover rule
No source unit/property photo is invented. The visual component is a semantic placeholder until an authoritative cover asset exists.
