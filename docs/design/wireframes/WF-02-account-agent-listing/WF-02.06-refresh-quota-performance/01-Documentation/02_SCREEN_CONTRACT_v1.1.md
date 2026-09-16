# WF-02.06 Screen Contract — v1.1

## AGT-013 Refresh Listing
Goal: let an authorized owner understand eligibility and perform Refresh.

Presentation:
- Listing identity and current lifecycle state.
- Configured daily allowance: default 5 successful Refreshes per Agent per Asia/Jakarta operational day, subject to configurable commercial allowance.
- Used today and Remaining today are distinct current-state values.
- One successful Refresh per Listing per operational day; no carry-forward; District-local repositioning; server-authoritative timestamp/order; failed Refresh consumes zero.
- Action result is shown only after authoritative response.

Authority: M03 owns action/enforcement; M14 owns configurable commercial allowance; M10 evaluates authorization. Refresh is not Edit/Publish/Republish/regional quota/new permission.

## AGT-016 Listing Quota / Capacity
Goal: understand current commercial capacity in the selected context.

Presentation explicitly separates:
- Total
- Allocated
- Used
- Available

Allocated must not be conflated with Used; Available must not be relabeled as a duplicate Remaining metric. M14 is authority. UI does not administer authorization and Organization membership alone does not create Organization quota.

## AGT-017 Listing Performance
Goal: understand Listing performance projections.

Presentation explicitly separates:
- Views
- CTA clicks
- Leads
- Freshness

CTA click is not treated as equivalent to Lead created. Screen remains projection-only and does not mutate Listing lifecycle, ownership, quota or authorization.
