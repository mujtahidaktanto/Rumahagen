# WIRE-02.04 v1.3 — Full Deep-Scan Scope Reconciliation

## Correction basis
This full rebuild closes **F-0204-04 — Listing Media/Cover Visual Representation Incomplete**, identified during direct inspection of WIRE-02.04 v1.2.

The finding is a UX-contract/visual representation issue. It is not a missing Core field, scope issue, or physical/runtime evidence issue.

## Source discipline
Only the uploaded RumahAgen source set and the uploaded WIRE-02.04 v1.2 package were used. No web or external reference was used.

## Scope lock
Exactly three logical screens remain: AGT-008 Listing Preview, AGT-009 Save Draft, AGT-010 Publish Listing. State variants and interaction overlays do not create additional logical screens. No WIRE-02.05 scope is absorbed.

## Cover/media correction
All AGT-008/009/010 visual states now include a compact **Listing identity / cover slot**. The component is visual identity, not a new gallery-management screen.

The uploaded source set contains no actual unit/property photo asset. Therefore the wireframe deliberately uses a neutral placeholder labeled **No source unit photo available**. It does not fabricate or import a property image. When an authoritative cover exists at runtime, this reserved component is the intended location for it.

Desktop uses a compact media thumbnail with identity metadata. Mobile uses a stacked responsive cover component so content does not overflow horizontally and remains vertically scrollable.

## Non-blocking implementation evidence
Absence of physical DB proof, migration proof, API runtime proof, RLS proof, runtime authorization proof, integration proof, or production proof MUST NOT lock/HOLD/STOP/block WIRE-00 or later WIRE work. `NOT VERIFIED` is evidence status, not a wireframe prohibition. Only unresolved semantic/authority/UX contradiction may block.
