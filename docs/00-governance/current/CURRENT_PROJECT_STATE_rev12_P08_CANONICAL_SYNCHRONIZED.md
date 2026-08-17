# RUMAHAGEN — CURRENT PROJECT STATE
## rev.12 — P08 Wave 1 Canonical Physical-State Synchronization

**Date:** 17 August 2026  
**Status:** **DONE — LOCAL CANONICAL ARTIFACT**  
**Synchronization State:** P08 Wave 1  
**Supersedes for current-state declaration:** prior stale/pre-development current-state declaration  
**Historical baseline:** `CURRENT-PROJECT-STATE-rev11-CROSS-AEP-D0-D1.md`

---

# 1. PURPOSE

This document is the current physical/project-state declaration for the P08 Wave 1 canonical synchronization pass.

It is intentionally separated from:

- approved semantic architecture;
- intended physical architecture;
- migration source provenance;
- actual executed database state;
- runtime application verification.

The purpose is to prevent a historical/pre-development statement from being interpreted as current physical truth.

The P08-A reconciliation explicitly classified the legacy Current Project State as **HISTORICAL / CRITICAL DRIFT** because later Development evidence established a populated Development schema, regional reference data, Auth testers, identity reconciliation and execution evidence.

---

# 2. STATE AUTHORITY MODEL

```text
Approved Decision Authority
        ↓
Canonical Semantic Architecture
        ↓
Intended Physical Model
        ↓
Executed Development State
        ↓
Runtime Verified State
```

This document reports the **current project/physical-state layer** only.

It does not redefine approved architecture decisions.

---

# 3. CURRENT PROJECT STATE SUMMARY

| Area | Current State | Classification |
|---|---|---|
| Project repository | RumahAgen repository exists and is used as implementation/evidence repository | MATCH / ACTUAL EVIDENCE |
| Canonical document synchronization | Wave 1 active; not yet fully closed | CONTROLLED |
| Development database | Supabase Development state is established enough for verified schema/data checks | ACTUAL PHYSICAL EVIDENCE |
| Supabase ↔ pgAdmin | Verified connected | PASS |
| Regional reference data | Reconciled and integrity-checked | PASS |
| Auth tester accounts | Created and Auth-confirmed | PASS |
| Auth identity | `auth.users.id = public.users.id` verified | PASS |
| RBAC foundation | Role mapping verified for controlled tester set | PASS |
| Frontend runtime | Application runtime entry point not yet verified | RUNTIME GAP |
| Production migration | Not authorized by TECH-29 gate | CONTROLLED HOLD |
| Production authorization | Not authorized | CONTROLLED HOLD |
| Full canonical document baseline | Still being completed one artifact at a time | OPEN / CONTROLLED |

---

# 4. VERIFIED DEVELOPMENT EVIDENCE

## 4.1 Supabase ↔ pgAdmin

**PASS**

The synchronization control plan records successful pgAdmin connectivity to Supabase PostgreSQL.

This is evidence of Development database accessibility, not evidence that the frontend application is runtime-complete.

---

## 4.2 Regional Reference Data

**PASS**

Verified canonical reference counts:

```text
ref_provinces = 38
ref_cities    = 514
ref_districts = 7,285
ref_villages  = 83,762
```

Integrity checks:

```text
orphan city       = 0
orphan district   = 0
orphan village    = 0
city mismatch     = 0
district mismatch = 0
village mismatch  = 0
```

Regional rules:

```text
ref_villages.code = VARCHAR(13)
postal_code       = optional / nullable
village_type      = not used
```

The staging regional tables were dropped after reconciliation.

The `VARCHAR(13)` correction is an actual reconciled Development-state fact and must not be silently reverted to the historical `VARCHAR(10)` expectation.

---

## 4.3 Auth Tester State

**PASS**

Controlled Development tester accounts are recorded for:

```text
superadmin
manager
admin
instructor
agent-a
agent-b
buyer
```

Auth identity reconciliation:

```text
auth.users.id = public.users.id
```

Role mapping:

```text
superadmin = 1
manager    = 1
admin      = 1
instructor = 1
agent      = 2
buyer      = 1
```

All listed testers are recorded as active and Auth-confirmed.

These accounts are controlled validation fixtures, not production users.

No additional tester role is invented without a decision gate.

---

# 5. RBAC / AUTHORIZATION STATE

The current evidence establishes a **foundation**, not complete runtime authorization closure.

The TECH-29 evidence preserves:

- Capability + Permission + Scope as governing authorization model;
- Role as actor grouping;
- Host and Instructor as separate capabilities;
- resource assignment as distinct from role membership;
- production migration/authorization as NOT AUTHORIZED.

Therefore:

> **RBAC foundation = verified; full application/runtime authorization = not yet closed.**

---

# 6. FRONTEND / RUNTIME STATE

**RUNTIME GAP**

The project evidence explicitly requires a separate runtime discovery gate:

1. identify frontend application;
2. identify package/build system;
3. identify Supabase client configuration;
4. identify Development/staging environment;
5. identify deployment URL if present;
6. verify environment target;
7. verify credentials/environment separation;
8. run application;
9. open login page;
10. execute Auth smoke test.

The absence of completed frontend runtime verification must not be interpreted as database or semantic architecture failure.

---

# 7. MIGRATION / PHYSICAL AUTHORIZATION STATE

The current state separates:

```text
Migration source
    ≠
Executed Development DB
    ≠
Runtime verification
    ≠
Production authorization
```

TECH-29 records:

- frozen authorization design: PASS;
- frozen Session assignment design: PASS;
- RLS candidate: READY FOR RUNTIME;
- production authorization: NOT AUTHORIZED;
- runtime verification remains dependent on environment/application gate.

No uncontrolled/manual migration is authorized merely by this document.

---

# 8. HISTORICAL BASELINE HANDLING

The prior rev.11 synchronized artifact remains historical/provenance evidence.

Its earlier pre-development statements are **not deleted**.

They are superseded only for the purpose of the **current physical-state declaration** by this rev.12 artifact.

This document does not rewrite rev.11.

---

# 9. SEMANTIC / ARCHITECTURE BOUNDARY

The following remain outside the authority of this Current Project State:

- AEP/MADCR/ADR semantic decisions;
- intended ERD;
- intended API contract;
- intended RBAC permission semantics;
- provider selection;
- unresolved physical schema choices;
- unresolved open decisions.

Actual Development evidence can expose:

```text
DRIFT
IMPLEMENTATION GAP
SCHEMA DRIFT
RUNTIME GAP
```

but cannot silently change an approved semantic decision.

---

# 10. CURRENT OPEN / CONTROLLED ITEMS

No existing decision is silently closed by rev.12.

Carry forward, where applicable:

- OPEN-C01 / MADCR-012 provenance/relationship;
- MBR-COM-001–013 provenance/content;
- MADCR-049;
- MADCR-053 / MADCR-054 where implementation/runtime closure remains relevant;
- AEP3 physical residuals;
- AEP4 provider capability/failover residuals;
- exact downstream permission IDs where not approved;
- frontend runtime entry point and runtime verification.

---

# 11. WAVE 1 STATUS

This artifact is **DONE locally**.

Wave 1 as a whole remains OPEN because the following artifacts are still pending:

```text
01 Constitution                  DONE — v1.11
02 Governance Register           DONE — v1.13
03 Project Manifest              DONE — v1.30
04 Current Project State         DONE — rev.12
05 Decision Log                  NEXT
06 Changelog                     PENDING
07 Canonical Source Register     PENDING
08 Final Wave 1 Reconciliation   PENDING
```

GitHub promotion is not a completion gate under the project Constitution and Governance Register rules. Final local artifacts will be promoted later by the Project Owner through local Git/Git Bash.

---

# 12. SOURCE BASIS

Primary evidence used for this artifact:

1. P08-A Canonical Source Reconciliation Matrix.
2. P08-A.1 Canonical Source-by-Source Reconciliation.
3. Cross-AEP Step 04 D0-D1 Post-Edit Reconciliation.
4. Full Canonical Synchronization Control Plan.
5. TECH-29 Staging Authorization Runtime Verification.
6. TECH-29 Project Activity Handoff.
7. Owner-approved Option C version-authority reconciliation.
8. Existing historical Current Project State rev.11.

---

# 13. GATE RESULT

> **CURRENT PROJECT STATE rev.12 = DONE — LOCAL CANONICAL ARTIFACT**

This artifact now represents current reconciled project/physical-state evidence without pretending that frontend runtime, production authorization, or full canonical synchronization are complete.
