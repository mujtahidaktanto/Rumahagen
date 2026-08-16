# TECH-29A — Initial Runtime Evidence v1.0

## Environment
Supabase `RumahAgen project` / Development Environment / ref `bjbczvhpikeyoganbyla`.
Production remains out of scope.

## Executed layers
- M01–M13 baseline: controlled dependency correction + canonical 0004–0015.
- TECH-25 consolidated Session candidate: executed.
- TECH-28 final authorization seed: executed.
- Synthetic fixtures only.

## Runtime evidence
### Family A — Seed Integrity
PASS for initial seed integrity checks:
- 14 new M04 Session permission rows exist.
- Manager = 14 Session grants.
- Admin = 14 Session grants.
- Instructor = 12 Session grants; no Assign/Provider grants.
- Agent = 4 Session grants.
- DevPartner/Buyer = 0 Session grants.
- Scope values remain within the existing all/own/none vocabulary.

### Family B — Assignment Integrity
PASS for database integrity controls:
- duplicate active assignment rejected by unique index;
- invalid capability rejected by CHECK constraint;
- existing fixture demonstrates HOST + INSTRUCTOR dual capability on the same actor/session.

### Family C — Host/Instructor Separation
PASS at seed/capability boundary:
- Instructor role has no Assign-LearningSession permission.
- Instructor role has no Manage-SessionProvider permission.
- HOST and INSTRUCTOR are explicit resource assignment values.
- Dual capability remains representable without creating a Host role.

### Family D — Assignment Mutation Authorization
BLOCKED / CONTROLLED RESIDUAL.
Manager has the frozen Assign-LearningSession permission, but the executed TECH-25/TECH-24 candidate intentionally contains no assignment INSERT/UPDATE/DELETE policy. A simulated Manager INSERT therefore receives PostgreSQL `42501` RLS denial. Source explicitly marked assignment mutation RLS/server authorization as controlled; no undocumented policy was invented.

### Family E — Visibility / Organization
PARTIAL PASS after controlled RLS recursion correction:
- Buyer sees only PUBLIC Session.
- Active organization member sees PUBLIC + ORGANIZATION Session.
- PRIVATE/PARTNER are not exposed by the current conservative read policies.
- Initial execution exposed a real recursive `organization_members` policy defect; development-only correction `tech29a_org_members_rls_recursion_correction` removed the recursion while preserving membership semantics.
- GitHub Issue #2 tracks the correction.

### Family F — Learner Lifecycle
PASS for tested boundary:
- Agent can create/read own PENDING Session enrollment.
- Agent cannot self-promote PENDING to ACTIVE because no generic learner UPDATE policy exists; update affects zero rows under authenticated RLS.

### Family G — Provider Operation Authorization
BLOCKED / CONTROLLED RESIDUAL.
Manager has the frozen Manage-SessionProvider permission, but the TECH-25 candidate exposes owner-read only for provider bindings and no mutation policy. Simulated Manager INSERT receives PostgreSQL `42501`. No provider mutation policy was invented.

### Family H — RLS
PARTIAL PASS:
- RLS is enabled on Session resources.
- authenticated JWT subject simulation works with `request.jwt.claim.sub`.
- PUBLIC and ORGANIZATION visibility boundaries were runtime-tested.
- learner lifecycle protection was runtime-tested.
- Assignment and Provider mutation remain blocked by absence of mutation policies, which is consistent with the source candidate but prevents final TECH-29 PASS.

## Current blockers
1. GitHub Issue #1 — canonical 0001–0003 dependency cycle required controlled execution correction.
2. GitHub Issue #2 — canonical organization_members RLS self-recursion required controlled development correction.
3. Assignment mutation RLS candidate is not present in the source SQL; frozen TECH-28 mapping defines the semantic requirement but not an executable policy.
4. Provider mutation RLS candidate is not present in TECH-25 SQL; frozen TECH-28 mapping defines the authorization boundary but not an executable policy.

## Gate conclusion
TECH-29 remains **BLOCKED / CONTROLLED RUNTIME RESIDUALS**. Do not claim PASS until the missing mutation authorization implementation is reconciled and runtime-tested.
