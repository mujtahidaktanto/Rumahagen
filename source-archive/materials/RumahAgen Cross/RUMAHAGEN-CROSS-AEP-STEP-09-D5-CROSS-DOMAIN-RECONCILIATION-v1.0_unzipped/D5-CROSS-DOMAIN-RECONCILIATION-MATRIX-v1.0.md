# D5 Cross-Domain Reconciliation Matrix v1.0

| Domain Handoff | Canonical Handoff | Result | Key Control | Treatment |
|---|---|---|---|---|
|Commercial → Learning|Confirmed Payment → Purchased LP Grant|ALIGNED|Commercial remains payment authority; Learning consumes trusted confirmed outcome; purchased LP grant is idempotent.|No change|
|Commercial → Session|Entitlement/access outcome → Session activation|ALIGNED|Session consumes commercial entitlement/authorization outcome; Session does not implement payment.|No change|
|Commercial → Awarding|Payment/Entitlement → possible evidence only|ALIGNED|Payment does not directly issue Award; only qualifies if an Awarding Rule explicitly permits it.|No change|
|Learning → Session|Learning Activity / progression ↔ Session completion|ALIGNED / CONTROLLED|Session produces qualifying completion handoff; final Learning Activity evidence model remains MADCR-049 dependent.|Carry MADCR-049|
|Session → Learning Economy|Qualifying completion → Learning Activity → LP processing|ALIGNED / CONTROLLED|Session cannot directly mutate official LP; Learning Economy remains LP authority.|Carry MADCR-049|
|Session → Awarding|Completion/evidence → Qualification|ALIGNED|Session completion is evidence/input; Awarding owns qualification and Award Instance.|No change|
|Learning Economy → Awarding|LP/Skill/Credential → Awarding evidence|ALIGNED|LP/credential is evidence only where Path/Rule permits; no automatic Award.|No change|
|Awarding → Learning|Award result → presentation/profile|ALIGNED|Awarding remains authority; Learning may consume Award result for presentation without becoming owner.|No change|
|RBAC → Commercial|Role + permission + commercial scope|ALIGNED|RBAC authorizes actions; Commercial Entitlement is not a role.|No change|
|RBAC → Learning/Session|Role + capability + applicable authority/scope|ALIGNED / OPEN|Session Host/Instructor taxonomy remains MADCR-053/054 dependent.|Carry MADCR-053/054|
|RBAC → Awarding|Existing Role + Capability + Authority/Scope|ALIGNED|AEP3-OD-06 Option B is closed; no dedicated Issuer role.|No change|
|Event Calendar ↔ Session|Event as presentation/integration context|ALIGNED / STALE-DELTA|M05 Event remains; Learning Session is semantic authority; exact Session↔Event cardinality remains open.|Global doc sync later|
|Provider ↔ Session|Provider Binding / external ID|ALIGNED|Provider ID is infrastructure reference; provider evidence is validated/normalized/idempotent before outcome evaluation.|No change|
|Provider failover|Automatic failover|OPEN / DEFERRED|AEP4-OD-08 remains open/deferred; no architecture language closes it.|Carry OD-08|
|Award versioning|Path Version + Rule Version|ALIGNED|Historical Award provenance remains stable; Title Identity Version not introduced.|No change|
|Credential ↔ Award|Certificate/Credential vs Award Instance|ALIGNED|M04 Certificate remains distinct from M15 Award Instance.|No change|
|Historical integrity|Config changes vs historical records|ALIGNED|Commercial purchase snapshots, LP transactions, Session outcomes and Awards remain historically explainable.|No change|

## Handoff Contracts

| ID | Boundary | Contract | Invariant |
|---|---|---|---|
|H1|Commercial → Learning|Payment Confirmed → Purchased LP Grant|Commercial owns payment; Learning consumes trusted result; idempotent grant.|
|H2|Commercial → Session|Entitlement/authorization → Session Enrollment ACTIVE|Payment is not the definition of ACTIVE; free access remains possible.|
|H3|Session → Learning Economy|Qualifying Completion → Learning Activity → LP|Session does not directly issue LP; MADCR-049 remains conditional.|
|H4|Learning → Awarding|Evidence/Skill/Credential → Qualification|Awarding Rule determines whether evidence qualifies; no automatic Award.|
|H5|Session → Awarding|Completion Evidence → Qualification|Session completion is evidence only; Awarding owns Award Instance.|
|H6|RBAC → All domains|Actor Role + Capability + Scope → authorization|Authorization does not equal qualification or entitlement.|
|H7|Provider → Session|Provider Event → normalized evidence → outcome|Provider callback is evidence input, not business outcome.|
|H8|Event → Session|Event Calendar → discovery/presentation/integration|M05 Event remains; Session is semantic authority.|
