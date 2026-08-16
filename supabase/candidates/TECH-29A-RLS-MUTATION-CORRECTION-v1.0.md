# TECH-29A — RLS Mutation Correction Candidate v1.0

Status: DEVELOPMENT-ONLY CONTROLLED CANDIDATE — NOT CANONICAL / NOT PRODUCTION

## Source basis
- TECH-28 frozen role mapping: Manager/Admin receive `Assign-LearningSession` and `Manage-SessionProvider` at all scope; Instructor/Agent do not.
- TECH-28 frozen mutation mapping: assignment INSERT/UPDATE/REVOKE requires Assign-LearningSession plus privileged scope; no self-assignment shortcut.
- TECH-28 governing boundary: provider mutation requires privileged provider permission plus appropriate Host/admin/system authorization.
- TECH-25/TECH-24 intentionally left assignment/provider mutation RLS conservative and deferred.

## Implementation correction
This candidate adds only the missing database-layer mutation policies needed to exercise the already-frozen authorization mapping at runtime. It does not add permissions, roles, capabilities, relationships, or business rules.

### Assignment
- INSERT requires `auth_has_scope_all('M04','Assign-LearningSession')` and records `created_by = auth.uid()`.
- UPDATE is limited to revocation: caller must have Assign permission and the resulting row must be `REVOKED` with `revoked_by = auth.uid()` and `revoked_at IS NOT NULL`.
- No DELETE policy is added; assignment history remains auditable.
- No Instructor/Agent self-assignment shortcut is added.

### Provider binding
- INSERT/UPDATE require `Manage-SessionProvider` plus either privileged Manager/Admin/Superadmin role or an active HOST assignment.
- Provider external ID remains infrastructure identity only.
- Instructor does not gain provider mutation merely from Instructor role.

## Safety / provenance
The candidate is executed only on the Development Supabase environment. It must be runtime-tested before any promotion or canonical synchronization.

## External implementation note
The use of a separate RLS mutation policy per operation follows standard PostgreSQL/Supabase policy mechanics. No external guidance is treated as architecture authority; it only informs safe SQL composition.
