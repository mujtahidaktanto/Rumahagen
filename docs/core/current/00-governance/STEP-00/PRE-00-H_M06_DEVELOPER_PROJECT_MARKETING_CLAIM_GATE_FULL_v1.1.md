# RUMAHAGEN WF03

# PRE-00-H --- M06 DEVELOPER / PROJECT / MARKETING / CLAIM GATE

## Full Deep Scan, Semantic Conflict Resolution & Core Delta Reconciliation --- v1.0

**Status:** PASS --- LOCKED\
**Gate:** PRE-00-H\
**Primary authority:** M06 Full Rebuild v1.5\
**Supporting authority:** M06 QIR Resolution v1.0 + M06 Core Impact
Analysis v1.0\
**Core baseline:** Core v1.3 --- immutable during PRE-00\
**Execution mode:** Non-Destructive Core-Superset Synchronization\
**Physical/runtime proof:** NOT REQUIRED\
**Core modification during this gate:** NONE\
**External/web sources:** NONE\
**Output type:** Full Version --- v1.0 --- not patch / not append

------------------------------------------------------------------------

# 0.1 CLEAR INTEGRATION DECISION --- M03 / M06

The following decisions are explicitly LOCKED to prevent interpretation
differences during later Core synchronization:

1.  **Developer Project Listing fields MUST use the same canonical
    Listing field contract as M03.** Listing-relevant Project fields
    must use the same canonical M03 Listing field names and semantic
    meanings. M06 must not create a parallel or differently named
    Listing field vocabulary for the transfer target. This makes the
    Approved Claim → M03 Listing initialization deterministic and safe.
    This is a compatibility/source-contract rule only; M03 remains
    Listing authority.

2.  **Project Media and Marketing Kit MUST follow the latest M06 Rebuild
    v1.5.** Project Media = photo/video. Brochure/pricelist = Marketing
    Kit. Older or conflicting interpretations are not current authority.
    Any broader existing Core physical media allowance remains a
    downstream physical reconciliation item.

3.  **Project Claim MUST follow the latest M06 Rebuild v1.5.** Claim
    lifecycle, approval authority, Approval Claim/Record semantics, and
    Approved Claim → Agent-owned Listing initialization follow M06 v1.5.
    Project existence alone cannot authorize an Agent-owned M03 Listing.

4.  **M03 remains the sole Listing authority.** M06 provides the
    approved Project source data and Claim-gated initialization
    contract. M03 owns Listing lifecycle, Listing action semantics, and
    resulting Listing truth. Approved Claim does not grant Developer
    Partner ordinary Listing Create/Update/Publish/Refresh authority.

5.  **No duplicate Listing schema or authority is created.** M06 does
    not redefine M03 Listing fields and does not create a second Claim
    authority.

------------------------------------------------------------------------

# 1. PURPOSE

PRE-00-H verifies that M06 remains the authoritative semantic owner for:

-   Developer;
-   Developer Project;
-   Project Media;
-   Marketing Kit;
-   Project Claim;
-   Approval Claim / Approval Record;
-   Approved-Agent visibility;
-   Project → Listing initialization contract.

The gate reconciles M06 v1.5 against the immutable Core v1.3 baseline
while preserving all valid Core detail.

The gate specifically verifies:

1.  Developer `company_logo`;
2.  free-text Developer `description` = "Tentang Developer";
3.  complete Developer Project semantic source contract;
4.  M03-compatible Project fields and canonical field names;
5.  Project Media = photo/video only;
6.  Marketing Kit = separate brochure/pricelist resource;
7.  Marketing Kit role/action authority;
8.  Project Claim lifecycle and approval authority;
9.  Approval Claim semantics;
10. Approved Claim → Agent-owned M03 Listing initialization;
11. M03 remains Listing lifecycle authority;
12. M06 ↔ M03/M10/M09/M15 boundaries;
13. Core delta classification;
14. physical/runtime separation.

The gate is a semantic/documentary reconciliation gate. It does not
perform migrations, API execution, RLS deployment, storage deployment,
or runtime verification.

------------------------------------------------------------------------

# 2. GOVERNING BASIS

The locked PRE-00 governance requires:

-   Core v1.3 is the existing foundation/minimum-detail set.
-   Recon does not replace, delete, overwrite, or reduce valid Core
    detail.
-   Differences are classified.
-   True semantic contradictions are `RECONCILE`.
-   Missing valid capability is `ADD-NEW` or `AUGMENT`.
-   Physical/API/RLS/runtime gaps are `CONTROLLED`.
-   Explicit non-propagation is recorded where authority must remain
    elsewhere.
-   Historical/superseded material is not promoted.
-   Core Detail Loss = 0 except an explicitly resolved semantic
    contradiction.
-   Semantic completeness does not transfer authority.
-   Physical/runtime proof is never inferred from semantic evidence.

The governing guide explicitly defines M06 as:

> Developer / Developer Project / Marketing Kit / Claim semantics; add
> missing capability without replacing Core entities.

The protected M06 ↔ M03 boundary is:

> Developer Project can provide Listing-compatible source fields.
> Compatibility is not Listing ownership.

**Canonical field rule:** every Listing-relevant Project field intended
for transfer MUST use the same canonical Listing field name and semantic
meaning defined by M03. This rule exists specifically to make the
post-Approved-Claim Project → M03 Listing initialization deterministic
and safe.

M06 supplies the source contract; M03 remains the Listing authority.

The M10 boundary remains:

> M10 owns authorization semantics; domains own business semantics.

The M06 guardrail therefore permits M06 to define business semantics and
actor intent without creating a second authorization engine.

------------------------------------------------------------------------

# 3. CURRENT M06 AUTHORITY

## 3.1 Current module authority

Current M06 authority:

`RUMAHAGEN_WF03_M06_FULL_REBUILD_CONTROLLED_v1.5_FULL_VERSION.zip`

Canonical semantic artifact:

`07_M06_FULL_REBUILD_CONTROLLED_v1.5.md`

Supporting current correction artifact:

`06_M06_FULL_REBUILD_CORRECTION_DECISIONS_v1.5.md`

Current M06 QIR:

`RUMAHAGEN_WF03_M06_QIR_RESOLUTION_CONTROLLED_v1.0_FULL_VERSION.zip`

Current M06 Core Impact Analysis:

`RUMAHAGEN_WF03_M06_CORE_IMPACT_ANALYSIS_FULL_v1.0_CONTROLLED.zip`

The M06 v1.5 package explicitly retains the complete v1.4 package as
historical retained baseline and states that valid v1.4 content is not
deleted.

## 3.2 Version interpretation

M06 v1.5 is the current semantic/module authority.

M06 v1.4 and earlier material is retained for provenance/lineage only.

The existence of older M06 documents inside nested provenance packages
does not create parallel current authority.

------------------------------------------------------------------------

# 4. SUPPLIED SOURCE SCOPE

The execution used the supplied M01--M15 Recon package and the supplied
PRE-00 governance/gate artifacts.

The M06 v1.5 package was recursively inspected, including:

-   v1.5 canonical rebuild;
-   v1.5 correction decisions;
-   v1.5 Project field inventory;
-   v1.5 M03 field mapping;
-   v1.5 question inventory;
-   v1.5 permission matrix;
-   v1.5 Marketing Kit action authority matrix;
-   v1.5 QA/preparation;
-   retained v1.4/v1.3/v1.2/v1.1/v1.0 provenance;
-   M06 Core Impact Analysis;
-   M06 propagation matrix;
-   M06 conflict register;
-   M06 required-change register;
-   M06 authority mapping;
-   M06 dependency impact;
-   M06 integration readiness;
-   relevant Core functional, architecture, database, API, RBAC/RLS, SEO
    and dependency material embedded in the supplied Recon package.

No external/web source was introduced.

------------------------------------------------------------------------

# 5. M06 DOMAIN AUTHORITY MODEL

M06 owns the semantic business model for:

``` text
M06
├── Developer
├── Developer Project
├── Project Media
├── Marketing Kit
├── Project Claim
├── Approval Claim / Approval Record
├── Approved-Agent visibility
└── Project → Listing initialization contract
```

M06 does not own:

-   identity/authentication → M01;
-   authorization/RBAC/RLS → M10;
-   Organization/Membership → M12;
-   Listing lifecycle/action semantics → M03;
-   Learning → M04;
-   Qualification/Evidence → M15;
-   commercial entitlement → M14;
-   audit authority → M09;
-   public discovery/SEO/measurement → M11.

This is the required authority separation.

------------------------------------------------------------------------

# 6. M06 v1.5 CANONICAL CORRECTIONS

M06 v1.5 explicitly locks the following corrections:

1.  `Project.land_area` → M03 `Listing.land_area`.
2.  `Project.building_area` → M03 `Listing.building_area`.
3.  `meta_description` is the sole canonical initial source for M03
    Listing `description`.
4.  `meta_title` is the canonical initial source for M03 Listing
    title/header.
5.  There is no Project `description` field.
6.  Project semantic schema is expanded to satisfy the reconciled M03
    source contract, using the same canonical Listing field names and
    meanings as M03 for Listing-transfer fields.
7.  Project → M03 Listing initialization uses the canonical M03 Listing
    field contract; M06 does not create a parallel Listing schema.
8.  Project Media is photo/video only.
9.  Brochure/pricelist are Marketing Kit artifacts.
10. Developer `company_logo` and free-text `description` ("Tentang
    Developer") are semantic LOCKED.
11. Claim lifecycle is semantically resolved; physical status
    representation remains downstream.
12. Approval Claim is semantically resolved; physical persistence
    remains downstream.
13. Marketing Kit action authority is explicitly normalized by role.
14. Claim approval authority is explicitly normalized.
15. Developer Project ownership or Claim approval does not grant
    ordinary M03 Listing Create/Update/Publish/Refresh authority.
16. Semantic → physical → runtime separation remains mandatory.

------------------------------------------------------------------------

# 7. DEVELOPER --- FIELD CONTRACT

## 7.1 Company logo

M06 v1.5 locks:

`company_logo`

as a semantic Developer field.

The field belongs to Developer semantics, not Listing semantics.

Its absence from the current Core physical `developer_partners`
reference is a downstream physical/data-model delta.

Classification:

**ADD-NEW / UPDATE REQUIRED**

## 7.2 Tentang Developer

M06 v1.5 locks:

`description`

as the free-text Developer description field representing:

**"Tentang Developer"**

This is a Developer-level field.

It must not be confused with:

`Project.meta_description`

which is the canonical initial source for Agent Listing description.

Classification:

**ADD-NEW / UPDATE REQUIRED**

## 7.3 Developer ownership

M06 remains Developer/Developer Project semantic authority.

Developer-side fields are not silently converted into Listing-owned
master data.

------------------------------------------------------------------------

# 8. DEVELOPER PROJECT --- COMPLETE SEMANTIC SOURCE CONTRACT

The v1.5 Project inventory expands the Project semantic schema to
satisfy the reconciled M03 source contract.

The current semantic Project inventory includes, at minimum:

### Identity / administrative

-   `id`
-   Developer relation / ownership
-   `name`
-   `slug`
-   `status`
-   timestamps

### Listing-compatible content

-   `category`
-   `transaction_type`
-   `price_unit`
-   `is_negotiable`
-   `price_max`
-   `property_type`
-   `bedrooms`
-   `bathrooms`
-   `land_area`
-   `building_area`
-   `floors`
-   `carport_capacity`
-   `electrical_power`
-   `water_source`
-   `furnishing`
-   `year_built`
-   `certificate_type`
-   `imb_status`
-   `certificate_transferred`
-   `dispute_free_declared`
-   `unit_availability`

### Geographic source

-   `location`
-   `province_id`
-   `city_id`
-   `district_id`
-   `area_keyword`
-   `latitude`
-   `longitude`

### Commercial/project context

-   `commission_scheme`
-   `extra_commission`
-   `is_exclusive_by_region`

### Canonical description/title source

-   `meta_title`
-   `meta_description`

No Project `description` field is introduced.

The complete field inventory remains subject to the M06 v1.5 source
inventory and M03 mapping artifacts; this gate does not replace those
source artifacts with a reduced list.

Classification:

**AUGMENT / ADD-NEW**

------------------------------------------------------------------------

# 9. M06 ↔ M03 FIELD-NAME RECONCILIATION

The authoritative M03 v1.3 field names are preserved.

## Canonical mapping

``` text
Project.land_area
        ↓
M03 Listing.land_area
```

and:

``` text
Project.building_area
        ↓
M03 Listing.building_area
```

Older M06 wording using:

``` text
land_size
building_size
```

is not the current canonical M03 mapping.

The v1.5 correction explicitly normalizes these names against
authoritative M03 evidence.

Classification:

**MATCH / NORMALIZED**

No destructive Core deletion is implied; legacy wording is retained as
provenance where required.

------------------------------------------------------------------------

# 10. PROJECT TITLE / DESCRIPTION SOURCE CONTRACT

## Title

``` text
Project.meta_title
        ↓
M03 Listing title/header
```

`meta_title` is the canonical initial source.

## Description

``` text
Project.meta_description
        ↓
M03 Listing description
```

`meta_description` is the sole canonical initial source for Listing
description.

There is:

``` text
NO Project.description
```

## Important authority boundary

After initialization:

``` text
Agent Listing edits
        ↓
modify Agent-owned Listing
        ↓
DO NOT mutate official Project source
```

Therefore the Project remains authoritative as the initial source, while
the resulting Listing remains an M03-owned resource.

Classification:

**PRESERVE / AUGMENT**

------------------------------------------------------------------------

# 11. PROJECT MEDIA --- CANONICAL SEMANTIC BOUNDARY

M06 v1.5 locks:

`developer_project_media`

as official Project Media for:

-   photo;
-   video.

Multiple uploads are permitted by the M06 semantic model.

The canonical semantic boundary is:

``` text
Project Media
├── photo
└── video
```

It is not:

``` text
Project Media
├── photo
├── video
├── brochure
└── price_list
```

------------------------------------------------------------------------

# 12. PROJECT MEDIA vs MARKETING KIT CONFLICT

The Core physical schema currently permits:

``` text
photo
video
brochure
price_list
```

for the physical `developer_project_media.type`.

M06 v1.5 explicitly resolves the semantic boundary as:

``` text
developer_project_media
→ photo/video only
```

and:

``` text
brochure/pricelist
→ Marketing Kit
```

This is a genuine semantic boundary contradiction between the Core
physical allowance and current M06 semantic ownership.

However, the physical Core allowance is not silently deleted during
PRE-00-H.

It is classified as a downstream physical reconciliation delta.

### Classification

**RECONCILE / CONTROLLED**

### Decision

Future Core synchronization must preserve:

-   Project Media resource;
-   existing valid media architecture;
-   photo/video behavior;

while reconciling the semantic meaning so brochure/pricelist are not
treated as canonical M06 Project Media.

No unrelated Core media detail is removed.

------------------------------------------------------------------------

# 13. MARKETING KIT --- NEW SEPARATE RESOURCE

M06 v1.5 establishes Marketing Kit as a distinct semantic resource.

Canonical content:

``` text
Marketing Kit
├── PDF brochure
└── PDF pricelist
```

Marketing Kit is not Project Media.

It is not Listing Media.

It is not generic document storage with unrestricted document types.

The Core scan did not evidence a canonical physical `marketing_kit`
entity.

Therefore this is a valid missing capability/resource contract.

Classification:

**ADD-NEW / UPDATE REQUIRED**

The physical schema/storage/API/RLS realization remains downstream.

------------------------------------------------------------------------

# 14. MARKETING KIT ACTION AUTHORITY

The explicit v1.5 action authority is:

  Role                  Create   Upload   Update   Delete   View   Download
  ------------------- -------- -------- -------- -------- ------ ----------
  Developer Partner        OWN      OWN      OWN      OWN    OWN        OWN
  Admin                    ALL      ALL      ALL      ALL    ALL        ALL
  Superadmin               ALL      ALL      ALL      ALL    ALL        ALL
  Manager                 NONE     NONE     NONE     NONE    YES        YES
  Agent                   NONE     NONE     NONE     NONE    YES        YES
  Buyer                   NONE     NONE     NONE     NONE   NONE       NONE
  Partner                 NONE     NONE     NONE     NONE   NONE       NONE

For Agent/Manager:

``` text
View / Download
→ applicable eligibility / Claim context
```

The v1.5 dedicated action matrix does not delete the legacy 24-row
permission matrix. It adds explicit CRUD granularity.

Classification:

**AUGMENT / ADD-NEW**

------------------------------------------------------------------------

# 15. M06 ↔ M10 AUTHORIZATION BOUNDARY

M06 defines business intent and resource semantics.

M10 remains authorization authority.

Therefore:

``` text
M06
→ defines:
   - resource
   - business capability
   - intended actor scope
   - ownership condition

M10
→ resolves:
   - Role
   - Role Permission
   - Permission Preset
   - Capability
   - Scope
   - Condition
   - Ownership
   - Organization
   - RLS
```

M06 must not create:

-   a second permission engine;
-   a bypass around M10;
-   a new role solely to support Marketing Kit;
-   a new authorization semantics independent of M10.

The M06 permission matrix is therefore an input to later M10
synchronization, not a replacement for M10 governance.

Classification:

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 16. PROJECT LIFECYCLE

M06 v1.5 preserves Project status semantics:

``` text
coming_soon
active
sold_out
inactive
```

Project Publish/Activate is moderation-gated.

Ordinary Project Update must not silently imply authority to
activate/publish.

This is a lifecycle boundary:

``` text
Project Update
≠
Project Publish / Activate
```

The semantic decision is locked even though physical/API/RLS transition
enforcement remains downstream.

Classification:

**PRESERVE / CONTROLLED**

------------------------------------------------------------------------

# 17. PROJECT CLAIM --- SEMANTIC LIFECYCLE

M06 v1.5 resolves Project Claim semantics.

The semantic lifecycle includes the following conceptual states/events:

``` text
PENDING
   ↓
APPROVED
   ↓
REVOKED

PENDING
   ↓
REJECTED

PENDING
   ↓
WITHDRAWN
```

The claim is a relationship between:

``` text
Agent
↔ Developer Project
```

and is subject to authorization and lifecycle rules.

Physical Core representation is currently insufficiently expressive and
remains downstream.

Classification:

**AUGMENT / ADD-NEW / CONTROLLED**

------------------------------------------------------------------------

# 18. PROJECT CLAIM --- ACTOR AUTHORITY

## Agent

Agent may:

-   create own claim;
-   view own claim;
-   withdraw own pending claim where lifecycle permits.

## Developer Partner

Developer Partner may, for own projects:

-   view related claims;
-   review;
-   approve;
-   reject;
-   revoke/manage where lifecycle permits.

## Platform moderation

Admin/Manager/Superadmin retain moderation governance/override according
to M06 semantics and M10 authorization governance.

This does not turn Developer Partner into a global platform
administrator.

Classification:

**AUGMENT / LOCK**

------------------------------------------------------------------------

# 19. CLAIM APPROVAL vs LISTING AUTHORITY

A critical negative rule is locked:

> Developer Project ownership or Claim approval does not grant Developer
> Partner ordinary Listing Create/Update/Publish/Refresh authority.

Therefore:

``` text
Developer Project ownership
        ≠
M03 Listing ownership

Claim approval
        ≠
M03 Listing authorization

Claim approval
        ≠
Listing Publish authority

Claim approval
        ≠
Listing Refresh authority
```

M03 remains Listing lifecycle/action authority.

This is a mandatory cross-module invariant.

Classification:

**PRESERVE / LOCK**

------------------------------------------------------------------------

# 20. APPROVED CLAIM → AGENT-OWNED LISTING INITIALIZATION

The M06 semantic contract is:

``` text
Agent
   ↓
Approved Project Claim
   ↓
Project → Listing initialization
   ↓
Agent-owned M03 Personal Listing
```

The resulting Listing is Agent-owned.

M06 supplies the initial Project source data.

M03 owns the resulting Listing lifecycle and actions.

------------------------------------------------------------------------

# 21. APPROVED CLAIM HARD-GATE

Project existence alone is not sufficient to authorize Listing creation
from Project.

The canonical semantic gate is:

``` text
POST /listings/from-project/{project_id}
```

must require:

``` text
Approved M06 Claim
+
claim belongs to requesting Agent
```

Project existence alone must not create an M03 Listing Draft.

This prevents:

``` text
Project exists
        ↓
arbitrary Agent creates Listing
```

The correct model is:

``` text
Project exists
        +
Approved claim belonging to Agent
        ↓
initialize Agent-owned Listing
```

Classification:

**ADD-NEW / RECONCILE DEPENDENCY**

Physical API/RLS enforcement remains downstream.

------------------------------------------------------------------------

# 22. PROJECT DATA → LISTING SOURCE BOUNDARY

The v1.5 field mapping establishes:

### Project-sourced fields

Examples include:

-   category;
-   transaction_type;
-   price;
-   price_unit;
-   negotiability;
-   location;
-   province;
-   city;
-   district;
-   area keyword;
-   latitude;
-   longitude;
-   property_type;
-   bedrooms;
-   bathrooms;
-   land_area;
-   building_area;
-   floors;
-   carport_capacity;
-   electrical_power;
-   water_source;
-   furnishing;
-   year_built;
-   certificate_type;
-   certificate_transferred;
-   imb_status;
-   dispute_free_declared;
-   commission fields where applicable;
-   media inherited from Project Media.

### System-generated Listing fields

-   Listing slug;
-   Listing lifecycle/state;
-   Listing analytics/provenance.

### Agent-owned fields

-   `whatsapp_number`;
-   Agent Listing marketing edits;
-   Listing-specific marketing media additions where permitted.

The exact M03 field mapping remains governed by the v1.5 mapping
artifact and authoritative M03 v1.3 contract.

------------------------------------------------------------------------

# 23. PROJECT MEDIA → LISTING MEDIA BOUNDARY

Approved Claim permits Project Media to be inherited into the resulting
Listing media context.

But:

``` text
Project Media
≠
Listing Media ownership
```

The source remains Developer Project media.

The resulting Listing media remains under M03 Listing semantics.

No authority leakage is permitted.

Classification:

**CONTROLLED / DEPENDENCY**

------------------------------------------------------------------------

# 24. AGENT LISTING EDITS DO NOT MUTATE PROJECT

After Listing initialization:

``` text
Agent modifies Listing title/description/media
        ↓
Agent-owned Listing changes
        ↓
Official Project remains unchanged
```

This protects Developer-owned official Project truth.

The canonical initial source relationship does not create bidirectional
synchronization.

Classification:

**PRESERVE / LOCK**

------------------------------------------------------------------------

# 25. APPROVAL CLAIM / APPROVAL RECORD

M06 v1.5 semantically resolves Approval Claim as an artifact generated
as a consequence of claim approval.

Canonical semantic behavior:

``` text
Claim approved
      ↓
Approval Record generated
      ↓
Agent + Developer receive View/Download access
```

The Approval Record is semantically an immutable evidence artifact.

The v1.5 permission matrix explicitly states:

`Approval Record.Generate`

is:

**automatic consequence of approval; not a human RBAC permission.**

This is important.

No human role receives a generic:

``` text
Generate Approval Record
```

permission merely to operate the artifact lifecycle.

Classification:

**ADD-NEW / LOCK**

------------------------------------------------------------------------

# 26. APPROVAL RECORD PHYSICAL BOUNDARY

Core does not currently evidence a canonical physical approval-record
entity containing the full semantic artifact lifecycle.

The downstream physical requirements include, where appropriate:

-   immutable artifact reference;
-   generation event;
-   generated timestamp;
-   hash/version provenance;
-   retrieval behavior;
-   storage lifecycle;
-   relationship to approved claim.

These are downstream implementation concerns.

No runtime generation PASS is claimed.

Classification:

**CONTROLLED**

------------------------------------------------------------------------

# 27. APPROVED-AGENT VISIBILITY

M06 v1.5 preserves the approved-agent visibility rule:

``` text
Approved Agent
→ Name
→ Public Profile only
```

This is not equivalent to:

``` text
Approved Agent
→ access to private identity/legal documents
```

The M02 public/private boundary remains controlling for profile
visibility.

M06 does not redefine M02 identity/public visibility authority.

Classification:

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 28. NON-EXCLUSIVITY

M06 explicitly preserves Developer non-exclusivity.

No MVP territory/project exclusivity is created.

A project may be marketed by multiple eligible Agents subject to
Claim/eligibility rules.

This aligns with Core functional/ERD evidence.

Classification:

**MATCH / PRESERVE**

------------------------------------------------------------------------

# 29. M06 ↔ M03 BOUNDARY AUDIT

  -----------------------------------------------------------------------
  Concern                 Authority               M06 decision
  ----------------------- ----------------------- -----------------------
  Project semantic source M06                     Owns
  data                                            

  Project Media           M06                     Owns

  Claim                   M06                     Owns

  Approved Claim          M06                     Owns

  Listing initialization  M06                     Provides
  source                                          

  Listing ownership after M03/Agent ownership     Preserves
  initialization          model                   

  Listing lifecycle       M03                     M06 does not take

  Listing Publish         M03                     M06 does not take

  Listing ordinary Update M03                     M06 does not take

  Listing Refresh         M03                     M06 does not take

  Listing commercial      M14 where applicable    M06 does not take
  entitlement                                     
  -----------------------------------------------------------------------

**Result: PASS.**

------------------------------------------------------------------------

# 30. M06 ↔ M10 BOUNDARY AUDIT

M06 defines resource/capability/business conditions.

M10 remains the authorization authority.

M06 does not introduce a new role or authorization engine.

The Marketing Kit action matrix is an M06 business/resource
authorization requirement that must later be represented through M10
governance.

**Result: PASS.**

------------------------------------------------------------------------

# 31. M06 ↔ M09 BOUNDARY AUDIT

M09 remains AuditLog authority.

M06 claim approval/rejection/revocation and relevant Project changes may
require audit provenance.

M06 does not create a parallel audit authority.

Approval Record is an evidence artifact, not an independent audit
authority.

M09 remains the audit provenance boundary.

**Result: PASS.**

------------------------------------------------------------------------

# 32. M06 ↔ M15 BOUNDARY AUDIT

M15 remains Qualification/Evidence authority.

M06 Approval Claim is evidence of a Project Claim approval relationship.

It must not be interpreted as M15 qualification evidence.

M06 does not:

-   create qualification status;
-   create M15 credential authority;
-   redefine Learning evidence;
-   absorb M15 qualification lifecycle.

Conversely, M15 must not redefine M06 Project Claim semantics merely
because both involve evidence artifacts.

Classification:

**NO-PROPAGATION / AUTHORITY-SEPARATED**

**Result: PASS.**

------------------------------------------------------------------------

# 33. M06 ↔ M04 BOUNDARY

Although not a primary PRE-00-H target, the boundary is checked to
prevent authority leakage.

M06 does not own Learning.

If Developer Learning or learning-related evidence is later referenced,
M04 remains Learning authority and M15 remains Qualification/Evidence
authority where applicable.

No M06 learning authority is created.

**Result: PASS.**

------------------------------------------------------------------------

# 34. M06 ↔ M14 BOUNDARY

M06 commission fields and project commercial context do not transfer
commercial entitlement authority to M06.

M14 remains commercial authority for:

-   subscription;
-   add-on;
-   promotion;
-   order;
-   payment;
-   entitlement;
-   quota.

M06 does not create commercial allowance semantics merely because
Project data contains commission information.

**Result: PASS.**

------------------------------------------------------------------------

# 35. M06 CORE IMPACT MATRIX

The supplied M06 Core Impact Analysis contains 18 impact records.

  ------------------------------------------------------------------------
  ID                Finding            Classification    Gate Decision
  ----------------- ------------------ ----------------- -----------------
  M06-CI-001        Project semantic   UPDATE REQUIRED   AUGMENT / ADD-NEW
                    schema expansion                     

  M06-CI-002        land_area naming   MATCH /           PRESERVE
                                       NORMALIZED        

  M06-CI-003        building_area      MATCH /           PRESERVE
                    naming             NORMALIZED        

  M06-CI-004        meta_description → MATCH             PRESERVE
                    Listing                              
                    description                          

  M06-CI-005        meta_title →       MATCH             PRESERVE
                    Listing                              
                    title/header                         

  M06-CI-006        company_logo +     NEW / UPDATE      ADD-NEW
                    Tentang Developer  REQUIRED          

  M06-CI-007        Project Media      CONFLICT / UPDATE RECONCILE
                    boundary           REQUIRED          

  M06-CI-008        Marketing Kit      NEW / UPDATE      ADD-NEW
                    resource           REQUIRED          

  M06-CI-009        Marketing Kit CRUD UPDATE REQUIRED   AUGMENT / ADD-NEW
                    authorization                        

  M06-CI-010        Claim lifecycle    UPDATE REQUIRED   AUGMENT /
                    state                                CONTROLLED
                    representation                       

  M06-CI-011        Claim approval     UPDATE REQUIRED   AUGMENT
                    authority                            

  M06-CI-012        Approval Claim     NEW / UPDATE      ADD-NEW /
                    artifact           REQUIRED          CONTROLLED

  M06-CI-013        Developer Project  MATCH / CONTROL   PRESERVE
                    ownership ≠                          
                    Listing authority                    

  M06-CI-014        Approved Claim →   UPDATE REQUIRED / ADD-NEW /
                    Agent-owned        DEPENDENCY        RECONCILE
                    Listing                              

  M06-CI-015        Project Media vs   CONTROLLED /      CONTROLLED
                    Listing media      DEPENDENCY        

  M06-CI-016        Physical/runtime   CONTROLLED        CONTROLLED
                    separation                           

  M06-CI-017        Existing Core      MATCH / REVIEW    PRESERVE /
                    developer module                     AUGMENT
                    CRUD                                 

  M06-CI-018        Non-exclusivity    MATCH             PRESERVE
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# 36. M06 CORE CONFLICT REGISTER

The current M06 Core Conflict Register identifies four principal
semantic/physical boundary deltas:

## M06-CI-007 --- Project Media boundary

Core physical allowance:

``` text
photo
video
brochure
price_list
```

M06 semantic authority:

``` text
photo
video
```

Decision:

**RECONCILE semantic boundary; retain physical difference as downstream
controlled delta.**

## M06-CI-006 --- Developer fields

Core physical reference lacks:

-   `company_logo`;
-   free-text Developer `description`.

Decision:

**ADD-NEW / UPDATE REQUIRED**

## M06-CI-008 --- Marketing Kit

No canonical physical Marketing Kit entity was evidenced.

Decision:

**ADD-NEW**

## M06-CI-010 / CI-011 / CI-012 --- Claim and Approval Record

Core physical representation does not fully evidence:

-   claim lifecycle;
-   moderation fields;
-   Approval Record artifact persistence.

Decision:

**AUGMENT / ADD-NEW / CONTROLLED**

These are not reasons to block semantic M06 closure.

------------------------------------------------------------------------

# 37. PRIOR DEEP-SCAN PHYSICAL FINDINGS --- RE-CLASSIFICATION

Earlier deep-scan evidence identified several M06 physical/API/RLS
findings:

### M06-OLD-01

Developer Project Create/Update API may expose broader platform-operator
authority than the M06 ownership model.

Required downstream action:

-   reconcile API authorization with M06 ownership/scope;
-   preserve Superadmin bypass where applicable;
-   do not treat legacy global management as canonical Developer Project
    authority.

Classification in PRE-00-H:

**CONTROLLED**

It is not a semantic blocker.

### M06-OLD-02

`agent_project_claims` physical lifecycle is incomplete.

Classification:

**CONTROLLED**

### M06-OLD-03

Claim moderation RLS lifecycle is incomplete.

Classification:

**CONTROLLED**

### M06-OLD-04

Approval Record physical storage/generation is insufficiently evidenced.

Classification:

**CONTROLLED**

### M06-P0/P1-01

Project Publish/Activate physical moderation transition is not fully
evidenced.

Classification:

**CONTROLLED**

### M06-P0-02

Generic Project Update could potentially leak status-transition
authority.

Classification:

**CONTROLLED**

### M06-P0/P1-03

Project → Listing creation must be hard-gated by an Approved Claim
belonging to the requesting Agent.

Classification:

**SEMANTIC RULE LOCKED + PHYSICAL ENFORCEMENT CONTROLLED**

These findings do not justify claiming runtime PASS.

------------------------------------------------------------------------

# 38. CORE DETAIL PRESERVATION AUDIT

The following Core detail is explicitly protected:

-   existing Developer entity;
-   existing Project entity;
-   existing Project Media architecture;
-   existing Claim entity;
-   existing Listing relationship through `developer_project_id`;
-   existing Developer CRUD functional detail;
-   existing Project/Claim UI detail;
-   existing M03 Listing authority;
-   existing M10 authorization infrastructure;
-   existing M09 audit infrastructure;
-   existing M11 discovery detail;
-   existing non-exclusivity;
-   existing media pipeline;
-   existing technical architecture;
-   existing database structure where not contradictory;
-   existing valid API contracts;
-   unrelated Core functional/UI/technical details.

The following are not authorized for deletion:

-   Core Developer fields unrelated to M06;
-   Core Project fields;
-   Core Project Media detail;
-   Core Claim detail;
-   existing Listing relationship;
-   existing platform operator capabilities.

Only genuinely contradictory semantic interpretation is reconciled.

**Result: PASS.**

------------------------------------------------------------------------

# 39. NO SILENT REPLACEMENT / DELETION AUDIT

No Core v1.3 file is modified by PRE-00-H.

No Core entity is replaced.

No Core entity is deleted.

No legacy M06 detail is silently discarded.

M06 v1.5 itself retains prior M06 versions under retained baseline
directories.

The 24-row legacy M06 permission matrix remains preserved; the dedicated
Marketing Kit action matrix adds explicit role/action granularity.

**Result: PASS.**

------------------------------------------------------------------------

# 40. HISTORICAL / DUPLICATE ARTIFACT AUDIT

Nested M06 packages contain repeated v1.4/v1.3/v1.2/v1.1/v1.0 artifacts.

These are provenance/lineage.

Current authority is:

``` text
M06 v1.5
```

No older artifact is promoted above v1.5.

The separate M06 QIR and Core Impact Analysis are supporting
resolution/provenance artifacts and do not replace the M06 semantic
authority.

**Result: PASS.**

------------------------------------------------------------------------

# 41. AUTHORITY INVERSION AUDIT

  Domain                    Authority   M06 behavior
  ------------------------- ----------- ---------------------------------------
  Identity/authentication   M01         Consumes
  Authorization             M10         Consumes / follows
  Developer                 M06         Owns
  Developer Project         M06         Owns
  Project Media             M06         Owns
  Marketing Kit             M06         Owns semantic resource/action intent
  Project Claim             M06         Owns
  Approval Claim            M06         Owns semantic artifact contract
  Listing                   M03         M06 initializes only
  Listing Refresh           M03         M06 cannot invoke as authority
  Audit                     M09         M06 uses boundary
  Organization              M12         M06 consumes context where applicable
  Learning                  M04         M06 does not own
  Qualification/Evidence    M15         M06 does not redefine
  Commercial entitlement    M14         M06 does not own

**Result: PASS.**

------------------------------------------------------------------------

# 42. SEMANTIC vs PHYSICAL/RUNTIME AUDIT

M06 semantic decisions can be locked from documentary authority.

The following remain downstream:

-   Developer physical schema additions;
-   Project physical schema additions;
-   Project Media type constraint implementation;
-   Marketing Kit table/storage;
-   Marketing Kit API;
-   Marketing Kit RLS;
-   Claim physical lifecycle columns;
-   Claim moderation RLS;
-   Approval Record storage/generation;
-   Project Publish/Activate transition enforcement;
-   Approved Claim hard-gate enforcement;
-   runtime Listing initialization;
-   staging/runtime QA;
-   production authorization.

No runtime PASS is claimed.

**Result: PASS.**

------------------------------------------------------------------------

# 43. REQUIRED DOWNSTREAM CORE DELTA REGISTER

## RECONCILE

### M06-DELTA-001 --- Project Media semantic boundary

``` text
Project Media
→ photo/video only

Marketing Kit
→ brochure/pricelist
```

The physical Core allowance remains a downstream reconciliation item.

## ADD-NEW / AUGMENT

### M06-DELTA-002

Developer:

``` text
company_logo
description = Tentang Developer
```

### M06-DELTA-003

Expand Project semantic source contract to include reconciled
M03-required fields.

### M06-DELTA-004

Preserve canonical:

``` text
land_area
building_area
meta_title
meta_description
```

### M06-DELTA-005

Establish separate Marketing Kit resource.

### M06-DELTA-006

Propagate Marketing Kit role/action authority.

### M06-DELTA-007

Represent Claim semantic lifecycle and moderation authority.

### M06-DELTA-008

Represent Approval Claim / Approval Record semantic artifact.

### M06-DELTA-009

Hard-gate Project → Listing initialization on an Approved Claim
belonging to the requesting Agent.

### M06-DELTA-010

Preserve M03 Listing authority and negative authority rule.

## CONTROLLED

-   physical schema;
-   API enforcement;
-   RLS;
-   artifact storage;
-   runtime generation;
-   status-transition enforcement;
-   Claim transaction integrity;
-   Listing initialization implementation.

------------------------------------------------------------------------

# 44. NO-PROPAGATION REGISTER

The following must **not** be propagated from M06 as authority takeover:

1.  M06 does not become Listing lifecycle authority.
2.  M06 does not become Listing Refresh authority.
3.  M06 does not become platform authorization authority.
4.  M06 does not become audit authority.
5.  M06 does not become Organization/Membership authority.
6.  M06 does not become Learning authority.
7.  M06 does not become Qualification/Evidence authority.
8.  M06 does not become commercial entitlement authority.
9.  M06 does not create a new RBAC role merely for Marketing Kit.
10. Claim approval does not grant Developer Partner ordinary Listing
    Create/Update/Publish/Refresh authority.

------------------------------------------------------------------------

# 45. PRE-00-H CHECKLIST

  ---------------------------------------------------------------------
  Checklist item                     Status
  ---------------------------------- ----------------------------------
  Current M06 authority identified   PASS

  M06 v1.5 recognized as current     PASS
  authority                          

  Historical M06 artifacts retained  PASS
  as provenance only                 

  Developer company_logo verified    PASS / LOCKED

  Developer "Tentang Developer"      PASS / LOCKED
  verified                           

  Project semantic schema expansion  PASS
  verified                           

  M03 land_area naming reconciled    PASS / LOCKED

  M03 building_area naming           PASS / LOCKED
  reconciled                         

  meta_title source verified         PASS

  meta_description sole Listing      PASS
  description source verified        

  Project.description excluded       PASS / LOCKED

  Project Media photo/video-only     PASS / LOCKED
  boundary verified                  

  Brochure/pricelist separated into  PASS / LOCKED
  Marketing Kit                      

  Marketing Kit separate resource    PASS
  verified                           

  Marketing Kit role/action matrix   PASS / LOCKED
  verified                           

  Developer Partner Marketing Kit    PASS
  OWN CRUD                           

  Admin Marketing Kit ALL            PASS

  Superadmin Marketing Kit ALL       PASS

  Manager Marketing Kit              PASS
  View/Download only                 

  Agent Marketing Kit View/Download  PASS
  only                               

  Buyer Marketing Kit NONE           PASS

  Partner Marketing Kit NONE         PASS

  Claim lifecycle semantically       PASS
  resolved                           

  Agent claim create/withdraw        PASS
  boundary verified                  

  Developer own-project claim        PASS
  review/approve/reject verified     

  Admin/Manager/Superadmin           PASS
  moderation governance verified     

  Approval Claim semantic artifact   PASS
  verified                           

  Approval Record generation =       PASS / LOCKED
  automatic consequence, not human   
  permission                         

  Approved Claim → Agent-owned       PASS / LOCKED
  Listing initialization verified    

  Approved Claim hard-gate           PASS
  identified                         

  Project existence alone cannot     PASS / LOCKED
  authorize Listing initialization   

  M03 remains Listing authority      PASS / LOCKED

  M03 Listing Refresh authority      PASS
  remains outside M06                

  M06 ↔ M10 authorization boundary   PASS
  preserved                          

  M06 ↔ M09 audit boundary preserved PASS

  M06 ↔ M15 qualification/evidence   PASS
  boundary preserved                 

  M06 ↔ M04 Learning boundary        PASS
  preserved                          

  M06 ↔ M14 commercial boundary      PASS
  preserved                          

  Non-exclusivity preserved          PASS

  Core existing entities preserved   PASS

  No silent Core deletion/overwrite  PASS

  Physical/runtime proof claimed     NO

  Blocking semantic M06 conflict     NONE
  remaining                          
  ---------------------------------------------------------------------

------------------------------------------------------------------------

# 46. GATE DECISION

## PRE-00-H STATUS: PASS --- LOCKED

M06 Developer / Project / Marketing / Claim semantics are internally
coherent and authority-safe.

The canonical M06 model is:

``` text
DEVELOPER
├── company_logo
└── description = “Tentang Developer”

DEVELOPER PROJECT
├── canonical M03-compatible source fields
├── meta_title
├── meta_description
├── geographic source
├── property/listing source fields
├── Project Media
│   ├── photo
│   └── video
└── Marketing Kit
    ├── brochure PDF
    └── pricelist PDF

PROJECT CLAIM
├── Agent creates own claim
├── Developer Partner reviews own-project claims
├── Approve / Reject
├── Agent may withdraw pending claim
├── Admin / Manager / Superadmin moderation governance
└── Approval Record generated as consequence of approval

APPROVED CLAIM
        ↓
PROJECT → LISTING INITIALIZATION
        ↓
AGENT-OWNED M03 LISTING
        ↓
M03 OWNS LISTING LIFECYCLE
```

------------------------------------------------------------------------

# 47. RESOLVED SEMANTIC CONFLICT

The primary M06/Core semantic boundary conflict is:

``` text
CORE PHYSICAL ALLOWANCE:
developer_project_media
→ photo / video / brochure / price_list

M06 SEMANTIC AUTHORITY:
developer_project_media
→ photo / video only

Marketing Kit
→ brochure / pricelist
```

Resolution:

**M06 semantic boundary wins.**

The existing Core physical allowance is not silently deleted during
PRE-00-H. It remains a controlled downstream physical reconciliation
item.

This preserves the non-destructive integration principle.

------------------------------------------------------------------------

# 48. CORE SYNCHRONIZATION DECISION

The later Core synchronization shall follow:

``` text
Core v1.3
+
M06 valid semantic/detail delta
+
M06/Core conflict resolution
→
Integrated Core candidate
```

The M06 delta is not a replacement package.

The later synchronization must:

### Preserve

-   existing Developer entity;
-   existing Project entity;
-   existing Claim entity;
-   existing Listing relationship;
-   existing functional/UI/API detail that remains valid;
-   M03 Listing authority;
-   M10 authorization;
-   M09 audit;
-   unrelated Core detail.

### Augment

-   Project source contract;
-   Developer fields;
-   Marketing Kit action granularity;
-   Claim semantic detail;
-   Approval Claim detail.

### Add new

-   Marketing Kit resource;
-   Approval Record semantic artifact;
-   Approved Claim hard-gate for Project → Listing initialization where
    missing.

### Reconcile

-   Project Media semantic type boundary.

### Controlled

-   physical schema;
-   API;
-   RLS;
-   artifact storage;
-   runtime.

### No propagation

-   Listing authority takeover;
-   authorization takeover;
-   audit takeover;
-   Learning takeover;
-   Qualification takeover;
-   commercial entitlement takeover;
-   new RBAC role for Marketing Kit.

------------------------------------------------------------------------

# 49. RE-ENTRY ASSESSMENT

No PRE-00-H re-entry is required at this time.

Reason:

-   M06 v1.5 current authority is established;
-   M06/Core impact analysis exists;
-   the principal semantic boundary conflict is identified;
-   the conflict has an explicit resolution;
-   Developer fields are locked;
-   Project/M03 mapping is reconciled;
-   Project Media/Marketing Kit boundary is explicit;
-   Claim lifecycle and approval authority are explicit;
-   Approved Claim → Agent-owned Listing initialization is explicit;
-   M03 Listing authority is protected;
-   M10/M09/M15/M04/M14 boundaries remain intact;
-   physical/runtime gaps are classified downstream rather than
    incorrectly converted into semantic blockers.

If later evidence introduces a new semantic contradiction, create a
dynamic sub-step:

`PRE-00-H-1`, `PRE-00-H-2`, etc.

Do not renumber the main gate.

The parent gate must be reopened/blocked if the new evidence affects its
locked decision.

------------------------------------------------------------------------

# 50. CHANGE-CONTROL COMPLIANCE

This gate complies with the locked change-control model:

-   no existing PRE-00 step was renumbered;
-   no previous gate was overwritten;
-   no Core v1.3 file was modified;
-   no historical artifact was promoted;
-   no Core detail was silently removed;
-   the true Project Media semantic conflict was explicitly classified;
-   physical/runtime findings were not converted into semantic proof;
-   authority boundaries were explicitly audited;
-   all valid M06 deltas have a downstream treatment;
-   no unsupported runtime claim was introduced.

------------------------------------------------------------------------

# 51. FINAL LOCKED STATEMENT

**PRE-00-H --- M06 Developer / Project / Marketing / Claim Gate v1.0 =
PASS / LOCKED.**

The durable M06 authority model is:

``` text
M06
├── Developer
│   ├── company_logo
│   └── description = “Tentang Developer”
│
├── Developer Project
│   ├── M03-compatible source contract
│   ├── land_area
│   ├── building_area
│   ├── meta_title
│   ├── meta_description
│   ├── location
│   ├── property data
│   └── geographic source
│
├── Project Media
│   ├── photo
│   └── video
│
├── Marketing Kit
│   ├── brochure PDF
│   └── pricelist PDF
│
├── Project Claim
│   ├── Pending
│   ├── Approved
│   ├── Rejected
│   ├── Withdrawn
│   └── Revoked / managed lifecycle
│
├── Approval Claim / Record
│   └── automatic consequence of approval
│
└── Project → Listing
    ├── Approved Claim required
    ├── resulting Listing = Agent-owned
    └── M03 remains Listing authority
```

Critical authority invariant:

``` text
M06 Project ownership
        ≠
Listing ownership

Claim approval
        ≠
Listing authorization

M06
        ≠
M03 Listing authority

M06
        ≠
M10 authorization authority

M06
        ≠
M09 audit authority

M06
        ≠
M15 qualification authority
```

Critical semantic boundary:

``` text
Project Media
→ photo/video

Marketing Kit
→ brochure/pricelist
```

Critical Listing boundary:

``` text
Approved Claim
→ initializes Agent-owned Listing
→ M03 owns Listing lifecycle
→ M03 owns ordinary Listing Update/Publish/Refresh semantics
```

Physical/runtime implementation remains downstream.

**PRE-00-H = PASS / LOCKED.**

**Next gate: PRE-00-I --- M07 Domain Alignment Gate.**

------------------------------------------------------------------------

# 52. PROVENANCE

### Current M06 authority

`RUMAHAGEN_WF03_M06_FULL_REBUILD_CONTROLLED_v1.5_FULL_VERSION.zip`

### Current M06 semantic artifact

`07_M06_FULL_REBUILD_CONTROLLED_v1.5.md`

### Current M06 correction artifact

`06_M06_FULL_REBUILD_CORRECTION_DECISIONS_v1.5.md`

### Current M06 QIR

`RUMAHAGEN_WF03_M06_QIR_RESOLUTION_CONTROLLED_v1.0_FULL_VERSION.zip`

### Current M06 Core Impact Analysis

`RUMAHAGEN_WF03_M06_CORE_IMPACT_ANALYSIS_FULL_v1.0_CONTROLLED.zip`

### Core impact evidence used

-   M06 Core Impact Matrix;
-   M06 Core Propagation Matrix;
-   M06 Core Required Change Register;
-   M06 Core Conflict Register;
-   M06 Core Authority Mapping;
-   M06 Core Dependency Impact;
-   M06 Core Integration Readiness;
-   M06 Core QA.

### Cross-module evidence

-   PRE-00 governance;
-   M01/M02/M03/M04/M05 prior locked gates;
-   authoritative M03 v1.3 field mapping/lifecycle boundary;
-   M10 authorization boundary;
-   M09 audit boundary;
-   M15 qualification/evidence boundary.

------------------------------------------------------------------------

# 53. REVISION HISTORY

## v1.0 --- Initial Full PRE-00-H execution

Created as a whole-gate full version.

Established:

-   current M06 v1.5 authority;
-   Developer company logo and "Tentang Developer";
-   expanded Project semantic source contract;
-   canonical M03 field names;
-   Project Media vs Marketing Kit boundary;
-   Marketing Kit resource and role/action matrix;
-   Project Claim lifecycle and approval authority;
-   Approval Claim / Approval Record semantics;
-   Approved Claim hard-gate for Project → Listing initialization;
-   M03 Listing authority preservation;
-   M06 ↔ M03/M10/M09/M15 boundary audits;
-   Core impact classifications;
-   Core detail preservation;
-   no silent replacement/deletion;
-   physical/runtime downstream separation.

No Core v1.3 file was modified.

------------------------------------------------------------------------

# REVISION NOTE --- PRE-00-H v1.1

This is a **full-version clarification**, not a patch.

The decision is now explicit that:

-   Developer Project Listing fields = canonical M03 Listing fields for
    safe transfer after Approved Claim;
-   Project Media and Marketing Kit = latest M06 Rebuild v1.5 baseline;
-   Project Claim and Approved Claim → Agent-owned Listing
    initialization = latest M06 Rebuild v1.5 baseline;
-   M03 remains Listing authority;
-   no duplicate Listing schema or authority is created;
-   physical/runtime completion is not claimed by this semantic gate.
