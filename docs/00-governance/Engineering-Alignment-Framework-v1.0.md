# ENGINEERING ALIGNMENT FRAMEWORK
## Platform Web RUMAHAGEN (SaaS — Mujtahid Aktanto)

> **Klasifikasi Dokumen:** Governance Document — Engineering Standard
> **Status:** Draft v1.0 (menunggu Review & Approval formal sesuai Bagian 25–26)
> **Bukan** Prompt, bukan PRD, bukan ADR, bukan Technical Specification. Dokumen ini adalah **standar proses** yang mengikat seluruh dokumen engineering turunan.

---

# 1. DOCUMENT INFORMATION

| Field | Value |
|---|---|
| **Nama Dokumen** | Engineering Alignment Framework (EAF) |
| **Versi** | 1.0 |
| **Status** | Draft — menunggu Review & Approval (lihat Bagian 25–26) |
| **Kelas Dokumen** | Governance / Meta-Standard — berada **di atas** seluruh dokumen engineering turunan (Entity Mapping, ERD, Database Schema, Authorization & Access Control Specification, API Specification, User Flow, PRD, SEO Specification, Engineering Validation), namun **di bawah** `PROJECT-CONSTITUTION.md`, `architecture-decision-records.md`, dan `project-manifest.md` dalam Source of Truth Hierarchy (lihat Bagian 9). |
| **Pemilik Dokumen (Owner)** | Mujtahid Aktanto (Project Owner, Solo Project — AI-Assisted), sesuai resolusi OD-06 yang telah menetapkan kepemilikan tunggal seluruh dokumen governance proyek. |
| **Disusun Dalam Kapasitas Gabungan** | Enterprise Software Architect · Principal Solution Architect · Enterprise Architecture Governance Consultant · Domain-Driven Design Specialist · Database Architect · Security Architect · API Architect · Technical Architect · Software Engineering Manager · Engineering Process Designer · Technical Writer |
| **Berlaku Efektif Sejak** | Tanggal Approval formal (Bagian 26) — bukan tanggal penulisan draf ini |
| **Dependency Wajib Dibaca Sebelum Dokumen Ini** | `PROJECT-CONSTITUTION.md` (v1.8, Baseline), `architecture-decision-records.md` (Baseline, 28 ADR + ADR-046), `technology-decisions.md` (Baseline, v1.6), `SYSTEM-ARCHITECTURE.md` (Baseline, v1.6), `document-governance-baseline-register.md` (Baseline, v1.1), `project-manifest.md` (v9/1.6) |
| **Dokumen yang Wajib Tunduk pada Framework Ini** | Entity Mapping, ERD-Skema-Database, Database Schema (fisik/migrasi), Authorization & Access Control Specification, API Specification, User Flow, PRD, SEO-Analytics Specification, Engineering Validation Report, dan seluruh dokumen turunan engineering berikutnya yang belum ada namanya saat ini |
| **Bahasa Resmi** | Bahasa Indonesia formal untuk narasi/rasional; istilah teknis industri (Baseline, Source of Truth, Entity, Endpoint, dsb.) dipertahankan tanpa paksaan terjemahan, konsisten dengan konvensi `document-governance-baseline-register.md` |
| **Masa Berlaku** | Tidak terbatas waktu (living document) — direview ulang minimal setiap kali sebuah Phase proyek baru dimulai, atau setiap kali ditemukan pelanggaran struktural terhadap Framework ini (lihat Bagian 30) |

---

# 2. PURPOSE

## 2.1 Mengapa Dokumen Ini Dibuat

Proyek telah menyelesaikan lima tahapan berurutan — Business Discovery, Business Discussion, Architecture Evolution Proposal, Architecture Decision Record, dan Baseline Documents Update — yang seluruhnya menghasilkan **keputusan bisnis dan arsitektur final**. Namun kelima tahapan tersebut menjawab pertanyaan **"apa yang diputuskan"** (the *what*), bukan **"bagaimana keputusan tersebut diterjemahkan secara konsisten ke setiap dokumen engineering turunan, dan bagaimana konsistensi itu dipertahankan seiring waktu"** (the *how*, secara berkelanjutan).

Tanpa standar eksplisit untuk pertanyaan kedua ini, risiko yang **sudah terbukti terjadi** pada siklus-siklus governance sebelumnya (dicatat di `document-governance-baseline-register.md` Governance Notes, `CURRENT-PROJECT-STATE.md` Known Technical Debt, dan berbagai Minor Conflict di `foundation-validation-report.md`) akan berulang dalam skala yang lebih besar begitu proyek memasuki fase engineering aktif:

1. Entity yang sama diberi nama berbeda di ERD, API Specification, dan User Flow.
2. Business rule yang sudah diputuskan di PRD tidak tertelusuri (traceable) ke constraint database maupun validasi API.
3. Perubahan pada satu dokumen (mis. penambahan field wajib) tidak memicu pembaruan pada dokumen dependen (API contract, Authorization matrix, SEO metadata).
4. AI Coding Assistant maupun developer manusia baru harus membaca ulang seluruh riwayat percakapan/keputusan untuk memahami mengapa sebuah struktur dipilih.
5. Dua "versi final" dari sebuah keputusan aktif secara bersamaan tanpa ada mekanisme resolusi yang jelas.

## 2.2 Apa yang Diselesaikan Dokumen Ini

Engineering Alignment Framework (EAF) v1.0 menetapkan **standar tunggal dan mengikat** untuk:

- Bagaimana entity, business rule, requirement, endpoint API, dan permission **diidentifikasi** secara konsisten lintas dokumen (Bagian 16–20).
- Bagaimana dokumen engineering **saling bergantung** dan urutan penyusunannya (Bagian 12–13).
- Bagaimana **traceability** dijaga dari keputusan bisnis/arsitektur hingga ke artefak teknis (Bagian 15).
- Bagaimana **konflik antar dokumen** dideteksi, dilaporkan, dan diselesaikan tanpa keputusan sepihak (Bagian 24).
- Bagaimana **kualitas** setiap dokumen engineering divalidasi sebelum dianggap siap dirujuk (Bagian 27–28).
- Bagaimana Framework ini sendiri **berevolusi** tanpa kehilangan riwayat (Bagian 22, 30, 33).

## 2.3 Yang Bukan Tujuan Dokumen Ini

EAF **tidak** menggantikan isi teknis dokumen mana pun. EAF tidak mendefinisikan entity aktual, tidak mendefinisikan endpoint aktual, tidak mendefinisikan permission aktual — EAF mendefinisikan **aturan main** yang harus diikuti saat dokumen-dokumen tersebut dibuat atau direvisi.

---

# 3. VISION

## 3.1 Pernyataan Visi

> **"Setiap keputusan bisnis dan arsitektur yang telah difinalkan harus dapat diterjemahkan menjadi artefak engineering yang konsisten, tertelusuri, dan dapat diverifikasi — oleh AI maupun manusia, hari ini maupun bertahun-tahun ke depan — tanpa memerlukan interpretasi ulang atas maksud aslinya."**

## 3.2 Horizon Waktu

EAF dirancang sebagai standar **jangka panjang (multi-tahun)**, bukan panduan sesi kerja tunggal. Ini konsisten dengan prinsip yang sudah dipakai `PROJECT-CONSTITUTION.md` sebagai *Engineering Guidelines* tertinggi proyek — EAF adalah lapisan operasional di bawahnya yang secara khusus menangani **konsistensi lintas dokumen engineering**, area yang belum dicakup eksplisit oleh dokumen governance manapun yang ada saat ini.

## 3.3 Kondisi Akhir yang Diharapkan (End State)

Ketika EAF diterapkan sepenuhnya, proyek akan memiliki karakteristik berikut:

| Karakteristik | Indikator Keberhasilan |
|---|---|
| **Single Source of Truth per konsep** | Setiap entity, business rule, endpoint, dan permission memiliki tepat satu dokumen otoritatif; dokumen lain hanya **mereferensikan**, tidak mendefinisikan ulang. |
| **Traceability penuh** | Setiap baris kode/skema dapat ditelusuri mundur ke requirement ID, dan setiap requirement dapat ditelusuri maju ke implementasinya. |
| **Onboarding tanpa riwayat percakapan** | AI Coding Assistant atau developer baru dapat memahami struktur proyek hanya dari dokumen yang ada, tanpa membaca log percakapan sebelumnya. |
| **Deteksi konflik otomatis-secara-proses** | Setiap perubahan pada dokumen sumber memicu pengecekan dampak eksplisit terhadap dokumen dependen (bukan mengandalkan ingatan manusia). |
| **Audit trail lengkap** | Setiap keputusan naming, struktur, dan resolusi konflik tercatat dan dapat diaudit kapan pun. |

---

# 4. SCOPE

EAF berlaku untuk **seluruh dokumen engineering turunan** dari keputusan bisnis/arsitektur yang sudah final, mencakup namun tidak terbatas pada:

| Kategori | Dokumen Tercakup |
|---|---|
| **Data & Domain** | Entity Mapping, ERD-Skema-Database, Database Schema (migrasi fisik) |
| **Keamanan & Akses** | Authorization & Access Control Specification, Permission Matrix |
| **Kontrak Layanan** | API Specification, Event/Webhook Contract (bila ada di kemudian hari) |
| **Pengalaman Pengguna (level struktural, bukan UI visual)** | User Flow (alur logis antar state/screen, bukan desain visual) |
| **Kebutuhan Bisnis** | PRD dan seluruh dokumen requirement turunannya |
| **Visibilitas & Discoverability** | SEO-Analytics Specification |
| **Kualitas & Kepatuhan** | Engineering Validation Report, Quality Gate Checklist |
| **Dokumen Masa Depan** | Setiap dokumen engineering baru yang dibuat setelah EAF berlaku, secara otomatis tunduk pada Framework ini tanpa perlu amandemen eksplisit (lihat Bagian 13.4) |

EAF berlaku untuk **seluruh kontributor**: AI Coding Assistant (Claude, ChatGPT, Bolt.new, Cursor, GitHub Copilot, atau AI lain yang digunakan di masa depan) maupun kontributor manusia (Developer, QA, Technical Lead, Reviewer eksternal bila proyek berkembang menjadi tim).

---

# 5. OUT OF SCOPE

Untuk mencegah tumpang tindih kewenangan dengan dokumen governance yang sudah ada, EAF **secara eksplisit tidak** mencakup:

| Area | Tetap Menjadi Kewenangan Dokumen |
|---|---|
| Keputusan bisnis (fitur, monetisasi, prioritas modul) | `PRD`, `decision-log.md` (Open Decision bisnis) |
| Keputusan arsitektur/teknologi individual (stack, provider, strategi) | `architecture-decision-records.md`, `technology-decisions.md` |
| Status lifecycle dokumen (Draft/Approved/Baseline/Deprecated) dan aturan versioning dokumen | `document-governance-baseline-register.md` — EAF **mewarisi**, tidak menggantikan, aturan ini |
| Indeks agregat status seluruh dokumen proyek | `project-manifest.md` |
| Riwayat kronologis seluruh keputusan | `decision-log.md` |
| Riwayat rilis kode/dokumen | `CHANGELOG.md` |
| Desain visual UI, komponen frontend, styling | Tidak dicakup dokumen governance mana pun saat ini — di luar cakupan EAF secara eksplisit sesuai instruksi pembuatan dokumen ini |
| Isi teknis aktual entity, endpoint, permission (nilai/definisi sebenarnya) | Dokumen engineering turunan itu sendiri (ERD, API Spec, dst.) — EAF hanya mengatur **cara** dokumen tersebut disusun dan disinkronkan |

> **Prinsip pemisahan:** `document-governance-baseline-register.md` mengatur **siklus hidup dokumen** (kapan sebuah dokumen boleh menjadi Baseline). EAF mengatur **konsistensi isi teknis** *antar* dokumen begitu dokumen-dokumen tersebut mulai disusun/direvisi. Keduanya melengkapi, tidak saling menggantikan.

---

# 6. ENGINEERING PHILOSOPHY

## 6.1 Filosofi Inti

Engineering Alignment tidak dipandang sebagai satu kegiatan yang selesai sekali dan berhenti, melainkan sebagai **kondisi yang harus terus dipertahankan** (a *continuously maintained state*), sebagaimana Baseline harus terus dijaga dari drift menurut `document-governance-baseline-register.md`.

Tiga pilar filosofi yang mendasari seluruh aturan di dokumen ini:

**Pilar 1 — Decision Before Design, Design Before Detail.**
Tidak ada entity/endpoint/permission yang boleh dirancang tanpa merujuk pada keputusan bisnis/arsitektur yang sudah final (ADR/PRD). Tidak ada detail implementasi yang boleh ditulis sebelum desain strukturalnya (ERD/API Spec) disepakati.

**Pilar 2 — Explicit Over Implicit.**
Setiap relasi antar dokumen, setiap ID requirement, setiap keputusan naming harus tertulis eksplisit dan dapat dicari (searchable), tidak boleh hanya "dipahami secara tersirat" oleh satu kontributor.

**Pilar 3 — Alignment is Verifiable, Not Assumed.**
Konsistensi antar dokumen tidak boleh diasumsikan hanya karena kelihatannya benar — harus melalui proses Engineering Validation yang eksplisit (Bagian 28) sebelum sebuah dokumen dianggap selaras.

## 6.2 Prinsip Rekayasa Perangkat Lunak yang Diadopsi

| Prinsip | Penerapan dalam Konteks EAF |
|---|---|
| **Domain-Driven Design (DDD)** | Entity, Aggregate, dan Bounded Context (per Modul) menjadi unit dasar identifikasi (Bagian 18); bahasa (ubiquitous language) antar dokumen wajib konsisten (Bagian 21). |
| **Clean Architecture** | Pemisahan tegas antara lapisan Domain (Entity/Business Rule), Application (Use Case/User Flow), Interface (API), dan Infrastructure — tercermin di Document Dependency Model (Bagian 12). |
| **SOLID** | Diterapkan secara konseptual pada struktur dokumen: setiap dokumen memiliki **satu tanggung jawab** (Single Responsibility) sebagai Source of Truth untuk satu domain informasi (Bagian 9, 13). |
| **KISS (Keep It Simple, Stupid)** | Standar identifikasi (Bagian 16–20) dirancang seminimal mungkin namun cukup untuk traceability penuh — dihindari skema penomoran berlapis yang tidak perlu. |
| **DRY (Don't Repeat Yourself)** | Sebuah definisi (entity, rule, endpoint) hanya boleh didefinisikan **satu kali** di dokumen otoritatifnya; dokumen lain mereferensikan dengan ID, tidak menyalin ulang definisi. |
| **YAGNI (You Aren't Gonna Need It)** | EAF tidak mewajibkan proses governance untuk skenario yang belum relevan pada skala proyek saat ini (mis. multi-tim, multi-region) — lihat Bagian 33 untuk bagaimana skala tambahan diaktifkan saat dibutuhkan. |
| **Separation of Concerns** | Dipisahkan tegas: *apa* yang diputuskan (ADR/PRD) vs *bagaimana* itu direpresentasikan secara teknis (ERD/API Spec) vs *bagaimana konsistensi dijaga* (EAF ini sendiri). |
| **Single Source of Truth** | Ditegakkan melalui Source of Truth Hierarchy (Bagian 9) dan larangan duplikasi definisi (Bagian 21, 23). |
| **Backward & Forward Compatibility** | Setiap perubahan struktural wajib dinilai dampaknya terhadap versi sebelumnya (backward) dan terhadap kemungkinan perluasan (forward) — Bagian 30–31. |
| **Scalability First** | Skema ID dan struktur dokumen dirancang agar tidak perlu dirombak total ketika jumlah modul/entity bertambah (Bagian 32). |
| **Security by Design** | Authorization & Access Control Specification wajib disusun **bersamaan**, bukan setelah, API Specification — bukan sebagai lapisan tempelan (Bagian 12, 20). |
| **Auditability** | Setiap keputusan alignment (naming, resolusi konflik, approval) wajib tercatat dengan pelaku, waktu, dan alasan (Bagian 29). |
| **Extensibility** | Struktur bab dan skema ID EAF dirancang agar dokumen jenis baru dapat ditambahkan tanpa mengubah aturan dasar (Bagian 13.4, 33). |
| **Event-Driven Thinking** | Perubahan pada satu dokumen diperlakukan sebagai *event* yang memicu *reaction* eksplisit pada dokumen dependen (Bagian 23) — bukan proses batch yang diingat manual. |
| **High Cohesion, Low Coupling** | Setiap dokumen berisi hal-hal yang secara konseptual erat kaitannya (cohesive), namun bergantung pada dokumen lain hanya melalui referensi ID yang jelas (loosely coupled), bukan duplikasi isi. |

---

# 7. ARCHITECTURE PRINCIPLES

Prinsip arsitektur berikut mengatur **bagaimana dokumen engineering itu sendiri harus distrukturkan** secara konsisten satu sama lain — analog dengan bagaimana `SYSTEM-ARCHITECTURE.md` mengatur struktur kode, EAF mengatur struktur dokumentasi teknis.

## 7.1 Prinsip Lapisan (Layering)

```
┌─────────────────────────────────────────────────────────┐
│  LAPISAN 0 — CONSTITUTIONAL                              │
│  PROJECT-CONSTITUTION.md                                 │
└───────────────────────────┬─────────────────────────────┘
                             │ mengikat
┌───────────────────────────▼─────────────────────────────┐
│  LAPISAN 1 — DECISION                                    │
│  architecture-decision-records.md · decision-log.md      │
│  Architecture Evolution Proposal (bila ada)               │
└───────────────────────────┬─────────────────────────────┘
                             │ menjadi dasar
┌───────────────────────────▼─────────────────────────────┐
│  LAPISAN 2 — ALIGNMENT (DOKUMEN INI)                      │
│  Engineering Alignment Framework v1.0                     │
└───────────────────────────┬─────────────────────────────┘
                             │ mengatur cara penyusunan
┌───────────────────────────▼─────────────────────────────┐
│  LAPISAN 3 — ENGINEERING ARTIFACT                          │
│  Entity Mapping → ERD → DB Schema                          │
│  PRD → User Flow → API Spec → Authorization Spec            │
│  SEO Specification · Engineering Validation                │
└───────────────────────────┬─────────────────────────────┘
                             │ diverifikasi oleh
┌───────────────────────────▼─────────────────────────────┐
│  LAPISAN 4 — VALIDATION & AUDIT                             │
│  Engineering Validation Report · Quality Gate               │
└─────────────────────────────────────────────────────────┘
```

**Aturan lapisan:** Sebuah dokumen di Lapisan N hanya boleh bergantung pada dokumen di Lapisan N atau lebih rendah nomornya (lebih tinggi otoritasnya). Dokumen di Lapisan 3 **tidak boleh** menciptakan keputusan baru yang seharusnya berada di Lapisan 1 (mis. API Specification tidak boleh diam-diam memilih strategi autentikasi baru — itu wajib menjadi ADR terlebih dahulu).

## 7.2 Prinsip Bounded Context per Modul

Mengikuti struktur 13 modul yang sudah ditetapkan proyek (11 modul asli + Modul 12 Organization + Modul 13 AI Assistant), setiap Modul diperlakukan sebagai **Bounded Context** dalam pengertian DDD: memiliki ubiquitous language sendiri yang wajib konsisten secara internal, dan relasi eksplisit (bukan implisit) ke Bounded Context lain melalui entity/permission bersama (shared kernel).

## 7.3 Prinsip Kontrak Sebelum Implementasi

API Specification, ERD, dan Authorization Specification berfungsi sebagai **kontrak** (contract-first) yang harus disepakati dan divalidasi (Bagian 27–28) sebelum kode diizinkan ditulis menyentuh area tersebut — konsisten dengan larangan eksplisit di `PROJECT-CONSTITUTION.md` yang sudah melarang penulisan kode produksi tanpa memverifikasi status Open Decision terkait.

## 7.4 Prinsip Idempotent Documentation

Dokumen engineering harus dapat dibaca ulang dari nol oleh kontributor baru (manusia atau AI) dan menghasilkan pemahaman yang **sama persis** tanpa bergantung pada urutan pembacaan atau konteks percakapan sebelumnya — ini adalah alasan mengapa Bagian 15 (Traceability) dan Bagian 21 (Naming Convention) bersifat wajib, bukan opsional.

---

# 8. GOVERNANCE PRINCIPLES

## 8.1 Prinsip Non-Duplikasi Kewenangan

EAF tidak menciptakan badan governance baru yang menyaingi struktur yang sudah ada di `document-governance-baseline-register.md` Bagian 9 (Roles & Responsibilities). EAF **mewarisi** struktur peran yang sama (Owner/Approver/Reviewer) dan hanya menambahkan **tanggung jawab spesifik terkait konsistensi lintas dokumen engineering** (lihat Bagian 14).

## 8.2 Prinsip Tidak Ada Keputusan Sepihak oleh AI

Konsisten dengan `PROJECT-CONSTITUTION.md` §18 dan `document-governance-baseline-register.md` §4.2 poin 3: AI Coding Assistant dapat **mendeteksi, melaporkan, dan mengusulkan** resolusi ketidaksinkronan antar dokumen engineering, tetapi **tidak berwenang** memutuskan resolusi tersebut secara final tanpa keterlibatan Owner/Approver manusia — berlaku juga untuk seluruh proses yang diatur EAF ini (Bagian 24, 29).

## 8.3 Prinsip Transparansi Penuh

Setiap ketidaksinkronan yang ditemukan — sekecil apa pun — wajib dicatat sebagai Governance Note atau Engineering Alignment Issue (Bagian 24.3), tidak boleh "diperbaiki diam-diam" tanpa jejak audit, konsisten dengan pola yang sudah dipakai `foundation-validation-report.md` dan `synchronization-report-adr-001.md`.

## 8.4 Prinsip Proporsionalitas

Tingkat formalitas proses governance (jumlah approval, kedalaman impact analysis) proporsional terhadap **tingkat risiko** perubahan, bukan seragam untuk semua jenis perubahan — lihat klasifikasi Change Severity di Bagian 30.2.

---

# 9. SOURCE OF TRUTH HIERARCHY

## 9.1 Hierarki Otoritas Dokumen

Ketika terjadi konflik informasi antar dokumen, urutan otoritas berikut **wajib** digunakan untuk menentukan dokumen mana yang benar, dari tertinggi ke terendah:

| Tingkat | Dokumen | Otoritas Atas |
|---|---|---|
| **1 (Tertinggi)** | `PROJECT-CONSTITUTION.md` | Aturan tetap tertinggi: role, security baseline, tech stack fundamental |
| **2** | `architecture-decision-records.md` (status Approved/Approved With Notes) | Keputusan arsitektur/teknologi per topik |
| **3** | `decision-log.md` | Riwayat kronologis keputusan, termasuk resolusi Open Decision |
| **4** | **Engineering Alignment Framework (dokumen ini)** | Cara dokumen Lapisan 3 disusun, disinkronkan, dan divalidasi |
| **5** | PRD | Requirement bisnis dan acceptance criteria |
| **6** | Entity Mapping → ERD → Database Schema | Struktur data, dari konsep ke fisik |
| **7** | Authorization & Access Control Specification | Aturan akses berbasis role/permission |
| **8** | API Specification | Kontrak endpoint |
| **9** | User Flow | Alur interaksi logis per role |
| **10** | SEO-Analytics Specification | Strategi visibilitas & rendering |
| **11 (Terendah, di antara dokumen sejenis)** | Engineering Validation Report | Hasil verifikasi — melaporkan, tidak mendefinisikan |

**Aturan penerapan:** Dokumen di tingkat lebih rendah **tidak pernah** boleh membatalkan dokumen di tingkat lebih tinggi. Jika ditemukan pertentangan, dokumen tingkat lebih rendah dianggap **belum disinkronkan**, bukan dokumen tingkat lebih tinggi yang salah — kecuali proses Change Management (Bagian 30) secara eksplisit menyimpulkan sebaliknya dan menghasilkan ADR baru.

## 9.2 Hierarki di Antara Dokumen Sejenis Tingkat 6 (Data)

Karena Entity Mapping, ERD, dan Database Schema membentuk rantai turunan langsung, berlaku aturan tambahan:

```
Entity Mapping (konsep/DDD)
        │  menjadi dasar
        ▼
ERD (struktur relasional/logis)
        │  menjadi dasar
        ▼
Database Schema (implementasi fisik/migrasi)
```

Perubahan **wajib** mengalir searah ini. Perubahan yang ditemukan di Database Schema (mis. hasil eksplorasi teknis) yang belum ada di ERD **tidak sah** dianggap keputusan final sampai ERD diperbarui terlebih dahulu (lihat Bagian 30.3).

## 9.3 Resolusi Ambiguitas

Jika sebuah topik tidak diatur eksplisit oleh dokumen Tingkat 1–3, maka EAF (Tingkat 4) berwenang menetapkan aturan proses-nya; namun **isi substantif** tetap harus diusulkan naik menjadi ADR baru jika sifatnya arsitektural, konsisten dengan Bagian 5 (Out of Scope).

---

# 10. ENGINEERING ALIGNMENT LIFECYCLE

## 10.1 Diagram Siklus

```
   [ADR/PRD Final] ──────────────────────────────────────────┐
          │                                                    │
          ▼                                                    │
   1. IDENTIFICATION                                           │
   (entity/rule/endpoint/permission diberi ID unik)             │
          │                                                    │
          ▼                                                    │
   2. DRAFTING                                                  │
   (dokumen engineering turunan ditulis merujuk ID)               │
          │                                                    │
          ▼                                                    │
   3. CROSS-REFERENCE MAPPING                                    │
   (Document Dependency Model diverifikasi, Bagian 12)             │
          │                                                    │
          ▼                                                    │
   4. CONSISTENCY VALIDATION                                     │
   (Engineering Validation, Bagian 28)                             │
          │                                                    │
     ┌────┴────┐                                                │
     ▼         ▼                                                │
  LOLOS      GAGAL ──► 5. CONFLICT RESOLUTION (Bagian 24) ───────┘
     │                        (kembali ke Drafting jika perlu)
     ▼
   6. REVIEW (Bagian 25)
     │
     ▼
   7. APPROVAL (Bagian 26)
     │
     ▼
   8. BASELINE (mewarisi status dari document-governance-baseline-register.md)
     │
     ▼
   9. MONITORING & DRIFT DETECTION (berkelanjutan)
     │
     └──► perubahan terdeteksi ──► kembali ke tahap 1 untuk item yang berubah
```

## 10.2 Penjelasan Setiap Tahap

| Tahap | Deskripsi | Output |
|---|---|---|
| **1. Identification** | Setiap entity/rule/endpoint/permission baru diberi ID sesuai standar Bagian 16–20 sebelum ditulis di dokumen mana pun. | Daftar ID terdaftar |
| **2. Drafting** | Dokumen ditulis dengan **mewajibkan** referensi ID, bukan mendefinisikan ulang. | Draf dokumen |
| **3. Cross-Reference Mapping** | Diperiksa apakah dokumen baru konsisten dengan Document Dependency Model (Bagian 12) — apakah prasyaratnya sudah ada dan sudah selaras. | Dependency check log |
| **4. Consistency Validation** | Dijalankan Engineering Validation Checklist (Bagian 28). | Validation report (lolos/gagal) |
| **5. Conflict Resolution** | Jika gagal, ketidaksinkronan diselesaikan sesuai Bagian 24 — tidak diperbaiki sepihak. | Resolution record |
| **6. Review** | Ditinjau oleh Reviewer sesuai Bagian 25. | Review comment/approval |
| **7. Approval** | Disetujui Approver sesuai Bagian 26. | Approval record |
| **8. Baseline** | Dokumen naik status Baseline mengikuti aturan `document-governance-baseline-register.md` Bagian 4. | Baseline version |
| **9. Monitoring & Drift Detection** | Setelah Baseline, dokumen dipantau agar tidak "drift" dari dokumen sumbernya ketika dokumen sumber berubah (lihat Bagian 23). | Drift alert (bila ada) |

---

# 11. ENGINEERING WORKFLOW

## 11.1 Workflow Harian AI Coding Assistant / Developer

Setiap kali seorang kontributor (AI atau manusia) akan menyentuh dokumen engineering apa pun, wajib mengikuti urutan berikut **tanpa pengecualian**:

```
STEP 1 — BACA project-manifest.md
         (untuk memastikan versi Baseline terbaru dokumen terkait)
STEP 2 — BACA dokumen di atasnya pada Source of Truth Hierarchy
         (Bagian 9) yang relevan dengan dokumen yang akan disentuh
STEP 3 — PERIKSA Document Dependency Model (Bagian 12)
         apakah seluruh prasyarat dokumen sudah Baseline
STEP 4 — PERIKSA Open Decision (decision-log.md) yang relevan
         dengan modul/entity/endpoint yang akan disentuh
STEP 5 — JIKA seluruh prasyarat terpenuhi → lanjut Drafting (Bagian 10.2)
         JIKA TIDAK → laporkan sebagai blocker, JANGAN berasumsi
STEP 6 — Terapkan Naming Convention & Identification Standard
         (Bagian 16–21) pada setiap elemen baru
STEP 7 — Jalankan Engineering Validation Checklist relevan
         (Bagian 28) sebelum menandai pekerjaan selesai
STEP 8 — Laporkan hasil (termasuk ketidaksinkronan yang ditemukan)
         — TIDAK memperbaiki keputusan Baseline secara sepihak
```

## 11.2 Larangan Eksplisit dalam Workflow

Konsisten dengan `PROJECT-CONSTITUTION.md`, dalam menjalankan EAF, kontributor (khususnya AI):

1. **Dilarang** mengasumsikan sebuah entity/endpoint/permission "pasti dimaksud demikian" tanpa merujuk ID resminya.
2. **Dilarang** melompati tahap Consistency Validation (Bagian 10.2 Tahap 4) dengan alasan "kelihatannya sudah benar".
3. **Dilarang** menuliskan kode produksi yang menyentuh entity/endpoint yang dokumennya belum melalui tahap Approval (Bagian 26).
4. **Dilarang** menyembunyikan atau tidak melaporkan ketidaksinkronan yang ditemukan selama proses.

---

# 12. DOCUMENT DEPENDENCY MODEL

## 12.1 Diagram Ketergantungan Dokumen Engineering

```
                    ┌─────────────────────────┐
                    │   PRD (per Modul)        │
                    └────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
   │  Entity Mapping    │ │   User Flow        │ │  SEO-Analytics     │
   └─────────┬──────────┘ └─────────┬──────────┘ │  Specification      │
             │                     │             └──────────────────┘
             ▼                     │                        ▲
   ┌──────────────────┐            │                        │
   │       ERD           │            │                        │ (butuh slug/
   └─────────┬──────────┘            │                        │  metadata entity)
             │                     │                        │
             ▼                     ▼                        │
   ┌──────────────────┐   ┌──────────────────┐              │
   │  Database Schema    │   │   API Specification ├──────────────┘
   └─────────┬──────────┘   └─────────┬──────────┘
             │                     │
             └──────────┬──────────┘
                         ▼
             ┌──────────────────────────┐
             │  Authorization & Access    │
             │  Control Specification      │
             └─────────────┬──────────────┘
                           ▼
             ┌──────────────────────────┐
             │  Engineering Validation     │
             │  Report                      │
             └──────────────────────────┘
```

## 12.2 Tabel Matriks Ketergantungan

| Dokumen | Bergantung Pada (Wajib Baseline/Approved Lebih Dulu) | Dependent Downstream |
|---|---|---|
| PRD | `architecture-decision-records.md`, `PROJECT-CONSTITUTION.md` | Entity Mapping, User Flow, SEO Spec |
| Entity Mapping | PRD | ERD |
| ERD | Entity Mapping, `technology-decisions.md` (bagian database) | Database Schema, API Specification |
| Database Schema | ERD, `technology-decisions.md`, `dependency-manifest.md` | Authorization Spec, Engineering Validation |
| API Specification | ERD, User Flow, `technology-decisions.md` | Authorization Spec, Engineering Validation |
| Authorization & Access Control Spec | Database Schema, API Specification, `PROJECT-CONSTITUTION.md` (role baseline) | Engineering Validation |
| User Flow | PRD | API Specification, SEO Spec |
| SEO-Analytics Specification | PRD, Entity Mapping (untuk metadata/slug), User Flow | Engineering Validation |
| Engineering Validation Report | Seluruh dokumen di atas | — (dokumen terminal, hanya melaporkan) |

## 12.3 Aturan Wajib Urutan Penyusunan

Sebuah dokumen **tidak boleh** memulai tahap Drafting (Bagian 10.2 Tahap 2) sebelum seluruh dokumen di kolom "Bergantung Pada" berstatus minimal **Approved** (lihat definisi status di `document-governance-baseline-register.md` Bagian 3). Pelanggaran atas aturan ini wajib dilaporkan sebagai Engineering Alignment Issue (Bagian 24.3), bukan dilanjutkan dengan asumsi.

---

# 13. DOCUMENT CLASSIFICATION

## 13.1 Klasifikasi Berdasarkan Fungsi

| Kelas | Dokumen | Karakteristik |
|---|---|---|
| **Kelas A — Requirement** | PRD | Mendefinisikan *apa* yang dibutuhkan bisnis; sumber untuk seluruh Kelas B/C |
| **Kelas B — Structural Design** | Entity Mapping, ERD, User Flow | Mendefinisikan *struktur* konseptual/logis sebelum implementasi |
| **Kelas C — Contract** | API Specification, Authorization & Access Control Specification | Mendefinisikan *kontrak* yang mengikat antara sistem/lapisan/role |
| **Kelas D — Physical Implementation Reference** | Database Schema | Representasi fisik/migrasi aktual, turunan langsung Kelas B |
| **Kelas E — Cross-Cutting Concern** | SEO-Analytics Specification | Melintasi banyak modul, bergantung pada Kelas A dan B tetapi tidak mengubah struktur inti |
| **Kelas F — Verification** | Engineering Validation Report | Tidak mendefinisikan apa pun baru; hanya memverifikasi kesesuaian Kelas A–E |

## 13.2 Aturan Antar Kelas

- Kelas B/C/D/E **tidak boleh** bertentangan dengan Kelas A tanpa melalui perubahan PRD terlebih dahulu.
- Kelas D **tidak boleh** memiliki struktur yang berbeda dari Kelas B (ERD) — setiap perbedaan yang ditemukan pada tahap implementasi wajib dikembalikan dulu ke ERD (Bagian 9.2).
- Kelas F **tidak memiliki wewenang mendefinisikan** — hanya melaporkan status kesesuaian.

## 13.3 Klasifikasi Berdasarkan Cakupan (Scope Level)

| Level | Contoh | Karakteristik |
|---|---|---|
| **Global** | `PROJECT-CONSTITUTION.md`, EAF ini sendiri | Berlaku seluruh proyek, seluruh modul |
| **Cross-Module** | ERD (skema penuh), API Specification (penuh), Authorization Spec (penuh) | Mencakup banyak Bounded Context sekaligus, dengan bagian per modul |
| **Per-Module** | PRD per modul, User Flow per modul, SEO Spec per modul (bila dipecah) | Spesifik satu Bounded Context |

## 13.4 Registrasi Dokumen Jenis Baru

Dokumen jenis baru yang belum tercantum di Bagian 4 (Scope) **otomatis tunduk** pada EAF begitu ia teridentifikasi sebagai dokumen engineering turunan dari keputusan bisnis/arsitektur — tidak memerlukan amandemen EAF terlebih dahulu. Namun, dokumen tersebut **wajib** diklasifikasikan ke salah satu Kelas A–F (atau kelas baru yang diusulkan) sebagai bagian dari proses Drafting-nya, dan dicatat di Appendix (Bagian 34) pada revisi EAF berikutnya.

---

# 14. DOCUMENT OWNERSHIP

## 14.1 Model Kepemilikan

Konsisten dengan resolusi **OD-06** (`decision-log.md`) yang telah menetapkan kepemilikan tunggal seluruh dokumen governance kepada Mujtahid Aktanto sebagai Project Owner solo (AI-Assisted), EAF menetapkan model kepemilikan yang sama untuk seluruh dokumen Kelas A–F:

| Peran | Definisi dalam Konteks EAF |
|---|---|
| **Owner** | Mujtahid Aktanto — pemegang wewenang final atas seluruh keputusan Approval (Bagian 26) dan resolusi konflik (Bagian 24) yang tidak dapat diselesaikan otomatis melalui aturan eksplisit EAF. |
| **Author (Drafting Role)** | Dapat dijalankan oleh AI Coding Assistant di bawah instruksi Owner, atau kontributor manusia bila proyek berkembang menjadi tim. Author bertanggung jawab menghasilkan draf yang **patuh** terhadap EAF, bukan menyetujui isinya sendiri. |
| **Reviewer** | Pada struktur solo-project saat ini, peran Reviewer dijalankan oleh Owner sendiri pada sesi terpisah dari sesi Drafting (self-review terstruktur menggunakan Checklist Bagian 28), atau oleh AI Coding Assistant kedua yang independen dari Author sebagai *cross-check* — namun **tidak pernah** menggantikan wewenang Approval Owner. |
| **Approver** | Mujtahid Aktanto — tidak dapat didelegasikan ke AI dalam kondisi apa pun (lihat Bagian 8.2). |

## 14.2 Prinsip Ownership per Dokumen

Setiap dokumen Kelas A–F memiliki **satu** Owner (selalu sama, mengikuti OD-06), namun dapat memiliki **banyak Author** lintas sesi kerja — riwayat kontribusi tiap sesi wajib dicatat di `CHANGELOG.md`, bukan di dokumen itu sendiri, konsisten dengan pola yang sudah berlaku.

## 14.3 Tanggung Jawab Ownership Terhadap Alignment

Owner bertanggung jawab akhir untuk memastikan seluruh dokumen di bawah kepemilikannya tetap selaras satu sama lain sesuai EAF — tanggung jawab ini **tidak dapat** dilimpahkan ke AI Coding Assistant, meskipun AI dapat membantu mendeteksi ketidaksinkungan (Bagian 8.2, 24).

---

# 15. TRACEABILITY STRATEGY

## 15.1 Prinsip Traceability

Setiap artefak teknis (skema tabel, endpoint, aturan permission) harus dapat ditelusuri **mundur** ke keputusan bisnis/arsitektur asalnya, dan setiap requirement harus dapat ditelusuri **maju** ke implementasinya. Traceability dua arah ini dicapai melalui **skema ID eksplisit** (Bagian 16–20), bukan melalui deskripsi naratif semata.

## 15.2 Rantai Traceability Standar

```
ADR-XXX / PRD Requirement (REQ-XXX)
        │
        ▼
Business Rule (BR-XXX)
        │
        ▼
Entity (ENT-XXX) ──────────► Permission (PERM-XXX)
        │                            │
        ▼                            ▼
ERD Table/Field            Authorization Matrix Row
        │                            │
        ▼                            ▼
Database Schema Column      Middleware/Policy Rule
        │                            │
        ▼                            ▼
API Endpoint (API-XXX) ◄────────────┘
        │
        ▼
Engineering Validation Checklist Item
```

## 15.3 Matriks Traceability Wajib

Setiap dokumen Kelas B/C/D wajib menyertakan **kolom referensi ID** eksplisit ke dokumen sumbernya. Contoh format minimum untuk ERD:

| Nama Field | Tipe | REQ Reference | BR Reference | Catatan |
|---|---|---|---|---|
| *(field aktual)* | *(tipe aktual)* | `REQ-XXX` | `BR-XXX` (bila ada) | *(catatan)* |

Format serupa (dengan kolom Reference wajib) berlaku untuk API Specification (tiap endpoint mereferensikan `REQ-XXX`/`ENT-XXX`), Authorization Specification (tiap baris permission mereferensikan `ENT-XXX`/`PERM-XXX`), dan SEO Specification (tiap metadata mereferensikan `ENT-XXX` terkait).

## 15.4 Traceability Terhadap Dokumen Non-Engineering

Traceability tidak berhenti di Kelas A–F — rantai wajib dapat ditelusuri hingga ke `architecture-decision-records.md` (untuk keputusan arsitektur) dan `decision-log.md` (untuk keputusan bisnis/administratif), menggunakan ID asli yang sudah dipakai dokumen-dokumen tersebut (`ADR-XXX`, entri `decision-log.md` dengan nomor sekuensial ganda sesuai catatan Bagian 9.1 dokumen tsb, dan `OD-XX` untuk Open Decision).

---

# 16. REQUIREMENT IDENTIFICATION STANDARD

## 16.1 Format ID

```
REQ-[MODUL]-[NNN]
```

| Komponen | Aturan |
|---|---|
| `MODUL` | Kode 2 digit modul, sesuai penomoran 13 modul resmi proyek (M01–M13, lihat Bagian 21.3 untuk tabel lengkap) |
| `NNN` | Nomor urut 3 digit, dimulai dari 001, unik per modul, tidak pernah didaur ulang meskipun requirement dihapus |

**Contoh:** `REQ-M03-012` = requirement ke-12 pada Modul 3 (Listing Properti).

## 16.2 Aturan Siklus Hidup Requirement ID

- ID **tidak pernah dihapus** meskipun requirement dibatalkan — status diubah menjadi `Deprecated` (mengikuti status di `document-governance-baseline-register.md` Bagian 3), bukan dihapus dari pencatatan.
- Requirement yang direvisi signifikan (bukan sekadar redaksional) mendapat ID baru dengan catatan silang eksplisit "Menggantikan `REQ-XXX`" — konsisten dengan prinsip "History tidak boleh dihapus" di `CHANGELOG.md`.
- Requirement lintas modul (mis. melibatkan Modul 3 dan Modul 8 sekaligus) diberi ID pada modul **primer**-nya (modul yang memiliki dampak fungsional terbesar), dengan referensi silang eksplisit dicatat di kedua PRD modul terkait.

## 16.3 Registrasi Wajib

Setiap `REQ-XXX` baru wajib terdaftar di tabel indeks requirement pada PRD modul terkait sebelum digunakan sebagai referensi di dokumen Kelas B/C/D/E manapun.

---

# 17. BUSINESS RULE IDENTIFICATION STANDARD

## 17.1 Format ID

```
BR-[MODUL]-[NNN]
```

Format dan aturan siklus hidup mengikuti pola yang identik dengan Requirement ID (Bagian 16), dengan perbedaan definisi:

| Perbedaan REQ vs BR | Penjelasan |
|---|---|
| **REQ** | Menyatakan *kebutuhan fungsional/non-fungsional* pada level fitur (mis. "Agent dapat mempublikasikan listing"). |
| **BR** | Menyatakan *aturan bisnis/constraint* yang berlaku terlepas dari fitur spesifik mana pun (mis. "Listing tidak dapat dipublikasikan tanpa minimal 3 foto"). |

## 17.2 Relasi BR terhadap Entity dan Endpoint

Setiap `BR-XXX` **wajib** memiliki pemetaan eksplisit ke:
1. Entity yang terdampak (`ENT-XXX`, Bagian 18) — untuk constraint level data.
2. Endpoint yang menegakkan aturan tersebut (`API-XXX`, Bagian 19) — untuk constraint level validasi request.

Business Rule yang tidak dapat dipetakan ke salah satu dari keduanya dianggap **belum siap diimplementasikan** dan wajib ditandai `Not Yet Mappable` di Engineering Validation Report (Bagian 28).

---

# 18. ENTITY IDENTIFICATION STANDARD

## 18.1 Format ID

```
ENT-[MODUL]-[NamaEntitySingular]
```

Berbeda dari REQ/BR yang memakai nomor urut, Entity ID memakai **nama deskriptif PascalCase singular** (bukan angka) agar tetap manusiawi-terbaca (human-readable) mengingat entity adalah konsep yang dirujuk sangat sering lintas dokumen.

**Contoh:** `ENT-M03-Listing`, `ENT-M03-ListingPhoto`, `ENT-M01-User`.

## 18.2 Aturan Penamaan Entity

| Aturan | Penjelasan |
|---|---|
| Singular, bukan plural | `ENT-M03-Listing`, bukan `ENT-M03-Listings` — konsisten dengan konvensi penamaan tabel di ERD yang sudah dipakai proyek |
| Satu entity = satu ID, terlepas jumlah tabel fisik | Sebuah entity konseptual (mis. `ENT-M01-User`) yang direalisasikan menjadi lebih dari satu tabel fisik (mis. tabel `users` + tabel `user_profiles`) tetap **satu** Entity ID di level Entity Mapping/ERD; pemecahan ke tabel fisik dicatat di Database Schema tanpa ID baru |
| Modul pemilik ditentukan oleh **Aggregate Root**-nya | Mengikuti prinsip DDD (Bagian 6.2) — entity anak (mis. `ListingPhoto`) mewarisi kode modul dari Aggregate Root-nya (`Listing`), bukan dari modul tempat ia "kebetulan" pertama kali dipakai |
| Entity bersama lintas modul (shared kernel) | Diberi kode modul asalnya (modul yang pertama mendefinisikan), dengan seluruh modul pemakai wajib mereferensikan ID yang sama — dilarang membuat entity duplikat dengan nama berbeda untuk konsep yang sama (pelanggaran DRY, Bagian 6.2) |

## 18.3 Registrasi dan Single Source of Truth

Entity Mapping adalah **satu-satunya** dokumen yang berwenang mendaftarkan `ENT-XXX` baru. ERD, Database Schema, API Specification, dan Authorization Specification **hanya mereferensikan**, tidak pernah mendefinisikan entity baru secara independen.

---

# 19. API IDENTIFICATION STANDARD

## 19.1 Format ID

```
API-[MODUL]-[NNN]
```

Format numerik mengikuti pola REQ/BR (Bagian 16), unik per modul, tidak pernah didaur ulang.

**Contoh:** `API-M03-005` = endpoint ke-5 yang terdaftar pada Modul 3.

## 19.2 Aturan Pemetaan Endpoint ke ID

| Aturan | Penjelasan |
|---|---|
| Satu kombinasi Method + Path = satu `API-XXX` | `GET /properties/{id}` dan `PATCH /properties/{id}` adalah dua `API-XXX` berbeda meskipun path sama |
| Endpoint wajib mereferensikan `ENT-XXX` dan `REQ-XXX` | Setiap baris API Specification wajib mencantumkan entity yang dioperasikan dan requirement yang dipenuhi |
| Endpoint lintas modul diberi kode modul dari resource utamanya | Ditentukan oleh entity utama pada path (mis. `/properties/{id}/agent-notes` tetap `M03` karena resource utamanya adalah `Listing`, meskipun `agent-notes` konseptual dekat dengan Modul 8) |
| Versioning endpoint (bila di masa depan API di-versi, mis. `/v2/...`) | ID `API-XXX` tetap sama, dicatat sebagai revisi dengan riwayat versi eksplisit — bukan ID baru — karena mewakili kontrak fungsional yang sama secara konsep |

## 19.3 Relasi terhadap Naming Convention Path

Path aktual endpoint (mis. `/properties`, `/properties/{id}/photos`) wajib mengikuti Naming Convention Bagian 21.2, dan **bukan** merupakan bagian dari skema ID `API-XXX` itu sendiri — ID adalah identitas administratif untuk traceability, path adalah kontrak teknis aktual.

---

# 20. PERMISSION IDENTIFICATION STANDARD

## 20.1 Format ID

```
PERM-[MODUL]-[Aksi]-[NamaEntitySingular]
```

**Contoh:** `PERM-M03-Create-Listing`, `PERM-M03-Publish-Listing`, `PERM-M08-View-DashboardSummary`.

## 20.2 Daftar Aksi Standar (Vocabulary Tertutup)

Untuk menjaga konsistensi lintas modul, komponen `Aksi` **wajib** dipilih dari daftar tertutup berikut (extensible hanya melalui amandemen EAF, Bagian 33.3):

| Aksi | Makna |
|---|---|
| `Create` | Membuat instance entity baru |
| `View` | Membaca satu/banyak instance (termasuk daftar/list) |
| `Update` | Mengubah field pada instance yang sudah ada |
| `Delete` | Soft-delete atau hard-delete instance (jenis delete mengikuti kebijakan `ADR-046`) |
| `Publish` | Mengubah status entity menjadi tampil publik (khusus entity yang memiliki konsep publikasi, mis. Listing) |
| `Approve` | Menyetujui sebuah entity/permintaan yang memerlukan validasi pihak lain |
| `Assign` | Menugaskan relasi antar entity (mis. menugaskan Agent ke Listing) |
| `Export` | Mengekspor data ke format eksternal |
| `Manage` | Wewenang administratif penuh atas sebuah entity, mencakup seluruh aksi di atas — dipakai hanya untuk role administratif tertinggi per modul |

## 20.3 Relasi Permission terhadap Role

Authorization & Access Control Specification wajib memetakan setiap `PERM-XXX` ke role resmi proyek (7 role final sesuai resolusi **OD-02**), dalam bentuk matriks eksplisit — bukan narasi. Permission yang belum dipetakan ke minimal satu role dianggap **tidak lengkap** dan gagal Engineering Validation (Bagian 28).

## 20.4 Prinsip Security by Design dalam Penomoran

Permission ID **wajib** dibuat bersamaan dengan Entity ID pada tahap Entity Mapping (bukan belakangan setelah API Specification selesai) — menegakkan prinsip Security by Design (Bagian 6.2) secara struktural, bukan hanya sebagai imbauan.

---

# 21. NAMING CONVENTION

## 21.1 Prinsip Umum

Seluruh penamaan teknis dalam dokumen engineering wajib **konsisten lintas dokumen** — nama yang dipakai di ERD adalah nama yang **sama persis** (bukan sinonim atau terjemahan) yang dipakai di API Specification, Authorization Specification, dan User Flow, sesuai prinsip Ubiquitous Language (Bagian 6.2).

## 21.2 Konvensi per Jenis Elemen

| Elemen | Konvensi | Contoh |
|---|---|---|
| Nama tabel database | `snake_case`, plural | `listings`, `listing_photos` |
| Nama kolom database | `snake_case`, singular | `agent_id`, `published_at` |
| Nama entity konseptual (Entity Mapping/ERD) | `PascalCase`, singular | `Listing`, `ListingPhoto` |
| Path endpoint API | `kebab-case`, plural untuk collection resource | `/properties`, `/agent-reviews` |
| Nama field JSON pada request/response API | `camelCase` | `agentId`, `publishedAt` |
| Nama role | `PascalCase`, sesuai 7 role final proyek | `Agent`, `BuyerAccount` |
| Nama Business Rule (deskriptif, bukan hanya ID) | Kalimat imperatif singkat | "Listing wajib memiliki minimal 3 foto sebelum dipublikasikan" |
| Nama file dokumen | `PascalCase` dengan tanda hubung, mengikuti pola yang sudah dipakai proyek | `API-Specification-RUMAHAGEN-v1.1.md` |

## 21.3 Kode Modul Resmi (Referensi untuk Bagian 16–20)

| Kode | Nama Modul |
|---|---|
| M01 | Autentikasi & Manajemen User/Role |
| M02 | Buyer Account & Agent Reviews (termasuk ekstensinya) |
| M03 | Listing Properti |
| M04 | Learning Center |
| M05 | Kalender Event |
| M06 | Developer Directory |
| M07 | DBR Scoring Calculator |
| M08 | Dashboard & Notifikasi |
| M09 | *(sesuai penomoran resmi berikutnya di PRD/DEVELOPMENT-ROADMAP — dirujuk, tidak didefinisikan ulang, oleh EAF)* |
| M10 | *(idem)* |
| M11 | SEO Foundation Hardening |
| M12 | Organization |
| M13 | AI Assistant |

> **Catatan:** Tabel ini adalah **referensi silang**, bukan definisi otoritatif — definisi modul dan urutannya tetap otoritatif di `PRD` dan `DEVELOPMENT-ROADMAP.md`. Jika terjadi perbedaan penomoran, PRD/Roadmap yang berlaku (sesuai Source of Truth Hierarchy, Bagian 9), dan tabel ini wajib disinkronkan mengikuti (lihat Bagian 23).

## 21.4 Larangan Sinonim

Dilarang menggunakan sinonim atau variasi istilah untuk konsep yang sama antar dokumen (mis. "Klien" di satu dokumen dan "Customer" di dokumen lain untuk entity yang identik). Setiap istilah domain wajib memiliki **satu** istilah baku yang didaftarkan di Glosarium (Bagian 34.1).

---

# 22. VERSIONING STRATEGY

## 22.1 Pewarisan dari Document Governance Baseline Register

EAF **tidak menciptakan skema versioning baru** — seluruh dokumen Kelas A–F mengikuti Semantic Versioning (`MAJOR.MINOR[.PATCH]`) yang sudah ditetapkan `document-governance-baseline-register.md` Bagian 5, tanpa pengecualian.

## 22.2 Penambahan Khusus EAF: Versioning pada Level Elemen (ID-Level Versioning)

Karena EAF memperkenalkan skema ID granular (REQ/BR/ENT/API/PERM), diperlukan aturan tambahan **di bawah** level versi dokumen:

| Skenario | Aturan |
|---|---|
| Elemen baru ditambahkan pada dokumen yang sudah Baseline | Menghasilkan MINOR version baru pada dokumen, ID elemen baru ditambahkan ke indeks tanpa mengganggu ID yang sudah ada |
| Elemen yang sudah ada diubah maknanya secara substantif | Menghasilkan MAJOR version baru pada dokumen; ID elemen **tidak berubah**, namun statusnya dicatat "Revised — lihat versi dokumen X.Y" |
| Elemen dihapus/dibatalkan | ID diberi status `Deprecated` (bukan dihapus), dokumen naik MINOR atau MAJOR tergantung dampak (Bagian 30.2) |

## 22.3 Versi Framework Ini Sendiri

EAF sendiri tunduk pada aturan yang sama: perubahan pada bab-bab prinsip (6–9) yang mengubah aturan inti = MAJOR; penambahan klarifikasi/appendix = MINOR; perbaikan redaksional = PATCH.

---

# 23. SYNCHRONIZATION RULES

## 23.1 Prinsip Event-Driven Synchronization

Setiap perubahan pada dokumen Kelas A/B (PRD, Entity Mapping, ERD) diperlakukan sebagai **event** yang **wajib** memicu pengecekan dampak eksplisit terhadap seluruh dokumen dependen yang tercantum di Document Dependency Model (Bagian 12.2) — tidak boleh diasumsikan "tidak berdampak" tanpa pengecekan aktual.

## 23.2 Prosedur Sinkronisasi Wajib

```
PERUBAHAN TERJADI pada Dokumen X
        │
        ▼
1. Identifikasi seluruh Dokumen Dependent(X) via Bagian 12.2
        │
        ▼
2. Untuk setiap Dokumen Dependent:
   - Apakah ID (REQ/BR/ENT/API/PERM) yang terdampak dirujuk di dalamnya?
   - JIKA YA → tandai sebagai "Perlu Sinkronisasi"
   - JIKA TIDAK → tandai sebagai "Tidak Terdampak" (dicatat, bukan diabaikan diam-diam)
        │
        ▼
3. Untuk setiap dokumen "Perlu Sinkronisasi":
   - Buat Engineering Alignment Issue (Bagian 24.3)
   - Tentukan Change Severity (Bagian 30.2)
        │
        ▼
4. Jalankan Change Management (Bagian 30) untuk tiap issue
        │
        ▼
5. Perbarui Document Dependency Model bila relasi berubah
        │
        ▼
6. Catat seluruh langkah di atas sebagai audit trail (Bagian 29)
```

## 23.3 Frekuensi Pengecekan

Prosedur sinkronisasi wajib dijalankan **setiap kali** dokumen Kelas A/B mengalami perubahan yang naik ke status Baseline baru — bukan secara periodik terjadwal, karena sifat proyek saat ini (solo project, AI-assisted, perubahan tidak kontinu setiap hari).

---

# 24. CONFLICT RESOLUTION RULES

## 24.1 Definisi Konflik dalam Konteks EAF

Sebuah **Engineering Alignment Conflict** terjadi ketika dua atau lebih dokumen Kelas A–F memberikan informasi yang saling bertentangan mengenai elemen yang sama (ID yang sama, atau elemen yang seharusnya merujuk pada konsep yang sama namun didefinisikan berbeda).

## 24.2 Klasifikasi Tingkat Keparahan Konflik

| Tingkat | Kriteria | Contoh |
|---|---|---|
| **Critical** | Konflik yang jika tidak diselesaikan akan menyebabkan kegagalan fungsional atau celah keamanan | Sebuah `PERM-XXX` diizinkan di Authorization Spec namun endpoint terkait di API Spec tidak memvalidasinya |
| **Major** | Konflik struktural yang mempengaruhi implementasi namun tidak langsung menyebabkan celah keamanan | Tipe data field di ERD berbeda dengan tipe field di API Specification |
| **Minor** | Konflik redaksional/penamaan yang tidak mengubah perilaku sistem | Nama field konsisten secara makna namun berbeda casing di dua dokumen |
| **Informational** | Potensi ambiguitas yang belum tentu konflik nyata, perlu klarifikasi | Sebuah entity dirujuk di dua modul tanpa kejelasan modul pemiliknya |

## 24.3 Prosedur Pelaporan (Engineering Alignment Issue)

Setiap konflik yang ditemukan — oleh AI maupun manusia — wajib dicatat dalam format berikut, mengikuti pola tabel yang sudah dipakai `foundation-validation-report.md`:

| Field | Isi |
|---|---|
| **Issue ID** | `EAI-[NNN]` (Engineering Alignment Issue, penomoran global lintas modul) |
| **Tanggal Ditemukan** | — |
| **Ditemukan Oleh** | AI Coding Assistant / Owner / Reviewer |
| **Dokumen Terdampak** | Daftar dokumen + versi |
| **ID Elemen Terdampak** | `REQ-XXX` / `ENT-XXX` / dst. |
| **Deskripsi Konflik** | — |
| **Tingkat Keparahan** | Critical / Major / Minor / Informational |
| **Status** | Open / Under Review / Resolved / Deferred |
| **Resolusi** | Diisi setelah melalui Bagian 24.4 |

## 24.4 Prosedur Resolusi

1. **Konflik Critical/Major** wajib dieskalasi ke Owner sebelum pekerjaan lanjutan pada dokumen terkait dilanjutkan — konsisten dengan larangan menulis kode produksi sebelum Open Decision terkait diselesaikan (`PROJECT-CONSTITUTION.md`).
2. **Konflik Minor/Informational** dapat diperbaiki melalui jalur PATCH (Bagian 22) tanpa proses Approval penuh, namun tetap wajib dicatat di `EAI-[NNN]` dan `CHANGELOG.md`.
3. **AI tidak berwenang menentukan resolusi final** untuk tingkat Critical/Major (Bagian 8.2) — AI hanya boleh mengusulkan opsi resolusi.
4. Resolusi yang bersifat keputusan arsitektur baru **wajib** dinaikkan menjadi ADR baru di `architecture-decision-records.md`, bukan diselesaikan hanya di level EAF.

---

# 25. REVIEW WORKFLOW

## 25.1 Tahapan Review

Mengikuti status `In Review` pada `document-governance-baseline-register.md` Bagian 3, EAF menetapkan checklist review spesifik untuk dokumen engineering:

| Langkah | Aktivitas | Penanggung Jawab |
|---|---|---|
| R1 | Verifikasi seluruh ID (REQ/BR/ENT/API/PERM) yang dirujuk benar-benar terdaftar (tidak ada ID "hantu") | Reviewer |
| R2 | Verifikasi Naming Convention (Bagian 21) diikuti secara konsisten | Reviewer |
| R3 | Verifikasi Document Dependency Model (Bagian 12) — prasyarat sudah pada status yang sesuai | Reviewer |
| R4 | Jalankan Engineering Validation Checklist (Bagian 28) | Reviewer/AI |
| R5 | Periksa apakah ada Engineering Alignment Issue terbuka yang relevan (Bagian 24.3) | Reviewer |
| R6 | Berikan rekomendasi: Lolos ke Approval / Perlu Revisi / Ditolak | Reviewer |

## 25.2 Independensi Review

Sedapat mungkin, Reviewer (baik manusia maupun sesi AI terpisah) **berbeda** dari Author yang menulis draf, untuk menghindari bias konfirmasi — sesuai catatan pada Bagian 14.1. Pada kondisi solo-project, independensi dicapai melalui **jeda waktu dan sesi terpisah**, bukan orang berbeda.

---

# 26. APPROVAL WORKFLOW

## 26.1 Syarat Approval

Sebuah dokumen Kelas A–F hanya dapat naik status Approved (menuju Baseline, mengikuti `document-governance-baseline-register.md` Bagian 4.1) jika:

1. Telah lolos seluruh langkah Review (Bagian 25.1).
2. Tidak ada Engineering Alignment Issue berstatus Open dengan tingkat Critical/Major yang berkaitan langsung dengan dokumen tersebut.
3. Owner secara eksplisit menyatakan persetujuan (tercatat, bukan tersirat).

## 26.2 Format Pencatatan Approval

| Field | Isi |
|---|---|
| **Dokumen** | Nama + versi |
| **Tanggal Approval** | — |
| **Approver** | Mujtahid Aktanto |
| **Catatan Kondisional (bila ada)** | Mengikuti pola "Catatan kondisional dari Board (belum ditutup)" yang sudah dipakai di `CURRENT-PROJECT-STATE.md` untuk ADR |
| **EAI Terkait yang Masih Terbuka (bila diterima sebagai catatan, bukan blocker)** | Daftar `EAI-[NNN]` |

## 26.3 Larangan Self-Approval Tanpa Review

Meskipun Owner tunggal, Approval **tidak boleh** dilakukan tanpa melalui tahap Review (Bagian 25) terlebih dahulu, sekalipun dijalankan oleh orang yang sama pada sesi berbeda — untuk mempertahankan disiplin proses, konsisten dengan Governance Principles (Bagian 8).

---

# 27. QUALITY GATE

## 27.1 Definisi Quality Gate

Quality Gate adalah **titik pemeriksaan wajib** yang harus dilalui sebelum sebuah dokumen engineering diizinkan berpindah tahap dalam Engineering Alignment Lifecycle (Bagian 10).

## 27.2 Quality Gate per Tahap

| Gate | Ditempatkan Setelah Tahap | Kriteria Lolos |
|---|---|---|
| **QG-1 (Identification Gate)** | Identification | Seluruh ID baru mengikuti format Bagian 16–20, tidak ada duplikasi ID |
| **QG-2 (Structural Gate)** | Drafting | Dokumen memiliki seluruh kolom Reference wajib (Bagian 15.3) |
| **QG-3 (Dependency Gate)** | Cross-Reference Mapping | Seluruh prasyarat pada Document Dependency Model berstatus sesuai (Bagian 12.3) |
| **QG-4 (Consistency Gate)** | Consistency Validation | Lolos seluruh item Engineering Validation Checklist (Bagian 28) |
| **QG-5 (Governance Gate)** | Review & Approval | Lolos Review (Bagian 25) dan Approval (Bagian 26) tercatat |

## 27.3 Aturan Non-Bypass

Tidak ada Gate yang boleh dilewati dengan alasan urgensi, kecuali melalui **Expedited Path** yang secara eksplisit hanya berlaku untuk dokumen berstatus Draft murni untuk keperluan eksplorasi teknis internal — dokumen hasil Expedited Path **tidak pernah** boleh dirujuk sebagai keputusan final (konsisten dengan status Draft di `document-governance-baseline-register.md` Bagian 3).

---

# 28. ENGINEERING VALIDATION

## 28.1 Tujuan

Engineering Validation adalah proses verifikasi eksplisit — bukan asumsi — bahwa sebuah dokumen benar-benar selaras dengan EAF dan dokumen dependennya, menghasilkan **Engineering Validation Report** sebagai dokumen Kelas F.

## 28.2 Checklist Validasi Universal (Berlaku Semua Kelas Dokumen)

| # | Item Pemeriksaan | Lolos/Gagal |
|---|---|---|
| 1 | Seluruh ID yang dirujuk terdaftar resmi (tidak ada ID hantu) | |
| 2 | Naming Convention (Bagian 21) diikuti konsisten | |
| 3 | Tidak ada duplikasi definisi entity/rule/endpoint/permission (prinsip DRY) | |
| 4 | Traceability dua arah (Bagian 15) dapat ditelusuri penuh | |
| 5 | Document Dependency Model (Bagian 12) terpenuhi | |
| 6 | Tidak ada Engineering Alignment Issue Critical/Major terbuka terkait dokumen ini | |
| 7 | Versi dokumen konsisten dengan `document-governance-baseline-register.md` | |
| 8 | Bahasa dan istilah domain konsisten dengan Glosarium (Bagian 34.1) | |

## 28.3 Checklist Tambahan per Kelas Dokumen

| Kelas | Item Tambahan |
|---|---|
| **Kelas B (Entity Mapping/ERD/User Flow)** | Setiap entity memiliki Aggregate Root yang jelas; setiap relasi memiliki kardinalitas eksplisit |
| **Kelas C (API/Authorization Spec)** | Setiap endpoint memiliki permission yang dipetakan eksplisit; tidak ada endpoint tanpa aturan otorisasi |
| **Kelas D (Database Schema)** | Setiap tabel memiliki kolom soft-delete sesuai kebijakan `ADR-046` bila berlaku untuk entity tsb; tipe data konsisten dengan ERD |
| **Kelas E (SEO Spec)** | Setiap metadata/slug memiliki referensi `ENT-XXX` yang valid |

## 28.4 Output Engineering Validation Report

Laporan wajib memuat: daftar item lolos/gagal per dokumen yang diperiksa, daftar `EAI-[NNN]` yang dihasilkan dari kegagalan, dan rekomendasi eksplisit (Lolos ke Approval / Perlu Revisi).

---

# 29. RISK ASSESSMENT

## 29.1 Risiko yang Ditangani EAF

| Risiko | Mitigasi oleh EAF |
|---|---|
| Drift dokumentasi seiring waktu (dokumen tidak lagi mencerminkan keputusan aktual) | Synchronization Rules (Bagian 23) + Monitoring & Drift Detection (Bagian 10.2 Tahap 9) |
| Inkonsistensi penamaan lintas dokumen | Naming Convention (Bagian 21) + Glosarium (Bagian 34.1) |
| Kehilangan jejak alasan sebuah keputusan teknis | Traceability Strategy (Bagian 15) |
| AI membuat asumsi tanpa dasar saat konteks tidak lengkap | Larangan eksplisit (Bagian 11.2) + Workflow wajib (Bagian 11.1) |
| Ketergantungan pada satu orang (bus factor) untuk memahami struktur proyek | Idempotent Documentation (Bagian 7.4) — dokumen harus dapat dipahami tanpa riwayat percakapan |
| Perubahan pada satu dokumen tidak terdeteksi dampaknya ke dokumen lain | Document Dependency Model (Bagian 12) + Synchronization Rules (Bagian 23) |
| Konflik diselesaikan secara ad-hoc/tidak konsisten | Conflict Resolution Rules (Bagian 24) yang terstandarisasi |

## 29.2 Risiko Residual (Tidak Sepenuhnya Dieliminasi)

| Risiko Residual | Alasan Tidak Dapat Dieliminasi Penuh oleh EAF | Mitigasi Parsial |
|---|---|---|
| Kesalahan manusia dalam menerapkan aturan EAF secara manual | EAF adalah standar proses, bukan tooling otomatis yang menegakkan diri sendiri | Checklist eksplisit (Bagian 28) mengurangi, tidak menghilangkan, risiko ini |
| Skala proyek yang tumbuh melampaui kapasitas proses solo-project | EAF dirancang proporsional (Bagian 8.4) untuk kondisi saat ini | Future Evolution Guideline (Bagian 33) menyediakan jalur eskalasi proses |

## 29.3 Audit Trail sebagai Mitigasi Struktural

Seluruh keputusan alignment (resolusi konflik, approval, perubahan naming) wajib tercatat dengan pelaku, waktu, dan alasan di `CHANGELOG.md` dan/atau `decision-log.md` mengikuti pola yang sudah berlaku — bukan hanya di dalam dokumen itu sendiri, agar audit trail tetap dapat ditelusuri meskipun sebuah dokumen direvisi total.

---

# 30. CHANGE MANAGEMENT

## 30.1 Prinsip Umum

Change Management EAF **mewarisi penuh** mekanisme di `document-governance-baseline-register.md` Bagian 4.2 dan 11 (Request → Decision Log → Impact Analysis → Update → Review → Approval → New Baseline), dengan penambahan khusus untuk konteks lintas dokumen engineering di bawah ini.

## 30.2 Klasifikasi Severity Perubahan

| Severity | Kriteria | Proses yang Wajib Dilalui |
|---|---|---|
| **Structural Change** | Mengubah Entity/Business Rule/Permission yang sudah dirujuk dokumen lain | Full Change Management + Impact Analysis ke seluruh Dependent (Bagian 12.2) + kemungkinan ADR baru |
| **Additive Change** | Menambah elemen baru tanpa mengubah yang sudah ada | Identification (Bagian 10.2 Tahap 1) → Drafting → Validation, tanpa perlu Impact Analysis penuh |
| **Editorial Change** | Redaksional, tidak mengubah makna/ID | Jalur PATCH (Bagian 22.1), dicatat di `CHANGELOG.md` |

## 30.3 Aturan Khusus: Perubahan yang Ditemukan pada Tahap Implementasi Fisik

Jika selama implementasi (Database Schema/kode) ditemukan kebutuhan perubahan yang belum ada di ERD/Entity Mapping (skenario umum dalam proyek nyata), **wajib** mengikuti urutan:

```
1. JANGAN langsung ubah Database Schema/kode
2. Ajukan sebagai Engineering Alignment Issue (EAI-XXX)
3. Perbarui ERD/Entity Mapping terlebih dahulu (mengikuti Change Management)
4. Baru setelah ERD/Entity Mapping disetujui → perbarui Database Schema
```

Ini menegakkan Bagian 9.2 (Hierarki Kelas B mendahului Kelas D) secara operasional, mencegah pola "implementasi mendikte desain" yang merusak Single Source of Truth.

## 30.4 Impact Analysis Wajib

Untuk Structural Change, Impact Analysis wajib mencakup: daftar seluruh `EAI-XXX` yang dihasilkan, daftar dokumen yang perlu naik versi, dan estimasi apakah perubahan bersifat MAJOR atau MINOR (Bagian 22.2) pada tiap dokumen terdampak.

---

# 31. MIGRATION STRATEGY

## 31.1 Migrasi Dokumen Existing ke Standar EAF

Karena proyek sudah memiliki dokumen sumber bisnis/data (PRD, ERD, API Specification, User Flow, SEO Specification) berstatus v1.1 yang **belum** disusun mengikuti skema ID EAF (ditulis sebelum EAF ada), diperlukan migrasi bertahap:

| Fase Migrasi | Aktivitas | Prioritas |
|---|---|---|
| **Migrasi Fase 1 — Retrofit ID** | Menambahkan ID (REQ/BR/ENT/API/PERM) ke dokumen v1.1 yang sudah ada, tanpa mengubah isi substantifnya (Editorial/Additive Change, Bagian 30.2) | Tinggi — prasyarat sebelum modul baru (M12/M13) disinkronkan |
| **Migrasi Fase 2 — Validasi Silang** | Menjalankan Engineering Validation Checklist (Bagian 28) penuh terhadap dokumen yang sudah di-retrofit | Tinggi |
| **Migrasi Fase 3 — Resolusi Gap** | Menyelesaikan seluruh `EAI-XXX` yang ditemukan selama Fase 2, termasuk Minor Conflict lama yang sudah tercatat di `foundation-validation-report.md` | Sedang |
| **Migrasi Fase 4 — Modul Baru Sejak Awal Mengikuti EAF** | Modul 12 (Organization) dan Modul 13 (AI Assistant), yang dokumen bisnis/datanya belum disinkronkan, disusun **langsung** mengikuti EAF sejak Drafting pertama — tidak memerlukan retrofit | Tinggi — momentum tepat karena belum ada dokumen v1.1 untuk modul ini |

## 31.2 Prinsip Non-Disruptive Migration

Migrasi **tidak boleh** mengubah keputusan substantif yang sudah final (Bagian 5, Out of Scope) — migrasi murni menambahkan lapisan identifikasi dan traceability di atas isi yang sudah ada.

## 31.3 Migrasi Skema Database di Masa Depan

Untuk migrasi skema database fisik (bukan migrasi dokumen), EAF mewajibkan setiap migration script menyertakan komentar/referensi ke `ENT-XXX` dan/atau `BR-XXX` yang melatarbelakangi perubahan tersebut — menjaga traceability hingga ke level kode.

---

# 32. SCALABILITY GUIDELINE

## 32.1 Skalabilitas Skema ID

Skema ID (Bagian 16–20) dirancang dengan kapasitas 999 item per modul per jenis ID (`NNN` 3 digit) dan kapasitas modul hingga 99 (`MODUL` 2 digit) — jauh melampaui skala 13 modul yang ada saat ini, sehingga tidak memerlukan perombakan skema saat proyek bertumbuh.

## 32.2 Skalabilitas Proses Governance

| Skenario Pertumbuhan | Adaptasi EAF yang Diperlukan |
|---|---|
| Penambahan modul baru (M14+) | Cukup registrasi kode modul baru di Bagian 21.3 — Additive Change, tidak memerlukan amandemen struktural EAF |
| Proyek berkembang dari solo menjadi tim kecil | Peran Reviewer (Bagian 14.1) yang saat ini dijalankan sendiri oleh Owner dapat dialihkan ke anggota tim tanpa mengubah struktur EAF — hanya mengubah *siapa* menjalankan peran, bukan *apa* perannya |
| Proyek berkembang menjadi multi-tim/multi-Bounded Context besar | EAF dapat diperluas dengan lapisan "Domain Alignment Lead" per Bounded Context — dicatat sebagai kandidat evolusi di Bagian 33.2, bukan diimplementasikan sekarang (prinsip YAGNI, Bagian 6.2) |
| Kebutuhan tooling otomatis (linter/validator ID) | Checklist manual (Bagian 28) dapat digantikan/didukung tooling otomatis tanpa mengubah kriteria substantifnya — EAF mendefinisikan *apa* yang divalidasi, bukan mewajibkan *cara* validasi tetap manual selamanya |

## 32.3 Skalabilitas terhadap Volume Dokumen

Struktur Document Dependency Model (Bagian 12) menggunakan referensi graf eksplisit (bukan hierarki kaku tunggal), sehingga penambahan dokumen baru (Bagian 13.4) tidak memerlukan restrukturisasi total model ketergantungan yang sudah ada.

---

# 33. FUTURE EVOLUTION GUIDELINE

## 33.1 Prinsip Evolusi

EAF adalah *living document* yang **wajib** direvisi ketika kondisi proyek berubah signifikan, namun **setiap** revisi wajib mengikuti Change Management-nya sendiri (Bagian 30) — EAF tidak pernah direvisi secara informal.

## 33.2 Pemicu Evolusi yang Diantisipasi

| Pemicu | Dampak yang Diantisipasi |
|---|---|
| Proyek melewati ambang skala tertentu (mis. kriteria migrasi Search/Job Queue yang sudah dianalogikan di `ADR-005`/`ADR-006`) | Kemungkinan penambahan lapisan tooling otomatis untuk Quality Gate (Bagian 27) |
| Proyek melibatkan kontributor manusia tambahan | Aktivasi penuh pemisahan peran Reviewer/Approver yang saat ini digabung pada satu orang (Bagian 14.1, 32.2) |
| Ditemukan pola Engineering Alignment Issue berulang pada kategori yang sama | Evaluasi apakah diperlukan Bab baru atau penyempurnaan Bagian terkait pada MINOR/MAJOR version berikutnya |
| Regulasi/standar keamanan eksternal baru yang relevan (mis. perlindungan data pribadi) | Kemungkinan penambahan Bab Security & Compliance khusus sebagai perluasan Bagian 6.2 (Security by Design) |

## 33.3 Prosedur Amandemen Vocabulary Tertutup

Daftar tertutup seperti Aksi Permission (Bagian 20.2) hanya dapat diperluas melalui MINOR version EAF baru, dengan justifikasi eksplisit mengapa aksi yang ada tidak mencukupi — mencegah proliferasi istilah yang tidak perlu (prinsip KISS, Bagian 6.2).

## 33.4 Non-Goals yang Tetap Berlaku di Masa Depan

Terlepas dari evolusi apa pun, EAF **tidak akan pernah** mengambil alih kewenangan substantif dari `PROJECT-CONSTITUTION.md` atau `architecture-decision-records.md` (Bagian 5, 9) — batas ini bersifat permanen kecuali melalui restrukturisasi total hierarki governance proyek yang jauh melampaui cakupan dokumen ini.

---

# 34. APPENDIX

## 34.1 Glosarium Istilah Baku

| Istilah Baku | Definisi | Dilarang Sebagai Sinonim |
|---|---|---|
| Entity | Konsep domain yang direpresentasikan sebagai struktur data (Bagian 18) | "Objek", "Model" (dalam konteks dokumen non-kode) |
| Requirement | Kebutuhan fungsional/non-fungsional level fitur (Bagian 16) | "Fitur" (dipakai bebas di PRD naratif, namun ID resmi selalu `REQ-XXX`) |
| Business Rule | Aturan/constraint bisnis lintas fitur (Bagian 17) | "Validasi" (istilah ini dipakai khusus level implementasi teknis, bukan level bisnis) |
| Permission | Hak akses granular atas aksi-entity (Bagian 20) | "Hak akses", "Izin" (dalam dokumen formal — boleh dipakai naratif tapi ID resmi selalu `PERM-XXX`) |
| Bounded Context | Batas konseptual satu Modul dalam pengertian DDD (Bagian 7.2) | "Domain" (dipakai lebih luas, hindari ambiguitas) |
| Baseline | Versi dokumen yang dikunci sebagai acuan resmi (mewarisi definisi `document-governance-baseline-register.md`) | — |

## 34.2 Ringkasan Skema ID (Quick Reference)

| Jenis | Format | Contoh |
|---|---|---|
| Requirement | `REQ-[MODUL]-[NNN]` | `REQ-M03-012` |
| Business Rule | `BR-[MODUL]-[NNN]` | `BR-M03-004` |
| Entity | `ENT-[MODUL]-[NamaEntitySingular]` | `ENT-M03-Listing` |
| API Endpoint | `API-[MODUL]-[NNN]` | `API-M03-005` |
| Permission | `PERM-[MODUL]-[Aksi]-[NamaEntitySingular]` | `PERM-M03-Publish-Listing` |
| Engineering Alignment Issue | `EAI-[NNN]` | `EAI-001` |

## 34.3 Template Engineering Alignment Issue (Siap Pakai)

```
Issue ID          : EAI-___
Tanggal Ditemukan : ___
Ditemukan Oleh     : ___
Dokumen Terdampak  : ___
ID Elemen Terdampak: ___
Deskripsi Konflik  : ___
Tingkat Keparahan  : Critical / Major / Minor / Informational
Status             : Open / Under Review / Resolved / Deferred
Resolusi           : ___
```

## 34.4 Template Approval Record (Siap Pakai)

```
Dokumen                : ___ (versi ___)
Tanggal Approval         : ___
Approver                 : Mujtahid Aktanto
Catatan Kondisional       : ___
EAI Terkait yang Terbuka  : ___
```

## 34.5 Referensi Silang Dokumen Governance Terkait

| Dokumen | Relevansi terhadap EAF |
|---|---|
| `PROJECT-CONSTITUTION.md` v1.8 | Otoritas tertinggi (Lapisan 0) |
| `architecture-decision-records.md` | Sumber keputusan arsitektur (Lapisan 1) |
| `decision-log.md` | Riwayat kronologis, termasuk Open Decision |
| `document-governance-baseline-register.md` v1.1 | Sumber aturan lifecycle & versioning dokumen yang diwarisi penuh oleh EAF |
| `project-manifest.md` | Indeks status agregat seluruh dokumen, termasuk EAF setelah diregistrasi |
| `CHANGELOG.md` | Tempat pencatatan seluruh perubahan, termasuk hasil Change Management EAF |

---

*Dokumen ini disusun sebagai Governance Document berdiri sendiri (standalone), dirancang agar dapat dipahami dan diterapkan sepenuhnya oleh AI Coding Assistant maupun kontributor manusia tanpa memerlukan akses ke riwayat percakapan yang menghasilkannya — konsisten dengan prinsip Idempotent Documentation (Bagian 7.4) yang ditetapkannya sendiri. Dokumen ini berstatus Draft v1.0 dan wajib melalui Review (Bagian 25) serta Approval (Bagian 26) formal sebelum dapat dirujuk sebagai Baseline yang mengikat.*

**— AKHIR DOKUMEN: ENGINEERING ALIGNMENT FRAMEWORK v1.0 (Bab 1–34 Lengkap) —**
