## CONTROLLED SYNCHRONIZATION NOTICE — STEP 08
**Date:** 16 August 2026  
**AEP source:** AEP #3 Title / Awarding Business Rules  
**Cross-AEP dependencies:** D1 Commercial/Payment; D2 Learning Economy; D3 Learning Session  
**Scope:** D4 Title/Awarding downstream semantic synchronization only.

This overlay applies the approved AEP3 semantic decisions. It does not invent physical schema, exact endpoint contracts, final permission IDs, or unresolved authority/lifecycle/version semantics.

# D4 Title/Awarding Business Rule Traceability Addendum

| Trace | Canonical rule | Downstream |
|---|---|---|
| D4-BR-01 | Title Definition ≠ Award Instance | ERD, API, PRD, Flow, Test |
| D4-BR-02 | Stable Title Identity; no Title Identity Version entity | ERD, API, PRD |
| D4-BR-03 | Path Version and Rule Version are independent boundaries | ERD, API, Test |
| D4-BR-04 | Award Instance preserves historical Path/Rule provenance | ERD, API, PRD, Test |
| D4-BR-05 | Qualification ≠ Award Instance | API, Flow, Test |
| D4-BR-06 | Certificate/Credential ≠ Award Instance | ERD, API, PRD, Test |
| D4-BR-07 | Learning/Partner outcomes are evidence, not Award authority | API, RBAC, PRD, Flow |
| D4-BR-08 | Payment confirmation does not directly grant Award | API, PRD, Flow, Test |
| D4-BR-09 | Presentation ≠ ownership; Primary ≤1, Featured ≤3 | ERD, API, PRD, Flow |
| D4-BR-10 | Revocation/Appeal/Restoration preserve Award identity | ERD, API, Flow, Test |
| D4-BR-11 | Effective authorization = Role + Permission + Authority/Scope | RBAC, API, Test |
| D4-BR-12 | Retry-safe Award issuance / appeal | API, Engineering, Test |
| D4-BR-13 | Historical configuration changes do not rewrite Awards | ERD, PRD, Test |
| D4-BR-14 | AEP3-OD-06 Option B is CLOSED | RBAC, API, Flow, Test |

### Controlled open items
AEP3-OD-02, OD-03, OD-04, OD-05 remain OPEN/CONTROLLED. No physical cardinality, storage mechanism or temporal invariant is invented.
