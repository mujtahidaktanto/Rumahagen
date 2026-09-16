# RUMAHAGEN R01 / WF03

# FINAL M10 AUTHORIZATION / RBAC / RLS IMPACT, UPDATE & RECONCILIATION

## Full-Version Semantic Authority Update v1.2

------------------------------------------------------------------------

## 0. FINAL DECISION

**STATUS: PASS / LOCKED --- FINAL M10 SEMANTIC AUTHORIZATION AUTHORITY**

This document is a **full-version M10 update**, not a patch or append.

It consolidates the locked M10 v1.1 semantic baseline with the valid
authorization impacts identified across the current M01--M15 authority
set and PRE-00-R.

The governing principle remains:

> **Domain modules own business truth and domain actions; M10 owns
> authorization, RBAC, permission resolution, scope, condition
> evaluation, ownership/organization authorization context, and RLS
> semantics.**

Core v1.3 remains the immutable baseline during this M10 update.

No physical/runtime PASS is inferred from this semantic update.

------------------------------------------------------------------------

# 1. SOURCE / AUTHORITY BASIS

## 1.1 Current M10 baseline

**M10 v1.1 --- PRE-00-L M10 Authorization/RBAC/RLS Authority Gate**

Locked baseline:

-   Role = actor grouping.
-   Role Permission = default/baseline permission matrix.
-   Permission Preset = optional configurable authorization
    configuration targeted to an existing Role.
-   Permission Preset is never a Role.
-   Permission Preset cannot create capabilities outside the established
    Role baseline.
-   Superadmin BYPASS remains canonical.
-   Scope, Condition, Ownership and Organization Context participate in
    authorization.
-   RLS enforces the semantic authorization contract.
-   Domain modules remain business authorities.

The M10 gate explicitly records these principles and the
negative-authorization model. fileciteturn27file1

## 1.2 Cross-module basis

PRE-00-R passed the cross-module semantic reconciliation and identifies
the M10 impact inventory as the next controlled update stage. Its
inventory includes M04 Session, M06 Project/Claim/Marketing Kit, M08
Dashboard/Notification State, M09 Administration, M11 public
capabilities, M12 Organization/Membership, M13 Provider/BYOK, M14
commercial administration, M15 Qualification/Evidence/Award, Static
Public Content and Announcement/Promotion. fileciteturn28file11

## 1.3 Governance basis

The integration governance requires all valid additions/augmentations to
be propagated or explicitly classified, while preserving Core detail,
authority boundaries, provenance and the separation between semantic
decisions and physical/runtime proof. fileciteturn28file2

------------------------------------------------------------------------

# 2. M10 CANONICAL IDENTITY --- LOCKED

M10 is the authoritative:

-   Authorization layer;
-   Role model;
-   Role Permission model;
-   Permission Preset model;
-   Capability authorization model;
-   Scope model;
-   Condition model;
-   Ownership authorization model;
-   Organization authorization-context model;
-   RLS semantic enforcement model.

M10 is **not** the business authority for:

-   Identity;
-   Profile;
-   Listing;
-   Learning;
-   Event;
-   Developer/Project/Claim;
-   DBR;
-   Dashboard/Notification business truth;
-   Administration business configuration;
-   Public Discovery/SEO/Measurement;
-   Organization business truth;
-   Provider/BYOK business truth;
-   Commercial truth;
-   Qualification/Award truth.

------------------------------------------------------------------------

# 3. CANONICAL AUTHORIZATION RESOLUTION

``` text
Authenticated Account
        ↓
Role
        ↓
Role Permission
        ↓
Optional compatible live-linked Permission Preset
        ↓
Capability
        ↓
Scope
        ↓
Condition
        ↓
Ownership / Organization Context
        ↓
Authorization Decision
        ↓
RLS / physical enforcement
```

This is one authorization resolution chain.

No domain module may establish a parallel permission engine.

------------------------------------------------------------------------

# 4. ROLE MODEL

## 4.1 Platform roles

The current established platform roles remain:

-   Superadmin
-   Admin
-   Manager
-   Agent
-   Developer Partner
-   Buyer
-   Instructor

A capability, context, business status, provider connection, membership
state, commercial entitlement, qualification state, or Permission Preset
does **not** create a new platform Role.

## 4.2 Organization actors

M12-specific actors such as Lead/Member remain contextual business
actors.

`ORG-ADMIN` is not a new platform Role.

It must map through the M10 Role/Capability/Scope model if it appears
physically or at API level. M12 explicitly locks this boundary.
fileciteturn28file0

------------------------------------------------------------------------

# 5. ROLE PERMISSION

**Role Permission = default/baseline permission matrix.**

It establishes the normal capability baseline for an established Role.

It is not:

-   ownership;
-   membership;
-   visibility;
-   commercial entitlement;
-   lifecycle state;
-   qualification;
-   business approval.

------------------------------------------------------------------------

# 6. PERMISSION PRESET --- FINAL RULE

**Permission Preset = optional configurable authorization configuration
targeted to an existing Role.**

Locked rules:

1.  It is not a Role.
2.  It is not an actor identity.
3.  It is not an independent authorization engine.
4.  It cannot create a capability outside the target Role baseline.
5.  It cannot bypass protected Superadmin governance.
6.  It must remain compatible with the target Role.
7.  An incompatible Role/Preset configuration fails closed or is
    rejected.
8.  No preset resolves to the Role default.
9.  An empty preset resolves to Role default.
10. Preset resolution is replacement/configuration of the applicable
    authorization matrix, not arbitrary additive union.

This preserves the locked M10 v1.1 semantics. fileciteturn27file1

------------------------------------------------------------------------

# 7. SCOPE MODEL --- FINAL

Canonical scope vocabulary:

-   `BYPASS`
-   `ALL`
-   `OWN`
-   `NONE`

Contextual authorization may additionally depend on:

-   Organization;
-   domain/resource;
-   ownership;
-   capability-specific condition.

No M11--M15 module is allowed to invent a parallel authorization scope
vocabulary.

## Scope meaning

### BYPASS

Superadmin governance path where explicitly locked.

### ALL

All resources within the capability's authorized boundary.

### OWN

Resources/actions owned by or attributable to the authorized actor.

### NONE

No authorization.

### Contextual

Authorization restricted by Organization, Partner, domain or other
governed resource context.

------------------------------------------------------------------------

# 8. CONDITION MODEL

M10 distinguishes authorization conditions from domain business
conditions.

## 8.1 Authorization conditions

Examples:

-   authenticated actor;
-   Role baseline;
-   compatible Permission Preset;
-   scope;
-   ownership;
-   Organization context;
-   capability-specific authorization constraint.

## 8.2 Domain business conditions

Examples:

-   Listing is PUBLISHED;
-   Project Claim is APPROVED;
-   BYOK connection is VALID/ACTIVE;
-   commercial entitlement exists;
-   qualification prerequisite is satisfied;
-   Awarding Path/Rule Version is applicable.

A domain business condition does not become a new Role or permission
merely because M10 evaluates it as part of an authorization decision.

------------------------------------------------------------------------

# 9. OWNERSHIP MODEL

Ownership remains separate from:

-   Role;
-   permission;
-   visibility;
-   membership;
-   entitlement;
-   qualification.

Examples:

-   M13 BYOK connection → Agent/User OWN.
-   M12 Organization → Organization ownership/context.
-   M06 Project Claim → Project/Claim domain ownership.
-   M15 evidence/Award → M15 business authority.
-   M14 commercial entitlement → commercial authority, not ownership
    permission.

------------------------------------------------------------------------

# 10. ORGANIZATION CONTEXT MODEL

M12 Organization Context is an authorization input.

Critical invariant:

``` text
Organization Membership
≠
automatic permission
```

M10 may resolve:

``` text
Role
+
Capability
+
Organization Context
+
Scope
+
Condition
→ Authorization Decision
```

Organization context does not create a new platform Role.

M12 explicitly states that M10 remains authorization/RBAC/RLS authority.
fileciteturn28file0

------------------------------------------------------------------------

# 11. NEGATIVE AUTHORIZATION --- FINAL

Authorization must fail closed.

``` text
No permission
→ DENY

Role/Preset incompatible
→ DENY / reject

Scope mismatch
→ DENY

Ownership mismatch
→ DENY

Organization mismatch
→ DENY

Condition failure
→ DENY

RLS predicate failure
→ DENY
```

A visible UI control is not proof of authorization.

An existing endpoint is not proof of authorization.

RLS must enforce the semantic decision and must not redefine it.

------------------------------------------------------------------------

# 12. SUPERADMIN BYPASS

Superadmin BYPASS remains canonical where explicitly governed.

It does not create an equivalent blanket override for other roles.

Permission Preset cannot weaken protected Superadmin-only governance.

M09/M13/M14 administrative capabilities that are explicitly
Superadmin-only remain so unless a future controlled semantic decision
changes the authority.

------------------------------------------------------------------------

# 13. M04 IMPACT --- LEARNING / SESSION

## Finding

M04 introduced a distinct Session permission family and retains Learning
Activity/Completion/Learning Economy semantics.

## M10 treatment

M10 must represent authorization for the applicable Session capabilities
without taking Learning business authority.

M04 remains authoritative for:

-   Learning;
-   Session;
-   Learning Activity;
-   completion;
-   LP;
-   Learning Economy.

M15 consumes evidence; it does not redefine M04.

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 14. M06 IMPACT --- PROJECT / CLAIM / MARKETING KIT

M06 contains valid authorization distinctions for:

-   Project;
-   Project Claim;
-   Marketing Kit;
-   Developer Project;
-   applicable Developer/Agent/Admin access.

M10 must resolve these through Role + Capability + Scope + Condition +
Ownership/Organization.

Important business condition:

``` text
Approved Claim
→ permitted Project→Listing initialization path
```

Claim approval does not itself grant Listing
Create/Update/Publish/Refresh.

M03 remains Listing authority.

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 15. M08 IMPACT --- DASHBOARD / NOTIFICATION STATE

M08's active semantic capabilities are:

-   Dashboard Projection;
-   Notification State.

M08 does not create Notification Creation authority.

Dashboard access is read-only projection and inherits source-domain
authorization.

Notification State is own-state management, subject to authorization.

## M10 treatment

M10 must enforce:

-   source-domain scope for Dashboard Projection;
-   OWN scope for ordinary Notification State;
-   Superadmin BYPASS where explicitly locked.

The M08 gate rejects unapproved permission/capability scope creep.
fileciteturn28file8

## Classification

**PRESERVE / CONTROLLED**

------------------------------------------------------------------------

# 16. M09 IMPACT --- ADMINISTRATION

M09 remains the administrative control surface, not a universal
authorization override.

Locked administrative boundaries include:

-   System Configuration View/Manage → Superadmin;
-   Administrative Audit Log View → Superadmin + Manager;
-   Global Administrative Export → Superadmin;
-   governed Domain Administration;
-   governed Reconciliation;
-   Provider Catalogue administrative surface where applicable.

M10 must enforce these permissions.

M09 does not create generic `manage_all`.

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 17. M11 IMPACT --- PUBLIC DISCOVERY / SEO / MEASUREMENT

M11 is public discovery/SEO/tracking/measurement authority.

M10 controls access to protected/scoped resources.

Critical invariant:

``` text
Public Discovery
≠
Authorization
```

Also:

``` text
robots/noindex
≠
security
```

M11 does not own business mutation.

## Public-surface capabilities requiring M10 consideration

-   Homepage;
-   Listing;
-   Agent;
-   Organization;
-   Developer/Project;
-   Event;
-   Learning;
-   Learning Session;
-   Static Public Content;
-   Announcement/Promotion.

Public visibility may be governed by public business state, but
management/mutation remains separately authorized.

## Classification

**PRESERVE / CONTROLLED**

------------------------------------------------------------------------

# 18. STATIC PUBLIC CONTENT

Static Public Content is a **mandatory functional Core capability**, not
optional SEO traceability.

M09 or the applicable content authority owns lifecycle/configuration.

M11 owns public discovery/SEO/measurement.

M10 owns authorization.

This means M10 must provide a governed authorization path for authorized
content administration without becoming the content owner.

## Classification

**ADD-NEW / MANDATORY M10 AUTHORIZATION PROPAGATION**

------------------------------------------------------------------------

# 19. ANNOUNCEMENT / PROMOTION

Announcement/Promotion is also a **mandatory functional Core
capability**.

Authority separation:

-   M09/applicable domain → lifecycle/configuration;
-   M14 → commercial truth where commercial;
-   M11 → public discovery/SEO/measurement;
-   M08 → projection/state where applicable;
-   M10 → authorization/RLS.

M10 must not collapse commercial Promotion semantics into generic
administrative permission.

## Classification

**ADD-NEW / MANDATORY M10 AUTHORIZATION PROPAGATION**

------------------------------------------------------------------------

# 20. M12 IMPACT --- ORGANIZATION / MEMBERSHIP

M12 introduces valid authorization-context impacts:

-   Organization;
-   Membership;
-   Invitation;
-   Join Request;
-   Organization Context;
-   Organization-owned settings/documents/content;
-   Organization enforcement;
-   Organization Listing context.

M10 must authorize actions while M12 remains business authority.

Examples:

``` text
Organization Update
→ M10 authorization
→ M12 business validation/execution

Invitation Create
→ M10 authorization
→ M12 invitation lifecycle

Join Request Accept
→ M10 authorization
→ M12 lifecycle

Organization Close
→ M10 authorization
→ M12 lifecycle
```

The M12 gate explicitly preserves M10 as the authorization layer.
fileciteturn28file3

## Classification

**AUGMENT / CONTROLLED**

------------------------------------------------------------------------

# 21. M12 ORG-ADMIN RECONCILIATION

`ORG-ADMIN` must not become a platform Role.

If present physically/API-side:

``` text
ORG-ADMIN
→ mapping
→ established M10 Role/Capability/Scope/Condition model
```

No automatic privilege inheritance is permitted.

## Classification

**RECONCILE / CONTROLLED**

------------------------------------------------------------------------

# 22. M13 IMPACT --- PROVIDER CATALOGUE / BYOK

M13 provides five major capability families:

1.  Provider Catalogue.
2.  Own BYOK Connection.
3.  AI Invocation prerequisite.
4.  Administrative Connection Intervention.
5.  Bulk intervention execution mode.

M13's final matrix identifies:

-   Provider Catalogue mutation → Superadmin-only;
-   own BYOK → Agent/User OWN;
-   AI invocation → applicable feature permission + own VALID/ACTIVE
    connection;
-   administrative force revoke/disable → governed Admin/Superadmin
    authority;
-   bulk revoke → execution mode, not a new permission.

M13 explicitly states that physical permission IDs must be
derived/validated through M10; M13 does not invent them.
fileciteturn28file7

## M10 propagation

Candidate semantic capability families:

-   `VIEW_PROVIDER_CATALOGUE`
-   `MANAGE_PROVIDER_CATALOGUE`
-   `MANAGE_OWN_AI_CONNECTION`
-   `USE_AI_CONNECTION`
-   `FORCE_REVOKE_OTHER`
-   `FORCE_DISABLE_OTHER`

These are **semantic capability candidates**, not an assertion that
these exact strings are existing physical permission IDs.

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 23. M13 SCOPE / CONDITION RECONCILIATION

BYOK ownership:

``` text
Scope = OWN
```

AI use:

``` text
Applicable feature authorization
+
Own connection
+
VALID/ACTIVE
```

Administrative intervention:

``` text
Authorized Admin/Superadmin
+
target within governed scope
+
governed action
+
audit condition
```

Provider mutation:

``` text
Superadmin
+
Provider Catalogue authority
```

No new M13-specific Team/Project/Organization scope is introduced for
BYOK ownership. fileciteturn28file13

------------------------------------------------------------------------

# 24. M14 IMPACT --- COMMERCIAL AUTHORIZATION

M14 owns:

-   Offer;
-   Subscription;
-   Add-on;
-   Promotion;
-   Order;
-   Checkout;
-   Payment;
-   Fulfillment;
-   Entitlement;
-   Quota;
-   Commercial reconciliation.

M10 authorizes access to commercial administration and operations.

Critical invariant:

``` text
Commercial Entitlement
≠
RBAC Permission
```

An entitlement can be a business prerequisite for an action, but it is
not itself a permission.

------------------------------------------------------------------------

# 25. M14 CONFIGURABLE COMMERCIAL ADMINISTRATION

M14 v1.2 explicitly establishes configurable MVP commercial
administration.

Governed configurable areas include:

-   Offer;
-   Subscription;
-   Entitlement Definition;
-   Quota Capacity/Grant/Allowance;
-   Promotion;
-   protected commercial Snapshot semantics.

Admin receives governed configurable capability according to M14's
semantic decision.

Superadmin retains the broadest commercial configuration authority.

M10 must encode the authorization boundary.

M10 must **not** convert the configuration family into generic
`manage_all`.

M14 remains commercial authority.

The M14 artifact explicitly states that its administrative UI does not
bypass M10. fileciteturn28file5

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 26. M14 REFRESH BOUNDARY

The authorization model must preserve:

``` text
M03 = Refresh action
M14 = Refresh commercial allowance
M10 = authorization of the applicable action
```

Therefore:

-   M14 entitlement does not replace M03 Refresh action;
-   M03 action authorization does not create commercial entitlement;
-   M10 resolves authorization;
-   M14 evaluates commercial eligibility where applicable.

## Classification

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 27. M14 PAYMENT BOUNDARY

M10 may authorize payment/order/administrative operations.

M10 does not become payment authority.

Trusted payment verification remains M14.

Payment success in a client/browser is not an authorization or
fulfillment decision.

## Classification

**PRESERVE**

------------------------------------------------------------------------

# 28. M15 IMPACT --- QUALIFICATION / EVIDENCE / AWARD

M15 owns:

-   Qualification Evidence;
-   Qualification Evaluation;
-   Awarding Paths;
-   Rule Versions;
-   Prerequisites;
-   Title;
-   Award Instance;
-   Award lifecycle;
-   Award provenance;
-   Title/Award presentation.

M10 authorizes access to applicable M15 capabilities.

M15 remains the business authority.

## Classification

**AUGMENT / CONTROLLED M10 PROPAGATION**

------------------------------------------------------------------------

# 29. M15 QUALIFICATION CONDITIONS

Examples of domain conditions:

-   evidence exists;
-   evidence is valid;
-   prerequisite is satisfied;
-   applicable Path Version;
-   applicable Rule Version;
-   evaluation result qualifies.

These are M15 business-state conditions.

M10 may use them as authorization/business-operation preconditions where
applicable, but does not own their semantic definitions.

------------------------------------------------------------------------

# 30. M15 AWARD BOUNDARY

Critical invariants:

``` text
Completion ≠ Award
Certificate ≠ Award
LP ≠ Award
Payment ≠ Award
Entitlement ≠ Award
```

M10 can authorize who may perform an Award-related operation.

M10 does not issue, qualify, revoke or define the Award.

------------------------------------------------------------------------

# 31. M15 QUESTION REGISTER PROVENANCE

The following remain a hard provenance rule:

``` text
Q01–Q64 = M14
```

Explicitly:

-   Q40 = M14;
-   Q54 = M14;
-   Q61 = M14;
-   Q62 = M14.

M10 must not create M15 permissions or capabilities from these M14
questions merely because they are mentioned in a historical M15
artifact.

The M15 provenance conflict was resolved by PRE-00-Q-1. PRE-00-R
confirms it remains closed. fileciteturn28file11

------------------------------------------------------------------------

# 32. M04 ↔ M15 AUTHORIZATION BOUNDARY

Canonical flow:

``` text
M04 Learning / Assessment
        ↓
Learning-owned evidence
        ↓
M15 Qualification Evidence
        ↓
M15 Qualification Evaluation
        ↓
M15 Award
```

M10 authorizes access to operations along this flow.

M10 does not create the evidence or Award.

------------------------------------------------------------------------

# 33. CAPABILITY PROPAGATION MATRIX

  ---------------------------------------------------------------------------------------
  Domain            Capability family /      M10 semantic          Scope / condition
                    operation                treatment             
  ----------------- ------------------------ --------------------- ----------------------
  M04               Session                  AUGMENT               governed resource
                                                                   scope

  M04               Learning Activity        PRESERVE/AUGMENT      OWN / governed

  M06               Project                  AUGMENT               OWN/ALL/appropriate
                                                                   domain scope

  M06               Claim                    AUGMENT               OWN + lifecycle
                                                                   condition

  M06               Marketing Kit            AUGMENT               OWN/PARTNER/ALL as
                                                                   governed

  M08               Dashboard Projection     PRESERVE              source-domain scope

  M08               Notification State       PRESERVE              OWN

  M09               System Configuration     PRESERVE              Superadmin

  M09               Audit Log                PRESERVE              Superadmin/Manager

  M09               Global Admin Export      PRESERVE              Superadmin

  M11               Public surfaces          PRESERVE/CONTROLLED   PUBLIC + business
                                                                   state

  M11               Static Public Content    ADD-NEW               governed admin scope
                    administration                                 

  M11               Announcement/Promotion   ADD-NEW               governed
                    administration                                 admin/commercial scope

  M12               Organization             AUGMENT               Organization/context

  M12               Membership               AUGMENT               Organization/OWN

  M12               Invitation               AUGMENT               OWN/Organization

  M12               Join Request             AUGMENT               OWN/Organization

  M13               Provider Catalogue View  AUGMENT               governed

  M13               Provider Catalogue       AUGMENT               Superadmin
                    Manage                                         

  M13               Own BYOK                 AUGMENT               OWN

  M13               AI Invocation            AUGMENT               feature permission +
                                                                   VALID/ACTIVE

  M13               Force Revoke Other       AUGMENT               governed
                                                                   Admin/Superadmin scope

  M13               Force Disable Other      AUGMENT               governed
                                                                   Admin/Superadmin scope

  M14               Commercial               AUGMENT               governed admin scope
                    administration                                 

  M14               Refresh allowance        PRESERVE              entitlement condition

  M14               Payment/Order            PRESERVE              commercial business
                                                                   conditions

  M15               Qualification            AUGMENT               governed qualification
                                                                   scope

  M15               Evidence                 AUGMENT               OWN/authorized domain
                                                                   scope

  M15               Award                    AUGMENT               governed Award scope
  ---------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 34. SCOPE RECONCILIATION MATRIX

  -----------------------------------------------------------------------
  Scope                   Meaning                 Examples
  ----------------------- ----------------------- -----------------------
  BYPASS                  governed Superadmin     protected
                          path                    administration

  ALL                     all resources in        applicable
                          authorized boundary     Admin/Superadmin

  OWN                     actor-owned resource    BYOK, own notification

  ORGANIZATION            Organization context    Organization resources

  PARTNER                 partner domain          Partner Learning /
                                                  Project

  PUBLIC                  public representation   public discovery

  DOMAIN-SCOPED           explicit domain         administrative/domain
                          boundary                operations

  NONE                    no access               unauthorized actor
  -----------------------------------------------------------------------

`ORGANIZATION`, `PARTNER`, `PUBLIC`, and `DOMAIN-SCOPED` are contextual
scope semantics; they do not create new Roles.

------------------------------------------------------------------------

# 35. CONDITION RECONCILIATION MATRIX

  -----------------------------------------------------------------------
  Condition               Owner                   M10 treatment
  ----------------------- ----------------------- -----------------------
  Approved Claim          M06                     prerequisite

  PUBLISHED Listing       M03                     business-state
                                                  prerequisite

  Commercial entitlement  M14                     eligibility
                                                  prerequisite

  Refresh allowance       M14                     commercial prerequisite

  VALID/ACTIVE BYOK       M13                     invocation prerequisite

  Provider available      M13                     execution prerequisite

  Organization            M12                     authorization context
  membership/context                              

  Qualification           M15                     business-state
  prerequisite                                    prerequisite

  Applicable Path/Rule    M15                     qualification condition
  Version                                         

  Public business state   source domain/M11       discovery condition
                          projection              
  -----------------------------------------------------------------------

M10 evaluates authorization; it does not redefine the condition owner.

------------------------------------------------------------------------

# 36. OWNERSHIP / ORGANIZATION MATRIX

  --------------------------------------------------------------------------
  Resource                Business owner          M10 authorization input
  ----------------------- ----------------------- --------------------------
  Listing                 M03                     owner/scope

  Project                 M06                     owner/partner/domain

  Claim                   M06                     requester/project/domain

  Organization            M12                     organization context

  Membership              M12                     organization +
                                                  ownership/context

  BYOK                    M13                     OWN

  Commercial entitlement  M14                     account/context + business
                                                  eligibility

  Qualification evidence  M15                     authorized actor/domain

  Award                   M15                     authorized actor/domain

  Notification State      M08                     OWN

  Dashboard projection    source domain           inherited source scope
  --------------------------------------------------------------------------

------------------------------------------------------------------------

# 37. RLS SEMANTIC MAPPING

M10 RLS must enforce, where applicable:

### Organization

-   Organization boundary;
-   membership/context;
-   no cross-Organization leakage.

### Project / Claim / Marketing Kit

-   owner/partner/domain scope;
-   Claim-specific conditions.

### BYOK

-   owner isolation;
-   no cross-user credential access;
-   administrative intervention constrained to governed operations;
-   raw credential protection.

### Commercial

-   account/Organization/domain boundaries;
-   historical transaction protection;
-   commercial administrative scope.

### Qualification / Evidence / Award

-   evidence ownership/scope;
-   authorized evaluation;
-   Award visibility;
-   protected/private evidence.

### Public

Public records may be publicly visible only when authoritative business
state permits it. Public visibility does not bypass protected mutation
authorization.

------------------------------------------------------------------------

# 38. API AUTHORIZATION MODEL

Every protected API operation must resolve through M10 semantics.

``` text
API request
→ authenticated account
→ Role
→ baseline/preset
→ capability
→ scope
→ condition
→ ownership/org context
→ authorization decision
→ RLS
→ domain operation
```

An endpoint existing in Core does not establish authorization.

Exact physical permission IDs remain an implementation/catalogue matter
under M10.

------------------------------------------------------------------------

# 39. AUTHORIZATION VS BUSINESS EXECUTION

The final model is:

``` text
M10
  = "May this actor perform/access this operation?"

Domain authority
  = "What does the operation mean and what business rules govern it?"
```

Examples:

``` text
M10 authorizes Refresh
M03 executes Refresh semantics

M10 authorizes commercial configuration
M14 executes commercial configuration semantics

M10 authorizes Qualification Evaluation
M15 executes qualification semantics

M10 authorizes Organization Close
M12 executes Organization lifecycle semantics

M10 authorizes BYOK operation
M13 executes connection lifecycle semantics
```

This is the principal anti-authority-inversion rule.

------------------------------------------------------------------------

# 40. DUPLICATE AUTHORITY AUDIT

## Result: PASS

Rejected:

-   M14 as authorization engine;
-   M15 as permission engine;
-   M12 as Role authority;
-   M13 as authorization authority;
-   M11 as security authority;
-   M09 as universal override;
-   M08 as notification-creation authority;
-   M04 as Award authority.

No duplicate M10 authority is created.

------------------------------------------------------------------------

# 41. ORPHAN CAPABILITY AUDIT

## Result: PASS

All identified M11--M15 authorization impacts now have an M10
authorization path:

-   public content administration;
-   announcement/promotion administration;
-   Organization context;
-   BYOK;
-   Provider Catalogue;
-   commercial administration;
-   qualification;
-   evidence;
-   Award.

M04/M06/M08/M09 impacts are likewise represented in the M10 propagation
model.

------------------------------------------------------------------------

# 42. PERMISSION PRESET INTEGRITY AUDIT

Every newly propagated capability must be constrained by the existing
Role baseline.

Therefore:

``` text
New capability
→ may be represented in Role baseline where semantically justified
→ may be configured through compatible Preset
→ cannot be invented by Preset alone
```

A preset cannot elevate:

``` text
Role baseline
→ arbitrary new capability
```

This preserves the locked M10 rule that a Permission Preset cannot
create capabilities outside the established Role baseline.
fileciteturn27file1

------------------------------------------------------------------------

# 43. ROLE EXPANSION CONTROL

No M11--M15 delta justifies a new platform Role.

Specifically rejected:

-   Public Content Admin as new Role;
-   Organization Admin as new Role;
-   Commercial Admin as new Role;
-   Qualification Admin as new Role;
-   BYOK Admin as new Role;
-   Award Manager as new Role.

These are capability/scope/condition problems, not automatic Role
problems.

------------------------------------------------------------------------

# 44. AUTHORIZATION CONFLICT AUDIT

## Result: PASS

No unresolved genuine semantic authorization conflict was identified.

Known issues are classification-controlled:

-   ORG-ADMIN → controlled mapping;
-   physical permission IDs → controlled;
-   physical RLS gaps → controlled;
-   Permission Preset physical implementation → controlled;
-   exact API authorization enforcement → controlled.

No semantic conflict requires reopening PRE-00-L at this stage.

------------------------------------------------------------------------

# 45. CORE PROPAGATION REGISTER

The following M10 changes are required for later Integrated Core
propagation:

  ID        Delta                                              Classification
  --------- -------------------------------------------------- ------------------------
  M10-001   Session permission family                          AUGMENT
  M10-002   Project/Claim/Marketing Kit authorization detail   AUGMENT
  M10-003   Dashboard Projection authorization                 PRESERVE
  M10-004   Notification State OWN authorization               PRESERVE
  M10-005   M09 administrative permission boundaries           AUGMENT
  M10-006   Static Public Content authorization path           ADD-NEW
  M10-007   Announcement/Promotion authorization path          ADD-NEW
  M10-008   Organization/Membership authorization context      AUGMENT
  M10-009   ORG-ADMIN mapping                                  RECONCILE / CONTROLLED
  M10-010   Provider Catalogue/BYOK capabilities               AUGMENT
  M10-011   Commercial administration capabilities             AUGMENT
  M10-012   Qualification/Evidence/Award capabilities          AUGMENT
  M10-013   Public/private boundary enforcement                PRESERVE
  M10-014   Cross-domain RLS mapping                           AUGMENT / CONTROLLED
  M10-015   Permission Preset compatibility constraint         PRESERVE

------------------------------------------------------------------------

# 46. CORE DETAIL-LOSS AUDIT

**Core Detail Loss = 0**

This M10 update does not authorize deletion of Core v1.3 detail.

No existing Core semantic detail may be removed merely because a Recon
module expresses it differently.

Where true contradictions exist, only the contradictory semantic portion
may be reconciled.

No such new genuine M10 semantic contradiction was identified in this
pass.

------------------------------------------------------------------------

# 47. NON-DESTRUCTIVE SYNCHRONIZATION RULE

Later Integrated Core work must use:

``` text
Core v1.3
+
M01–M15 valid semantic delta
+
FINAL M10 authorization delta
→
Integrated Core Candidate
```

It must not use:

-   file overwrite;
-   silent replacement;
-   blind append;
-   wholesale module substitution;
-   deletion of Core details.

------------------------------------------------------------------------

# 48. PHYSICAL / RUNTIME RESIDUAL REGISTER

The following remain downstream CONTROLLED:

1.  Physical permission catalogue IDs.
2.  Permission Preset tables/relations.
3.  Effective permission resolver.
4.  Role + Preset atomic transaction.
5.  Permission/Role/Role-Permission RLS hardening.
6.  API middleware enforcement.
7.  M03 Refresh physical permission identity.
8.  M06 Claim/API/RLS enforcement.
9.  M08 source-domain filtering and notification state enforcement.
10. M09 administrative API authorization.
11. M11 public/private resource filtering.
12. M12 Organization RLS and ORG-ADMIN mapping.
13. M13 Provider Catalogue and BYOK RLS/security.
14. M14 commercial administrative API/RLS.
15. M15 evidence/Award API/RLS.
16. Static Public Content physical lifecycle/API/RLS.
17. Announcement/Promotion physical lifecycle/API/RLS.

### Runtime status

**NOT VERIFIED**

### Production status

**NOT AUTHORIZED**

------------------------------------------------------------------------

# 49. FINAL M10 SEMANTIC MATRIX

## Superadmin

Broadest governed authorization according to explicit capability/scope.

Superadmin BYPASS remains canonical where locked.

## Admin

Only explicit capabilities and scopes.

No generic override.

Commercial configuration is governed where M14 explicitly grants it.

M13 Provider Catalogue mutation remains Superadmin-only.

## Manager

Only explicit governed capabilities.

No automatic Superadmin authority.

## Agent

Own resources and explicit role baseline.

Own BYOK remains OWN.

No cross-user BYOK.

## Developer Partner

Partner-domain capabilities where explicitly governed.

No automatic platform-wide administration.

## Buyer

Only explicit Buyer capabilities.

No implicit administration.

## Instructor

Learning/Session capabilities only where explicitly governed.

No automatic Host or administrative authority.

------------------------------------------------------------------------

# 50. FINAL M10 AUTHORITY STATEMENT

> **M10 is the authoritative Authorization/RBAC/RLS layer for RumahAgen.
> Role is actor grouping; Role Permission is the default/baseline
> permission matrix; Permission Preset is an optional configurable
> authorization configuration targeted to an existing Role and is never
> a new Role or a mechanism for creating capabilities outside the
> established Role baseline. Effective authorization is resolved from
> authenticated identity, Role, baseline or compatible live-linked
> preset, capability, scope, condition, ownership and Organization
> context, and is enforced through RLS. Superadmin BYPASS remains
> canonical where explicitly governed. Domain modules retain ownership
> of business truth and actions; M09 remains the administrative surface;
> M10 does not become business-domain authority and no domain module may
> bypass M10 authorization.**

------------------------------------------------------------------------

# 51. FINAL GATE CHECKLIST

  Gate item                                   Result
  ------------------------------------------- ------------------------
  Current M10 baseline preserved              PASS
  M01--M15 authorization impacts reconciled   PASS
  Role model preserved                        PASS
  Role Permission model preserved             PASS
  Permission Preset model preserved           PASS
  Preset cannot exceed Role baseline          PASS
  Capability model                            PASS
  Scope model                                 PASS
  Condition model                             PASS
  Ownership model                             PASS
  Organization context                        PASS
  Superadmin BYPASS                           PASS
  Negative authorization                      PASS
  M04 impact                                  PASS
  M06 impact                                  PASS
  M08 impact                                  PASS
  M09 impact                                  PASS
  M11 impact                                  PASS
  Static Public Content                       PASS --- mandatory
  Announcement/Promotion                      PASS --- mandatory
  M12 impact                                  PASS
  ORG-ADMIN                                   RECONCILE / CONTROLLED
  M13 impact                                  PASS
  M14 impact                                  PASS
  M15 impact                                  PASS
  M14/M15 boundary                            PASS
  Q01--Q64 provenance                         PASS
  Duplicate authority                         NONE
  Orphan capability                           NONE
  Authority inversion                         NONE
  Circular authorization authority            NONE
  Unresolved genuine semantic conflict        **0**
  Core Detail Loss                            **0**
  Core v1.3 modified                          **NO**
  Physical/API/RLS residuals                  CONTROLLED
  Runtime verification                        NOT VERIFIED
  Production authorization                    NOT AUTHORIZED

------------------------------------------------------------------------

# 52. FINAL DECISION

## **M10 FINAL IMPACT / UPDATE / RECONCILIATION = PASS / LOCKED**

The M10 authorization model is now reconciled against the complete
current M01--M15 semantic authority set.

The final M10 model:

-   preserves M10 v1.1 authority;
-   incorporates valid authorization impacts from M11--M15;
-   preserves M01--M09 decisions;
-   introduces no new platform Role;
-   preserves Permission Preset restrictions;
-   preserves domain ownership;
-   preserves M14 commercial authority;
-   preserves M15 qualification/Award authority;
-   preserves M04 Learning authority;
-   preserves M12 Organization Context;
-   preserves M13 BYOK/provider authority;
-   preserves M11 public discovery authority;
-   preserves M03 Refresh action authority;
-   adds mandatory authorization propagation for Static Public Content
    and Announcement/Promotion;
-   maintains Core Detail Loss = 0.

------------------------------------------------------------------------

# 53. OFFICIAL HANDOFF

The M10 final authorization model is now eligible to become an input to
the **Integrated Core Candidate**.

The next official stage is:

``` text
FINAL M10
   PASS / LOCKED
        ↓
INTEGRATED CORE CANDIDATE
        ↓
CORE DETAIL PRESERVATION AUDIT
        ↓
RECON ADDITION / PROPAGATION AUDIT
        ↓
NO-REPLACEMENT / NO-DELETION AUDIT
        ↓
AUTHORITY & DEPENDENCY AUDIT
        ↓
FULL CROSS-DOCUMENT RECONCILIATION
        ↓
INTEGRATED CORE v1.4 CANDIDATE
```

No Integrated Core file is modified by this M10 artifact itself.

------------------------------------------------------------------------

# 54. PROVENANCE / EXECUTION NOTE

This is a **FULL-VERSION M10 update**, not a patch or append.

It is based on:

-   locked M10 v1.1 authority;
-   current M01--M15 authority decisions;
-   PRE-00-R cross-module reconciliation;
-   M12 Organization authorization boundary;
-   M13 Provider/BYOK authorization matrix;
-   M14 configurable commercial administration;
-   M15 qualification/evidence/Award boundary;
-   integration governance.

The governance requires valid Recon deltas to be propagated or
explicitly classified and requires Core Detail Loss = 0.
fileciteturn28file2

No external/web source was used.

No Core v1.3 artifact was modified.

No physical/runtime PASS was claimed.

No production authorization was claimed.

## END OF FINAL M10 IMPACT / UPDATE / RECONCILIATION
