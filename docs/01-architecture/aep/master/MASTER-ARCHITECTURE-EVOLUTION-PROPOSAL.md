# MASTER ARCHITECTURE EVOLUTION PROPOSAL (MAEP)
## RUMAHAGEN — Platform Web PropTech B2B2C

| Field | Value |
|---|---|
| **Document ID** | MAEP-001 |
| **Version** | 1.0 |
| **Status** | **PROPOSED — GOVERNANCE ARTIFACT, NOT AUTHORIZED FOR IMPLEMENTATION** |
| **Prepared as** | Principal Software Architect + Enterprise Architect + Domain Architect + Architecture Governance Reviewer |
| **Date** | 14 Agustus 2026 |
| **Method** | Repository-first analysis (evidence-based, no invention) |
| **Repository analyzed** | `github.com/mujtahidaktanto/rumahagen` (cloned, HEAD at time of analysis) |
| **Uploaded corpus analyzed** | 16 files — 4 new-domain AEP chains (Learning Economy, Learning Session, Title, Commercial/Monetization) not yet present in repository |

---

## HOW TO READ THIS DOCUMENT

Setiap klaim penting membawa evidence dalam format:

> Evidence: `<path>` — `<section/identifier>`

Status yang digunakan mengikuti Master Prompt Bagian 7 dan 28:
`FINAL / APPROVED / BASELINE / ACTIVE / PROPOSED / DRAFT / DEPRECATED / SUPERSEDED / CONFLICTING / UNKNOWN`, dan untuk ketidakpastian: `NOT FOUND / AMBIGUOUS / CONFLICT / NOT DECIDED`.

Klasifikasi keputusan mengikuti Bagian 30: `EXISTING — PRESERVE / EXISTING — VALIDATE / EXISTING — EVOLVE / EXISTING — DEPRECATE / NEW — PROPOSED / CONFLICT`.

---

# 1. EXECUTIVE SUMMARY

RUMAHAGEN adalah SaaS PropTech B2B2C **single-agency-per-akun** (dengan lapisan Organization/Agency baru) untuk agen properti Indonesia, dibangun di atas Next.js App Router + Supabase/PostgreSQL, dengan 13 modul bisnis resmi (M01–M13) yang sudah **100% terdokumentasi dan 0% diimplementasi** (pre-Sprint S0).

Evidence: `docs/00-governance/CURRENT-PROJECT-STATE-rev10-KONSOLIDASI-FINAL.md` — baris 14–18, 179.

Repository mencerminkan proyek yang **sangat matang secara governance**: 28 ADR arsitektur/teknis Approved/Approved With Notes, 32/32 item Issue Register closed, migration SQL lengkap-tapi-belum-dieksekusi untuk 15 file (dengan 4 file bersuffix `-FIXED` yang harus menggantikan versi lama sebelum Sprint S0).

Evidence: `docs/00-governance/CURRENT-PROJECT-STATE-rev10-KONSOLIDASI-FINAL.md` — baris 16, 115, 270.

Terpisah dari baseline repository ini, terdapat **satu gelombang dokumen governance baru** (diupload user, belum masuk repository) yang mengusulkan empat domain evolusi besar:

1. **Learning Economy** (Learning Points ledger, earn/purchase/redeem)
2. **Learning Session** (live learning — Daily/LiveKit/Zoom/Google Meet/YouTube Live)
3. **Title/Achievement System** (Title Definition vs Award Instance, Awarding Path, lifecycle, appeal)
4. **Commercial/Monetization/Payment Gateway** (subscription, entitlement, quota, promotion, payment)

Keempat gelombang ini sudah melalui rantai governance internalnya sendiri (AEP → Business Rules → Current Architecture Impact Analysis (CAIA) → Reconciliation → Master BR Consolidation → **Master BR Final Traceability Gate v1.3**), dan gate terakhir ini menyatakan **Agency = Organization RESOLVED**, namun **dua pertanyaan arsitektural masih OPEN**:

1. Apakah Commercial Entitlement adalah sumber kuota Agency/Organization, atau sebaliknya.
2. Apakah Payment adalah subdomain Commercial atau modul logis terpisah (M16).

Evidence: `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1.3.docx` (upload) — Bagian 4.1–4.2.

**Prinsip evolusi yang dipakai dokumen ini: Evolve, don't reinvent.** Tidak ada keputusan FINAL/APPROVED/LOCKED di repository yang diubah. Empat domain baru diperlakukan sebagai **PROPOSED extension** dari Learning Domain dan sebagai **modul baru (M14 Commercial, M15 Title, opsional M16 Payment)** yang menunggu ADR sebelum ERD/API/RBAC berubah.

**Kesimpulan MAEP:** RUMAHAGEN saat ini valid sebagai fondasi. Perubahan yang benar-benar diperlukan bersifat **aditif** (modul baru + perluasan Learning Domain), bukan restrukturisasi. Implementasi TIDAK diotorisasi oleh dokumen ini.

---

# 2. PURPOSE

Dokumen ini adalah **satu-satunya Architecture Evolution Proposal terkonsolidasi** untuk RUMAHAGEN saat ini, merekonsiliasi:

- baseline arsitektur repository (13 modul, 28 ADR, ERD v1.4, API v1.3, RBAC v1.1);
- Business Rules Baseline legacy (BR-001–BR-151, LOCKED);
- empat domain AEP baru yang belum disinkronkan ke repository;
- Master Business Rules Traceability Gate v1.3 (governance state terkini dari gelombang baru).

MAEP **tidak** menggantikan dokumen manapun yang sudah Baseline/Approved. MAEP adalah dokumen jembatan yang menentukan **apa yang perlu berubah, mengapa, dan urutan approvalnya** — bukan implementasi.

---

# 3. SCOPE

## 3.1 In-Scope

- Rekonsiliasi seluruh AEP dan Business Rules yang ditemukan (repository + upload).
- Current Architecture Baseline (business/domain/application/data/API/security/AI/UI/infrastructure).
- Gap, konflik, debt, dan invariant analysis.
- Target architecture arah evolusi (Learning Domain extension, M14/M15/opsional-M16).
- Roadmap governance (bukan roadmap coding).
- Traceability dan Master Decision Register.

## 3.2 Out-of-Scope (per Master Prompt Bagian 27)

- Penulisan kode, migration, atau perubahan file repository.
- Keputusan final untuk 2 Gate-1-adjacent open question (Commercial Entitlement vs Organization Quota; Payment placement) — didokumentasikan sebagai **OPEN ARCHITECTURE REVIEW**, bukan diputuskan sepihak.
- Harga, paket komersial, atau nilai numerik yang tidak eksplisit di sumber.

---

# 4. REPOSITORY EVIDENCE

## 4.1 Repository Structure (actual, as scanned)

Evidence: repository root scan, 14 Agustus 2026.

```text
rumahagen/
├── docs/
│   ├── 00-governance/        (8 files: constitution, decision-log, changelog, project-state,
│   │                           EAF, document-governance-register, project-manifest, task-template)
│   ├── 01-product/           (PRD v1.3, Entity Mapping v1.0)
│   ├── 02-architecture/      (System Architecture v1.6, ADR register, technology decisions,
│   │                           dependency manifest, Organization AEP v0.9, sync report,
│   │                           adr-reviews/ [5 focused ADR review docs])
│   ├── 03-database/          (ERD v1.4, Database Dictionary Migration-Ready v1.0)
│   ├── 04-api/               (API Specification v1.3-FINAL-FIXED)
│   ├── 05-ux/                (User Flow, UI Spec, Functional Spec)
│   ├── 06-security/          (Authorization & Access Control Spec v1.1)
│   ├── 07-seo/                (SEO/Analytics Spec)
│   ├── 08-technical-spec/    (Technical Specification)
│   ├── 09-module-planning/   (MP-01..MP-13 + Module Dependency Matrix + Implementation Strategy)
│   ├── 10-roadmap/           (DEVELOPMENT-ROADMAP.md)
│   ├── 11-ai-context/        (AI-CONTEXT-PACK v1.1, AI-DEVELOPMENT-BLUEPRINT v1.6)
│   ├── 12-reports/           (governance/consolidation deliverable reports, issue register)
│   └── _archive/             (superseded snapshots — API-Spec, CHANGELOG, PROJECT-STATE,
│                               ADR, doc-governance-register, project-manifest history)
└── supabase/
    ├── migrations/           (0001–0015, written, NOT executed live)
    ├── migrations-archive/   (superseded/pre-FIXED migration snapshots)
    ├── reference/
    └── seed/                 (seed-superadmin.ts + README)
```

**Tidak ada** kode aplikasi (`app/`, `components/`, `lib/`, dsb.), tidak ada `package.json` root, tidak ada test suite. Ini konsisten dengan status "0% implementasi" yang dinyatakan governance dokumen.

Evidence: repository root listing — hanya `docs/` dan `supabase/` pada root.

## 4.2 Repository vs Uploaded Corpus — Delta

| Domain | Ada di repository? | Ada di upload user? |
|---|---|---|
| M01–M13 (13 modul bisnis existing) | ✅ Ya, FINAL/Approved | — |
| Organization Management (M12) | ✅ Ya (`Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md`, Draft) | — |
| AI Assistant (M13, BYOK) | ✅ Ya, FINAL | — |
| Learning Economy | ❌ **NOT FOUND** di repo (hanya disebut "Phase 5 Deferred" di roadmap) | ✅ Ya, Proposed |
| Learning Session (live learning) | ❌ **NOT FOUND** di repo (hanya Calendar/Event M05 existing) | ✅ Ya, Proposed |
| Title/Achievement | ❌ **NOT FOUND** di repo | ✅ Ya, Proposed/Reconciled |
| Commercial/Monetization/Payment | ❌ **NOT FOUND** di repo (hanya disebut "Phase 5 Deferred — payment/komisi") | ✅ Ya, Proposed/Reconciled |

Evidence: `grep -ril "Learning Economy|Learning Session|Title Business Rules|Monetization|Commercial Business Rules" docs/` → hasil tunggal `docs/10-roadmap/DEVELOPMENT-ROADMAP.md` baris 43 ("Phase 5 (Deferred) — Advanced Growth & Monetization ... payment/komisi ... di luar cakupan roadmap aktif ini").

**Kesimpulan kritis:** Keempat domain baru dalam upload adalah **usulan pra-repository** — belum pernah disinkronkan ke `docs/`. MAEP ini adalah titik pertama di mana keduanya direkonsiliasi secara eksplisit.

## 4.3 Repository Freshness vs Project Knowledge Baseline

Repository (`github.com/mujtahidaktanto/rumahagen`, live clone) satu revisi lebih baru dari sejumlah salinan project-knowledge yang tersedia dalam sesi ini:

| Dokumen | Versi di repo (live) | Versi di project knowledge |
|---|---|---|
| CURRENT-PROJECT-STATE | rev10-KONSOLIDASI-FINAL | rev9-KONSOLIDASI-FINAL |
| project-manifest | v1.28-KONSOLIDASI-FINAL | v1.27-KONSOLIDASI-FINAL |
| document-governance-baseline-register | v1.11-KONSOLIDASI-FINAL | v1.10-KONSOLIDASI-FINAL |

**MAEP menggunakan repository live sebagai Priority 0** sesuai instruksi, bukan project-knowledge snapshot.

---

# 5. SOURCE OF TRUTH HIERARCHY

Berdasarkan `PROJECT-CONSTITUTION-v1.9-FINAL.md` dan `CURRENT-PROJECT-STATE-rev10-KONSOLIDASI-FINAL.md`, serta CAIA §2.1 untuk domain baru:

```text
LAYER 0 — PROJECT-CONSTITUTION-v1.9-FINAL.md
LAYER 1 — Locked Business Rules:
              BR-001–BR-151 (Business Rules Baseline v1.0 FINAL) [legacy, LOCKED]
              Title 001–100 (Title Business Rules Baseline v1.0 Consolidated) [user-locked]
              Learning Economy LE-001–059 [authoritative]
LAYER 2 — Approved ADR:
              architecture-decision-records-FINAL-v1.1-plus-ADR029.md (ADR-001..047, 28 Approved)
LAYER 3 — Master Business Rules (new-wave):
              Master BR v1.1 Consolidated → v1.2 Final Consolidation Candidate →
              Master BR Final Traceability Gate v1.3 [GOVERNANCE GATE, NOT YET LOCKED]
LAYER 4 — Domain AEP:
              Organization Management System AEP v0.9 [Draft, repo]
              Commercial/Monetization AEP v1.0 [Proposed, upload]
              Learning Economy AEP v1.0 [Proposed, upload]
              Learning Session AEP-LS-001 v1.0 [Proposed, upload]
              Title AEP v1.0 [Proposed, upload]
              CAIA v1.0 [Analysis Complete, upload]
LAYER 5 — Baseline System Architecture:
              SYSTEM-ARCHITECTURE-v1.6-FINAL.md
LAYER 6 — Technology Decisions v1.6-FINAL.md
LAYER 7 — Dependency Manifest v1.6-FINAL.md
LAYER 8 — ERD v1.4-FINAL / Database Dictionary v1.0-FINAL
LAYER 9 — API Specification v1.3-FINAL-FIXED
LAYER 10 — Authorization & Access Control Spec v1.1-FINAL
LAYER 11 — User Flow / PRD v1.3-FINAL
LAYER 12 — Functional / UI / Technical Specifications
LAYER 13 — Module Planning (MP-01..MP-13) / Engineering Alignment Framework
```

Evidence: `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1.0.md` §2.1 (upload) mendefinisikan hierarki yang sama untuk domain baru; MAEP menyelaraskannya dengan struktur repo `docs/00-governance` s.d. `docs/09-module-planning`.

**Aturan MAEP:** Layer 3–4 (gelombang baru) berstatus PROPOSED/GOVERNANCE GATE — tidak boleh dianggap mengalahkan Layer 5–10 (baseline repository FINAL) sampai ADR terkait disetujui secara resmi dan disinkronkan.

---

# 6. DOCUMENT INVENTORY

## 6.1 Repository Documents (Baseline — Priority 0/5-13)

| # | Document | Version | Status | Path |
|---|---|---|---|---|
| 1 | PROJECT-CONSTITUTION | v1.9-FINAL | FINAL | `docs/00-governance/` |
| 2 | decision-log | FINAL | ACTIVE | `docs/00-governance/decision-log-FINAL.md` |
| 3 | CHANGELOG | v0.7.21-VERIFIED-FINAL | ACTIVE | `docs/00-governance/` |
| 4 | CURRENT-PROJECT-STATE | rev10-KONSOLIDASI-FINAL | ACTIVE | `docs/00-governance/` |
| 5 | Engineering Alignment Framework | v1.0 | BASELINE | `docs/00-governance/` |
| 6 | document-governance-baseline-register | v1.11-KONSOLIDASI-FINAL | BASELINE | `docs/00-governance/` |
| 7 | project-manifest | v1.28-KONSOLIDASI-FINAL | ACTIVE | `docs/00-governance/` |
| 8 | TASK-TEMPLATE | v1.1 | ACTIVE | `docs/00-governance/` |
| 9 | PRD RUMAHAGEN | v1.3-FINAL | FINAL | `docs/01-product/` |
| 10 | Entity Mapping | v1.0-FINAL | FINAL | `docs/01-product/` |
| 11 | SYSTEM-ARCHITECTURE | v1.6-FINAL | FINAL | `docs/02-architecture/` |
| 12 | architecture-decision-records (ADR) | FINAL-v1.1-plus-ADR029 | APPROVED (28 ADR) | `docs/02-architecture/` |
| 13 | technology-decisions | v1.6-FINAL | FINAL | `docs/02-architecture/` |
| 14 | dependency-manifest | v1.6-FINAL | FINAL | `docs/02-architecture/` |
| 15 | Architecture Evolution Proposal — Organization Mgmt & AI Assistant | v0.9-FINAL | **DRAFT** (menunggu ARB sign-off) | `docs/02-architecture/` |
| 16 | synchronization-report-adr-001 | — | ACTIVE | `docs/02-architecture/` |
| 17 | ADR-005/006/008/018/047 Reviews | — | ACTIVE | `docs/02-architecture/adr-reviews/` |
| 18 | ERD Skema Database | v1.4-FINAL | FINAL | `docs/03-database/` |
| 19 | Database Dictionary Migration-Ready | v1.0-FINAL | FINAL (Draft/menunggu eksekusi) | `docs/03-database/` |
| 20 | API Specification | v1.3-FINAL-FIXED | FINAL | `docs/04-api/` |
| 21 | User Flow, UI Spec, Functional Spec | — | FINAL | `docs/05-ux/` |
| 22 | Authorization & Access Control Spec | v1.1-FINAL | FINAL | `docs/06-security/` |
| 23 | SEO/Analytics Spec | — | FINAL | `docs/07-seo/` |
| 24 | Technical Specification | — | FINAL | `docs/08-technical-spec/` |
| 25 | MP-01..MP-13 (13 Module Planning) | v1.0-FINAL each | FINAL | `docs/09-module-planning/` |
| 26 | Module Dependency Matrix | v1.0-FINAL | FINAL | `docs/09-module-planning/` |
| 27 | Module Implementation Strategy | v1.0-FINAL | FINAL | `docs/09-module-planning/` |
| 28 | DEVELOPMENT-ROADMAP | — | ACTIVE | `docs/10-roadmap/` |
| 29 | AI-CONTEXT-PACK | v1.1 | ACTIVE | `docs/11-ai-context/` |
| 30 | AI-DEVELOPMENT-BLUEPRINT | v1.6-FINAL | FINAL | `docs/11-ai-context/` |
| 31 | Executive Architecture Review, Foundation Validation Report, Issue Register (32/32 closed), ADR Consolidation Deliverables, System Architecture Consolidation Deliverables, ZIP Import Manifest | — | ACTIVE | `docs/12-reports/` |
| 32 | Migrations 0001–0015 (+4 `-FIXED` variants) | — | Written / **NOT executed** | `supabase/migrations/` |
| 33 | seed-superadmin.ts + README | — | Ready, not run | `supabase/seed/` |

## 6.2 Uploaded Documents (New-Wave — Priority 3/4, not yet in repository)

| # | Document | Version | Status | Domain |
|---|---|---|---|---|
| 34 | AEP_Monetization_Subscription_Promotion_Payment_Gateway | v1.0 | Proposed | Commercial |
| 35 | RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion | v1.1 | Revised (Claude-execution-oriented variant, BR-001–151-aligned) | Commercial (listing/promo/quota focus — **partially divergent scope from #34**, see §22 Conflict Register) |
| 36 | RUMAHAGEN_COMMERCIAL_BUSINESS_RULES_BASELINE | v1.0 PROPOSED | Proposed | Commercial |
| 37 | RUMAHAGEN_COMMERCIAL_BR_RECONCILIATION | v1.1 | Pass with conditions | Commercial |
| 38 | AEP_Learning_Economy | v1.0 | Proposed | Learning |
| 39 | Business_Rules_Learning_Economy_RumahAgen | v1.0 | Consolidated | Learning |
| 40 | RUMAHAGEN_Learning_Session_AEP_and_Business_Rules (AEP-LS-001 + BR-LS-001) | v1.0 | Proposed | Learning |
| 41 | Learning_Session_Architecture_Evolution | v2 | Earlier/shorter concept note (superseded in detail by #40, consistent in direction) | Learning |
| 42 | AEP_Title_Business_Rules_Baseline | v1.0 | Proposed | Title |
| 43 | Title_Business_Rules_Baseline_Consolidated (Rules 001–100) | v1.0 | Consolidated/Conflict-Resolved, user-locked | Title |
| 44 | RUMAHAGEN_TITLE_BR_TRACEABILITY_AUDIT | v1.0 | Gap classification complete | Title |
| 45 | RUMAHAGEN_TITLE_TRACEABILITY_RECONCILIATION | v1.1 | Pass | Title |
| 46 | RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS (CAIA) | v1.0 | Analysis complete | Cross-domain |
| 47 | RUMAHAGEN_Business_Rules_Baseline (legacy BR-001–151) | v1.0 FINAL | **LOCKED** | Cross-domain (legacy) |
| 48 | RUMAHAGEN_MASTER_BUSINESS_RULES | v1.1 CONSOLIDATED | Superseded by #49 | Cross-domain |
| 49 | RUMAHAGEN_MASTER_BUSINESS_RULES (Final Consolidation Candidate) | v1.2 | Superseded by #50 | Cross-domain |
| 50 | RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE | v1.3 | **GOVERNANCE GATE — NOT YET LOCKED** (latest, most authoritative for new-wave) | Cross-domain |

**Catatan authority (Master Prompt Bagian 5):** #50 (v1.3) diperlakukan sebagai authoritative bukan semata karena versi terbaru, melainkan karena secara eksplisit *supersedes* #49 dan #48 (menyatakan ulang keputusan mereka + menyelesaikan 1 dari 3 dependensi Gate-1), dan tidak ada dokumen berikutnya yang menggantikannya. Evidence: `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1.3.docx` §1 ("This review updates the Master Business Rules v1.2 Final Consolidation Candidate...").

---

# 7. MASTER BUSINESS RULES INVENTORY

Prinsip: BR individual berjumlah ratusan (151 legacy + 100 Title + 59 Learning Economy + 80 Learning Session + 15 Commercial). MAEP tidak mereproduksi seluruh teks tiap rule (itu adalah isi dokumen sumbernya, yang tetap otoritatif) — MAEP menginventarisasi **per kelompok/domain** dengan representative Rule ID, sesuai prinsip "traceability tanpa duplikasi" yang sudah dipakai gelombang baru sendiri (lihat Reconciliation v1.1 §7: *"target adalah complete traceability dengan minimum duplication, bukan satu Master BR untuk setiap kalimat AEP"*).

## 7.1 Legacy Business Rules — BR-001–BR-151 (LOCKED)

| Group | Rule range (representative) | Source | Domain | Enforcement layer | Status |
|---|---|---|---|---|---|
| Agency/Organization Lifecycle | ACTIVE→CLOSING→CLOSED, irreversible transitions, OTP-gated closure | `RUMAHAGEN_Business_Rules_Baseline_v1.0_FINAL.docx` §4 | Organization | DB state machine + RLS + API guard | LOCKED |
| Membership Lifecycle | Voluntary Leave vs Forced Removal, pending invitation cancellation on CLOSING | §5 | Organization | API + notification | LOCKED |
| Listing Lifecycle & Context | Owner ≠ current context; Agency Listing vs Personal Listing; origin preserved | §6 | Listing (M03) | ERD (`listings.owner`, `listings.context`) + RLS | LOCKED |
| Permanent Add-on Ownership | Allocation determines ownership; consumption ≠ ownership; unallocated → Owner on closure | §3, §6 | Commercial (legacy) | Entitlement records | LOCKED |
| Promotion/Promo Expiry & Transfer | PUBLISHED+PROMO_ACTIVE retained until expiry on exit; forfeited on closure | Monetization AEP v1.1 §8–9 (cross-ref) | Listing/Commercial | Scheduler + event | LOCKED |
| Security (OTP, retry) | OTP request limit 3/closure flow, verification attempts 3/OTP, auto-retry 1x | Monetization AEP v1.1 §23 | Auth/Security | API rate-limit | LOCKED (BUSINESS/SECURITY INVARIANT) |
| *(Full BR-001–151 text)* | — | `RUMAHAGEN_Business_Rules_Baseline_v1.0_FINAL.docx` (1072 baris) | — | — | **Full verbatim enumeration NOT reproduced here — source document remains sole normative text per Bagian 27 (jangan mengarang/menduplikasi tanpa perlu).** |

## 7.2 Title Business Rules — 001–100 (Consolidated, user-locked)

| Group | Rule range | Domain | Enforcement layer |
|---|---|---|---|
| Foundation & Authority | 001–010 | Title | Title Definition model |
| Progression & Award Structure | 011–020 | Title | Awarding Engine |
| Versioning & Identity | 021–024 | Title | Awarding Rule Version |
| Revocation/Reinstatement/Appeal | 025–030, 081–090 | Title | Lifecycle state machine |
| Category/Progression | 031–040 | Title | Title Definition |
| Learning/Assessment/Awarding | 041–050 | Title↔Learning | Qualification engine |
| Awarding Path & Provenance | 051–070 | Title | Award Instance |
| Scope/Agency/Historical Ownership | 071–080 | Title↔Organization | **Gate-1-adjacent (072–074)** |
| Validity/Expiration/Renewal | 091–095 | Title | Lifecycle |
| Featured/Profile Presentation | 096–100 | Title | Presentation layer |

Evidence: `Title_Business_Rules_Baseline_v1_0_Consolidated.md` (full 100-rule table + dependency matrix).

## 7.3 Learning Economy Rules — LE-001–059 (Authoritative)

Groups: Core principles (001–005), Learning Point rules (006–010), Activity rules (011–014), Path/Progression (015–018), Assessment/Competency (019–023), Title boundary (§8, cross-ref Title 041–050), Payment integration (§9–11, 041–042), RBAC/Governance (043–047), Audit/Provenance (048–052), Configuration (053–055), Consistency/Failure (056–059).

Evidence: `Business_Rules_Learning_Economy_RumahAgen_v1_0.md` — full text.

**Master invariant (locked at principle level):** *"Learn for free. Grind to earn. Pay to accelerate. Prove to certify."* — Learning Points ≠ competency, ≠ automatic credential, ≠ universal Title prerequisite.

## 7.4 Learning Session Rules — LS-001–080 (Proposed)

Groups cover: session lifecycle/type, provider adapter boundary, attendance architecture, Learning Activity integration, Learning Points boundary, assessment/credential/Title boundary, provider events, security, recording, workspace, visibility, failure/recovery, provider switching, AI boundary, notification, Commercial/Payment boundary, historical integrity.

Evidence: `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` — Part II, LS-001–080.

Already partially represented in repository governance (see §9 below): Master BR v1.1 Consolidated states Learning Session MBR-LS-001–015 already exist as explicit rules — **however this MBR-LS series is NOT FOUND as a standalone document in either the repository or the uploaded corpus**; it is referenced only inside `RUMAHAGEN_MASTER_BUSINESS_RULES_v1_2_FINAL_CONSOLIDATION_CANDIDATE.docx` §3. Classification: **AMBIGUOUS** — treated as pre-existing within the new-wave Master BR chain, not yet cross-verified against a standalone MBR-LS source file.

## 7.5 Commercial Business Rules — COM-BR-001–015 (Proposed) + MBR-COM-001–013 (referenced, not directly sourced)

| Status | Rule IDs | Disposition (per Reconciliation v1.1) |
|---|---|---|
| EXPLICIT (no duplication needed) | COM-BR-001,002(partial),003,006(partial),009,010,014,015 | Covered by existing MBR-COM-001–013 |
| MATERIAL GAP / promoted | COM-BR-004,005,007,008,011,012,013 | → MBR-COM-X01–X09 |
| GATE-1-DEPENDENT (now identity-resolved, quota-boundary still open) | COM-BR-004, COM-BR-005 | PROPOSED, Agency=Organization resolved, Commercial-Entitlement-vs-Quota-authority OPEN |

**Important gap:** MBR-COM-001–013 (the "existing" rules referenced repeatedly as canonical) are **NOT FOUND** as a standalone source document anywhere in the repository or the uploaded corpus. They are cited only by description inside the Commercial Reconciliation and Master BR v1.2 documents. Classification: **NOT FOUND — traced only by reference, not by primary text.** This is flagged as a Documentation Debt (§28).

Evidence: `RUMAHAGEN_COMMERCIAL_BR_RECONCILIATION_v1.1.md` §3; `RUMAHAGEN_MASTER_BUSINESS_RULES_v1_2_FINAL_CONSOLIDATION_CANDIDATE.docx` §5.1.

## 7.6 New Master BR Amendments (Proposed, pending Lock)

| ID | Title | Domain | Status |
|---|---|---|---|
| MBR-TITLE-PRES-001 | Presentation validity/fallback integrity | Title | PROPOSED |
| MBR-TITLE-EVID-001 | Evidence privacy/access boundary | Title | PROPOSED |
| MBR-TITLE-AWARD-001 | Auto/manual awarding authority guards | Title | PROPOSED |
| MBR-TITLE-RESTORE-001 | Reinstatement/presentation integrity | Title | PROPOSED |
| MBR-TITLE-SCOPE-001 | Scope/context lifecycle | Title↔Organization | PROPOSED (identity dependency resolved; membership semantics still binding to be confirmed) |
| MBR-TITLE-HIST-001 | Historical Award Instance deletion governance | Title | PROPOSED |
| MBR-TITLE-NOTIFY-001 | Revocation notification trigger | Title | PROPOSED |
| MBR-TITLE-APPEAL-001 | Issuer review/escalation | Title | PROPOSED |
| MBR-TITLE-APPEAL-002 | Mandatory appeal window | Title | PROPOSED |
| MBR-TITLE-VIS-001 | Public Collection vs Active/Valid state | Title | PROPOSED |
| MBR-COM-X01 | Free Bonus Grant Integrity | Commercial | PROPOSED |
| MBR-COM-X02 | Agency Subscription/Member Allocation | Commercial↔Organization | PROPOSED (identity resolved, quota-authority OPEN) |
| MBR-COM-X03 | Quota Allocation vs Actual Usage | Commercial↔Organization | CRITICAL / PROPOSED (identity resolved, quota-authority OPEN) |
| MBR-COM-X04 | Promotion as Policy + Purchase Snapshot | Commercial | PROPOSED |
| MBR-COM-X05 | Subscription Transition Integrity | Commercial | PROPOSED |
| MBR-COM-X06 | Order/Payment/Fulfillment Boundary | Commercial↔RBAC | PROPOSED / CROSS-DOMAIN |
| MBR-COM-X07 | Refund/Chargeback State Effects | Commercial | PROPOSED |
| MBR-COM-X08 | Commercial Provenance Minimum | Commercial | PROPOSED |
| MBR-COM-X09 | Commercial Configuration Governance | Commercial | PROPOSED |

All 19 items above: **Action = PROPOSE (not yet LOCKED)**; final ID numbering explicitly deferred to Lock Gate per source documents.

---

# 8. AEP INVENTORY

| AEP ID | Title | Status | Date | Domain | Scope | Decision | Supersedes | Superseded By |
|---|---|---|---|---|---|---|---|---|
| AEP-ORG-001 | Architecture Evolution Proposal — Organization Mgmt System & AI Assistant Integration v0.9 | **DRAFT** (menunggu ARB sign-off) | 3 Agu 2026 | Organization, AI Assistant | Workspace→Organization rename, Join Request, AI BYOK chat | Organization renamed from Workspace; no conflict w/ "Agent Workspace" personal feature | v0.1–v0.8 (same doc, internal revisions) | — (still Draft; not yet Baseline) |
| AEP-MON-001 | AEP Monetization, Subscription, Promotion & Payment Gateway v1.0 | Proposed | — | Commercial | Full commercial/payment domain (subscription, entitlement, quota, promotion, payment core, adapter, reconciliation) | Domain separation model proposed; 9 ADR-MON candidates raised | — | Not superseded; still Proposed |
| AEP-MON-002 | Architecture Evolution Proposal — Monetization, Subscription & Promotion Architecture Alignment v1.1 | Revised | — | Commercial (narrower — listing/promo/quota alignment to BR-001–151) | Free bonus one-time grant, add-on permanence, promo expiry/transfer, Claude execution instructions | Reconciles specifically against BR-001–151; **partial scope overlap, partial divergence** from AEP-MON-001 (see §22) | v1.0 of same narrower doc (implied) | Not formally superseded; **CONFLICT/AMBIGUOUS relationship with AEP-MON-001** — see Conflict Register C-01 |
| AEP-LE-001 | Architecture Evolution Proposal — Learning Economy v1.0 | Proposed | — | Learning | Learning Point ledger, earn/purchase/redeem, unlock vs competency, assessment boundary | 8 ADR-LE candidates raised | — | Not superseded |
| AEP-LS-001 | Learning Session & Live Learning Architecture Evolution + BR-LS-001 v1.0 | Proposed | — | Learning | Session lifecycle, provider adapter, attendance, Learning Economy/Title boundary | ADR-LS-001–xxx candidates raised; Learning Session confirmed as extension of Learning Domain (not independent domain) | `Learning_Session_Architecture_Evolution_v2` (shorter concept note) | — |
| AEP-TITLE-001 | Architecture Evolution Proposal — Title Business Rules Baseline v1.0 | Proposed | — | Title | Title Definition/Awarding Path/Award Instance/Provenance/Lifecycle/Appeal/Presentation separation | 10 ADR candidates raised | — | Not superseded |
| CAIA-001 | Current Architecture Impact Analysis v1.0 | Analysis Complete | 14 Agu 2026 | Cross-domain (Learning Economy, Learning Session, Title, Commercial vs existing baseline) | Compares Master AEP + Master BR against repository corpus | Not rejected; evolution required; 15 CAIA-ADR candidates + Gate 1/2/3 defined | — | — |

## 8.1 Reconciliation status per AEP

| AEP | Still valid? | Superseded? | Deprecated? | Conflicting? | Partial? | Implemented? | Needs reconciliation? |
|---|---|---|---|---|---|---|---|
| AEP-ORG-001 | Yes (Draft) | No | No | No | Partial (AI Assistant part is FINAL in repo M13; Organization part still Draft here vs. **already-approved** ADR-026/027 in repo — see §22 C-02) | No (0% code) | Yes — vs repo ADR-026/027 |
| AEP-MON-001 | Yes | No | No | Overlaps AEP-MON-002 | Partial (payment-gateway-specific) | No | Yes |
| AEP-MON-002 | Yes | No | No | Overlaps AEP-MON-001 | Partial (listing/promo-specific) | No | Yes |
| AEP-LE-001 | Yes | No | No | No | No | No | Minor (align terminology w/ repo M04 Learning Center) |
| AEP-LS-001 | Yes | No | No | No | No | No | Yes (vs M05 Calendar/Event boundary) |
| AEP-TITLE-001 | Yes | No | No | No | No | No | Yes (new domain, no repo precedent) |
| CAIA-001 | Yes | No | No | No | No | No | This IS the reconciliation document — MAEP extends it |

Evidence for AEP-ORG-001 vs repo ADR-026/027 conflict: see `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5.12 which already documents Organization Management as *"(baru, ADR-026/ADR-027 — 3 Agustus 2026)"* — i.e., the System Architecture treats Organization as **already approved and integrated**, while `Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md` itself is still labelled **Draft — menunggu review & pengesahan Architecture Review Board**. This is a genuine document-status inconsistency, logged in §22.

---

# 9. ARCHITECTURE DECISION INVENTORY

## 9.1 Approved ADR (Repository, Layer 2)

Evidence: `docs/02-architecture/architecture-decision-records-FINAL-v1.1-plus-ADR029.md` — 28 ADR entries with Status `Approved` / `Approved With Notes` (ADR-001 through at least ADR-047, non-contiguous numbering; not all numbers between 001–047 are populated — file also documents ADR-026/027 (Organization), ADR-028 (AI Assistant BYOK), ADR-029, and focused review docs for ADR-005/006/008/018/047 in `adr-reviews/`).

**MAEP does not re-list all 28 ADR verbatim** (source document remains authoritative); representative categories: technology stack decisions (frontend, DB, hosting), search strategy (ADR-005), job queue (ADR-006), maps provider (ADR-008), caching (ADR-018), error response standard (ADR-013), multi-tenancy (ADR-023), Organization (ADR-026/027), AI Assistant BYOK (ADR-028), image duplicate detection (ADR-047).

## 9.2 Pending / Candidate ADR (New-wave, not yet decided)

| ADR Candidate ID | Decision | Source | Status |
|---|---|---|---|
| ADR-MON-001–009 | Subscription/Entitlement/RBAC separation; Free Bonus grant model; add-on validity; provider adapter; verified idempotent payment; price/promo snapshot; reconciliation; beta-inactive payment; Agency quota allocation model | AEP-MON-001 §18 | NOT DECIDED |
| ADR-LE-001–008 | Learning Point transaction domain; earned/purchased provenance; acceleration-not-bypass; Internal vs Partnership economic models; Learning ≠ Payment Gateway owner; Skill/Credential ≠ Completion; idempotent point purchase; governed configuration | AEP-LE-001 §25 | NOT DECIDED |
| ADR-LS-001–007+ | Learning Session inside Learning Domain; Provider Adapter; RUMAHAGEN as System of Record; Session Type≠Provider; Daily/LiveKit native; Zoom/GMeet embedded; YouTube broadcast | AEP-LS-001 §20 | NOT DECIDED |
| Title ADR Candidate 1–10 | Definition≠Instance; versioned Awarding Paths; provenance persistence; lifecycle≠prerequisite lifecycle; presentation≠award state; rule versioning w/o new identity; revocation/appeal as lifecycle; multiple Award Instances; governed config; historical integrity | AEP-TITLE-001 §27 | NOT DECIDED |
| CAIA-ADR-001–015 | Agency=Organization identity (RESOLVED via Gate v1.3); Learning Economy as first-class domain; LP ledger/provenance; Learning Session vs Calendar Event; Provider Adapter; Attendance vs Activity; Title Definition vs Award Instance; versioned Awarding Path; Award vs prerequisite lifecycle; Certificate/Credential vs Title; Subscription vs Entitlement vs RBAC; Payment Provider Adapter; Commercial reconciliation; historical provenance/config snapshot; cross-domain event contract | CAIA-001 §28 | 1/15 RESOLVED (CAIA-ADR-001), 14/15 NOT DECIDED |

**Total pending ADR across new-wave domains: ~48 distinct candidate decisions**, none formally promoted through the repository's own ADR process (`architecture-decision-records-FINAL-v1.1-plus-ADR029.md`) at the time of this analysis.

Evidence: repository ADR register does not contain any `ADR-MON-*`, `ADR-LE-*`, `ADR-LS-*`, or Title/CAIA-prefixed entries — confirmed by absence in `grep -oE "ADR-[0-9]{3}"` output (only numeric `ADR-0NN` pattern found, all repository-native).

---

# 10. CURRENT ARCHITECTURE BASELINE

Baseline berikut merangkum kondisi repository saat ini (Layer 5–13), sebelum evolusi apapun.

# 11. BUSINESS ARCHITECTURE

**Business model:** SaaS B2B2C PropTech — platform lead-generation & tooling untuk agen properti Indonesia; platform secara eksplisit **bukan** pemroses transaksi properti.

Evidence: `Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md` §3 (mengutip `PROJECT-CONSTITUTION.md` §2).

**Actors/Roles (7 role final, resolusi OD-02):**

| Role | Kode | Sifat akses |
|---|---|---|
| Superadmin | `superadmin` | Global, bypass permission check |
| Manager | `manager` | Global (`all`) lintas-agen, kecuali Role/Permission Admin-ke-atas & Konfigurasi Sistem |
| Admin | `admin` | Global modul operasional; tidak bisa ubah Role/Permission/Konfigurasi Sistem |
| Instructor | `instructor` | Own (kursus miliknya, Learning Center) |
| Agent | `agent` | Own (data miliknya) |
| Developer Partner | `developer_partner` (DevPartner) | Own (proyek developer miliknya) |
| Buyer | `buyer` | Own (minimal, akses publik+leads) |

Evidence: `docs/06-security/Authorization-Access-Control-Specification-v1.1-FINAL.md` §1.1.

**Business Capabilities (13 modul resmi, dari PRD):** Authentication (M01), Agent Profile (M02), Listing (M03), Learning Center (M04), Calendar/Event (M05), Developer Directory (M06), DBR/KPR Scoring (M07), Dashboard/Notification (M08), Admin Panel (M09), RBAC (M10), SEO/Analytics (M11), Organization (M12), AI Assistant (M13).

Evidence: `docs/01-product/PRD-RUMAHAGEN-v1.3-FINAL.md` §2 "Ringkasan Modul"; `docs/09-module-planning/Module-Dependency-Matrix-RUMAHAGEN-v1.0-FINAL.md` §1.1.

**Business Rules:** lihat §7 (Master Business Rules Inventory) — BR-001–151 legacy LOCKED govern Organization lifecycle, membership, listing, add-on/promo, closure/security invariants.

**Business gap (new-wave, PROPOSED, not-yet-business-capability):** Learning Economy monetization, live Learning Session, Title/Achievement recognition, and formal Commercial/Payment subscription model are **not yet counted among the 13 official business capabilities** — they exist only as external proposals awaiting Gate resolution.

---

# 12. DOMAIN ARCHITECTURE

## 12.1 Existing Bounded Contexts (repository, FINAL)

```text
M01 Authentication          M08 Dashboard/Notification
M02 Agent Profile           M09 Admin Panel
M03 Listing                 M10 RBAC
M04 Learning Center         M11 SEO/Analytics
M05 Calendar/Event          M12 Organization
M06 Developer Directory     M13 AI Assistant (BYOK)
M07 DBR/KPR Scoring
```

Evidence: `docs/02-architecture/SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5.1–5.13 (per-module boundary descriptions); `Module-Dependency-Matrix-RUMAHAGEN-v1.0-FINAL.md` §1.1.

Domain ownership principle already established: *"Membership tidak sama dengan ownership. Allocation menentukan ownership Permanent Add-on; consumption tidak menentukan ownership. Listing mempertahankan origin historis meskipun current context berubah."*

Evidence: `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.md` §3 (Core Business Principles).

## 12.2 Domain Relationships (existing)

`SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §"Tabel Dependency Antar Modul" adalah rujukan tertinggi untuk arah dependency antar modul; `Module-Dependency-Matrix-RUMAHAGEN-v1.0-FINAL.md` melakukan validasi silang terhadap `Technical-Specification.md` dan mencatat perbedaan di bagian Conflict Analysis-nya sendiri (tidak diselesaikan sepihak oleh MAEP).

Evidence: `Module-Dependency-Matrix-RUMAHAGEN-v1.0-FINAL.md` catatan metodologi.

## 12.3 New-Wave Domains (PROPOSED — pending ADR)

| Proposed domain | Relationship to existing bounded context | Decision needed |
|---|---|---|
| Learning Economy | **Extension of M04 Learning Center** — Learning Point ledger sits inside Learning Domain, not a new top-level module | CAIA-ADR-002/003 |
| Learning Session | **Extension of M04 Learning Domain**, distinct from M05 Calendar/Event (which remains discovery/scheduling layer) | CAIA-ADR-004/005 |
| Title/Achievement | **New module** (candidate M15) — no existing repository precedent; current Learning Center `certificates` table is explicitly NOT the Title Award Instance | CAIA-ADR-007/010 |
| Commercial/Monetization | **New module** (candidate M14) — no existing repository precedent beyond legacy BR-001–151 add-on/quota concepts embedded in M03/M12 | ADR-MON-001, CAIA-ADR-011 |
| Payment Gateway | **OPEN** — subdomain of Commercial (M14) vs separate module (M16) | **OPEN, per Gate v1.3 §4.2** |

Per **Master Prompt Bagian 9** (Learning Session tetap dalam Learning Domain): repository/upload evidence confirms this — both `Learning_Session_Architecture_Evolution_v2` and `AEP-LS-001` explicitly state *"Learning remains the SaaS domain; external providers are session infrastructure"* and *"Keep Learning Session inside the Learning Domain."* **PRESERVED**, not treated as independent domain.

Evidence: `Learning_Session_Architecture_Evolution_v2` "Core Architecture"; `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` §2.1.

---

# 13. APPLICATION ARCHITECTURE

**Pattern:** Modular monolith — Next.js App Router + Route Handlers as BFF, no microservices.

Evidence: `docs/02-architecture/SYSTEM-ARCHITECTURE-v1.6-FINAL.md` "Fungsi Masing-Masing Folder", "Konvensi Modul Route Handler"; confirmed by CAIA §5.1 (*"No master-level requirement forces replacement... The Master AEP is compatible with a modular monolith approach. There is no requirement to split the application into microservices."*).

**Application responsibilities per module:** documented individually in `docs/09-module-planning/MP-01..MP-13`, cross-checked in `Module-Dependency-Matrix`.

**Workflows/integration boundaries:** Provider-specific logic (search, maps, job queue, cache) sits behind adapter/service boundaries per ADR-005/006/008/018 (staged migration path — see §14 Technology Decisions).

**New-wave application impact (CRITICAL, per CAIA §4):**

| Capability | Current app boundary | Target app boundary |
|---|---|---|
| Learning Point Ledger | Not present | New service inside M04 |
| Session Orchestrator + Provider Adapter | Not present (M05 has plain Event/Registration) | New service inside M04, `Provider Adapter → Daily/LiveKit/Zoom/GMeet/YouTube` |
| Awarding Engine (Title) | Not present | New service (candidate M15) |
| Commercial/Payment Core + Provider Adapter | Placeholder only | New service (candidate M14, Payment placement OPEN) |

---

# 14. DATA ARCHITECTURE

**ERD baseline:** ~41 top-level entity sections across 13 modules.

Evidence: `docs/03-database/ERD-Skema-Database-RUMAHAGEN-v1.4-FINAL.md`; migration files `0001`–`0015` (2,264 baris total) map 1:1 to ERD per `Database-Dictionary-Migration-Ready-v1.0-FINAL.md`.

**Key existing entities relevant to new-wave evolution:**
- `courses`, `course_lessons`, `quizzes`, `enrollments`, `quiz_attempts`, `certificates` (M04, migration `0009`) — **RETAIN as foundation** for broader Learning domain (CAIA §5.2).
- `events`, `event_registrations` (M05, migration `0010`) — **RETAIN as discovery/schedule layer**, insufficient alone as Learning Session system of record (CAIA §5.3, §8).
- `organizations`, `organization_members`, `organization_invitations` (M12, migration `0007`) — **RETAIN**; this is the entity that legacy BR-001–151 calls "Agency" (Agency=Organization, resolved).

**Tenancy/ownership model (existing, LOCKED):** Agency context ≠ Personal context; listing preserves historical origin across context change; allocation ≠ consumption for entitlement ownership.

Evidence: `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.md` §3, §6.

**Data gaps identified by CAIA (must NOT be filled by inventing schema — deferred to post-ADR ERD phase):**
1. No Learning Point transaction ledger (must not be a single `learning_points_balance` column — CAIA §7).
2. No Learning Session / Provider binding entity distinct from `events`.
3. No Title Definition / Awarding Path / Award Instance separation; `certificates` must NOT auto-become Title Award Instance (CAIA §23).
4. No Commercial Subscription / Entitlement / Quota ledger distinct from existing Organization/listing quota concepts.
5. No Payment Core / Provider Adapter tables beyond placeholder.

Evidence: `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1.0.md` §4, §7–9, §22–23.

**Data Consistency Gap Register:** see §23 (this document) for the corresponding table.

---

# 15. API ARCHITECTURE

**Baseline:** REST convention, Route Handlers, standardized error response (ADR-013), pagination/filtering/sorting conventions, versioning rules.

Evidence: `docs/02-architecture/SYSTEM-ARCHITECTURE-v1.6-FINAL.md` "API Design Standard" section.

**Current spec:** `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md` — canonical after OD-25 cycle; previously missing 4 `/admin/internal-users` and 3 `/admin/developer-projects{/id}` endpoints, now fixed.

Evidence: `docs/00-governance/CURRENT-PROJECT-STATE-rev10-KONSOLIDASI-FINAL.md` baris 118.

**Auth/authz model:** Supabase Auth + custom RBAC (application-layer) + Supabase RLS (data-layer), dual-enforcement.

Evidence: `technology-decisions-v1.6-FINAL.md` §4.9.

**New-wave API impact:** No endpoints for Learning Point transactions, Learning Session lifecycle/provider events, Title awarding/appeal, or Commercial subscription/payment exist in the current API Specification. **NOT FOUND** — confirmed by absence of any of these path segments in `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`. This is expected (new-wave is pre-ADR) and is NOT to be filled in with invented endpoints per Bagian 16 instruction ("Jangan membuat endpoint baru hanya untuk melengkapi dokumen").

---

# 16. SECURITY ARCHITECTURE

**Authentication:** Supabase Auth. **Authorization:** custom RBAC (7 roles, `role_permissions` matrix) + Supabase RLS.

Evidence: `Authorization-Access-Control-Specification-v1.1-FINAL.md` §1.1–1.3, permission matrix (`PERM-M0X-Action-Entity` format).

**Tenant/Organization isolation:** RLS policies scoped by `organization_id`/`created_by`/ownership; audited via 32-item Issue Register (100% closed) which specifically found and fixed 4 Tier-1 RLS bugs (2 "too strict" blocking legitimate access, 2 "too loose" allowing privilege escalation/spoofing).

Evidence: `docs/00-governance/CURRENT-PROJECT-STATE-rev10-KONSOLIDASI-FINAL.md` baris 270 (T1-01..T1-04 summary table).

**Client-vs-server authority invariant (already embedded in new-wave, consistent with existing RBAC philosophy):** *"Client input cannot manufacture attendance, completion, learning points, competency, commercial payment success, entitlement, or Title award."*

Evidence: `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1.3.docx` §9.

**New-wave security/RBAC gap (Gate 2, per CAIA §29):** new permission taxonomy needed for Learning Session host/instructor authorization, Commercial administration, Point adjustment, and Title award issuance/revocation/appeal — none exist yet in `Authorization-Access-Control-Specification-v1.1-FINAL.md`. **NOT FOUND.**

---

# 17. AI ARCHITECTURE

**Existing (M13, FINAL, Approved via ADR-028):** AI Assistant Integration — BYOK (Bring Your Own Key) chat, curated providers Gemini/Groq/Mistral/GitHub Models, custom chat UI, per-provider parallel threads, mandatory "Chat Baru" button (history not persisted by design).

Evidence: `technology-decisions-v1.6-FINAL.md` §4.33; `docs/09-module-planning/MP-13-AIAssistant-Module-Planning-v1_0-FINAL.md`.

**New-wave AI touchpoint (Learning Session, PROPOSED only):** AI transcript summarization/notes for recorded sessions — explicitly scoped as **optional and non-authoritative**: *"AI is optional and must not become Learning authority... AI does not independently determine official competency, credentials, Titles, or Learning Points."*

Evidence: `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` §18, LS-074/075.

**Consistency check:** this principle is fully compatible with the existing M13 BYOK boundary (AI as assistive tool, not a business-authority engine) — **no conflict found**.

---

# 18. UI ARCHITECTURE

Evidence: `docs/05-ux/` (User Flow, UI Specification, Functional Specification) — existing baseline covers 13 modules' screens (`SCR-M0X-NN` IDs), role-based navigation, shared component conventions (shadcn/ui + Tailwind).

**New-wave UI impact:** No screens exist yet for Learning Point wallet/ledger, Learning Session join/host UI, Title profile/Featured/Primary presentation, or Commercial subscription/checkout UI. **NOT FOUND** — expected, pending ADR + ERD + API before Functional/UI Spec extension (Phase 5 of downstream update order per every new-wave AEP).

---

# 19. INFRASTRUCTURE ARCHITECTURE

**Hosting:** Vercel (frontend + Route Handlers). **Database/BaaS:** Supabase/PostgreSQL. **Storage:** Supabase Storage. **Email:** Resend. **Monitoring:** Sentry. **CI/CD:** GitHub → Vercel.

**Staged/phased infra decisions (already governed, not to be re-litigated):**

| Capability | Phase 1 (current) | Phase 2 (scheduled) |
|---|---|---|
| Maps/Geocoding | Leaflet + OSM + LocationIQ + Geoapify | — (MVP→Growth→Scale→Enterprise staged migration already defined) |
| Search | PostgreSQL Full-Text Search + pg_trgm | Typesense |
| Job Queue/Scheduler | Vercel Cron + Postgres Trigger/DB Webhook | QStash |
| Rate limiting/cache | Supabase Postgres | Upstash Redis |

Evidence: `technology-decisions-v1.6-FINAL.md` §4.29–4.32.

**New-wave infrastructure implication:** Learning Session provider adapters (Daily/LiveKit/Zoom/Google Meet/YouTube Live) and Commercial payment gateway adapter both require **new external integrations and secret management** not yet covered by existing infra decisions. Provider OAuth scopes, quota, and billing remain **explicitly unverified** per source AEP ("Rules Not Yet Final" list, LS-AEP §"Rules Not Yet Final" items 15–18).

Evidence: `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` "RULES NOT YET FINAL" §16–18.

---

# 20. ARCHITECTURE INVARIANTS

Hal-hal berikut **tidak boleh berubah** tanpa explicit architecture approval (evidence-backed, tidak spekulatif):

| # | Invariant | Evidence |
|---|---|---|
| 1 | Agency = Organization (satu konsep, dua istilah) | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1.3.docx` §2 |
| 2 | Membership ≠ Ownership; Allocation ≠ Consumption for entitlement ownership | `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.md` §3 |
| 3 | Agency CLOSED is final; no reopening (ACTIVE→CLOSING→CLOSED, one-directional) | Ibid §4 |
| 4 | Listing preserves historical origin across context change | Ibid §3, §6 |
| 5 | Learning Session belongs to Learning Domain (not independent) | `AEP-LS-001` §2.1; `Learning_Session_Architecture_Evolution_v2` |
| 6 | Provider (payment/session) is infrastructure, not business authority | `RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1.3.docx` §6; `AEP-LS-001` Master Invariants #2 |
| 7 | Subscription ≠ Entitlement ≠ RBAC (three separate states) | AEP-MON-001 §16 Principle 1–2; Gate v1.3 §4.3 |
| 8 | Payment confirmation ≠ automatic authorization/RBAC mutation | AEP-MON-001 §16 Principle 3; Gate v1.3 §7 |
| 9 | Commercial purchase/entitlement does not directly create/mutate Title Award | Commercial BR Baseline §6 "Title" |
| 10 | Learning Points ≠ competency ≠ automatic credential ≠ universal Title prerequisite | Learning Economy Master Invariants #5,6,7,8 |
| 11 | Session completion / attendance ≠ competency | `AEP-LS-001` §11, Master Invariants #9 |
| 12 | Client input cannot manufacture attendance, completion, points, competency, payment success, entitlement, or Title award | Gate v1.3 §9 |
| 13 | Historical business outcomes (purchases, promo terms, subscription transitions, payment history, entitlement provenance, Title award history, attendance/completion) remain immutable/auditable and are never rewritten by later configuration changes | Gate v1.3 §8; multiple LE/LS/Title/COM rules |
| 14 | Title Definition ≠ Award Instance | `AEP-TITLE-001` §4.2, Principle 1 |
| 15 | Rename of a Title/entity does not create a new Award/version; material rule change does | Title Rules 021–022 |
| 16 | AI is assistive only; never becomes business authority (Learning, Title, Commercial) | LS-075; §17 above |
| 17 | Cross-domain state mutation requires controlled contract/event, never direct mutation | Gate v1.3 §7; LE-059 |
| 18 | No microservices split required; modular monolith retained | CAIA §5.1 |
| 19 | 7-role RBAC model (Superadmin/Manager/Admin/Instructor/Agent/DevPartner/Buyer) | `Authorization-Access-Control-Specification-v1.1-FINAL.md` §1.1 |

---

# 21. ARCHITECTURE CONSTRAINT REGISTER

| Constraint | Type | Evidence |
|---|---|---|
| Modular monolith on Next.js App Router + Supabase; no microservices | Technical | `technology-decisions-v1.6-FINAL.md`; CAIA §5.1 |
| Migration files must be canonicalized (`-FIXED` variants must replace buggy originals) before any new migration is generated or Sprint S0 runs | Repository/Technical | CAIA §25; `CURRENT-PROJECT-STATE` baris 16–18 |
| Do not invent pricing, product tiers, or commercial values not explicit in source docs | Business | AEP-MON-002 header table, §3 |
| Configurable commercial parameters (Free bonus qty, prices, promo periods) must be stored in governed configuration, not hardcoded | Technical/Governance | AEP-MON-001 §15; AEP-MON-002 §23 |
| Historical/commercial/learning/title records must not be rewritten by configuration changes | Data integrity | Gate v1.3 §8; LE-054; COM-BR-013 |
| Provider credentials/secrets must remain server-side only | Security | `AEP-LS-001` §13 |
| NOT condition excluded from Title Awarding Condition model | Business | Title Rule 049 |
| Maximum 3 Featured Title + 1 Primary per agent | Business | Title Rules 006, 009, 010, 029 |
| RLS + application RBAC dual-enforcement required for all new domains | Security | `Authorization-Access-Control-Specification-v1.1-FINAL.md`; consistent with Gate v1.3 §9 |
| OTP request limit 3/closure flow, verification attempts 3/OTP, auto-retry 1x (security invariant, not configurable) | Security | AEP-MON-002 §23 |
| No implementation (code/schema/file changes) authorized by this or any source AEP document | Governance | All source AEP "Implementation: NOT AUTHORIZED" headers; Master Prompt Bagian 27 |

---

# 22. ARCHITECTURE CONFLICT REGISTER

| Conflict ID | Source A | Source B | Conflict | Current Authority | Impact | Required Resolution |
|---|---|---|---|---|---|---|
| C-01 | `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1.0.md` (broad payment/subscription/entitlement domain model) | `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx` (narrower, BR-001–151-aligned, listing/promo/quota-transfer focus, includes direct "Claude execution instructions") | Two documents both titled "Monetization/Subscription/Promotion AEP" with overlapping-but-not-identical scope; v1.1 appears to be a narrower operational/implementation-alignment variant rather than a strict supersession of v1.0's broader Commercial/Payment-Gateway domain model | **UNKNOWN** — no explicit supersession statement found in either document | HIGH — risks two divergent Commercial architectures if not reconciled before ADR-MON-* | Owner must confirm: is v1.1 a refinement/subset of v1.0, or an independently-scoped alignment document? Recommend explicit merge or scope demarcation before ADR-MON drafting |
| C-02 | `Architecture-Evolution-Proposal-Organization-Management-System-v0.9-FINAL.md` — Status: **"Draft — menunggu review & pengesahan Architecture Review Board dan sign-off bisnis... belum menggantikan/mengubah dokumen manapun yang sudah Baseline/Approved"** | `docs/02-architecture/SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5.12 — labels Organization Management as **"(baru, ADR-026/ADR-027 — 3 Agustus 2026)"**, i.e. already-approved and integrated into the FINAL System Architecture | The source AEP that proposed Organization is still marked Draft/unapproved, yet the System Architecture (FINAL) and 28-ADR register already treat its outcome (ADR-026/027) as Approved and integrated | **System Architecture v1.6-FINAL + ADR register (Approved) take precedence** per source-of-truth hierarchy — the AEP document's own status label is stale/uncorrected | LOW (does not block anything technically; the decision IS approved) — but a **documentation debt**: the AEP file's own status field was never updated to "Approved/Superseded by ADR-026/027" | Update AEP-ORG-001 status field to reflect approval, or archive it with an explicit "Approved via ADR-026/027" note |
| C-03 | Commercial BR Reconciliation v1.1 / Master BR v1.2: cites "existing MBR-COM-001–013" as canonical, already-covering rules | No standalone `MBR-COM-001–013` source document found in repository or upload corpus | Referenced-but-unsourced rule set — cannot be verified against primary text | **NOT FOUND** | MEDIUM — several "no duplication needed" dispositions in the Commercial Reconciliation cannot be independently verified | Locate or reconstruct the MBR-COM-001–013 source document before Commercial Master BR Lock |
| C-04 | Same pattern for `MBR-LS-001–015` (Learning Session), cited in Master BR v1.2 §3 as already-explicit | No standalone MBR-LS-001–015 source document found | Referenced-but-unsourced | **NOT FOUND / AMBIGUOUS** | MEDIUM | Same as C-03 |
| C-05 | AEP-MON-001 §18 lists 9 ADR-MON candidates as unresolved | AEP-MON-002 §23 treats several of the same topics (Free Bonus one-time-grant, add-on permanence) as **settled business direction ("Locked Business Direction," §4)**, not merely ADR candidates | Terminology/authority mismatch: is the Free Bonus / add-on model "Locked business rule" (BR-001–151-derived) or "ADR candidate awaiting decision" (ADR-MON-002)? | **AMBIGUOUS** — likely resolvable: the *business rule* (one-time grant, no reset) is Locked via BR-001–151; the *technical architecture* (how it's modeled/enforced) is still ADR-pending. MAEP interprets it this way (see §21 Constraint table) but flags it as an interpretation, not a confirmed fact | LOW if MAEP's interpretation is correct; MEDIUM if not | Owner confirmation recommended during ADR-MON-002 drafting |

No conflict above is resolved unilaterally by MAEP; all remain open pending Owner/governance decision, consistent with Master Prompt Bagian 5.

---

# 23. BUSINESS RULE RECONCILIATION

| Rule | Source | Domain | Current Enforcement | Architecture Impact | MAEP Action |
|---|---|---|---|---|---|
| BR-001–151 (legacy) | `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.md` | Organization/Listing/Commercial(legacy)/Security | ERD (`0007`,`0008`), RLS policies (audited, 32/32 issue-register items closed) | None — already enforced | **PRESERVE** |
| Title 001–100 | `Title_Business_Rules_Baseline_v1_0_Consolidated.md` | Title | **NOT FOUND** in repository (no Title tables/entities exist) | CRITICAL — requires new ERD/API/RBAC | **EVOLVE** (new module, post-ADR) |
| LE-001–059 | `Business_Rules_Learning_Economy_RumahAgen_v1_0.md` | Learning | **NOT FOUND** (M04 has no point ledger) | CRITICAL — new ledger entity + service | **EVOLVE** (extend M04, post-ADR) |
| LS-001–080 | `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md` | Learning | **PARTIAL** — `events`/`event_registrations` (M05) cover generic calendar, not live-session lifecycle | CRITICAL — new session/provider entities | **EVOLVE** (extend M04, keep M05 as discovery layer) |
| COM-BR-001–015 | `RUMAHAGEN_COMMERCIAL_BUSINESS_RULES_BASELINE_v1_0_PROPOSED.md` | Commercial | **NOT FOUND** (only legacy add-on/quota concepts embedded in M03/M12) | CRITICAL — new subscription/entitlement/payment domain | **EVOLVE** (new module M14, post-ADR, Payment placement OPEN) |
| MBR-COM-001–013 (referenced) | Cited by Reconciliation v1.1 / Master BR v1.2 | Commercial | **NOT FOUND** — source text missing | Cannot verify "no duplication" claims independently | **VALIDATE** — locate source before Lock |
| MBR-TITLE/COM-X0* amendments (19 items) | Master BR v1.2 §4.2/§5.2 | Title, Commercial | Not enforced anywhere (proposed only) | HIGH — each becomes ERD/RBAC requirement once locked | **PROPOSE** (pending Lock Gate) |
| Duplicate/contradiction found? | — | — | — | — | **None found** between legacy BR-001–151 and new-wave rules — new-wave AEPs explicitly designed to not contradict legacy (Gate v1.3 §6 "Cross-Domain Conflict Check: PASS" for Learning Economy, Learning Session, Title, RBAC; "CONDITIONAL" only for Agency/Organization, now resolved) |
| Obsolete rule found? | — | — | — | — | **None found** — all legacy rules remain LOCKED/active |
| Rule without implementation? | Title 001–100, LE-001–059, LS-001–080, COM-BR-001–015 (all 254 new-wave rules) | — | — | — | Expected — new-wave is pre-ADR by design; **not a defect**, but tracked in Gap Analysis §27 |
| Implementation without rule? | RLS policies for `dbr_config_select`, `roles_select`, `permissions_select`, `role_permissions_select`, `url_redirects_select` — all set `USING (true)` for broader-than-originally-scoped access, discovered as "temuan baru" during Issue Register audit, not tied to a single originating BR | Existing repo | Implemented (in migration, not yet executed live) | LOW — already resolved via Issue Register T4-series closure | **VALIDATE** (confirm data-sensitivity classification remains correct going forward) |

---

# 24. AEP RECONCILIATION

| AEP | Existing Decision | Current State | Conflict | Final Interpretation | MAEP Action |
|---|---|---|---|---|---|
| AEP-ORG-001 (Organization v0.9) | Workspace→Organization rename; Join Request; AI BYOK chat additions | Document status = Draft; but underlying decisions already Approved via ADR-026/027/028 in repo | C-02 (status field stale) | Decisions ARE final (Approved); document status label is outdated | **EVOLVE** — update document status field only; no architectural change needed |
| AEP-MON-001 (Monetization/Payment Gateway v1.0) | Full commercial domain model, 9 ADR-MON candidates | Not yet decided | C-01, C-05 (scope/authority ambiguity vs AEP-MON-002) | Broader domain-model AEP; treat as primary Commercial architecture reference | **PROPOSE** — carry forward as basis for ADR-MON-001–009 drafting; resolve C-01 first |
| AEP-MON-002 (Monetization Architecture Alignment v1.1) | Narrower BR-001–151-aligned listing/promo/quota rules; several items framed as "Locked Business Direction" | Not yet decided as architecture; underlying business rules ARE part of locked BR-001–151 | C-01, C-05 | Business-rule content is authoritative (already locked via BR-001–151); its *architecture translation* is still proposal-level | **EVOLVE/VALIDATE** — treat business content as binding constraint on ADR-MON-001–009, not a competing AEP |
| AEP-LE-001 (Learning Economy v1.0) | Learning Point domain, 8 ADR-LE candidates | Not decided | None found | Sound, non-conflicting extension of M04 | **PROPOSE** — carry forward for ADR-LE-001–008 |
| AEP-LS-001 (Learning Session v1.0) | Session lifecycle, provider adapter, extension of Learning Domain | Not decided | None found (fully consistent w/ Master Prompt Bagian 9 instruction) | Confirmed: Learning Session stays inside Learning Domain, distinct from M05 Calendar/Event | **PROPOSE** — carry forward for ADR-LS-001–007+ |
| AEP-TITLE-001 (Title v1.0) | New Title domain, 10 ADR candidates | Not decided | None found | Sound, well-specified new module (candidate M15) | **PROPOSE** — carry forward for Title ADR candidates 1–10 |
| CAIA-001 | Cross-domain impact analysis, 15 CAIA-ADR candidates, Gate 1/2/3 | Analysis complete; Gate 1 item #1 (Agency=Organization) resolved via Gate v1.3 | None found (CAIA is itself the reconciliation mechanism MAEP extends) | Remains the authoritative bridge document between new-wave and repository baseline | **PRESERVE** — MAEP formalizes and extends CAIA's own findings |

---

# 25. ARCHITECTURE DECISION RECONCILIATION

| ADR/Decision ID | Decision | Source | Status | Authority | Impact | Action |
|---|---|---|---|---|---|---|
| ADR-001..047 (28 approved, repo-native) | Various (search, job queue, maps, caching, multi-tenancy, Organization, AI BYOK, image dedup, etc.) | `architecture-decision-records-FINAL-v1.1-plus-ADR029.md` | APPROVED | FINAL | None — baseline unaffected by new-wave | **PRESERVE** |
| CAIA-ADR-001 (Agency vs Organization identity) | Agency = Organization, single concept | CAIA + Gate v1.3 §2 | **RESOLVED** | Governance-decided (not yet a numbered repo ADR) | Removes identity-branch requirement from ERD/ADR | **VALIDATE→PRESERVE** — recommend formalizing as a numbered repository ADR (e.g., next available number) to close the loop between upload-corpus governance and repo's own ADR register |
| Commercial Entitlement vs Organization Quota authority | A) Entitlement is source of quota capacity, or B) existing Organization quota model IS the entitlement representation | Gate v1.3 §4.1 | **OPEN** | Not yet decided | Blocks ERD for M14 + M12 quota model | **RESOLVE CONFLICT** — must be decided via ADR before ERD |
| Payment placement (Commercial subdomain vs separate module M16) | Not decided | Gate v1.3 §4.2 | **OPEN** | Not yet decided | Blocks whether M16 exists as distinct module | **RESOLVE CONFLICT** — must be decided via ADR before ERD/API |
| ADR-MON-001–009, ADR-LE-001–008, ADR-LS-001–007+, Title ADR 1–10, CAIA-ADR-002–015 (remaining) | Various (see §9.2) | Respective AEPs | NOT DECIDED | Not yet decided | Blocks ERD/API/RBAC for all 4 new-wave domains | **PROPOSE** — prioritize per CAIA Gate 1 > Gate 2 > Gate 3 sequencing |

**Total register size: 28 PRESERVE (existing approved ADR) + 1 VALIDATE→PRESERVE (Agency=Organization, needs formal repo ADR number) + 2 RESOLVE CONFLICT (open, blocking) + ~45 PROPOSE (pending, non-blocking-yet but required before ERD/API changes for their respective domain).**

---

# 26. CURRENT STATE ASSESSMENT

| Dimension | State |
|---|---|
| Documentation completeness (13 existing modules) | 100% — PRD, ERD, API, RBAC, User Flow, Functional/UI/Technical Spec, Module Planning all FINAL |
| Governance maturity | High — 28 ADR Approved, 32/32 Issue Register items Closed, formal EAF (REQ/BR/ENT/API/PERM ID system) in place |
| Code implementation | **0%** — no application code, no route handlers, no components |
| Database | Migration SQL 100% written (15 files, 2,264 lines), **0% executed** (no live schema); 4 files require `-FIXED` variant swap-in before Sprint S0 |
| New-wave domain readiness (Learning Economy/Session, Title, Commercial) | Business Rules: reconciled and largely consolidated (Gate v1.3). Architecture: **0%** synchronized into repository. ADR: **0/~48** formalized |
| Governance debt | 2 OPEN Gate-1-adjacent architecture questions block ERD for 2 of 4 new domains; 2 "NOT FOUND" source documents (MBR-COM-001–013, MBR-LS-001–015) create unverifiable citations; 1 stale AEP status field (C-02) |

**Overall assessment:** RUMAHAGEN existing baseline is production-ready **from a documentation/governance standpoint** and has not yet incurred any implementation debt (nothing to unwind — pre-code). The new-wave domains are well-governed in business-rule terms but **architecturally unsynchronized** with the repository. This is the ideal moment (pre-Sprint S0) to resolve the 2 open ADR questions and formalize the ~48 pending ADR candidates before any schema is executed.

---

# 27. ARCHITECTURE GAP ANALYSIS

| Gap ID | Current State | Required State | Evidence | Impact | Priority | Recommendation |
|---|---|---|---|---|---|---|
| GAP-01 | No Learning Point ledger/transaction model | Transaction-based ledger w/ earned/purchased/redeemed provenance | CAIA §7 | CRITICAL | **P1** | Draft ADR-LE-001–003 before ERD extension of M04 |
| GAP-02 | No Learning Session / Provider Adapter entity distinct from `events` | Session Orchestrator + Provider Adapter (Daily/LiveKit/Zoom/GMeet/YouTube) | CAIA §8 | CRITICAL | **P1** | Draft ADR-LS-001–005; verify provider capability/OAuth/quota before implementation |
| GAP-03 | No Title Definition / Awarding Path / Award Instance model; `certificates` ≠ Title | CAIA §23; AEP-TITLE-001 §5 | CRITICAL | **P1** | Draft Title ADR Candidates 1–3 first (definition/instance/provenance separation) |
| GAP-04 | No Commercial Subscription/Entitlement/Quota domain distinct from legacy add-on/quota concepts | CAIA §4; AEP-MON-001 §4 | CRITICAL | **P0 (blocking — 2 OPEN ADR questions)** | Resolve Commercial-Entitlement-vs-Organization-Quota authority + Payment-placement ADRs FIRST |
| GAP-05 | No Payment Core / Provider Adapter beyond placeholder | CAIA §4 | HIGH/CRITICAL | **P0** | Same as GAP-04 — Payment-placement decision gates this |
| GAP-06 | MBR-COM-001–013 and MBR-LS-001–015 source documents NOT FOUND | — | C-03, C-04 | MEDIUM | **P2** | Locate/reconstruct source before any Master BR Lock referencing them |
| GAP-07 | AEP-MON-001 vs AEP-MON-002 scope overlap unresolved | C-01 | HIGH | **P1** | Resolve before ADR-MON-* drafting begins |
| GAP-08 | AEP-ORG-001 document status field stale (Draft vs. actually-Approved ADR-026/027) | C-02 | LOW | **P3** | Administrative correction |
| GAP-09 | No RBAC permission taxonomy for Learning Session host/instructor, Commercial admin, Point adjustment, Title award/appeal | CAIA §29 Gate 2 | HIGH | **P2** | Draft after respective Gate-1 ADRs close |
| GAP-10 | No API endpoints for any new-wave domain | §15 | CRITICAL (but expected pre-ADR) | **P2** | Do not draft endpoints until ERD/ADR settle (per Bagian 16 instruction) |
| GAP-11 | Provider capability/OAuth/quota/billing for Learning Session providers unverified | LS-AEP "Rules Not Yet Final" §16–18 | MEDIUM | **P3** | Verification task, not an architecture decision |
| GAP-12 | Learning Session attendance formula, minimum %, late-join/grace-period policy undefined | LS-AEP "Rules Not Yet Final" §1–5 | MEDIUM | **P3** | Pending ADR/policy configuration |
| GAP-13 | Title appeal window default duration not finalized (rule 087/MBR-TITLE-APPEAL-002 leaves it configurable-but-undefined) | Title Rules 086–088 | LOW | **P4** | Configuration decision, not architecture |
| GAP-14 | Migration canonicalization (`-FIXED` files not yet renamed/replacing originals) | `CURRENT-PROJECT-STATE` baris 16–18 | HIGH (blocks Sprint S0 for EXISTING 13 modules, independent of new-wave) | **P0 (existing-baseline blocker)** | Must be resolved before Sprint S0 regardless of new-wave decisions |

---

# 28. ARCHITECTURE DEBT REGISTER

| Debt | Type | Evidence | Impact | Severity | Recommendation | Priority |
|---|---|---|---|---|---|---|
| 4 migration files (`0007`,`0008`,`0009`,`0010`) exist in both buggy-original and `-FIXED` form, old versions not yet removed/renamed | Technical/Repository | `CURRENT-PROJECT-STATE` baris 16 | Risk of executing wrong file at Sprint S0 | HIGH | Rename `-FIXED` → canonical name, archive originals, before Sprint S0 | P0 |
| MBR-COM-001–013 / MBR-LS-001–015 referenced but source-not-found | Documentation | C-03, C-04 | Cannot independently verify "no duplication" claims in Commercial/Learning Session reconciliation | MEDIUM | Locate/reconstruct or formally re-derive from AEP text | P2 |
| AEP-ORG-001 status field not updated after ADR-026/027/028 approval | Documentation/Governance | C-02 | Minor confusion risk for future readers/AI agents | LOW | Administrative correction | P3 |
| Two competing "Monetization AEP" documents (v1.0 broad, v1.1 narrow) without explicit relationship statement | Documentation/Governance | C-01 | Risk of divergent Commercial architecture interpretation during ADR-MON drafting | HIGH | Owner scope-reconciliation before ADR-MON drafting | P1 |
| ~48 pending ADR candidates across 4 new domains, none yet formalized in repository's own ADR register format | Governance | §9.2, §25 | Blocks all downstream ERD/API/RBAC work for new-wave domains | CRITICAL (by design — not a defect, but must be tracked) | Sequence per CAIA Gate 1→2→3; formalize into `architecture-decision-records` numbering once decided | P0–P1 depending on gate |
| No Test/Business-Rule Traceability Matrix yet exists for new-wave domains (all 4 AEPs list it as their own final downstream step, unexecuted) | Testing/Governance | Every new-wave AEP §"Downstream Update Order" final item | Cannot verify future implementation against 254 new-wave rules without it | MEDIUM | Build after ADR + ERD phases, per each AEP's own stated order | P2 |

---

# 29. TARGET ARCHITECTURE

## 29.1 Why Evolution Is Required

| Change | Current state | Problem | Evidence | Business impact | Technical impact | Constraint | Proposed evolution |
|---|---|---|---|---|---|---|---|
| Learning Economy | No point ledger | Cannot support "earn/purchase points" business model already governed by locked LE principles | LE-001-059; CAIA §7 | Cannot monetize/gamify Learning without this | New ledger + provenance model | Must not collapse into single balance field | Add Learning Point Ledger as M04 sub-capability |
| Learning Session | `events` too generic | Cannot support live-learning attendance→completion→points chain | LS-001-080; CAIA §8 | Cannot offer live classes/webinars | New session/provider/attendance entities | Keep inside Learning Domain; `events` stays discovery layer | Add Learning Session capability inside M04 |
| Title | No achievement recognition model beyond `certificates` | Cannot support multi-path, versioned, revocable/appealable recognition system already fully specified (100 rules) | AEP-TITLE-001; CAIA §23 | Enables gamification/reputation-building for agents | New domain, ~9 entity types minimum | `certificates` ≠ Title, must not be repurposed | New module M15 |
| Commercial | Only legacy add-on/quota concepts, no formal Subscription/Entitlement/Payment model | Cannot support Free/Pro subscription, add-on/promo purchase, payment lifecycle already specified | AEP-MON-001; CAIA §4 | Enables revenue generation (currently roadmap "Phase 5 Deferred") | New domain, Payment adapter | 2 OPEN ADR questions must resolve first | New module M14 (+ possible M16 for Payment) |

## 29.2 Target Architecture (evolutionary, not rewrite)

```text
                         RUMAHAGEN TARGET ARCHITECTURE
                         (13 existing modules — UNCHANGED)
   M01 Auth  M02 Profile  M03 Listing  M05 Calendar  M06 DevDir  M07 DBR
   M08 Dashboard  M09 Admin  M10 RBAC  M11 SEO  M12 Organization  M13 AI

                         M04 LEARNING (EXTENDED)
                                 │
                ┌────────────────┼─────────────────┐
                │                │                 │
        Learning Center    Learning Economy   Learning Session
        (existing: course/  (NEW: Point Ledger, (NEW: Session
         lesson/quiz/       earn/purchase/       Orchestrator,
         enrollment)         redeem)             Provider Adapter)
                │                │                 │
                └────────────────┴─────────────────┘
                                 ↓
                          Assessment / Evidence
                                 ↓
                        Skill / Credential

                    M14 COMMERCIAL (NEW)                M15 TITLE (NEW)
                            │                                  │
              ┌─────────────┼─────────────┐          Title Definition
              │             │             │                  ↓
        Subscription   Entitlement    Promotion         Awarding Path
              │             │             │                  ↓
              └─────────────┴─────────────┘             Qualification
                            ↓                                 ↓
                      Order/Checkout                    Award Instance
                            ↓                                 ↓
              M16 PAYMENT (OPEN — subdomain of M14        Lifecycle/
              vs separate module, per Gate v1.3 §4.2)      Appeal
                            ↓                                 ↓
                      Payment Core →                    Presentation
                   Provider Adapter(s)
```

**Cross-cutting (unchanged from existing baseline, extended to new modules):** Security/RBAC (7-role model, extended with new PERM-M14/M15-* entries post-ADR), Governance (ADR register + Master BR), Audit (existing pattern extended), Observability (Sentry, unchanged), AI (M13 BYOK boundary respected — AI stays assistive), Integration (Provider Adapter pattern reused from existing Search/Maps/JobQueue adapter precedent), Identity (Supabase Auth, unchanged), Tenancy (Organization=Agency, unchanged).

This target is explicitly **additive**: zero existing entities, APIs, or RBAC rules are removed or restructured.

---

# 30. PROPOSED ARCHITECTURE EVOLUTION

| # | Evolution | Classification (§30 taxonomy) | Depends on |
|---|---|---|---|
| E-01 | Extend M04 Learning Center with Learning Economy (Point Ledger) sub-capability | NEW — PROPOSED | ADR-LE-001–003 |
| E-02 | Extend M04 Learning Center with Learning Session (live learning) sub-capability | NEW — PROPOSED | ADR-LS-001–005 |
| E-03 | Introduce M14 Commercial/Monetization module | NEW — PROPOSED | Resolve OPEN Q1 (Entitlement vs Quota authority), ADR-MON-001–009 |
| E-04 | Introduce M15 Title/Achievement module | NEW — PROPOSED | Title ADR Candidates 1–10 |
| E-05 | Decide Payment placement (M14 subdomain vs M16 separate module) | CONFLICT (OPEN) | Owner/Architecture Review Board decision |
| E-06 | Formalize CAIA-ADR-001 (Agency=Organization) as a numbered repository ADR | EXISTING — VALIDATE | None — administrative |
| E-07 | Reconcile AEP-MON-001 vs AEP-MON-002 scope (C-01) | CONFLICT | Owner decision |
| E-08 | Correct AEP-ORG-001 status field (C-02) | EXISTING — VALIDATE | None — administrative |
| E-09 | Locate/reconstruct MBR-COM-001–013 and MBR-LS-001–015 source text (C-03/C-04) | EXISTING — VALIDATE | None — documentation task |
| E-10 | Migration canonicalization (`-FIXED` swap-in) | EXISTING — VALIDATE | None — pre-existing repository debt, independent of new-wave |

All items above are **PROPOSED governance actions**, not implementation. No code, schema, or file changes are authorized by this document.

---

# 31. CHANGE IMPACT ANALYSIS

| Evolution | Business | Domain | Module | Database | API | UI | AI | Security | Infrastructure | Testing | Migration | Documentation | Governance |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E-01 Learning Economy | HIGH | HIGH | M04 (extend) | CRITICAL | CRITICAL | HIGH | LOW | MEDIUM | LOW | HIGH | HIGH (new tables) | HIGH | CRITICAL (ADR-LE) |
| E-02 Learning Session | HIGH | HIGH | M04 (extend) | CRITICAL | CRITICAL | HIGH | LOW | MEDIUM | HIGH (provider adapters) | HIGH | HIGH | HIGH | CRITICAL (ADR-LS) |
| E-03 Commercial (M14) | CRITICAL | CRITICAL | NEW M14 | CRITICAL | CRITICAL | HIGH | LOW | HIGH | MEDIUM | CRITICAL | CRITICAL | CRITICAL | CRITICAL — **blocked on OPEN Q1** |
| E-04 Title (M15) | HIGH | CRITICAL | NEW M15 | CRITICAL | CRITICAL | HIGH | LOW | MEDIUM | LOW | HIGH | HIGH | HIGH | CRITICAL (10 ADR candidates) |
| E-05 Payment placement | MEDIUM | CRITICAL (determines M14 vs M16 boundary) | NEW M14/M16 | HIGH | HIGH | LOW | LOW | HIGH | MEDIUM | MEDIUM | MEDIUM | MEDIUM | CRITICAL — **blocking decision** |
| E-06..E-10 (governance corrections) | LOW | LOW | — | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | MEDIUM | MEDIUM |

---

# 32. BACKWARD COMPATIBILITY

| Evolution | Existing API | Existing DB | Existing UI | Existing BR | Existing Integrations | Compatibility |
|---|---|---|---|---|---|---|
| E-01 Learning Economy | No existing Learning Point endpoints to break | `certificates`/`enrollments` untouched, new tables additive | No existing point-related UI to break | No legacy BR references Learning Points | None | **Compatible** (additive) |
| E-02 Learning Session | `events`/`event_registrations` endpoints untouched (M05 retained as discovery layer, per CAIA §24) | `events` schema untouched; new `learning_session*` tables additive | Calendar UI untouched | No legacy BR conflict | New: provider OAuth integrations | **Compatible** (additive), provided M05/M04 boundary is respected as CAIA recommends |
| E-03 Commercial | No existing subscription/payment endpoints to break | Existing add-on/quota concepts in M03/M12 **may require reconciliation**, not necessarily breaking | No existing subscription UI | Must not contradict BR-001–151 (add-on permanence, promo-expiry-transfer rules) — **this is a hard constraint, verified consistent per Gate v1.3 §6** | New: payment gateway integration | **Conditionally compatible** — depends on resolution of OPEN Q1 (Entitlement vs Quota authority); a wrong resolution could force a breaking change to M12 Organization quota model |
| E-04 Title | No existing Title endpoints to break | `certificates` table stays as-is (NOT repurposed, per CAIA §23) | Existing certificate/badge UI in profile — new Title presentation is additive alongside it | No legacy BR conflict | None | **Compatible** (additive) |
| E-05 Payment placement | N/A (no existing payment API) | N/A | N/A | N/A | N/A | Decision determines whether E-03's schema is nested under M14 or split into M14+M16 — **architecture-internal, not user-facing breaking change either way** |

**No breaking changes identified** against the existing 13-module baseline for any proposed evolution, provided the OPEN Q1 (Commercial Entitlement vs Organization Quota) is resolved deliberately rather than left to downstream implementation to infer (Gate v1.3 §13 explicitly warns against this).

---

# 33. MIGRATION STRATEGY

Karena implementasi = 0% dan database belum live, migration strategy new-wave adalah **governance migration**, bukan data migration:

1. **Immediate (independent of new-wave):** Canonicalize `-FIXED` migration files (rename, archive originals) before Sprint S0 — this is existing-baseline debt (GAP-14), not new-wave-related, and should not be delayed by new-wave ADR resolution.
2. **Gate 1 (blocking):** Resolve 2 OPEN architecture questions (Commercial Entitlement vs Organization Quota; Payment placement) via formal ADR.
3. **Gate 1 (parallel, non-blocking each other):** Resolve C-01 (AEP-MON-001 vs -002 scope) before drafting ADR-MON-*.
4. **ADR formalization:** Promote ~48 pending ADR candidates through repository's own ADR process, numbered consistently with existing `ADR-0NN` sequence.
5. **ERD extension:** Only after respective ADRs close — extend ERD v1.4 additively (new tables/entities for M04-extension, M14, M15), never altering existing 41 entities' semantics.
6. **API/RBAC extension:** New endpoint groups + permission entries (`PERM-M14-*`, `PERM-M15-*`) following existing `API-M0X-NNN` / `PERM-M0X-Action-Entity` conventions from EAF.
7. **Downstream sync:** User Flow → PRD → Functional/UI/Technical Spec → Module Planning (MP-14, MP-15) → Test/Traceability Matrix, in that order — matching the "Downstream Update Order" already specified identically in all 4 new-wave AEPs and in CAIA §30.
8. **Since database is not live, no data-migration risk exists for new-wave domains** — a genuine strategic advantage explicitly noted by CAIA §25 and reaffirmed here: this is the correct moment to make these decisions.

No data migration for existing modules is proposed or required by this document.

---

# 34. EVOLUTION ROADMAP

### Phase 0 — Baseline & Governance (immediate, no new-wave dependency)
- Canonicalize `-FIXED` migration files (GAP-14).
- Correct AEP-ORG-001 status field (E-08).
- Locate/reconstruct MBR-COM-001–013 and MBR-LS-001–015 (E-09).
- Formalize CAIA-ADR-001 (Agency=Organization) as a numbered repository ADR (E-06).

### Phase 1 — Required Corrections (governance decisions, no code)
- Owner resolves C-01 (AEP-MON-001 vs -002 scope) (E-07).
- Owner/Architecture Review Board resolves OPEN Q1 (Commercial Entitlement vs Organization Quota authority).
- Owner/Architecture Review Board resolves OPEN Q2 (Payment placement: M14 subdomain vs M16).
- Formalize ADR-MON-001–009, ADR-LE-001–008, ADR-LS-001–007+, Title ADR Candidates 1–10, remaining CAIA-ADR-002–015 (Gate 1 items first, per CAIA §29 sequencing: Learning Activity vs Course, Certificate/Credential vs Title, Calendar Event vs Learning Session).

### Phase 2 — Architecture Evolution (post-ADR)
- Extend ERD v1.4 additively for Learning Economy, Learning Session, Commercial (M14), Title (M15).
- Extend API Specification v1.3 with new endpoint groups.
- Extend Authorization & Access Control Spec v1.1 with new permission taxonomy (Gate 2 items).
- Extend PRD/User Flow/Functional/UI/Technical Spec.
- Produce MP-14 (Commercial) and MP-15 (Title) Module Planning documents, following the existing MP-01..MP-13 format.

### Phase 3 — Scale & Optimization
- Provider capability/OAuth/quota/billing verification for Learning Session providers (Gate 3 item).
- Exact attendance formula, late-join/grace-period policy (Gate 3 item).
- Exact Title awarding configurations, appeal window default (Gate 3 item).
- Exact Commercial pricing/configuration (explicitly out of scope for invention per every source AEP).

### Phase 4 — Future Evolution
- Payment provider live activation (currently designed to be payment-ready-but-inactive during beta, per COM-BR-015/MBR-COM-012/ADR-MON-008).
- AI-assisted transcript/summary features for Learning Session recordings (explicitly optional, non-authoritative).
- Any further domain expansion beyond the 4 domains covered by this MAEP.

**No phase above includes actual coding, schema execution, or file changes — all phases remain governance/design artifacts until a future, explicitly-authorized implementation directive.**

---

# 35. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Wrong resolution of Commercial Entitlement vs Organization Quota authority forces a breaking change to M12 later | MEDIUM | HIGH | Resolve via ADR before any M14/M12 schema change; do not let ERD/implementation infer it (Gate v1.3 §13) |
| AEP-MON-001/-002 scope ambiguity (C-01) causes two teams/sessions to build divergent Commercial models | MEDIUM | HIGH | Resolve C-01 explicitly before ADR-MON drafting |
| Migration `-FIXED` files not canonicalized before Sprint S0, buggy originals executed by mistake | MEDIUM | CRITICAL (security/RLS bugs re-introduced) | Rename/replace before Sprint S0 — independent P0 item |
| Provider (Zoom/GMeet/YouTube/payment gateway) capability/quota/policy turns out incompatible with proposed design after ADR is locked | MEDIUM | MEDIUM | Verify capability BEFORE finalizing ADR-LS/ADR-MON where feasible, or explicitly scope ADR as provisional pending verification |
| MBR-COM-001–013 / MBR-LS-001–015 (NOT FOUND) turn out to contain rules that contradict the "no duplication needed" disposition | LOW-MEDIUM | MEDIUM | Locate/reconstruct before Lock Gate (E-09) |
| Scope creep: new-wave domains implemented ahead of ADR resolution due to time pressure | MEDIUM | CRITICAL | Reaffirm "Implementation NOT AUTHORIZED" status at every governance checkpoint |
| Title's 100 rules + Commercial's 15+13(unsourced)+9 amendments + Learning's 139 rules (LE+LS) create RBAC/permission sprawl if not modeled carefully | MEDIUM | MEDIUM | Follow existing EAF `PERM-M0X-Action-Entity` convention strictly; reuse 7-role model, do not invent new roles without evidence |

---

# 36. DEPENDENCY REGISTER

| Item | Depends on |
|---|---|
| ERD extension for M14 (Commercial) | OPEN Q1 + OPEN Q2 resolution |
| ERD extension for M15 (Title) | Title ADR Candidates 1, 2, 3 (Definition/Instance/Provenance separation) |
| ERD extension for M04-Learning-Economy | ADR-LE-001, ADR-LE-002 |
| ERD extension for M04-Learning-Session | ADR-LS-001, ADR-LS-002, provider capability verification |
| API extension (all new-wave) | Respective ERD extension |
| RBAC extension (all new-wave) | Respective API extension + CAIA Gate 2 items |
| PRD/User Flow/Functional/UI Spec extension | Respective API + RBAC extension |
| Module Planning MP-14/MP-15 | Respective PRD extension |
| Test/Traceability Matrix (new-wave) | All of the above, per every source AEP's own stated downstream order |
| Sprint S0 execution (existing 13 modules) | Migration canonicalization only — **independent of all new-wave items above** |

---

# 37. ARCHITECTURE TRACEABILITY MATRIX

Representative sample (full 254-rule granular matrix exists inside each domain's own Reconciliation/Traceability document and is not reproduced verbatim here, per the no-unnecessary-duplication principle these same source documents establish for themselves):

| ID | Business Rule | Source | Domain | Module | Architecture Component | Data | API | UI | Security | Implementation |
|---|---|---|---|---|---|---|---|---|---|---|
| TRC-01 | BR §4 (Agency lifecycle ACTIVE→CLOSING→CLOSED) | `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.md` | Organization | M12 | Organization state machine | `organizations` | Organization endpoints (API v1.3) | Organization dashboard | RLS `organizations_*` | Migration `0007` (written, not executed) |
| TRC-02 | LE-001 (Free-to-Learn) | `Business_Rules_Learning_Economy...md` | Learning | M04-extend | Learning Point access-gate logic | **NOT FOUND** (no ledger yet) | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| TRC-03 | LS Master Invariant #5 (Session Type ≠ Provider) | `AEP-LS-001` | Learning | M04-extend | Session Orchestrator | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| TRC-04 | Title Rule 029 (Primary independent of Featured, max 1+3) | `Title_Business_Rules_Baseline...md` | Title | M15 (new) | Presentation model | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| TRC-05 | AEP-MON-001 §16 Principle 1 (Subscription ≠ Entitlement) | `AEP_Monetization...v1.0.md` | Commercial | M14 (new) | Subscription/Entitlement separation | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| TRC-06 | CAIA-ADR-001 (Agency=Organization) | Gate v1.3 §2 | Organization | M12 | Terminology/identity model | `organizations` (existing) | Existing Organization API | Existing UI | Existing RLS | Existing migration `0007` |

**Pattern observed:** every existing-baseline rule (TRC-01, TRC-06) traces cleanly end-to-end. Every new-wave rule (TRC-02..05) traces only to its source document and stops at "NOT FOUND" for Data/API/UI/Security/Implementation — this is the expected, honest state of a pre-ADR domain and is the central finding of this MAEP, not an omission.

---

# 38. MASTER ARCHITECTURE DECISION REGISTER

See consolidated version in §25 (Architecture Decision Reconciliation) — that table **is** the Master Architecture Decision Register requested by Master Prompt Bagian 31, structured with the requested Action taxonomy (PRESERVE/VALIDATE/EVOLVE/DEPRECATE/PROPOSE/RESOLVE CONFLICT). No separate register is duplicated here to avoid the exact "duplicate authority" problem this document warns against elsewhere (Gate v1.3 §6 principle).

---

# 39. GOVERNANCE REQUIREMENTS

1. This MAEP does not become Baseline/Approved merely by being written — it requires Architecture Review Board review and Owner sign-off, consistent with how `AEP-ORG-001` itself is still gated.
2. The 2 OPEN architecture questions (§4.1–4.2 of Gate v1.3) must be resolved via formal ADR before any ERD/API/RBAC work begins on M14/M16/M12-quota-boundary.
3. All ~48 pending ADR candidates must be formalized through the repository's existing ADR numbering/approval process before being treated as decided.
4. No developer, AI coding agent, or ERD designer may infer the 2 OPEN questions — this is explicitly restated from Gate v1.3 §13 and adopted as a hard governance rule of this MAEP.
5. Once ADRs are approved, this MAEP itself must be re-synchronized (its Target Architecture section, §29, references decisions that do not yet exist).

---

# 40. OPEN DECISIONS

| ID | Decision | Owner action needed |
|---|---|---|
| OPEN-Q1 | Commercial Entitlement is the source of Organization quota capacity, OR existing Organization quota model IS the entitlement representation | Architecture Review Board decision, formalized as ADR |
| OPEN-Q2 | Payment is a Commercial (M14) subdomain, OR a separate logical module (M16) | Architecture Review Board decision, formalized as ADR |
| OPEN-C01 | Relationship between AEP-MON-001 (broad) and AEP-MON-002 (narrow) — merge, subset, or independently scoped? | Owner clarification |
| OPEN-C03/C04 | Locate or reconstruct MBR-COM-001–013 and MBR-LS-001–015 source documents | Owner/document-custodian action |
| OPEN-GAP13 | Title appeal window default duration | Configuration decision (non-architectural) |

---

# 41. APPROVAL REQUIRED

- Architecture Review Board sign-off on this MAEP itself.
- Owner decision on OPEN-Q1, OPEN-Q2, OPEN-C01 (§40) before Phase 1 of the roadmap (§34) can complete.
- Formal ADR approval (repository's existing process) for each of the ~48 pending ADR candidates before their respective Phase 2 work begins.

---

# 42. FINAL RECOMMENDATION

RUMAHAGEN's existing 13-module baseline is **valid, mature, and should be preserved without restructuring**. The four new-wave domains (Learning Economy, Learning Session, Title, Commercial/Monetization) are **well-specified at the business-rule level** and represent a **legitimate, additive architectural evolution** — not a competing redesign.

**Recommended sequence:**
1. Close Phase 0 governance-hygiene items (migration canonicalization is the only item with a hard external deadline — before Sprint S0).
2. Resolve the 2 OPEN architecture questions and the AEP-MON-001/-002 scope ambiguity.
3. Formalize the ~48 pending ADR candidates in Gate-1 → Gate-2 → Gate-3 order, exactly as CAIA already sequenced them.
4. Only then extend ERD/API/RBAC/PRD — additively, never restructuring the existing 41-entity baseline.

**This MAEP does not authorize implementation.** It is the single reconciled reference for what has been decided, what remains open, and in what order the remaining decisions must be made.

---

# 43. APPENDIX — EVIDENCE INDEX

**Repository (cloned `github.com/mujtahidaktanto/rumahagen`):**
`docs/00-governance/*`, `docs/01-product/*`, `docs/02-architecture/*` (incl. `adr-reviews/`), `docs/03-database/*`, `docs/04-api/*`, `docs/05-ux/*`, `docs/06-security/*`, `docs/07-seo/*`, `docs/08-technical-spec/*`, `docs/09-module-planning/*`, `docs/10-roadmap/*`, `docs/11-ai-context/*`, `docs/12-reports/*`, `supabase/migrations/*`, `supabase/seed/*`.

**Uploaded corpus (16 files, all read in full):**
`RUMAHAGEN_MASTER_BR_FINAL_TRACEABILITY_GATE_v1_3.docx`, `RUMAHAGEN_MASTER_BUSINESS_RULES_v1_2_FINAL_CONSOLIDATION_CANDIDATE.docx`, `RUMAHAGEN_TITLE_BR_TRACEABILITY_AUDIT_v1_0.docx`, `RUMAHAGEN_MASTER_BUSINESS_RULES_v1_1_CONSOLIDATED.docx`, `RUMAHAGEN_CURRENT_ARCHITECTURE_IMPACT_ANALYSIS_v1_0.md`, `RUMAHAGEN_Learning_Session_AEP_and_Business_Rules_v1_0.md`, `Business_Rules_Learning_Economy_RumahAgen_v1_0.md`, `AEP_Learning_Economy_v1_0.md`, `AEP_Title_Business_Rules_Baseline_v1_0.md`, `Title_Business_Rules_Baseline_v1_0_Consolidated.md`, `RUMAHAGEN_Architecture_Evolution_Monetization_Subscription_Promotion_v1_1.docx`, `RUMAHAGEN_Business_Rules_Baseline_v1_0_FINAL.docx`, `Learning_Session_Architecture_Evolution_v2_1_.pdf`, `RUMAHAGEN_COMMERCIAL_BR_RECONCILIATION_v1_1.md`, `RUMAHAGEN_COMMERCIAL_BUSINESS_RULES_BASELINE_v1_0_PROPOSED.md`, `RUMAHAGEN_TITLE_TRACEABILITY_RECONCILIATION_v1_1.md`, `AEP_Monetization_Subscription_Promotion_Payment_Gateway_v1_0.md`.

---

**— END OF DOCUMENT: MASTER ARCHITECTURE EVOLUTION PROPOSAL (MAEP) v1.0 —**

**Status: PROPOSED — NOT YET APPROVED — IMPLEMENTATION NOT AUTHORIZED**
