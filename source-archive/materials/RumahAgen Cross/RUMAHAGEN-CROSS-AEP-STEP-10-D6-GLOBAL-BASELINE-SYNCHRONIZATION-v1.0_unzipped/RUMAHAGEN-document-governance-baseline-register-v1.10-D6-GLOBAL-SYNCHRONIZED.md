# DOCUMENT GOVERNANCE & BASELINE REGISTER
## Platform Web RUMAHAGEN

---

# 1. Document Information

| Field | Value |
|---|---|
| **Name** | Document Governance & Baseline Register — Platform Web RUMAHAGEN |
| **Version** | **1.9** (naik dari 1.8 — audit ulang MP-02 selesai, item terbuka poin 35 ditutup, lihat Governance Notes poin 37) |
| **Status** | ✅ **Baseline (BERLAKU)** — status dokumen ini sendiri tidak berubah pada siklus ini (tetap Baseline sejak 4 Agustus 2026, resolusi OD-06) |
| **Effective Date** | 4 Agustus 2026 (lihat Bagian 9) |
| **Last Updated** | **10 Agustus 2026** — audit ulang MP-02 dengan standar verifikasi ketat penuh selesai, tidak ada regresi ditemukan; item terbuka dari poin 35 (rekomendasi audit ulang MP-02) resmi ditutup. Governance Notes poin 37 ditambahkan. *(Riwayat: 10 Agustus 2026 — konsolidasi riwayat versi 13 Module Planning + `SYSTEM-ARCHITECTURE.md` + AI Development Blueprint selesai penuh, 7 regresi ditemukan & diperbaiki, Governance Notes poin 22-35.)*
| **Owner** | Software Configuration Manager / Technical Documentation Architect — **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — resolusi **OD-06**, 4 Agustus 2026 (lihat Governance Notes poin 14) |
| **Purpose** | Menjadi **satu-satunya referensi resmi** mengenai status lifecycle, versi, baseline, kepemilikan (ownership), jadwal review/approval, hubungan source-of-truth, dan dependency antar seluruh dokumen proyek — agar seluruh dokumen dikelola secara konsisten sepanjang umur proyek (desain → development → testing → deployment → maintenance) oleh kontributor manusia maupun AI Coding Assistant. |
| **Related Documents** | Seluruh **24** dokumen proyek yang terdaftar di Bagian 10 (Baseline Register) — bertambah dari 21 dengan masuknya `Functional-Specification-...v1.0.md`, `UI-Specification-...v1.0.md`, `Technical-Specification-...v1.0.md` |
| **Does Not Replace** | `decision-log.md` (mencatat **mengapa** sebuah keputusan diambil) dan `CHANGELOG.md` (mencatat **riwayat** perubahan yang sudah terjadi). Dokumen ini murni mengatur **status, versi, dan lifecycle** setiap dokumen — bukan isi keputusan atau riwayat perubahan itu sendiri. |

> **Kedudukan dokumen dalam hierarki governance:** Dokumen ini adalah **meta-dokumen** — ia mengatur *cara mengelola dokumen lain*, bukan mengambil keputusan arsitektur/bisnis baru. Jika terjadi ketidaksesuaian antara dokumen ini dan `PROJECT-CONSTITUTION.md`, Constitution yang berlaku (lihat Bagian 7 — Source of Truth Matrix). Dokumen ini boleh dijadikan rujukan status oleh dokumen governance lain, tetapi tidak menggantikan otoritas isi dokumen mana pun.

---

# 2. Documentation Principles

Prinsip berikut mengikat seluruh dokumen proyek — baik yang sudah ada maupun dokumen baru yang akan dibuat di fase mendatang (Functional Specification, UI Specification, Technical Specification, dsb.):

| Prinsip | Definisi | Penerapan di Proyek Ini |
|---|---|---|
| **Single Source of Truth (SSoT)** | Setiap jenis informasi (kebutuhan bisnis, skema data, kontrak API, dsb.) hanya punya **satu** dokumen yang berwenang menjadi rujukan akhir. | Lihat Bagian 7 — Source of Truth Matrix. Dokumen lain boleh **mengutip/meringkas**, tidak boleh **mendefinisikan ulang** secara independen. |
| **One Responsibility per Document** | Setiap dokumen punya satu tanggung jawab utama yang jelas, tidak tumpang tindih fungsi dengan dokumen lain. | Mis. `technology-decisions.md` menjelaskan **mengapa** teknologi dipilih; `dependency-manifest.md` mendaftar **package apa** yang boleh dipakai — keduanya tidak saling menduplikasi isi. |
| **Traceability** | Setiap keputusan/isi dokumen dapat ditelusuri asalnya — dokumen sumber mana yang melahirkannya, dan dokumen turunan mana yang menerapkannya. | Hampir seluruh dokumen proyek sudah mencantumkan tabel "Dokumen Sumber"/"Related Documents" — praktik ini wajib dipertahankan untuk dokumen baru. |
| **Consistency** | Istilah, penomoran role/modul, dan status yang sama harus konsisten lintas dokumen — tidak ada dua dokumen "final" yang saling bertentangan tanpa tercatat sebagai Open Decision. | Ditegakkan lewat Bagian 8 (Dependency Matrix) dan Bagian 11 (Change Management) — perubahan pada satu dokumen wajib memicu pengecekan dampak ke dokumen dependen. |
| **Version Control** | Setiap dokumen memiliki nomor versi eksplisit mengikuti Semantic Versioning (Bagian 5), bukan tanggal saja. | Diterapkan penuh; lihat Bagian 10 untuk versi aktual tiap dokumen saat ini. |
| **Change Control** | Perubahan pada dokumen yang sudah **Baseline** tidak boleh dilakukan diam-diam — wajib melalui prosedur resmi (Bagian 11). | Konsisten dengan `decision-log.md` Bagian 8 (Decision Review Process) yang sudah menetapkan AI tidak berwenang melompati tahap Approval. |
| **AI Readability** | Dokumen ditulis dengan struktur eksplisit (tabel, heading bernomor, status jelas) agar dapat diparse dan diikuti AI Coding Assistant tanpa ambiguitas. | Seluruh dokumen proyek sudah mengikuti pola ini; dokumen ini sendiri disusun dengan pola yang sama. |
| **Human Readability** | Dokumen tetap dapat dibaca dan diaudit manusia non-teknis (Product Manager, QA, stakeholder bisnis) tanpa memerlukan AI sebagai perantara. | Bahasa Indonesia naratif dipertahankan untuk konteks/alasan; istilah teknis industri (Baseline, Draft, SemVer, dsb.) dipakai apa adanya tanpa terjemahan paksa. |

---

# 3. Documentation Lifecycle

Lifecycle resmi yang berlaku untuk **seluruh** dokumen proyek, dari dokumen governance hingga dokumen turunan modul (Functional/UI/Technical Specification bila dibuat di kemudian hari):

```
Planned
   ↓
Draft
   ↓
In Review
   ↓
Approved
   ↓
Baseline
   ↓
Revision Requested
   ↓
Updated
   ↓
Review
   ↓
Baseline (versi baru)
   ↓
Archived
```

**Arti setiap status:**

| Status | Arti | Boleh Dijadikan Rujukan Implementasi? |
|---|---|---|
| **Planned** | Dokumen baru sudah diidentifikasi kebutuhannya (mis. karena ditandai gap oleh dokumen lain) namun penulisannya belum dimulai. Tidak ada isi. | Tidak — belum ada konten untuk dirujuk. |
| **Draft** | Penulisan sedang berlangsung atau baru selesai draf pertama. Isi dapat berubah signifikan. Belum melalui review formal. | Tidak, kecuali sebagai *configurable placeholder* dengan penanda `// TODO` — tidak pernah sebagai keputusan final. |
| **In Review** | Draf sudah lengkap dan sedang direview (oleh Reviewer yang ditunjuk — Bagian 9). Perubahan pada tahap ini bersifat hasil review, bukan penulisan baru. | Tidak — masih dapat berubah akibat hasil review. |
| **Approved** | Isi dokumen sudah disetujui secara arsitektural/bisnis oleh Approver yang berwenang. Mengikat untuk implementasi berikutnya, namun **belum tentu** sudah menjadi versi definitif yang dikunci (lihat perbedaan dengan Baseline di Bagian 4). | Ya — mengikat, tetapi masih dapat direvisi tanpa proses Baseline formal jika revisi minor. |
| **Baseline** | Versi dokumen **dikunci** sebagai titik acuan resmi — tidak boleh diubah langsung; setiap perubahan wajib melalui prosedur Bagian 11 dan menghasilkan versi Baseline baru. | Ya — ini adalah versi **paling otoritatif** yang boleh dirujuk AI Coding Assistant maupun developer manusia (lihat Bagian 13). |
| **Revision Requested** | Sebuah Baseline yang sudah ada menerima permintaan perubahan resmi (lewat Change Request/ADR baru di `decision-log.md`). Versi Baseline lama **tetap berlaku** sampai versi baru selesai proses ini. | Ya (versi Baseline lama yang masih berlaku) — bukan revisi yang sedang berjalan. |
| **Updated** | Perubahan sudah diterapkan ke isi dokumen berdasarkan Revision Requested, menghasilkan draf revisi baru. | Tidak — sama seperti Draft, harus melalui Review lagi. |
| **Review** (siklus ulang) | Draf revisi (Updated) direview ulang sebelum disetujui menjadi Baseline versi baru. | Tidak. |
| **Baseline (versi baru)** | Versi revisi disetujui dan dikunci sebagai Baseline baru, menggantikan Baseline sebelumnya. Baseline lama diarsipkan (bukan dihapus). | Ya — menggantikan Baseline versi sebelumnya sebagai rujukan aktif. |
| **Deprecated** | Dokumen/bagian dokumen masih ada tetapi tidak lagi direkomendasikan sebagai rujukan aktif — biasanya karena digantikan versi baru atau karena keputusan yang dicatatnya sudah usang. Dipertahankan sebagai sejarah. | Tidak — hanya untuk konteks historis. |
| **Archived** | Dokumen sepenuhnya keluar dari siklus rujukan aktif (mis. versi Blueprint Session 3 yang digantikan versi upload di Session 5 — lihat `CHANGELOG.md` Session 4–5). Disimpan untuk audit trail, tidak pernah dihapus. | Tidak. |

> **Catatan konsistensi dengan `decision-log.md`:** Status *Approved*, *Implemented*, *Deprecated*, *Replaced* di `decision-log.md` Bagian 3 mengacu pada **entri keputusan (ADR)**, bukan status **dokumen** secara keseluruhan. Kedua sistem status ini melengkapi, bukan menggantikan satu sama lain — satu ADR bisa berstatus *Approved* di dalam sebuah dokumen yang status keseluruhannya masih *Draft* (lihat Governance Notes Bagian 15, poin 1).

---

# 4. Baseline Rules

## 4.1 Kapan Dokumen Boleh Menjadi Baseline

Sebuah dokumen **hanya** boleh naik status menjadi **Baseline** jika **seluruh** syarat berikut terpenuhi:

1. **Seluruh dependency-nya sudah Baseline atau tidak memiliki dependency yang memblokir.** Rujuk Bagian 8 (Document Dependency Matrix) — dokumen tidak boleh di-baseline mendahului dokumen yang menjadi prasyaratnya (mis. `ERD-Skema-Database` tidak boleh Baseline jika `technology-decisions.md` yang menjadi dasarnya masih Draft dan isinya berdampak langsung ke skema).
2. **Sudah melalui tahap Review formal** oleh Reviewer yang ditunjuk (Bagian 9) — bukan sekadar ditulis oleh satu peran/AI tanpa validasi silang.
3. **Tidak ada Open Decision yang secara langsung memengaruhi isi dokumen tersebut** (rujuk `decision-log.md` Bagian 11 — Open Decisions, dan `CHANGELOG.md` — Known Issues). Jika ada Open Decision yang relevan, dokumen dapat tetap naik ke Baseline **hanya** jika bagian yang terdampak sudah diimplementasikan sebagai *configurable placeholder* yang eksplisit ditandai, bukan diasumsikan selesai.
4. **Sudah disetujui (Approved)** oleh Approver yang berwenang sesuai Bagian 9.
5. **Tidak bertentangan dengan dokumen berhierarki lebih tinggi** yang sudah berstatus Baseline (rujuk Bagian 7 — Source of Truth Matrix). Jika ditemukan pertentangan, dokumen tidak boleh di-baseline sampai pertentangan tercatat sebagai ADR di `decision-log.md` dan diselesaikan.

## 4.2 Kapan Baseline Boleh Diubah Kembali

Sebuah dokumen yang sudah berstatus **Baseline tidak boleh diedit langsung**. Perubahan hanya sah melalui jalur berikut:

1. **Perubahan minor/editorial** (typo, perbaikan redaksi yang tidak mengubah keputusan/kontrak) — boleh dilakukan sebagai **PATCH** (Bagian 5) tanpa perlu ADR baru, namun tetap wajib dicatat di `CHANGELOG.md` dan tidak mengubah status Baseline (versi PATCH tetap Baseline, hanya nomor versi yang naik).
2. **Perubahan substantif** (menambah/mengubah keputusan, kontrak data/API, ruang lingkup) — wajib melalui **Change Management Rules penuh** (Bagian 11): Request → Decision Log (ADR baru) → Impact Analysis → Update Document → Review → Approval → **New Baseline**. Baseline lama tidak dihapus, melainkan diberi status **Deprecated**, lalu **Archived** setelah Baseline baru resmi berlaku.
3. **Tidak ada pengecualian** untuk AI Coding Assistant — AI dapat mengusulkan (Proposed) dan membantu Impact Analysis, tetapi **tidak berwenang** mengubah dokumen berstatus Baseline atas inisiatif sendiri, konsisten dengan `decision-log.md` Bagian 8 dan Bagian 9 poin 3.
4. **Baseline yang saling bertentangan tidak boleh berdampingan** — jika sebuah revisi menghasilkan Baseline baru, Baseline lama **wajib** segera diberi status Deprecated pada hari yang sama, untuk mencegah dua "versi final" yang aktif bersamaan (ini adalah akar dari beberapa Known Issue di `CHANGELOG.md`, lihat Governance Notes Bagian 15).

---

# 5. Versioning Rules

Seluruh dokumen proyek mengikuti **Semantic Versioning** (`MAJOR.MINOR`, tanpa PATCH kecuali diperlukan granularitas lebih — lihat catatan di bawah), selaras dengan prinsip yang sudah dipakai `CHANGELOG.md` untuk versi rilis kode proyek (`MAJOR.MINOR.PATCH`).

| Level | Kapan Digunakan | Contoh di Proyek Ini |
|---|---|---|
| **MAJOR** (`1.x` → `2.0`) | Perubahan yang mengubah **keputusan inti/kontrak** dokumen tsb — mis. perubahan struktur role, perubahan kontrak field wajib API, perubahan arsitektur backend. Menghasilkan Baseline baru yang **tidak backward-compatible** secara konsep dengan versi sebelumnya. | Revisi v1.0 → v1.1 pada PRD/ERD/API Spec/User Flow/SEO Spec (resolusi 7 konflik lintas dokumen) **secara substansi** memenuhi kriteria MAJOR menurut definisi ini — dicatat sebagai catatan konsistensi di Governance Notes (Bagian 15, poin 2), karena dokumen sumber menyebutnya "Minor Revision" sedangkan isinya mengandung breaking change konseptual (formalisasi role baru, migrasi `city` → `city_id`). |
| **MINOR** (`1.0` → `1.1`) | Penambahan konten baru yang **tidak mengubah** keputusan yang sudah ada — mis. penambahan bagian baru, penambahan tabel/entitas baru yang belum pernah didefinisikan sebelumnya, penambahan klarifikasi yang memperjelas (bukan mengubah) makna sebelumnya. | Penambahan bagian "Riwayat Keputusan Arsitektur" di `PROJECT-CONSTITUTION.md` v1.1 tanpa mengubah keputusan v1.0 yang sudah ada. |
| **PATCH** (`1.1` → `1.1.1`, opsional) | Perbaikan redaksional, typo, perbaikan tautan/referensi silang yang tidak mengubah makna/keputusan apa pun. | Digunakan hanya jika tim memilih granularitas tambahan; saat ini seluruh dokumen proyek memakai penomoran dua digit (`1.0`, `1.1`) — PATCH disediakan sebagai opsi, bukan kewajiban, untuk dokumen governance (berbeda dengan versi rilis **kode** proyek di `CHANGELOG.md` yang wajib tiga digit). |

**Aturan tambahan:**
- Nomor versi **hanya** naik ketika dokumen resmi memasuki status **Baseline** baru (Bagian 3) — status Draft/In Review yang masih dalam proses penulisan versi berikutnya **tidak** menaikkan nomor versi publik; gunakan penanda internal (mis. "v1.2-draft") jika diperlukan untuk kolaborasi.
- Dokumen yang statusnya masih **Draft** pada versi pertamanya (mis. `technology-decisions.md`, `dependency-manifest.md`, `DEVELOPMENT-ROADMAP.md`, `AI-DEVELOPMENT-BLUEPRINT.md` — seluruhnya tercatat versi "1.0" tetapi status "Draft — menunggu pengesahan tim") **tetap** memakai penomoran versi sejak draf pertama — versi tidak menunggu sampai Approved untuk mulai dihitung.
- Downgrade nomor versi **tidak pernah** dilakukan — koreksi tetap dicatat sebagai kenaikan versi baru (konsisten dengan Aturan Wajib #1 `CHANGELOG.md`: "History tidak boleh dihapus").

---

# 6. Document Status Definitions

Ringkasan definisi status dokumen (melengkapi penjelasan naratif Bagian 3), dipakai sebagai nilai baku kolom **Status** di Bagian 10 (Baseline Register):

| Status | Definisi Ringkas |
|---|---|
| **Planned** | Kebutuhan dokumen sudah diidentifikasi (mis. ditandai sebagai gap oleh dokumen lain), belum ditulis. |
| **Draft** | Sedang ditulis / draf pertama selesai, belum direview formal. |
| **In Review** | Sedang dalam proses review oleh Reviewer yang ditunjuk. |
| **Approved** | Disetujui isi/keputusannya, mengikat untuk implementasi, namun belum tentu dikunci sebagai Baseline formal. |
| **Baseline** | Versi dikunci sebagai acuan resmi tertinggi saat ini — tidak boleh diubah langsung. |
| **Deprecated** | Tidak lagi direkomendasikan sebagai rujukan aktif, digantikan versi/dokumen lain, dipertahankan untuk sejarah. |
| **Archived** | Sepenuhnya keluar dari siklus rujukan aktif, disimpan permanen untuk audit trail. |

---

# 7. Source of Truth Matrix

| Jenis Informasi | Dokumen Source of Truth | Dokumen Boleh Mengutip (Tidak Boleh Mendefinisikan Ulang) |
|---|---|---|
| **Business Requirement** | `PRD-RUMAHAGEN-v1.1.md` | AI-CONTEXT-PACK, DEVELOPMENT-ROADMAP, TASK-TEMPLATE |
| **Governance Tertinggi / Engineering Guidelines** | `PROJECT-CONSTITUTION.md` | Seluruh dokumen lain (mengalahkan seluruhnya jika terjadi konflik) |
| **Architecture (High-Level)** | `SYSTEM-ARCHITECTURE.md` | technology-decisions, dependency-manifest, AI-DEVELOPMENT-BLUEPRINT |
| **Database (Logis/ERD)** | `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` + `ERD-Diagram-v1.1.mermaid` | API-Specification, PRD (referensi field), SYSTEM-ARCHITECTURE §7 |
| **Database (Fisik/Migration)** | **TBD** — belum ada dokumen "Database Schema" fisik terpisah dari ERD dalam repositori yang direview (lihat Governance Notes Bagian 15, poin 3). Sampai dokumen ini dibuat, migration file aktual di `/apps/api/migrations` (setelah Sprint S0 berjalan) menjadi rujukan fisik, dengan ERD sebagai rujukan desain logis. | — |
| **API Contract** | `API-Specification-RUMAHAGEN-v1.1.md` | SYSTEM-ARCHITECTURE §9, User-Flow |
| **User Interaction Flow** | `User-Flow-RUMAHAGEN-v1.1.md` | PRD (acceptance criteria), Functional Specification (bila dibuat) |
| **SEO & Analytics Strategy** | `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md` | PROJECT-CONSTITUTION §18–19, DEVELOPMENT-ROADMAP |
| **Technology Stack & Rasionalisasi** | `technology-decisions.md` | dependency-manifest, SYSTEM-ARCHITECTURE §4 |
| **Dependency/Package Katalog** | `dependency-manifest.md` | AI-DEVELOPMENT-BLUEPRINT, TASK-TEMPLATE |
| **Arsitektur & Keputusan Teknis per Topik (ADR)** | `architecture-decision-records.md` — **25 ADR** (`ADR-001`–`ADR-025`), disusun per topik arsitektur (Backend, Auth, RBAC, Database, Search, Job Queue, Email, Maps, Storage, Deployment, State Management, API Architecture, Error Handling, Logging, Monitoring, Testing, Security, Caching, File Upload, Notification, Frontend Framework, Schema Conventions, Multi-Tenancy, RBAC Role Scope, Type Safety). **Status per 31 Jul 2026: 25 Approved** (termasuk `ADR-001` Backend Architecture, `ADR-005` Search Strategy, `ADR-006` Job Queue Strategy, `ADR-008` Maps Provider, & `ADR-018` Caching Strategy) — **tidak ada lagi ADR OPEN**. Dibaca sebelum `technology-decisions.md` — menjelaskan alasan di balik apa yang tercantum di sana. | `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md` §4, `AI-DEVELOPMENT-BLUEPRINT.md`, `dependency-manifest.md` |
| **Roadmap & Sprint Plan** | `DEVELOPMENT-ROADMAP.md` | TASK-TEMPLATE, CURRENT-PROJECT-STATE |
| **Format/Unit Kerja Task** | `TASK-TEMPLATE.md` | AI-DEVELOPMENT-BLUEPRINT §21 |
| **Keputusan & Rasionalisasi — Jurnal Kronologis Lintas Proyek (ADR)** | `decision-log.md` — jurnal **kronologis** seluruh keputusan proyek (teknis maupun non-teknis, mis. penetapan versi Blueprint aktif, keputusan governance dokumen), disusun per urutan waktu terjadinya, **bukan** per topik arsitektur. Penomoran ADR-nya independen dari `architecture-decision-records.md` (lihat catatan penomoran di dokumen ADR tsb, Bagian 2). | Seluruh dokumen lain yang merujuk alasan keputusan |
| **Riwayat Perubahan (Rilis Kode)** | `CHANGELOG.md` | — (tidak dikutip dokumen lain sebagai rujukan keputusan, hanya riwayat) |
| **Status Implementasi Nyata (Living)** | `CURRENT-PROJECT-STATE.md` | TASK-TEMPLATE, AI-DEVELOPMENT-BLUEPRINT — **wajib dibaca pertama** di setiap sesi AI |
| **Context Ringkas Proyek** | `AI-CONTEXT-PACK.md` (Bagian 1–2) digabung `PRD-...v1.1.md` (Bagian 1) — konsisten dengan definisi "Project Overview" di `AI-DEVELOPMENT-BLUEPRINT.md` §5 | Seluruh dokumen lain sebagai ringkasan cepat |
| **AI Instruction / Prosedur Kerja AI** | `AI-DEVELOPMENT-BLUEPRINT.md` (versi upload 24 bagian — ditetapkan sebagai acuan aktif sejak Session 5, menggantikan versi Session 3) | AI-CONTEXT-PACK §11–12, TASK-TEMPLATE |
| **Validasi Kesiapan Fondasi** | `foundation-validation-report.md` | decision-log (Open Decisions), CHANGELOG (Known Issues) |
| **Keputusan Eksekutif Tingkat Tinggi** | **TBD** — dokumen "Executive Architecture Review" disebutkan pada daftar dokumen yang sudah ada, namun **tidak ditemukan sebagai file** dalam repositori yang direview untuk penyusunan dokumen ini (lihat Governance Notes Bagian 15, poin 3). | — |
| **Tata Kelola Dokumen Itu Sendiri** | **Dokumen ini** (`document-governance-baseline-register.md`) | Seluruh dokumen lain (untuk pertanyaan "dokumen mana yang berwenang atas X") |

---

# 8. Document Dependency Matrix

Diagram berikut menunjukkan **arah dependency** — dokumen di atas panah harus stabil/Baseline lebih dulu sebelum dokumen di bawahnya dapat dianggap solid, konsisten dengan urutan yang sudah dibangun `DEVELOPMENT-ROADMAP.md` dan `foundation-validation-report.md` Bagian 16–18:

```
PROJECT-CONSTITUTION.md (Engineering Guidelines)
        ↓
Architecture Decision Records (architecture-decision-records.md — 25 ADR per topik arsitektur,
        25 Approved — termasuk ADR-001 Backend Architecture, ADR-005 Search Strategy, ADR-006 Job Queue Strategy,
        ADR-008 Maps Provider & ADR-018 Caching Strategy — tidak ada lagi ADR OPEN)
        ↓
Technology Decisions
        ↓
System Architecture
        ↓
ERD (Skema Database Logis) + ERD Diagram
        ↓
Database Schema (fisik — TBD, menyusul saat Sprint S0)
        ↓
API Specification
        ↓
User Flow
        ↓
PRD Alignment  (PRD sudah ada v1.1 — baris ini merepresentasikan proses verifikasi silang
                berkelanjutan antara PRD dan seluruh dokumen teknis di atasnya)
        ↓
Functional Specification   (v1.0 Baseline — disahkan 5 Agu 2026, lihat Governance Notes poin 18)
        ↓
UI Specification           (v1.0 Baseline — disahkan 5 Agu 2026)
        ↓
Technical Specification    (v1.0 Baseline — disahkan 5 Agu 2026, konsolidasi System Architecture +
                             Technology Decisions + API Spec v1.2 + ERD v1.3 + Entity Mapping +
                             Authorization Spec)
        ↓
Module Planning            (Development Roadmap sudah memenuhi fungsi ini — status Ready;
                             kini tanpa blocker dokumentasi maupun status Baseline apa pun)
```

**Dependency dokumen operasional (paralel, tidak linear terhadap rantai di atas):**

| Dokumen | Bergantung Pada |
|---|---|
| `Architecture Decision Records` (`architecture-decision-records.md`) | `PROJECT-CONSTITUTION.md` (Engineering Guidelines tertinggi) + dokumen sumber v1.1 (PRD/ERD/API Spec) sebagai konteks kebutuhan per topik ADR. Menjadi prasyarat penjelas bagi `Technology Decisions` dan `System Architecture` (setiap baris "Official Technology Stack" seharusnya dapat ditelusuri balik ke tepat satu ADR di dokumen ini). |
| `Dependency Manifest` | `Technology Decisions` (satu-ke-satu, setiap package memetakan ke satu keputusan teknologi) |
| `AI Development Blueprint` (Development Playbook) | Seluruh dokumen sumber v1.1 + System Architecture + Technology Decisions + Dependency Manifest + AI Context Pack |
| `AI Context Pack` | Seluruh dokumen sumber v1.1 + AI Development Blueprint |
| `Task Template` | Constitution + dokumen sumber v1.1 + System Architecture + Technology Decisions + Dependency Manifest + AI Development Blueprint + AI Context Pack + Development Roadmap |
| `Decision Log` | Tidak bergantung struktural pada dokumen lain (mencatat keputusan lintas semua dokumen), tetapi **menjelaskan alasan** di balik keputusan yang tercantum di dokumen lain |
| `Changelog` | `Current Project State` (perubahan riil yang dicatat harus konsisten dengan status implementasi nyata) |
| `Current Project State` | Tidak bergantung struktural — merefleksikan kondisi **fisik** repositori, independen dari dokumen desain mana pun |
| `Foundation Validation Report` | Seluruh 17 dokumen yang diaudit (snapshot pada tanggal audit) |
| `Document Governance & Baseline Register` (dokumen ini) | Seluruh dokumen di atas — sebagai meta-layer yang mengatur status/versi, bukan isi |

---

# 9. Review & Approval Matrix

> **Catatan (diperbarui 4 Agustus 2026 — OD-06 RESOLVED):** Kolom **Owner** di seluruh dokumen kini ditetapkan ke **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — lihat Bagian 10 & Governance Notes poin 14. Kolom **Reviewer**/**Approver** di tabel bawah ini **tetap diisi dengan peran** (bukan diduplikasi jadi nama pada tiap sel) karena secara struktural seluruh peran tsb dijalankan oleh individu yang sama pada proyek solo ini — **bukan segregation of duties formal** seperti pada tim multi-orang. Pengesahan/approval untuk dokumen berstatus Baseline tetap dapat dieksekusi langsung oleh Owner tunggal ini tanpa menunggu pihak kedua, dicatat eksplisit di sini agar tidak disalahartikan sebagai kekosongan proses.

| Document | Reviewer (Peran) | Approver (Peran) | Review Frequency | Approval Required |
|---|---|---|---|---|
| PROJECT-CONSTITUTION.md | Principal Software Architect + Technical Lead | Technical Lead / Product Owner — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap ada keputusan bisnis besar turun (per Bagian 21 poin 8 dokumen tsb) | Ya — wajib |
| PRD v1.1 | Senior Business Analyst + Product Manager | Product Owner — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap perubahan requirement bisnis | Ya — wajib |
| ERD + ERD Diagram v1.1 | Database Architect | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap penambahan/perubahan entitas | Ya — wajib |
| API Specification v1.1 | API Architect | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap penambahan/perubahan endpoint | Ya — wajib |
| User Flow v1.1 | Senior Business Analyst + UX Reviewer (peran belum ada di proyek — TBD) | Product Owner — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap perubahan alur pengguna signifikan | Ya — wajib |
| SEO & Analytics Specification v1.1 | SEO/Performance Reviewer (peran belum ditunjuk — TBD) | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap perubahan strategi rendering/SEO | Ya — wajib |
| SYSTEM-ARCHITECTURE.md | Enterprise Solution Architect | Technical Lead / CTO — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap keputusan arsitektur besar | Ya — wajib |
| architecture-decision-records.md | Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend/Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead) | Technical Lead / CTO — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) — pengesahan formal final per-ADR tetap memerlukan konfirmasi manusia | Per ADR (setiap kali topik arsitektur baru dibahas atau ADR ber-status Open/Proposed diselesaikan) | Ya — wajib, per-entry ADR (bukan per-dokumen), konsisten dengan pola `decision-log.md` |
| technology-decisions.md | Principal Software Architect | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) — **belum pernah disahkan formal** (lihat Governance Notes Bagian 15, poin 1) | Setiap Open Question (Bagian 9 dokumen tsb) diselesaikan | Ya — wajib, **belum terpenuhi saat ini** |
| dependency-manifest.md | Principal Software Architect | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Bersamaan setiap kali technology-decisions.md direvisi | Ya — wajib |
| AI-DEVELOPMENT-BLUEPRINT.md | Reviewer AI (Claude, peran ditetapkan di Bagian 3.1 dokumen tsb) + Technical Lead manusia | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap kali AI Workflow/AI Rules berubah | Ya — wajib |
| AI-CONTEXT-PACK.md | Technical Writer (Claude — Bagian 3.1 Blueprint) | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap kali dokumen sumber v1.1 berubah signifikan | Ya — direkomendasikan |
| DEVELOPMENT-ROADMAP.md | Engineering Manager / Senior Technical PM | Technical Lead / Product Owner — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap kali Constitution/PRD/System Architecture berubah signifikan | Ya — wajib |
| TASK-TEMPLATE.md | Staff Software Engineer | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Jika ditemukan gap berulang pada jenis task tertentu | Direkomendasikan, tidak wajib per-task |
| decision-log.md | Self-maintained (Living Document) | Technical Lead untuk setiap ADR berstatus Approved — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Berkelanjutan (setiap ADR baru) | Ya, per-entry (bukan per-dokumen) |
| CHANGELOG.md | Release Manager | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap rilis versi baru | Ya, per-entry rilis |
| CURRENT-PROJECT-STATE.md | Technical Project Manager | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Akhir setiap sesi development yang mengubah kode nyata | Ya — wajib sebelum sesi ditutup |
| foundation-validation-report.md | AI Audit Panel (peran gabungan — lihat dokumen tsb Bagian 1) | CTO / Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Sekali per audit besar (mis. sebelum fase baru dimulai) | Ya — sebagai gate, bukan approval berkelanjutan |
| Executive Architecture Review | **TBD** — dokumen tidak ditemukan dalam repositori yang direview (lihat Governance Notes Bagian 15, poin 3) | **TBD** | **TBD** | **TBD** |
| Database Schema (fisik) | **TBD** — belum ada sebagai dokumen/migration fisik (proyek masih 0% kode per `CURRENT-PROJECT-STATE.md`) | **TBD** | **TBD** | **TBD** |
| document-governance-baseline-register.md (dokumen ini) | Software Configuration Manager | Technical Lead / CTO — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | Setiap kali status/versi dokumen lain berubah material | Ya — wajib |

---

# 10. Baseline Register

> Data diisi berdasarkan isi aktual dokumen yang tersedia pada tanggal penyusunan (27 Juli 2026), **disinkronkan ulang 31 Juli 2026** dengan resolusi `architecture-decision-records.md` `ADR-018` (Caching Strategy, Approved — ADR terakhir yang tersisa) dan rilis `CHANGELOG.md` `0.1.5` / `decision-log.md` `ADR-042`. Kolom yang informasinya tidak tersedia secara eksplisit di dokumen sumber ditandai **TBD**. Baris terdampak ditandai eksplisit di kolom **Last Review**, bukan diedit diam-diam.

| Document | Current Version | Status | Baseline Version | Owner | Last Review | Next Review | Dependencies | Source of Truth Untuk |
|---|---|---|---|---|---|---|---|---|
| PROJECT-CONSTITUTION.md | **1.9** | Baseline (dinyatakan "BERLAKU") | **1.9** | Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 7 Agu 2026 (revisi v1.8→v1.9, sinkron **OD-24** — pembukaan gate implementasi kode Modul 12, §24 poin 10 direvisi) — sebelumnya 4 Agu 2026 (v1.7→v1.8, sinkron resolusi **OD-02/06/07**) | Setiap keputusan bisnis besar turun | — (tertinggi) | Governance / Engineering Guidelines |
| PRD-RUMAHAGEN-v1.2.md | **1.2** | Baseline (menggantikan v1.1, **v1.1 kini Deprecated** — dipertahankan sebagai referensi historis, tidak dihapus) | **1.2** | Senior Business Analyst / Product Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (naik v1.1→v1.2 — retrofit `REQ-XXX` EAF [114 ID], Modul 12/13 ditambahkan penuh) | Saat requirement bisnis berubah | PROJECT-CONSTITUTION.md | Business Requirement |
| Entity-Mapping-RUMAHAGEN-v1.0.md | **1.0** | ✅ **Baseline (BERLAKU)** — naik dari Draft, **disahkan Owner 5 Agu 2026** | **1.0** | Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (dibuat baru, lihat Governance Notes poin 3) | Saat ada perubahan entity/modul baru | PRD v1.2, ERD v1.3 | Entity ID Registry (`ENT-XXX`) |
| ERD-Skema-Database-RUMAHAGEN-v1.3.md | **1.3** | ✅ **Baseline (BERLAKU)** — naik dari Approved, **disahkan Owner 5 Agu 2026** (v1.2 tetap Deprecated) | **1.3** | Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (naik v1.2→v1.3) | Saat Database Schema Alignment fisik dieksekusi | PRD v1.2, Entity Mapping v1.0, PROJECT-CONSTITUTION.md | Database (Logis + Fisik, digabung) |
| ERD-Diagram-v1.1.mermaid | 1.1 | Approved (companion ERD — **belum disinkronkan ke ERD v1.3**, dicatat sebagai gap kecil untuk siklus berikutnya) | 1.1 (kandidat) | Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 | Bersamaan dengan ERD Skema — perlu disinkronkan ke v1.3 | ERD-Skema-Database v1.3 | Database (Visual) |
| API-Specification-RUMAHAGEN-v1.2.md | **1.2** | ✅ **Baseline (BERLAKU)** — naik dari Approved, **disahkan Owner 5 Agu 2026** (v1.1 tetap Deprecated) | **1.2** | API Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (naik v1.1→v1.2) | Saat kontrak endpoint berubah | ERD v1.3, User Flow v1.2, PRD v1.2 | API Contract |
| User-Flow-RUMAHAGEN-v1.2.md | **1.2** | ✅ **Baseline (BERLAKU)** — naik dari Approved, **disahkan Owner 5 Agu 2026** (v1.1 tetap Deprecated) | **1.2** | Senior Business Analyst — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (naik v1.1→v1.2) | Saat alur pengguna berubah | PRD v1.2, API Specification v1.2 | User Interaction Flow |
| Authorization-Access-Control-Specification-v1.1.md | **1.1** *(naik dari 1.0, audit Issue Register Batch 3)* | ✅ **Baseline (BERLAKU)** — naik dari Draft-lalu-Baseline v1.0, **audit menyeluruh 6 Agu 2026, tetap Baseline** | **1.0** | Security Architect / API Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 6 Agu 2026 (audit v1.1) — sebelumnya 5 Agu 2026 (promosi Baseline v1.0), 5 Agu 2026 (dibuat baru) | Saat role/permission berubah, atau ditemukan drift dokumentasi vs RLS (seperti siklus ini) | ERD v1.3, API Specification v1.2, Entity Mapping v1.0 | Role Matrix + Permission Matrix (`PERM-XXX`) — 22 dari 113 baris dikoreksi pada audit v1.1 |
| Functional-Specification-RUMAHAGEN-v1.0.md | **1.0** | ✅ **Baseline (BERLAKU)** — naik dari Draft, **disahkan Owner 5 Agu 2026** | **1.0** | Senior Business Analyst / Product Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (dibuat baru, 43 layar) | Saat layar/requirement berubah | PRD v1.2, User Flow v1.2, API Specification v1.2 | Functional Specification (level-layar) |
| UI-Specification-RUMAHAGEN-v1.0.md | **1.0** | ✅ **Baseline (BERLAKU)** — naik dari Draft, **disahkan Owner 5 Agu 2026** | **1.0** | Technical Lead / UI-UX Design Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (dibuat baru) | Saat Screen Inventory/token berubah | Functional Specification v1.0, SYSTEM-ARCHITECTURE §10, `development-playbook.md` §8 | UI Specification / Wireframe |
| Technical-Specification-RUMAHAGEN-v1.0.md | **1.0** | ✅ **Baseline (BERLAKU)** — naik dari Draft, **disahkan Owner 5 Agu 2026** | **1.0** | Principal Software Architect / Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (promosi Baseline) — sebelumnya 5 Agu 2026 (dibuat baru) | Saat arsitektur/stack berubah | SYSTEM-ARCHITECTURE, technology-decisions, API Spec v1.2, ERD v1.3, Entity Mapping v1.0, Authorization Spec v1.0 | Technical Specification (konsolidasi) |
| SEO-Analytics-Specification-RUMAHAGEN-v1.1.md | 1.1 | Approved | 1.1 (kandidat) | Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 26 Jul 2026 | Saat strategi rendering berubah | PRD, System Architecture | SEO & Analytics Strategy |
| SYSTEM-ARCHITECTURE.md | 1.6 | ✅ **Baseline (BERLAKU)** — **naik 4 Agu 2026** (OD-06 resolved, satu-satunya blocker sebelumnya) | **1.6** | Enterprise Solution Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (promosi Baseline, OD-06) — sebelumnya 3 Agu 2026 (naik v1.5→v1.6, sinkron `ADR-026`/`027`/`028` — Modul 5.12/5.13, Bagian 7/8/13/14/24 diperbarui; **Bagian 4 Technology Stack tidak disentuh**) | Setelah Open Decision H1–H3 (`foundation-validation-report.md` §16) diselesaikan, atau saat keputusan arsitektur besar baru turun | PROJECT-CONSTITUTION.md, dokumen sumber v1.1, **architecture-decision-records.md** | Architecture (High-Level) |
| architecture-decision-records.md | **1.1** | ✅ **Baseline (BERLAKU)** — **naik 4 Agu 2026** (OD-06 resolved), status field internal dokumen disinkronkan penuh ke Baseline pada **5 Agu 2026** (sebelumnya field Status masih tertulis "Draft" secara internal meski sudah dideklarasikan Baseline oleh `project-manifest.md`). Entry ADR di dalamnya (`ADR-001`–`ADR-028`, kini juga **`ADR-046`**) tetap memakai status per-entry masing-masing (Approved/Approved With Notes/Rejected/Superseded/Replaced) — **28 dari 28 ADR arsitektur/teknis kini Approved/Approved With Notes**, tidak ada lagi ADR OPEN. | **1.1** | Principal Enterprise Software Architect / Enterprise Solution Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (naik v1.0→**v1.1** — konsolidasi 9 file snapshot revisi menjadi 1 file master; **perbaikan tuntas** regresi `ADR-005`/`ADR-006` yang ternyata belum sepenuhnya dipulihkan oleh perbaikan narasi 3 Agu 2026 — entri sumber Bagian 4 kini dikoreksi penuh; Bagian 1A Revision History ditambahkan; baris `Cross-reference` diseragamkan) — sebelumnya 4 Agu 2026 (promosi Baseline OD-06; **ADR-046** ditambahkan) dan 3 Agu 2026 (ADR-026/027/028 dikunci Approved/Approved With Notes; status ADR-023 direvisi) | Per ADR baru (tidak ada lagi ADR OPEN yang menghalangi status dokumen) | PROJECT-CONSTITUTION.md, dokumen sumber v1.1 | Arsitektur & Keputusan Teknis per Topik (ADR) |
| technology-decisions.md | 1.6 | ✅ **Baseline (BERLAKU)** — **naik 4 Agu 2026** (OD-06 resolved, satu-satunya blocker sebelumnya), meski isinya sejak awal sudah disebut "keputusan resmi dan final" | **1.6** | Principal Software Architect / Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (promosi Baseline, OD-06) — sebelumnya 3 Agu 2026 (naik v1.5→v1.6, sinkron `ADR-028` — §4.33 kurasi provider AI Assistant; `ADR-026`/`027` tidak menyentuh dokumen ini) | Saat keputusan stack besar baru turun; penambahan **Bolt.new** sebagai toolchain resmi (catatan kondisional Board `ADR-001`) masih belum dieksekusi | SYSTEM-ARCHITECTURE.md, PROJECT-CONSTITUTION.md, **architecture-decision-records.md** | Technology Stack & Rasionalisasi |
| dependency-manifest.md | 1.6 | ✅ **Baseline (BERLAKU)** — **naik 4 Agu 2026**, mengikuti promosi technology-decisions.md (OD-06) | **1.6** | Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (promosi Baseline, OD-06) — sebelumnya 3 Agu 2026 (naik v1.5→v1.6, sinkron `ADR-026`/`027`/`028` — **tidak ada package npm baru** untuk ketiganya; **ADR-046** OD-07 juga tanpa package baru — murni migration SQL) | Bersamaan dengan technology-decisions.md | technology-decisions.md | Dependency/Package Katalog |
| AI-DEVELOPMENT-BLUEPRINT.md (versi upload, 24 bagian — kini juga dirujuk sebagai `development-playbook.md`) | 1.6 | ✅ **Baseline (BERLAKU)** — **naik 4 Agu 2026** (OD-06 resolved); sebelumnya sudah **ditetapkan sebagai acuan aktif** oleh keputusan user (CHANGELOG Session 5) menggantikan versi Session 3 (32 bagian, kini Archived) | **1.6** | Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (promosi Baseline, OD-06; konvensi soft-delete Bagian 3 diperluas ke 8 tabel — `ADR-046`/OD-07) — sebelumnya 3 Agu 2026 (naik v1.5→v1.6, sinkron `ADR-026`/`027`/`028` — Golden Rule 39 & 40 baru) | Saat AI Workflow/Rules berubah | Seluruh dokumen sumber v1.1 + System Architecture + Technology Decisions | AI Instruction / Development Playbook |
| AI-DEVELOPMENT-BLUEPRINT.md (versi Session 3, 32 bagian) | 1.0 (superseded) | **Archived** (digantikan versi upload, per keputusan Session 5) | — | — | 26–27 Jul 2026 | Tidak ada — arsip permanen | — | Historis saja |
| AI-CONTEXT-PACK.md | 1.0 | Approved | 1.0 (kandidat) | Technical Writer — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 | Saat dokumen sumber v1.1 berubah signifikan | Dokumen sumber v1.1 + AI-DEVELOPMENT-BLUEPRINT.md | Context Ringkas Proyek |
| DEVELOPMENT-ROADMAP.md | 1.0 | Draft | Belum ada | Engineering Manager / Senior Technical PM — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 | Setelah pengesahan tim | Seluruh dokumen sumber + System Architecture + Technology Decisions | Roadmap & Sprint Plan |
| TASK-TEMPLATE.md | 1.0 | Baseline (dinyatakan "BERLAKU") | 1.0 | Staff Software Engineer — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 27 Jul 2026 | Jika ditemukan gap berulang | Seluruh dokumen governance | Format/Unit Kerja Task |
| CURRENT-PROJECT-STATE.md | 0.1 | Baseline (Living Document — berlaku sejak dibuat, wajib update tiap sesi) | 0.1 (per-sesi, berubah dinamis) | Technical Project Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (Readiness Snapshot diperbarui — **6 dari 6 kondisi GO WITH CONDITIONS kini terpenuhi**, resolusi OD-02/06/07) — sebelumnya 3 Agu 2026 (snapshot ADR & Governance, sinkron ADR-026/027/028 — 28/28 ADR Approved) | Akhir setiap sesi development | Kondisi fisik repositori (independen dokumen desain) | Status Implementasi Nyata |
| CHANGELOG.md | **0.3.0** (versi rilis proyek yang dicatat di dalamnya; dokumen itu sendiri tidak diberi nomor versi terpisah) | Baseline (Living Document) | **0.3.0** | Release Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 (rilis `0.3.0` — **MINOR**: genuine scope completion, retrofit skema ID EAF + Modul 12/13 ke PRD/ERD/User Flow/API Spec, 2 dokumen baru) — sebelumnya 4 Agu 2026 (rilis `0.2.1` — PATCH: resolusi administratif/data OD-02/06/07) | Setiap rilis versi baru | CURRENT-PROJECT-STATE.md | History |
| decision-log.md | 1.0 | Baseline (Living Document — "BERLAKU sejak dibuat") | 1.0 (per-ADR, berkembang) | Principal Software Architect / Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 (entry **`ADR-046`** ditambahkan — perluasan soft-delete/OD-07; resolusi administratif **OD-02** & **OD-06** dicatat di §11) — sebelumnya 3 Agu 2026 (entry `ADR-043`/`ADR-044`/`ADR-045` ditambahkan — sinkronisasi `architecture-decision-records.md` `ADR-026`/`027`/`028`; `OD-14`/`OD-15` diregistrasi & diresolusi di §11) | Berkelanjutan (tiap ADR baru) | Seluruh dokumen governance, **architecture-decision-records.md** (sebagai sumber sinkronisasi ADR-038 s.d. ADR-046) | Decision (jurnal kronologis) |
| foundation-validation-report.md | 1.0 | Baseline (dinyatakan "Final — Quality Gate Deliverable") | 1.0 | AI Audit Panel (peran gabungan) | 27 Jul 2026 | Sebelum fase besar berikutnya dimulai | 17 dokumen yang diaudit | Validation |
| Executive Architecture Review | **TBD** | **TBD — dokumen tidak ditemukan dalam repositori yang direview** | **TBD** | **TBD** | **TBD** | **TBD** | **TBD** | Executive Decision (belum ada rujukan aktual) |
| Database Schema (fisik) | — | **Digabung ke ERD-Skema-Database-...v1.3.md Bagian 2A** (5 Agu 2026, keputusan eksplisit Owner) — baris ini ditutup, tidak lagi TBD/Planned terpisah | — | Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 5 Agu 2026 | — (mengikuti siklus ERD) | ERD-Skema-Database v1.3 §2A | Database (Fisik) — kini bagian dari ERD |
| document-governance-baseline-register.md (dokumen ini) | 1.1 | ✅ **Baseline (BERLAKU)** — naik dari Draft, 4 Agu 2026 (OD-06) | **1.1** | Software Configuration Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted) | 4 Agu 2026 | Setiap kali status/versi dokumen lain berubah material | Seluruh dokumen di atas | Tata Kelola Dokumen |

---

# 11. Change Management Rules

Prosedur wajib setiap kali ada permintaan perubahan terhadap dokumen berstatus **Baseline**:

```
Request
   ↓
Decision Log (ADR baru dibuat berstatus "Proposed" — decision-log.md §2, §8)
   ↓
Impact Analysis (cek Document Dependency Matrix §8 — dokumen turunan mana yang ikut terdampak;
                 cek juga Module Dependency & Feature Dependency di AI-DEVELOPMENT-BLUEPRINT.md
                 sesuai catatan decision-log.md §8)
   ↓
Update Document (isi dokumen direvisi menjadi status "Updated", bukan langsung menimpa Baseline)
   ↓
Review (oleh Reviewer sesuai Bagian 9 — Review & Approval Matrix)
   ↓
Approval (oleh Approver berwenang; ADR di decision-log.md naik status menjadi "Approved")
   ↓
New Baseline (nomor versi naik sesuai Bagian 5; Baseline lama diberi status Deprecated →
              lalu Archived setelah masa transisi wajar)
   ↓
Changelog (entri baru ditambahkan di CHANGELOG.md — tidak pernah menimpa entri lama,
           sesuai Aturan Wajib #1–#2 CHANGELOG.md)
```

**Aturan pelengkap:**

1. **AI Coding Assistant tidak berwenang melompati tahap Approval** — ini menegaskan kembali `decision-log.md` Bagian 8 poin terakhir. AI dapat mengisi Request dan membantu Impact Analysis/Update Document, tetapi Approval selalu memerlukan konfirmasi manusia berwenang.
2. **Setiap perubahan wajib menyebut ADR yang menjadi dasarnya** — dokumen yang diperbarui harus mencantumkan nomor ADR terkait di catatan revisinya (pola yang sudah dipakai `PROJECT-CONSTITUTION.md` Bagian "Riwayat Keputusan Arsitektur").
3. **Perubahan yang berdampak ke dokumen berhierarki lebih tinggi tidak sah** — mis. jika perubahan pada `technology-decisions.md` ternyata memerlukan perubahan `PROJECT-CONSTITUTION.md`, Impact Analysis wajib mengeskalasi ADR tersebut sebagai perubahan pada dokumen yang lebih tinggi, bukan menerapkannya sepihak hanya di dokumen turunan.
4. **Tidak ada perubahan "silent"** — perubahan pada dokumen apa pun yang tidak melalui alur ini (mis. edit langsung tanpa ADR) dianggap pelanggaran governance, sesuai semangat `decision-log.md` Bagian 9 poin 4.

---

# 12. Document Update Priority

Ketika terjadi perubahan pada area berikut, dokumen-dokumen ini **wajib diperbarui pertama** (dalam urutan), sebelum dokumen turunan lain menyusul:

| Area Perubahan | Dokumen yang Diperbarui Pertama | Dokumen Turunan yang Menyusul |
|---|---|---|
| **Business Rule** | `PRD-...v1.1.md` → `PROJECT-CONSTITUTION.md` (jika hard rule ikut berubah) | User Flow, API Specification, Development Roadmap, Task terkait |
| **Database** | `ERD-Skema-Database-...v1.1.md` + `ERD-Diagram-...v1.1.mermaid` | API Specification (kontrak field), Database Schema fisik/migration, System Architecture §7 |
| **API** | `API-Specification-...v1.1.md` | User Flow (jika alur ikut berubah), dependency-manifest (jika perlu SDK baru), System Architecture §9 |
| **Security** | `PROJECT-CONSTITUTION.md` Bagian 20 (Security Rules) | SYSTEM-ARCHITECTURE.md §14, AI-CONTEXT-PACK §10, ERD (kolom enkripsi/RLS), API Specification (label Auth) |
| **UI** | User Flow (bila alur berubah) → UI Specification (setelah dibuat — lihat Bagian 15 poin 4) | Functional Specification, Task terkait modul |
| **Architecture Decision (per topik)** | `architecture-decision-records.md` (ADR ber-status Approved terlebih dahulu dikunci) | `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, `decision-log.md` (entry sinkronisasi kronologis) |
| **Technology** | `technology-decisions.md` → `dependency-manifest.md` | SYSTEM-ARCHITECTURE.md §4, AI-DEVELOPMENT-BLUEPRINT.md, PROJECT-CONSTITUTION.md §4 (jika keputusan naik jadi hard rule tertinggi) |
| **Deployment** | `SYSTEM-ARCHITECTURE.md` §18 (Deployment Architecture) → `DEVELOPMENT-ROADMAP.md` (Go Live Checklist) | CURRENT-PROJECT-STATE.md, CHANGELOG.md (entri rilis) |

**Prinsip umum:** dokumen yang menjadi **Source of Truth** (Bagian 7) untuk area yang berubah **selalu** diperbarui lebih dulu — dokumen yang hanya **mengutip** menyusul setelahnya. Ini mencegah pola yang sudah tercatat sebagai Known Issue di `CHANGELOG.md` (keputusan final di satu dokumen turunan namun belum tersinkron ke dokumen sumber yang lebih tinggi).

---

# 13. AI Usage Rules

Aturan wajib bagi AI Coding Assistant apa pun (Claude, Bolt.new, ChatGPT, Cursor, GitHub Copilot, dsb.) saat membaca dan menggunakan dokumentasi proyek:

1. **Selalu mulai dari Project Overview** (`AI-CONTEXT-PACK.md` Bagian 1–2 + `PRD` Bagian 1), lalu `CURRENT-PROJECT-STATE.md`, sebelum membaca dokumen teknis mendalam — konsisten dengan `AI-DEVELOPMENT-BLUEPRINT.md` Bagian 5 (Documentation Reading Order).
2. **Gunakan Source of Truth Matrix (Bagian 7 dokumen ini)** untuk menentukan dokumen mana yang berwenang menjawab suatu pertanyaan — jangan mencampur informasi dari dua dokumen yang membahas topik sama tanpa mengecek mana yang menang.
3. **Jangan mengambil keputusan dari dokumen berstatus Deprecated atau Archived** (mis. `AI-DEVELOPMENT-BLUEPRINT.md` versi Session 3 yang sudah digantikan) — selalu verifikasi status dokumen di Bagian 10 (Baseline Register) sebelum menjadikannya rujukan.
4. **Jangan menggunakan dokumen berstatus Draft sebagai rujukan keputusan final** — perlakukan isinya sebagai *configurable placeholder*, tandai `// TODO: menunggu Baseline`, konsisten dengan penanganan Open Question di seluruh dokumen sumber.
5. **Selalu gunakan versi Baseline terbaru** yang tercatat di Bagian 10 — jika sebuah dokumen memiliki lebih dari satu versi yang beredar (draf revisi sedang berjalan + Baseline lama), Baseline lama yang masih berlaku sampai Baseline baru resmi disahkan (lihat Bagian 4.2).
6. **Jika ditemukan pertentangan antar dokumen yang belum tercatat sebagai Open Decision** — laporkan sebagai temuan ke pengguna/tim, **jangan** memilih salah satu sisi secara sepihak (menegaskan kembali `decision-log.md` Bagian 9 poin 6).
7. **Ikuti hierarki kemenangan dokumen** (`PROJECT-CONSTITUTION.md` > dokumen sumber v1.1 > `SYSTEM-ARCHITECTURE.md` > `architecture-decision-records.md` > `technology-decisions.md` > `dependency-manifest.md` > `AI-DEVELOPMENT-BLUEPRINT.md`) setiap kali dua dokumen tampak memberi instruksi berbeda. **Catatan:** `architecture-decision-records.md` dibaca **sebelum** `technology-decisions.md` (ADR menjelaskan alasan di balik katalog stack), namun ADR ber-status `Open`/`Proposed` di dalamnya tidak mengalahkan apa pun — hanya ADR ber-status `Approved` yang mengikat.
8. **Dokumen ini (`document-governance-baseline-register.md`) tidak dipakai untuk mengambil keputusan isi/teknis** — hanya dipakai untuk menjawab pertanyaan status/versi/ownership/lifecycle dokumen. Untuk isi teknis, tetap rujuk dokumen sumber langsung sesuai Source of Truth Matrix.

---

# 14. Governance Checklist

Checklist wajib diverifikasi **sebelum** Development (Sprint S0 dan seterusnya) dieksekusi penuh ke tahap implementasi kode:

- [ ] Seluruh dokumen inti (Constitution, PRD, ERD, API Spec, User Flow, SEO Spec) berstatus **Baseline** — saat ini: PROJECT-CONSTITUTION.md dan PRD sudah Baseline; ERD/API Spec/User Flow/SEO Spec masih **Approved** (kandidat Baseline, lihat Bagian 10) — **belum sepenuhnya terpenuhi**.
- [ ] Tidak ada **Open Decision** yang memblokir modul yang akan dikerjakan — cek `decision-log.md` Bagian 11 dan `CHANGELOG.md` Known Issues sebelum memulai setiap sprint — **saat ini masih tercatat 8 baris di `decision-log.md` §11, namun secara substansi tinggal 5 yang benar-benar terbuka**: butir #1 (arsitektur backend) sudah dikunci **Approved** via `architecture-decision-records.md` `ADR-001`/`decision-log.md` `ADR-038` (27 Jul 2026); butir #5 (Search Engine **dan** Job Queue) sudah dikunci **Approved** sepenuhnya via `ADR-005`/`ADR-039` (28 Jul 2026) dan `ADR-006`/`ADR-040` (29 Jul 2026) — `CHANGELOG.md` Known Issue #1 ditandai `RESOLVED (0.1.1)` dan Known Issue #5 kini sepenuhnya ditandai `RESOLVED (0.1.3)`. Baris #1 dan #5 di `decision-log.md` §11 itu sendiri **belum diformat ulang** sepenuhnya menjadi status Resolved terpisah (masih memakai strikethrough sebagian, sesuai aturan "tidak menghapus histori"). Sebagian sisanya bersifat blocking untuk sprint tertentu (lihat tabel di `decision-log.md` §11).
- [ ] **Decision Log** dalam kondisi terbaru — seluruh keputusan yang relevan dengan sprint yang akan dikerjakan sudah tercatat sebagai ADR. **Terkini**: entry `ADR-040` (29 Jul 2026) sudah menyinkronkan keputusan Job Queue Strategy dari `architecture-decision-records.md` `ADR-006`.
- [ ] **Changelog** dalam kondisi terbaru — versi proyek saat ini (`0.1.5`) mencerminkan kondisi nyata repositori (rilis Governance Sync: resolusi `ADR-018` + sinkronisasi berantai ke `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `PROJECT-CONSTITUTION.md`, `AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md`).
- [ ] **Dependency antar dokumen konsisten** — tidak ada dokumen turunan yang mengklaim sesuatu "final" sementara dokumen sumbernya masih mencatat "terbuka" (lihat Governance Notes Bagian 15 untuk daftar ketidaksesuaian yang masih berjalan). **Item baru:** `technology-decisions.md`/`dependency-manifest.md` belum mencantumkan **Bolt.new** sebagai toolchain resmi, sesuai catatan kondisional Board di `ADR-001` — masih terbuka (lihat Governance Notes poin 7).
- [ ] **Source of Truth jelas** untuk setiap topik yang akan disentuh sprint — verifikasi lewat Bagian 7 dokumen ini sebelum menulis kode. **Diperbarui**: Bagian 7 kini membedakan `architecture-decision-records.md` (ADR per topik arsitektur) dari `decision-log.md` (jurnal kronologis lintas proyek).
- [ ] **Siap digunakan AI** — AI Context Pack, AI Development Blueprint, Task Template tersedia dan konsisten satu sama lain.
- [ ] **Functional Specification & UI Specification** — status Planned, belum ada file — direkomendasikan disusun sebelum atau paralel dengan Module Planning penuh (konsisten dengan `foundation-validation-report.md` §16, §18).
- [x] **Nama individu Owner/Reviewer/Approver** ditetapkan untuk setiap dokumen di Bagian 9 & 10 — **RESOLVED 4 Agustus 2026** (OD-06): seluruh kolom Owner di Bagian 9 & 10 ditetapkan ke **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**, mengikuti model proyek solo (satu individu menjalankan seluruh peran governance — Technical Lead, Product Owner, Database Architect, API Architect, dst.), bukan tim multi-peran terpisah. Kolom **Reviewer**/**Approver** di Bagian 9 tetap berbasis-peran (bukan berarti kosong) karena secara struktural peran-peran itu semuanya dijalankan oleh individu yang sama — dicatat eksplisit di Bagian 15 Governance Notes agar tidak disalahartikan sebagai pemisahan tugas (segregation of duties) formal.

> **Status checklist saat ini:** **CONDITIONAL PASS** (istilah dipinjam dari `foundation-validation-report.md` Bagian 19) — proyek boleh melanjutkan ke Sprint S0 karena tidak ada temuan Critical yang memblokir fondasi teknis, namun item yang belum tercentang di atas sebaiknya diselesaikan paralel, terutama sebelum Module Planning penuh menyentuh modul yang berdampak pada Open Decision aktif (lihat Bagian 15).

---

# 15. Governance Notes

> Bagian ini murni **catatan rekomendasi hasil pengamatan** selama penyusunan dokumen governance ini. **Tidak ada isi dokumen sumber mana pun yang diubah** untuk menyusun catatan berikut — seluruhnya bersifat advisory, menunggu keputusan eksplisit manusia berwenang.

1. **Status "Draft" vs isi yang disebut "final"** — `technology-decisions.md`, `dependency-manifest.md`, `DEVELOPMENT-ROADMAP.md`, dan `AI-DEVELOPMENT-BLUEPRINT.md` seluruhnya berstatus dokumen "Draft — menunggu pengesahan tim", namun isinya berulang kali menyebut keputusan di dalamnya sebagai "resmi dan final" atau "mengikat". Ini menciptakan ambiguitas status Baseline (lihat Bagian 10) — direkomendasikan tim menetapkan Approval formal secara eksplisit (nama individu + tanggal) agar keempat dokumen ini dapat naik status menjadi Baseline yang konsisten dengan isinya.
2. **Klasifikasi versi v1.0 → v1.1 pada dokumen sumber** — berdasarkan kriteria Semantic Versioning di Bagian 5 dokumen ini, revisi v1.0→v1.1 pada PRD/ERD/API Spec/User Flow/SEO Spec (migrasi `city`→`city_id`, formalisasi role baru) mengandung elemen yang secara definisi lebih dekat ke **MAJOR** (breaking change konseptual) dibanding **MINOR**. Ini bukan kesalahan — `CHANGELOG.md` Aturan Wajib #3 sendiri sudah mengantisipasi hal ini ("selama fase Initial Development 0.y.z, kenaikan minor dapat menyertakan perubahan lebih besar dari biasanya"). Dicatat di sini murni sebagai referensi silang, bukan usulan mengubah penomoran yang sudah dipakai proyek.
3. **Dua dokumen yang disebutkan dalam daftar dokumen proyek namun tidak ditemukan sebagai file terpisah**: (a) **"Database Schema"** — dokumen ini disebut terpisah dari ERD pada permintaan penyusunan, namun repositori yang direview hanya berisi `ERD-Skema-Database-...v1.1.md` (skema **logis**) dan `ERD-Diagram-...v1.1.mermaid`; belum ada skema **fisik**/migration terpisah — ini konsisten dengan `CURRENT-PROJECT-STATE.md` yang menyatakan database fisik belum diinisialisasi (0% kode), sehingga kekosongan ini **diharapkan** pada tahap ini. (b) **"Executive Architecture Review"** — disebut ada dalam daftar dokumen proyek pada permintaan penyusunan, namun tidak ditemukan sebagai file dalam repositori yang direview untuk menyusun dokumen ini. Direkomendasikan tim mengklarifikasi apakah dokumen ini sudah ada di lokasi lain (belum diupload) atau memang belum dibuat — jika belum dibuat, statusnya di Bagian 10 tetap **Planned/TBD** sampai file tersedia.
4. **Functional Specification & UI Specification** — konsisten dengan temuan `foundation-validation-report.md` Bagian 4, 17, dan 18, kedua dokumen ini secara eksplisit **belum ada sebagai file** di repositori manapun yang direview. `AI-DEVELOPMENT-BLUEPRINT.md` Bagian 5 sendiri sudah menandai gap ini secara sadar ("bukan kesalahan penyusunan, melainkan keputusan sadar agar Blueprint tidak menciptakan sumber kebenaran palsu"). Baseline Register (Bagian 10) mencerminkan status ini apa adanya sebagai **Planned**, bukan memberi status yang tidak dapat diverifikasi.
5. **Duplikasi Known Issues dan Open Decisions** — `CHANGELOG.md` (bagian "Known Issues") dan `decision-log.md` (Bagian 11 "Open Decisions") mencatat sebagian besar item yang **sama** (arsitektur backend, Search Engine, Job Queue, Vercel, Google Maps, provider Email/Monitoring) dengan penomoran dan redaksi yang sedikit berbeda. `foundation-validation-report.md` Bagian 17 (LOW priority) sudah merekomendasikan konsolidasi keduanya menjadi satu daftar kanonik bersilang-referensi — dokumen governance ini tidak mengambil keputusan konsolidasi tersebut, hanya meneruskan rekomendasi yang sudah ada.
6. **Kepemilikan (Owner) seluruh dokumen governance masih berupa peran, bukan nama individu** — konsisten di `technology-decisions.md` §1, `decision-log.md` §1, `DEVELOPMENT-ROADMAP.md` §1 header. Direkomendasikan sebagai item tindak lanjut administratif sebelum Sprint S1 dimulai, agar Review & Approval Matrix (Bagian 9 dokumen ini) dapat diisi dengan nama nyata, bukan TBD.
7. **Sinkronisasi 27 Juli 2026 — `architecture-decision-records.md` masuk Baseline Register.** Dokumen ini sebelumnya **tidak terdaftar** di Bagian 10 meski sudah ada sebagai file terpisah — gap ini kini ditutup (baris baru ditambahkan, jumlah dokumen terdaftar naik dari 18 menjadi 19). ADR terbaru di dalamnya, `ADR-001` (Backend Architecture: Next.js Route Handlers, tanpa service Node terpisah), berstatus **Approved** (27 Jul 2026, hasil Architecture Review Board) dan telah disinkronkan secara kronologis ke `decision-log.md` sebagai `ADR-038`, serta ditandai `RESOLVED (0.1.1)` di `CHANGELOG.md` Known Issues #1. **Dua item turunan masih terbuka**, bukan diasumsikan selesai: (a) **Bolt.new** sebagai toolchain resmi proyek belum ditambahkan eksplisit ke `technology-decisions.md`/`dependency-manifest.md` — ini adalah catatan kondisional Architecture Review Board pada `ADR-001` itu sendiri; (b) redaksi usang di `SYSTEM-ARCHITECTURE.md` (batas eksekusi serverless Vercel) yang menjadi catatan kondisional kedua dari Board belum dieksekusi. Kedua item ini direkomendasikan menjadi prioritas sinkronisasi berikutnya sebelum `technology-decisions.md`/`SYSTEM-ARCHITECTURE.md` dapat naik status Baseline.
8. **Ambiguitas penomoran "ADR-" antar dua dokumen berbeda** — `architecture-decision-records.md` memakai penomoran independen `ADR-001`–`ADR-025` (per topik arsitektur), sedangkan `decision-log.md` memakai penomoran independen `ADR-001`–`ADR-039` (kronologis, lintas seluruh keputusan proyek termasuk non-teknis). Kedua ruang nomor **tidak berbagi identitas** meski memakai prefiks sama — dicatat secara eksplisit oleh `architecture-decision-records.md` sendiri (Bagian 2) sebagai potensi ambiguitas penamaan, **belum diputuskan** solusinya (mis. prefiks pembeda seperti `TADR-` vs `DADR-`) karena itu adalah keputusan tata kelola dokumen, bukan keputusan arsitektur — diteruskan di sini sebagai rekomendasi terbuka, bukan diputuskan sepihak oleh dokumen ini.
9. **Sinkronisasi 28 Juli 2026 — `ADR-005` (Search Strategy) diselesaikan Approved dan disinkronkan berantai.** Menyusul pola yang sama dengan `ADR-001` (lihat poin 7), `architecture-decision-records.md` `ADR-005` mengunci strategi bertahap — PostgreSQL Full-Text Search + `pg_trgm` untuk Fase 1, migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit — sebagai keputusan **Approved** (hasil Architecture Review Board, 28 Jul 2026). Disinkronkan secara kronologis ke `decision-log.md` sebagai `ADR-039`, ditandai `RESOLVED (0.1.2)` di `CHANGELOG.md` Known Issues bagian Search Engine (dari butir #5), dan disinkronkan berantai ke `technology-decisions.md` (v1.1→v1.2), `SYSTEM-ARCHITECTURE.md` (v1.1→v1.2), `dependency-manifest.md` (v1.1→v1.2), `PROJECT-CONSTITUTION.md` (v1.2→v1.3), dan `AI-DEVELOPMENT-BLUEPRINT.md` (v1.1→v1.2) pada sesi yang sama — **bukan dua pekerjaan terpisah yang boleh drift**, konsisten dengan `PROJECT-CONSTITUTION.md` Bagian 25 poin 4. **Dua item turunan masih terbuka**, diwariskan dari catatan kondisional Board `ADR-005` itu sendiri: (a) proyeksi volume listing realistis 6–12 bulan pertama perlu dikonfirmasi tim bisnis untuk memvalidasi angka ambang migrasi 50.000 baris; (b) kapasitas DevOps/anggaran Typesense untuk Fase 2 perlu dikonfirmasi sebelum kriteria ambang tercapai. Dengan resolusi ini, **22 dari 25 ADR** kini berstatus Approved (naik dari 21), menyisakan **3 ADR OPEN** (`ADR-006` Job Queue, `ADR-008` Maps, `ADR-018` Caching) — item turunan `ADR-001` yang masih terbuka (Bolt.new, redaksi serverless) **tetap belum dieksekusi**, tidak diselesaikan oleh sesi ini.
10. **Sinkronisasi 29 Juli 2026 — `ADR-006` (Job Queue Strategy) diselesaikan Approved dan disinkronkan berantai.** Menyusul pola yang sama dengan `ADR-001` dan `ADR-005` (lihat poin 7 & 9), `architecture-decision-records.md` `ADR-006` mengunci strategi hybrid native — Vercel Cron Jobs (tugas terjadwal periodik) + Postgres Trigger/Database Webhook (tugas event-driven instan) untuk Fase 1, migrasi terjadwal ke QStash (Upstash) di Fase 2 berdasarkan kriteria ambang eksplisit — sebagai keputusan **Approved** (hasil Architecture Review Board, 29 Jul 2026). **BullMQ+Redis ditolak** karena worker long-running-nya tidak kompatibel dengan model serverless Vercel yang dikunci `ADR-001`. Disinkronkan secara kronologis ke `decision-log.md` sebagai `ADR-040`, ditandai `RESOLVED (0.1.3)` di `CHANGELOG.md` Known Issues #5 (kini sepenuhnya resolved bersama bagian Search Engine), dan disinkronkan berantai ke `technology-decisions.md` (v1.2→v1.3), `SYSTEM-ARCHITECTURE.md` (v1.2→v1.3), `dependency-manifest.md` (v1.2→v1.3), `PROJECT-CONSTITUTION.md` (v1.3→v1.4), dan `AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md` (v1.2→v1.3) pada sesi yang sama — **bukan dua pekerjaan terpisah yang boleh drift**, konsisten dengan `PROJECT-CONSTITUTION.md` Bagian 25 poin 4. **Dua item turunan masih terbuka**, diwariskan dari catatan kondisional Board `ADR-006` itu sendiri: (a) tier Vercel produksi (Hobby/Pro/Enterprise) perlu dikonfirmasi — menentukan batas jumlah/frekuensi Cron Jobs; (b) status resmi fitur Agent Workspace di roadmap perlu dikonfirmasi tim produk. Dengan resolusi ini, **23 dari 25 ADR** kini berstatus Approved (naik dari 22), menyisakan **2 ADR OPEN** (`ADR-008` Maps, `ADR-018` Caching) — item turunan `ADR-001` dan `ADR-005` yang masih terbuka (Bolt.new, redaksi serverless, proyeksi volume listing, anggaran Typesense) **tetap belum dieksekusi**, tidak diselesaikan oleh sesi ini. **Catatan penamaan:** `AI-DEVELOPMENT-BLUEPRINT.md` kini juga dirujuk sebagai `development-playbook.md` di dokumen-dokumen terbaru (lihat Bagian 10) — keduanya merujuk file yang sama, bukan dua dokumen terpisah; direkomendasikan konsolidasi nama tunggal pada revisi berikutnya.
11. **Sinkronisasi 30 Juli 2026 — `ADR-008` (Maps Provider) diselesaikan Approved (direvisi v3) dan disinkronkan berantai, menggantikan `ADR-028`.** Berbeda dari pola `ADR-001`/`ADR-005`/`ADR-006` (poin 7, 9, 10), keputusan ini bukan penyelesaian pertama dari status murni OPEN — `ADR-028` sebelumnya sudah tercatat **Approved** (27 Jul 2026: Google Maps Platform) namun dengan caveat internal (menunggu konfirmasi biaya bisnis), sehingga secara efektif berfungsi sebagai keputusan terbuka. Prioritas proyek direvisi ke tiga kriteria dominan (budget-friendly, adopsi komunitas developer Indonesia, Bolt-friendliness), memicu re-evaluasi penuh via sesi Architecture Review Board lanjutan (CTO, Enterprise Software Architect, Solution Architect, GIS Architect, Senior Next.js Engineer, Senior Supabase Engineer). Hasil akhir: **Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider** — Fase 1, dilengkapi caching Postgres (`geocode_cache`), rate limiting scoped, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP→Growth→Scale→Enterprise (termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise, bukan ditolak permanen). Disinkronkan secara kronologis ke `decision-log.md` sebagai **`ADR-041`**, yang secara eksplisit mencantumkan **Replaces: `ADR-028`** — entry `ADR-028` itu sendiri **tidak diedit isinya**, hanya status berubah menjadi `Replaced` dengan catatan referensi (konsisten `decision-log.md` Bagian 2 poin 2–3, "history tidak boleh dihapus/ditulis ulang"). Ditandai `RESOLVED (0.1.4)` di `CHANGELOG.md` Known Issues #4, dan disinkronkan berantai ke `technology-decisions.md` (v1.3→v1.4), `SYSTEM-ARCHITECTURE.md` (v1.3→v1.4), `dependency-manifest.md` (v1.3→v1.4), `PROJECT-CONSTITUTION.md` (v1.4→v1.5), dan `development-playbook.md` (v1.3→v1.4) pada sesi yang sama — **bukan pekerjaan terpisah yang boleh drift**, konsisten `PROJECT-CONSTITUTION.md` Bagian 25 poin 4. **Tiga item turunan masih terbuka**, diwariskan dari catatan kondisional Board `ADR-008` itu sendiri: (a) uji akurasi data OSM untuk sampel alamat kompleks perumahan riil sebelum Sprint S4; (b) pemantauan kuota harian LocationIQ (5.000/hari) sejak Sprint S0; (c) proyeksi volume listing/traffic dari tim bisnis untuk menetapkan angka konkret ambang migrasi tahap Growth. Item turunan `ADR-001`/`ADR-005`/`ADR-006` yang masih terbuka (Bolt.new, redaksi serverless, proyeksi volume listing, anggaran Typesense, tier Vercel produksi, status Agent Workspace) **tetap belum dieksekusi**, tidak diselesaikan oleh sesi ini. Dengan resolusi ini, **24 dari 25 ADR** kini berstatus Approved (naik dari 23), menyisakan **1 ADR OPEN** (`ADR-018` Caching Strategy) — satu-satunya ADR yang masih memerlukan keputusan manusia di seluruh dokumen `architecture-decision-records.md`. **Sinkronisasi tambahan:** `API-Specification-RUMAHAGEN-v1.1.md` §13/§9.1 **belum** disinkronkan redaksional pada sesi ini (masih mencatat provider Maps versi lama secara implisit) — dicatat sebagai gap tersisa, konsisten pola pelaporan gap yang sudah dipakai poin 7 untuk `PROJECT-CONSTITUTION.md` §4 pada sinkronisasi `ADR-001`.
12. **Sinkronisasi 31 Juli 2026 — `ADR-018` (Caching Strategy) diselesaikan Approved dan disinkronkan berantai — ADR terakhir yang tersisa.** Menyusul pola yang sama dengan `ADR-001`/`ADR-005`/`ADR-006` (poin 7, 9, 10), keputusan ini sebelumnya digantung pada hasil `ADR-006` (Job Queue) — jika BullMQ dipilih, Redis otomatis tersedia untuk kebutuhan ini sekaligus. Karena `ADR-006` final tanpa Redis, `architecture-decision-records.md` `ADR-018` dievaluasi & diselesaikan secara independen via sesi Architecture Review Board (31 Jul 2026): rate limiting & application-level cache Fase 1 (MVP) diimplementasikan **native di atas Supabase Postgres** — tabel dedicated `rate_limit_log` (pola sliding window), tanpa menambah infrastruktur cache/in-memory-store baru — sebagai keputusan **Approved**, dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). Disinkronkan secara kronologis ke `decision-log.md` sebagai **`ADR-042`** — keputusan ini **tidak menggantikan (Supersedes/Replaces)** ADR manapun, murni transisi status OPEN → Approved untuk topik yang sebelumnya belum pernah tercatat sebagai keputusan aktif. Ditandai di `CHANGELOG.md` rilis `0.1.5`, dan disinkronkan berantai ke `technology-decisions.md` (v1.4→v1.5), `SYSTEM-ARCHITECTURE.md` (v1.4→v1.5), `dependency-manifest.md` (v1.4→v1.5), `PROJECT-CONSTITUTION.md` (v1.5→v1.6), dan `development-playbook.md` (v1.4→v1.5) pada sesi yang sama — **bukan pekerjaan terpisah yang boleh drift**, konsisten `PROJECT-CONSTITUTION.md` Bagian 25 poin 4. **Dua catatan kondisional dari Board (belum ditutup)**, diwariskan dari `ADR-018` itu sendiri: (a) struktur tabel final, algoritma sliding window presisi, dan threshold angka per jenis endpoint belum ditentukan — direkomendasikan diselesaikan bersamaan Sprint S1 (Authentication); (b) angka kriteria ambang migrasi (10.000 req/menit, 15% load) belum divalidasi data traffic produksi nyata — perlu ditinjau ulang begitu monitoring pasca-launch tersedia. Item turunan `ADR-001`/`ADR-005`/`ADR-006`/`ADR-008` yang masih terbuka (Bolt.new, redaksi serverless, proyeksi volume listing, anggaran Typesense, tier Vercel produksi, status Agent Workspace, uji akurasi OSM, kuota LocationIQ) **tetap belum dieksekusi**, tidak diselesaikan oleh sesi ini. **Dengan resolusi ini, 25 dari 25 ADR kini berstatus Approved (naik dari 24) — tidak ada lagi ADR arsitektur/teknis yang OPEN di seluruh dokumen `architecture-decision-records.md` maupun proyek secara keseluruhan.** Dengan ini pula, `technology-decisions.md` tidak lagi memiliki Open Decision arsitektur/teknis yang menghalangi status Baseline-nya (lihat Bagian 10) — hanya menunggu pengesahan formal tim (nama individu Reviewer/Approver) sebagaimana dicatat di Governance Notes poin 1 & 6. **Sinkronisasi tambahan:** `API-Specification-RUMAHAGEN-v1.1.md` §0 (konvensi error handling `429`/`Retry-After`) **belum** disinkronkan redaksional pada sesi ini — dicatat sebagai gap tersisa, konsisten pola pelaporan gap yang sudah dipakai poin 7 & 11.
13. **(Baru) Sinkronisasi 3 Agustus 2026 — `ADR-026`/`ADR-027` (Organization Management System) dan `ADR-028` (AI Assistant Integration/BYOK) diselesaikan dan disinkronkan berantai — siklus governance pertama berbasis proposal eksternal, bukan Open Decision internal.** Berbeda dari 12 poin sebelumnya (yang seluruhnya berasal dari Open Decision yang sudah tercatat di `decision-log.md`/`foundation-validation-report.md` sejak awal proyek), ketiga ADR ini berasal dari **proposal evolusi arsitektur baru** (`Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`) yang diajukan Business Owner di luar siklus governance yang sudah berjalan — draft ADR sudah lengkap saat diajukan, sesi Board memverifikasi kelengkapan (bukan menyusun dari nol). Hasil: `ADR-026` **Approved With Notes** (entitas Organization), `ADR-027` **Approved** (otorisasi Organization-scoped, tidak mengamandemen ADR-024), `ADR-028` **Approved With Notes** (BYOK AI Assistant, 4 provider terkurasi). Status `ADR-023` (Multi-Tenancy Strategy) direvisi (bukan diedit) — dicatat sebagai Update, bukan entri baru. Disinkronkan ke `decision-log.md` sebagai `ADR-043`/`ADR-044`/`ADR-045`, dengan `OD-14`/`OD-15` diregistrasi dan diresolusi di §11 pada siklus yang sama. Disinkronkan berantai ke `PROJECT-CONSTITUTION.md` (v1.6→v1.7), `technology-decisions.md` (v1.5→v1.6), `SYSTEM-ARCHITECTURE.md` (v1.5→v1.6), `dependency-manifest.md` (v1.5→v1.6, **tanpa dependency baru**), `development-playbook.md` (v1.5→v1.6). `CHANGELOG.md` dirilis sebagai **`0.2.0`** — **kenaikan MINOR pertama** (bukan PATCH seperti lima siklus ADR sebelumnya), karena ini genuine scope addition (2 modul baru), bukan resolusi ADR atas kebutuhan yang sudah tercakup 11 modul asli. **Cakupan sengaja dibatasi**: `PRD.md`/`ERD-Skema-Database.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` v1.1 **belum disentuh** pada siklus ini — pertama kalinya siklus sinkronisasi proyek ini menjadwalkan perubahan pada kelima dokumen tsb, namun eksekusinya sengaja ditunda ke paket terpisah (dikonfirmasi eksplisit oleh pemohon). **Item turunan dari 12 poin sebelumnya yang masih terbuka tetap belum dieksekusi**, tidak diselesaikan oleh sesi ini. **Temuan tambahan (di luar cakupan permintaan siklus, ditemukan & diperbaiki karena menyentuh file yang sama):** regresi status `ADR-005`/`ADR-006` di `architecture-decision-records.md` — keduanya sempat ter-*revert* keliru menjadi status OPEN pada revisi 30 Juli 2026 (siklus `ADR-008`) akibat kesalahan editing, tidak terdeteksi pada revisi 31 Juli 2026 (siklus `ADR-018`) — ditemukan lewat audit riwayat 5 versi dokumen dan dipulihkan pada siklus ini berdasarkan rekaman versi 28–29 Juli 2026, dikonfirmasi oleh 9 dokumen turunan yang tidak ikut ter-regresi. **Dengan resolusi ADR-026/027/028 ini, 28 dari 28 ADR kini berstatus Approved/Approved With Notes — tidak ada lagi ADR arsitektur/teknis yang OPEN di seluruh dokumen `architecture-decision-records.md` maupun proyek secara keseluruhan.**
14. **(Baru) Sinkronisasi 4 Agustus 2026 — Resolusi OD-02, OD-06, OD-07 (administratif/data, bukan siklus ADR arsitektur baru).** Berbeda dari 13 poin sebelumnya, ketiga item ini bukan proposal arsitektur baru maupun ADR OPEN yang menunggu Architecture Review Board — ketiganya adalah **Open Decision administratif/data** yang sudah lama tercatat (asal: `executive-architecture-review.md` §9, dikonsolidasikan di `project-manifest.md` §7), diselesaikan langsung oleh Business Owner:
    - **OD-02 (Jumlah seed role final, 7 vs 8):** RESOLVED — **7 role dengan baris fisik** di tabel `roles` (`superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`); **Guest eksplisit BUKAN baris `roles`** — direpresentasikan sebagai state tidak-login (tanpa `role_id`), konsisten dengan `PROJECT-CONSTITUTION.md` Bagian 3.1 dan `ERD-Skema-Database-...v1.1.md` Bagian 2.28 yang sudah sejak awal tidak pernah mencantumkan `guest` sebagai kode role. Disinkronkan ke `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `decision-log.md`, `project-manifest.md`, `architecture-decision-records.md` (ADR-004 Notes) — seluruhnya sebelumnya keliru mencatat "8".
    - **OD-06 (Kepemilikan dokumen governance, nama individu):** RESOLVED — seluruh field **Owner** di 6 dokumen berheader Owner (`architecture-decision-records.md`, `decision-log.md`, `dependency-manifest.md`, `development-playbook.md`, `document-governance-baseline-register.md` [dokumen ini], `technology-decisions.md`) dan kolom Owner di tabel `project-manifest.md` §4 serta dokumen ini §10, ditetapkan ke **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**. **Nuansa penting:** ini adalah proyek solo dengan AI assistance, bukan tim multi-peran — satu individu menjalankan seluruh kapasitas peran (Technical Lead, Product Owner, Database Architect, API Architect, dst.) yang sebelumnya tercatat sebagai placeholder role generik. Kolom Reviewer/Approver di Bagian 9 dokumen ini sengaja **tetap berbasis-peran**, bukan diduplikasi jadi nama pada tiap baris, karena tidak ada segregation of duties formal pada model solo ini — dicatat eksplisit agar tidak disalahartikan.
    - **OD-07 (Kebijakan soft-delete seragam):** RESOLVED — kebijakan diperluas dari 3 tabel eksplisit (`listings`, `users`, `developer_projects`, ADR-004/ADR-030 asli) menjadi **8 tabel**, menambahkan `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` — didasarkan pada prinsip **soft-delete untuk entitas yang direferensikan FK oleh tabel lain atau tampil di halaman publik/bernilai audit; hard-delete hanya untuk data child/log/transien murni**. Dicatat sebagai **ADR-046** (perluasan, bukan penggantian ADR-004/ADR-030) di `decision-log.md`. Disinkronkan ke `ERD-Skema-Database-...v1.1.md` (v1.1→v1.2), `SYSTEM-ARCHITECTURE.md`, `development-playbook.md`, `architecture-decision-records.md` (ADR-004 Notes).
    - **Dampak governance ganda:** ketiga item ini adalah **persis** kondisi #2, #5, #6 dari 6 "GO WITH CONDITIONS" resmi CTO (`executive-architecture-review.md` §14) yang selama ini tercatat "belum terpenuhi" — dengan resolusi ini, **6 dari 6 kondisi CTO kini terpenuhi**, menghapus blocker eksplisit terakhir bagi Sprint S1 ke atas (backend/API/database) — lihat `CURRENT-PROJECT-STATE.md` Readiness Snapshot & `project-manifest.md` §2/§3 untuk detail. Disinkronkan berantai ke `PROJECT-CONSTITUTION.md`, `CURRENT-PROJECT-STATE.md`, `CHANGELOG.md` (rilis `0.2.1`, PATCH — resolusi administratif/data, bukan penambahan cakupan sistem seperti `0.2.0`), dan `project-manifest.md` (v1.5→v1.6) pada sesi yang sama. **Cakupan sengaja dibatasi:** `PRD.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` **tidak disentuh** pada siklus ini (tidak ada dampak konten dari ketiga OD ini ke keempat dokumen tsb) — hanya `ERD-Skema-Database.md` yang disentuh (soft-delete). Paket sinkronisasi Modul 12/13 (`Prompt-Open-Decision-ADR-Governance-Sync.md` paket kedua) **tetap terpisah**, belum dieksekusi pada siklus ini.
15. **(Baru) Konsolidasi 5 Agustus 2026 — `architecture-decision-records.md` naik v1.0→v1.1, 9 file snapshot digabung menjadi 1 file master, regresi `ADR-005`/`ADR-006` diperbaiki tuntas.** Berbeda dari 14 poin sebelumnya, siklus ini **bukan** ADR baru maupun resolusi Open Decision — murni perbaikan integritas dokumentasi. Audit konfigurasi kata-per-kata terhadap 9 file snapshot revisi (`__1_` s.d. `__9_`, 27 Jul–4 Ags 2026) menemukan bahwa perbaikan regresi `ADR-005`/`ADR-006` yang diklaim tuntas pada poin 13 di atas (3 Agustus 2026) **ternyata hanya menyentuh narasi ringkasan** (Bagian 5/6/7/8, Governance Notes) — entri sumber otoritatif Bagian 4 tidak ikut diperbaiki, tetap berisi teks draf 27 Juli 2026 selama ±6 hari tanpa disadari. Entri Bagian 4 kini dipulihkan penuh; ditambahkan Bagian 1A (Revision History) dan baris `Cross-reference: decision-log.md ADR-XXX` ke `ADR-001`/`005`/`006`/`008`/`018`; field `Dependencies` `ADR-001`/`006` diperbarui redaksional. Field Status internal dokumen disinkronkan ke **Baseline** (sebelumnya masih tertulis "Draft" meski sudah dideklarasikan Baseline oleh `project-manifest.md` sejak 4 Agustus — lihat baris Bagian 10 di atas). **Impact Analysis mengonfirmasi tidak ada dokumen turunan lain yang memerlukan revisi konten**: 9 dokumen (`technology-decisions.md`, `PROJECT-CONSTITUTION.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`) tidak pernah ikut ter-regresi dan tetap konsisten mencatat ADR-005/006 sebagai Approved sepanjang periode tsb. Hanya 3 dokumen yang diperbarui pada siklus ini: `CHANGELOG.md` (rilis `0.2.2`, PATCH), `project-manifest.md` (rujukan versi `architecture-decision-records.md`), dan dokumen ini (baris Bagian 10 + poin Governance Notes ini). **Rekomendasi penamaan file** (tidak diputuskan sepihak di sini, murni saran governance): gunakan versi resmi dokumen di nama file (`architecture-decision-records-v1.1.md`) alih-alih angka urut upload otomatis; arsipkan versi lama ke sub-folder terpisah setelah versi baru final — lihat `ADR-Consolidation-Supporting-Deliverables.md` Bagian 4 untuk detail lengkap.

16. **(Baru) Engineering Alignment Cycle 5 Agustus 2026 — retrofit skema ID EAF + Modul 12/13 dieksekusi penuh ke PRD/ERD/User Flow/API Spec, menuntaskan paket yang ditunda sejak poin 13.** Menyusul `Engineering-Alignment-Framework-v1.0.md` sebagai standar proses mengikat (Bab 10/12/16-21/23/24/28/30.3/31), siklus ini mengeksekusi urutan dokumen wajib (PRD → Entity Mapping → ERD → User Flow → Database Schema → API Spec → Role Matrix → Permission Matrix). Hasil: `PRD.md` **1.1→1.2** (114 `REQ-XXX`, Modul 12/13 ditambahkan penuh); `Entity-Mapping.md` **dibuat baru (v1.0, Draft)** — dokumen yang tercatat belum pernah ada sejak poin 3 di atas, 44 `ENT-XXX` diregistrasi; `ERD-Skema-Database.md` **1.2→1.3** (disinkronkan ke Entity Mapping, 5 tabel M12/13 baru, **Database Schema fisik digabung Bagian 2A** — menutup baris TBD/Planned sejak poin 3); `User-Flow.md` **1.1→1.2** (retrofit `REQ-XXX`, alur M12/13); `API-Specification.md` **1.1→1.2** (19 endpoint M12/13 baru, **sekaligus mengoreksi 2 gap sinkronisasi lama** yang sudah dicatat sejak poin 11 [`ADR-008` Maps] namun belum tereksekusi — kini sinkron penuh ke `ADR-005`/`ADR-008`); `Authorization-Access-Control-Specification.md` **dibuat baru (v1.0, Draft)** — menggabungkan Role Matrix & Permission Matrix (113 `PERM-XXX`, 7 role final resolusi OD-02) menjadi satu file sesuai keputusan Owner. **0 EAI-XXX diregistrasi** — seluruh gap terselesaikan via keputusan eksplisit Owner (cakupan Modul 12/13) atau sinkronisasi ke ADR yang sudah Approved, bukan konflik dua keputusan bersaing (EAF Bab 24.3). Seluruh versi lama (PRD v1.1, ERD v1.2, User Flow v1.1, API Spec v1.1) diberi status **Deprecated**, dipertahankan sebagai referensi historis — tidak dihapus, sesuai Bagian 4.2 poin 2 dokumen ini. `CHANGELOG.md` dirilis sebagai **`0.3.0`** (MINOR — genuine scope completion). **Gap non-blocking dicatat untuk siklus berikutnya**, bukan diasumsikan selesai: (a) `BR-XXX` (Business Rule ID, EAF Bab 17) belum diregistrasi di PRD; (b) API Specification belum punya ID endpoint formal (`API-XXX`); (c) `ERD-Diagram-...v1.1.mermaid` belum disinkronkan ke ERD v1.3; (d) `SEO-Analytics-Specification.md` di luar cakupan siklus ini. **Status Draft eksplisit**: `Entity-Mapping-...v1.0.md` dan `Authorization-Access-Control-Specification-v1.0.md` **belum** naik Baseline — menunggu pengesahan eksplisit Owner, bukan diasumsikan otomatis Baseline karena dibuat AI-assisted.

17. **(Baru) 5 Agustus 2026 — Functional Specification, UI Specification, dan Technical Specification dibuat sebagai dokumen baru, menutup gap yang tercatat sejak poin 4 di atas.** Ketiga dokumen ini **sebelumnya secara eksplisit belum ada sebagai file** (poin 4, mengutip `foundation-validation-report.md` Bagian 4/17/18) — Functional & UI Specification berstatus **Planned**, Technical Specification berstatus **Ready with Notes** (bahan baku tersedia, belum dikonsolidasi). Disusun mengikuti urutan wajib `foundation-validation-report.md` Bagian 16 langkah 6-8 (Functional → UI → Technical), menggunakan dokumen hasil poin 16 (PRD v1.2, ERD v1.3, API Spec v1.2, Entity Mapping v1.0, Authorization Spec v1.0) sebagai basis — bukan versi lama yang sudah Deprecated. Hasil: `Functional-Specification.md` **dibuat baru (v1.0, Draft)** — 43 layar terdaftar sebagai Screen Inventory master, 2 layar (Form Listing, Kalkulator DBR) mendapat spesifikasi field-per-field presisi penuh sesuai rekomendasi `executive-architecture-review.md` §11 poin 6. `UI-Specification.md` **dibuat baru (v1.0, Draft)** — memakai Screen Inventory di atas sebagai basis wajib (bukan didesain lepas), token desain tidak mengganti `shadcn/ui`/Tailwind yang sudah final (`ADR-021`). `Technical-Specification.md` **dibuat baru (v1.0, Draft)** — murni konsolidasi 6 dokumen sumber existing, tidak ada keputusan arsitektur baru; mencatat eksplisit bahwa blocker implementasi Modul 12/13 di `SYSTEM-ARCHITECTURE.md` §5.12-5.13 (`PROJECT-CONSTITUTION.md` §24 poin 10) **kini resolved** menyusul poin 16. Dengan ketiga dokumen ini, **seluruh 9 langkah `foundation-validation-report.md` Bagian 16 (Recommended Alignment Order) kini selesai** — tidak ada lagi dokumen turunan penting proyek yang berstatus Planned/Not Ready. `CHANGELOG.md` dirilis sebagai **`0.4.0`** (MINOR — 3 dokumen baru, genuine scope completion). **Status Draft eksplisit**: ketiganya **belum** naik Baseline — menunggu pengesahan eksplisit Owner, konsisten pola poin 16. **Tidak termasuk cakupan siklus ini**: high-fidelity mockup visual piksel-presisi (di luar definisi UI Specification governance, pekerjaan implementasi terpisah); registrasi `BR-XXX` dan ID endpoint formal `API-XXX` (diwariskan sebagai gap terbuka dari poin 16, tidak diselesaikan siklus ini).

18. **(Baru) 5 Agustus 2026 — Pengesahan Baseline untuk 8 dokumen (5 Draft dari poin 17 + 3 kandidat Baseline dari poin 16), dieksekusi langsung oleh Owner.** Owner (Mujtahid Aktanto) memerintahkan eksekusi pengesahan status Baseline secara eksplisit — konsisten model proyek solo (Owner tunggal, tanpa segregation of duties formal, lihat Governance Notes poin 14). Sebelum eksekusi, diperiksa syarat Bagian 9 poin 1 ("seluruh dependency-nya sudah Baseline atau tidak memiliki dependency yang memblokir") — ditemukan bahwa 3 dokumen dari poin 16 (`ERD-Skema-Database.md` v1.3, `User-Flow.md` v1.2, `API-Specification.md` v1.2) masih berstatus **Approved (kandidat Baseline)**, sementara 5 dokumen baru dari poin 17 sebagian bergantung padanya (mis. `Authorization-Access-Control-Specification.md` bergantung `ERD v1.3`/`API Spec v1.2`; `Functional-Specification.md` bergantung `User Flow v1.2`/`API Spec v1.2`). **Interpretasi yang diambil** (dicatat eksplisit, bukan diasumsikan diam-diam): instruksi Owner "jalankan pengesahan status baseline" dibaca mencakup **seluruh 8 dokumen yang berstatus kandidat/Draft menunggu tindakan Owner pada titik ini** — bukan hanya 5 dokumen Draft literal — agar rantai dependency Bagian 9 poin 1 terpenuhi bersih tanpa promosi parsial yang menyisakan dependency belum-Baseline. Hasil: **8 dokumen naik status ke Baseline** secara bersamaan — `Entity-Mapping-...v1.0.md`, `ERD-Skema-Database-...v1.3.md`, `API-Specification-...v1.2.md`, `User-Flow-...v1.2.md`, `Authorization-Access-Control-Specification-v1.0.md`, `Functional-Specification-...v1.0.md`, `UI-Specification-...v1.0.md`, `Technical-Specification-...v1.0.md`. Field Status internal tiap dokumen (header masing-masing file) disinkronkan penuh ke "✅ Baseline (BERLAKU)" pada siklus yang sama — bukan hanya baris Bagian 10 di sini, konsisten pola poin 15 (menghindari drift narasi vs sumber). **Versi lama tetap Deprecated** (PRD v1.1, ERD v1.2, User Flow v1.1, API Spec v1.1) — promosi Baseline tidak mengubah status dokumen Deprecated. Dengan promosi ini, **seluruh 24 dokumen di Bagian 10 kini tidak ada satu pun berstatus Draft** — hanya `Database Schema (fisik)` bagian dari ERD (tidak berdiri sendiri) dan `Executive Architecture Review` (tetap TBD, file tidak ditemukan sejak poin 3) yang belum berstatus final.

19. **(Baru) 6 Agustus 2026 — Issue Register Batch 1 & Batch 2 dieksekusi: 5 bug RLS diperbaiki, 7 Open Decision (OD-16 s.d. OD-22) dijawab & diresolusikan.** Berbeda dari 18 poin sebelumnya (yang seluruhnya siklus dokumen governance/skema), siklus ini adalah **eksekusi Issue Register** (`ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0, hasil 13 Module Planning) — bukan siklus governance dokumen desain baru.
    - **Batch 1 (`TASK-HOTFIX-20260806-001`, `CHANGELOG.md` rilis `0.4.2`, PATCH):** 4 bug Tier 1 (T1-01 s.d. T1-04) + T3-06 diperbaiki langsung di 4 file migration (`0007`, `0008`, `0009`, `0010`) — murni koreksi RLS policy agar sesuai desain/ADR yang sudah Approved, **tidak ada perubahan tabel/kolom maupun ADR baru**.
    - **Batch 2 (`OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md`, `CHANGELOG.md` rilis `0.5.0`, MINOR):** 2 Tier 2 + 5 Tier 3 diformalkan sebagai Open Decision, dijawab Owner, dieksekusi sebagai revisi konten `PRD-...v1.2.md` (Modul 4/5/6/13), `Authorization-Access-Control-Specification-v1.0.md` (§2.4), `User-Flow-...v1.2.md` (header Modul 13), dan penambahan 4 endpoint baru ke `API-Specification-...v1.2.md` (§10.4). **Koreksi penomoran OD dicatat eksplisit** — lihat Governance Finding di `OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md` dan `decision-log.md` §11 (rekomendasi awal OD-12 s.d. OD-18 keliru, bentrok dengan OD-11/OD-12 yang masih aktif OPEN). **Satu keputusan (OD-19) direvisi Owner di tengah proses** — draft awal Opsi B (wilayah eksklusif per-Kecamatan) diganti ke Opsi A (per-Kota) setelah ditemukan Opsi B memerlukan kolom skema baru (`district_id`) yang berpotensi perlu ADR baru; sesuai instruksi task ("jangan buat ADR sendiri tanpa persetujuan Owner"), perubahan skema tsb **tidak dieksekusi**, murni dilaporkan sebagai temuan hingga Owner mengonfirmasi opsi final.
    - **Keputusan versi dokumen:** `PRD-...v1.2.md`, `Authorization-Access-Control-Specification-v1.0.md`, `User-Flow-...v1.2.md`, `API-Specification-...v1.2.md` — isinya berubah pada siklus ini namun **nomor versi dokumen tidak dinaikkan** (tetap v1.2/v1.0/v1.2/v1.2), karena perubahan bersifat koreksi konsistensi internal/penambahan endpoint kecil, bukan retrofit skala besar seperti poin 16. Dicatat eksplisit sebagai keputusan editorial, bukan kelalaian — direkomendasikan dievaluasi ulang pada siklus konsolidasi berikutnya jika volume perubahan konten bertambah signifikan.
    - **Dampak ke Baseline Register ini:** baris Bagian 10 untuk PRD/Authorization Spec/User Flow/API Spec **tidak berubah** (nomor versi & status Baseline tetap), karena tidak ada bump versi pada siklus ini — hanya bagian ini (Governance Notes) yang mencatat perubahan konten.
    - **Addendum, 6 Agustus 2026 — OD-23 (T3-02, `CHANGELOG.md` rilis `0.6.0`, MINOR).** Isu Tier 3 terakhir (bukti interaksi/lead review agen, MP-02) diformalkan dan langsung dijawab Owner dalam sesi yang sama: bukti lead tidak wajib, 1 review aktif per (reviewer, agen) dengan replace-on-resubmit, **fitur baru self-review Agen** (auto-approved, ikut `aggregateRating`). Berbeda dari OD-16 s.d. OD-22 (murni revisi dokumen), OD-23 **mengubah skema nyata** — `0005_m02_agent_profile.sql` mendapat 1 index UNIQUE baru + 2 RLS policy baru/diubah. `PRD-...v1.2.md` Modul 2 dan `Authorization-Access-Control-Specification-v1.0.md` §2.3 direvisi (isi, tanpa bump nomor versi — sama seperti Batch 2). Dengan OD-23, **seluruh Tier 1 (4), Tier 2 (2), dan Tier 3 (7) di Issue Register Closed** — hanya Tier 4 (editorial) tersisa saat itu.

20. **(Baru) 6 Agustus 2026 — Issue Register Batch 3: audit menyeluruh Authorization Spec, naik ke v1.1 Baseline.** Berbeda dari poin 19 (perbaikan RLS/keputusan Owner satu-per-satu), siklus ini adalah **audit sistematis** — seluruh 113 baris `PERM-XXX` di `Authorization-Access-Control-Specification.md` diperiksa baris-per-baris terhadap dua sumber kebenaran: RLS aktual 15 file migration `0001`–`0015`, dan Business Rule eksplisit PRD per modul. Dipicu oleh pola berulang yang ditemukan selama 13 Module Planning: 12 dari 17 isu Tier 4 Issue Register berasal dari akar masalah yang sama (tabel `own`/`all` di Authorization Spec tampak digeneralisasi otomatis tanpa pengecualian kasus per-aksi).
    - **Hasil:** **22 dari 113 baris dikoreksi** — 12 yang sudah teridentifikasi sebelumnya (T4-01 s.d. T4-05, T4-12 s.d. T4-16) + **10 temuan baru** yang baru terlihat lewat audit menyeluruh (bukan hanya modul yang sudah diperiksa MP sebelumnya). Temuan paling signifikan: `PERM-M07-View-DbrConfig`, `PERM-M10-View-Role/Permission/RolePermission`, `PERM-M11-View-UrlRedirect` ternyata RLS-nya memakai `USING(true)` — jauh lebih terbuka (bukan lebih tertutup) dari yang tercatat di v1.0; arah temuan ini kebalikan dari pola dominan (yang biasanya Authorization Spec terlalu longgar, bukan terlalu ketat).
    - **Dokumen baru:** `Authorization-Access-Control-Specification-v1.1.md` diterbitkan sebagai **revisi penuh** (bukan tambal 22 baris terpisah) — Bagian 0 (Changelog Audit) mendokumentasikan seluruh 22 koreksi dengan rujukan RLS/PRD eksplisit per baris, agar traceability lengkap dan tidak perlu audit ulang dari nol di siklus berikutnya. v1.0 **tidak dihapus**, dipertahankan sebagai referensi historis (status berubah ke Deprecated secara implisit begitu v1.1 naik Baseline — lihat baris Bagian 10 di atas).
    - **Housekeeping bersamaan (4 isu editorial non-Authorization-Spec):** komentar migration `0005`/`0011` dikoreksi; istilah "Verified" disinkronkan ke "Active" di PRD + User Flow Modul 1 (9 lokasi); endpoint CRUD `/admin/developer-projects` dilengkapi di API Specification §10.3 (GET-list/PUT/DELETE, sebelumnya hanya POST). T4-09 dan T4-10 ditutup sebagai **Acknowledged** (inkonsistensi struktur/tanggung jawab yang sudah konsisten di implementasi, tidak memerlukan perubahan dokumen).
    - **Seluruh 13 `MP-*.md`** — sitasi "Authorization Spec v1.0" di header Dokumen Acuan dinaikkan ke "v1.1", plus resolusi spesifik per modul untuk isu Tier 4 terkait dicatat di masing-masing MP.
    - **Satu isu TIDAK dieksekusi:** T4-06 (SSO Apple, disebut di PRD/Functional Spec/User Flow Modul 1 tanpa endpoint/ADR pendukung) — ini **keputusan produk**, bukan verifikasi teknis seperti 21 temuan lain, sesuai batasan task eksplisit ("perlu konfirmasi singkat Owner sebelum eksekusi"). Menunggu jawaban satu-kalimat: hapus referensi, atau pertahankan dengan label "belum diimplementasikan".
    - **Satu isu diselesaikan terpisah, 6 Agustus 2026 (addendum):** T4-06 (SSO Apple) — keputusan produk, dijawab Owner **Opsi B**: referensi dipertahankan, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di `PRD`/`Functional Spec`/`User Flow` Modul 1 (6 lokasi). `MP-01-Authentication-Module-Planning-v1_0.md` disinkronkan. **Dengan addendum ini, seluruh 32 isu Issue Register (Tier 1 s.d. Tier 4) tuntas Closed** — tidak ada item governance tersisa yang menghalangi Sprint S0.
    - **`CHANGELOG.md`** mencakup siklus lengkap ini sebagai rilis `0.7.1` (PATCH — koreksi editorial murni, bukan scope baru).

21. **(Baru) 7 Agustus 2026 — OD-24: Owner mengonfirmasi eksplisit pembukaan gate implementasi kode Modul 12 (Organization).** Berbeda dari 20 poin sebelumnya di bagian ini yang sebagian besar mencatat siklus audit/perbaikan dokumen, poin ini murni mencatat **satu keputusan governance tunggal**: Owner menyatakan *"Sebagai Owner, saya konfirmasi gate implementasi kode Modul 12 (Organization) resmi terbuka."*
    - **Konteks:** Gate M12 sebelumnya tertahan bukan karena masalah teknis — seluruh prasyarat MDM/MIS, PRD/ERD/Authorization Spec Baseline, dan perbaikan RLS (T1-04, T3-06) sudah lengkap sejak 6 Agustus — melainkan murni menunggu konfirmasi eksplisit Owner yang disyaratkan `PROJECT-CONSTITUTION.md` §24 poin 10 (sebelum revisi) dan `development-playbook.md` Golden Rule 40, mekanisme yang identik dengan pembukaan gate Modul 13 pada 6 Agustus 2026.
    - **Prinsip yang ditegaskan ulang:** kelengkapan paket sinkronisasi dokumen (5 Agustus, mencakup M12 dan M13 sekaligus) adalah **prasyarat**, bukan **pemicu otomatis** — setiap modul tetap memerlukan konfirmasi Owner tersendiri. Ini sebabnya M12 sempat tercatat "gate tertutup" di `CURRENT-PROJECT-STATE.md` rev. 7 selama satu hari meski dokumen sumbernya sudah identik lengkap dengan M13.
    - **Dokumen yang disinkronkan dalam siklus yang sama:** `PROJECT-CONSTITUTION.md` naik v1.8→**v1.9** (§24 poin 10 direvisi total); `MP-12-Organization-Module-Planning-v1_0.md` (Status Gate header, §47 Dependency Checklist, §48 Definition of Ready, Go/No-Go Executive Summary — Hold/GO-bersyarat → **GO** penuh); `decision-log.md` §11 (**OD-24** diregistrasi & langsung Resolved); `CURRENT-PROJECT-STATE.md` naik ke rev. 8; `CHANGELOG.md` rilis `0.7.2` (PATCH).
    - **Dampak proyek:** dengan OD-24, **tidak ada satu pun dari 13 modul proyek yang masih memiliki blocker governance tersisa** — M12 dan M13 kini setara statusnya dengan 11 modul lain (GO tanpa syarat gate tambahan), dan seluruh dokumen governance proyek (Constitution, Baseline Register, Decision Log, Changelog, Current Project State, MP-12) berada dalam keadaan tersinkronisasi penuh per 7 Agustus 2026.


22. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi `SYSTEM-ARCHITECTURE.md`,
    tidak ada perubahan nilai versi.** Ditemukan 3 dari 9 snapshot revisi dokumen
    (isi berbeda secara berurutan kronologis: penambahan Modul 12/13 → detail teknis
    trigger Postgres & AI connection → promosi status Baseline+ADR-046+OD-02/06/07)
    seluruhnya berlabel **"Versi 1.6" dan tanggal "3 Agustus 2026" identik** — pelanggaran
    prinsip penomoran dokumen ini sendiri (Bagian 6, status **Baseline** semestinya
    merujuk **satu** file tunggal, bukan beberapa kandidat bersaing dengan label sama).
    **Resolusi yang diambil:** nomor versi publik dipertahankan v1.6 (menghindari membuat
    usang rujukan eksternal di `project-manifest.md`/`Module-Dependency-Matrix.md`);
    3 snapshot diberi identifier PATCH retroaktif (1.6.0/1.6.1/1.6.2) di tabel Riwayat
    Versi internal dokumen sendiri; file kanonik tunggal (setara 1.6.2) ditetapkan sebagai
    **satu-satunya rujukan v1.6 yang sah** ke depan — 9 snapshot lama direkomendasikan
    diarsipkan, tidak lagi dokumen aktif (konsisten rekomendasi poin sebelumnya soal
    penamaan file, lihat `ADR-Consolidation-Supporting-Deliverables.md` §4). **Aturan
    baku baru:** revisi konten pada tanggal yang sama wajib memakai identifier PATCH
    eksplisit di field Versi header dokumen manapun, tidak hanya SYSTEM-ARCHITECTURE.md
    — dicatat di sini sebagai konvensi lintas-dokumen mulai siklus ini.
    **Temuan belum diperbaiki (tercatat, bukan diselesaikan sepihak, EAF §8.3):** Daftar
    Isi dokumen tidak mencantumkan Bagian 23–24 sejak v1.5 (konten tetap ada di badan);
    ADR-046 tidak terdaftar di ADR Cross-Reference Matrix Bagian 24.
    **Addendum, 10 Agustus 2026 (`CHANGELOG.md` rilis `0.7.17`, PATCH):** rekomendasi §4
    poin 1 di atas (kutipan `Module-Dependency-Matrix.md` yang menyebut "v1.6, upload
    `__8_`") **dieksekusi** — seluruh 9 rujukan `SYSTEM-ARCHITECTURE.md` di MDM
    diperbarui merujuk nama file kanonik `SYSTEM-ARCHITECTURE-v1.6-FINAL.md`. Nilai
    versi tidak berubah. Dua temuan Daftar Isi & ADR Cross-Reference Matrix di atas
    **masih belum diperbaiki** — tetap tercatat sebagai temuan terbuka.

23. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi AI Development
    Blueprint (`development-playbook.md`), tidak ada perubahan nilai versi.**
    Pola identik poin 22: 2 dari 9 snapshot revisi berlabel **"Version 1.6" dan
    tanggal "3 Agustus 2026" identik** (Owner field TBD→Mujtahid Aktanto via OD-06;
    soft-delete 3→8 tabel via ADR-046/OD-07, keduanya 4 Agustus). **Resolusi:**
    nomor versi publik dipertahankan v1.6; 2 snapshot diberi identifier retroaktif
    1.6a/1.6b di Riwayat Versi internal dokumen; file kanonik tunggal (setara 1.6b)
    ditetapkan sebagai satu-satunya rujukan v1.6 sah ke depan.
    **Temuan struktural terpisah:** `AI-DEVELOPMENT-BLUEPRINT.md` (draft 28-bagian
    pattern teknis) ditemukan juga berlabel "Version 1.0", berstruktur sama sekali
    berbeda dari rantai versi resmi (yang berlanjut dari `ai-development-blueprint__1_.md`,
    24-bagian tema role/workflow) — bukan revisi bertahap, kemungkinan draft awal
    ditinggalkan. **Keputusan Owner (9 Agustus 2026): dicatat sebagai temuan,
    TIDAK ditindaklanjuti** — tidak diarsipkan formal, tidak diekstrak, tidak
    dihapus dari histori. Final, tidak memerlukan review ulang.
    **Addendum, 10 Agustus 2026 (`CHANGELOG.md` rilis `0.7.18`, PATCH):** file kanonik
    diupload ulang sebagai `AI-DEVELOPMENT-BLUEPRINT-v1.6-FINAL.md`. 7 rujukan
    `SYSTEM-ARCHITECTURE.md` di dalamnya diperbarui merujuk nama file kanonik
    `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` (pola sama poin 22 addendum). Self-reference
    internal ("AI-DEVELOPMENT-BLUEPRINT.md, dokumen ini") diperjelas menjadi nama
    kanonik agar tidak rancu dengan draft orphan berjudul sama. Nilai versi tidak
    berubah.

24. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi
    MP-01-Authentication-Module-Planning.md, tidak ada perubahan nilai versi.**
    Pola identik poin 22/21: 3 snapshot revisi berlabel **"Versi 1.0" dan
    tanggal "6 Agustus 2026" identik**, merepresentasikan progres resolusi
    Open Issue (bootstrap Superadmin via OD-18 Opsi B; SSO Apple via T4-06
    Opsi B; istilah "Verified"→"Active" via audit T4-07; Authorization Spec
    §2.2 via audit T4-02, naik ke v1.1). **Resolusi:** nomor versi publik
    dipertahankan v1.0; 3 snapshot diberi identifier retroaktif 1.0a/1.0b/1.0c
    di Riwayat Versi internal dokumen; file kanonik tunggal (setara 1.0c)
    ditetapkan sebagai satu-satunya rujukan v1.0 sah ke depan.
    **Tidak ada temuan kehilangan konten** — seluruh 656 baris dokumen identik
    di ketiga snapshot, murni update status in-place dengan strikethrough
    dipertahankan. Dicatat sebagai **contoh praktik baik** transparansi EAF
    §8.3 untuk direplikasi ke MP-02 s.d. MP-13 saat konsolidasi berikutnya.

25. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi
    MP-02-ProfilAgen-Module-Planning.md, tidak ada perubahan nilai versi.**
    Pola identik poin 22/21/22: 3 snapshot revisi berlabel **"Versi 1.0" dan
    tanggal "6 Agustus 2026" identik**, merepresentasikan progres resolusi
    OD-23 (bukti lead review tidak wajib, self-review Agen auto-approved,
    `UNIQUE(buyer_id, agent_id)`) dan audit Authorization Spec T4-03
    (Buyer=own→none untuk Approve/Delete AgentReview, naik ke v1.1).
    **Resolusi:** nomor versi publik dipertahankan v1.0; 3 snapshot diberi
    identifier retroaktif 1.0a/1.0b/1.0c di Riwayat Versi internal dokumen;
    file kanonik tunggal (setara 1.0c) ditetapkan sebagai satu-satunya rujukan
    v1.0 sah ke depan.
    **Verifikasi silang, 9 Agustus 2026:** `Authorization-Access-Control-Specification-v1.1-FINAL.md`
    (diupload user) dan `decision-log.md`/`ISSUE-REGISTER-Konsolidasi-FINAL.md`
    (sudah ada di project) dikonfirmasi cocok penuh dengan seluruh rujukan
    OD-23/T4-03 di MP-02 — **tidak ada diskrepansi**.
    **Tidak ada temuan kehilangan konten** — konsisten pola MP-01 (poin 24).

26. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi
    MP-03-Listing-Module-Planning.md + penggabungan P6 (ADR-047/OD-25),
    tidak ada perubahan nilai versi publik.**
    Pola penomoran identik poin 24-25: 3 snapshot revisi berlabel **"Versi 1.0"
    dan tanggal "6 Agustus 2026" identik**, merepresentasikan progres perbaikan
    3 Konflik (RLS sold/rented akses publik; RLS child-table Org Leader;
    Amenity management via OD-22 Opsi A). **Tambahan pada siklus ini:** file
    terpisah `P6-Hasil-MP03-ModulePlanning-DuplicateDetection.md` (deteksi
    duplikat foto, ADR-047/OD-25) dikonfirmasi **belum termerge** ke snapshot
    manapun — digabungkan sekarang atas konfirmasi eksplisit Owner (9 Agustus
    2026): +1 User Story, +1 Functional Requirement, +2 Edge Case, +1 Risk
    Analysis.
    **Resolusi:** nomor versi publik dipertahankan v1.0; 3 snapshot historis
    diberi identifier retroaktif 1.0a/1.0b/1.0c, baris ke-4 "1.0c + P6" mencatat
    penggabungan yang terjadi di siklus konsolidasi ini sendiri; file kanonik
    tunggal ditetapkan sebagai satu-satunya rujukan v1.0 sah ke depan.
    **Tidak ada temuan kehilangan konten** pada 3 snapshot historis — konsisten
    pola MP-01/MP-02. **Rekomendasi terbuka:** verifikasi silang migration
    `0008_m03_listing.sql` versi terbaru terhadap klaim perbaikan RLS di
    dokumen — belum dilakukan, file migration tidak diupload untuk task ini.

27. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-04-LearningCenter-Module-Planning.md
    + REGRESI dokumentasi-vs-implementasi ditemukan dan diperbaiki.**
    Pola penomoran identik poin 24-25 (3 snapshot "Versi 1.0"/"6 Agustus 2026"
    identik). **Temuan kritis tambahan:** verifikasi silang terhadap
    `0009_m04_learning_center.sql` yang diupload Owner membuktikan 4 RLS policy
    yang diklaim dokumen MP-04 sebagai "✅ Diperbaiki [2026-08-06]" (Konflik #1:
    `quiz_questions_manage`/`quiz_options_manage`; Konflik #3: `enrollments_own`/
    `quiz_attempts_own`) **ternyata tidak pernah benar-benar dieksekusi** ke file
    migration — migration aktual identik dengan versi pra-perbaikan. Owner
    dikonfirmasi (9 Agustus 2026) bahwa file yang diaudit adalah versi terbaru,
    bukan usang.
    **Resolusi:** atas instruksi eksplisit Owner, ke-4 policy diperbaiki langsung
    di `0009_m04_learning_center-FIXED.sql` (migration belum pernah dieksekusi
    ke live, sehingga aman diperbaiki langsung tanpa migration tambahan).
    Dokumen MP-04 diberi anotasi status final di 6 lokasi terkait — klaim asli
    dipertahankan (EAF §8.3), ditambah keterangan hasil verifikasi & resolusi.
    **Tindakan lanjutan diperlukan dari Owner:** ganti file migration di project
    dengan versi `-FIXED` dan eksekusi ke database live.
    **Rekomendasi proses:** klaim "migration sudah diperbaiki" di dokumen MP
    mana pun sebaiknya diverifikasi silang terhadap file SQL aktual sebelum
    dianggap Resolved — root cause regresi ini belum diketahui (kemungkinan
    dokumentasi ditulis mendahului eksekusi, atau file yang diperbaiki tidak
    tersimpan ke lokasi yang benar).

28. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-05-KalenderEvent-Module-Planning.md
    + REGRESI dokumentasi-vs-implementasi KEDUA ditemukan dan diperbaiki.**
    Pola penomoran identik poin 24-27. **Temuan kritis:** verifikasi silang
    `0010_m05_events.sql` (diupload Owner) membuktikan RLS `events_manage`
    yang diklaim "✅ Diperbaiki [2026-08-06]" (Konflik #1, self-approval event)
    **tidak pernah benar-benar dipecah** — migration masih 1 policy tunggal
    identik versi pra-perbaikan. **Lebih serius dari regresi MP-04 (poin 27)**:
    ini bug bypass approval aktif, bukan sekadar gap fitur — Developer Partner
    masih bisa mem-publish event miliknya sendiri tanpa moderasi Admin.
    **Resolusi:** atas instruksi Owner, `events_manage` dipecah jadi 4 policy
    (`events_insert_own`/`events_update_own`/`events_delete_own`/`events_manage_all`)
    di `0010_m05_events-FIXED.sql`, persis spesifikasi §51 dokumen sendiri.
    Dokumen MP-05 diberi anotasi status final di 3 lokasi — klaim asli
    dipertahankan (EAF §8.3).
    **🔴 POLA SISTEMIK dikonfirmasi (2 dari 2 kasus terverifikasi = regresi):**
    baik MP-04 maupun MP-05 sama-sama mencatat "Diperbaiki [2026-08-06]" tanpa
    eksekusi nyata. **Kebijakan baru direkomendasikan:** setiap klaim "migration
    diperbaiki" di dokumen MP wajib disertai/diverifikasi terhadap file SQL
    aktual sebelum status Resolved dianggap sah — berlaku untuk MP-06 s.d.
    MP-13 yang belum diaudit.
    **Tindakan lanjutan diperlukan dari Owner:** ganti `0010_m05_events.sql`
    dengan versi `-FIXED` dan eksekusi/re-eksekusi ke database.

29. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-06-DirektoriDeveloper-Module-Planning.md
    + REGRESI KETIGA (dokumentasi-vs-implementasi) ditemukan dan diperbaiki.**
    Pola penomoran identik poin 24-28 (3 snapshot "Versi 1.0"/"6 Agustus 2026"
    identik). **Temuan kritis:** verifikasi silang terhadap
    `API-Specification-RUMAHAGEN-v1.3-FINAL.md` (diupload
    Owner, file terbaru bertanggal 8-9 Agustus) membuktikan 3 endpoint CRUD
    admin (`GET`/`PUT`/`DELETE /admin/developer-projects{/id}`) yang diklaim
    MP-06 sebagai "✅ Diperbaiki [2026-08-06], audit v1.1/T4-11" **tidak pernah
    benar-benar ditambahkan** ke §10.3.
    **Resolusi:** atas instruksi Owner, 3 endpoint ditambahkan ke
    `API-Specification-...v1.3-FINAL-FIXED.md`, dengan catatan regresi eksplisit
    (mengikuti pola pemulihan endpoint OD-20 yang sudah ada di dokumen yang
    sama). Dokumen MP-06 diberi anotasi status final di 3 lokasi — klaim asli
    dipertahankan (EAF §8.3).
    **🔴 POLA SISTEMIK DIKONFIRMASI 3 DARI 3 KASUS (100%):** MP-04 (migration
    `0009`, poin 27), MP-05 (migration `0010`, poin 28), dan sekarang MP-06
    (API Specification, poin ini) seluruhnya regresi dari klaim "Diperbaiki
    [2026-08-06]" yang sama. **Kebijakan governance baru, WAJIB berlaku mulai
    MP-07:** setiap klaim "sudah diperbaiki [tanggal]" yang merujuk ke dokumen
    sumber lain (migration/API Spec/Authorization Spec/dsb.) WAJIB diverifikasi
    silang terhadap dokumen sumber tsb sebelum status Resolved dianggap sah di
    audit konsolidasi manapun.
    **Tindakan lanjutan diperlukan dari Owner:** ganti
    `API-Specification-RUMAHAGEN-v1.3-FINAL.md` dengan versi
    `-FIXED`.

30. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-07-DBRScoring-Module-Planning.md
    dan MP-08-DashboardNotifikasi-Module-Planning.md, verifikasi silang LOLOS
    penuh — tidak ada regresi.**
    Pola penomoran identik poin 24-29 (snapshot "Versi 1.0"/"6 Agustus 2026"
    identik di kedua dokumen). **Berbeda dari poin 29-29 (regresi MP-04/05/06):**
    3 klaim diverifikasi silang di sini (T4-13, T4-14 untuk MP-07; T4-16 untuk
    MP-08) — **seluruhnya terbukti benar**, dikonfirmasi terhadap
    `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.8/§2.9 dan
    `0011_m07_dbr.sql`.
    **Update rasio pola sistemik:** dari 6 klaim yang sudah diverifikasi
    silang total (sejak 9 Agustus 2026), 3 regresi (MP-04, MP-05, MP-06) dan
    3 terverifikasi benar (MP-07 ×2, MP-08 ×1) — rasio regresi turun ke 50%.
    **Kebijakan verifikasi wajib (poin 29) tetap berlaku** untuk MP-09 s.d.
    MP-13 — sampel masih terlalu kecil untuk menyimpulkan pola berhenti,
    dan biaya verifikasi jauh lebih rendah dibanding risiko regresi tak
    terdeteksi.
    **Tidak ada temuan kehilangan konten** di kedua dokumen — 0 pure-deletion
    hunk pada kedua diff.

31. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-09-AdminPanel-Module-Planning.md
    + kasus regresi OD-20 yang sudah closed independen sebelum audit ini.**
    Pola penomoran identik poin 24-30. **Temuan:** klaim OD-20 (4 endpoint
    `/admin/internal-users`) dikonfirmasi ADA di
    `API-Specification-RUMAHAGEN-v1.3-FINAL.md` §11.3 —
    **namun dokumen tsb sendiri mengonfirmasi endpoint ini sempat hilang tanpa
    jejak resmi**, pola identik regresi MP-04/05/06 (poin 29-29). **Perbedaan
    kunci: sudah ditemukan & diperbaiki lewat jalur independen** (upgrade API
    Spec v1.2→v1.3 terkait ADR-047/OD-25, 8-9 Agustus 2026) sebelum audit
    konsolidasi MP-09 dimulai — **tidak ada tindakan tambahan diperlukan** dari
    siklus ini.
    **Update rasio pola sistemik (revisi poin 30): 4 dari 7 klaim yang
    diverifikasi silang = regresi (57%)**, bukan 3 dari 6 seperti dilaporkan
    sebelumnya. Rasio yang lebih tinggi ini **memperkuat**, bukan melemahkan,
    justifikasi kebijakan verifikasi wajib (poin 29) — dipertahankan penuh
    untuk MP-10 s.d. MP-13.
    **Catatan governance:** regresi OD-20 ditemukan "secara kebetulan" lewat
    pekerjaan tidak terkait (fitur duplikat foto) — ini indikasi bahwa regresi
    serupa berpotensi masih tersembunyi di dokumen sumber lain yang belum
    pernah diverifikasi eksplisit terhadap klaim MP mana pun.

32. **(Baru) 9 Agustus 2026 — Audit konsolidasi MP-10-RBAC-Module-Planning.md,
    verifikasi silang LOLOS penuh — tidak ada regresi.**
    Pola penomoran identik poin 24-31 (2 snapshot "Versi 1.0"/"6 Agustus 2026"
    identik). Klaim T4-01 (Authorization Spec §2.11, View-Role/Permission/
    RolePermission naik ke `all`, Update-RolePermission Manager none→`own`
    scoped `agent`) **dikonfirmasi cocok penuh** terhadap
    `Authorization-Access-Control-Specification-v1.1-FINAL.md` — bahkan
    cakupan perbaikan lebih luas dari klaim MP-10 sendiri.
    **Update rasio pola sistemik: 4 dari 8 klaim = regresi (50%)**, turun dari
    57% (poin 31). **Kebijakan verifikasi wajib (poin 29) tetap berlaku**
    untuk MP-11 s.d. MP-13 — 3 dokumen tersisa (Organization, AIAssistant,
    SEOAnalytics).
    **Tidak ada temuan kehilangan konten** — 0 pure-deletion hunk.

33. **(Baru) 10 Agustus 2026 — Regresi kelima & keenam ditemukan RETROAKTIF di
    MP-03 (bukan modul yang sedang diaudit), dipicu oleh audit MP-11.**
    Audit MP-11 mengutip ulang status "Diperbaiki [2026-08-06]" untuk T1-02
    (asal MP-03) — verifikasi terhadap `0008_m03_listing.sql` membuktikan
    **DUA klaim di MP-03 (Konflik #1 dan #2) sama-sama regresi**, tidak satu
    pun pernah dieksekusi ke migration:
    (1) `listings_select_public` masih `status='published'` saja, bukan
    `IN ('published','sold','rented')`;
    (2) 3 child-table policy (`listing_photos_manage`/`listing_videos_manage`/
    `listing_amenities_manage`) masih tanpa klausa Organization Leader.
    **Resolusi:** kedua policy diperbaiki nyata di `0008_m03_listing-FIXED.sql`
    atas instruksi Owner. File final MP-03 (yang sudah diserahkan 9 Agustus)
    direvisi ulang dengan anotasi regresi di 4 lokasi (Riwayat Versi, Risk
    Analysis, Conflict Analysis #1&2, Definition of Ready) — klaim asli
    dipertahankan (EAF §8.3).
    **🔴 Refleksi proses governance — PENTING:** audit konsolidasi MP-03
    (9 Agustus, dilakukan sebelum audit MP-04) **tidak menerapkan verifikasi
    silang independen** terhadap klaim "Diperbaiki" — berbeda dari perlakuan
    MP-04 dan seterusnya setelah kebijakan verifikasi wajib matang (poin 29).
    Ini mengindikasikan **MP-01 dan MP-02 (diaudit sebelum MP-03, dengan
    standar verifikasi yang sama rendahnya) berisiko punya klaim serupa yang
    belum terverifikasi** — direkomendasikan audit ulang verifikasi silang
    untuk keduanya sebagai tindakan pencegahan, bukan menunggu ditemukan
    kebetulan seperti kasus MP-03 ini.
    **Update rasio pola sistemik: 6 dari 10 klaim = regresi (60%)**, naik
    tajam dari 50% (poin 32) — didorong sepenuhnya oleh temuan retroaktif
    MP-03, bukan modul yang baru diaudit.

34. **(Baru) 10 Agustus 2026 — Audit konsolidasi MP-12-Organization-Module-Planning.md
    + REGRESI KETUJUH (T1-04) + KONFIRMASI KEGAGALAN TOTAL `TASK-HOTFIX-20260806-001`.**
    Pola penomoran identik poin 24-33 (4 snapshot "Versi 1.0"/"6 Agustus 2026",
    dengan `__2_`/`__3_` identik byte-per-byte — temuan duplikasi baru).
    **Temuan kritis:** verifikasi langsung terhadap `0007_m12_organization.sql`
    (diupload Owner) membuktikan `org_invitations_insert` yang diklaim
    "✅ Diperbaiki [2026-08-06]" (T1-04, verifikasi keanggotaan Leader untuk
    `leader_invite`) **tidak pernah dieksekusi** — masih rentan spoofing
    undangan Leader palsu.
    **Resolusi:** atas instruksi Owner, `org_invitations_insert` diperbaiki
    nyata di `0007_m12_organization-FIXED.sql`. Dokumen MP-12 diberi anotasi
    status final di 4 lokasi — klaim asli dipertahankan (EAF §8.3).
    **🔴 KESIMPULAN GOVERNANCE TERTINGGI PRIORITASNYA:** dengan T1-04
    terkonfirmasi regresi, **SELURUH 4 item Tier 1** dari
    `TASK-HOTFIX-20260806-001` ("Perbaikan RLS — Issue Register Batch 1",
    6 Agustus 2026) — T1-01 (poin 27), T1-02 (poin 33), T1-03 (poin 28),
    T1-04 (poin ini) — **telah diverifikasi dan SELURUHNYA regresi, 100%
    (4/4), tanpa satu pun yang benar-benar tersimpan ke migration.** Ini
    bukan lagi pola probabilistik — ini kegagalan penuh satu task/sesi kerja
    tunggal. **Rekomendasi tertinggi prioritasnya:** investigasi root cause
    spesifik `TASK-HOTFIX-20260806-001` itu sendiri (bukan audit modul
    berikutnya satu per satu) — kemungkinan besar seluruh perubahan dalam
    task ini gagal commit/save secara sistemik pada sesi 6 Agustus 2026,
    independen dari modul yang terdampak.
    **Update rasio pola sistemik keseluruhan: 7 dari 12 klaim = regresi
    (58%).**

35. **(Baru, PENUTUP) 10 Agustus 2026 — Konsolidasi MP-13 (modul terakhir dari
    13) selesai. Siklus konsolidasi 13 Module Planning proyek TUNTAS.**
    Pola penomoran identik poin 24-34 untuk MP-13 sendiri (3 snapshot "Versi
    1.0"/"6 Agustus 2026" identik, klaim OD-21 diverifikasi BENAR terhadap
    `PRD-RUMAHAGEN-v1.3-FINAL.md` REQ-M13-005).

    **RINGKASAN PENUTUP SELURUH SIKLUS (MP-01 s.d. MP-13):**
    - 13 dokumen Module Planning dikonsolidasi dari 34 snapshot total menjadi
      13 file kanonik tunggal, masing-masing dengan Riwayat Versi dan Catatan
      Verifikasi Silang.
    - ~20 klaim "Diperbaiki"/"Resolved" yang merujuk dokumen sumber eksternal
      (migration SQL, API Specification, Authorization Specification)
      diverifikasi silang langsung terhadap file aktual.
    - **7 regresi aktif ditemukan dan diperbaiki**: MP-03 (×2, Konflik #1 & #2),
      MP-04 (×1, T1-01), MP-05 (×1, T1-03), MP-06 (×1, T4-11), MP-12 (×1, T1-04).
    - **1 regresi ditemukan sudah closed independen** sebelum audit sampai ke
      sana: MP-09/OD-20 (diperbaiki lewat siklus kerja API Spec v1.3 terpisah).
    - **5 migration/dokumen sumber diperbaiki**: `0007_m12_organization.sql`,
      `0008_m03_listing.sql`, `0009_m04_learning_center.sql`,
      `0010_m05_events.sql`, `API-Specification-...v1.3-FINAL.md`.

    **🔴 TEMUAN GOVERNANCE PALING SIGNIFIKAN — dicatat permanen sebagai
    preseden:** seluruh 4 item Tier 1 (`T1-01` s.d. `T1-04`) dari satu task
    tunggal, `TASK-HOTFIX-20260806-001` ("Perbaikan RLS — Issue Register
    Batch 1", 6 Agustus 2026), **gagal 100% tanpa kecuali** — tidak satu pun
    perbaikan yang dicatat task ini benar-benar tersimpan ke file migration.
    Sebaliknya, klaim dari sesi kerja **Batch 2** (OD-16 s.d. OD-23) dan
    **audit Issue Register Batch 3** (koreksi T4-xx ke Authorization Spec)
    yang sudah diverifikasi **seluruhnya bersih** — regresi bersifat spesifik
    ke satu unit kerja, bukan pola menyeluruh proyek.

    **Rekomendasi permanen untuk siklus governance berikutnya:** setiap task
    hotfix/perbaikan kode di masa depan yang mencakup beberapa file sekaligus
    sebaiknya diverifikasi utuh (bukan sampel) sebelum ditandai selesai di
    dokumentasi — preseden `TASK-HOTFIX-20260806-001` menunjukkan risiko
    kegagalan silent bisa memengaruhi seluruh isi satu task, bukan hanya
    sebagian baris.

    **Item yang masih terbuka dari siklus ini:**
    - ~~MP-02 belum diaudit ulang dengan standar verifikasi ketat penuh (hanya
      terverifikasi parsial di sesi awal).~~ **✅ Diaudit ulang [2026-08-10] —
      lolos bersih, tidak ada regresi. Lihat poin 37.**
    - Ganti 5 file migration/dokumen sumber yang sudah diperbaiki ke lokasi
      kanonik project.
    - Eksekusi seluruh migration ke database live (belum pernah dilakukan
      sama sekali sepanjang proyek).

36. **(Baru) 10 Agustus 2026 — Audit konsolidasi Module Dependency Matrix (MDM)
    dan Module Implementation Strategy (MIS), tidak ada perubahan nilai versi.**
    Berbeda dari poin 22-35 (multi-snapshot, sebagian dengan regresi), **kedua
    dokumen ini hanya punya 1 versi** yang pernah diupload untuk audit — tidak
    ada perbandingan historis yang mungkin dilakukan, tidak ada temuan kehilangan
    konten.
    **MDM:** ditemukan referensi usang ke `SYSTEM-ARCHITECTURE.md` sebagai
    "v1.6, upload `__8_`" — sudah diperbaiki di siklus housekeeping `0.7.17`
    (lihat poin 22 addendum), 9 rujukan diperbarui ke nama file kanonik.
    **MIS:** tidak ditemukan referensi usang apa pun — dokumen paling bersih
    dari sudut integritas rujukan yang diaudit sejauh ini.
    Kedua dokumen diberi tabel Riwayat Versi baru (1 baris masing-masing, sesuai
    ketersediaan data).

37. **(Baru) 10 Agustus 2026 — Audit ulang MP-02-ProfilAgen-Module-Planning.md
    dengan standar verifikasi ketat penuh — menutup item terbuka dari poin 35.**
    Berbeda dari MP-01 (juga sudah diaudit ulang, poin 22 addendum), MP-02
    sebelumnya hanya terverifikasi parsial di sesi audit awal (9 Agustus 2026)
    — sebelum kebijakan verifikasi silang wajib (poin 29) matang. Audit ulang
    ini menerapkan verifikasi langsung terhadap 2 klaim MP-02:
    - **Klaim OD-23** (UNIQUE constraint `idx_agent_reviews_one_per_reviewer_per_agent`
      + RLS `agent_reviews_insert_buyer`/`agent_reviews_update_own` untuk
      self-review Agen) — **dikonfirmasi ADA dan sesuai** di
      `0005_m02_agent_profile.sql` versi terbaru.
    - **Klaim T4-03** (Authorization Spec §2.3, Buyer `own`→`none` untuk
      Approve/Delete-AgentReview) — **dikonfirmasi ADA dan sesuai** di
      `Authorization-Access-Control-Specification-v1.1-FINAL.md`.
    **Tidak ada regresi ditemukan** — MP-02 bergabung dengan MP-01 sebagai
    modul yang sudah diaudit ulang dan dinyatakan bersih dengan standar
    verifikasi penuh yang sama seperti MP-04 dan seterusnya.
    **Temuan minor non-blocking:** Bagian Recommendation poin #2 MP-02 masih
    menuliskan perbaikan komentar migration `0005` (bug redaksional "0007"
    seharusnya "0008") sebagai item terbuka — verifikasi langsung terhadap
    3 snapshot file (`__1_`, `__2_`, `__3_`) membuktikan perbaikan ini **sudah**
    diterapkan di `__2_`/`__3_`. Teks Recommendation MP-02 dikoreksi mengikuti
    fakta file, bukan sebaliknya.
    **Update rasio pola sistemik final: 6 dari 12 klaim yang diaudit standar
    ketat penuh = regresi (50%)**, turun dari 58% (poin 34). Dengan ini,
    **seluruh item terbuka dari poin 35 ("MP-02 belum diaudit ulang") resmi
    ditutup** — hanya 2 item governance yang tersisa dari siklus konsolidasi
    13 Module Planning: (1) mengganti 5 file migration/dokumen sumber yang
    sudah diperbaiki ke lokasi kanonik project, (2) eksekusi seluruh migration
    ke database live (belum pernah dilakukan sepanjang proyek).

---

*Dokumen ini adalah Document Governance & Baseline Register resmi proyek — meta-dokumen yang mengatur status, versi, baseline, ownership, dan lifecycle seluruh dokumen proyek. Tidak menggantikan `decision-log.md` (alasan keputusan) maupun `CHANGELOG.md` (riwayat perubahan). Wajib direview ulang setiap kali status/versi dokumen mana pun di Bagian 10 berubah material, dan menjadi acuan tetap bagi AI Coding Assistant maupun kontributor manusia dalam menentukan dokumen mana yang berwenang atas suatu informasi sepanjang siklus hidup proyek.*

---

# D6 GLOBAL BASELINE SYNCHRONIZATION OVERLAY
**Date:** 16 August 2026  
**Status:** FINAL GLOBAL AEP1–AEP4 SEMANTIC SYNCHRONIZATION — PASS WITH CONTROLLED RESIDUALS

## Purpose
This section records the post-AEP1–AEP4 global semantic baseline. It is authoritative for cross-domain synchronization status, while the underlying document remains authoritative for its own domain and source-of-truth role.

## Canonical AEP state
| AEP | Domain | Current gate | Canonical interpretation |
|---|---|---|---|
| AEP #1 | Monetization / Commercial + Payment | CONDITIONALLY COMPLETE | Semantic synchronization complete; OPEN-C01, MBR-COM evidence and selected engineering verification remain residuals; physical implementation remains downstream. |
| AEP #2 | Learning Economy | PASS WITH CONTROLLED RESIDUALS | Learning Economy semantic/downstream synchronization complete; MADCR-049 remains OPEN / RE-EVALUATION; automated test evidence remains unverified. |
| AEP #3 | Title / Awarding | SEMANTIC ARCHITECTURE COMPLETE / CONTROLLED OPEN ITEMS | Title/Awarding semantic state synchronized; OD-02…05 remain controlled downstream open items; OD-06 is CLOSED Option B. |
| AEP #4 | Learning Session | PASS WITH CONTROLLED RESIDUALS | Session semantic/downstream synchronization complete; OD-08, MADCR-049, MADCR-053/054 and other controlled residuals remain explicit. |

## Global authority map
- Commercial / Payment owns payment processing, verification and Commercial Entitlement.
- Learning Economy owns Learning Point transactions/provenance.
- Learning Session owns Session lifecycle and evaluation of participation evidence.
- RBAC owns authorization.
- Awarding owns qualification and Award Instance.
- Event Calendar remains integration/presentation context; Learning Session is semantic session authority.
- Provider systems remain infrastructure; provider events are evidence inputs, not RUMAHAGEN business outcomes.

## Canonical cross-domain invariants
1. Subscription ≠ Commercial Entitlement ≠ RBAC.
2. Learning Points ≠ Commercial Entitlement.
3. Course Enrollment ≠ Session Enrollment ≠ Event Registration.
4. Provider Session ID ≠ semantic Learning Session ID.
5. Provider participation ≠ Attendance Outcome ≠ Completion Outcome.
6. Completion ≠ Skill/Credential ≠ Title/Award Instance.
7. Payment Confirmed does not directly issue LP, Credential, or Award.
8. Purchased LP grant is idempotent against the confirmed Commercial transaction.
9. Learning/Session outcomes are evidence to Awarding where the applicable Awarding Path/Rule permits them.
10. Historical commercial, learning, session and awarding records must remain explainable after configuration/version changes.
11. Presentation preference does not mutate Award ownership/lifecycle.
12. Authorization does not equal qualification or commercial entitlement.

## Global implementation hold
The AEP consolidation is a semantic/governance synchronization gate. It does **not** by itself authorize:
- physical schema migration;
- production payment-provider activation;
- final provider-specific contracts/credentials;
- final RBAC permission IDs/scopes where governance remains open;
- automatic provider failover;
- final Learning Activity evidence contract under MADCR-049;
- unresolved Awarding physical cardinality/temporal/storage choices.

Implementation authorization remains subject to the applicable downstream/global gate.

## Stale-document rule
Older documents may contain pre-AEP wording. They remain historical evidence. They must not override the canonical state above. Examples include older M05 Event/live-session wording and older AEP3 OD-06 OPEN wording. These are controlled documentation deltas, not new architecture decisions.

## Residual control rule
Existing residuals are carried forward; none is silently closed by D6. A residual may be closed only by its owning governance/decision gate and must then propagate through the normal synchronization process.

## D6 gate
**PASS — GLOBAL AEP1–AEP4 SEMANTIC BASELINE SYNCHRONIZATION COMPLETE.**

## D6 Governance Register Addendum
The governance register now records the D6 global synchronization package as the current synchronization event. Historical versions remain auditable. Existing open/residual items remain owned by their respective decision/governance gates.
