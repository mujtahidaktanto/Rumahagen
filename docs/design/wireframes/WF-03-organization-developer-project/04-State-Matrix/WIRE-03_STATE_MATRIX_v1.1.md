# WIRE-03 State Matrix v1.1

Each logical screen has Desktop and Mobile representations. State coverage is preserved from v1.0 and corrected form semantics are applied to ready/validation/error/success/loading/denied states where applicable.

| State | Meaning | Rule |
|---|---|---|
| ready | normal usable state | fields/actions available according to semantic authority |
| validation | client-side semantic validation | required fields identified; no invented limits |
| loading | data/action pending | no authoritative success assumed |
| error | authoritative operation/load failed | retry; no optimistic success |
| success | authoritative response confirmed | success only after authoritative response |
| denied | authorization restriction | UI may explain restriction; M10 remains enforcement |

Long forms use vertical scrolling. Mobile uses stacked fields/cards rather than compressed desktop grids.
