# SaaS Project Structure — RumahAgen

> Catatan: dokumen ini awalnya ditulis untuk corpus `docs/core/current/` saja
> (dari `Core_baru_RumahAgen-SaaS-GitHub-Ready.zip`). Baris 13 di bawah menambahkan
> rujukan ke `docs/design/wireframes/` (dari `WF_Wire.zip`), yang sudah digabung
> ke repo ini di bawah struktur modul WF-00 s.d. WF-11. Lihat `README.md` di root
> untuk peta folder lengkap.

## Reading order for an implementation agent (Bolt)

1. `docs/core/current/00-governance/` — authority, gates, reconciliation lineage.
2. `docs/core/current/01-business-rules/STEP-08` — business rules.
3. `docs/core/current/02-architecture/` — Constitution, System Architecture, Technical Decisions, Dependency and gates.
4. `docs/core/current/03-data/` — complete Step 10 ERD/Entity mapping/Dictionary/Schema synchronization.
5. `docs/core/current/04-api/STEP-11-API-SYNCHRONIZATION` — complete API source pack; do not split it.
6. `docs/core/current/05-authorization/STEP-12-RBAC-PERMISSION-RLS-SYNCHRONIZATION` — complete authorization source pack; do not reduce it to only RBAC or only RLS.
7. `docs/core/current/06-product/STEP-13-SUCCESSOR-SPECIFICATIONS` — complete Step 13 source pack, including A-I.
8. `docs/core/current/07-reconciliation/STEP-14-FULL-CROSS-DOCUMENT-RECONCILIATION`.
9. `docs/core/current/P-SERIES/P01_MODULE_DEPENDENCY-P05_EXECUTION_BATCH` — module architecture/planning.
10. `docs/core/current/P-SERIES/P06_M01_M07-P07_M08_M15` — complete module execution packs M01-M07 and M08-M15.
11. `docs/core/current/P-SERIES/P08_EXECUTION_AUDIT-P09_ENGINEERING_ALIGNMENT` — execution audit and engineering alignment.
12. `docs/core/current/P-SERIES/P10_AI_BLUEPRINT-P11_AI_CONTEXT` — AI blueprint and AI context.
13. `docs/core/current/P-SERIES/P12_RECONCILIATION_EVIDENCE-P16_README_CURRENT_BASELINE` — reconciliation, decisions, manifest, current state, current README baseline.
14. `docs/design/wireframes/` — visual reference per module, WF-00 through WF-11 (see mapping table in root `README.md` and `audit/WIREFRAME_DEEP_SCAN_REPORT.md`). Use alongside the matching Step/P source pack above — the wireframes do not redefine business rules, data, API, or authorization semantics that already live in `docs/core/current/`.
15. `CHECKLIST_RESIDUAL_IMPLEMENTASI.md` — the 31 unique controlled residuals (deduped from the 47-row register), mapped to modules M01–M15, with the dependency-ordered execution sequence. `supabase/migrations/0001`–`0010` and `apps/web/` already implement the M10 Authorization slice of this checklist (Tahap 0 + Tahap 1) — see `supabase/migrations/README.md` and `apps/web/README.md` for what specifically is done versus still pending.

## Supabase implementation boundary

The current repository contains the authoritative data/API/authorization specifications and any SQL present in the source packs. It does not fabricate a migration sequence or runtime handlers. Before `supabase db push`, SQL must be converted/validated into an ordered migration set with dependency, RLS, function, trigger, storage, and seed checks.

## Important

P06_M01_M07/P07_M08_M15 are not placed under API. They are execution packs. Their API dependencies are resolved by reading Step 11 and the P4/P5 execution architecture/batch plan.

Step 11 is not divided into API subfolders. The entire source pack remains one unit.

Step 12 is not divided into separate RBAC/Permission/RLS folders. The entire source pack remains one unit.

Step 10 remains one data synchronization unit, while its role is explicitly documented as A1/A2/B ERD/entity relationship, C dictionary, D schema, E synchronization/correction.
