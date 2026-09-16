# RUMAHAGEN WF03

# PRE-00-G --- M05 MANDATORY DELTA / IMPACT GATE

## Full Deep Scan, Core Delta Extraction, Authority Reconciliation & Non-Destructive Integration Readiness --- v1.0

**Status:** PASS --- M05 Mandatory Delta/Impact Gate --- v1.0 LOCKED\
**Gate:** PRE-00-G\
**Primary authority:** M05 Full Rebuild Controlled v1.3\
**QIR authority:** M05 QIR Correction Controlled v1.2, incorporated into
M05 v1.3\
**Core baseline:** Core v1.3 --- immutable during PRE-00\
**Execution mode:** Non-Destructive Core-Superset Synchronization\
**Output type:** Full Version --- not patch / not append\
**Physical/runtime proof:** NOT REQUIRED\
**External/web sources:** NONE

------------------------------------------------------------------------

# 1. PURPOSE

PRE-00-G verifies the current M05 Event / Calendar / Event Registration
semantic authority and, because the supplied Recon set contains **no
dedicated M05 → Core Impact Analysis package**, builds the mandatory
dedicated M05 Core Delta/Impact Reconciliation required by the governing
checklist.

This gate therefore performs two distinct jobs:

1.  validate M05 v1.3 as the current semantic authority; and
2.  derive an explicit, evidence-based M05-vs-Core delta/impact register
    without modifying Core v1.3.

The gate does **not** use raw file replacement, overwrite, deletion, or
append-style patching.

The governing synchronization model remains:

``` text
Core v1.3
    +
valid M05 v1.3 semantic/detail delta
    ↓
classification
    ↓
conflict resolution where required
    ↓
later integrated Core candidate
```

Core v1.3 remains immutable during PRE-00-G.

------------------------------------------------------------------------

# 2. GOVERNING RULES

The following rules are binding:

-   Core v1.3 is the existing foundation/minimum-detail set.
-   M05 v1.3 does not replace, delete, overwrite, or reduce valid Core
    detail.
-   Every M05-vs-Core difference must be classified.
-   Valid classifications are:
    -   `PRESERVE`
    -   `AUGMENT`
    -   `ADD-NEW`
    -   `RECONCILE`
    -   `CONTROLLED`
    -   `NO-PROPAGATION`
    -   `SUPERSEDED`
-   A difference in detail density is not automatically a conflict.
-   Only a genuine semantic contradiction is `RECONCILE`.
-   Physical/API/RLS/runtime implementation gaps do not become semantic
    blockers merely because they are incomplete.
-   Semantic completeness does not transfer authority between modules.
-   No physical/runtime PASS is claimed without actual evidence.
-   No Core artifact is modified by this gate.
-   Historical M05 artifacts remain provenance only.

------------------------------------------------------------------------

# 3. PRE-00-G MANDATE

The locked governance checklist requires:

-   M05 readiness only after a dedicated impact artifact is complete;
-   resolution of any M05 blocking conflict;
-   classification of M05 findings against Core v1.3;
-   inventory of M05 semantic additions, corrections, lifecycle,
    permissions, and dependencies;
-   a dedicated M05 → Core Delta/Impact Reconciliation artifact.

This document is that dedicated artifact.

Therefore the previous absence of a dedicated M05 impact package is now
explicitly closed by this gate.

**PRE-00-G impact-artifact requirement: COMPLETE.**

------------------------------------------------------------------------

# 4. SOURCE / VERSION AUTHORITY

## 4.1 Current M05 authority

The current M05 authority is:

`RUMAHAGEN_WF03_M05_FULL_REBUILD_CONTROLLED_v1.3_FULL_VERSION.zip`

Its canonical semantic module version is:

**M05 v1.3**

The package identifies itself as a whole-module rebuild, not a patch or
append.

## 4.2 QIR authority

The M05 correction package is:

`RUMAHAGEN_WF03_M05_QIR_CORRECTION_CONTROLLED_FULL_v1.2.zip`

Its resolved corrections are incorporated into M05 v1.3.

The correct interpretation is:

``` text
M05 v1.2 baseline
    ↓
QIR Correction v1.2
    ↓
M05 Full Rebuild v1.3
```

QIR v1.2 is not a separate current M05 module authority.

## 4.3 Historical material

M05 v1.2 baseline artifacts are retained inside the v1.3 package under:

`01_FULL_V1.2_RETAINED/`

They are retained for provenance and lineage.

They do not override M05 v1.3.

### Classification

**SUPERSEDED --- historical authority only**

------------------------------------------------------------------------

# 5. RECURSIVE DEEP-SCAN RESULT

The supplied Recon archive was recursively inspected.

Top-level Recon ZIP:

`M01-M15 new recon.zip`

The archive contains:

-   M05 Full Rebuild Controlled v1.3;
-   M05 QIR Correction Controlled v1.2;
-   other M01--M15 packages and supporting provenance.

The current M05 v1.3 package contains:

-   source inventory;
-   question inventory;
-   semantic review;
-   lifecycle;
-   permission/action review;
-   cross-artifact reconciliation;
-   cross-module reconciliation;
-   physical/runtime prerequisite review;
-   configuration matrix;
-   online meeting provider model;
-   guest registration model;
-   field inventory;
-   configuration/permission matrix;
-   QIR correction traceability;
-   final QA/pre-gate;
-   retained v1.2 baseline artifacts.

The M05 v1.3 source inventory reports:

**405 recursive M05-source records scanned, 186 M05-relevant records.**

No dedicated M05 Core Impact Analysis package was present in the
supplied Recon set.

This gate therefore derives the dedicated Core delta register directly
from:

-   M05 v1.3 semantic authority;
-   M05 v1.3 question inventory;
-   M05 v1.3 lifecycle;
-   M05 v1.3 permission/action review;
-   M05 v1.3 configuration;
-   M05 v1.3 provider model;
-   M05 v1.3 guest model;
-   M05 v1.3 cross-module reconciliation;
-   M05 QIR correction evidence;
-   supplied Core v1.3 artifacts.

------------------------------------------------------------------------

# 6. M05 CURRENT SEMANTIC SCOPE

M05 owns:

``` text
Event
Calendar
Event Registration
```

Core v1.3 independently identifies the same canonical module scope:

``` text
M05 = Event / Calendar / Event Registration
```

The current Core dependency matrix also identifies M05 as:

``` text
Event
Calendar
Event Registration
```

### Classification

**PRESERVE**

No authority conflict exists.

------------------------------------------------------------------------

# 7. M05 QUESTION INVENTORY COMPLETENESS

Current M05 v1.3 question inventory contains:

**36 M05 questions.**

The questions cover:

-   Event authority;
-   Event quota;
-   quota vs entitlement;
-   quota vs Session capacity;
-   waitinglist semantics;
-   first-successful-registration rule;
-   registration window;
-   cutoff;
-   cancellation;
-   attendance;
-   Event cancellation;
-   notifications;
-   Developer Partner publication boundary;
-   Event Registration vs Session Enrollment;
-   Event fields;
-   provider-specific settings;
-   embedded experience;
-   approval model;
-   provider priority;
-   provider fallback;
-   provider determination timing;
-   Google Meet external behavior;
-   Guest registration;
-   Guest email;
-   conditional meeting-link notification;
-   Guest identity boundary;
-   Guest physical persistence residual;
-   provider failover detection residual;
-   provider binding persistence residual;
-   waitlist transaction residual.

The v1.3 inventory reports all business decisions resolved except
documentary/technical residuals.

### Important residual questions

The following remain technical/documentary residuals and are not
converted into invented semantic answers:

-   Guest physical persistence;
-   provider failover detection;
-   provider binding persistence;
-   waitlist promotion transaction mechanics.

### Classification

**PRESERVE / CONTROLLED**

------------------------------------------------------------------------

# 8. EVENT QUOTA SEMANTICS

M05 defines:

``` text
events.quota
=
maximum Registered participants
```

This is Event Registration capacity.

It is explicitly **not**:

-   commercial entitlement;
-   Listing quota;
-   Learning Session capacity.

Therefore:

``` text
Event quota
≠
Commercial entitlement
≠
Session capacity
```

Core already distinguishes Event from Learning Session and preserves
Event Registration as a separate resource.

### Classification

**AUGMENT**

The exact meaning of Event quota should be carried into the Core
semantic contract where Core currently uses a less precise generic quota
description.

No commercial quota authority is transferred to M05.

------------------------------------------------------------------------

# 9. WAITINGLIST SEMANTICS

M05 locks:

-   waitinglist is available when quota is full;
-   no queue number;
-   no rank;
-   all waitinglist participants are equal;
-   available slots are captured by the first successful registration.

The distinction is:

``` text
Waitinglist
≠
ordered queue
```

and:

``` text
first successful registration
=
slot capture rule
```

Core v1.3 does not define a conflicting M05 waitinglist rule.

### Classification

**ADD-NEW**

The semantic detail should be propagated to the Core M05 Event
Registration rules where the Core currently lacks it.

The exact physical promotion transaction remains downstream.

------------------------------------------------------------------------

# 10. REGISTRATION WINDOW

M05 locks:

``` text
Registration allowed
→ before Event start
→ through start_at + 1 hour
```

After:

``` text
start_at + 1 hour
```

new registration is disabled.

The rule remains subject to:

-   Event eligibility;
-   available quota.

### Classification

**ADD-NEW**

No contradictory Core rule was identified.

------------------------------------------------------------------------

# 11. PRE-START CANCELLATION / QUOTA RETURN

M05 locks:

``` text
Registered cancellation before Event start
→ return one quota slot
```

This is an Event Registration capacity rule.

It does not create commercial entitlement.

It does not modify M14 quota.

It does not affect M03 Listing quota.

### Classification

**ADD-NEW**

The rule should be propagated to Core Event Registration business rules.

------------------------------------------------------------------------

# 12. ATTENDANCE SEMANTICS

Attendance is optional.

No-show:

``` text
does not auto-cancel registration
```

Attendance does not cancel or invalidate the Event.

This preserves separation between:

``` text
Registration
Attendance
Event lifecycle
```

Core M05 scope does not contain a contradictory attendance rule.

### Classification

**ADD-NEW**

No new attendance authority is created; this is M05 Event Registration
semantics.

------------------------------------------------------------------------

# 13. EVENT CANCELLATION

M05 locks:

> Event cancellation is available to an actor with applicable M05
> permission.

Event cancellation is distinct from:

``` text
participant registration cancellation
```

The permission/action review confirms that Event cancellation is
governed by the M05 Event lifecycle permission family.

### Classification

**AUGMENT / PRESERVE**

The existing Core authorization boundary is retained.

Exact physical permission IDs remain downstream implementation detail
where not evidenced.

------------------------------------------------------------------------

# 14. START NOTIFICATION

At Event start, M05 requires notification to:

-   Registered participants;
-   Waitinglist participants;

where an available notification destination exists.

M08 remains notification/projection authority.

M05 owns the Event business trigger/state context.

Therefore:

``` text
M05
→ Event start business condition

M08
→ notification projection/delivery
```

M08 does not become Event authority.

### Classification

**ADD-NEW / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 15. DEVELOPER PARTNER EVENT PUBLICATION

M05 locks:

``` text
Developer Partner
→ OWN / SUBMIT
→ subject to approval
```

Developer Partner does not directly publish the Event through an
unrestricted bypass.

Core already identifies:

`text POST /developer-partners/events Developer Partner; subject to approval`

Therefore the Core API/semantic boundary matches M05.

### Classification

**PRESERVE**

No conflict.

------------------------------------------------------------------------

# 16. EVENT APPROVAL VS REGISTRATION APPROVAL --- CRITICAL DISTINCTION

Two different approval concepts exist and must not be merged.

## 16.1 Event publication approval

For applicable Event submission:

`text Developer Partner → submit → approval process → publication`

This remains part of Event lifecycle where applicable.

## 16.2 Participant registration approval

M05 separately locks:

`text default = auto-confirm`

with an Event Owner option to configure:

`text closed/manual approval`

Therefore:

`text Event publication approval ≠ Event Registration approval`

This distinction is mandatory.

### Core status field

Core physical/data artifacts retain:

`text pending_approval published rejected cancelled`

for Event lifecycle.

That is compatible with the Event publication/moderation boundary.

It must not be interpreted as:

`text every registration requires approval`

### Classification

**RECONCILE / CLARIFY**

The semantic clarification is required wherever Core wording could
collapse the two approval layers.

No Event `pending_approval` state is deleted.

------------------------------------------------------------------------

# 17. REGISTRATION APPROVAL DEFAULT

M05 locks:

`text Event Owner does nothing → Registration auto-confirm`

Event Owner may explicitly configure:

`text closed/manual approval`

Therefore:

`text approval globally mandatory = NO`

Core v1.3 does not contain a conflicting explicit M05
registration-approval rule.

### Classification

**ADD-NEW**

This is a genuine missing semantic detail, not a replacement.

------------------------------------------------------------------------

# 18. EVENT REGISTRATION ≠ SESSION ENROLLMENT

This is a hard cross-module invariant.

`text M05 Event Registration ≠ M04 Session Enrollment`

Core already explicitly preserves this boundary in:

-   Functional;
-   API;
-   ERD/DB;
-   User Flow;
-   dependency;
-   authorization documentation.

M05 must not absorb Session permission families.

M04 must not redefine Event Registration.

### Classification

**PRESERVE / LOCK**

------------------------------------------------------------------------

# 19. M05 ↔ M04 SESSION PERMISSION-FAMILY CHECK

The requested Session permission-family check produces:

**NO M05 Session permission-family expansion.**

The current M04 Session permission family remains M04-owned.

M05 owns:

`text Event Event Registration`

M04 owns:

`text Learning Session Session Enrollment Session access Session assignment Provider binding for Learning Session Attendance Session Completion Session evidence`

M05 does not create:

-   Session.View;
-   Session.Create;
-   Session.Assign;
-   Session.Provider.Manage;
-   Session.Attendance;
-   Session.Completion;
-   Session Evidence permissions.

Those remain M04/M10 governed.

### Classification

**NO-PROPAGATION**

No M05 permission family may be created for M04 Session capabilities.

------------------------------------------------------------------------

# 20. M05 ↔ M04 EVENT / SESSION ASSOCIATION

Core permits:

`text Event ↕ canonical Session representation`

M05 permits the Event to reference a canonical Session representation
where applicable.

This does not transfer Session authority.

The boundary remains:

`text Event = calendar/discovery context Session = Learning execution authority`

### Classification

**PRESERVE**

------------------------------------------------------------------------

# 21. ONLINE PROVIDER POLICY

M05 v1.3 locks:

\`\`\`text Primary → LiveKit

Fallback 1 → Zoom

Fallback 2 → Daily

Google Meet → external meeting


    Provider must be determined before Event start.

    Provider-specific settings remain provider-owned.

    M05 owns the Event-level provider policy.

    The connected provider owns provider-specific configuration/execution.

    ### Classification

    **ADD-NEW / AUGMENT**

    The provider policy is more detailed than the Core M05 semantic summary and must be propagated without replacing Core provider abstraction.

    ---

    # 22. PROVIDER FAILOVER BOUNDARY

    M05 defines a platform policy:

    ```text LiveKit
    → Zoom
    → Daily

but does **not** claim that runtime health detection/failover is
implemented.

The following remain documentary/technical residuals:

-   health detection;
-   failover trigger;
-   provider binding persistence;
-   credentials;
-   exact embedded mechanism.

Therefore:

`text M05 policy ≠ runtime proof`

### Classification

**CONTROLLED**

No runtime PASS is claimed.

------------------------------------------------------------------------

# 23. PROVIDER SWITCHING --- M04 BOUNDARY

Core M04 Session semantics allow authorized operator manual provider
switching for Learning Session Provider Binding.

M05 provider policy is for Event online meeting provider selection.

These are different resource contexts.

Therefore:

`text M04 Session Provider Binding ≠ M05 Event Provider Policy`

No conflict is established.

### Classification

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 24. EMBEDDED MEETING EXPERIENCE

M05 permits an in-app/embedded experience where the provider supports
it.

The exact mechanism is provider-specific.

M05 explicitly does not claim:

`text universal iframe`

as a proven implementation.

This is consistent with Core's provider abstraction and technical
boundary.

### Classification

**AUGMENT**

Provider-specific embedding can be represented later without inventing a
universal iframe architecture.

------------------------------------------------------------------------

# 25. GOOGLE MEET

M05 locks:

`text Google Meet = external meeting`

It is not:

-   primary embedded provider;
-   fallback embedded provider.

This is an explicit provider-policy detail.

### Classification

**ADD-NEW**

No architectural replacement is required.

------------------------------------------------------------------------

# 26. GUEST REGISTRATION

M05 locks:

`text Guest registration = ALLOWED`

subject to:

-   Event eligibility;
-   quota;
-   registration cutoff.

Guest email may be supplied as:

`text notification/contact destination`

but is:

`text NOT canonical RumahAgen identity`

This is a semantic addition to the Event Registration capability.

### Classification

**ADD-NEW**

------------------------------------------------------------------------

# 27. GUEST EMAIL / CONDITIONAL LINK

At successful Guest registration:

If a meeting link is available:

`text confirmation may include link`

If no meeting link is available:

`text confirmation is sent without unavailable link`

At Event start:

`text Registered + Waitinglist → notification`

when notification destination exists.

This prevents the system from promising a link that does not yet exist.

### Classification

**ADD-NEW**

------------------------------------------------------------------------

# 28. GUEST PHYSICAL PERSISTENCE --- CONTROLLED

The current Core physical schema contains:

`text event_registrations.agent_id`

as an authenticated participant identity field.

The M05 semantic authority permits Guest registration.

M05 v1.3 explicitly states that the exact physical Guest persistence
model is not fully evidenced.

Therefore this is **not** treated as a semantic contradiction requiring
invented schema.

It is a downstream physical/data reconciliation item.

### Classification

**CONTROLLED**

Required downstream work:

-   determine how Guest registration is physically represented;
-   reconcile the current authenticated `agent_id` model;
-   preserve authenticated registration behavior;
-   do not invent a physical Guest table/field during PRE-00-G.

No physical implementation is claimed.

------------------------------------------------------------------------

# 29. EVENT REGISTRATION API --- CORE DELTA

Core currently contains:

`text POST /events/{id}/rsvp Auth / eligible actor`

M05 semantic authority expands Event Registration to include Guest
registration.

Therefore the existing endpoint family remains valid, but its semantic
eligibility contract requires augmentation so that the Event
Registration capability can support the approved Guest path.

### Required semantic interpretation

`text /events/{id}/rsvp → authenticated eligible registration OR → approved Guest registration path`

subject to Event rules.

This does not mean that Guest receives an authenticated platform
identity.

### Classification

**AUGMENT**

Physical API implementation remains downstream.

------------------------------------------------------------------------

# 30. EVENT REGISTRATION DUPLICATE RULE

The Core physical schema currently uses:

`text UNIQUE(event_id, agent_id)`

for authenticated registration.

M05 Guest registration does not provide a canonical `agent_id`.

Therefore the existing authenticated uniqueness constraint cannot be
assumed to fully define Guest duplicate prevention.

This is a physical/data design residual.

The semantic requirement is only:

`text duplicate Guest registration must not be silently accepted`

with the exact physical identity/deduplication mechanism to be resolved
downstream.

### Classification

**CONTROLLED**

No new physical key is invented here.

------------------------------------------------------------------------

# 31. EVENT FIELDS

M05 v1.3 canonical Event fields include:

-   `id`
-   `title`
-   `category`
-   `description`
-   `is_online`
-   `location`
-   `meeting_link`
-   `host`
-   `quota`
-   `related_course_id`
-   `related_project_id`
-   `submitted_by`
-   `status`
-   `start_at`
-   `end_at`
-   `deleted_at`
-   `created_at`
-   `updated_at`

M05 registration fields include:

-   registration identity;
-   Event relation;
-   participant identity representation;
-   registration status;
-   registration timestamp;
-   authenticated uniqueness boundary.

Core already contains the Event/Event Registration model.

### Classification

**AUGMENT / PRESERVE**

The field semantics are to be synchronized later without destructive
schema replacement.

------------------------------------------------------------------------

# 32. EVENT LIFECYCLE

M05 v1.3:

``` text
Create / Author
    ↓
Pending Approval where applicable
    ↓
Published OR Rejected
    ↓
Cancelled by authorized actor
```

This is distinct from participant registration approval.

Core physical status:

`text pending_approval published rejected cancelled`

is consistent with this lifecycle.

### Classification

**PRESERVE**

No lifecycle conflict found.

------------------------------------------------------------------------

# 33. EVENT DELETION / SOFT DELETE

Core contains:

`text deleted_at`

for Event deletion provenance.

M05 v1.3 retains deletion as a downstream physical concern and does not
introduce a contradictory semantic hard-delete rule.

### Classification

**PRESERVE / CONTROLLED**

No destructive change is authorized.

------------------------------------------------------------------------

# 34. CALENDAR

M05 owns Calendar representation/discovery.

Core UX already includes:

`text Month Week List`

with filters:

-   category;
-   date;
-   location;
-   online/offline;
-   relevant organization/public scope.

Event detail includes:

-   title;
-   date/time;
-   location;
-   description;
-   registration;
-   related Session where applicable.

### Classification

**PRESERVE / AUGMENT**

No Core calendar architecture replacement is required.

------------------------------------------------------------------------

# 35. M05 ↔ M06 DEVELOPER / PROJECT

M05 allows Event relation to:

`text related_project_id`

and Developer Partner Event submission.

M06 remains Developer/Project authority.

The dependency is conditional:

\`\`\`text M06 → Developer/Project context

M05 → Event semantics


    Developer/Project ownership does not grant unrestricted Event publication.

    ### Classification

    **PRESERVE**

    No authority inversion.

    ---

    # 36. M05 ↔ M09 ADMIN / MODERATION

    M09 is the administrative control surface.

    M05 owns Event business semantics.

    Core dependency matrix already states:

    ```text M09 → M05
    CONDITIONAL
    Event moderation

Therefore:

`text M09 operational moderation/configuration ≠ M09 ownership of Event business truth`

M05 retains canonical Event semantics.

### Classification

**PRESERVE**

------------------------------------------------------------------------

# 37. M05 ↔ M08 NOTIFICATION

M05 provides Event state/start conditions.

M08 provides notification/projection behavior.

M05 must not create a parallel notification authority.

### Classification

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 38. M05 ↔ M10 AUTHORIZATION

M10 remains authorization authority.

M05 defines the business capability families and actor intent:

-   Event lifecycle;
-   Event Registration;
-   Event cancellation;
-   Developer Partner submission;
-   Guest registration.

M05 does not create a parallel RBAC model.

Existing role vocabulary remains:

`text BYPASS ALL OWN NONE`

where applicable.

### Classification

**PRESERVE**

------------------------------------------------------------------------

# 39. M05 PERMISSION / ACTION FAMILY

Current M05 v1.3 permission matrix:

  ------------------------------------------------------------------------------------------------------------
  Resource       Action       Superadmin   Manager    Admin      Instructor   Agent   Developer    Buyer
                 family                                                               Partner      
  -------------- ------------ ------------ ---------- ---------- ------------ ------- ------------ -----------
  Event          Create /     BYPASS       GOVERNED / GOVERNED / NONE         NONE    OWN / SUBMIT VIEW WHERE
                 Update /                  ALL        ALL                                          PERMITTED
                 Publish /                                                                         
                 Lifecycle /                                                                       
                 Visibility                                                                        

  Event          Create /     BYPASS       GOVERNED   GOVERNED   CONTEXTUAL   OWN     CONTEXTUAL   OWN
  Registration   View /                                                                            
                 Update /                                                                          
                 Lifecycle                                                                         

  Event          Lifecycle    BYPASS       GOVERNED   GOVERNED   NONE         NONE    NONE unless  NONE
  cancellation                                                                        separately   
                                                                                      authorized   
  ------------------------------------------------------------------------------------------------------------

Important:

`text Guest registration does not grant Event administration`

and:

`text Developer Partner OWN/SUBMIT ≠ direct publish bypass`

### Classification

**AUGMENT / PRESERVE**

M10 remains the authorization authority and exact physical permission
IDs remain downstream where not evidenced.

------------------------------------------------------------------------

# 40. M05 ↔ M14 COMMERCIAL BOUNDARY

M05 Event quota is:

`text capacity of Registered participants`

It is not:

`text commercial entitlement`

M14 owns:

`text subscription add-on promotion order payment entitlement commercial quota`

M05 must not convert Event registration capacity into M14 entitlement.

### Classification

**PRESERVE / NO AUTHORITY TRANSFER**

------------------------------------------------------------------------

# 41. M05 ↔ M15 QUALIFICATION / EVIDENCE BOUNDARY

M15 owns Qualification/Evidence/Awarding.

M05 does not create qualification authority.

If Event attendance or participation later becomes evidence for another
domain, that propagation must be explicitly governed by the consuming
authoritative module.

M05 does not independently issue:

-   qualification;
-   title;
-   award;
-   credential.

### Classification

**NO-PROPAGATION**

No M15 authority is absorbed by M05.

------------------------------------------------------------------------

# 42. M05 ↔ M04 LEARNING BOUNDARY

M05 may relate an Event to a Session.

It may also carry an optional related Course.

These references do not transfer Learning authority.

The critical invariants remain:

`text Event Registration ≠ Session Enrollment Event ≠ Session Event ≠ Learning Activity Event ≠ Learning completion`

### Classification

**PRESERVE / NO AUTHORITY TRANSFER**

------------------------------------------------------------------------

# 43. M05 ↔ M11 DISCOVERY / SEO

M11 owns public discovery/SEO/measurement.

M05 provides Event state/content.

M05 does not independently define the platform-wide SEO architecture.

Calendar/Event public visibility can be consumed by M11 according to M11
policy.

### Classification

**PRESERVE / AUTHORITY-SEPARATED**

------------------------------------------------------------------------

# 44. CORE API DELTA REGISTER

The current Core API already contains:

`text GET /events GET /events/{id} POST /events/{id}/rsvp POST /events PUT /events/{id} DELETE /events/{id} POST /developer-partners/events`

M05 v1.3 does not justify replacing these endpoint families.

Required semantic augmentations:

1.  RSVP endpoint must support the approved Guest registration path.
2.  Event registration endpoint must expose the locked
    registration-window/quota rules.
3.  Registration approval behavior must distinguish default auto-confirm
    from explicit Event Owner closed/manual approval.
4.  Event provider policy must be represented where the API contract
    covers online Event configuration.
5.  Conditional meeting-link notification behavior must not promise
    unavailable links.

### Classification

**AUGMENT**

No endpoint replacement is authorized.

------------------------------------------------------------------------

# 45. CORE DATA / ERD DELTA REGISTER

Existing Core Event structures are already present.

Required semantic additions:

-   precise quota meaning;
-   unnumbered/unranked waitinglist;
-   first-successful-registration slot capture;
-   registration cutoff;
-   pre-start cancellation quota return;
-   optional attendance/no-show behavior;
-   Guest registration semantics;
-   Guest notification destination;
-   provider policy.

Controlled physical residuals:

-   Guest persistence;
-   Guest deduplication;
-   provider binding persistence;
-   failover state representation;
-   waitlist promotion transaction.

### Classification

**AUGMENT + CONTROLLED**

No physical table deletion/merge/rename is authorized by this gate.

------------------------------------------------------------------------

# 46. CORE UI / UX DELTA REGISTER

Existing Core Calendar/Event UX is aligned.

Required semantic augmentations:

-   Event Registration approval mode:
    -   default auto-confirm;
    -   Event Owner may configure closed/manual approval;
-   waitinglist shown without queue number/rank;
-   registration remains possible through `start_at + 1 hour` while
    eligible/capacity permits;
-   Guest registration path;
-   conditional meeting-link messaging;
-   provider status/policy presentation only where supported by the
    defined Event contract;
-   no claim of universal iframe.

### Classification

**AUGMENT**

Existing Calendar/Event UI detail remains preserved.

------------------------------------------------------------------------

# 47. CORE BUSINESS-RULE DELTA REGISTER

The following M05 rules are valid downstream semantic additions:

  -----------------------------------------------------------------------
  ID                      Rule                    Classification
  ----------------------- ----------------------- -----------------------
  M05-DELTA-001           Event quota = maximum   AUGMENT
                          Registered participants 

  M05-DELTA-002           Event quota ≠           PRESERVE
                          entitlement / Session   
                          capacity                

  M05-DELTA-003           Waitinglist             ADD-NEW
                          unnumbered/unranked     

  M05-DELTA-004           First successful        ADD-NEW
                          registration captures   
                          available slot          

  M05-DELTA-005           Registration allowed    ADD-NEW
                          until start + 1 hour    

  M05-DELTA-006           Registration disabled   ADD-NEW
                          after cutoff            

  M05-DELTA-007           Pre-start Registered    ADD-NEW
                          cancellation returns    
                          one quota slot          

  M05-DELTA-008           No-show does not        ADD-NEW
                          auto-cancel             

  M05-DELTA-009           Attendance optional     ADD-NEW

  M05-DELTA-010           Start notification      ADD-NEW
                          targets Registered +    
                          Waitinglist             

  M05-DELTA-011           Default registration    ADD-NEW
                          auto-confirm            

  M05-DELTA-012           Event Owner may         ADD-NEW
                          configure closed/manual 
                          registration approval   

  M05-DELTA-013           Developer Partner Event PRESERVE
                          submission is subject   
                          to approval             

  M05-DELTA-014           LiveKit primary         ADD-NEW

  M05-DELTA-015           Zoom fallback 1         ADD-NEW

  M05-DELTA-016           Daily fallback 2        ADD-NEW

  M05-DELTA-017           Google Meet external    ADD-NEW

  M05-DELTA-018           Provider determined     ADD-NEW
                          before Event start      

  M05-DELTA-019           Provider-specific       AUGMENT
                          settings remain         
                          provider-owned          

  M05-DELTA-020           Guest registration      ADD-NEW
                          allowed                 

  M05-DELTA-021           Guest email =           ADD-NEW
                          notification/contact    
                          destination, not        
                          identity                

  M05-DELTA-022           Conditional             ADD-NEW
                          meeting-link            
                          notification            

  M05-DELTA-023           Event Registration ≠    PRESERVE
                          Session Enrollment      

  M05-DELTA-024           M05 does not create M04 NO-PROPAGATION
                          Session permissions     

  M05-DELTA-025           M05 does not create M15 NO-PROPAGATION
                          qualification authority 
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 48. SEMANTIC CONFLICT REGISTER

The Core-vs-M05 scan found **one material semantic ambiguity requiring
explicit reconciliation/clarification**:

## M05-CF-001 --- Event Approval vs Registration Approval

### Core

Core contains:

``` text
Event status = pending_approval / published / rejected / cancelled
```

and Event moderation is represented as an administrative capability.

### M05

M05 contains two distinct concepts:

``` text
Event publication approval
```

and:

``` text
Event Registration approval
```

Registration approval defaults to auto-confirm and is optionally
configurable by the Event Owner.

### Risk

Without clarification, a downstream reader could incorrectly interpret:

`text Event pending_approval`

as:

`text every Event Registration is pending approval`

### Resolution

The Core lifecycle state:

`text pending_approval`

remains valid for **Event publication/submission lifecycle where
applicable**.

It must not be reused to mean mandatory participant registration
approval.

Participant registration defaults to:

`text AUTO-CONFIRM`

unless Event Owner explicitly configures:

`text CLOSED / MANUAL APPROVAL`

### Classification

**RECONCILE / CLARIFY**

### Scope

Only the ambiguous semantic interpretation is reconciled.

No Event lifecycle state is deleted.

No unrelated moderation detail is removed.

**Status: RESOLVED --- PASS**

------------------------------------------------------------------------

# 49. PHYSICAL CONFLICT / CONTROLLED REGISTER

The scan identifies physical/data differences that must not be
misclassified as semantic conflicts.

## M05-CTRL-001 --- Guest persistence

Core authenticated registration structure uses `agent_id`.

M05 allows Guest registration.

**Classification:** CONTROLLED.

## M05-CTRL-002 --- Guest duplicate identity

Existing `(event_id, agent_id)` uniqueness cannot by itself define Guest
deduplication.

**Classification:** CONTROLLED.

## M05-CTRL-003 --- Provider binding persistence

M05 does not evidence final physical binding representation.

**Classification:** CONTROLLED.

## M05-CTRL-004 --- Provider health/failover detection

M05 policy exists; runtime detection is not evidenced.

**Classification:** CONTROLLED.

## M05-CTRL-005 --- Waitlist promotion transaction

Business rule exists; exact transaction mechanics are not evidenced.

**Classification:** CONTROLLED.

## M05-CTRL-006 --- Exact physical permission IDs

Semantic permission families exist; exact physical IDs are not invented.

**Classification:** CONTROLLED.

None of these block semantic PASS.

------------------------------------------------------------------------

# 50. NO-PROPAGATION REGISTER

The following must not be propagated from M05 into unrelated Core
authority:

1.  M05 does not create M04 Session permission families.
2.  M05 does not create M15 Qualification/Evidence authority.
3.  M05 does not create M14 commercial entitlement.
4.  M05 does not create a new platform RBAC role.
5.  M05 does not create universal iframe architecture.
6.  M05 does not turn Guest email into canonical identity.
7.  M05 does not make Event Registration equivalent to Session
    Enrollment.
8.  M05 does not make Event the owner of Session
    lifecycle/evidence/attendance/completion.

------------------------------------------------------------------------

# 51. SUPERSEDED / HISTORICAL REGISTER

Historical M05 v1.2 material is retained as provenance.

The following are not current authority:

-   M05 v1.2 baseline artifacts where superseded by v1.3;
-   duplicate copies inside nested packages;
-   historical correction drafts;
-   obsolete/open decisions that were resolved in QIR v1.2 and
    incorporated into v1.3.

The current authority is:

`text M05 v1.3`

with QIR v1.2 corrections incorporated.

------------------------------------------------------------------------

# 52. CORE DETAIL PRESERVATION AUDIT

The future Core synchronization must preserve all valid existing
M05/Core detail, including:

-   Event;
-   Calendar;
-   Event Registration;
-   Event lifecycle;
-   Event moderation;
-   Event/Session distinction;
-   Event API family;
-   Event physical entities;
-   Event fields already present;
-   existing Calendar UI;
-   existing authorization architecture;
-   existing M09 moderation boundary;
-   existing M10 authorization boundary;
-   existing M08 notification projection boundary;
-   existing M11 discovery boundary;
-   existing M06 Developer/Project relationship;
-   existing M04 Session relationship;
-   existing technical/provider abstraction;
-   existing physical schema detail not directly contradicted.

No broad Event rewrite is authorized.

**Result: PASS**

------------------------------------------------------------------------

# 53. NO SILENT REPLACEMENT / DELETION AUDIT

This gate:

-   does not modify Core v1.3;
-   does not delete Core Event fields;
-   does not remove Event lifecycle states;
-   does not replace `/events` API family;
-   does not replace `event_registrations`;
-   does not replace Calendar UX;
-   does not create a second Event authority;
-   does not silently convert Guest into authenticated Agent;
-   does not silently create Session permissions.

**Result: PASS**

------------------------------------------------------------------------

# 54. AUTHORITY GRAPH AUDIT

``` text
M01
  ↓ identity/authentication

M10
  ↓ authorization

M05
  ├── Event
  ├── Calendar
  └── Event Registration

M04
  └── Session / Session Enrollment

M06
  └── Developer / Project context

M08
  └── Notification / Dashboard projection

M09
  └── Administration / moderation / configuration surface

M11
  └── public discovery / SEO / measurement

M14
  └── commercial entitlement / quota

M15
  └── qualification / evidence / awarding
```

No circular authority was introduced.

**Result: PASS**

------------------------------------------------------------------------

# 55. M05 ↔ M15 AUTHORITY BOUNDARY

Explicit check:

`text M05 Event participation ≠ M15 Qualification`

M05 may produce Event Registration and attendance-related Event state.

M15 remains qualification/evidence authority.

No M05 rule grants:

-   qualification;
-   title;
-   award;
-   credential issuance.

If future Event participation becomes qualification evidence, that must
occur through an explicit downstream evidence contract and does not
transfer authority to M05.

### Classification

**NO-PROPAGATION**

**Result: PASS**

------------------------------------------------------------------------

# 56. M05 ↔ M04 AUTHORITY BOUNDARY

Explicit check:

`text M05 Event Registration ≠ M04 Session Enrollment`

No M05 question or artifact creates a Session permission family.

No M05 rule creates:

-   Session completion;
-   Learning Activity completion;
-   LP reward;
-   Certificate;
-   Qualification;
-   Award.

### Classification

**NO-PROPAGATION**

**Result: PASS**

------------------------------------------------------------------------

# 57. SEMANTIC COMPLETENESS VS PHYSICAL IMPLEMENTATION

M05 semantic baseline is sufficiently complete for PRE-00-G.

The following remain outside semantic PASS:

-   Guest physical persistence;
-   Guest deduplication implementation;
-   provider credentials;
-   provider binding storage;
-   runtime health detection;
-   runtime failover;
-   exact waitlist transaction;
-   exact physical permission IDs;
-   API deployment;
-   RLS implementation;
-   runtime UI verification.

These are downstream.

**Physical/runtime status: CONTROLLED / NOT CLAIMED**

------------------------------------------------------------------------

# 58. DEDICATED M05 CORE DELTA / IMPACT MATRIX

## Summary

  Classification     Count
  ---------------- -------
  PRESERVE              14
  AUGMENT                8
  ADD-NEW               18
  RECONCILE              1
  CONTROLLED             6
  NO-PROPAGATION         8
  SUPERSEDED             1

Counts represent classified M05 impact findings, not Core file counts.

The categories are not mutually exclusive across individual semantic
themes where a theme has both a semantic addition and a downstream
controlled physical consequence.

------------------------------------------------------------------------

# 59. M05 → CORE PROPAGATION TARGETS

Approved later Core synchronization targets:

### Functional / PRD

-   Event quota semantics;
-   waitinglist;
-   registration window;
-   cancellation quota return;
-   attendance/no-show;
-   registration approval mode;
-   Guest registration;
-   provider policy.

### User Flow / UI-UX

-   Event Calendar detail;
-   registration path;
-   waitinglist behavior;
-   Guest path;
-   conditional link messaging;
-   registration approval mode.

### API

-   `/events`;
-   `/events/{id}`;
-   `/events/{id}/rsvp`;
-   `/developer-partners/events`.

### ERD / Database Dictionary

-   semantic Event fields;
-   registration semantics;
-   Guest representation as controlled downstream item.

### Business Rules

-   M05 delta register in Section 47.

### Authorization

-   Event/Event Registration capability families consumed by M10;
-   no new platform role;
-   no M04 Session permission propagation.

### SEO / Discovery

-   Event public state can be consumed by M11;
-   M05 does not become SEO authority.

------------------------------------------------------------------------

# 60. INTEGRATION ORDER CONSTRAINT

M05 delta propagation must follow:

`text Semantic   ↓ Architecture / Dependency   ↓ Business Rules   ↓ ERD / DB Dictionary / Schema   ↓ API   ↓ RBAC / RLS   ↓ Functional / UI-UX / SEO   ↓ Physical/runtime verification`

No downstream physical artifact may be used to silently change the M05
semantic authority.

------------------------------------------------------------------------

# 61. PRE-00-G CHECKLIST

  -----------------------------------------------------------------------
  Checklist item                      Status
  ----------------------------------- -----------------------------------
  Current M05 authority identified    PASS

  M05 v1.3 treated as current         PASS / LOCKED
  authority                           

  M05 QIR v1.2 incorporated as        PASS
  correction lineage                  

  Historical v1.2 material excluded   PASS
  from current authority              

  Dedicated M05 Core Delta/Impact     PASS / LOCKED
  artifact created                    

  M05 compared against Core v1.3      PASS

  Core v1.3 modified during gate      NO

  Event authority remains M05         PASS

  Calendar authority remains M05      PASS

  Event Registration authority        PASS
  remains M05                         

  Event quota defined as max          PASS / LOCKED
  Registered                          

  Event quota not treated as          PASS / LOCKED
  entitlement                         

  Waitinglist unnumbered/unranked     PASS / LOCKED

  First successful registration       PASS / LOCKED
  captures slot                       

  Registration cutoff = start + 1     PASS / LOCKED
  hour                                

  Pre-start cancellation returns      PASS / LOCKED
  quota                               

  Attendance optional                 PASS / LOCKED

  No-show does not auto-cancel        PASS / LOCKED

  Start notification Registered +     PASS / LOCKED
  Waitinglist                         

  Event publication approval          PASS / LOCKED
  separated from registration         
  approval                            

  Registration default auto-confirm   PASS / LOCKED

  Event Owner manual/closed override  PASS / LOCKED

  Developer Partner submission        PASS
  subject to approval                 

  LiveKit primary                     PASS / LOCKED

  Zoom fallback 1                     PASS / LOCKED

  Daily fallback 2                    PASS / LOCKED

  Google Meet external                PASS / LOCKED

  Provider determined before Event    PASS / LOCKED
  start                               

  Provider settings remain            PASS
  provider-owned                      

  Universal iframe not claimed        PASS

  Guest registration allowed          PASS / LOCKED

  Guest email not canonical identity  PASS / LOCKED

  Conditional link notification       PASS / LOCKED

  Guest physical persistence marked   PASS
  controlled                          

  Event Registration ≠ Session        PASS / LOCKED
  Enrollment                          

  M05 does not create M04 Session     PASS / NO-PROPAGATION
  permissions                         

  M05 does not absorb M15             PASS / NO-PROPAGATION
  Qualification/Evidence              

  M05 does not own M14 commercial     PASS
  entitlement                         

  M10 remains authorization authority PASS

  M09 remains                         PASS
  administration/moderation surface   

  M08 remains notification/projection PASS
  layer                               

  M11 remains discovery/SEO authority PASS

  M06 remains Developer/Project       PASS
  authority                           

  Core detail preservation            PASS

  No silent deletion/replacement      PASS

  Physical/runtime proof claimed      NO

  Blocking M05 semantic conflict      NONE
  remaining                           
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 62. GATE DECISION

## PRE-00-G STATUS: PASS --- LOCKED

The mandatory M05 Delta/Impact requirement is satisfied.

The current M05 semantic authority is:

``` text
M05 v1.3
```

The dedicated M05 → Core Delta/Impact Reconciliation is now established.

### The single semantic clarification requiring reconciliation is:

``` text
Event publication approval
        ≠
Event Registration approval
```

Core Event lifecycle:

``` text
pending_approval
published
rejected
cancelled
```

remains valid for Event publication/submission lifecycle where
applicable.

M05 Event Registration defaults to:

`text AUTO-CONFIRM`

with an Event Owner option for:

`text CLOSED / MANUAL APPROVAL`

The two approval layers must not be collapsed.

### M05 Guest capability

Guest registration is valid.

Guest email is a notification/contact destination and is not canonical
platform identity.

Guest physical persistence remains controlled downstream.

### Provider policy

\`\`\`text LiveKit ↓ fallback 1 Zoom ↓ fallback 2 Daily

Google Meet = external


    Provider must be determined before Event start.

    Runtime failover/health detection is not claimed.

    ### Session boundary

    ```text Event Registration ≠ Session Enrollment

No M05 Session permission family is created.

### M15 boundary

`text Event participation ≠ Qualification`

No M05 qualification/evidence authority is created.

### Commercial boundary

`text Event quota ≠ Commercial entitlement`

M14 remains commercial authority.

### Final semantic state

`text M05 v1.3     ↓ Core Delta / Impact Register     ↓ NO UNRESOLVED BLOCKING SEMANTIC CONFLICT     ↓ READY FOR PRE-00-H`

------------------------------------------------------------------------

# 63. DOWNSTREAM CORE SYNCHRONIZATION CONSTRAINT

Later Core synchronization shall:

### RECONCILE

Only:

`text Event approval lifecycle vs Event Registration approval semantics`

where the wording is ambiguous.

### AUGMENT / ADD-NEW

Add the valid M05 detail for:

-   quota;
-   waitinglist;
-   registration window;
-   cancellation quota return;
-   attendance;
-   notification;
-   registration approval mode;
-   provider policy;
-   Guest registration;
-   conditional meeting-link behavior.

### CONTROLLED

Track, without semantic fabrication:

-   Guest physical persistence;
-   Guest deduplication;
-   provider binding;
-   failover detection;
-   waitlist transaction;
-   physical permission IDs.

### NO-PROPAGATION

Do not propagate:

-   M04 Session permissions;
-   M15 qualification authority;
-   M14 commercial entitlement authority;
-   new platform roles;
-   universal iframe architecture.

------------------------------------------------------------------------

# 64. RE-ENTRY RULE

No PRE-00-G re-entry is currently required.

If later evidence introduces a new contradiction, use a dynamic
sub-step:

`text PRE-00-G-1 PRE-00-G-2 ...`

Do not renumber the main gate.

Parent PRE-00-G must be reopened/blocked as appropriate, the new
contradiction resolved, and all affected downstream checks rerun.

------------------------------------------------------------------------

# 65. FINAL LOCKED STATEMENT

**PRE-00-G --- M05 Mandatory Delta / Impact Gate v1.0 = PASS / LOCKED.**

M05 v1.3 is the sole current M05 semantic authority.

The dedicated M05 → Core Delta/Impact artifact is complete.

Core v1.3 remains immutable.

No valid Core detail is removed.

The M05 domain remains:

``` text
M05
├── Event
├── Calendar
└── Event Registration
```

The principal semantic invariants are:

`text Event Registration ≠ Session Enrollment Event quota ≠ Commercial entitlement Event quota ≠ Session capacity Guest email ≠ canonical user identity Event publication approval ≠ Registration approval M05 Event ≠ M04 Session M05 Event participation ≠ M15 Qualification M05 Event quota ≠ M14 commercial entitlement`

The current Event Registration model is:

\`\`\`text Event ↓ Registration ├── Registered ├── Waitinglist ├──
Attended (optional) └── Cancelled

Quota ↓ Maximum Registered

Full ↓ Waitinglist ├── no number ├── no rank └── first successful
registration captures available slot

Registration window ↓ before start through start + 1 hour

Registered cancellation before start ↓ return one quota slot


    Approval:

    ```text Event publication
    → approval where applicable

    Registration
    → AUTO-CONFIRM by default
    → Event Owner may configure CLOSED / MANUAL APPROVAL

Online provider:

\`\`\`text LiveKit ↓ Zoom ↓ Daily

Google Meet → external


    Guest:

    ```text Guest registration
    → allowed
    → email may be notification/contact destination
    → email is not canonical identity

Physical/runtime:

`text CONTROLLED / DOWNSTREAM`

No physical/runtime PASS is claimed.

**PRE-00-G = PASS / LOCKED.**

**Next gate: PRE-00-H --- M06 Developer / Project / Marketing / Claim
Gate.**
