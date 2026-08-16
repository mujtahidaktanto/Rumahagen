# TECH-29B-03A — Regional Reference Data Assessment v1.0

## Status
**PASS WITH ONE PHYSICAL-SCHEMA DECISION REQUIRED BEFORE FULL IMPORT**

## Source
`wilayah_kepmendagri_2025.xlsx` supplied by the Owner on 2026-08-16.

Source columns:
- KODE DESA
- NAMA KELURAHAN/DESA/DESA ADAT
- KODE KECAMATAN
- NAMA KECAMATAN
- KODE KABUPATEN
- NAMA KABUPATEN
- KODE PROVINSI
- NAMA PROVINSI
- TIPE DESA(KELURAHAN, DESA, DESA ADAT)

## Source integrity observed
- 83,762 source rows.
- 38 provinces.
- 514 kabupaten/kota.
- 7,285 kecamatan.
- 83,762 desa/kelurahan/desa adat records.
- Type distribution: DESA 75,252; KELURAHAN 8,496; DESA ADAT 14.

## Canonical physical mapping available today
The current GitHub migration `0004_region_reference.sql` defines:
- `ref_provinces(id, code, name)`
- `ref_cities(id, province_id, code, name, type)` where city type is `kota|kabupaten`
- `ref_districts(id, city_id, code, name)`
- `ref_villages(id, district_id, code, name, postal_code)`

The migration does not define a village-level type attribute. The supplied source does.

## Current Development DB state
The reference tables were checked before import and contain no regional rows. No regional import has been executed by this assessment.

## Decision boundary
Do NOT silently discard `TIPE DESA(KELURAHAN, DESA, DESA ADAT)`.
Do NOT add a new `village_type` column without an approved downstream schema decision.
Do NOT import the full dataset while pretending the source's type dimension is represented physically.

## Recommended next step
Search the canonical project corpus for an existing approved semantic/physical definition of village-level type. If no authoritative definition exists, raise a controlled downstream schema decision:

**REG-OD-01 — Should `ref_villages` persist the source village-level type as `DESA | KELURAHAN | DESA ADAT`?**

Options:
- A — Yes: evolve `ref_villages` with an explicit canonical type field and then import all source data with type preserved.
- B — No: keep the current physical schema unchanged and explicitly document that source type is retained only in source/provenance, not as a queryable database attribute.

No listing/profile/DBR fixture import should depend on silently choosing A or B.

## Dependency impact
Regional reference data is required by the existing Listing schema. `developer_projects.city_id` also depends on `ref_cities`. Therefore this is a shared-kernel data readiness gate, not a Learning Session-only concern.

## Governance rule
This assessment does not reopen approved architecture decisions and does not authorize production migration. It is a Development data-readiness artifact for TECH-29B.
