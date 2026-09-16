# WF-05 State & Interaction Rules v1.1 — Corrected

## Event lifecycle
DRAFT/creation context → pending_approval where applicable → published; rejected; cancelled. Status is server-authoritative.

## Registration
Eligible → Register → authoritative confirmed or pending according to configured approval; full quota → Waitinglist; outside cutoff → registration unavailable; duplicate/replay preserves existing authoritative outcome; pre-start cancellation may release one Event quota slot after authoritative success.

## Event provider
Unbound → configure/bind → bound; provider error/unavailable → actionable error/manual recovery. Do not display automatic failover as proven. Provider must be determined before Event start.

## Session lifecycle/enrollment
Session lifecycle is server-controlled. Session Enrollment PENDING → ACTIVE → COMPLETED. Only authorized ACTIVE enrollment resolves access. Participation/evidence is not itself completion.

## Global
Loading, Ready, Empty, Pending, Success/Confirmed, Rejected, Failed, Expired, Unauthorized, Protected non-existence, Retry/Recovery, Offline/Interrupted as applicable. Forms add untouched/dirty/valid/invalid/submitting/submitted/server-error.

## Physical/runtime boundary
Missing physical DB, migration, API runtime, RLS, runtime authorization, provider credentials, integration or production proof never blocks wireframe creation. Only unresolved semantic/authority/UX contradiction can block.
