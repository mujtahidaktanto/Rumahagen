# RUMAHAGEN — TECH-29B Development Tester & Fixture Matrix v1.0

## Purpose
Define deterministic development test identities and cross-domain fixtures before provisioning persistent tester accounts. This is test infrastructure only; it does not change business semantics or authorization decisions.

## Environment
Supabase `main` = Development Environment. Production is out of scope.

## Canonical roles
The current RBAC migration seeds exactly seven physical system roles: `superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, and `buyer`. Guest is not a physical role row.

## Tester identities
| Identity | Role | Primary verification domains |
|---|---|---|
| tech29-superadmin | superadmin | RBAC, admin, DBR config, cross-domain privileged boundaries |
| tech29-manager | manager | organization, listing management where granted, DBR, learning/session management |
| tech29-admin | admin | administrative and privileged management boundaries |
| tech29-instructor | instructor | learning content, learner progress visibility, session Host/Instructor separation |
| tech29-agent | agent | agent profile, listing, DBR simulation, organization membership, learning, session learner flow |
| tech29-developer | developer_partner | developer/project and explicitly granted cross-domain capabilities only |
| tech29-buyer | buyer | public listing/profile, buyer review, learner/session boundaries where explicitly granted |

## Core fixture set
### F01 — Agent profile
At least one deterministic agent profile for `tech29-agent`; profile must exercise public visibility and owner update boundary. `agent_profiles` is keyed to `users` and includes public slug and contact/profile fields.

### F02 — Property listing
At least one `tech29-agent` listing with a valid region reference and optional organization/developer relationship. Use status transitions as separate test fixtures: `draft`, `published`, and one terminal/public state (`sold` or `rented`) where required by the test matrix. Child fixtures may include photos, videos, amenities, price history, lead and view records.

### F03 — DBR
At least one DBR simulation linked to the test listing, owned by `tech29-agent`. Validate owner visibility and privileged configuration boundary. Do not use real prospect financial data.

### F04 — Organization
At least one synthetic organization with deterministic leader/member relationship. Use `tech29-agent` as member and a privileged test identity as leader only where source authorization permits.

### F05 — Learning
At least one published course, lesson, quiz, enrollment and quiz-attempt path using synthetic content. Avoid claiming AEP Learning Economy completion semantics where the current physical M04 schema does not yet represent them.

### F06 — Learning Session
At least one synthetic Session with owner, visibility state, organization relation where applicable, Host assignment and Instructor assignment. Keep Host and Instructor as resource capabilities, not roles.

### F07 — Session enrollment
Create controlled `PENDING` and `ACTIVE` examples only through the supported lifecycle path. Learner self-promotion must remain denied.

### F08 — Provider binding
Create a synthetic provider binding only for authorization testing. External provider credentials are never stored in fixtures.

## Domain coverage matrix
| Role | Profile | Listing | DBR | Organization | Learning | Session | Admin/RBAC |
|---|---:|---:|---:|---:|---:|---:|---:|
| superadmin | ✓ | privileged boundary only | ✓ | ✓ | ✓ | ✓ | ✓ |
| manager | ✓ | verify source grant | ✓ | ✓ | ✓ | ✓ | ✓ limited |
| admin | ✓ | verify source grant | ✓ | ✓ | ✓ | ✓ | ✓ |
| instructor | ✓ | no assumption | no assumption | no assumption | ✓ | ✓ | — |
| agent | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| developer_partner | ✓ | only if explicitly granted | — | only if explicitly granted | only if explicitly granted | only if explicitly granted | — |
| buyer | public/read boundaries | public only | — | no assumption | explicit learner boundary only | explicit learner boundary only | — |

## Negative-test matrix
Each fixture set must include explicit negative checks. Minimum examples:
- buyer cannot mutate another agent's profile;
- buyer cannot mutate an agent listing;
- agent cannot manage another agent's listing without approved organization scope;
- instructor cannot assign a Session or manage provider merely because the user has the Instructor role;
- learner cannot self-promote enrollment lifecycle;
- unauthorized actor cannot create/revoke Session assignment;
- unauthorized actor cannot mutate provider binding;
- organization boundary does not expose organization-private Session resources to non-members;
- DBR owner boundary protects another agent's simulation;
- Superadmin-only DBR configuration remains protected.

## Seed rules
1. Use synthetic identities and synthetic business data only.
2. Deterministic logical identifiers; database UUIDs may remain generated.
3. Idempotent where practical.
4. No passwords, access tokens, service-role keys, or provider credentials in Git.
5. Persistent tester accounts may remain in Development after TECH-29; relationship fixtures may be recreated.
6. Do not seed a relationship merely because a role exists; verify the corresponding source permission/policy first.

## Source boundaries
This matrix is derived from the current repository migration baseline and the TECH-29 runtime scope. Where the physical M01–M13 schema does not yet represent a later AEP semantic construct, this matrix does not invent one.

## Next gate
TECH-29B-02 — provision persistent tester identities and then TECH-29B-03 — create cross-domain synthetic fixtures, subject to final source-level permission checks.
