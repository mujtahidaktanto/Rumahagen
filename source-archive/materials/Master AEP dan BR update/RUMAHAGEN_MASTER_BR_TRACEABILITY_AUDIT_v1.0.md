# RUMAHAGEN — MASTER BUSINESS RULES TRACEABILITY AUDIT

**Document ID:** MBR-TRACE-001  
**Version:** 1.0  
**Status:** GOVERNANCE REVIEW — GAP CLASSIFICATION COMPLETE  
**Implementation:** NOT AUTHORIZED  
**Date:** 14 August 2026

## 1. Purpose

This audit is the governance gate inserted between CAIA and the ADR phase. It compares Master Business Rules v1.0 against the source/final domain rule baselines and Master AEP, with special attention to the Learning Session gap findings.

The governing principle is **no silent loss of source rules**.

Every source rule is classified as:
- EXPLICIT — directly represented in Master BR;
- DERIVED — covered by a generic Master BR, with traceability retained;
- CROSS-DOMAIN — represented by a cross-domain invariant;
- ADR — primarily an architecture decision;
- TECHNICAL — implementation detail;
- NEW-MASTER-RULE — insufficiently covered and must be added;
- PENDING — source itself does not finalize the decision.

## 2. Critical Learning Session finding

The external review correctly identified that several LS rules were not explicit enough in Master BR v1.0.

The Master AEP already contains the global invariant that client-side claims cannot manufacture official business outcomes, while MBR-007 and MBR-008 establish server authority and server-enforced authorization. Therefore LS-065–068 are not wholly absent; they are insufficiently explicit at the Learning Session domain level.

**Decision:** retain explicit Learning Session traceability in Master BR v1.1.

## 3. Learning Session classification

| Source | Classification | Decision |
|---|---|---|
| LS-001 | CROSS-DOMAIN | Learning is authoritative domain |
| LS-002 | EXPLICIT | MBR-009 / MBR-X-007 |
| LS-003 | EXPLICIT | Master AEP SOR baseline |
| LS-004/005 | EXPLICIT | Domain baseline |
| LS-006/007 | ADR | Provider Adapter / replaceability |
| LS-008 | EXPLICIT | Security/provider principle |
| LS-009 | PENDING/ADR | Capability matrix remains pending |
| LS-010–014 | PENDING/ADR | Candidate providers, not immutable rules |
| LS-015/016 | ADR | State machine enforcement |
| LS-017/018 | EXPLICIT | Historical integrity |
| LS-019 | PENDING | Exact scheduling design downstream |
| LS-020 | EXPLICIT | Identity/history preservation |
| LS-021 | DERIVED | MBR-004 |
| LS-022/023/024 | EXPLICIT | Server authorization boundary |
| LS-025 | NEW-MASTER-RULE | Instructor/host access is role-controlled |
| LS-026 | EXPLICIT | Attendance is evidence, not automatic completion |
| LS-027 | NEW-MASTER-RULE | Completion requires explicit policy |
| LS-028 | PENDING | Exact attendance policy intentionally undecided |
| LS-029 | EXPLICIT | JOIN != COMPLETED |
| LS-030 | NEW-MASTER-RULE | Early leave evaluated against completion policy |
| LS-031 | EXPLICIT | MBR-006 |
| LS-032 | DERIVED | MBR-004 |
| LS-033–039 | EXPLICIT | Learning/Economy rules already cover them |
| LS-040/041 | EXPLICIT | LE-019 / LE-022 |
| LS-042 | NEW-MASTER-RULE | Session may supply assessment evidence when configured |
| LS-043/044/045 | EXPLICIT | Credential/Title boundaries and LE-024 |
| LS-046 | ADR | Event normalization |
| LS-047–049 | EXPLICIT | Provider events are not authority; idempotency |
| LS-050 | TECHNICAL/ADR | Sync preference |
| LS-051/052 | EXPLICIT | Idempotency/reconciliation |
| LS-053 | EXPLICIT | Recording optional |
| LS-054 | NEW-MASTER-RULE | Recording availability distinct from completion |
| LS-055 | EXPLICIT | Provenance |
| LS-056 | NEW-MASTER-RULE | Recording may become ON_DEMAND source |
| LS-057 | DERIVED | MBR-004 |
| LS-058 | EXPLICIT | Provenance / historical explainability |
| LS-059 | DERIVED | MBR-004 |
| LS-060 | NEW-MASTER-RULE | Session configuration explicit/versionable |
| LS-061 | EXPLICIT | MBR-005 |
| LS-062/063 | NEW-MASTER-RULE | Workspace access follows Workspace auth; Workspace does not become Learning authority |
| LS-064 | NEW-MASTER-RULE | Session visibility explicit |
| LS-065–068 | NEW-MASTER-RULE | Client cannot manufacture official outcomes |
| LS-069 | EXPLICIT | Provider failure does not erase history |
| LS-070 | NEW-MASTER-RULE | Provider failure visible/traceable |
| LS-071 | EXPLICIT | MBR-006 |
| LS-072 | NEW-MASTER-RULE | Provider switching authorized |
| LS-073 | EXPLICIT | Progress/history preserved |
| LS-074/075 | EXPLICIT | AI optional and not authority |
| LS-076 | NEW-MASTER-RULE | Lifecycle may trigger governed notifications |
| LS-077 | EXPLICIT | MBR-X-003 / LE-037 |
| LS-078 | NEW-MASTER-RULE | Paid live session cannot silently replace required free path |
| LS-079 | NEW-MASTER-RULE | Historical attendance immutable by default |
| LS-080 | EXPLICIT | MBR-005 / provenance |

## 4. Tier-1 rules that must become explicit in Master BR v1.1

**Security / authority**
- LS-025
- LS-062
- LS-063
- LS-065
- LS-066
- LS-067
- LS-068
- LS-072

**Learning policy**
- LS-027
- LS-030
- LS-042
- LS-078

**Session / recording / configuration**
- LS-054
- LS-056
- LS-060
- LS-064
- LS-070
- LS-076
- LS-079

LS-045 is already adequately covered by LE-024 and MBR-X-002, so it receives explicit traceability rather than a duplicate rule.

## 5. Tier-2 traceability

These are covered by generic invariants but should retain domain traceability:
- LS-021, LS-032, LS-057, LS-059 → MBR-004;
- LS-061 → MBR-005;
- LS-039, LS-071 → MBR-006;
- LS-037, LS-038 → LE-009 / LE-007 / LE-008;
- LS-041 → LE-019;
- LS-050 → ADR/technical layer.

## 6. Proposed Master BR v1.1 additions

### MBR-LS-001
Instructor/Host authority is role-controlled.

### MBR-LS-002
Learning Session completion must be evaluated using an explicit completion policy; attendance evidence alone does not establish completion.

### MBR-LS-003
Early departure must be evaluated against the applicable completion policy.

### MBR-LS-004
A Learning Session may provide evidence for an Assessment when configured Learning/Assessment policy permits it.

### MBR-LS-005
Recording availability is distinct from Learning Session completion.

### MBR-LS-006
A Learning Session recording may become an ON_DEMAND Learning source only through an explicit governed process.

### MBR-LS-007
Session configuration affecting business outcomes must be explicit and versionable where required.

### MBR-LS-008
Workspace access to a Learning Session follows Workspace authorization; Workspace does not become Learning authority.

### MBR-LS-009
Session visibility must be explicitly represented and governed.

### MBR-LS-010
Client claims cannot manufacture official attendance, completion, Learning Points, competency, credentials or Titles.

### MBR-LS-011
Provider failure must remain visible and traceable.

### MBR-LS-012
Provider switching is authorized and must not reset Learning progress or historical outcomes.

### MBR-LS-013
Session lifecycle transitions may trigger governed notification events.

### MBR-LS-014
Paid Learning Sessions must not silently replace a required free Learning Path where that path is defined as free-to-learn.

### MBR-LS-015
Historical attendance is immutable by default; corrections require an authorized and audited correction flow.

## 7. Rules deliberately NOT promoted

The following remain pending/downstream:
- exact attendance percentage;
- grace period;
- late-join formula;
- exact instructor override;
- maximum participant count;
- exact visibility taxonomy;
- provider fallback;
- recording retention/privacy;
- transcript/replay retention;
- OAuth scopes;
- provider quotas;
- exact API;
- exact ERD/schema;
- exact event schema;
- provider SDK implementation.

These must not be invented by downstream implementation.

## 8. Cross-domain checks

### Learning Economy
The Master BR already covers genuine free learning, configurable points, purchased points as acceleration, assessment independence, transaction-based points, earned/purchased provenance, auditability, payment confirmation, idempotency, reconciliation, and the rule that Learning Points are not universal Title requirements.

Therefore Learning Session rules should specialize these principles, not duplicate them.

### Title
Title Rules 001–100 already cover authority, scope, awarding mechanisms, evidence, versioning, lifecycle, revocation, appeal, validity, repeat/renewal, Primary/Featured, provenance and multiple Awarding Paths.

The correct bridge remains:

**Learning Session → Learning Activity / Evidence → Qualification / Awarding Path → Title Award.**

### Commercial
Commercial AEP already establishes Subscription ≠ Entitlement ≠ RBAC, provider adapters, verified payment, idempotent fulfillment, reconciliation, refund/chargeback, price/promotion snapshots, configurable commercial parameters, and payment-ready beta.

A dedicated numbered Commercial BR baseline is still a separate pending governance task.

## 9. No Silent Loss Rule

Every source rule must map to:
- explicit Master BR;
- derived Master BR;
- cross-domain invariant;
- ADR;
- technical specification;
- pending state; or
- explicit deprecation/supersession.

No source rule may disappear merely because it appears redundant.

## 10. ADR impact

The audit confirms these ADR families should be promoted:
1. Agency vs Organization;
2. Learning Session vs Calendar Event;
3. Provider Adapter / provider agnosticism;
4. RUMAHAGEN System of Record;
5. Attendance evidence vs completion;
6. Client/server authority boundary;
7. Learning Point transaction ledger;
8. Earned vs purchased point provenance;
9. Title Definition vs Award Instance;
10. Awarding Path versioning;
11. Subscription vs Entitlement vs RBAC;
12. Payment Provider Adapter;
13. Payment reconciliation;
14. Historical provenance/configuration snapshots;
15. Cross-domain event contract.

Technical details such as sync-vs-polling implementation, OAuth scopes, SDK mechanics, indexes and endpoint naming remain downstream.

## 11. Gate decision

**CAIA Supplemental Gap Audit: PASS WITH REQUIRED MASTER BR v1.1 AMENDMENTS**

Current governance state:

```text
CAIA v1.0
  ↓
Master BR Traceability Audit v1.0
  ↓
Master BR v1.1 REQUIRED
  ↓
ADR Master
  ↓
Individual ADRs
```

**Implementation: NOT AUTHORIZED**

**ERD / API / PRD: NOT YET AUTHORIZED**

## 12. Next controlled action

Create **RUMAHAGEN_MASTER_BUSINESS_RULES_v1.1** incorporating the approved MBR-LS candidates above, while preserving locked BR-001–BR-151 and existing LE/Title rules.

Only after that baseline is accepted should the first ADR be finalized.
