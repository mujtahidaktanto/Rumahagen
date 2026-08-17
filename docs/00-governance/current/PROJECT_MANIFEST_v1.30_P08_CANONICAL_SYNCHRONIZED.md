# PROJECT MANIFEST
## Platform Web RUMAHAGEN — Control Center Dokumentasi Proyek

> **Dokumen ini BUKAN** Project Overview, Changelog, Current Project State, atau Baseline Register — dokumen-dokumen tersebut tetap ada dan tetap otoritatif di areanya masing-masing (lihat Bagian 5). Project Manifest adalah **indeks resmi tunggal** di atas seluruhnya: titik masuk pertama yang wajib dibaca **sebelum** dokumen lain mana pun dibuka, oleh AI Coding Assistant (Claude, ChatGPT, Bolt.new, Cursor, GitHub Copilot) maupun kontributor manusia (Developer, QA, Technical Lead).

**Disusun dalam kapasitas gabungan:** Chief Technology Officer · Enterprise Software Architect · Software Configuration Manager · Technical Documentation Architect · Enterprise Project Governance Specialist · AI Development Workflow Architect

**Disusun berdasarkan:** seluruh dokumen governance terbaru yang tersedia — `architecture-decision-records.md` (Baseline, v1.1, 28 ADR + `ADR-046`), `technology-decisions.md` (Baseline, v1.6), `SYSTEM-ARCHITECTURE.md` (Baseline, v1.6), `dependency-manifest.md` (Baseline, v1.6), `PROJECT-CONSTITUTION.md` (Baseline, v1.8), `development-playbook.md`/`AI-DEVELOPMENT-BLUEPRINT.md` (Baseline, v1.6), `CURRENT-PROJECT-STATE.md`, `decision-log.md` (46 entry), `CHANGELOG.md` (rilis **`0.4.1`**), dan `document-governance-baseline-register.md` (Baseline, **v1.4**). **Pengesahan Baseline 5 Agustus 2026 (atas perintah Owner):** `PRD.md` (v1.2, Baseline sejak awal), `Entity-Mapping.md` (v1.0, **Baseline**), `ERD-Skema-Database.md` (v1.3, **Baseline**), `User-Flow.md` (v1.2, **Baseline**), `API-Specification.md` (v1.2, **Baseline**), `Authorization-Access-Control-Specification.md` (v1.0, **Baseline**), `Functional-Specification.md` (v1.0, **Baseline**), `UI-Specification.md` (v1.0, **Baseline**), `Technical-Specification.md` (v1.0, **Baseline**) — **seluruh 24 dokumen di Baseline Register kini tidak ada satu pun berstatus Draft**. Dokumen pendukung yang tidak direvisi pada siklus ini: `SEO-Analytics-Specification.md` (tetap v1.1), `AI-CONTEXT-PACK.md`, `DEVELOPMENT-ROADMAP.md`, `TASK-TEMPLATE.md`, `foundation-validation-report.md`, `executive-architecture-review.md`, `synchronization-report-adr-001.md`.

**Update siklus konsolidasi 9-10 Agustus 2026 (audit riwayat versi 13 Module Planning + SYSTEM-ARCHITECTURE.md + AI Development Blueprint, lihat Bagian 14B s.d. 14O):** `CHANGELOG.md` naik ke rilis **`0.7.19`**. 7 regresi dokumentasi-vs-implementasi aktif ditemukan & diperbaiki (5 file sumber: `0007_m12_organization.sql`, `0008_m03_listing.sql`, `0009_m04_learning_center.sql`, `0010_m05_events.sql`, `API-Specification-...v1.3-FINAL.md` — versi `-FIXED` siap menggantikan versi lama di project, belum dieksekusi otomatis). **Temuan governance tertinggi prioritasnya:** seluruh 4 item Tier 1 `TASK-HOTFIX-20260806-001` (T1-01 s.d. T1-04) terkonfirmasi gagal 100%.

**Audit susulan 10 Agustus 2026:** MP-02 diaudit ulang dengan standar verifikasi ketat penuh (item terbuka dari siklus sebelumnya) — **tidak ada regresi ditemukan**, kedua klaim (OD-23, T4-03) terbukti benar diterapkan di file sumber (`0005_m02_agent_profile.sql`, `Authorization-Access-Control-Specification-v1.1-FINAL.md`). Rasio regresi pola sistemik final: **6 dari 12 klaim (50%)**. `CHANGELOG.md` naik ke **`0.7.20`**, `document-governance-baseline-register.md` naik ke **v1.9** (Governance Notes poin 37) — item terbuka MP-02 resmi ditutup.

**Jika terjadi konflik antar dokumen:** `architecture-decision-records.md` (ADR berstatus **Approved**) selalu menjadi keputusan tertinggi — lihat Bagian 5 (Source of Truth Index).

**Tidak ada dokumen sumber yang diubah dalam penyusunan Manifest ini.** Pertentangan yang ditemukan dicatat sebagai Governance Notes (Bagian 16), bukan diselesaikan sepihak.

---

## Riwayat Versi (Version History)

> **Catatan audit (ditambahkan oleh siklus konsolidasi 10 Agustus 2026):** Dokumen ini sebelumnya tidak memiliki tabel Riwayat Versi eksplisit. Tabel di bawah disusun dari 16 snapshot yang diaudit. Snapshot `project-manifest.md` s.d. `__9_` **tidak memiliki nomor versi manifest sendiri** secara eksplisit di sumbernya (hanya diidentifikasi lewat tag "Rilis proyek X.X.X") — kolom Versi diisi dengan tag tsb, bukan nomor `vX.X` yang dikarang. Penomoran diri eksplisit ("Manifest ini sendiri vX.X") baru dimulai di snapshot ke-11. **Gap serius:** versi **v1.11 s.d. v1.23 tidak pernah diupload** — lompatan dari v1.10 langsung ke v1.24 di sumber yang tersedia. Lihat Laporan Audit untuk detail.

| Versi (Rilis/Manifest) | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| Rilis 0.1.1 | 28 Jul 2026 | Dokumen baru. |
| Rilis 0.1.2 | 28 Jul 2026 | Sinkronisasi ADR-005 (Search Strategy). |
| Rilis 0.1.3 | 29 Jul 2026 | Sinkronisasi ADR-006 (Job Queue Strategy). |
| Rilis 0.1.4 | 30 Jul 2026 | Sinkronisasi ADR-008 (Maps Provider), menggantikan ADR-028. *(2 snapshot hari sama: draf awal tanpa Bagian 4, lalu versi lengkap.)* |
| Rilis 0.1.5 | 31 Jul 2026 | Sinkronisasi ADR-018 (Caching) — 25/25 ADR Approved. |
| Rilis 0.2.0 | 3 Agu 2026 | Sinkronisasi ADR-026/027/028 (Organization + AI Assistant) — 28/28 ADR. *(3 snapshot: 2 identik + 1 revisi kecil.)* |
| Rilis 0.2.1 | 4 Agu 2026 | Resolusi OD-02/06/07 — 6/6 kondisi GO WITH CONDITIONS CTO terpenuhi. |
| **v1.7** (rilis 0.2.2) | 4 Agu 2026 | Konsolidasi `architecture-decision-records.md` ke v1.1. Penomoran diri manifest dimulai. |
| **v1.8** (rilis 0.3.0) | 5 Agu 2026 | Siklus Engineering Alignment — PRD/ERD/User Flow/API Spec naik versi, Entity Mapping & Authorization Spec baru. |
| **v1.9** (rilis 0.4.0) | 5 Agu 2026 | 3 dokumen baru: Functional/UI/Technical Specification. |
| **v1.10** (rilis 0.4.1) | 5 Agu 2026 | Pengesahan Baseline untuk 8 dokumen. |
| **v1.11–v1.23** | *(tidak diupload)* | **⚠️ GAP — 13 versi tidak tersedia untuk audit.** `P12-Rekonsiliasi-Penuh-ProjectManifest-v1_11.md` yang diupload adalah *proposal* menuju v1.11 (bukan snapshot final), tidak dapat dipastikan apakah pernah diterapkan. |
| **v1.24** (rilis 0.7.16) | 10 Agu 2026 | Konsolidasi riwayat versi 13 Module Planning + SYSTEM-ARCHITECTURE + AI Dev Blueprint; 7 regresi ditemukan & diperbaiki (Bagian 14B-14O). *(2 snapshot: dasar + addendum 14P MDM/MIS.)* |
| **v1.25** (rilis 0.7.20) | 10 Agu 2026 | Audit ulang MP-02 standar ketat, tidak ada regresi (Bagian 14Q). |
| **v1.26** (rilis 0.7.20, tidak naik) | 10 Agu 2026 | Rekonsiliasi Bagian 4/6/7/8 — ditemukan basi sejak ~4-5 Agustus meski nomor versi manifest terus naik; +9 Open Decision (OD-16–OD-24), +ADR-029, +3 baris Baseline (Entity Mapping/Authorization Spec/Functional-UI-Technical Spec), versi PRD/ERD/API Spec dikoreksi ke v1.3/v1.4/v1.3 (Governance Notes poin 14). |
| **v1.27** (rilis 0.7.20, tidak naik) | 10 Agu 2026 | Adopsi resmi `document-governance-baseline-register.md` v1.10 dan `CURRENT-PROJECT-STATE.md` rev. 9 dikonfirmasi Owner — rujukan "v1.9/draf v1.10" di Bagian 4/5/8/10/19 diperbarui jadi "v1.10 (resmi)" (Governance Notes poin 15). |
| **v1.28** (rilis 0.7.20, tidak naik) | 11 Agu 2026 | Penetapan resmi nama brand/produk **RUMAHAGEN** oleh Owner, menggantikan placeholder `{nama_platform}` — dicatat sebagai `decision-log.md` OD-26 dan `document-governance-baseline-register.md` Governance Notes poin 39 (naik ke v1.11) (Governance Notes poin 16). **— HISTORICAL SNAPSHOT; superseded by v1.30** |
| **v1.30** | 17 Agu 2026 | P08 Wave 1 substantive canonical synchronization: separates document version from synchronization/baseline state; updates current project-control phase and actual Development evidence; distinguishes repository existence from application/runtime implementation; preserves D6/Cross-AEP history and controlled residuals. |

---

# 1. Project Information

| Field | Value |
|---|---|
| **Project Name** | Platform Web RUMAHAGEN (SaaS — Mujtahid Aktanto) |
| **Version** | **1.30** |
| **Current Phase** | **Wave 1 — Governance / Project-Control Canonical Closure.** Constitution v1.11 and Governance Register v1.13 are complete local controlled artifacts; Project Manifest v1.30 is the current artifact being finalized; Current Project State, Decision Log, Changelog and Canonical Source Register remain in the Wave 1 working sequence. |
| **Overall Status** | 🟡 **Wave 1 OPEN — controlled synchronization in progress.** Governance/control gate work is advanced, but the full Wave 1 artifact set is not yet closed. |
| **Repository** | **Exists:** GitHub repository `mujtahidaktanto/Rumahagen` is the read-only implementation/reference source during this synchronization pass. Repository write/promotion is operationally deferred to the Project Owner's local Git/Git Bash workflow after Wave 1 completion. |
| **Last Updated** | **17 Agustus 2026 — P08 Wave 1 controlled canonical synchronization.** Formal versioning follows Option C: document version, synchronization state and baseline status are separate dimensions. |


---

# 1A. P08 CURRENT CANONICAL CONTROL STATE

> **This section is the active current-state interpretation for this Manifest. Older dated narratives elsewhere in this document remain historical audit evidence and must not override this section.**

### Synchronization layers

```text
Approved Decisions / Governance
        ↓
Canonical Semantic Architecture
        ↓
Intended Physical Model
        ↓
Executed Development State
        ↓
Runtime Verified State
```

The layers are distinct. Repository existence does not mean application runtime is complete, and a document's synchronization state does not automatically change its formal version.

### Current verified project reality

The latest controlled project synchronization evidence records:

- GitHub repository exists and is the implementation/reference repository.
- Supabase ↔ pgAdmin connectivity is **PASS**.
- Regional reference reconciliation is **PASS** for the verified Development state.
- Development tester/auth identity reconciliation is **PASS** for the verified tester set.
- Full canonical document synchronization is **not yet closed**.
- Physical implementation authorization remains governed by its own gates.
- TECH/runtime evidence remains separate from document semantic authority.

### Wave 1 status

```text
01 Constitution                         DONE — v1.11 local artifact
02 Governance Register                 DONE — v1.13 local artifact
03 Project Manifest                    DONE — v1.30 local artifact
04 Current Project State               NEXT
05 Decision Log                        PENDING
06 Changelog                           PENDING
07 Canonical Source Register           PENDING
08 Final Wave 1 Reconciliation         PENDING
```

### Repository promotion rule

GitHub is a read-only reference layer for this synchronization pass. Final local artifacts are the deliverables of the document synchronization step. GitHub create/update or post-write verification is not a completion gate; the Project Owner will promote the final local Wave 1 files through local Git/Git Bash after the full set is complete.

### Controlled residuals

The Manifest must not claim that all architecture/implementation matters are closed. Controlled residuals continue to be tracked by the applicable residual register, including OPEN-C01 and other explicitly carried-forward technical/product evidence gaps.

---

# 2. Executive Dashboard

| Dimensi | Indikator | Ringkasan |
|---|---|---|
| **Project Health** | 🟡 | **Wave 1 OPEN**. Governance/control synchronization is still in progress. Historical ADR decisions remain governed; later MAEP/AEP/MADCR residuals remain controlled and are not silently closed. |
| **Current Milestone** | 🟡 | **Wave 1 Governance / Project-Control Closure** — document synchronization is still open. Technical execution evidence is maintained separately and does not close Wave 1. |
| **Current Phase** | 🟡 | **Wave 1 — Governance / Project-Control Canonical Closure**. Foundation/Architecture Alignment and technical execution narratives below are retained as historical evidence. Current synchronization status is governed by §1A. |
| **Architecture Status** | 🟢 | The legacy/core ADR corpus is governed as approved decision authority within its scope. The later AEP/MADCR evolution layer is tracked separately through controlled residuals and downstream synchronization; no P08 step silently supersedes approved decisions. |
| **Documentation Status** | 🟡 | Canonical knowledge state is established, but full canonical document synchronization is **not yet closed**. Current Wave 1 artifacts are being finalized one by one. |
| **Baseline Status** | 🟡 | Latest verified Cross-AEP D0-D1 synchronized baselines are: Constitution v1.10, Governance Register v1.12, Manifest v1.29, System Architecture v1.7, Current Project State rev.11. P08 Wave 1 substantive revisions are now being prepared as local controlled artifacts; historical baselines remain preserved. |
| **Development Readiness** | 🟡 | Technical execution has its own evidence/gates. The current control plan records Supabase↔pgAdmin connectivity, regional reference reconciliation, and Auth/tester identity verification as PASS, while full canonical document synchronization remains OPEN. Do not infer runtime/application completion from document readiness. |
| **AI Readiness** | 🟡 | AI implementation readiness is governed by the canonical baseline and current technical evidence. The project must not treat the existence of documentation as proof that runtime/application behavior is complete. |
| **Governance Health** | 🟡 | Wave 1 governance control is active. Constitution v1.11 and Governance Register v1.13 are completed local artifacts; Manifest v1.30 is completed locally; Current Project State, Decision Log, Changelog and Canonical Source Register remain to be completed and reconciled before Wave 1 closes. |

---

# 3. Current Phase

## Phase Sekarang

**Wave 1 — Governance / Project-Control Canonical Closure**

Wave 1 is the active controlled synchronization pass. It is intentionally executed one artifact at a time and does not require GitHub write or post-write verification. Final local artifacts are the deliverables of this document synchronization pass; repository promotion is a separate owner-managed operational step.

Current sequence:

```text
01 Constitution                         DONE — v1.11
02 Governance Register                 DONE — v1.13
03 Project Manifest                    DONE — v1.30
04 Current Project State               NEXT
05 Decision Log                        PENDING
06 Changelog                           PENDING
07 Canonical Source Register           PENDING
08 Final Wave 1 Reconciliation         PENDING
```

The Foundation/Architecture Alignment history below is retained as historical project evidence. It must not be interpreted as the current synchronization phase.

## Phase Sebelumnya

**Cross-AEP / D0-D1 Global Semantic Synchronization** — the synchronized package established the latest verified baseline set of Constitution v1.10, System Architecture v1.7, Manifest v1.29, Governance Register v1.12 and Current Project State rev.11. fileciteturn194file6

## Phase Berikutnya

After Wave 1 is formally closed, the process may proceed to the next controlled synchronization wave according to the locked canonical plan. This Manifest does not authorize that downstream work by itself.

## Entry Criteria — Architecture Alignment Phase (Penuh)
*(`executive-architecture-review.md` §12 — snapshot 27 Jul 2026, status diperbarui berdasarkan ADR terbaru per 4 Agustus 2026; **6 dari 6 kini terpenuhi** — naik dari 5/6 menyusul resolusi OD-06)*

| # | Syarat | Status |
|---|---|---|
| 1 | ERD stabil sebagai kandidat Baseline | ✅ Terpenuhi |
| 2 | API Specification stabil sebagai kandidat Baseline | ✅ Terpenuhi |
| 3 | Tidak ada konflik struktural pada model data/bisnis inti | ✅ Terpenuhi |
| 4 | Keputusan arsitektur backend terkunci | ✅ Terpenuhi — `ADR-001` Approved 27 Jul 2026 |
| 5 | Search Engine & Job Queue diputuskan | ✅ Terpenuhi — `ADR-005` (Search Strategy) Approved 28 Jul 2026; `ADR-006` (Job Queue Strategy) Approved 29 Jul 2026 |
| 6 | Reviewer/Approver bernama ditugaskan untuk sign-off Alignment | ✅ **Terpenuhi — 4 Agustus 2026** (OD-06): Mujtahid Aktanto (Solo Project Owner, AI-Assisted) |

**Entry parsial** untuk **ERD Alignment**, **Functional Specification**, **Modul 3 (Listing search/filter/autocomplete)**, **Modul 5/8/11 (reminder, counter sync, sitemap event-driven)**, **Modul 3/6 (lokasi listing & peta proyek developer, via `ADR-008`)**, dan kini **Modul 1 (rate limiting endpoint sensitif Authentication, via `ADR-018`)** dinyatakan terpenuhi dan dapat dimulai penuh tanpa placeholder — **tidak ada lagi modul atau area teknis yang memerlukan *configurable placeholder* terkait provider/mekanisme teknologi apa pun** di seluruh proyek. **Dengan 6/6 Entry Criteria kini terpenuhi, Architecture Alignment Phase (Penuh) tidak lagi memiliki syarat tertunda.**

## Exit Criteria — Foundation Phase
*(`executive-architecture-review.md` §11 — **11 dari 11 kini terpenuhi penuh** — naik dari 9/11 menyusul resolusi OD-06)*

| # | Kriteria | Status |
|---|---|---|
| 1 | Kebutuhan bisnis inti terdokumentasi (PRD) | ✅ Terpenuhi |
| 2 | Model data terancang penuh (ERD, logis) | ✅ Terpenuhi |
| 3 | Kontrak API terdefinisi | ✅ Terpenuhi |
| 4 | Arsitektur terdefinisi tanpa konflik struktural besar | ✅ Terpenuhi — backend terkunci via `ADR-001` |
| 5 | Model keamanan & RBAC terdefinisi | ✅ Terpenuhi — dimensi terkuat proyek, kini dilengkapi mekanisme rate limiting konkret via `ADR-018` |
| 6 | Tech stack diputuskan | ✅ **Terpenuhi penuh** — Search Engine (`ADR-005`), Job Queue (`ADR-006`), Maps Provider (`ADR-008`), dan kini Caching Strategy (`ADR-018`) seluruhnya **Approved**; **tidak ada lagi ADR OPEN**; `technology-decisions.md` kini **Baseline** (bukan lagi Draft) menyusul OD-06 |
| 7 | Tata kelola AI development tersedia | ✅ Terpenuhi |
| 8 | Roadmap & sprint plan tersedia | ✅ Terpenuhi (Draft, substansi matang) |
| 9 | Mekanisme audit-diri (Decision Log, Changelog, Current State) | ✅ Terpenuhi |
| 10 | Tidak ada konflik Critical/blocking | ✅ Terpenuhi — 0 temuan Critical |
| 11 | Kepemilikan dokumen ditugaskan ke individu bernama | ✅ **Terpenuhi — 4 Agustus 2026** (OD-06): Mujtahid Aktanto (Solo Project Owner, AI-Assisted) |

**Dengan resolusi OD-06, Foundation Phase kini 11 dari 11 Exit Criteria terpenuhi penuh — status "selesai secara substantif" naik menjadi "selesai penuh".**

---

# 4. Current Baseline

| Document | Current Version | Baseline | Status | Owner | Last Review |
|---|---|---|---|---|---|
| PROJECT-CONSTITUTION.md | **1.9** | ✅ 1.9 | ✅ **Baseline (BERLAKU)** — naik dari 1.8, sinkron OD-24 (gate M12), §24 poin 10 direvisi | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 7 Agu 2026 |
| PRD-RUMAHAGEN-v1.3.md | **1.3** | ✅ 1.3 | ✅ **Baseline (BERLAKU)** — naik dari 1.2 (v1.2 Deprecated, dipertahankan historis), 8 Agu 2026 — Business Rule Modul 3 deteksi duplikat foto (`ADR-047`/OD-25) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 8 Agu 2026 |
| Entity-Mapping-RUMAHAGEN-v1.0.md | **1.0** *(sebelumnya tidak tercatat sebagai baris di Bagian 4 ini)* | ✅ 1.0 | ✅ **Baseline (BERLAKU)** — disahkan 5 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| ERD-Skema-Database-RUMAHAGEN-v1.4.md + Diagram | **1.4** | ✅ 1.4 | ✅ **Baseline (BERLAKU)** — naik dari 1.3 (v1.3 Deprecated), 8 Agu 2026 — kolom `file_hash`/`photo_hash` (`ADR-047`/OD-25); Database Schema fisik digabung Bagian 2A sejak 5 Agu (baris terpisah di bawah ditutup) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 8 Agu 2026 |
| API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md | **1.3** | ✅ 1.3 | ✅ **Baseline (BERLAKU)** — naik dari 1.2 (v1.2 Deprecated), 8-9 Agu 2026 — kontrak duplikat foto (OD-25) + pemulihan endpoint OD-20 + T4-11 (file kanonik `-FIXED`, lihat `CURRENT-PROJECT-STATE.md` rev.9) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 9 Agu 2026 |
| User-Flow-RUMAHAGEN-v1.2.md | **1.2** | ✅ 1.2 | ✅ **Baseline (BERLAKU)** — disahkan 5 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| SEO-Analytics-Specification-...v1.1.md | 1.1 | Kandidat 1.1 | Approved *(tidak direvisi pada siklus manapun s.d. 10 Agu 2026)* | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 |
| SYSTEM-ARCHITECTURE.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06); konsolidasi penomoran snapshot selesai 9 Agu 2026 (nilai versi tidak berubah, file kanonik ditetapkan) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 9 Agu 2026 |
| architecture-decision-records.md | **1.1** | ✅ 1.1 | ✅ **Baseline (BERLAKU)** — **29 ADR** (`ADR-001`–`ADR-029`) + `ADR-046`, seluruhnya Approved/Approved With Notes; `ADR-029` (Image Duplicate Detection) ditambahkan 8 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 8 Agu 2026 |
| technology-decisions.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| dependency-manifest.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| development-playbook.md (AI-DEVELOPMENT-BLUEPRINT.md) | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06); file kanonik diupload ulang dgn nama eksplisit 9 Agu 2026 (nilai versi tidak berubah) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 9 Agu 2026 |
| Authorization-Access-Control-Specification-v1.1.md | **1.1** *(naik dari 1.0)* | ✅ 1.1 | ✅ **Baseline (BERLAKU)** — audit Issue Register Batch 3 menyeluruh, 22 dari 113 baris `PERM-XXX` dikoreksi, 6 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 6 Agu 2026 |
| Functional-Specification-RUMAHAGEN-v1.0.md | **1.0** *(sebelumnya tercatat "Planned — belum ada file" di baris gabungan bawah tabel ini — sudah tidak akurat sejak 5 Agu)* | ✅ 1.0 | ✅ **Baseline (BERLAKU)** — dibuat baru & disahkan 5 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| UI-Specification-RUMAHAGEN-v1.0.md | **1.0** | ✅ 1.0 | ✅ **Baseline (BERLAKU)** — dibuat baru & disahkan 5 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| Technical-Specification-RUMAHAGEN-v1.0.md | **1.0** | ✅ 1.0 | ✅ **Baseline (BERLAKU)** — dibuat baru & disahkan 5 Agu 2026 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| AI-CONTEXT-PACK.md | 1.0 | Kandidat 1.0 | Approved | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| DEVELOPMENT-ROADMAP.md | 1.0 | Belum ada | Draft (substansi matang) — blocker bukan hanya nama individu, tetap menunggu pengesahan formal tim/proses | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| TASK-TEMPLATE.md | 1.0 | ✅ 1.0 | Baseline (BERLAKU) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| decision-log.md | 1.0 | 1.0 (per-ADR, berkembang) | Baseline (Living Document) — entri terbaru mencakup `ADR-047`/OD-25 (8 Agu); jumlah entry persis tidak diverifikasi ulang pada siklus ini | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 8 Agu 2026 |
| CHANGELOG.md | **0.7.20** | 0.7.20 | Baseline (Living Document) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 10 Agu 2026 |
| CURRENT-PROJECT-STATE.md | 0.1 (rev. 9) | 0.1 (per-sesi) | Baseline (Living Document) — rev. 9 mencatat regresi `TASK-HOTFIX-20260806-001` + OD-25 + konsolidasi 13 MP | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 10 Agu 2026 |
| document-governance-baseline-register.md | **1.10** *(resmi diadopsi 10 Agu 2026, menggantikan v1.9 — lihat Governance Notes poin 15)* | ✅ 1.10 | ✅ **Baseline (BERLAKU)** — Governance Notes poin 1-38 | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 10 Agu 2026 |
| foundation-validation-report.md | 1.0 | ✅ 1.0 | Baseline (Final — Quality Gate Deliverable) | AI Audit Panel | 27 Jul 2026 (snapshot, belum menghitung ADR-005 s.d. ADR-029/`ADR-046`) |
| executive-architecture-review.md | — (Keputusan CTO) | — | Final — Keputusan Resmi (setara otoritas Constitution untuk kelanjutan fase) | CTO | 27 Jul 2026 (snapshot point-in-time — 6 dari 6 kondisi kini terpenuhi, lihat `CURRENT-PROJECT-STATE.md`) |
| synchronization-report-adr-001.md | — (Artefak SCM) | — | Final — laporan sinkronisasi (point-in-time, hanya mencakup `ADR-001`) | CTO/SCM | 27 Jul 2026 |
| Database Schema (fisik) | — | — | **Digabung ke ERD-Skema-Database-...v1.4.md Bagian 2A** (5 Agu 2026, keputusan eksplisit Owner) — baris ini ditutup, tidak lagi Planned terpisah | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |

---


### Current authority dimensions

For controlled synchronization, these dimensions are separate:

| Dimension | Authority |
|---|---|
| Document Version | Document's own lifecycle/version history |
| Synchronization State | Cross-AEP / D6 / P08 synchronization artifacts |
| Baseline Status | Governance lifecycle status |
| Actual Development State | Current Project State + verified technical evidence |
| Runtime State | Runtime/TECH evidence only |
| Repository Promotion | Operational owner workflow; not document completion authority |


# 5. Source of Truth Index

| Area | Official Document | Priority |
|---|---|---|
| Governance Tertinggi / Engineering Guidelines | `PROJECT-CONSTITUTION.md` (v1.9) | **1 — Mengalahkan seluruh dokumen lain** |
| Business Requirement | `PRD-RUMAHAGEN-v1.3-FINAL.md` | 2 |
| Arsitektur & Keputusan Teknis per Topik (ADR) | `architecture-decision-records.md` (29 ADR) | 3 — dibaca **sebelum** Technology Decisions; **selalu menang jika ada konflik** |
| Architecture (High-Level) | `SYSTEM-ARCHITECTURE.md` (v1.6) | 4 |
| Technology Stack & Rasionalisasi | `technology-decisions.md` (v1.6) | 5 |
| Dependency/Package Katalog | `dependency-manifest.md` (v1.6) | 6 |
| Entity ID Registry | `Entity-Mapping-RUMAHAGEN-v1.0.md` | 6 |
| Database (Logis+Fisik/ERD) | `ERD-Skema-Database-...v1.4-FINAL.md` + Diagram | 7 |
| API Contract | `API-Specification-...v1.3-FINAL-FIXED.md` | 8 |
| User Interaction Flow | `User-Flow-...v1.2.md` | 9 |
| SEO & Analytics Strategy | `SEO-Analytics-Specification-...v1.1.md` | 9 |
| Authorization / Permission Matrix | `Authorization-Access-Control-Specification-v1.1-FINAL.md` | 9 |
| Functional / UI / Technical Specification | `Functional-Specification.md` / `UI-Specification.md` / `Technical-Specification.md` (v1.0 masing-masing) | 9 |
| Keputusan — Jurnal Kronologis Lintas Proyek | `decision-log.md` (Living, entri terbaru `ADR-047`/OD-25) | 10 |
| AI Instruction / Development Playbook | `development-playbook.md` (AI-DEVELOPMENT-BLUEPRINT.md, v1.6) | 11 |
| Context Ringkas Proyek | `AI-CONTEXT-PACK.md` §1–2 + `PRD` §1 | 12 |
| Roadmap & Sprint Plan | `DEVELOPMENT-ROADMAP.md` | 13 |
| Format/Unit Kerja Task | `TASK-TEMPLATE.md` | 14 |
| Riwayat Perubahan (Rilis) | `CHANGELOG.md` (rilis `0.7.20`) | 15 (riwayat, bukan keputusan) |
| Status Implementasi Nyata (Living) | `CURRENT-PROJECT-STATE.md` (rev. 9) | — **wajib dibaca tiap sesi** |
| Validasi Kesiapan Fondasi | `foundation-validation-report.md` | — Quality Gate |
| Keputusan Eksekutif Kelanjutan Fase | `executive-architecture-review.md` | — Setara Constitution untuk urusan proses/fase |
| Tata Kelola Dokumen Itu Sendiri | `document-governance-baseline-register.md` (v1.10) | — |
| **Indeks & Kontrol Seluruh Dokumentasi** | **`project-manifest.md` (dokumen ini)** | **0 — dibaca sebelum semuanya** |

> **Validasi referensi silang:** Tidak ditemukan dokumen baru maupun perubahan nama dokumen pada siklus ini — seluruh 21 entri di atas (di luar Manifest ini sendiri) tetap merujuk nama file yang sama seperti Manifest versi sebelumnya. Perubahan hanya pada **nomor versi** yang dirujuk (lihat Bagian 14). **Catatan penamaan (diwariskan dari sesi sebelumnya):** `AI-DEVELOPMENT-BLUEPRINT.md` kini juga dirujuk sebagai `development-playbook.md` di dokumen-dokumen terbaru — keduanya merujuk file yang sama, bukan dua dokumen terpisah. **Catatan tambahan (diwariskan):** "Engineering Guidelines" yang disebut sebagai jenis dokumen terpisah pada beberapa permintaan penyusunan tidak eksis sebagai file mandiri — perannya dipenuhi oleh `PROJECT-CONSTITUTION.md` (lihat baris pertama tabel ini).

---

# 6. Architecture Decision Summary

> Ringkasan seluruh **29 ADR** di `architecture-decision-records.md` per 8 Agustus 2026 (naik dari 28 — **ADR-029** Image Duplicate Detection Strategy, resolusi OD-25). **Impact Level** dinilai berdasarkan cakupan dampak lintas modul/dokumen (Critical = mengubah fondasi seluruh sistem, High = memengaruhi banyak modul/keputusan turunan, Medium = memengaruhi satu domain, Low = dampak terbatas/administratif). **Catatan tambahan:** `decision-log.md` mencatat **`ADR-046`** (Perluasan Kebijakan Soft-Delete, resolusi OD-07) sebagai entry administratif/data, dan **`ADR-047`** (mirror `ADR-029`, resolusi OD-25) — keduanya bukan bagian dari seri penomoran utama `architecture-decision-records.md`.

| ADR ID | Title | Status | Decision Date | Impact Level |
|---|---|---|---|---|
| ADR-001 | Backend Architecture | Approved | 2026-07-27 | Critical |
| ADR-002 | Authentication Strategy | Approved | — | High |
| ADR-003 | Authorization & RBAC Strategy | Approved | — | High |
| ADR-004 | Database Strategy | Approved | — | High |
| ADR-005 | Search Strategy | Approved | 2026-07-28 | High |
| ADR-006 | Job Queue Strategy | Approved | 2026-07-29 | High |
| ADR-007 | Email Provider | Approved | — | Medium |
| ADR-008 | Maps Provider | Approved (direvisi v3) | 2026-07-30 | Medium |
| ADR-009 | Storage Strategy | Approved | — | Medium |
| ADR-010 | Deployment Strategy | Approved | — | High |
| ADR-011 | State Management Strategy | Approved | — | Medium |
| ADR-012 | API Architecture | Approved | — | High |
| ADR-013 | Error Handling Strategy | Approved | — | Medium |
| ADR-014 | Logging Strategy | Approved | — | Low |
| ADR-015 | Monitoring & Observability | Approved | — | Medium |
| ADR-016 | Testing Strategy | Approved | — | Medium |
| ADR-017 | Security Strategy | Approved | — | High |
| ADR-018 | Caching Strategy (level aplikasi) | Approved | 2026-07-31 | Low |
| ADR-019 | File Upload Strategy | Approved | — | Low |
| ADR-020 | Notification Strategy | Approved | — | Medium |
| ADR-021 | Frontend Framework & Rendering Strategy | Approved | — | High |
| ADR-022 | Database Schema Conventions | Approved | — | Medium |
| ADR-023 | Multi-Tenancy Strategy | Approved (cakupan saat ini, **direvisi**) | — | Low |
| ADR-024 | RBAC Role Model Scope | Approved | — | Medium |
| ADR-025 | Type Safety & Validation Strategy | Approved | — | Medium |
| ADR-026 | Organization Model Strategy | ✅ **Approved With Notes (baru)** | **2026-08-03** | **High** |
| ADR-027 | Organization-Scoped Authorization Strategy | ✅ **Approved (baru)** | **2026-08-03** | **Medium** |
| ADR-028 | Third-Party AI Assistant Integration Strategy (BYOK) | ✅ **Approved With Notes (baru)** | **2026-08-03** | **Medium** |
| ADR-029 | Image Duplicate Detection Strategy (Exact + Perceptual Hash) | ✅ **Approved (baru)** | **2026-08-08** | **Medium** |

**Ringkasan status:** **29 Approved/Approved With Notes (100%)**, **0 OPEN** — naik dari 28. ADR-029 lahir dari Open Decision internal (OD-25), berbeda dari ADR-026/027/028 (proposal eksternal) — mengikuti pola OD-01/03/04/05/13 (Open Decision internal yang diselesaikan lewat sesi Architecture Review Board standar).

### Detail ADR Terbaru — ADR-026, ADR-027, ADR-028 (Organization Management System & AI Assistant Integration)
- **ADR-026 (Organization Model Strategy, Approved With Notes):** Entitas baru `organizations`/`organization_members`/`organization_invitations`, dimensi `organization_status` terpisah dari `roles.code` platform. Satu agen maksimal 1 Organization aktif; tidak ada transfer kepemimpinan. Merevisi status **ADR-023** (Multi-Tenancy Strategy) — `organization_id` adalah grouping construct ringan, bukan `tenant_id`.
- **ADR-027 (Organization-Scoped Authorization Strategy, Approved):** Otorisasi Organization sebagai lapisan kedua independen dari RBAC platform — **tidak mengamandemen ADR-024** (cakupan Manager tetap final tanpa pengecualian tim/wilayah).
- **ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK, Approved With Notes):** Model BYOK dengan 4 provider free-tier terkurasi (Google Gemini, Groq, Mistral, GitHub Models), key diproksi backend, riwayat chat tidak dipersist. Berdiri independen dari ADR-026/027.
- **Tidak menggantikan (Supersedes/Replaces) ADR manapun** — ketiganya murni ADR baru untuk topik yang sebelumnya belum pernah tercatat.
- **Cross-reference:** `decision-log.md` `ADR-043` (ADR-026), `ADR-044` (ADR-027), `ADR-045` (ADR-028).
- **Catatan kondisional Board:** (1, ADR-026) ✅ **diresolusi 3 Agustus 2026** — immutability `listing_origin` dikunci: validasi aplikasi + trigger Postgres `BEFORE UPDATE`; (2, ADR-026) ✅ **diresolusi 3 Agustus 2026** — nilai `archived` dikonfirmasi berlaku generik, tidak eksklusif konteks Organization; (3, ADR-028) belum ditutup — volatilitas free tier provider pihak ketiga di luar kendali platform. **Kedua catatan ADR-026 kini tertutup penuh** — lihat `architecture-decision-records.md` untuk detail Update.
- **Dampak langsung:** Menambah Modul 12 & 13 ke cakupan sistem (arsitektur); **kode belum boleh ditulis** — `PRD.md`/`ERD-Skema-Database.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` v1.1 belum disinkronkan pada siklus ini, dijadwalkan paket terpisah. **Temuan tambahan (di luar cakupan permintaan siklus):** regresi status `ADR-005`/`ADR-006` (ter-*revert* keliru menjadi OPEN pada revisi 30 Juli 2026) ditemukan dan dikoreksi bersamaan.

### Detail ADR Terbaru — ADR-029 (Image Duplicate Detection untuk Listing Properti)
- **ADR-029 (Image Duplicate Detection Strategy, Approved):** Kolom `file_hash` (SHA-256) + `photo_hash` (perceptual hash 64-bit, library `image-hash`) ditambahkan ke `listing_photos`; deteksi dua-tingkat — **blocking** untuk foto identik (Hamming Distance=0), **non-blocking warning** untuk kemiripan 90-99% (HD 1-6) — dibatasi ke listing aktif milik `agent_id` yang sama.
- **Sumber:** gap fitur baru ditemukan dalam percakapan operasional (bukan proposal tertulis/Open Decision lama) — diformalkan sebagai **OD-25**, dijawab langsung Owner pada sesi yang sama.
- **Tidak menggantikan (Supersedes/Replaces) ADR manapun.**
- **Cross-reference:** `decision-log.md` **`ADR-047`** (skema penomoran independen, mengikuti pola ADR-026↔043 dkk. — dua rangkaian penomoran berbeda merujuk topik sama, bukan hubungan Supersedes/Superseded).
- **Dampak langsung:** `PRD.md` naik v1.2→v1.3, `ERD-Skema-Database.md` naik v1.3→v1.4, `API-Specification.md` naik v1.2→v1.3 — ketiganya dieksekusi 8 Agustus 2026 (lihat Bagian 4).

---

# 7. Open Decision Summary

> Dikonsolidasikan dari `decision-log.md` §11 — **direkonsiliasi 10 Agustus 2026** menyusul temuan bahwa Manifest versi-versi sebelumnya (v1.10 s.d. v1.25) tidak pernah mencakup 9 Open Decision (OD-16 s.d. OD-24) yang sudah lama Resolved di `decision-log.md` namun tidak pernah tercatat di bagian ini — lihat Governance Notes poin 14 untuk rincian gap.

## Decision yang Telah Selesai
| Decision ID | Topik | Resolusi | Tanggal |
|---|---|---|---|
| OD-01 | Arsitektur Backend/API | ✅ RESOLVED — `ADR-001`/`ADR-038`: Route Handlers + Supabase | 27 Jul 2026 |
| OD-03 | Search Engine (Postgres FTS vs Typesense/Elasticsearch) | ✅ RESOLVED — `ADR-005`/`ADR-039`: PostgreSQL FTS + `pg_trgm` Fase 1, migrasi terjadwal Typesense Fase 2 | 28 Jul 2026 |
| OD-04 | Job Queue (Edge Functions+cron vs BullMQ) | ✅ RESOLVED — `ADR-006`/`ADR-040`: Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal QStash Fase 2; BullMQ+Redis ditolak | 29 Jul 2026 |
| OD-05 | Provider Maps (Google Maps vs Mapbox vs lainnya) | ✅ RESOLVED — `ADR-008`/`ADR-041` (direvisi v3): Leaflet + OpenStreetMap dengan LocationIQ (Primary)/Geoapify (Approved Alternative); menggantikan `ADR-028` (kini `Replaced`) | 30 Jul 2026 |
| OD-08 | Vercel sebagai hosting resmi di Constitution | ✅ RESOLVED — Constitution v1.6 §4 sudah mencantumkan Vercel/ADR-010 | 27 Jul 2026 |
| OD-10 | Frasa usang state management ("SWR — pilih satu") | ✅ RESOLVED — `SYSTEM-ARCHITECTURE.md` §10 kini eksplisit TanStack Query, SWR dilarang | 27 Jul 2026 |
| OD-13 | Caching Strategy (level aplikasi/Redis) | ✅ RESOLVED — `ADR-018`/`ADR-042`: Supabase Postgres `rate_limit_log` Fase 1, migrasi terjadwal Upstash Redis Fase 2 | 31 Jul 2026 |
| OD-14 | Organization Management System | ✅ RESOLVED — `ADR-026`/`ADR-043` & `ADR-027`/`ADR-044` | 3 Agu 2026 |
| OD-15 | AI Assistant Integration (BYOK) | ✅ RESOLVED — `ADR-028`/`ADR-045`: 4 provider free-tier terkurasi | 3 Agu 2026 |
| OD-02 | Jumlah seed role final (7 vs 8) | ✅ RESOLVED — 7 baris fisik `roles`; Guest eksplisit bukan baris `roles` | 4 Agu 2026 |
| OD-06 | Kepemilikan dokumen governance (nama individu) | ✅ RESOLVED — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| OD-07 | Kebijakan soft-delete seragam | ✅ RESOLVED — `ADR-046`: diperluas dari 3 menjadi 8 tabel | 4 Agu 2026 |
| **OD-16** *(sebelumnya tidak tercatat di bagian ini)* | Akses Manager ke "Kelola Kursus" (Modul 4) — kontradiksi Business Rule vs Acceptance Criteria PRD | ✅ **RESOLVED** — Manager akses Full, PRD Acceptance Criteria Modul 4 direvisi. Sumber: Issue Register T2-01 | 6 Agu 2026 |
| **OD-17** *(sebelumnya tidak tercatat)* | Akses Manager publish event (Modul 5) — pola identik OD-16 | ✅ **RESOLVED** — Manager publish langsung tanpa approval, PRD Modul 5 direvisi. Sumber: Issue Register T2-02 | 6 Agu 2026 |
| **OD-18** *(sebelumnya tidak tercatat)* | Mekanisme bootstrap Superadmin pertama | ✅ **RESOLVED** — `scripts/seed-superadmin.ts`, idempotent. Sumber: Issue Register T3-01 | 6 Agu 2026 |
| **OD-19** *(sebelumnya tidak tercatat)* | Definisi cakupan "wilayah eksklusif" proyek developer | ✅ **RESOLVED** — cakupan = per Kota (`city_id`), tanpa skema baru. Sumber: Issue Register T3-03 | 6 Agu 2026 |
| **OD-20** *(sebelumnya tidak tercatat)* | Endpoint CRUD akun internal generik (Modul 9) | ✅ **RESOLVED** — endpoint baru API Spec §10.4 (sempat regresi, dipulihkan 9 Agu — lihat `CURRENT-PROJECT-STATE.md` rev.9). Sumber: Issue Register T3-04 | 6 Agu 2026 |
| **OD-21** *(sebelumnya tidak tercatat)* | Cakupan role Developer Partner untuk AI Assistant (Modul 13) | ✅ **RESOLVED** — Developer Partner disertakan sebagai role ke-6. Sumber: Issue Register T3-05 | 6 Agu 2026 |
| **OD-22** *(sebelumnya tidak tercatat)* | Kebijakan Amenity management (Modul 3) | ✅ **RESOLVED** — pertahankan Superadmin-only, Authorization Spec dikoreksi. Sumber: Issue Register T3-07 | 6 Agu 2026 |
| **OD-23** *(sebelumnya tidak tercatat)* | Bukti interaksi/lead sebelum submit review agen (Modul 2) | ✅ **RESOLVED** — bukti lead tidak wajib; 1 review aktif per Agen (upsert); self-review Agen auto-approved. Migration `0005` diperbarui, PRD Modul 2 & Authorization Spec §2.3 direvisi. Sumber: Issue Register T3-02 | 6 Agu 2026 |
| **OD-24** *(sebelumnya tidak tercatat)* | Konfirmasi gate implementasi kode Modul 12 (Organization) | ✅ **RESOLVED** — Owner konfirmasi eksplisit gate M12 terbuka. `PROJECT-CONSTITUTION.md` §24 poin 10 naik ke v1.9. Dengan ini, seluruh 13 modul proyek GO tanpa syarat gate tambahan | 7 Agu 2026 |
| **OD-25** *(sebelumnya tidak tercatat)* | Image Duplicate Detection untuk Listing Properti | ✅ **RESOLVED** — `ADR-029`/`ADR-047`: exact hash + perceptual hash, blocking jika identik, warning non-blocking jika mirip 90-99%, dibatasi ke agen yang sama. ERD v1.4, API Spec v1.3, PRD v1.3 | 8 Agu 2026 |

## Decision yang Masih Terbuka
| Decision ID | Priority | Status | Impact | Target Resolution |
|---|---|---|---|---|
| OD-09 — Resend & Sentry belum sinkron ke System Architecture | Rendah | 🟡 **Sebagian** — perlu verifikasi §23 final | Risiko redaksional | Administratif |
| OD-11 — Model monetisasi platform | Rendah | 🔴 **OPEN** (bisnis) | Tidak memblokir selama `configurable` | Dapat ditunda |
| OD-12 — Threshold DBR final & kebijakan promosi/demosi Manager | Rendah | 🔴 **OPEN** (bisnis/kebijakan) | Tidak memblokir selama `configurable`/hard rule dipertahankan | Dapat ditunda hingga Sprint S14 |

**Ringkasan:** dari **25 item** (naik dari 15 — 9 item OD-16 s.d. OD-24 sebelumnya tidak tercatat di bagian ini, ditambah OD-25 baru), **22 Resolved**, **1 Sebagian** (OD-09), **2 masih Open** — keduanya murni bisnis (OD-11, OD-12). **Tidak ada satu pun item Open Decision berprioritas Tinggi atau Sedang yang tersisa**, dan **tidak ada lagi item berkategori administratif maupun arsitektur/teknis**.

## Prioritas Berikutnya
1. **OD-09 (Resend/Sentry redaksional)** — administratif, aman ditunda, murni verifikasi redaksi `SYSTEM-ARCHITECTURE.md` §23.
2. **OD-11, OD-12** — murni bisnis, aman ditunda selama tetap `configurable` (`dbr_config`/`system_configs`), tidak memblokir Sprint S0 maupun S1.
3. **Tidak ada lagi prioritas governance administratif yang memblokir Sprint S1+** — lihat `CURRENT-PROJECT-STATE.md` Readiness Snapshot.

**Catatan penting:** dengan resolusi OD-16 s.d. OD-25, **tidak ada lagi Open Decision arsitektur/teknis maupun administratif** yang tersisa di seluruh proyek — 2 item yang masih Open (OD-11, OD-12) murni keputusan bisnis yang secara desain memang boleh ditunda selama tetap `configurable`.

---
| Decision ID | Topik | Resolusi | Tanggal |
|---|---|---|---|
| OD-01 | Arsitektur Backend/API | ✅ **RESOLVED** — `ADR-001`/`ADR-038`: Route Handlers + Supabase | 27 Jul 2026 |
| OD-03 | Search Engine (Postgres FTS vs Typesense/Elasticsearch) | ✅ **RESOLVED** — `ADR-005`/`ADR-039`: PostgreSQL FTS + `pg_trgm` Fase 1, migrasi terjadwal Typesense Fase 2 | 28 Jul 2026 |
| OD-04 | Job Queue (Edge Functions+cron vs BullMQ) | ✅ **RESOLVED** — `ADR-006`/`ADR-040`: Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal QStash Fase 2; BullMQ+Redis ditolak (tidak kompatibel model serverless) | 29 Jul 2026 |
| OD-05 | Provider Maps (Google Maps vs Mapbox vs lainnya) | ✅ **RESOLVED** — `ADR-008`/`ADR-041` (direvisi v3): Leaflet + OpenStreetMap dengan LocationIQ (Primary)/Geoapify (Approved Alternative), roadmap migrasi bertahap MVP→Growth→Scale→Enterprise; menggantikan `ADR-028` (kini `Replaced`) | 30 Jul 2026 |
| OD-08 | Vercel sebagai hosting resmi di Constitution | ✅ **RESOLVED** — Constitution v1.6 §4 sudah mencantumkan Vercel/ADR-010 | 27 Jul 2026 |
| OD-10 | Frasa usang state management ("SWR — pilih satu") | ✅ **RESOLVED** — `SYSTEM-ARCHITECTURE.md` §10 kini eksplisit TanStack Query, SWR dilarang | 27 Jul 2026 |
| OD-13 | Caching Strategy (level aplikasi/Redis) | ✅ **RESOLVED** — `ADR-018`/`ADR-042`: Supabase Postgres `rate_limit_log` Fase 1, migrasi terjadwal Upstash Redis Fase 2 berdasarkan kriteria ambang eksplisit | 31 Jul 2026 |
| OD-14 | Organization Management System (Business Model Evolution) | ✅ **RESOLVED (baru)** — `ADR-026`/`ADR-043` & `ADR-027`/`ADR-044`: entitas `organizations`/`organization_members`/`organization_invitations`, otorisasi Organization-scoped independen dari RBAC platform (ADR-024 tidak diubah); status ADR-023 direvisi | 3 Agu 2026 |
| OD-15 | AI Assistant Integration (BYOK) | ✅ **RESOLVED (baru)** — `ADR-028`/`ADR-045`: BYOK dengan 4 provider free-tier terkurasi (Gemini/Groq/Mistral/GitHub Models), riwayat chat tidak dipersist, terbuka lintas role. Independen dari OD-14 | 3 Agu 2026 |
| OD-02 | Jumlah seed role final (7 vs 8) | ✅ **RESOLVED** — 7 baris fisik di tabel `roles` (`superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`); Guest eksplisit bukan baris `roles` (state tidak-login). Keputusan langsung Business Owner, tidak memerlukan ADR arsitektur baru | 4 Agu 2026 |
| OD-06 | Kepemilikan dokumen governance (nama individu) | ✅ **RESOLVED** — seluruh field Owner ditetapkan ke **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**; lihat Bagian 4 (Current Baseline) untuk penerapan per-dokumen | 4 Agu 2026 |
| OD-07 | Kebijakan soft-delete seragam | ✅ **RESOLVED** — `ADR-046`: diperluas dari 3 menjadi 8 tabel (+`agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners`); prinsip umum didokumentasikan untuk entitas masa depan | 4 Agu 2026 |

## Decision yang Masih Terbuka
| Decision ID | Priority | Status | Impact | Target Resolution |
|---|---|---|---|---|
| OD-09 — Resend & Sentry belum sinkron ke System Architecture | Rendah | 🟡 **Sebagian** — perlu verifikasi §23 final | Risiko redaksional | Administratif |
| OD-11 — Model monetisasi platform | Rendah | 🔴 **OPEN** (bisnis) | Tidak memblokir selama `configurable` | Dapat ditunda |
| OD-12 — Threshold DBR final & kebijakan promosi/demosi Manager | Rendah | 🔴 **OPEN** (bisnis/kebijakan) | Tidak memblokir selama `configurable`/hard rule dipertahankan | Dapat ditunda hingga Sprint S14 |

**Ringkasan:** dari **15 item**, **12 Resolved** (OD-01, OD-02, OD-03, OD-04, OD-05, OD-06, OD-07, OD-08, OD-10, OD-13, OD-14, OD-15), **1 Sebagian** (OD-09), **2 masih Open** — **keduanya murni bisnis** (OD-11 monetisasi, OD-12 threshold DBR), **tidak ada satu pun item Open Decision berprioritas Tinggi atau Sedang yang tersisa**, dan **tidak ada lagi item berkategori administratif** (OD-02/06/07 menutup kategori ini sepenuhnya). Ini adalah pertama kalinya sejak proyek dimulai jumlah item Open masuk ke angka tunggal.

## Prioritas Berikutnya
1. **OD-09 (Resend/Sentry redaksional)** — administratif, aman ditunda, murni verifikasi redaksi `SYSTEM-ARCHITECTURE.md` §23.
2. **OD-11, OD-12** — murni bisnis, aman ditunda selama tetap `configurable` (`dbr_config`/`system_configs`), tidak memblokir Sprint S0 maupun S1.
3. **Tidak ada lagi prioritas governance administratif yang memblokir Sprint S1+** — lihat `CURRENT-PROJECT-STATE.md` Readiness Snapshot: **6 dari 6 kondisi GO WITH CONDITIONS kini terpenuhi**.

**Catatan penting:** dengan resolusi OD-02/06/07, **tidak ada lagi Open Decision arsitektur/teknis maupun administratif** yang tersisa di seluruh proyek — 2 item yang masih Open (OD-11, OD-12) murni keputusan bisnis yang secara desain memang boleh ditunda selama tetap `configurable`.

---

# 8. Documentation Inventory

| # | Nama | Versi | Status | Purpose | Source of Truth | Baseline | Last Updated |
|---|---|---|---|---|---|---|---|
| 1 | PROJECT-CONSTITUTION.md | **1.9** | Baseline | Governance/engineering guidelines tertinggi | Governance | ✅ | 7 Agu 2026 |
| 2 | PRD-RUMAHAGEN-v1.3.md | **1.3** | Baseline | Kebutuhan bisnis, 13 modul fungsional (termasuk Business Rule duplikat foto, OD-25) | Business Requirement | ✅ | 8 Agu 2026 |
| 3 | Entity-Mapping-RUMAHAGEN-v1.0.md | **1.0** *(sebelumnya tidak tercatat di Inventory ini)* | Baseline | Entity ID Registry (`ENT-XXX`) | Entity ID Registry | ✅ | 5 Agu 2026 |
| 4 | ERD-Skema-Database-...v1.4.md + Diagram | **1.4** | Baseline | Desain skema database logis+fisik (digabung Bagian 2A); kolom `file_hash`/`photo_hash` (OD-25) | Database (Logis+Fisik) | ✅ | 8 Agu 2026 |
| 5 | API-Specification-...v1.3-FINAL-FIXED.md | **1.3** | Baseline | Kontrak REST API lengkap; kanonik `-FIXED` (pemulihan OD-20 + T4-11) | API Contract | ✅ | 9 Agu 2026 |
| 6 | User-Flow-...v1.2.md | **1.2** | Baseline | Alur interaksi UI per role | User Interaction Flow | ✅ | 5 Agu 2026 |
| 7 | SEO-Analytics-Specification-...v1.1.md | 1.1 | Approved | Strategi rendering, SEO, analytics | SEO & Analytics | Kandidat | 26 Jul 2026 |
| 8 | Authorization-Access-Control-Specification-v1.1.md | **1.1** *(sebelumnya tidak tercatat)* | Baseline | Role Matrix + Permission Matrix (`PERM-XXX`), 22/113 baris dikoreksi audit Batch 3 | Authorization Matrix | ✅ | 6 Agu 2026 |
| 9 | Functional-Specification-...v1.0.md | **1.0** *(sebelumnya "Planned", tidak akurat sejak 5 Agu)* | Baseline | Screen Inventory 43 layar | Functional Spec (level-layar) | ✅ | 5 Agu 2026 |
| 10 | UI-Specification-...v1.0.md | **1.0** *(sebelumnya "Planned")* | Baseline | Design token, 6 Layout Template, wireframe 43 layar | UI Spec / Wireframe | ✅ | 5 Agu 2026 |
| 11 | Technical-Specification-...v1.0.md | **1.0** *(sebelumnya "Ready", tidak akurat sejak 5 Agu)* | Baseline | Konsolidasi 6 dokumen sumber, 13 Technical Brief per modul | Technical Spec (konsolidasi) | ✅ | 5 Agu 2026 |
| 12 | SYSTEM-ARCHITECTURE.md | **1.6** | ✅ Baseline | Arsitektur teknis end-to-end (24 bagian); konsolidasi penomoran snapshot 9 Agu | Architecture (High-Level) | ✅ | 9 Agu 2026 |
| 13 | architecture-decision-records.md | **1.1** | ✅ Baseline (dok.) / **29 ADR + `ADR-046`** Approved | 29 ADR per topik arsitektur (+ ADR-029, 8 Agu) + 1 perluasan (soft-delete) | Arsitektur & Keputusan Teknis | ✅ | 8 Agu 2026 |
| 14 | technology-decisions.md | **1.6** | ✅ Baseline | Katalog stack & justifikasi, termasuk §4.33 kurasi AI Assistant | Technology Stack | ✅ | 4 Agu 2026 |
| 15 | dependency-manifest.md | **1.6** | ✅ Baseline | Katalog package sah | Dependency Katalog | ✅ | 4 Agu 2026 |
| 16 | development-playbook.md (AI-DEVELOPMENT-BLUEPRINT.md) | **1.6** | ✅ Baseline | Panduan operasional harian AI Coding Assistant, 26 bagian; kanonik diupload ulang 9 Agu | AI Instruction | ✅ | 9 Agu 2026 |
| 17 | AI-CONTEXT-PACK.md | 1.0 | Approved | Context ringkas untuk reload tiap sesi AI | Context Ringkas | Kandidat | 27 Jul 2026 |
| 18 | DEVELOPMENT-ROADMAP.md | 1.0 | Draft | Roadmap 15 sprint (S0–S14) | Roadmap & Sprint Plan | Belum | 27 Jul 2026 |
| 19 | TASK-TEMPLATE.md | 1.0 | Baseline | Template task reusable | Format Unit Kerja | ✅ | 27 Jul 2026 |
| 20 | decision-log.md | 1.0 | Baseline (Living) | Jurnal kronologis seluruh keputusan; entri terbaru mencakup `ADR-047`/OD-25 | Decision (Jurnal) | ✅ | 8 Agu 2026 |
| 21 | CHANGELOG.md | **0.7.20** | Baseline (Living) | Riwayat perubahan proyek | History | ✅ | 10 Agu 2026 |
| 22 | CURRENT-PROJECT-STATE.md | 0.1 (rev. 9) | Baseline (Living) | Status implementasi nyata per-sesi; rev.9 mencakup regresi `TASK-HOTFIX-20260806-001` | Status Implementasi | ✅ | 10 Agu 2026 |
| 23 | document-governance-baseline-register.md | **1.10** *(resmi diadopsi 10 Agu 2026 — lihat Governance Notes poin 15)* | ✅ Baseline | Meta-dokumen lifecycle/versi/ownership | Tata Kelola Dokumen | ✅ | 10 Agu 2026 |
| 24 | foundation-validation-report.md | 1.0 | Baseline (Final) | Audit 17 dokumen, skor 79/100 (snapshot, belum menghitung ADR-005 s.d. 029/046) | Validation | ✅ | 27 Jul 2026 |
| 25 | executive-architecture-review.md | — | Final — Keputusan CTO | GO WITH CONDITIONS, 6 syarat lanjut fase — **6/6 kini terpenuhi** | Keputusan Eksekutif | — | 27 Jul 2026 |
| 26 | synchronization-report-adr-001.md | — | Final — Artefak SCM | Laporan sinkronisasi resolusi ADR-001 lintas 6 dokumen (belum mencakup ADR-005 s.d. 029/046) | — | — | 27 Jul 2026 |
| 27 | **project-manifest.md** (dokumen ini) | **1.26** | Diperbarui — rekonsiliasi Bagian 4/6/7/8 | Indeks & control center seluruh dokumentasi | Indeks Tertinggi | Belum | 10 Agu 2026 |
| — | Database Schema (fisik) | — | **Digabung ke ERD Bagian 2A** (5 Agu 2026) — baris ini ditutup | Database (Fisik) | — | 5 Agu 2026 |

---

# 9. Dependency Map

```
PROJECT-CONSTITUTION.md (Engineering Guidelines — tertinggi, v1.6)
        ↓
Architecture Decision Records (architecture-decision-records.md — 25/25 Approved, 0 OPEN)
        ↓
Technology Decisions (v1.5)
        ↓
Dependency Manifest (v1.5)
        ↓
System Architecture (v1.5)
        ↓
ERD (Skema Database Logis) + ERD Diagram  — target bertambah search_vector/pg_trgm,
        trigger counter sync & job_execution_log, geocode_cache & api_rate_limits,
        dan rate_limit_log
        ↓
Database Schema (fisik — TBD, menyusul Sprint S0)
        ↓
API Specification
        ↓
User Flow
        ↓
PRD Alignment (verifikasi silang berkelanjutan)
        ↓
Functional Specification (Planned)
        ↓
UI Specification (Planned)
        ↓
Technical Specification (Ready — bahan baku lengkap & tersinkron penuh ADR)
        ↓
Module Planning (Development Roadmap sudah memenuhi fungsi ini — Ready)
        ↓
Sprint S0 Execution (Bolt.new / AI Coding Assistant)
```

**Dokumen operasional paralel** (tidak linear terhadap rantai di atas): `decision-log.md` (jurnal kronologis lintas dokumen, kini 42 entry), `CHANGELOG.md` (bergantung `CURRENT-PROJECT-STATE.md`, rilis `0.1.5`), `AI-CONTEXT-PACK.md` & `development-playbook.md` (bergantung seluruh dokumen sumber v1.1 + System Architecture + Technology Decisions), `TASK-TEMPLATE.md` (bergantung seluruh dokumen governance), `foundation-validation-report.md` (snapshot audit atas 17 dokumen), `executive-architecture-review.md` (keputusan dibangun di atas audit + Decision Log + Baseline Register).

**Perubahan hubungan pada siklus ini:** Tidak ada perubahan **arah** dependency (rantai tetap identik dengan Manifest versi sebelumnya). Perubahan yang terjadi murni pada **status simpul** — simpul "Architecture Decision Records" kini mengalirkan keputusan Caching yang sudah final ke simpul "Technology Decisions" dan "Dependency Manifest" di bawahnya, menghilangkan status "OPEN" terakhir yang tersisa di seluruh rantai. Simpul "Technical Specification" **tetap Ready** (tidak berubah dari siklus sebelumnya) — bahan bakunya sudah sepenuhnya tersinkron ADR sejak resolusi `ADR-008`.

---

# 10. AI Reading Order

| # | Dokumen | Alasan Urutan |
|---|---|---|
| 1 | **project-manifest.md** (dokumen ini) | Indeks & status keseluruhan — wajib pertama |
| 2 | `CURRENT-PROJECT-STATE.md` (rev. 9) | Kondisi implementasi *nyata* saat ini (living, per-sesi) |
| 3 | `PROJECT-CONSTITUTION.md` (v1.9) | Engineering Guidelines tertinggi — mengalahkan seluruhnya jika konflik |
| 4 | `architecture-decision-records.md` (29 ADR) | Alasan di balik seluruh keputusan arsitektur/teknis (dibaca sebelum Technology Decisions) |
| 5 | `decision-log.md` | Jurnal kronologis keputusan lintas proyek, termasuk non-teknis (Living, entri terbaru `ADR-047`/OD-25) |
| 6 | `technology-decisions.md` (v1.6) | Katalog stack resmi & justifikasi |
| 7 | `SYSTEM-ARCHITECTURE.md` (v1.6) | Arsitektur teknis end-to-end |
| 8 | `dependency-manifest.md` (v1.6) | Package/toolchain sah untuk di-install |
| 9 | `AI-CONTEXT-PACK.md` (§1–2) + `PRD` (§1) | Project Overview / konteks ringkas |
| 10 | `PRD-RUMAHAGEN-v1.3-FINAL.md` | Kebutuhan bisnis lengkap, 13 modul |
| 11 | `Entity-Mapping-RUMAHAGEN-v1.0.md` | Entity ID Registry — dibaca sebelum ERD |
| 12 | `ERD-Skema-Database-...v1.4-FINAL.md` + Diagram | Skema database logis+fisik (digabung) |
| 13 | `API-Specification-...v1.3-FINAL-FIXED.md` | Kontrak REST API |
| 14 | `User-Flow-...v1.2.md` | Alur interaksi UI per role |
| 15 | `Authorization-Access-Control-Specification-v1.1-FINAL.md` | Role Matrix + Permission Matrix |
| 16 | `Functional-Specification.md` / `UI-Specification.md` / `Technical-Specification.md` (v1.0 masing-masing) | Screen Inventory, wireframe, konsolidasi teknis |
| 17 | `SEO-Analytics-Specification-...v1.1.md` | Strategi rendering/SEO |
| 18 | `development-playbook.md` (AI-DEVELOPMENT-BLUEPRINT.md, v1.6) | Prosedur kerja harian AI Coding Assistant |
| 19 | `DEVELOPMENT-ROADMAP.md` | Roadmap & urutan sprint |
| 20 | `TASK-TEMPLATE.md` | Format unit kerja sebelum eksekusi task |
| 21 | `document-governance-baseline-register.md` (v1.10) | Rujukan status/versi/ownership jika ragu dokumen mana yang menang |
| 22 | `foundation-validation-report.md` + `executive-architecture-review.md` | Konteks audit & keputusan kelanjutan fase (dibaca saat butuh alasan strategis) |
| 23 | `CHANGELOG.md` (rilis `0.7.20`) | Riwayat perubahan (referensi, bukan keputusan) |

> **(Diperbarui, rev. v1.26)** Urutan dasar tidak berubah — 3 dokumen baru disisipkan (#11, #15, #16) yang sebelumnya sudah Baseline sejak 5 Agustus 2026 namun belum tercantum di urutan baca ini, dan seluruh nomor versi dokumen disinkronkan ke kondisi 10 Agustus 2026. `ADR-029` adalah entri **di dalam** dokumen #4 (`architecture-decision-records.md`), bukan dokumen terpisah.

---

# 11. Development Readiness

| Area | Status | Catatan |
|---|---|---|
| **Architecture** | 🟢 READY | Backend (`ADR-001`), Search (`ADR-005`), Job Queue (`ADR-006`), Maps (`ADR-008`), dan kini Caching/Rate Limiting (`ADR-018`) seluruhnya terkunci — **tidak ada lagi ADR OPEN di seluruh proyek**. Ini adalah area pertama yang mencapai kondisi "tidak ada residual Open Decision teknis" secara menyeluruh. |
| **Database** | 🟡 IN PROGRESS | ERD logis Ready with Notes; soft-delete belum seragam (OD-07); skema fisik belum ada; target skema kini termasuk `search_vector`/`pg_trgm`, trigger counter sync/`job_execution_log`, `geocode_cache`/`api_rate_limits`, dan `rate_limit_log` |
| **API** | 🟡 IN PROGRESS | Konvensi inti matang (Ready with Notes); mesin `/properties/search`, mekanisme proses asinkron/terjadwal, integrasi Maps/Geocoding, dan mekanisme rate limiting kini seluruhnya final; kedalaman endpoint modul pendukung belum tuntas; `API-Specification.md` §13/§9.1 (Maps) dan §0 (429/Retry-After, Caching) belum disinkronkan redaksional |
| **Security** | 🟢 READY | Dinilai *Excellent* — enkripsi at-rest, RLS+middleware berlapis, rate limiting kini punya mekanisme konkret (`rate_limit_log`), audit trail; `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` server-side only tanpa client-key terpisah; tidak ada secret/env var baru untuk rate limiting |
| **Documentation** | 🟢 READY | Skor 79/100, 0 konflik Major/Critical; item minor tercatat di Bagian 16 |
| **Testing** | 🔴 NOT READY | Testing Strategy (`ADR-016`) tercatat, belum ada kerangka konkret (Vitest/RTL/Playwright terpilih, belum diimplementasi) |
| **Deployment** | 🔴 NOT READY | Vercel terpilih & terformalkan, termasuk fitur Cron Jobs (`ADR-006`); 0% kode berarti belum ada deployment nyata |
| **Functional Specification** | 🔴 NOT READY | Belum ada file — dapat **dimulai sekarang**, tidak ada dependency ke Open Decision teknis |
| **UI Specification** | 🔴 NOT READY | Belum ada file — wireframe/desain visual belum tersedia |
| **Technical Specification** | 🟢 READY | Bahan baku tersedia lengkap (System Architecture + Technology Decisions + Dependency Manifest, seluruhnya sinkron ADR termasuk Caching Strategy); tidak lagi ditahan Open Decision teknis manapun — hanya perlu konsolidasi dokumen |
| **Module Planning** | 🟡 IN PROGRESS | `DEVELOPMENT-ROADMAP.md` sudah memenuhi fungsi untuk S0; Module Planning penuh S1+ ditahan sampai 6 kondisi CTO terpenuhi (3/6 terpenuhi — tidak berubah, Caching bukan bagian dari 6 kondisi tsb) |

---

# 12. Pending Activities

Urutan kerja yang direkomendasikan (`executive-architecture-review.md` §10, §13, disesuaikan dengan resolusi `ADR-018`), dua jalur **paralel**:

```
Jalur A — Governance/Keputusan                Jalur B — Alignment/Spesifikasi
─────────────────────────────                 ────────────────────────────
✅ Rekonsiliasi seed role (7 vs 8) — SELESAI    ERD Alignment (termasuk kolom search_vector,
        ↓                                       geocode_cache, api_rate_limits, rate_limit_log)
✅ Nama individu Owner/Reviewer — SELESAI              ↓
        ↓                                       Functional Specification (sudah boleh mulai)
✅ Kebijakan soft-delete seragam — SELESAI             ↓
        ↓                                       UI Specification / Screen Inventory
        │                                             ↓
        │                                       Technical Specification (bahan baku lengkap,
        │                                       tinggal konsolidasi — kini Ready penuh)
        │                                             ↓
        │                                       Database Schema Alignment (fisik)
        │                                             ↓
        │                                       API Alignment (kedalaman endpoint +
        │                                       sinkronisasi redaksional §13/§9.1 Maps
        │                                       dan §0 Caching/Rate Limiting)
        └──────────────── keduanya bertemu di ─────────┘
                                ↓
                        Module Planning (S1+)
                                ↓
                        Sprint S0 Execution (Bolt.new — scaffolding, sudah boleh mulai)
                                ↓
                        Sprint S1 Execution (backend/API/rate limiting Auth — menunggu
                                              Jalur A selesai; tidak ada lagi placeholder
                                              teknologi apa pun sejak ADR-018 resolved)
                                ↓
                        Sprint S4/S5/S9 Execution (Listing & Developer Directory —
                                                     search & Maps sudah final via
                                                     ADR-005/ADR-008, tidak ada lagi
                                                     placeholder provider)
                                ↓
                        Sprint S6/S13 Execution (SEO/Event — job queue sudah final
                                                  via ADR-006, tidak ada blocker lagi)
```

**Catatan:** Sprint S0 murni scaffolding (monorepo, CI/CD, styling dasar, aktivasi ekstensi `pg_trgm` & trigger counter sync di migration awal, konfigurasi `vercel.json` cron) **tidak menunggu** jalur mana pun dan boleh dieksekusi Bolt.new/AI Coding Assistant sekarang. **Perubahan pada siklus ini:** **Jalur A kini sepenuhnya SELESAI** (seed role, nama Owner, soft-delete — ketiganya resolved 4 Agustus 2026) — **tidak ada lagi item apa pun, arsitektur/teknis maupun administratif, di Jalur A**. Sprint S1 pada diagram eksekusi **tidak lagi menunggu Jalur A** — kedua jalur kini berjalan bebas tanpa saling menunggu.

---

# 13. Risk Summary

## 🔴 High
*(Tidak ada — kosong per 4 Agustus 2026, turun dari 1 item. Satu-satunya risiko High yang tersisa — rekonsiliasi seed role — RESOLVED via OD-02.)*

## 🟡 Medium
*(Tidak ada — kosong per 4 Agustus 2026, turun dari 2 item. OD-06 dan OD-07, keduanya RESOLVED.)*
1. ~~**Rekonsiliasi jumlah seed role (7 vs 8) belum tertutup**~~ — **RESOLVED 4 Agustus 2026 (OD-02).**
2. ~~**Kepemilikan dokumen governance masih peran, bukan nama** (OD-06)~~ — **RESOLVED 4 Agustus 2026** — 5 dokumen naik status Baseline sebagai konsekuensi langsung.
3. ~~**Kebijakan soft-delete belum seragam** (OD-07)~~ — **RESOLVED 4 Agustus 2026 via `ADR-046`.**
4. **Functional/UI Specification belum ada** — Module Planning tidak dapat menyentuh implementasi UI presisi tanpa ini, meski tidak memblokir Sprint S0.
5. **Kriteria ambang migrasi Fase 2/tahap lanjut untuk empat ADR sekaligus (Search `ADR-005`, Job Queue `ADR-006`, Maps `ADR-008`, Caching `ADR-018`) berisiko tidak terpantau** — jika tim tidak menetapkan mekanisme monitoring volume listing/latensi p95 (Search), volume job harian/frekuensi cron (Job Queue), kuota harian LocationIQ/p95 latency geocoding (Maps), dan volume request endpoint sensitif/load database (Caching) sejak Sprint S0, keempat migrasi berisiko terlambat dieksekusi saat kriteria sudah terlampaui.
6. **`API-Specification-v1.1.md` §13/§9.1 (Maps) dan §0 (429/Retry-After, Caching) belum disinkronkan redaksional** terhadap keputusan final `ADR-008` dan `ADR-018` — dokumen masih menyiratkan mekanisme versi lama secara implisit; risiko murni redaksional (bukan konflik keputusan), namun berpotensi membingungkan sesi AI yang membaca API Spec tanpa mengecek ADR terlebih dulu.

## 🟢 Low
7. Resend/Sentry — verifikasi akhir sinkronisasi ke `SYSTEM-ARCHITECTURE.md` §23 (OD-09).
8. Model monetisasi & threshold DBR final (OD-11, OD-12) — keputusan bisnis, aman ditunda selama tetap `configurable`.
9. Duplikasi `CHANGELOG.md` Known Issues vs `decision-log.md` Open Decisions tanpa cross-reference kanonik tunggal (lihat Governance Notes).
10. Ambiguitas penomoran "ADR-" antara `architecture-decision-records.md` (ADR-001–028 + `ADR-046`) dan `decision-log.md` (ADR-001–**046**) — kosmetik, tidak memengaruhi isi keputusan.
11. Duplikasi penamaan `AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md` untuk file yang sama — kosmetik, direkomendasikan konsolidasi nama tunggal pada revisi berikutnya (lihat Governance Notes).
12. Mekanisme *Replaces* (`ADR-028`→`ADR-041`) yang diperkenalkan pada siklus `ADR-008` — sudah dicatat sebagai rekomendasi *runbook* Change Management eksplisit; belum diformalkan di `document-governance-baseline-register.md` Bagian 11 pada siklus ini.
13. Dengan seluruh 28 ADR + `ADR-046` kini Approved dan 6/6 kondisi CTO terpenuhi, proyek memasuki fase baru di mana **tidak ada lagi mekanisme "Open Decision" apa pun yang secara otomatis memblokir modul manapun** — risiko baru yang perlu diwaspadai adalah *drift* di masa depan jika perubahan requirement bisnis memunculkan kebutuhan ADR baru (mis. scope baru di luar 13 modul saat ini) namun tidak segera diformalkan sebagai ADR resmi sebelum diimplementasikan. Direkomendasikan tim tetap menjalankan proses Architecture Review Board untuk keputusan arsitektur baru meskipun tidak ada tekanan "Open Decision" yang tersisa saat ini.
14. **(Baru) Konsolidasi 5 Agustus 2026 — `architecture-decision-records.md` v1.0→v1.1, regresi `ADR-005`/`ADR-006` ternyata belum tuntas diperbaiki pada siklus 3 Agustus.** Audit konfigurasi kata-per-kata terhadap 9 file snapshot revisi menemukan bahwa perbaikan yang diklaim tuntas pada siklus `ADR-026`/`027`/`028` (3 Agustus, lihat poin governance siklus tsb di `document-governance-baseline-register.md` poin 13) **hanya menyentuh narasi ringkasan**, bukan entri sumber otoritatif Bagian 4 — pola kegagalan yang lebih berbahaya dari regresi murni karena dokumen tampak konsisten di permukaan padahal isi intinya masih rusak. **Impact Analysis dijalankan secara eksplisit sebelum eksekusi update** (per permintaan pengguna): dikonfirmasi 9 dokumen turunan (`technology-decisions.md`, `PROJECT-CONSTITUTION.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`) **tidak pernah ikut ter-regresi** dan tetap konsisten mencatat `ADR-005`/`006` sebagai Approved sepanjang periode tsb — sehingga **hanya 3 dokumen yang memerlukan update**: `CHANGELOG.md` (rilis `0.2.2`), `document-governance-baseline-register.md` (isi Bagian 10 & Governance Notes), dan `project-manifest.md` (dokumen ini, murni sinkronisasi rujukan versi). **Bukan preseden yang mengubah siklus governance baku** — dicatat di sini sebagai contoh penerapan Impact Analysis yang menghasilkan cakupan lebih sempit dari siklus-siklus ADR sebelumnya, bukan pengecualian terhadap prosedurnya.

---

# 14. Document Version Matrix

> Perbandingan versi **sebelum** dan **sesudah** siklus resolusi **OD-02/06/07** (4 Agustus 2026), konsisten dengan `document-governance-baseline-register.md` Bagian 10. **Siklus ini berbeda dari enam siklus sebelumnya**: murni resolusi Open Decision administratif/data yang sudah lama tercatat (bukan ADR arsitektur baru maupun proposal eksternal) — dampak utamanya adalah **promosi status Baseline**, bukan penambahan konten arsitektur besar. *(Siklus sebelumnya — sinkronisasi `ADR-026`/`ADR-027`/`ADR-028`, 3 Agustus 2026 — didokumentasikan di `CHANGELOG.md` rilis `0.2.0` dan `document-governance-baseline-register.md` Governance Notes poin 13.)*

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| decision-log.md | 1.0 (45 entry) | 1.0 (**46 entry**) | Penambahan entry `ADR-046` + registrasi & resolusi `OD-02`/`OD-06`/`OD-07` di §11, versi dokumen tidak naik (living document) | OD-02/06/07 |
| document-governance-baseline-register.md | 1.0 (Draft) | **1.1 (Baseline)** | **MAJOR governance** — naik status Draft→Baseline; header Owner + Bagian 9/10 disinkronkan; Governance Notes poin 14 baru | OD-06 |
| SYSTEM-ARCHITECTURE.md | 1.6 (Approved, belum Baseline) | 1.6 **(Baseline)** | Promosi status (versi dokumen tidak naik); §1 status, konvensi soft-delete (2 lokasi), gap list diperbarui | OD-06, OD-07 |
| architecture-decision-records.md | 1.0 (Draft, 28 ADR) | 1.0 **(Baseline, 28 ADR + `ADR-046`)** | Promosi status; 19 field Owner per-ADR + header disinkronkan; ADR-004 Notes & role notes (4 lokasi) diperbarui | OD-02, OD-06, OD-07 |
| technology-decisions.md | 1.6 (Draft) | 1.6 **(Baseline)** | Promosi status (versi dokumen tidak naik); header Owner disinkronkan | OD-06 |
| dependency-manifest.md | 1.6 (Draft) | 1.6 **(Baseline)** | Promosi status (versi dokumen tidak naik); header Owner disinkronkan | OD-06 |
| development-playbook.md (AI-DEVELOPMENT-BLUEPRINT.md) | 1.6 (Draft, acuan aktif) | 1.6 **(Baseline)** | Promosi status; header Owner + konvensi soft-delete (poin 6) diperbarui | OD-06, OD-07 |
| PROJECT-CONSTITUTION.md | 1.7 | **1.8** | MINOR — §3.1 klarifikasi role/Guest, soft-delete diperluas (Bagian 21), Technical Constraints poin 14 baru, 2 referensi "25 ADR" stale dikoreksi | OD-02, OD-06, OD-07 |
| ERD-Skema-Database-...v1.1.md | 1.1 | **1.2** | MINOR — soft-delete diperluas 5 entitas (Bagian 4 poin 3), klarifikasi Guest (Bagian 2.28) | OD-02, OD-07 |
| CHANGELOG.md | rilis 0.2.0 | rilis **0.2.1** | **PATCH** (bukan MINOR seperti siklus sebelumnya) — resolusi administratif/data, bukan penambahan cakupan sistem | OD-02, OD-06, OD-07 |
| CURRENT-PROJECT-STATE.md | 0.1 (snapshot 3 Agu) | 0.1 (snapshot **4 Agu**) | Update snapshot — Readiness Snapshot 3/6→**6/6**, Baseline Readiness per dokumen diperbarui | OD-02, OD-06, OD-07 |
| project-manifest.md | 1.5 | **1.6** | MINOR — Bagian 2/3/4/7/8/12/13/14 diperbarui menyeluruh; 2 referensi stale ("25 ADR", versi lama) turut dikoreksi | OD-02, OD-06, OD-07 |
| PRD, API Spec, User Flow, SEO Spec | 1.1 | 1.1 (**tidak berubah**) | Tidak disentuh siklus ini — tidak ada dampak konten dari OD-02/06/07 ke keempat dokumen ini | — |
| AI-CONTEXT-PACK.md, DEVELOPMENT-ROADMAP.md, TASK-TEMPLATE.md | 1.0 | 1.0 (tidak berubah) | Tidak ada perubahan pada siklus ini — `DEVELOPMENT-ROADMAP.md` tetap Draft (blocker bukan hanya nama individu) | — |
| foundation-validation-report.md, executive-architecture-review.md, synchronization-report-adr-001.md | 1.0 / — / — | 1.0 / — / — (tidak berubah, snapshot historis) | Tidak diedit — snapshot point-in-time dipertahankan apa adanya | — |

**Validasi konsistensi:** Seluruh nomor versi di atas **konsisten** dengan `document-governance-baseline-register.md` Bagian 10 (dikonfirmasi silang saat penyusunan Manifest ini). **Catatan tambahan:** dua referensi stale ("25 dari 25 ADR" pada `PROJECT-CONSTITUTION.md` poin 12 & 11, seharusnya sudah 28/28 sejak siklus 3 Agustus) ditemukan lewat audit dan dikoreksi bersamaan pada siklus ini — bukan bagian dari permintaan OD-02/06/07, namun ditemukan karena menyentuh file yang sama, konsisten pola koreksi regresi pada siklus-siklus sebelumnya.

## 14A. Document Version Matrix — Siklus Konsolidasi 5 Agustus 2026

> Perbandingan versi **sebelum** dan **sesudah** siklus konsolidasi `architecture-decision-records.md` (5 Agustus 2026), konsisten dengan `document-governance-baseline-register.md` Bagian 10 dan Governance Notes poin 15. **Siklus ini berbeda dari tujuh siklus sebelumnya**: bukan ADR baru maupun resolusi Open Decision — murni perbaikan integritas dokumentasi (9 file snapshot digabung 1 file master, regresi `ADR-005`/`ADR-006` yang belum tuntas diperbaiki di entri sumber). **Impact Analysis mengonfirmasi tidak ada dokumen turunan lain yang memerlukan revisi konten** — hanya 3 dokumen diperbarui.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| architecture-decision-records.md | 1.0 (Baseline, 28 ADR + `ADR-046`, Status internal masih "Draft") | **1.1 (Baseline, 28 ADR + `ADR-046`)** | PATCH — 9 file snapshot dikonsolidasi 1 file master; entri sumber Bagian 4 `ADR-005`/`ADR-006` dipulihkan tuntas (sebelumnya hanya narasi ringkasan yang diperbaiki 3 Agu); Bagian 1A (Revision History) baru; baris `Cross-reference` diseragamkan; field Status internal disinkronkan ke Baseline | Audit konsolidasi (non-ADR, non-OD) |
| CHANGELOG.md | rilis 0.2.1 | rilis **0.2.2** | **PATCH** — perbaikan integritas dokumentasi, bukan penambahan cakupan sistem | Konsolidasi ADR v1.1 |
| document-governance-baseline-register.md | 1.1 (Baseline) | 1.1 (Baseline, **isi diperbarui**) | Update isi — baris Bagian 10 & Governance Notes poin 15 baru, versi dokumen tidak naik | Konsolidasi ADR v1.1 |
| project-manifest.md | 1.6 | **1.7** | PATCH (redaksional) — rujukan versi `architecture-decision-records.md` disinkronkan ke v1.1 di seluruh bagian (§1, §4, §8, §15) | Konsolidasi ADR v1.1 |
| technology-decisions.md, SYSTEM-ARCHITECTURE.md, dependency-manifest.md, development-playbook.md, PROJECT-CONSTITUTION.md, decision-log.md, CURRENT-PROJECT-STATE.md | (versi masing-masing tidak berubah) | (tidak berubah) | **Tidak disentuh** — dikonfirmasi sudah konsisten mencatat `ADR-005`/`ADR-006` sebagai Approved sepanjang periode regresi, tidak ada konten yang perlu dikoreksi (lihat `architecture-decision-records.md` Governance Notes poin 4 & 6) | — |
| PRD, ERD, API Spec, User Flow, SEO Spec | 1.1/1.2 | (tidak berubah) | Tidak disentuh siklus ini | — |

**Validasi konsistensi:** Nomor versi di atas konsisten dengan `document-governance-baseline-register.md` Bagian 10 dan Governance Notes poin 15.

---

## 14B. Document Version Matrix — Konsolidasi SYSTEM-ARCHITECTURE.md (9 Agustus 2026)

> Berbeda dari siklus 14A (ADR, 5 Agustus): siklus ini murni **audit integritas
> penomoran versi**, bukan perubahan isi/keputusan arsitektur. Nomor versi publik
> `SYSTEM-ARCHITECTURE.md` **tidak berubah** — tetap v1.6.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| SYSTEM-ARCHITECTURE.md | 1.6 (3 snapshot berbeda isi, semua berlabel "1.6" identik — ambigu) | **1.6 (tidak berubah nilai; 1 file kanonik, setara 1.6.2 internal)** | Konsolidasi 9 snapshot (v1.0–v1.6) jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan; identifier PATCH retroaktif 1.6.0/1.6.1/1.6.2 diberikan ke 3 snapshot yang sebelumnya tidak terbedakan | Audit konsolidasi (non-ADR, non-OD) |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi SYSTEM-ARCHITECTURE.md — redaksional, tidak ada rujukan versi yang berubah nilainya | Konsolidasi SYSTEM-ARCHITECTURE.md |

**Catatan governance terbuka (belum diperbaiki, di luar cakupan siklus ini):**
- Daftar Isi `SYSTEM-ARCHITECTURE.md` tidak mencantumkan Bagian 23 (Open Questions) & 24 (ADR Cross-Reference Matrix) sejak v1.5, meski kedua bagian tetap ada di badan dokumen.
- `ADR-046` (soft-delete 8 tabel) disebut di header status `SYSTEM-ARCHITECTURE.md` sebagai bagian dari "sinkron penuh", namun tidak punya baris resmi di ADR Cross-Reference Matrix Bagian 24 — matriks berhenti di ADR-028.

## 14C. Document Version Matrix — Konsolidasi AI Development Blueprint (9 Agustus 2026)

> Sama seperti 14B: murni audit integritas penomoran versi, bukan perubahan
> keputusan teknis. Nomor versi publik **tidak berubah** — tetap v1.6.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| AI Development Blueprint (`development-playbook.md`) | 1.6 (2 snapshot berbeda isi, label "1.6" identik — ambigu) | **1.6 (tidak berubah nilai; 1 file kanonik, setara 1.6b internal)** | Konsolidasi 9 snapshot (2× "v1.0" + v1.1–v1.6) jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan | Audit konsolidasi (non-ADR, non-OD) |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi AI Development Blueprint — redaksional | Konsolidasi AI Development Blueprint |

**Catatan governance terbuka (dicatat, TIDAK ditindaklanjuti — keputusan Owner 9 Agustus 2026):**
- `AI-DEVELOPMENT-BLUEPRINT.md` (draft 28-bagian, tema pattern teknis, tanpa tabel Document Information) juga berlabel "Version 1.0" namun berstruktur sama sekali berbeda dari rantai versi resmi. Disimpulkan draft awal yang ditinggalkan. **Owner memutuskan: dibiarkan apa adanya, tidak diarsipkan/diekstrak/dihapus.**

## 14D. Document Version Matrix — Konsolidasi MP-01 Authentication (9 Agustus 2026)

> Sama seperti 14B/14C: murni audit integritas penomoran versi, bukan perubahan
> keputusan teknis. Nomor versi publik **tidak berubah** — tetap v1.0.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-01-Authentication-Module-Planning.md | 1.0 (3 snapshot berbeda isi, label "1.0" identik — ambigu) | **1.0 (tidak berubah nilai; 1 file kanonik, setara 1.0c internal)** | Konsolidasi 3 snapshot jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan | Audit konsolidasi (non-ADR, non-OD) |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi MP-01 — redaksional | Konsolidasi MP-01 |

**Catatan positif (bukan temuan governance terbuka):** audit ini tidak menemukan kehilangan konten apa pun — kualitas dokumentasi resolusi Open Issue MP-01 (kode audit OD-18/T4-06/T4-02/T4-07, strikethrough dipertahankan) dinilai sebagai contoh baik untuk direplikasi ke MP lain saat konsolidasi berikutnya.

## 14E. Document Version Matrix — Konsolidasi MP-02 Profil Agen (9 Agustus 2026)

> Sama seperti 14B/14C/14D: murni audit integritas penomoran versi, bukan
> perubahan keputusan teknis. Nomor versi publik **tidak berubah** — tetap v1.0.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-02-ProfilAgen-Module-Planning.md | 1.0 (3 snapshot berbeda isi, label "1.0" identik — ambigu) | **1.0 (tidak berubah nilai; 1 file kanonik, setara 1.0c internal)** | Konsolidasi 3 snapshot jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan | Audit konsolidasi (non-ADR, non-OD) |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi MP-02 — redaksional | Konsolidasi MP-02 |

**Catatan positif (bukan temuan governance terbuka):** sama seperti MP-01 (14D), audit ini tidak menemukan kehilangan konten apa pun. Verifikasi silang terhadap `Authorization-Access-Control-Specification-v1.1-FINAL.md` dan `decision-log.md`/`ISSUE-REGISTER-Konsolidasi-FINAL.md` (untuk OD-23) **tuntas dan cocok penuh** — dua dokumen governance dari siklus Issue Register Batch 2/3 sudah beres tersinkron sebelum audit ini dimulai.

## 14F. Document Version Matrix — Konsolidasi MP-03 Listing (9 Agustus 2026)

> Berbeda dari 14D/14E: siklus ini mencakup DUA hal — (1) audit integritas
> penomoran versi (seperti biasa, nomor publik tidak berubah), DAN (2)
> penggabungan konten baru dari P6 (`ADR-047`/`OD-25`) yang sebelumnya belum
> termerge ke dokumen utama.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-03-Listing-Module-Planning.md | 1.0 (3 snapshot berbeda isi, label "1.0" identik — ambigu; P6 belum termerge) | **1.0 (tidak berubah nilai; 1 file kanonik, setara 1.0c + P6)** | Konsolidasi 3 snapshot + merge P6 jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan | Audit konsolidasi + eksekusi P6 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi + merge P6 MP-03 — redaksional | Konsolidasi MP-03 |

**Catatan berbeda dari MP-01/MP-02:** Konflik #1 dan #2 di MP-03 memperbaiki **migration `0008` secara langsung** (bukan hanya status dokumentasi). Direkomendasikan verifikasi silang terhadap `0008_m03_listing.sql` versi terbaru di project untuk memastikan kedua perbaikan (RLS `listings_select_public` status sold/rented; klausa Org Leader di 3 child-table policy) benar-benar tercermin di file migration aktual — belum dilakukan di audit ini karena file tsb tidak diupload untuk task ini.

## 14G. Document Version Matrix — Konsolidasi MP-04 Learning Center + Regresi RLS (9 Agustus 2026)

> Berbeda dari 14D/14E/14F: siklus ini mencakup TIGA hal — (1) audit integritas
> penomoran versi (nomor publik tidak berubah, seperti biasa), (2) **temuan
> regresi dokumentasi-vs-implementasi** (klaim "Diperbaiki" di dokumen tidak
> tercermin di migration aktual), dan (3) **perbaikan migration** atas
> instruksi eksplisit Owner.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-04-LearningCenter-Module-Planning.md | 1.0 (3 snapshot berbeda isi, label "1.0" identik; klaim RLS fix tidak terverifikasi) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi Silang)** | Konsolidasi 3 snapshot + audit regresi + anotasi resolusi | Audit konsolidasi + verifikasi migration |
| `0009_m04_learning_center.sql` | Berisi 4 RLS policy tanpa ownership Instructor (regresi — klaim dokumentasi tidak sesuai fakta) | **`0009_m04_learning_center-FIXED.sql`** — 4 policy diperbaiki | Perbaikan RLS gap Konflik #1 & #3 | Instruksi eksplisit Owner, 9 Agustus 2026 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat regresi + resolusi MP-04 — redaksional | Konsolidasi MP-04 |

**🔴→🟢 Temuan regresi (root cause tidak diketahui, resolusi terkonfirmasi):** klaim "Diperbaiki [2026-08-06]" di 6 lokasi dokumen MP-04 ternyata tidak tercermin di migration aktual saat diverifikasi 9 Agustus 2026. Owner mengonfirmasi file yang diaudit adalah versi terbaru (bukan usang) — artinya perbaikan yang tercatat di dokumentasi **tidak pernah benar-benar dieksekusi** ke SQL selama 3 hari (6→9 Agustus). Direkomendasikan sebagai **preseden untuk verifikasi silang serupa** di MP lain yang mengklaim "migration diperbaiki" tanpa file SQL terlampir untuk cross-check.

## 14H. Document Version Matrix — Konsolidasi MP-05 Kalender Event + Regresi RLS #2 (9 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-05-KalenderEvent-Module-Planning.md | 1.0 (3 snapshot identik label; klaim RLS fix tidak terverifikasi) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi Silang)** | Konsolidasi 3 snapshot + audit regresi + anotasi resolusi | Audit konsolidasi + verifikasi migration |
| `0010_m05_events.sql` | 1 policy `events_manage` tunggal — bug self-approval aktif, regresi dari klaim dokumentasi | **`0010_m05_events-FIXED.sql`** — dipecah 4 policy | Perbaikan bug bypass approval, Konflik #1 | Instruksi eksplisit Owner, 9 Agustus 2026 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat regresi + resolusi MP-05 — redaksional | Konsolidasi MP-05 |

**🔴 POLA SISTEMIK — 2 regresi migration berturut-turut (MP-04, MP-05):** kedua kasus punya bentuk identik — dokumen module planning mencatat status "✅ Diperbaiki [2026-08-06]" untuk RLS fix, tapi file migration aktual tidak pernah benar-benar diubah. Kemungkinan root cause bersama: perbaikan RLS ditulis ke dokumentasi sebagai bagian dari sesi kerja yang sama (audit Issue Register Batch 1, 6 Agustus 2026) tanpa file SQL yang diperbaiki benar-benar disimpan/diterapkan ke lokasi kanonik. **Rekomendasi kuat:** verifikasi silang migration terhadap MP-06 s.d. MP-13 dijadikan **wajib**, bukan opsional, terutama untuk modul yang mencatat klaim serupa "RLS Diperbaiki [tanggal]" tanpa file SQL yang pernah diverifikasi.

## 14I. Document Version Matrix — Konsolidasi MP-06 Direktori Developer + Regresi #3 (9 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-06-DirektoriDeveloper-Module-Planning.md | 1.0 (3 snapshot identik label; klaim API Spec fix tidak terverifikasi) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi Silang)** | Konsolidasi 3 snapshot + audit regresi + anotasi resolusi | Audit konsolidasi + verifikasi API Spec |
| `API-Specification-RUMAHAGEN.md` | v1.3-FINAL, §10.3 M06 hanya 4 endpoint (regresi — klaim T4-11 tidak tercermin) | **v1.3-FINAL-FIXED** — 3 endpoint ditambahkan | Pemulihan kontrak CRUD admin M06 | Instruksi eksplisit Owner, 9 Agustus 2026 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat regresi + resolusi MP-06 — redaksional | Konsolidasi MP-06 |

**🔴 POLA SISTEMIK — 3 dari 3 kasus terverifikasi = regresi (MP-04, MP-05, MP-06):**
setiap kasus punya bentuk identik — dokumen module planning mencatat "✅ Diperbaiki
[2026-08-06]" merujuk ke dokumen sumber lain (migration SQL atau API Specification),
tapi perubahan tidak pernah benar-benar tersimpan ke dokumen tsb. **Rekomendasi
kuat, dinaikkan prioritasnya:** verifikasi silang sekarang WAJIB untuk MP-07 s.d.
MP-13 (7 dokumen tersisa), tidak lagi opsional — pola 100% (3/3) terlalu tinggi
untuk diabaikan sebagai kebetulan.

## 14J. Document Version Matrix — Konsolidasi MP-07 + MP-08, Verifikasi Bersih (9 Agustus 2026)

> Berbeda dari 14G/14H/14I (regresi MP-04/05/06): siklus ini murni audit
> integritas penomoran versi + verifikasi silang yang **seluruhnya lolos**.
> Tidak ada perbaikan dokumen sumber yang diperlukan.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-07-DBRScoring-Module-Planning.md | 1.0 (2 snapshot identik label) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi)** | Konsolidasi 2 snapshot + verifikasi T4-13/T4-14 (lolos) | Audit konsolidasi |
| MP-08-DashboardNotifikasi-Module-Planning.md | 1.0 (2 snapshot identik label) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi)** | Konsolidasi 2 snapshot + verifikasi T4-16 (lolos) | Audit konsolidasi |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat konsolidasi bersih MP-07+MP-08 — redaksional | Konsolidasi MP-07+MP-08 |

**Update status pola sistemik (lihat 14I poin terkait):** dari 6 klaim yang diverifikasi silang sejak 9 Agustus 2026 (T4-11 M06, dan T4-13/T4-14/T4-16 di sini, plus 2 klaim migration MP-04/MP-05), **3 klaim gagal verifikasi (regresi)** dan **3 klaim lolos** (T4-13, T4-14, T4-16). Rasio regresi turun dari 100% (3/3) menjadi 50% (3/6) — kebijakan verifikasi wajib tetap dipertahankan untuk MP-09 s.d. MP-13, tapi tidak lagi diasumsikan bahwa seluruh modul pasti bermasalah.

## 14K. Document Version Matrix — Konsolidasi MP-09 + Regresi OD-20 (sudah closed independen) (9 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-09-AdminPanel-Module-Planning.md | 1.0 (3 snapshot identik label) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi)** | Konsolidasi 3 snapshot + verifikasi OD-20 (lolos, closed independen) | Audit konsolidasi |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat konsolidasi MP-09 + update statistik pola sistemik — redaksional | Konsolidasi MP-09 |

**🔴 Update rasio pola sistemik (revisi dari 14J):** dari 7 klaim yang diverifikasi silang total sejak 9 Agustus 2026, **4 mengalami regresi** (MP-04 migration `0009`, MP-05 migration `0010`, MP-06 API Spec §10.3, **MP-09/OD-20 API Spec §11.3 — kasus ini closed independen sebelum ditemukan lewat audit**) dan **3 terverifikasi bersih** (MP-07 ×2, MP-08 ×1). **Rasio regresi naik ke 57% (4/7)** — cukup tinggi untuk mengonfirmasi kebijakan verifikasi wajib (poin 27) tetap krusial untuk MP-10 s.d. MP-13, bukan sekadar kehati-hatian berlebih.

**Catatan proses penting:** kasus OD-20 menunjukkan regresi **bisa ditemukan dan diperbaiki lewat jalur kerja lain** (di sini: upgrade API Spec terkait fitur berbeda, ADR-047/OD-25) sebelum audit konsolidasi module planning sampai ke modul terkait. Ini **tidak mengurangi urgensi** verifikasi sistematis — justru menunjukkan regresi bisa tersembunyi dan baru ketahuan secara kebetulan jika tidak diverifikasi eksplisit.

## 14L. Document Version Matrix — Konsolidasi MP-10 RBAC, Verifikasi Bersih (9 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-10-RBAC-Module-Planning.md | 1.0 (2 snapshot identik label) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi)** | Konsolidasi 2 snapshot + verifikasi T4-01 (lolos) | Audit konsolidasi |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat konsolidasi bersih MP-10 — redaksional | Konsolidasi MP-10 |

**Update rasio pola sistemik (revisi dari 14K):** dari 8 klaim yang diverifikasi silang total sejak 9 Agustus 2026, **4 regresi** (MP-04, MP-05, MP-06, MP-09/OD-20 — closed independen) dan **4 terverifikasi bersih** (MP-07 ×2, MP-08 ×1, MP-10 ×1). **Rasio regresi turun ke 50% (4/8).** Kebijakan verifikasi wajib (poin 27) tetap dipertahankan untuk MP-11 s.d. MP-13 — sampel 8 masih belum cukup besar untuk menyimpulkan tren menurun secara statistik solid.

## 14M. Document Version Matrix — Revisi MP-03 (Regresi #5&6) + Konsolidasi MP-11 (10 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-03-Listing-Module-Planning.md | 1.0 (file final 9 Agu, 2 klaim regresi belum terdeteksi) | **1.0 (direvisi ulang, regresi #1/#2 dianotasi & diperbaiki)** | Revisi ulang file final — verifikasi retroaktif | Audit MP-11 memicu verifikasi balik |
| MP-11-SEOAnalytics-Module-Planning.md | 1.0 (2 snapshot identik label) | **1.0 (1 file kanonik + Catatan Verifikasi, termasuk temuan regresi MP-03)** | Konsolidasi 2 snapshot + verifikasi T4-15 (lolos) + T1-02 (regresi, diperbaiki) | Audit konsolidasi |
| `0008_m03_listing.sql` | 2 policy dengan klaim fix palsu | **`0008_m03_listing-FIXED.sql`** — kedua diperbaiki nyata | Perbaikan akses publik sold/rented + Org Leader child-table | Instruksi eksplisit Owner, 10 Agustus 2026 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat revisi MP-03 + konsolidasi MP-11 + refleksi proses | Siklus ini |

**🔴 Update rasio pola sistemik (revisi tajam dari 14L): 6 dari 10 klaim = regresi (60%)** — naik dari 50%. **Refleksi proses penting:** 2 dari 6 regresi ini (MP-03) ditemukan bukan karena dokumen sumber gagal, tapi karena **audit konsolidasi MP-03 sendiri (9 Agustus) tidak menerapkan verifikasi silang wajib** yang baru matang setelah MP-04. Ini bukan kegagalan proyek semata — juga kegagalan proses audit. **Rekomendasi kuat:** audit ulang MP-01 dan MP-02 (diaudit sebelum kebijakan verifikasi wajib matang) untuk memastikan tidak ada klaim serupa yang lolos tanpa verifikasi.

## 14N. Document Version Matrix — Konsolidasi MP-12 + Regresi #7 + Konfirmasi Hotfix Gagal Total (10 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-12-Organization-Module-Planning.md | 1.0 (4 snapshot, 2 identik byte-per-byte; T1-04 tidak terverifikasi) | **1.0 (tidak berubah nilai; 1 file kanonik + Catatan Verifikasi)** | Konsolidasi 4 snapshot + verifikasi T1-04 (regresi, diperbaiki) + T4-22 (lolos) | Audit konsolidasi + verifikasi migration |
| `0007_m12_organization.sql` | `org_invitations_insert` rentan spoofing (regresi — klaim tidak sesuai fakta) | **`0007_m12_organization-FIXED.sql`** — kondisional per `initiated_by_type` | Perbaikan celah spoofing leader_invite | Instruksi eksplisit Owner, 10 Agustus 2026 |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat regresi + resolusi MP-12 + konfirmasi pola hotfix — redaksional | Konsolidasi MP-12 |

**🔴 TEMUAN GOVERNANCE PALING SIGNIFIKAN: `TASK-HOTFIX-20260806-001` gagal 100% (4 dari 4 item Tier 1).** T1-01, T1-02, T1-03, T1-04 — seluruh item Tier 1 dari task hotfix tunggal ini sekarang terkonfirmasi regresi tanpa kecuali. Ini bukan lagi "pola sistemik" berbasis statistik — ini **kegagalan penuh satu unit kerja**. **Rekomendasi tertinggi:** investigasi root cause `TASK-HOTFIX-20260806-001` secara spesifik (bukan hanya audit modul lanjutan) — kemungkinan besar seluruh isi task ini tidak pernah ter-commit/tersimpan ke file migration yang benar, terlepas dari modul mana pun yang terdampak.

**Update rasio pola sistemik keseluruhan: 7 dari 12 klaim = regresi (58%).**

## 14O. Document Version Matrix — Konsolidasi MP-13 (Modul Terakhir) + Ringkasan Penutup 13 Module Planning (10 Agustus 2026)

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-13-AIAssistant-Module-Planning.md | 1.0 (3 snapshot identik label) | **1.0 (1 file kanonik + Catatan Verifikasi)** | Konsolidasi 3 snapshot + verifikasi OD-21 (lolos) | Audit konsolidasi |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat konsolidasi MP-13 + ringkasan penutup 13 modul — redaksional | Konsolidasi MP-13 |

**🎉 KONSOLIDASI 13 MODULE PLANNING SELESAI.** Lihat entry CHANGELOG [0.7.16] untuk rekap lengkap status seluruh 13 modul dan temuan governance utama (kegagalan 100% `TASK-HOTFIX-20260806-001`, 4/4 item Tier 1).

**Rasio regresi final keseluruhan siklus: 7 dari 13 klaim yang diverifikasi silang = regresi aktif (54%)**, ditambah 1 kasus closed independen (MP-09/OD-20) sebelum sempat terverifikasi sebagai regresi aktif.

---

## 14P. Document Version Matrix — Konsolidasi MDM & MIS (10 Agustus 2026)

> Berbeda dari 14B-14O: kedua dokumen ini hanya punya **1 versi** yang pernah
> diupload — audit murni memverifikasi tidak ada versi historis lain yang perlu
> dibandingkan, bukan membandingkan multi-snapshot.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| Module-Dependency-Matrix-RUMAHAGEN.md (MDM) | 1.0 (tanpa tabel Riwayat Versi; 9 rujukan `SYSTEM-ARCHITECTURE.md` usang) | **1.0 (tidak berubah nilai; Riwayat Versi ditambahkan; rujukan diperbarui — lihat 0.7.17)** | Audit konsolidasi (single-version) + housekeeping rujukan nama file | Audit konsolidasi |
| Module-Implementation-Strategy-RUMAHAGEN.md (MIS) | 1.0 (tanpa tabel Riwayat Versi) | **1.0 (tidak berubah nilai; Riwayat Versi ditambahkan)** | Audit konsolidasi (single-version), bersih | Audit konsolidasi |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat konsolidasi MDM & MIS — redaksional | Konsolidasi MDM & MIS |

**Catatan:** tidak ada temuan governance terbuka dari kedua dokumen ini — MIS sepenuhnya bersih (tidak ada rujukan usang apa pun), MDM sudah diperbaiki penuh di siklus housekeeping `0.7.17` (lihat 14B addendum di `document-governance-baseline-register.md` poin 22).

---

## 14Q. Audit Ulang MP-02 dengan Standar Verifikasi Ketat Penuh — Item Terbuka Ditutup (10 Agustus 2026)

> Item terbuka dari CHANGELOG `[0.7.19]`/`[Unreleased]` dan Governance Notes
> poin 35 (`document-governance-baseline-register.md`): MP-02 sebelumnya hanya
> diverifikasi parsial pada sesi audit awal (9 Agustus 2026), sebelum kebijakan
> verifikasi silang wajib (poin 29) matang — sama seperti MP-01 sebelum diaudit
> ulang. Siklus ini menutup item tersebut.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| MP-02-ProfilAgen-Module-Planning.md | 1.0 (2 klaim belum diverifikasi standar ketat penuh) | **1.0 (tidak berubah nilai; verifikasi ketat penuh dijalankan, Recommendation poin #2 dikoreksi)** | Audit ulang + verifikasi silang terhadap file sumber | Item terbuka poin 35, `document-governance-baseline-register.md` |
| `document-governance-baseline-register.md` | v1.8 | **v1.9** | Governance Notes poin 37 ditambahkan, item terbuka poin 35 dianotasi resolved | Audit ulang MP-02 |
| `CHANGELOG.md` | rilis `0.7.19` | **rilis `0.7.20`** | Entry baru mencatat hasil audit | Audit ulang MP-02 |
| project-manifest.md (dokumen ini) | v1.24 | **v1.25** | Mencatat audit ulang MP-02 — redaksional | Siklus ini |

**Hasil verifikasi:**
1. **Klaim OD-23** (UNIQUE constraint `idx_agent_reviews_one_per_reviewer_per_agent` + RLS `agent_reviews_insert_buyer`/`agent_reviews_update_own` untuk self-review Agen) — diverifikasi langsung terhadap `0005_m02_agent_profile.sql` versi terbaru. **TERBUKTI BENAR**, seluruh objek ada dan sesuai spesifikasi.
2. **Klaim T4-03** (Authorization Spec §2.3, Buyer `own`→`none` untuk Approve/Delete-AgentReview) — diverifikasi terhadap `Authorization-Access-Control-Specification-v1.1-FINAL.md`. **TERBUKTI BENAR**, kedua permission tercatat `none` untuk Buyer.

**🟢 MP-02 LOLOS — TIDAK ADA REGRESI.** MP-02 bergabung dengan MP-01 sebagai modul yang sudah diaudit ulang dan dinyatakan bersih dengan standar verifikasi penuh yang sama seperti MP-04 dan seterusnya.

**Temuan minor non-blocking:** Bagian Recommendation poin #2 MP-02 masih menuliskan perbaikan komentar migration `0005` ("0007"→"0008") sebagai item terbuka — verifikasi langsung terhadap 3 snapshot file (`__1_`, `__2_`, `__3_`) membuktikan perbaikan ini **sudah** diterapkan di `__2_`/`__3_`. Teks Recommendation dikoreksi mengikuti fakta file.

**Update rasio pola sistemik final: 6 dari 12 klaim yang diaudit standar ketat penuh = regresi (50%)**, turun dari 58% (`CHANGELOG` `[0.7.15]`). Dengan ini, **seluruh item terbuka dari siklus konsolidasi 13 Module Planning terkait audit MP-02 resmi ditutup** — hanya 2 item governance yang tersisa proyek-wide: (1) mengganti 5 file migration/dokumen sumber `-FIXED` ke lokasi kanonik project, (2) eksekusi seluruh migration ke database live.

---

# 15. Baseline Status

## Current Active Baseline
Dokumen berstatus **Baseline** yang berlaku aktif saat ini (**12 dokumen**, naik dari 7 pada siklus 4 Agustus):
- `PROJECT-CONSTITUTION.md` **v1.8** (BERLAKU)
- `PRD-RUMAHAGEN-v1.1.md` v1.1
- `TASK-TEMPLATE.md` v1.0
- `decision-log.md` v1.0 (46 entry)
- `CHANGELOG.md` rilis **0.2.2**
- `CURRENT-PROJECT-STATE.md` v0.1 (snapshot 4 Agu 2026)
- `foundation-validation-report.md` v1.0 (Final)
- `SYSTEM-ARCHITECTURE.md` v1.6 (naik Baseline 4 Agu 2026)
- `architecture-decision-records.md` **v1.1** (naik Baseline 4 Agu 2026; **konsolidasi isi 5 Agu 2026**)
- `technology-decisions.md` v1.6 (naik Baseline 4 Agu 2026)
- `dependency-manifest.md` v1.6 (naik Baseline 4 Agu 2026)
- `development-playbook.md` v1.6 (naik Baseline 4 Agu 2026)
- `document-governance-baseline-register.md` v1.1 (naik Baseline 4 Agu 2026; **isi diperbarui 5 Agu 2026**)

## Previous Baseline (Superseded pada Siklus Ini)
| Dokumen | Baseline Lama | Baseline Baru | Tanggal Transisi |
|---|---|---|---|
| PROJECT-CONSTITUTION.md | v1.7 | **v1.8** | 4 Agu 2026 |
| document-governance-baseline-register.md | Draft (belum ada Baseline) | **v1.1 (Baseline pertama)** | 4 Agu 2026 |
| architecture-decision-records.md | v1.0 (Baseline, Status internal "Draft") | **v1.1 (Baseline, konsolidasi + perbaikan regresi ADR-005/006)** | 5 Agu 2026 |
| CHANGELOG.md | rilis 0.2.0 | rilis 0.2.1 (4 Agu) → rilis **0.2.2** (5 Agu) | 4–5 Agu 2026 |
| project-manifest.md (dokumen ini) | v1.6 | **v1.7** | 5 Agu 2026 |

> Sesuai `document-governance-baseline-register.md` Bagian 4.2, Baseline lama **tidak dihapus** — ditandai *Deprecated* pada hari transisi yang sama, lalu *Archived* setelah masa transisi wajar. Isi v1.7 `PROJECT-CONSTITUTION.md` dan rilis 0.2.0 `CHANGELOG.md` tetap tersedia sebagai riwayat di dalam dokumen masing-masing (`CHANGELOG.md` Aturan Wajib #1: history tidak boleh dihapus).

## Dokumen Naik Status ke Baseline pada Siklus Ini (Draft → Baseline, Bukan Sekadar Kenaikan Versi)
| Dokumen | Versi | Status Lama | Status Baru | Pemicu |
|---|---|---|---|---|
| SYSTEM-ARCHITECTURE.md | 1.6 (tidak naik) | Approved, belum Baseline formal | ✅ Baseline (BERLAKU) | OD-06 |
| architecture-decision-records.md | 1.0 (tidak naik) | Draft (dokumen) | ✅ Baseline (BERLAKU) | OD-06 |
| technology-decisions.md | 1.6 (tidak naik) | Draft | ✅ Baseline (BERLAKU) | OD-06 |
| dependency-manifest.md | 1.6 (tidak naik) | Draft | ✅ Baseline (BERLAKU) | OD-06 |
| development-playbook.md | 1.6 (tidak naik) | Draft (acuan aktif) | ✅ Baseline (BERLAKU) | OD-06 |
| document-governance-baseline-register.md | 1.0→**1.1** | Draft | ✅ Baseline (BERLAKU) | OD-06 |

Kelima dokumen pertama **tidak naik nomor versi** karena isi kontennya tidak berubah signifikan (kecuali sinkronisasi Owner/soft-delete/role notes) — hanya status Draft→Baseline yang berubah, disahkan langsung oleh Owner tunggal (Mujtahid Aktanto, model proyek solo — bukan segregation-of-duties tim). `document-governance-baseline-register.md` naik versi (1.0→1.1) karena ini adalah kenaikan status Baseline **pertama kalinya** untuk dokumen itu sendiri, konsisten aturan "nomor versi naik saat memasuki status Baseline" (Bagian 5 dokumen tsb).

## Review Schedule
| Dokumen | Next Review | Trigger |
|---|---|---|
| architecture-decision-records.md | Per ADR baru (tidak ada lagi ADR OPEN yang menghalangi) | ADR baru muncul di masa depan |
| technology-decisions.md | Saat keputusan stack besar baru turun | Keputusan baru / ADR baru |
| SYSTEM-ARCHITECTURE.md | Setelah Open Decision H1–H3 (`foundation-validation-report.md` §16), atau saat keputusan arsitektur besar baru turun | Keputusan baru / ADR baru |
| dependency-manifest.md | Bersamaan technology-decisions.md | Sinkron |
| PROJECT-CONSTITUTION.md | Setiap keputusan bisnis besar turun | Keputusan bisnis/arsitektur baru |
| development-playbook.md | Saat AI Workflow/Rules berubah | ADR baru muncul di masa depan |
| CURRENT-PROJECT-STATE.md | Akhir setiap sesi development | Setiap sesi yang mengubah kode/keputusan nyata |
| decision-log.md | Berkelanjutan (tiap ADR baru) | ADR baru Approved |
| CHANGELOG.md | Setiap rilis versi baru | Rilis baru |
| document-governance-baseline-register.md | Setiap kali status/versi dokumen lain berubah material | Perubahan versi/status dokumen manapun |
| **project-manifest.md** (dokumen ini) | **Saat Sprint S0/S1 dieksekusi, paket sinkronisasi Modul 12/13 dijalankan, atau Open Decision/ADR baru muncul** — tidak ada lagi Open Decision administratif yang tersisa sebagai pemicu | Eksekusi Sprint, paket sinkronisasi, atau keputusan baru |

---

# 16. Governance Notes

> Konsisten dengan mandat Manifest ini: pertentangan yang ditemukan **dicatat**, **tidak diperbaiki sepihak** di sini. Poin 1–14 dipertahankan penuh dari Manifest versi sebelumnya (histori tidak dihapus); poin 15 baru ditambahkan pada siklus ini.

1. **`decision-log.md` §11 (Open Decisions) belum diformat-ulang sepenuhnya meski `ADR-038`–`ADR-042` sudah ada.** `synchronization-report-adr-001.md` mengklaim baris #1 "ditandai resolved dan dirujuk-silang ke ADR-038", namun isi aktual `decision-log.md` §11 baris #1 **masih memakai strikethrough sebagian** dari redaksi lama, bukan format Resolved penuh. **Rekomendasi:** update baris #1, #3, #4, #5 §11 secara eksplisit (append status, bukan menghapus), agar konsisten dengan isi dokumen sebenarnya.
2. **Duplikasi versi dokumen di repositori proyek.** Beberapa dokumen ditemukan dalam dua salinan (versi dasar vs versi bersufiks upload berikutnya) dengan isi berbeda signifikan. Manifest ini secara konsisten memakai **versi dengan `Last Updated`/nomor versi paling akhir**. **Rekomendasi:** konsolidasikan menjadi satu salinan kanonik per dokumen di repositori, hapus/arsipkan salinan usang secara eksplisit.
3. **`executive-architecture-review.md` adalah snapshot point-in-time** yang disusun **sebelum** `ADR-001`, `ADR-005`, `ADR-006`, `ADR-008`, maupun `ADR-018` disinkronkan penuh — dokumen tsb masih mencantumkan Open Decision #1 (Backend), #3 (Search Engine), dan #4 (Job Queue) sebagai belum terkunci; Maps Provider dan Caching Strategy tidak termasuk salah satu dari 6 kondisi resmi CTO sehingga resolusi keduanya tidak mengubah status verdict "GO WITH CONDITIONS". Manifest ini memperbarui status tersebut menjadi Resolved berdasarkan bukti dari dokumen yang lebih baru, **tanpa mengedit isi asli** `executive-architecture-review.md` itu sendiri. **Rekomendasi:** terbitkan addendum singkat pada `executive-architecture-review.md` yang mencatat resolusi Kondisi #1, #3, dan #4 (Bagian 14 dokumen tsb), tanpa mengubah verdict aslinya.
4. ~~**Rekonsiliasi jumlah seed role (7 vs 8) belum tertutup**~~ — **RESOLVED 4 Agustus 2026 (OD-02)**: dikunci final 7 role dengan akun + Guest tanpa baris `roles`. Lihat poin 13 di bawah untuk detail siklus resolusi.
5. **`document-governance-baseline-register.md` sempat dilaporkan "tidak tersedia"** oleh `synchronization-report-adr-001.md` pada sesi penyusunan laporan tsb, namun **kini tersedia** dan sudah disinkronkan lima kali (siklus `ADR-001`, `ADR-005`, `ADR-006`, `ADR-008`, dan `ADR-018`). **Rekomendasi:** tandai item "Belum Selesai" di `synchronization-report-adr-001.md` sebagai closed pada sesi berikutnya, tanpa mengedit laporan historisnya.
6. **Ambiguitas penomoran "ADR-"** antara `architecture-decision-records.md` (`ADR-001`–`ADR-025`, per topik) dan `decision-log.md` (`ADR-001`–`ADR-042`, kronologis) — sudah dicatat oleh kedua dokumen sumber sendiri sebagai potensi ambiguitas penamaan, **belum diputuskan** solusinya. Diteruskan di sini sebagai rekomendasi terbuka.
7. **Duplikasi Known Issues (`CHANGELOG.md`) dan Open Decisions (`decision-log.md`)** mencatat sebagian besar item yang sama dengan penomoran/redaksi berbeda, tanpa cross-reference kanonik. `foundation-validation-report.md` sudah merekomendasikan konsolidasi (prioritas Low) — Manifest ini meneruskan rekomendasi tsb.
8. **Ketidaksesuaian versi rilis proyek antar salinan `CHANGELOG.md`** (historis) — sudah tidak relevan pada siklus ini karena seluruh salinan yang diupload kini konsisten pada rilis `0.1.5`. Dipertahankan sebagai catatan historis, bukan temuan aktif.
9. **Sinkronisasi `ADR-005` mengikuti pola identik dengan `ADR-001` — bukti governance chain berfungsi konsisten.** Sembilan dokumen turunan diperbarui dalam satu siklus governance berurutan pada 28 Juli 2026, masing-masing mengutip ADR yang sama (`ADR-005`/`ADR-039`) dan tanggal yang sama — tidak ditemukan drift versi/tanggal antar dokumen. **Tidak ada perubahan pada hierarki governance atau Source of Truth Index** pada siklus tsb.
10. **Sinkronisasi `ADR-006` mengikuti pola identik dengan `ADR-001`/`ADR-005` untuk ketiga kalinya berturut-turut — pola sinkronisasi kini terbukti stabil dan berulang.** Sembilan dokumen turunan plus `document-governance-baseline-register.md` diperbarui **dalam satu siklus governance berurutan**, masing-masing mengutip ADR yang sama (`ADR-006`/`ADR-040`) dan tanggal yang sama (29 Jul 2026) — tidak ditemukan drift versi/tanggal antar dokumen. **Temuan teknis penting yang tercatat sebagai preseden governance:** opsi yang secara arsitektural bertentangan dengan ADR terdahulu (BullMQ+Redis vs model serverless `ADR-001`) wajib ditolak eksplisit dalam *Alternatives Considered*, bukan cukup "kalah bersaing".
11. **Sinkronisasi `ADR-008` memperkenalkan pola baru — Replaces/Replaced — yang belum pernah diuji pada tiga siklus sebelumnya.** Berbeda dari `ADR-001`/`ADR-005`/`ADR-006` yang murni OPEN→Approved, `ADR-008` **menggantikan** `ADR-028` (Google Maps Platform, sebelumnya berstatus Approved dengan caveat internal — secara substansi setara Open). `decision-log.md` mencatatnya sebagai entry baru `ADR-041` dengan field eksplisit **Replaces: `ADR-028`**, sementara `ADR-028` itu sendiri **hanya diubah status** menjadi `Replaced` tanpa mengedit isi aslinya. **Ini adalah validasi pertama bahwa mekanisme Change Management dokumen ini menangani kasus non-trivial dengan benar.** Satu gap tersisa yang dilaporkan apa adanya: `API-Specification-v1.1.md` §13/§9.1 **belum** disinkronkan redaksional terhadap keputusan final `ADR-008`.
12. **(Baru) Sinkronisasi `ADR-018` — ADR terakhir yang tersisa — kembali ke pola OPEN→Approved murni, bukan pola Replaces/Replaced.** Berbeda dari `ADR-008` (poin 11), `ADR-018` (Caching Strategy) tidak menggantikan keputusan Approved-dengan-caveat apa pun — ini adalah topik yang sebelumnya benar-benar belum pernah tercatat sebagai keputusan aktif di `decision-log.md` (dicatat sebagai entry baru `ADR-042` tanpa field Supersedes/Replaces). Sembilan dokumen turunan (`architecture-decision-records.md`, `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `PROJECT-CONSTITUTION.md`, `development-playbook.md`, `CURRENT-PROJECT-STATE.md`, `decision-log.md`, `CHANGELOG.md`) plus `document-governance-baseline-register.md` diperbarui **dalam satu siklus governance berurutan** pada 31 Juli 2026 — pola sinkronisasi sepuluh-dokumen kini terbukti stabil dan berulang **lima kali berturut-turut**, dengan dua varian mekanisme berbeda (OPEN→Approved murni untuk empat siklus; Replaces/Replaced untuk satu siklus) tervalidasi sama-sama berfungsi. **Dampak governance tertinggi dari siklus ini:** dengan resolusi `ADR-018`, **seluruh 25 ADR arsitektur/teknis proyek kini berstatus Approved** — untuk pertama kalinya sejak proyek dimulai, tidak ada satu pun ADR yang menahan implementasi modul apa pun karena alasan teknologi belum diputuskan. **Dua catatan kondisional dari Board (belum ditutup)**, diwariskan dari `ADR-018` itu sendiri: (a) struktur tabel final & algoritma sliding window presisi belum ditentukan, direkomendasikan diselesaikan bersamaan Sprint S1; (b) angka kriteria ambang migrasi belum divalidasi data traffic produksi nyata. **Satu gap tersisa** yang dilaporkan apa adanya: `API-Specification-v1.1.md` §0 (konvensi `429`/`Retry-After`) **belum** disinkronkan redaksional terhadap keputusan final `ADR-018`, menambah gap redaksional yang sudah tercatat untuk `ADR-008` (poin 11) di dokumen yang sama. **Rekomendasi:** karena tidak ada lagi ADR OPEN yang tersisa, prioritas governance berikutnya bergeser dari "menyelesaikan ADR" menjadi "menyelesaikan gap administratif" (OD-02, OD-06, OD-07) — Manifest berikutnya kemungkinan besar akan disusun sebagai respons terhadap resolusi salah satu dari ketiganya, bukan ADR baru. **Catatan penamaan berlanjut:** `AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md` masih merujuk file yang sama — konsolidasi nama tunggal **masih belum dieksekusi**, diteruskan sebagai rekomendasi terbuka untuk kelima kalinya.
13. **(Baru) Sinkronisasi 4 Agustus 2026 — resolusi OD-02, OD-06, OD-07, siklus governance administratif/data pertama (bukan ADR arsitektur).** Prediksi pada poin 12 di atas ("Manifest berikutnya kemungkinan besar dipicu oleh resolusi salah satu dari ketiga item administratif") **terbukti tepat** — ketiganya diselesaikan **sekaligus dalam satu siklus** oleh Business Owner, bukan satu per satu seperti diperkirakan. **Dua temuan tambahan** ditemukan saat audit dokumen untuk siklus ini (di luar cakupan permintaan OD-02/06/07, ditemukan karena menyentuh file yang sama — konsisten pola temuan tambahan pada siklus-siklus sebelumnya, lihat poin 4 siklus `ADR-026`/`027`/`028`): (a) `architecture-decision-records.md` memiliki **19 field Owner per-entry ADR** yang belum tersentuh sinkronisasi OD-06 sebelumnya (hanya header dokumen yang biasanya disinkronkan) — kini seluruhnya disinkronkan; (b) `PROJECT-CONSTITUTION.md` memiliki **2 referensi stale "25 dari 25 ADR"** yang seharusnya sudah dikoreksi ke 28/28 sejak siklus `ADR-026`/`027`/`028` (3 Agustus) namun terlewat — dikoreksi bersamaan pada siklus ini. **Dampak governance tertinggi:** OD-02/06/07 adalah persis kondisi #2/#5/#6 dari 6 "GO WITH CONDITIONS" CTO — dengan resolusi ini, **6 dari 6 kondisi kini terpenuhi untuk pertama kalinya sejak proyek dimulai**, menaikkan status proyek dari GO WITH CONDITIONS menjadi **GO** dan membuka Sprint S1 ke atas (bukan hanya Sprint S0). Enam dokumen (`SYSTEM-ARCHITECTURE.md`, `architecture-decision-records.md`, `technology-decisions.md`, `dependency-manifest.md`, `development-playbook.md`, `document-governance-baseline-register.md`) naik status Draft→Baseline sebagai konsekuensi langsung OD-06. **Cakupan sengaja dibatasi:** PRD/API Spec/User Flow/SEO Spec **tidak disentuh** (tidak ada dampak konten dari ketiga OD ini ke keempat dokumen tsb); hanya `ERD-Skema-Database.md` yang disentuh (soft-delete, v1.1→v1.2). Paket sinkronisasi Modul 12/13 tetap terpisah, belum dieksekusi.
14. **(Baru) Rekonsiliasi 10 Agustus 2026 — ditemukan bahwa Bagian 4, 6, 7, dan 8 dokumen ini tidak disinkronkan sejak siklus ~4-5 Agustus 2026, meninggalkan gap signifikan meski nomor versi manifest terus naik hingga v1.25.** Ditemukan lewat audit konsolidasi riwayat versi (permintaan terpisah dari siklus 13 Module Planning): **Bagian 4** (Current Baseline) masih mencantumkan `PRD.md` v1.1, `ERD-Skema-Database.md` v1.2, `API-Specification.md` v1.1 — padahal Baseline aktualnya sudah v1.3/v1.4/v1.3 sejak 8 Agustus; 3 dokumen yang sudah Baseline sejak 5 Agustus (Entity Mapping, Authorization Spec, Functional/UI/Technical Specification) tidak pernah tercatat sebagai baris tersendiri, salah satunya bahkan masih tertulis "Planned — belum ada file". **Bagian 6** (Architecture Decision Summary) belum mencantumkan `ADR-029` (29 ADR seharusnya, bukan 28). **Bagian 7** (Open Decision Summary) kehilangan **9 Open Decision** (OD-16 s.d. OD-24) yang sudah lama Resolved di `decision-log.md` sejak 6-7 Agustus namun tidak pernah ditambahkan sebagai baris di bagian ini — draft perbaikan untuk gap spesifik ini sebenarnya sudah pernah disusun (`P12-Rekonsiliasi-Penuh-ProjectManifest-v1.11.md`, ditujukan untuk menaikkan v1.10→v1.11 pada 8 Agustus), namun **tidak pernah benar-benar diterapkan** ke rantai dokumen yang sesungguhnya berlanjut ke v1.24/v1.25 — situasi yang persis diperingatkan `Engineering-Alignment-Framework-v1.0.md` §29.2 sebagai risiko residual proses manual (nomor versi naik tanpa isi ikut disinkronkan penuh). **Bagian 8** (Documentation Inventory) mewarisi seluruh gap yang sama dengan Bagian 4. Seluruh empat bagian direkonsiliasi penuh pada revisi ini (v1.26), bersumber dari `decision-log.md` (verifikasi silang OD-16 s.d. OD-25), `CURRENT-PROJECT-STATE.md` rev. 9, dan `document-governance-baseline-register.md` v1.9. **Yang sengaja TIDAK disentuh pada rekonsiliasi ini** (dicatat sebagai gap terbuka, bukan diabaikan diam-diam): Bagian 9 (Dependency Map, diagram ASCII) juga basi (masih menyebut `PROJECT-CONSTITUTION.md` v1.6 dan "25/25 ADR Approved") — tidak diperbaiki pada siklus ini karena berbentuk diagram naratif, bukan tabel data, dan berisiko rusak formatnya jika diedit sebagian; direkomendasikan direvisi utuh pada siklus governance berikutnya. **Rekomendasi proses:** jalankan audit drift-detection terhadap `project-manifest.md` secara berkala ke depannya — dokumen kontrol tertinggi ini ternyata sama rentannya terhadap drift seperti dokumen governance lain yang sudah pernah ditemukan masalah serupa (`architecture-decision-records.md`, `document-governance-baseline-register.md`).
15. **(Baru) Adopsi resmi 10 Agustus 2026 — `document-governance-baseline-register.md` v1.10 dan `CURRENT-PROJECT-STATE.md` rev. 9 dikonfirmasi Owner sebagai versi resmi berlaku**, menggantikan v1.9 dan rev. 8 yang sebelumnya berlaku di repositori. Kedua dokumen sudah lebih dulu disusun sebagai draf konsolidasi hasil audit terpisah (v1.10: sinkronisasi siklus OD-25/`ADR-047` yang sebelumnya tidak tercatat di Baseline Register manapun; rev. 9: pencatatan regresi `TASK-HOTFIX-20260806-001` dan siklus OD-25/audit konsolidasi 13 Module Planning) — keduanya sempat berstatus "draf, belum resmi" di Manifest v1.26 (poin 14 di atas) sampai Owner mengonfirmasi adopsi secara eksplisit. **Seluruh rujukan ke kedua dokumen di Bagian 4, 5, 8, 10, dan 19 diperbarui** dari "v1.9 (draf v1.10 tersedia)" menjadi "v1.10 (resmi)". **Tidak ada perubahan isi lain** pada siklus ini di luar konfirmasi status kedua dokumen tsb — Bagian 9 (Dependency Map) dan "PROJECT MANIFEST UPDATE SUMMARY" tetap belum direvisi (gap yang sama seperti dicatat poin 14, masih terbuka).
16. **(Baru) Penetapan resmi 11 Agustus 2026 — nama brand/produk final: RUMAHAGEN, dikonfirmasi langsung Owner.** Berbeda dari 15 poin sebelumnya (seluruhnya siklus ADR/audit versi/adopsi dokumen governance), poin ini murni keputusan **penamaan produk** — nama kerja generik "Platform Web Real Estate Agency"/"Real Estate Agency Platform" yang dipakai sejak dokumen pertama proyek ini disusun, dan yang secara eksplisit tercatat sebagai placeholder belum final (`{nama_platform}`) di `AI-CONTEXT-PACK.md` dan seluruh snapshot `CURRENT-PROJECT-STATE.md`, kini dikunci final oleh Owner sebagai **RUMAHAGEN**. Dicatat sebagai **OD-26** di `decision-log.md` §11 (RESOLVED tanggal yang sama, mengikuti pola bridging OD-02/OD-06/OD-25) dan sebagai **Governance Notes poin 39** di `document-governance-baseline-register.md` (naik v1.10→**v1.11** sebagai konsekuensi langsung). **Cakupan:** seluruh penyebutan nama produk (isi dokumen dan nama file) diganti di ±84 dokumen — termasuk 12 nama file berpola `{Jenis-Dokumen}-Real-Estate-Agency-Platform-v{X.Y}` menjadi `{Jenis-Dokumen}-RUMAHAGEN-v{X.Y}` (struktur/konvensi penamaan file **tidak berubah**). **Sengaja tidak diganti:** deskripsi kategori/vertikal bisnis "PropTech / Real Estate Agency SaaS" (`PROJECT-CONSTITUTION.md`, `AI-CONTEXT-PACK.md`) — mendeskripsikan jenis industri, bukan nama brand. **Tidak ada dampak arsitektur/skema/API** — keputusan administratif/branding murni, tidak memerlukan ADR baru. **Item tindak lanjut terbuka (belum dieksekusi siklus ini):** `CHANGELOG.md` belum dirilis versi PATCH baru untuk rename ini; rujukan nama produk di Bagian 4/5/8/19 dokumen ini (nama file dokumen lama) direkomendasikan disinkronkan pada siklus governance berikutnya — dicatat sebagai gap terbuka, bukan diperbaiki diam-diam.

---

# 17. Executive Summary

**Sejak Project Manifest versi sebelumnya (v1.3, 30 Juli 2026, disusun tepat setelah resolusi `ADR-008`), satu siklus Open Decision tambahan telah diselesaikan: `ADR-018` (Caching Strategy), disahkan Approved pada 31 Juli 2026 melalui sesi Architecture Review Board lanjutan — dan ini adalah ADR terakhir yang tersisa di seluruh proyek.**

Keputusan ini sebelumnya digantung pada hasil `ADR-006` (Job Queue) — jika BullMQ dipilih, Redis otomatis tersedia untuk kebutuhan rate limiting sekaligus. Karena `ADR-006` final tanpa Redis (Vercel Cron Jobs + Postgres Trigger/Database Webhook), `ADR-018` dievaluasi secara independen mengikuti pola native-first yang sama dengan `ADR-005`/`ADR-006`/`ADR-008`: **rate limiting & application-level cache Fase 1 diimplementasikan native di atas Supabase Postgres** — tabel dedicated `rate_limit_log` (pola sliding window), tanpa menambah infrastruktur cache/in-memory-store baru — dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). Berbeda dari `ADR-008` yang menggantikan keputusan lama (`ADR-028`), `ADR-018` kembali ke pola OPEN→Approved murni — topik ini belum pernah tercatat sebagai keputusan aktif sebelumnya.

Resolusi ini disinkronkan secara berantai ke sembilan dokumen turunan dalam satu siklus governance yang sama: `technology-decisions.md` (v1.4→v1.5), `SYSTEM-ARCHITECTURE.md` (v1.4→v1.5), `dependency-manifest.md` (v1.4→v1.5), `PROJECT-CONSTITUTION.md` (v1.5→v1.6), `development-playbook.md` (v1.4→v1.5), `CURRENT-PROJECT-STATE.md` (snapshot diperbarui), `decision-log.md` (entry `ADR-042` ditambahkan, tanpa Supersedes/Replaces), `CHANGELOG.md` (rilis baru `0.1.5`), dan `document-governance-baseline-register.md` (Baseline Register, Source of Truth Matrix, Governance Notes disinkronkan). Tidak satu pun dokumen tertinggal — pola yang identik dengan empat siklus sebelumnya, kini terbukti stabil dan berulang lima kali berturut-turut (lihat Governance Notes poin 12).

**Dampak langsung:** jumlah ADR berstatus Approved naik dari 24 menjadi **25 dari 25** (100%), **tidak ada lagi ADR OPEN** — turun dari 1 sebelumnya. Modul 1 (Authentication — login, register, forgot-password) dan lintas modul (submit form publik) — satu-satunya bagian yang masih memerlukan *configurable placeholder* di seluruh proyek pada Manifest versi sebelumnya — kini dapat dibangun **penuh tanpa placeholder**. Entry Criteria Architecture Alignment Phase tetap 5/6 terpenuhi (tidak berubah, karena Caching bukan salah satu dari 6 syarat resmi); Development Readiness kondisi CTO juga tetap 3/6 terpenuhi. Area Development Readiness "Architecture" kini **READY** penuh tanpa catatan residual — untuk pertama kalinya, tidak ada satu pun ADR OPEN yang membayangi area ini.

**Tidak ada perubahan fase proyek maupun status Overall pada siklus ADR-018 (31 Juli)** — saat itu tetap secara formal GO WITH CONDITIONS (tiga kondisi administratif masih terbuka: seed role, nama Owner, soft-delete); Risiko "Caching Strategy belum diputuskan" pada Manifest sebelumnya saat itu sepenuhnya resolved, namun rekonsiliasi seed role, nama Owner, dan soft-delete tetap belum tertutup pada saat itu.

> **(Baru) Update 4 Agustus 2026 — siklus resolusi OD-02/06/07:** Ketiga kondisi administratif yang tersisa pada narasi di atas (seed role, nama Owner, soft-delete) **telah diselesaikan seluruhnya** pada 4 Agustus 2026 — lihat Bagian 7 (Open Decision Summary) dan `decision-log.md` `ADR-046`/§11 untuk detail lengkap. **Dampak langsung:** status proyek naik dari 🟡 GO WITH CONDITIONS menjadi 🟢 **GO** (6 dari 6 kondisi CTO terpenuhi, naik dari 3/6); 5 dokumen (`SYSTEM-ARCHITECTURE.md`, `architecture-decision-records.md`, `technology-decisions.md`, `dependency-manifest.md`, `development-playbook.md`) naik status ke Baseline, ditambah `document-governance-baseline-register.md` sendiri (v1.0→v1.1); Entry Criteria Architecture Alignment Phase naik dari 5/6 menjadi **6/6**; Exit Criteria Foundation Phase naik dari 9/11 menjadi **11/11**. **Sprint S1 ke atas (backend/API/database) kini juga READY** — bukan hanya Sprint S0 seperti pada seluruh siklus sebelumnya. Satu-satunya gap redaksional yang masih tersisa (`API-Specification-v1.1.md` §0 dan §13/§9.1) **tidak disentuh siklus ini** — murni redaksional, tidak memblokir apa pun.

**Rekomendasi langkah berikutnya:** dengan **tidak ada lagi Open Decision arsitektur, teknis, maupun administratif** yang tersisa (hanya 2 item bisnis murni non-blocking: OD-11 monetisasi, OD-12 threshold DBR), fokus governance bergeser sepenuhnya ke **eksekusi**: (a) mulai Sprint S0 (Foundation Infrastructure); atau (b) eksekusi paket sinkronisasi PRD/API Spec/User Flow/SEO Spec untuk Modul 12/13. Siklus sinkronisasi Manifest berikutnya kemungkinan besar dipicu oleh salah satu dari kedua pilihan eksekusi tsb, atau oleh ADR/Open Decision baru yang belum ada saat ini.

---

# 18. AI Usage Instructions

AI Coding Assistant apa pun (Claude, ChatGPT, Bolt.new, Cursor, GitHub Copilot, dsb.) **wajib**:

1. **Membaca `project-manifest.md` ini terlebih dahulu**, sebelum dokumen proyek lain mana pun — gunakan Bagian 10 (AI Reading Order) sebagai urutan lanjutan.
2. **Menggunakan Source of Truth Index (Bagian 5)** untuk menentukan dokumen mana yang berwenang menjawab suatu pertanyaan — jangan mencampur informasi dari dua dokumen yang membahas topik sama tanpa mengecek prioritas.
3. **Mengikuti ADR** (`architecture-decision-records.md`) — **seluruh 25 ADR kini berstatus `Approved`** dan mengikat, tidak boleh dilanggar. **Tidak ada lagi ADR berstatus `Open`/`Proposed`** yang perlu dihindari saat ini — jika di masa depan muncul ADR baru berstatus Open, prinsip yang sama tetap berlaku: tidak boleh diasumsikan/dipilih sendiri oleh AI.
4. **Tidak menggunakan dokumen berstatus `Deprecated`/`Archived`** (mis. `AI-DEVELOPMENT-BLUEPRINT.md` versi Session 3, 32 bagian, sudah digantikan versi 24/26 bagian) sebagai rujukan keputusan.
5. **Selalu menggunakan versi Baseline/versi terbaru** yang tercatat di Bagian 4 & 8 — jika ditemukan duplikasi upload dokumen yang sama, versi dengan `Last Updated` paling akhir (atau bernomor versi lebih tinggi) yang berlaku, bukan diasumsikan identik.
6. **Untuk implementasi `/properties/search`/`/properties/autocomplete`, gunakan langsung PostgreSQL FTS + `pg_trgm`** (`ADR-005`, Approved) — tidak perlu lagi menandai `// TODO: menunggu resolusi ADR-005`. Jangan menginstal Typesense/Elasticsearch/Algolia secara preventif; migrasi Fase 2 hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
7. **Untuk implementasi proses asinkron/terjadwal (reminder, sitemap regeneration, counter sync), gunakan langsung Vercel Cron Jobs + Postgres Trigger/Database Webhook** (`ADR-006`, Approved) — tidak perlu lagi menandai `// TODO: menunggu resolusi ADR-006`. **Jangan pernah** menginstal BullMQ, Redis, atau worker process long-running apa pun untuk kebutuhan ini — ditolak permanen, tidak kompatibel dengan model serverless `ADR-001`. Migrasi Fase 2 ke QStash hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
8. **Untuk implementasi Maps/Geocoding (lokasi listing Modul 3, peta proyek developer Modul 6), gunakan langsung Leaflet + React-Leaflet dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider** (`ADR-008`, Approved, direvisi v3) — tidak perlu lagi menandai `// TODO: menunggu resolusi ADR-008`. Rendering peta **wajib** client-only (`next/dynamic` dengan `ssr: false`, atau `"use client"`). **Jangan pernah** menginstal Google Maps Platform/Mapbox secara preventif atau menyimpan `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` di client. Migrasi tahap Growth/Scale/Enterprise hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
9. **Untuk implementasi rate limiting endpoint sensitif (login, register, forgot-password, submit form publik — Modul 1 Authentication), gunakan langsung tabel `rate_limit_log` di Supabase Postgres** (`ADR-018`, Approved) — tidak perlu lagi menandai `// TODO: menunggu resolusi ADR-018`. Endpoint sensitif wajib mengembalikan `429 Too Many Requests` + header `Retry-After`. **Jangan pernah** menginstal Redis, Upstash, Vercel KV, atau in-memory-store eksternal apa pun secara preventif. Migrasi Fase 2 ke Upstash Redis hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
10. **Tidak mengambil keputusan arsitektur/bisnis baru secara sepihak** untuk item yang tercatat `OPEN` di Bagian 7 (Open Decision Summary — kini murni administratif/bisnis, bukan lagi teknis) — laporkan sebagai temuan, tunggu keputusan resmi dengan keterlibatan manusia berwenang.
11. **Tidak menulis kode backend/API produksi** sebelum memverifikasi status Open Decision terkait modul yang disentuh (lihat Bagian 6, 7 & 11) — Sprint S0 scaffolding murni terkecuali.
12. **Melaporkan, bukan memperbaiki sendiri**, setiap pertentangan baru antar dokumen yang ditemukan — catat sebagai Governance Note (pola Bagian 16), konsisten dengan `document-governance-baseline-register.md` §13 poin 6.

---

# 19. Quick Navigation

| Saya butuh... | Buka dokumen |
|---|---|
| Memahami proyek secara umum / konteks singkat | `AI-CONTEXT-PACK.md` §1–2 + `PRD` §1 |
| Aturan tetap tertinggi (role, security, tech stack) | `PROJECT-CONSTITUTION.md` (v1.9) |
| Alasan **mengapa** sebuah keputusan teknis diambil (per topik) | `architecture-decision-records.md` (29 ADR) |
| Riwayat **seluruh** keputusan proyek (kronologis) | `decision-log.md` |
| Requirement bisnis / acceptance criteria per modul | `PRD-RUMAHAGEN-v1.3-FINAL.md` |
| Entity ID Registry | `Entity-Mapping-RUMAHAGEN-v1.0.md` |
| Struktur tabel database & relasi | `ERD-Skema-Database-...v1.4-FINAL.md` + Diagram |
| Kontrak endpoint API | `API-Specification-...v1.3-FINAL-FIXED.md` |
| Alur layar/interaksi per role | `User-Flow-...v1.2.md` |
| Role Matrix / Permission Matrix | `Authorization-Access-Control-Specification-v1.1-FINAL.md` |
| Screen Inventory / wireframe / konsolidasi teknis | `Functional-Specification.md` / `UI-Specification.md` / `Technical-Specification.md` |
| Strategi SEO/rendering/analytics | `SEO-Analytics-Specification-...v1.1.md` |
| Stack teknologi resmi & alasan pemilihan | `technology-decisions.md` (v1.6) |
| Daftar package yang boleh di-install | `dependency-manifest.md` (v1.6) |
| Arsitektur teknis end-to-end | `SYSTEM-ARCHITECTURE.md` (v1.6) |
| Cara AI Coding Assistant bekerja hari-hari | `development-playbook.md` (v1.6) |
| Urutan & isi sprint | `DEVELOPMENT-ROADMAP.md` |
| Format standar sebuah task | `TASK-TEMPLATE.md` |
| Status implementasi kode **saat ini** | `CURRENT-PROJECT-STATE.md` (rev. 9) |
| Riwayat rilis/perubahan versi | `CHANGELOG.md` (rilis `0.7.20`) |
| Status/versi/ownership dokumen mana pun | `document-governance-baseline-register.md` (v1.10) |
| Hasil audit kesiapan fondasi & skor | `foundation-validation-report.md` |
| Keputusan resmi CTO soal kelanjutan fase | `executive-architecture-review.md` |
| Apa yang berubah saat ADR-001 disinkronkan | `synchronization-report-adr-001.md` |
| **Indeks semua dokumen & status proyek** | **`project-manifest.md` (dokumen ini)** |

---

*Project Manifest ini adalah dokumen kontrol tertinggi seluruh dokumentasi proyek — bukan pengganti isi teknis dokumen mana pun (lihat Bagian 5, Source of Truth Index), melainkan indeks dan status agregat di atasnya. Wajib ditinjau ulang setiap kali Baseline, Open Decision, atau Phase proyek berubah material — konsisten dengan prinsip Software Configuration Management, Enterprise Architecture, dan Project Governance yang mendasari penyusunannya. Tidak ada isi dokumen sumber proyek lain yang diubah dalam penyusunan Manifest ini. **Versi 1.26 (10 Agustus 2026)** merekonsiliasi Bagian 4, 5, 6, 7, 8, 10, dan 19 yang ternyata tertinggal sinkronisasi sejak ~31 Juli/4 Agustus 2026 meski nomor versi dokumen terus naik hingga v1.25 — lihat Governance Notes poin 14 untuk detail penuh. Bagian "PROJECT MANIFEST UPDATE SUMMARY" di bawah **tidak diperbarui pada siklus ini** — masih mencerminkan siklus v1.6 (4 Agustus), dipertahankan sebagai riwayat, bukan status terkini (lihat Governance Notes poin 14 untuk gap yang sama). Lihat Bagian 17 (Executive Summary) untuk ringkasan lengkap perubahan siklus 4 Agustus, dan Riwayat Versi di Bagian 1 untuk ringkasan seluruh siklus.*

---

# PROJECT MANIFEST UPDATE SUMMARY

| Item | Detail |
|---|---|
| **Dokumen yang berubah sejak versi sebelumnya** | `decision-log.md` (+entry `ADR-046`, +baris `OD-02`/`OD-06`/`OD-07` di §11), `project-manifest.md` (1.5→1.6 — dokumen ini), `document-governance-baseline-register.md` (1.0→1.1, naik Baseline), `PROJECT-CONSTITUTION.md` (1.7→1.8), `ERD-Skema-Database-...v1.1.md` (1.1→1.2), `SYSTEM-ARCHITECTURE.md` (naik Baseline, versi tetap 1.6), `architecture-decision-records.md` (naik Baseline; ADR-004 Notes diperbarui), `technology-decisions.md` (naik Baseline, versi tetap 1.6), `dependency-manifest.md` (naik Baseline, versi tetap 1.6), `development-playbook.md` (naik Baseline, versi tetap 1.6), `CURRENT-PROJECT-STATE.md` (snapshot — Readiness Snapshot 6/6), `CHANGELOG.md` (0.2.0→0.2.1) — **11 dokumen** |
| **Open Decision yang telah diselesaikan** | OD-02 — Jumlah seed role final (7, Guest bukan baris `roles`), keputusan langsung Business Owner, 4 Agu 2026. OD-06 — Kepemilikan dokumen governance, seluruh Owner → Mujtahid Aktanto (Solo Project Owner, AI-Assisted), 4 Agu 2026. OD-07 — Kebijakan soft-delete seragam, diperluas ke 8 tabel via `ADR-046`, 4 Agu 2026. Ketiganya adalah kondisi #2/#5/#6 dari 6 "GO WITH CONDITIONS" CTO — **kini 6 dari 6 terpenuhi** |
| **Baseline terbaru yang aktif** | `PROJECT-CONSTITUTION.md` v1.8, `CHANGELOG.md` rilis `0.2.1`, plus **5 dokumen baru naik Baseline**: `SYSTEM-ARCHITECTURE.md` v1.6, `architecture-decision-records.md` v1.0, `technology-decisions.md` v1.6, `dependency-manifest.md` v1.6, `development-playbook.md` v1.6, serta `document-governance-baseline-register.md` v1.1 (naik dari Draft) — ditambah 5 Baseline living document yang sudah ada sebelumnya (`PRD` v1.1, `TASK-TEMPLATE.md` v1.0, `decision-log.md` v1.0, `CURRENT-PROJECT-STATE.md` v0.1, `foundation-validation-report.md` v1.0) — **naik dari 7 menjadi 12 dokumen Baseline** |
| **Jumlah dokumen governance aktif** | **22 dokumen** tercatat di Documentation Inventory (Bagian 8), tidak bertambah/berkurang pada siklus ini (dokumen proposal `Architecture-Evolution-Proposal-...v0.9.md` masih belum masuk Inventory formal — tetap direkomendasikan untuk siklus berikutnya) |
| **Jumlah ADR aktif** | **28 dari 28 Approved/Approved With Notes (100%)**, tidak berubah — ditambah **`ADR-046`** (perluasan soft-delete, dicatat di `decision-log.md`, bukan entry baru di `architecture-decision-records.md` seri utama karena sifatnya administratif/data, bukan keputusan arsitektur baru), **0 OPEN** |
| **Jumlah Open Decision yang masih tersisa** | **2 dari 15 item** (turun tajam dari 5) — **tidak ada lagi item berprioritas Tinggi atau Sedang**; 1 Sebagian (OD-09, administratif-rendah), 2 Rendah murni bisnis (OD-11 monetisasi, OD-12 threshold DBR) — **tidak ada lagi item Open Decision berkategori teknis, arsitektur, maupun administratif** |
| **Rekomendasi langkah berikutnya** | **Tidak ada lagi kondisi CTO atau Open Decision administratif yang memblokir Sprint S0 maupun S1+.** Prioritas berikutnya murni pilihan eksekusi: (a) mulai Sprint S0 (Foundation Infrastructure); atau (b) eksekusi paket sinkronisasi `PRD.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` untuk Modul 12/13 (Organization & AI Assistant) — `ERD-Skema-Database.md` sudah v1.2 namun **belum** mencakup skema Modul 12/13 itu sendiri, hanya soft-delete. Sebagai tindak lanjut administratif (bukan Open Decision baru, tidak memblokir apa pun): sinkronkan redaksional `API-Specification-v1.1.md` §13/§9.1 (Maps) dan §0 (429/Retry-After); tambahkan `Architecture-Evolution-Proposal-...v0.9.md` ke Documentation Inventory formal (Bagian 8); tuntaskan OD-09 (Resend/Sentry redaksional). |

---

# CROSS-AEP GLOBAL SYNCHRONIZATION ADDENDUM — D0 + D1
**Synchronization step:** STEP 04 | **Effective:** 16 August 2026

## Current architecture-evolution state
The previous baseline statements that described the project as having no remaining architecture evolution decisions are **historical baseline statements** and must not be interpreted as overriding the later approved MADCR/AEP synchronization stream.

Current controlled state:

- AEP #1 Commercial/Payment: **Conditionally Complete** with OPEN-C01 and MBR-COM-001–013 evidence/provenance residuals.
- AEP #2 Learning Economy: **Pass with controlled residuals**; MADCR-049 remains open/re-evaluation.
- AEP #3 Title/Awarding: **Controlled per-AEP synchronization complete**; OD-02…05 remain downstream.
- AEP #4 Learning Session: **Pass — complete with controlled residuals**; MADCR-053/054 and OD-08 remain controlled residuals.
- Cross-AEP Step 01: **PASS**.
- Cross-AEP Step 02: **PASS**.
- Cross-AEP Step 03: **PASS — pre-edit gate ready**.
- Cross-AEP Step 04 D0 + D1: **COMPLETED — semantic baseline synchronization only**.
- Global physical ERD/API/RBAC/Schema/Migration synchronization: **NOT YET COMPLETE**.
- Application implementation: **NOT AUTHORIZED by this step**.

## Current recommendation
Proceed to the next controlled downstream synchronization cluster only after the Step 04 post-edit reconciliation is accepted. Do not infer closure of any residual from the existence of this addendum.
