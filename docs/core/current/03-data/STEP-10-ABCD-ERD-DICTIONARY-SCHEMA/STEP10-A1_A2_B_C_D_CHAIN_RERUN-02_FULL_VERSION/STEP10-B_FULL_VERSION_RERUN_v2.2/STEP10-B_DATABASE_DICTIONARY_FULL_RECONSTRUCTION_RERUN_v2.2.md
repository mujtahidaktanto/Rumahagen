# STEP10-B RERUN — Database Dictionary Full Reconstruction & Synchronization v2.2

**RumahAgen R01 / WF03**  
**Execution date:** 2026-09-04  
**Execution mode:** Full Deep Scan / Whole-Version Reconstruction / Currentness Reconciliation  
**Core v1.3:** IMMUTABLE  
**Physical DB execution:** NOT PERFORMED  
**Runtime/RLS verification:** NOT PERFORMED

## 1. Final Gate

# **STEP10-B RERUN v2.2 = PASS — FULL DATABASE DICTIONARY REBUILT / RECONCILED**

The superseded STEP10-B v1.0 is not used as the current authority. The dictionary is reconstructed from the current **A1 RERUN v2.2 / A2 RERUN v2.2 baseline: 94 logical entities / 864 logical attributes / 149 relationships**, together with the latest M01–M15 package and immutable Core v1.3 physical corroboration.

## 2. Locked Current Baseline

| Metric | Current B RERUN v2.2 |
|---|---:|
| Logical entities | **94** |
| Logical attributes | **862** |
| Relationships | **149** |
| Relationship types | **138 CORE_PRESERVED_FK / 10 NEW_LOGICAL / 1 SEMANTIC_REFERENCE** |
| Current physical Core tables | **86** |
| Physical attribute corroborations | **764** |
| Logical augmentations | **33** |
| Logical-new-entity attributes | **65** |
| Confirmed new logical entities | **8** |
| M01–M15 semantic coverage | **15/15 PASS** |

A1/A2 explicitly lock 94 / 862 / 149 as the current rerun baseline. fileciteturn35file0L26-L41

## 3. Currentness / Authority

The entry authority is STEP10-A2 RERUN v2.2, which states that A1 RERUN v2.2 is the current logical ERD baseline and authorizes STEP10-B RERUN. It also explicitly states that B v1.0 is superseded because it used the prior A1 v2.0 baseline. fileciteturn35file0L143-L161

Current source lineage:
- A1 RERUN v2.2 package SHA256: `a231b4c99b6f97f35926704391bde4b154e2eb4b549200cc77e62b381bce9389`
- A2 RERUN v2.2 package SHA256: `1918c5cb31cf12796c58c0bbeb2342710fda74f8d9e7e4a44c853a49e07e2219`
- M01–M15 current package SHA256: `91354375da7c57257a7c4ef7da0aae3e26fc832f424d55d78dde8956dc7a54d7`
- Core v1.3 current package SHA256: `7c491ce312a42f7d4debd77a4533a895dd35a71ad7464053c0bfe61639ba72e6`
- PRE-00 current package SHA256: `f241d2cc281168a25767d938b954c3fd84ab9e51dbfeb072116449f2507b8751`

## 4. Reconstruction Method

1. Start from A1 RERUN v2.2 full attribute register and relationship matrix.
2. Validate A2 RERUN v2.2 as the entry gate.
3. Reconcile each of 94 logical entities against the current W4-01E 86-table physical baseline.
4. Reconcile all 862 logical attribute rows without dropping any current A1 row.
5. Preserve all 764 exact physical corroborations.
6. Carry all 33 logical augmentations as logical-only unless exact physical corroboration exists.
7. Preserve all 65 attributes belonging to the 8 new logical entities as logical-only until STEP10-C.
8. Reconcile all 149 relationships, preserving the semantic distinction for `QUOTA_USAGE → LISTINGS`.
9. Register every physical/semantic residual explicitly.
10. Do not execute SQL, migration, RLS, runtime authorization, provider failover, or physical table creation.

## 5. Attribute Closure

The current A1 register contains 864 unique logical entity/attribute rows. fileciteturn35file2L184-L190

The reconstruction closes the 25-row delta versus superseded B v1.0:
- **24** additional M06 `DEVELOPER_PROJECTS` fields;
- **1** M03 `LISTINGS.last_refreshed_at` field.

This changes the logical augmentation count from 8 to **33**, while the exact physical corroboration count remains **764** and logical-new-entity attribute count remains **65**.

## 6. M03 / M06 Current Corrections

### M03 — `LISTINGS.last_refreshed_at`
Represented as a logical augmentation with `TIMESTAMPTZ` and freshness semantics. A2 confirms this field is present and validated. fileciteturn35file0L64-L74

No physical column creation is claimed in B RERUN.

### M06 — `DEVELOPER_PROJECTS`
The current logical inventory is **41 fields**. A2 confirms all 41 fields are represented, including the previously missing 24 fields. fileciteturn35file0L74-L85

The 24 additions are retained as logical augmentations and handed downstream for physical realization.

### M06 geography
The logical relationships `REF_PROVINCES → DEVELOPER_PROJECTS (province_id)` and `REF_DISTRICTS → DEVELOPER_PROJECTS (district_id)` remain logical `NEW_LOGICAL` relationships, not physical FK execution claims. fileciteturn35file0L58-L62

### M06 Project Media conflict
Core physical detail is preserved. The logical M06 truth remains photo/video only; brochure/pricelist remain `MARKETING_KIT`. A2 classifies this as controlled downstream, not a blocker. fileciteturn35file0L87-L88

## 7. Eight New Logical Entities

The following remain logical entities with no current physical table in the 86-table Core baseline:
1. `EVENT_PROVIDER_BINDING`
2. `MARKETING_KIT`
3. `PERMISSION_PRESET`
4. `PERMISSION_PRESET_ITEM`
5. `USER_PERMISSION_PRESET`
6. `STATIC_PUBLIC_CONTENT`
7. `PUBLIC_ANNOUNCEMENT_PROMOTION`
8. `ORGANIZATION_DOCUMENT`

A2 confirms 8/8 new logical entities and states no 95th entity is justified by current evidence. fileciteturn35file0L93-L105

## 8. Controlled Physical / Semantic Reconciliation Register

The rerun keeps these items explicit and downstream:
- M05 Guest Registration: physical `event_registrations.agent_id` remains NOT NULL with physical uniqueness implications, while logical Guest registration does not require canonical user identity.
- M05 Event Provider Binding: no current physical table; provider vocabulary, credential persistence, active-binding multiplicity/history and runtime failover remain downstream.
- M06 developer `company_logo` / `description`: no exact current physical columns.
- M10 three Permission Preset entities: no current physical tables.
- M11 Static Public Content / Public Announcement/Promotion: no current physical tables.
- M12 Organization Document: no current physical table.
- M12 Organization Settings: augmentation of `ORGANIZATIONS`; no dedicated physical table is claimed.
- M14 `daily_refresh_allowance`: logical commercial entitlement/quota semantic; no exact current physical column is claimed.
- M14 `QUOTA_USAGE → LISTINGS`: semantic/polymorphic reference, not a physical FK.
- M10 preset target role = account role: semantic invariant, not DB-enforced at B.

## 9. Relationship Closure

Current A1 RERUN v2.2 contains **149 relationship records**:
- 138 `CORE_PRESERVED_FK`
- 10 `NEW_LOGICAL`
- 1 `SEMANTIC_REFERENCE`

Cardinality closure remains:
- 145 `1:N`
- 2 `1:1`
- 1 `0..1`
- 1 `N:1*`

A2 confirms the 149 relationship baseline and explicitly preserves the semantic/non-FK treatment of `QUOTA_USAGE → LISTINGS`. fileciteturn35file0L43-L62

## 10. Core Preservation / Physical Boundary

The current Core physical baseline remains **86 tables**. A1/A2 explicitly state that Core v1.3 is immutable and that physical execution, migration, ALTER TABLE, new-table creation, physical FK creation and runtime/RLS work are downstream. fileciteturn35file0L125-L141

B RERUN therefore does **not** modify Core v1.3 or execute any physical database operation.

## 11. Final Decision

### **PASS**

**STEP10-B RERUN v2.2 is CLOSED as the current Database Dictionary baseline.**

The dictionary is now synchronized to **A1/A2 RERUN v2.2 = 94 / 862 / 149**.

**STEP10-B v1.0 = SUPERSEDED / NON-AUTHORITY.**

### Next authorized step
**STEP10-C — Database Schema Reconstruction / Physical Schema Decision & Synchronization**, using this B RERUN dictionary as its direct predecessor.

STEP10-C must resolve the explicitly registered physical deltas without back-projecting physical changes into the logical ERD.
