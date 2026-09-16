# WIRE-02.05 Screen Contract

| ID | Goal | State/behavior focus |
|---|---|---|
| AGT-011 | Manage a published Listing's current state and authorized actions | Published, loading, empty, error/retry, protected |
| AGT-012 | Edit an owned Listing while preserving immutable post-publish identity fields | Ready, loading, validation, success, protected, offline/interrupted |
| AGT-014 | Understand expiration and continue through the governed revision path | Expired, loading, error/retry, protected |
| AGT-015 | Perform a governed archive/delete action safely | Ready, loading, confirmation, success, error/retry, protected |

Each row is one logical screen. Visual state variants are not additional logical screens.


## Media identity correction
Applicable Listing identity states expose a cover/media component. The correction does not add a logical screen and does not expand into WIRE-02.06 media administration.
