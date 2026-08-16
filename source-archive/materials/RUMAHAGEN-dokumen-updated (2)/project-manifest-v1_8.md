# PROJECT MANIFEST
## Platform Web RUMAHAGEN — Control Center Dokumentasi Proyek

> **Dokumen ini BUKAN** Project Overview, Changelog, Current Project State, atau Baseline Register — dokumen-dokumen tersebut tetap ada dan tetap otoritatif di areanya masing-masing (lihat Bagian 5). Project Manifest adalah **indeks resmi tunggal** di atas seluruhnya: titik masuk pertama yang wajib dibaca **sebelum** dokumen lain mana pun dibuka, oleh AI Coding Assistant (Claude, ChatGPT, Bolt.new, Cursor, GitHub Copilot) maupun kontributor manusia (Developer, QA, Technical Lead).

**Disusun dalam kapasitas gabungan:** Chief Technology Officer · Enterprise Software Architect · Software Configuration Manager · Technical Documentation Architect · Enterprise Project Governance Specialist · AI Development Workflow Architect

**Disusun berdasarkan:** seluruh dokumen governance terbaru yang tersedia — `architecture-decision-records.md` (Baseline, v1.1, 28 ADR + `ADR-046`), `technology-decisions.md` (Baseline, v1.6), `SYSTEM-ARCHITECTURE.md` (Baseline, v1.6), `dependency-manifest.md` (Baseline, v1.6), `PROJECT-CONSTITUTION.md` (Baseline, v1.8), `development-playbook.md`/`AI-DEVELOPMENT-BLUEPRINT.md` (Baseline, v1.6), `CURRENT-PROJECT-STATE.md`, `decision-log.md` (46 entry), `CHANGELOG.md` (rilis **`0.3.0`** — naik dari `0.2.2`), dan `document-governance-baseline-register.md` (Baseline, **v1.2** — diperbarui 5 Agustus 2026). **Siklus 5 Agustus 2026 (Engineering Alignment):** `PRD.md` (v1.1→**v1.2**), `ERD-Skema-Database.md` (v1.2→**v1.3**, kini termasuk Database Schema fisik), `User-Flow.md` (v1.1→**v1.2**), `API-Specification.md` (v1.1→**v1.2**) — seluruhnya disinkronkan penuh ke skema ID EAF dan mencakup Modul 12/13; 2 dokumen baru (`Entity-Mapping.md` v1.0, `Authorization-Access-Control-Specification.md` v1.0, keduanya **Draft**, menunggu pengesahan Owner). Dokumen pendukung yang tidak direvisi pada siklus ini: `SEO-Analytics-Specification.md` (tetap v1.1), `AI-CONTEXT-PACK.md`, `DEVELOPMENT-ROADMAP.md`, `TASK-TEMPLATE.md`, `foundation-validation-report.md`, `executive-architecture-review.md`, `synchronization-report-adr-001.md`.

**Jika terjadi konflik antar dokumen:** `architecture-decision-records.md` (ADR berstatus **Approved**) selalu menjadi keputusan tertinggi — lihat Bagian 5 (Source of Truth Index).

**Tidak ada dokumen sumber yang diubah dalam penyusunan Manifest ini.** Pertentangan yang ditemukan dicatat sebagai Governance Notes (Bagian 16), bukan diselesaikan sepihak.

---

# 1. Project Information

| Field | Value |
|---|---|
| **Project Name** | Platform Web RUMAHAGEN (SaaS — Mujtahid Aktanto) |
| **Version** | Rilis proyek **`0.3.0`** (`CHANGELOG.md`) · `PROJECT-CONSTITUTION.md` **v1.8** · `architecture-decision-records.md` **v1.1** · `technology-decisions.md`/`SYSTEM-ARCHITECTURE.md`/`dependency-manifest.md`/`development-playbook.md` **v1.6** · `PRD.md` **v1.2** · `Entity-Mapping.md` **v1.0 (baru, Draft)** · `ERD-Skema-Database.md` **v1.3** (kini termasuk Database Schema fisik Bagian 2A) · `User-Flow.md` **v1.2** · `API-Specification.md` **v1.2** · `Authorization-Access-Control-Specification.md` **v1.0 (baru, Draft)** · `document-governance-baseline-register.md` **v1.2** · Manifest ini sendiri **v1.8** |
| **Current Phase** | **Foundation Phase — selesai penuh (11/11 Exit Criteria)**, **Architecture Alignment Phase (Entry Criteria 6/6 terpenuhi)** berjalan penuh (Keputusan CTO: **GO WITH CONDITIONS**, `executive-architecture-review.md`, 27 Jul 2026 — snapshot point-in-time; **6 dari 6 kondisi CTO kini terpenuhi** per 4 Agustus 2026, lihat Bagian 3 & `CURRENT-PROJECT-STATE.md`) |
| **Overall Status** | 🟢 **GO — seluruh kondisi CTO terpenuhi** (naik dari 🟡 GO WITH CONDITIONS), lihat Bagian 3 & 7 |
| **Repository** | **Belum ada** — implementasi kode 0%, monorepo belum diinisialisasi, Sprint S0 (Foundation Infrastructure) belum dieksekusi (`CURRENT-PROJECT-STATE.md`) |
| **Last Updated** | 5 Agustus 2026 — siklus **Engineering Alignment**: retrofit skema ID EAF (`REQ-`/`ENT-`/`PERM-`) + Modul 12/13 dieksekusi penuh ke `PRD.md` (v1.1→v1.2), `ERD-Skema-Database.md` (v1.2→v1.3, Database Schema fisik digabung), `User-Flow.md` (v1.1→v1.2), `API-Specification.md` (v1.1→v1.2, sekaligus koreksi sinkronisasi `ADR-005`/`ADR-008`); 2 dokumen baru dibuat (`Entity-Mapping.md` v1.0, `Authorization-Access-Control-Specification.md` v1.0, keduanya Draft) — menuntaskan paket yang ditunda sejak `0.2.0` (3 Agustus). *(Riwayat: 4 Agustus 2026 — resolusi OD-02/OD-06/OD-07, 6 dari 6 kondisi GO WITH CONDITIONS CTO terpenuhi, 5 dokumen naik status ke Baseline.)* |

---

# 2. Executive Dashboard

| Dimensi | Indikator | Ringkasan |
|---|---|---|
| **Project Health** | 🟢 | 0 temuan Critical di seluruh audit; **tidak ada lagi keputusan arsitektur, administratif, maupun data yang benar-benar OPEN** — seed role (OD-02), kepemilikan dokumen (OD-06), dan kebijakan soft-delete (OD-07) seluruhnya diselesaikan 4 Agustus 2026. **Tidak ada lagi risiko High tersisa di seluruh proyek** (sebelumnya: rekonsiliasi seed role). |
| **Current Milestone** | 🟢 | Sprint S0 (Foundation Infrastructure) — **siap dimulai, belum dieksekusi**. Tidak ada blocker untuk S0, dan kini **juga tidak ada blocker untuk Sprint S1+** (backend/API/database) — lihat Development Readiness di bawah. |
| **Current Phase** | 🟢 | Foundation Phase **selesai penuh** (11/11 exit criteria, naik dari 10/11 — item #11 "kepemilikan dokumen individu bernama" kini terpenuhi via OD-06) → Architecture Alignment Phase (Penuh) kini **6/6 Entry Criteria terpenuhi** (naik dari 5/6) — tidak ada lagi syarat tertunda untuk fase ini. Technical Specification & Module Planning S1+ **tidak lagi menunggu kondisi CTO apa pun** — hanya menunggu keputusan bisnis murni non-blocking (OD-11, OD-12) jika relevan ke modul yang disentuh. |
| **Architecture Status** | 🟢 | **28 dari 28 ADR Approved/Approved With Notes (100%)**, ditambah **`ADR-046`** (perluasan soft-delete, bukan ADR arsitektur baru bernomor seri utama — dicatat di `decision-log.md`). Tidak ada lagi ADR OPEN di seluruh proyek. |
| **Documentation Status** | 🟢 | Skor kesiapan fondasi **79/100** (`foundation-validation-report.md`, snapshot 27 Jul — belum menghitung dampak positif ADR-005/006/008/018/026-028/046) — **READY WITH MINOR REVISIONS**. 22 dokumen governance/desain tersedia, 0 pasangan dokumen berstatus Major/Critical Conflict. |
| **Baseline Status** | 🟢 | **12 dari ±22 dokumen** berstatus **Baseline** terkunci — naik dari 7: `PROJECT-CONSTITUTION.md` v1.8, `PRD`, `TASK-TEMPLATE.md`, `decision-log.md`, `CHANGELOG.md` 0.2.2, `CURRENT-PROJECT-STATE.md`, `foundation-validation-report.md`, ditambah **5 dokumen naik Baseline 4 Agustus 2026**: `SYSTEM-ARCHITECTURE.md`, `architecture-decision-records.md`, `technology-decisions.md`, `dependency-manifest.md`, `development-playbook.md`, serta `document-governance-baseline-register.md` itu sendiri (v1.0→v1.1). **`architecture-decision-records.md` isinya dikonsolidasi 5 Agustus 2026** (v1.0→v1.1, tanpa mengubah status Baseline-nya — murni perbaikan integritas dokumentasi). Sisanya (dokumen sumber bisnis/data v1.1 & AI-CONTEXT-PACK/DEVELOPMENT-ROADMAP) tetap `Approved`/`Draft`, kini murni menunggu Module/Database Schema Alignment — **bukan lagi Open Decision administratif apa pun**. |
| **Development Readiness** | 🟢 | Sprint S0 (scaffolding murni) **READY**. Sprint S1 ke atas (menyentuh backend/API/database) **kini juga READY** — **6 dari 6 kondisi CTO terpenuhi** (naik dari 3/6): ADR-001, ADR-005, ADR-006 (sebelumnya), ditambah seed role/OD-02, soft-delete/OD-07, dan nama individu/OD-06 (4 Agustus 2026). **Tidak ada lagi blocker eksplisit apa pun terhadap Sprint S1+.** |
| **AI Readiness** | 🟢 | Dinilai **Excellent** oleh CTO — `AI-CONTEXT-PACK.md`, `development-playbook.md` v1.6 (kini Baseline), `TASK-TEMPLATE.md`, dan `architecture-decision-records.md` (kini Baseline) memberi gerbang keputusan eksplisit bagi AI Coding Assistant. Tidak ada satu pun Golden Rule yang masih menahan area arsitektur/teknis di balik gerbang `// TODO: menunggu resolusi ADR-XXX`, dan kini juga tidak ada gerbang administratif (seed role/soft-delete) yang tersisa. |
| **Governance Health** | 🟢 | Sinkronisasi berantai resolusi **OD-02/06/07** → `decision-log.md` (`ADR-046`), `project-manifest.md`, `CURRENT-PROJECT-STATE.md`, `PROJECT-CONSTITUTION.md`, `ERD-Skema-Database.md`, `document-governance-baseline-register.md`, dan promosi Baseline 5 dokumen dieksekusi **dalam satu siklus governance**, tidak ada dokumen yang tertinggal. **Ini adalah siklus pertama yang murni menyelesaikan Open Decision administratif/data** (bukan ADR arsitektur baru maupun proposal eksternal) — gap governance lama (rekonsiliasi seed role, nama Owner, soft-delete) yang tercatat sejak siklus-siklus awal proyek **kini sepenuhnya tertutup**. |

---

# 3. Current Phase

## Phase Sekarang
**Foundation Phase (selesai penuh) → Architecture Alignment Phase (penuh, 6/6 Entry Criteria terpenuhi — GO, seluruh kondisi CTO terpenuhi)** — keputusan resmi `executive-architecture-review.md`, 27 Juli 2026, status kondisi diperbarui 4 Agustus 2026. Seluruh aktivitas proyek sejauh ini adalah produksi dokumentasi governance & desain; implementasi kode tetap 0% (`CURRENT-PROJECT-STATE.md`). Resolusi **OD-02/06/07** pada siklus ini **tidak mengubah nama fase** (masih Architecture Alignment Phase, belum Sprint S0 dieksekusi), namun **mengubah status kesiapannya dari "dengan syarat" menjadi "tanpa syarat tersisa"** — berbeda dari resolusi ADR-005/006/008/018 sebelumnya yang murni memperkuat fase tanpa mengubah readiness Sprint S1+, resolusi OD-02/06/07 **menghapus 3 kondisi CTO terakhir yang tersisa**, membuka Sprint S1 ke atas untuk pertama kalinya sejak proyek dimulai.

## Phase Sebelumnya
**Requirements & Design Documentation** — penyusunan `PROJECT-CONSTITUTION.md`, `PRD`, `ERD`, `API Specification`, `User Flow`, `SEO & Analytics Specification` (resolusi 7 konflik v1.0→v1.1), `SYSTEM-ARCHITECTURE.md`, `technology-decisions.md`, `dependency-manifest.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, `AI-CONTEXT-PACK.md`, `DEVELOPMENT-ROADMAP.md`, `TASK-TEMPLATE.md`, diikuti **tujuh siklus** Architecture Review Board/resolusi governance (`ADR-001` 27 Jul, `ADR-005` 28 Jul, `ADR-006` 29 Jul, `ADR-008` 30 Jul, `ADR-018` 31 Jul, `ADR-026`–`028` 3 Agu, `ADR-046`+OD-02/06 4 Agu).

## Phase Berikutnya
**Sprint S0 execution** (Foundation Infrastructure — tidak ada blocker tersisa) → **Sprint S1 ke atas** (Authentication dst. — **kini juga tidak ada blocker CTO tersisa**, lihat Bagian 2 Development Readiness) berjalan sejalan dengan penyelesaian paralel: Database Schema Alignment (kini termasuk kolom `search_vector`/`pg_trgm` dari `ADR-005`, trigger counter sync/`job_execution_log` dari `ADR-006`, `geocode_cache`/`api_rate_limits` dari `ADR-008`, `rate_limit_log` dari `ADR-018`, dan **8 tabel bersoft-delete** dari `ADR-046`), API Alignment (termasuk sinkronisasi redaksional §13/§9.1 terhadap keputusan Maps dan §0 terhadap konvensi `429`/`Retry-After` dari Caching Strategy), User Flow Alignment, PRD Alignment (closing-the-loop), serta **paket sinkronisasi terpisah** PRD/API Spec/User Flow/SEO Spec untuk Modul 12/13 (Organization & AI Assistant) yang tetap menunggu instruksi eksplisit terpisah.

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
| PROJECT-CONSTITUTION.md | **1.8** | ✅ 1.8 | Baseline (BERLAKU) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| PRD-RUMAHAGEN-v1.1.md | 1.1 | ✅ 1.1 | Baseline (Disetujui) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 |
| ERD-Skema-Database-...v1.1.md + Diagram | **1.2** | Kandidat 1.2 | Approved (belum Baseline formal) — target bertambah kolom `search_vector`/`pg_trgm` (`ADR-005`), trigger counter sync/`job_execution_log` (`ADR-006`), `geocode_cache`/`api_rate_limits` (`ADR-008`), `rate_limit_log` (`ADR-018`); **soft-delete diperluas ke 8 tabel & klarifikasi Guest (`ADR-046`/OD-02, v1.1→v1.2)** | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| API-Specification-...v1.1.md | 1.1 | Kandidat 1.1 | Approved (belum Baseline formal) — mesin `/properties/search`, proses asinkron, integrasi Maps, dan mekanisme rate limiting kini seluruhnya terkunci, namun §13/§9.1 (Maps) dan §0 (429/Retry-After) **belum** disinkronkan redaksional | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 |
| User-Flow-...v1.1.md | 1.1 | Kandidat 1.1 | Approved | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 |
| SEO-Analytics-Specification-...v1.1.md | 1.1 | Kandidat 1.1 | Approved | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 |
| SYSTEM-ARCHITECTURE.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| architecture-decision-records.md | **1.1** | ✅ 1.1 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06); **konsolidasi 9 file snapshot + perbaikan tuntas regresi ADR-005/006, 5 Agu 2026**; **28 ADR + `ADR-046`** entry-level Approved/Approved With Notes | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 |
| technology-decisions.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| dependency-manifest.md | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| development-playbook.md (AI-DEVELOPMENT-BLUEPRINT.md) | **1.6** | ✅ 1.6 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| AI-CONTEXT-PACK.md | 1.0 | Kandidat 1.0 | Approved | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| DEVELOPMENT-ROADMAP.md | 1.0 | Belum ada | Draft (substansi matang) — blocker bukan hanya nama individu, tetap menunggu pengesahan formal tim/proses | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| TASK-TEMPLATE.md | 1.0 | ✅ 1.0 | Baseline (BERLAKU) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 |
| decision-log.md | 1.0 | 1.0 (per-ADR, berkembang — 46 entry) | Baseline (Living Document) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (entry `ADR-046`) |
| CHANGELOG.md | **0.2.1** | 0.2.1 | Baseline (Living Document) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| CURRENT-PROJECT-STATE.md | 0.1 | 0.1 (per-sesi) | Baseline (Living Document) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| document-governance-baseline-register.md | **1.1** | ✅ 1.1 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 |
| foundation-validation-report.md | 1.0 | ✅ 1.0 | Baseline (Final — Quality Gate Deliverable) | AI Audit Panel | 27 Jul 2026 (snapshot, belum menghitung `ADR-005`/`ADR-006`/`ADR-008`/`ADR-018`/`ADR-026`–`028`/`ADR-046`) |
| executive-architecture-review.md | — (Keputusan CTO) | — | Final — Keputusan Resmi (setara otoritas Constitution untuk kelanjutan fase) | CTO | 27 Jul 2026 (snapshot point-in-time — **6 dari 6 kondisi kini terpenuhi**, lihat `CURRENT-PROJECT-STATE.md`) |
| synchronization-report-adr-001.md | — (Artefak SCM) | — | Final — laporan sinkronisasi (point-in-time, hanya mencakup `ADR-001`) | CTO/SCM | 27 Jul 2026 |
| Database Schema (fisik) | — | — | **Planned** — belum ada (0% kode) | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | — |
| Functional / UI / Technical Specification | — | — | **Planned** — belum ada file | — | — |

---

# 5. Source of Truth Index

| Area | Official Document | Priority |
|---|---|---|
| Governance Tertinggi / Engineering Guidelines | `PROJECT-CONSTITUTION.md` (v1.6) | **1 — Mengalahkan seluruh dokumen lain** |
| Business Requirement | `PRD-RUMAHAGEN-v1.1.md` | 2 |
| Arsitektur & Keputusan Teknis per Topik (ADR) | `architecture-decision-records.md` | 3 — dibaca **sebelum** Technology Decisions; **selalu menang jika ada konflik** |
| Architecture (High-Level) | `SYSTEM-ARCHITECTURE.md` (v1.5) | 4 |
| Technology Stack & Rasionalisasi | `technology-decisions.md` (v1.5) | 5 |
| Dependency/Package Katalog | `dependency-manifest.md` (v1.5) | 6 |
| Database (Logis/ERD) | `ERD-Skema-Database-...v1.1.md` + Diagram | 7 |
| Database (Fisik/Migration) | **TBD** — migration file aktual setelah Sprint S0 | 7 (menyusul) |
| API Contract | `API-Specification-...v1.1.md` | 8 |
| User Interaction Flow | `User-Flow-...v1.1.md` | 9 |
| SEO & Analytics Strategy | `SEO-Analytics-Specification-...v1.1.md` | 9 |
| Keputusan — Jurnal Kronologis Lintas Proyek | `decision-log.md` (42 entry) | 10 |
| AI Instruction / Development Playbook | `development-playbook.md` (AI-DEVELOPMENT-BLUEPRINT.md, v1.5) | 11 |
| Context Ringkas Proyek | `AI-CONTEXT-PACK.md` §1–2 + `PRD` §1 | 12 |
| Roadmap & Sprint Plan | `DEVELOPMENT-ROADMAP.md` | 13 |
| Format/Unit Kerja Task | `TASK-TEMPLATE.md` | 14 |
| Riwayat Perubahan (Rilis) | `CHANGELOG.md` (rilis `0.1.5`) | 15 (riwayat, bukan keputusan) |
| Status Implementasi Nyata (Living) | `CURRENT-PROJECT-STATE.md` | — **wajib dibaca tiap sesi** |
| Validasi Kesiapan Fondasi | `foundation-validation-report.md` | — Quality Gate |
| Keputusan Eksekutif Kelanjutan Fase | `executive-architecture-review.md` | — Setara Constitution untuk urusan proses/fase |
| Tata Kelola Dokumen Itu Sendiri | `document-governance-baseline-register.md` | — |
| **Indeks & Kontrol Seluruh Dokumentasi** | **`project-manifest.md` (dokumen ini)** | **0 — dibaca sebelum semuanya** |

> **Validasi referensi silang:** Tidak ditemukan dokumen baru maupun perubahan nama dokumen pada siklus ini — seluruh 21 entri di atas (di luar Manifest ini sendiri) tetap merujuk nama file yang sama seperti Manifest versi sebelumnya. Perubahan hanya pada **nomor versi** yang dirujuk (lihat Bagian 14). **Catatan penamaan (diwariskan dari sesi sebelumnya):** `AI-DEVELOPMENT-BLUEPRINT.md` kini juga dirujuk sebagai `development-playbook.md` di dokumen-dokumen terbaru — keduanya merujuk file yang sama, bukan dua dokumen terpisah. **Catatan tambahan (diwariskan):** "Engineering Guidelines" yang disebut sebagai jenis dokumen terpisah pada beberapa permintaan penyusunan tidak eksis sebagai file mandiri — perannya dipenuhi oleh `PROJECT-CONSTITUTION.md` (lihat baris pertama tabel ini).

---

# 6. Architecture Decision Summary

> Ringkasan seluruh **28 ADR** di `architecture-decision-records.md` per 3 Agustus 2026 (seri utama, tidak berubah pada siklus 4 Agustus). **Impact Level** dinilai berdasarkan cakupan dampak lintas modul/dokumen (Critical = mengubah fondasi seluruh sistem, High = memengaruhi banyak modul/keputusan turunan, Medium = memengaruhi satu domain, Low = dampak terbatas/administratif). **Catatan tambahan (4 Agustus 2026):** `decision-log.md` mencatat **`ADR-046`** (Perluasan Kebijakan Soft-Delete, resolusi OD-07) sebagai entry administratif/data — bukan bagian dari seri penomoran utama `architecture-decision-records.md`, mengikuti pola yang sama dengan `ADR-004` yang diperluas cakupannya tanpa entry baru di dokumen tsb.

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

**Ringkasan status:** **28 Approved/Approved With Notes (100%)**, **0 OPEN** — naik dari 25 Approved pada Manifest versi sebelumnya. **Ini adalah siklus pertama yang menambah ADR baru (bukan menyelesaikan ADR OPEN yang sudah ada) sejak proyek dimulai** — ADR-026/027/028 lahir dari proposal evolusi arsitektur eksternal, bukan Open Decision internal yang sudah tercatat. Tidak ada urutan penyelesaian tersisa untuk dilaporkan di Bagian 8 (`architecture-decision-records.md`) — bagian tsb kini kosong, dipertahankan sebagai struktur baku untuk ADR baru di masa depan.

### Detail ADR Terbaru — ADR-026, ADR-027, ADR-028 (Organization Management System & AI Assistant Integration)
- **ADR-026 (Organization Model Strategy, Approved With Notes):** Entitas baru `organizations`/`organization_members`/`organization_invitations`, dimensi `organization_status` terpisah dari `roles.code` platform. Satu agen maksimal 1 Organization aktif; tidak ada transfer kepemimpinan. Merevisi status **ADR-023** (Multi-Tenancy Strategy) — `organization_id` adalah grouping construct ringan, bukan `tenant_id`.
- **ADR-027 (Organization-Scoped Authorization Strategy, Approved):** Otorisasi Organization sebagai lapisan kedua independen dari RBAC platform — **tidak mengamandemen ADR-024** (cakupan Manager tetap final tanpa pengecualian tim/wilayah).
- **ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK, Approved With Notes):** Model BYOK dengan 4 provider free-tier terkurasi (Google Gemini, Groq, Mistral, GitHub Models), key diproksi backend, riwayat chat tidak dipersist. Berdiri independen dari ADR-026/027.
- **Tidak menggantikan (Supersedes/Replaces) ADR manapun** — ketiganya murni ADR baru untuk topik yang sebelumnya belum pernah tercatat.
- **Cross-reference:** `decision-log.md` `ADR-043` (ADR-026), `ADR-044` (ADR-027), `ADR-045` (ADR-028).
- **Catatan kondisional Board:** (1, ADR-026) ✅ **diresolusi 3 Agustus 2026** — immutability `listing_origin` dikunci: validasi aplikasi + trigger Postgres `BEFORE UPDATE`; (2, ADR-026) ✅ **diresolusi 3 Agustus 2026** — nilai `archived` dikonfirmasi berlaku generik, tidak eksklusif konteks Organization; (3, ADR-028) belum ditutup — volatilitas free tier provider pihak ketiga di luar kendali platform. **Kedua catatan ADR-026 kini tertutup penuh** — lihat `architecture-decision-records.md` untuk detail Update.
- **Dampak langsung:** Menambah Modul 12 & 13 ke cakupan sistem (arsitektur); **kode belum boleh ditulis** — `PRD.md`/`ERD-Skema-Database.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` v1.1 belum disinkronkan pada siklus ini, dijadwalkan paket terpisah. **Temuan tambahan (di luar cakupan permintaan siklus):** regresi status `ADR-005`/`ADR-006` (ter-*revert* keliru menjadi OPEN pada revisi 30 Juli 2026) ditemukan dan dikoreksi bersamaan.

---

# 7. Open Decision Summary

> Dikonsolidasikan dari `executive-architecture-review.md` §9 (12 item, prioritas dampak×urgensi) dan `decision-log.md` §11 (8 baris asli). **Status kolom diperbarui** mencerminkan dokumen ter-sinkron terbaru (`technology-decisions__5_`, `PROJECT-CONSTITUTION__5_`, `architecture-decision-records__5_`) — lihat Governance Notes (Bagian 16) untuk ketidaksesuaian formatting yang belum tertutup di `decision-log.md` §11 itu sendiri.

## Decision yang Telah Selesai
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
| 1 | PROJECT-CONSTITUTION.md | **1.8** | Baseline | Governance/engineering guidelines tertinggi | Governance | ✅ | 4 Agu 2026 |
| 2 | PRD-RUMAHAGEN-v1.1.md | 1.1 | Baseline | Kebutuhan bisnis, 11 modul fungsional | Business Requirement | ✅ | 26 Jul 2026 |
| 3 | ERD-Skema-Database-...v1.1.md + Diagram | **1.2** | Approved | Desain skema database logis (37+ entitas; soft-delete kini 8 tabel via `ADR-046`; target bertambah `search_vector`, trigger counter sync, `geocode_cache`, `rate_limit_log`) | Database (Logis) | Kandidat | 4 Agu 2026 |
| 4 | API-Specification-...v1.1.md | 1.1 | Approved | Kontrak REST API lengkap | API Contract | Kandidat | 26 Jul 2026 |
| 5 | User-Flow-...v1.1.md | 1.1 | Approved | Alur interaksi UI per role | User Interaction Flow | Kandidat | 26 Jul 2026 |
| 6 | SEO-Analytics-Specification-...v1.1.md | 1.1 | Approved | Strategi rendering, SEO, analytics | SEO & Analytics | Kandidat | 26 Jul 2026 |
| 7 | SYSTEM-ARCHITECTURE.md | **1.6** | ✅ Baseline | Arsitektur teknis end-to-end (24 bagian) | Architecture (High-Level) | ✅ | 4 Agu 2026 |
| 8 | architecture-decision-records.md | **1.1** | ✅ Baseline (dok.) / **28 ADR + `ADR-046`** Approved | 28 ADR per topik arsitektur + 1 perluasan (soft-delete); dikonsolidasi dari 9 file snapshot, 5 Agu 2026 | Arsitektur & Keputusan Teknis | ✅ | 5 Agu 2026 |
| 9 | technology-decisions.md | **1.6** | ✅ Baseline | Katalog stack & justifikasi, termasuk §4.33 kurasi AI Assistant | Technology Stack | ✅ | 4 Agu 2026 |
| 10 | dependency-manifest.md | **1.6** | ✅ Baseline | Katalog package sah | Dependency Katalog | ✅ | 4 Agu 2026 |
| 11 | development-playbook.md (AI-DEVELOPMENT-BLUEPRINT.md) | **1.6** | ✅ Baseline | Panduan operasional harian AI Coding Assistant, 26 bagian | AI Instruction | ✅ | 4 Agu 2026 |
| 12 | AI-CONTEXT-PACK.md | 1.0 | Approved | Context ringkas untuk reload tiap sesi AI | Context Ringkas | Kandidat | 27 Jul 2026 |
| 13 | DEVELOPMENT-ROADMAP.md | 1.0 | Draft | Roadmap 15 sprint (S0–S14) | Roadmap & Sprint Plan | Belum | 27 Jul 2026 |
| 14 | TASK-TEMPLATE.md | 1.0 | Baseline | Template task reusable | Format Unit Kerja | ✅ | 27 Jul 2026 |
| 15 | decision-log.md | 1.0 | Baseline (Living) | Jurnal kronologis seluruh keputusan (**46 entry**, naik dari 45) | Decision (Jurnal) | ✅ | 4 Agu 2026 |
| 16 | CHANGELOG.md | **0.2.1** | Baseline (Living) | Riwayat perubahan proyek | History | ✅ | 4 Agu 2026 |
| 17 | CURRENT-PROJECT-STATE.md | 0.1 | Baseline (Living) | Status implementasi nyata per-sesi | Status Implementasi | ✅ | 4 Agu 2026 |
| 18 | document-governance-baseline-register.md | **1.1** | ✅ Baseline | Meta-dokumen lifecycle/versi/ownership | Tata Kelola Dokumen | ✅ | 4 Agu 2026 |
| 19 | foundation-validation-report.md | 1.0 | Baseline (Final) | Audit 17 dokumen, skor 79/100 (snapshot, belum menghitung ADR-005/006/008/018/026-028/046) | Validation | ✅ | 27 Jul 2026 |
| 20 | executive-architecture-review.md | — | Final — Keputusan CTO | GO WITH CONDITIONS, 6 syarat lanjut fase — **6/6 kini terpenuhi** | Keputusan Eksekutif | — | 27 Jul 2026 |
| 21 | synchronization-report-adr-001.md | — | Final — Artefak SCM | Laporan sinkronisasi resolusi ADR-001 lintas 6 dokumen (belum mencakup ADR-005/006/008/018/026-028/046) | — | — | 27 Jul 2026 |
| 22 | **project-manifest.md** (dokumen ini) | **1.6** | Diperbarui | Indeks & control center seluruh dokumentasi | Indeks Tertinggi | Belum | 4 Agu 2026 |
| — | Database Schema (fisik) | — | Planned | Migration/DDL nyata (termasuk `search_vector`/`pg_trgm`, trigger counter sync, `geocode_cache`, `rate_limit_log`, 8 tabel soft-delete) | Database (Fisik) | — | — |
| — | Functional Specification | — | Planned | Belum ada file | — | — | — |
| — | UI Specification | — | Planned | Belum ada file | — | — | — |
| — | Technical Specification | — | Ready (bahan baku lengkap) | Belum dikonsolidasi | — | — | — |

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
| 2 | `CURRENT-PROJECT-STATE.md` | Kondisi implementasi *nyata* saat ini (living, per-sesi) |
| 3 | `PROJECT-CONSTITUTION.md` (v1.6) | Engineering Guidelines tertinggi — mengalahkan seluruhnya jika konflik |
| 4 | `architecture-decision-records.md` | Alasan di balik seluruh keputusan arsitektur/teknis (dibaca sebelum Technology Decisions) |
| 5 | `decision-log.md` | Jurnal kronologis keputusan lintas proyek, termasuk non-teknis (42 entry) |
| 6 | `technology-decisions.md` (v1.5) | Katalog stack resmi & justifikasi |
| 7 | `SYSTEM-ARCHITECTURE.md` (v1.5) | Arsitektur teknis end-to-end |
| 8 | `dependency-manifest.md` (v1.5) | Package/toolchain sah untuk di-install |
| 9 | `AI-CONTEXT-PACK.md` (§1–2) + `PRD` (§1) | Project Overview / konteks ringkas |
| 10 | `PRD-RUMAHAGEN-v1.1.md` | Kebutuhan bisnis lengkap, 11 modul |
| 11 | `ERD-Skema-Database-...v1.1.md` + Diagram | Skema database logis |
| 12 | Database Schema (fisik, setelah tersedia) | Skema database nyata |
| 13 | `API-Specification-...v1.1.md` | Kontrak REST API |
| 14 | `User-Flow-...v1.1.md` | Alur interaksi UI per role |
| 15 | `SEO-Analytics-Specification-...v1.1.md` | Strategi rendering/SEO |
| 16 | `development-playbook.md` (AI-DEVELOPMENT-BLUEPRINT.md, v1.5) | Prosedur kerja harian AI Coding Assistant |
| 17 | `DEVELOPMENT-ROADMAP.md` | Roadmap & urutan sprint |
| 18 | `TASK-TEMPLATE.md` | Format unit kerja sebelum eksekusi task |
| 19 | `document-governance-baseline-register.md` | Rujukan status/versi/ownership jika ragu dokumen mana yang menang |
| 20 | `foundation-validation-report.md` + `executive-architecture-review.md` | Konteks audit & keputusan kelanjutan fase (dibaca saat butuh alasan strategis) |
| 21 | `CHANGELOG.md` (rilis `0.1.5`) | Riwayat perubahan (referensi, bukan keputusan) |

> **Tidak ada perubahan urutan** pada siklus ini — seluruh 21 posisi tetap identik dengan Manifest versi sebelumnya. Tidak ada dokumen baru yang perlu disisipkan; `ADR-018` adalah entri **di dalam** dokumen #4 (`architecture-decision-records.md`), bukan dokumen terpisah.

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

> Konsisten dengan mandat Manifest ini: pertentangan yang ditemukan **dicatat**, **tidak diperbaiki sepihak** di sini. Poin 1–12 dipertahankan penuh dari Manifest versi sebelumnya (histori tidak dihapus); poin 13 baru ditambahkan pada siklus ini.

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
| Aturan tetap tertinggi (role, security, tech stack) | `PROJECT-CONSTITUTION.md` (v1.6) |
| Alasan **mengapa** sebuah keputusan teknis diambil (per topik) | `architecture-decision-records.md` |
| Riwayat **seluruh** keputusan proyek (kronologis) | `decision-log.md` |
| Requirement bisnis / acceptance criteria per modul | `PRD-RUMAHAGEN-v1.1.md` |
| Struktur tabel database & relasi | `ERD-Skema-Database-...v1.1.md` + Diagram |
| Kontrak endpoint API | `API-Specification-...v1.1.md` |
| Alur layar/interaksi per role | `User-Flow-...v1.1.md` |
| Strategi SEO/rendering/analytics | `SEO-Analytics-Specification-...v1.1.md` |
| Stack teknologi resmi & alasan pemilihan | `technology-decisions.md` (v1.5) |
| Daftar package yang boleh di-install | `dependency-manifest.md` (v1.5) |
| Arsitektur teknis end-to-end | `SYSTEM-ARCHITECTURE.md` (v1.5) |
| Cara AI Coding Assistant bekerja hari-hari | `development-playbook.md` (v1.5) |
| Urutan & isi sprint | `DEVELOPMENT-ROADMAP.md` |
| Format standar sebuah task | `TASK-TEMPLATE.md` |
| Status implementasi kode **saat ini** | `CURRENT-PROJECT-STATE.md` |
| Riwayat rilis/perubahan versi | `CHANGELOG.md` (rilis `0.1.5`) |
| Status/versi/ownership dokumen mana pun | `document-governance-baseline-register.md` |
| Hasil audit kesiapan fondasi & skor | `foundation-validation-report.md` |
| Keputusan resmi CTO soal kelanjutan fase | `executive-architecture-review.md` |
| Apa yang berubah saat ADR-001 disinkronkan | `synchronization-report-adr-001.md` |
| **Indeks semua dokumen & status proyek** | **`project-manifest.md` (dokumen ini)** |

---

*Project Manifest ini adalah dokumen kontrol tertinggi seluruh dokumentasi proyek — bukan pengganti isi teknis dokumen mana pun (lihat Bagian 5, Source of Truth Index), melainkan indeks dan status agregat di atasnya. Wajib ditinjau ulang setiap kali Baseline, Open Decision, atau Phase proyek berubah material — konsisten dengan prinsip Software Configuration Management, Enterprise Architecture, dan Project Governance yang mendasari penyusunannya. Tidak ada isi dokumen sumber proyek lain yang diubah dalam penyusunan Manifest ini. Versi 1.6 (4 Agustus 2026) menyinkronkan seluruh isi dengan resolusi **OD-02** (seed role final), **OD-06** (kepemilikan dokumen), dan **OD-07** (kebijakan soft-delete, `ADR-046`) — **6 dari 6 kondisi GO WITH CONDITIONS CTO kini terpenuhi**, dan 5 dokumen naik status ke Baseline. **Versi 1.7 (5 Agustus 2026)** menyinkronkan rujukan versi `architecture-decision-records.md` (v1.0→v1.1) menyusul konsolidasi 9 file snapshot menjadi 1 file master dan perbaikan tuntas regresi `ADR-005`/`ADR-006` di entri sumber — murni update redaksional/metadata, dikonfirmasi lewat Impact Analysis eksplisit bahwa tidak ada dokumen turunan lain yang memerlukan revisi konten (lihat Governance Notes poin 14 dan Bagian 14A). Lihat Bagian 17 (Executive Summary/Update Summary di bawah) untuk ringkasan lengkap perubahan siklus 4 Agustus.*

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
