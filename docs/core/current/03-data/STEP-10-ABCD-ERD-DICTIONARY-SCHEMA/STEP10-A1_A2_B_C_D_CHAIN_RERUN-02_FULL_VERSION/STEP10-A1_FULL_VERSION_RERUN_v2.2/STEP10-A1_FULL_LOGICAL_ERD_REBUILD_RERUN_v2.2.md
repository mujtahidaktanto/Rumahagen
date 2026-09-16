# STEP10-A1 — FULL LOGICAL ERD REBUILD RERUN v2.2
## RumahAgen R01 / WF03

**Execution date:** 2026-09-04
**Execution mode:** Full Deep Scan / Whole-Version Rebuild / Latest Source Rerun
**Source boundary:** Uploaded files only; latest M01-M15 package `M01-M15 new recon(20260904-013253).zip` is included and used.
**Core v1.3:** IMMUTABLE
**Physical DB execution:** NOT PERFORMED
**Runtime/RLS verification:** NOT PERFORMED

## 1. Final Decision

# STEP10-A1 RERUN v2.2 = PASS — FULL VERSION REBUILT WITH ALL CONFIRMED FINDINGS

This rerun supersedes A1 v2.0 for the logical ERD baseline. It is a whole-version rebuild, not a patch/append. All prior valid Core detail and the 94-entity logical baseline are preserved, while the confirmed M03/M06 gaps identified in the current-source re-audit are integrated.

## 2. Locked Quantitative Baseline

| Control | v2.0 | Rerun v2.2 | Result |
|---|---:|---:|---|
| Logical entities | 94 | **94** | PASS |
| Relationship records | 147 | **149** | PASS |
| Logical attribute rows | 837 | **862** | PASS |
| Core physical tables | 86 | **86** | PASS / preserved |
| New logical entities | 8 | **8** | PASS |
| M01-M15 coverage | 15/15 | **15/15** | PASS |

## 3. Findings Integrated

### A1-RR-01 — M03 `LISTINGS.last_refreshed_at`
M03 v1.3 identifies `last_refreshed_at TIMESTAMPTZ NULL` as the required Listing freshness field. It was missing from A1 v2.0. The rerun now represents it as a logical augmentation. No SQL or migration is executed.

### A1-RR-02 — M06 complete Project field inventory
The latest M06 v1.5 Project inventory contains 41 fields. A1 v2.0 represented only 17. The rerun adds the missing 24: `area_keyword`, `bathrooms`, `bedrooms`, `building_area`, `carport_capacity`, `category`, `certificate_transferred`, `certificate_type`, `dispute_free_declared`, `district_id`, `electrical_power`, `extra_commission`, `floors`, `furnishing`, `imb_status`, `is_negotiable`, `land_area`, `latitude`, `longitude`, `price_unit`, `province_id`, `transaction_type`, `water_source`, `year_built`.

All are explicitly represented as `LOGICAL_AUGMENTATION` because current physical Core evidence does not establish these columns on `developer_projects`. Existing physical columns remain preserved.

### A1-RR-03 — M06 Project geography relationships
The new logical fields `province_id` and `district_id` create two source-supported logical references:
- `REF_PROVINCES → DEVELOPER_PROJECTS` 1:N
- `REF_DISTRICTS → DEVELOPER_PROJECTS` 1:N

These are logical relationships, not physical FK execution claims.

### A1-RR-04 — M06 Project Media constraint
Current Core physical `developer_project_media.type` still permits `photo`, `video`, `brochure`, `price_list`. M06 semantic truth restricts Project Media to photo/video and makes Marketing Kit the separate brochure/pricelist resource. The rerun therefore preserves the immutable Core physical detail while explicitly recording the semantic/physical conflict for downstream reconciliation. No Core table/column is deleted here.

### A1-RR-05 — latest source currentness
This rerun uses the latest uploaded M01-M15 source package `20260904-013253`, replacing the older 20260903 package used by the superseded A1/B baseline.

## 4. Entity Closure

The logical entity count remains **94**. No 95th entity was justified by the new findings. The eight confirmed logical additions remain:
1. EVENT_PROVIDER_BINDING
2. MARKETING_KIT
3. PERMISSION_PRESET
4. PERMISSION_PRESET_ITEM
5. USER_PERMISSION_PRESET
6. STATIC_PUBLIC_CONTENT
7. PUBLIC_ANNOUNCEMENT_PROMOTION
8. ORGANIZATION_DOCUMENT

## 5. Core Preservation

All 86 Core physical tables remain preserved. The rerun does not use the 86-table baseline as a ceiling on logical semantics, and it does not delete or replace valid Core detail. Where M06 semantic truth differs from a current physical constraint, the physical detail is retained and the conflict is explicitly bounded for downstream Dictionary/Schema reconciliation.

## 6. M01-M15 Boundary

- M01: KTP deferred flow remains profile/onboarding state.
- M02: visibility/CTA remain profile-state semantics.
- M03: Refresh remains M03 action authority; `last_refreshed_at` is now represented.
- M04: Partnership Learning Result remains reuse/no new entity; Session Completion remains distinct.
- M05: Guest Registration remains Event Registration augmentation; Event Provider Binding remains separate from M04 session provider binding.
- M06: Marketing Kit remains separate from Project Media; full v1.5 Project field inventory is now represented.
- M07: DBR/bank configuration reuses existing structures.
- M08: Dashboard remains projection; notifications remain existing communication entity.
- M09: configuration/audit/reconciliation reuse current structures.
- M10: exactly three Permission Preset entities remain.
- M11: Static Public Content and Public Announcement/Promotion remain distinct from M14 commercial Promotion.
- M12: Organization Document remains a new logical entity; Organization Settings remains an augmentation.
- M13: AI provider/BYOK reuses existing provider/connection entities.
- M14: Midtrans reuses payment_provider_results; Daily Refresh remains entitlement/quota semantics; Q01-Q66 remain M14.
- M15: Appeal/history remain process/history reuse and M15 does not absorb M14 Q01-Q66.

## 7. Physical / Runtime Boundary

Not executed or claimed: SQL migration, ALTER TABLE, physical new-table creation, physical FK creation, RLS, runtime authorization, provider failover, credential persistence, storage deployment, or production schema change.

## 8. Final Gate

### **STEP10-A1 RERUN v2.2 = PASS — FULL ATTRIBUTE-LEVEL LOGICAL ERD REBUILT**

**Entity baseline:** 94 — LOCKED
**Relationship baseline:** 149 — LOCKED FOR THIS RERUN
**Attribute baseline:** 864 — LOCKED FOR THIS RERUN
**Core physical baseline:** 86 — PRESERVED
**M01-M15 semantic coverage:** PASS
**Confirmed findings integrated:** 5/5
**Physical/runtime boundary:** PASS / downstream only

## 9. Downstream Controlled Items

1. Physical realization of the 24 M06 Project augmentations.
2. Physical realization of M03 `last_refreshed_at`.
3. Physical FK realization for M06 Project province/district if authorized downstream.
4. Reconciliation of `developer_project_media.type` physical CHECK against M06 semantic Project Media scope, without deleting valid Core detail prematurely.
5. Existing eight new logical entity physical realization and all prior downstream residuals from A1/A2.

## 10. Supersession

A1 v2.0 remains historical evidence only. **A1 RERUN v2.2 is the current logical ERD baseline for the next A2 validation.** STEP10-B v1.0 must not be treated as final against this rerun until it is rebuilt/reconciled from the v2.2 attribute and relationship baselines.

## 11. Integrity

Latest M01-M15 package SHA256: `91354375da7c57257a7c4ef7da0aae3e26fc832f424d55d78dde8956dc7a54d7`
Core v1.3 package SHA256: `7c491ce312a42f7d4debd77a4533a895dd35a71ad7464053c0bfe61639ba72e6`
A1 RERUN MMD SHA256: `99f262d130d230002147b64e00b66e3737b783745e0e4f0437f0a7acee5a1276`
A1 RERUN Attribute Register SHA256: `7b42ab22413e8fceb47540380fc4397fa6b3dea31078f481482be5108e7c8556`
A1 RERUN Relationship Matrix SHA256: `edfec1c3e4e193ac06fc2ce4b6a30e62e703936a348638bf45fa630bcc14de5f`


## RERUN-02 controlled correction

The two invalid rows `LEARNING_ACTIVITY_COMPLETIONS.OR` and `LEARNING_UNLOCK_PROGRESSIONS.OR` were removed from the logical attribute register because `OR` is a CHECK-expression token, not an attribute/physical column. All other A1 entities, attributes, relationships, findings, and controlled downstream items are preserved.

**Corrected attribute baseline: 862 valid logical attributes.**
