# WIRE-02.05 State Matrix

| Screen | Ready | Loading | Empty | Validation | Success | Error/Retry | Protected | Offline/Interrupted |
|---|---|---|---|---|---|---|---|---|
| AGT-011 | Yes | Yes | Yes | N/A | N/A (delegated to mutation destination) | Yes | Yes | N/A |
| AGT-012 | Yes | Yes | N/A | Yes | Yes | represented by save error/retry contract | Yes | Yes |
| AGT-014 | Yes | Yes | N/A | N/A | N/A (delegated to lifecycle result) | Yes | Yes | N/A |
| AGT-015 | Yes | Yes | N/A | Yes (confirmation/guard) | Yes | Yes | Yes | N/A |

State naming follows the source-required UX vocabulary. N/A means the state is not semantically applicable to that logical screen; it is not silently omitted.


### Media identity coverage
Ready/confirmation identity states for AGT-011, AGT-012, AGT-014 and AGT-015 include a visible cover/media component. When no unit photo exists in the source set, the component remains visible as an explicit no-source-photo placeholder.
