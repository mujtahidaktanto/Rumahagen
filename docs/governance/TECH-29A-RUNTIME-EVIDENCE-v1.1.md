# TECH-29A — Runtime Evidence v1.1

## Environment
Supabase `RumahAgen project` / Development Environment / ref `bjbczvhpikeyoganbyla`.
Production remains out of scope.

## Current runtime state
M01–M13, TECH-25 Session candidate and TECH-28 authorization seed are present in the Development database. Synthetic fixtures are isolated and non-production.

## Family results
### A — Seed Integrity: PASS
- 14 M04 Session permission rows exist.
- Manager/Admin receive the full frozen Session permission family at `all` scope.
- Instructor receives 12 Session learning permissions and does not receive Assign/Provider mutation permissions.
- Agent receives the four frozen enrollment/evidence/artifact permissions.
- DevPartner/Buyer receive no default Session permission rows.

### B — Assignment Integrity: PASS
- Active duplicate rejected by the unique partial index.
- Invalid capability rejected by CHECK constraint.
- Invalid lifecycle state/timestamp combinations are constrained.
- Dual HOST + INSTRUCTOR capability is representable.

### C — Host/Instructor Separation: PASS
- Instructor role does not imply HOST.
- Instructor has no Assign-LearningSession or Manage-SessionProvider grant.
- HOST and INSTRUCTOR remain resource-level values.

### D — Assignment Mutation Authorization: PASS WITH CONTROLLED CANDIDATE
- Initial conservative candidate correctly denied mutation because mutation policies were intentionally absent.
- A development-only TECH-29A mutation candidate was then applied from the frozen TECH-28 mapping.
- Manager with Assign-LearningSession can INSERT an assignment.
- Manager can REVOKE an ACTIVE assignment and must provide `revoked_by = auth.uid()` plus `revoked_at`.
- Instructor without Assign-LearningSession is denied by RLS (`42501`).
- No DELETE policy is introduced; assignment history remains auditable.

### E — Visibility / Organization: PASS WITH CONTROLLED CORRECTION
- Buyer sees only PUBLIC Session.
- Active Organization member sees PUBLIC + ORGANIZATION Session.
- PRIVATE and PARTNER are not exposed through the conservative read policies.
- Canonical M12 `organization_members` SELECT policy caused runtime `42P17` recursion. A development-only private-schema SECURITY DEFINER membership helper removed the recursion without changing membership semantics.

### F — Learner Lifecycle: PASS
- Agent can create/read own PENDING enrollment.
- Agent cannot self-promote PENDING → ACTIVE/COMPLETED because no generic learner lifecycle UPDATE policy exists.

### G — Provider Operation Authorization: PASS WITH CONTROLLED CANDIDATE
- Initial owner-read-only candidate denied Manager provider mutation.
- Development-only TECH-29A mutation candidate was then applied from frozen TECH-28 semantics.
- Manager can create provider binding under `Manage-SessionProvider`.
- Provider policy additionally requires privileged Manager/Admin/Superadmin path or HOST capability when a non-privileged actor eventually receives provider permission.
- Instructor remains denied because Instructor has no Manage-SessionProvider grant.

### H — RLS Second Layer: PASS WITH CONTROLLED CORRECTIONS
- Session resources have RLS enabled.
- JWT subject simulation works using `request.jwt.claim.sub` with PostgreSQL role `authenticated`.
- PUBLIC/ORGANIZATION visibility boundaries were runtime-tested.
- Assignment mutation is denied without frozen permission and allowed for Manager after the controlled policy candidate.
- Provider mutation is denied for Instructor and allowed for Manager after the controlled policy candidate.
- Learner lifecycle is protected at the database layer.

## Controlled corrections requiring canonical reconciliation
1. M01–M03 migration dependency-order correction.
2. M12 `organization_members` RLS recursion correction.
3. TECH-29A assignment mutation RLS candidate.
4. TECH-29A provider mutation RLS candidate.

These are development execution artifacts. They have **not** been promoted to `main` and do not authorize production.

## Current gate
TECH-29 is now **RUNTIME-PASS CANDIDATE / CANONICAL-RECONCILIATION HOLD**.

Runtime behavior is materially verified in Development, but the project cannot yet claim canonical TECH-29 PASS until the four controlled corrections are reconciled into the canonical migration/RLS baseline and the corrected package is re-run from a clean Development reset.
