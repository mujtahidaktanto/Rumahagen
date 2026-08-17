# PROJECT CONSTITUTION
## Platform Web RUMAHAGEN

**Status:** BERLAKU — Baseline — Dokumen ini mengikat semua AI Coding Assistant (Bolt.new, Cursor, Claude Code, GPT, Copilot, dsb.) dan seluruh kontributor manusia.
**Versi:** 1.11 (selaras dengan PRD, ERD & Skema Database (v1.2), ERD Diagram, API Specification, User Flow, dan SEO & Analytics Specification — dokumen sumber bisnis/data lain tetap v1.1, 26 Juli 2026, **belum disinkronkan pada revisi ini** — dan disinkronkan dengan `architecture-decision-records.md`, khususnya **ADR-001 — Backend Architecture (Approved, 27 Juli 2026)**, **ADR-005 — Search Strategy (Approved, 28 Juli 2026)**, **ADR-006 — Job Queue Strategy (Approved, 29 Juli 2026)**, **ADR-008 — Maps Provider (Approved, 30 Juli 2026, direvisi v3)**, **ADR-018 — Caching Strategy (Approved, 31 Juli 2026)**, **ADR-026/ADR-027 — Organization Management System, ADR-028 — AI Assistant Integration (Approved/Approved With Notes, 3 Agustus 2026)**, dan **ADR-046 — Perluasan Kebijakan Soft-Delete (Approved, 4 Agustus 2026)**; serta resolusi **OD-02** (seed role final), **OD-06** (kepemilikan dokumen), dan konfirmasi gate implementasi kode **Modul 12/Modul 13** (6-7 Agustus 2026))
**Last Updated:** 17 Agustus 2026
**Disusun oleh:** Mujtahid Aktanto (Solo Project Owner, AI-Assisted) — kapasitas Principal Software Architect (berdasarkan review menyeluruh dokumen sumber v1.0, kemudian diperbarui setelah audit konflik lintas dokumen diperbaiki langsung di seluruh dokumen sumber pada revisi v1.1; revisi v1.2 disusun untuk menyinkronkan seluruh aturan engineering dengan ADR-001 hasil Architecture Review Board; revisi v1.3 disusun untuk menyinkronkan lebih lanjut dengan ADR-005 hasil Architecture Review Board; revisi v1.4 disusun untuk menyinkronkan lebih lanjut dengan ADR-006 hasil Architecture Review Board; revisi v1.5 disusun untuk menyinkronkan lebih lanjut dengan ADR-008 hasil Architecture Review Board; revisi v1.6 disusun untuk menyinkronkan lebih lanjut dengan ADR-018 hasil Architecture Review Board; revisi v1.7 disusun untuk menyinkronkan Organization Management System (ADR-026/027) dan AI Assistant Integration (ADR-028) hasil Architecture Review Board, berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`; revisi v1.8 disusun untuk menyinkronkan resolusi OD-02 (seed role final = 7, Guest bukan baris `roles`), OD-06 (kepemilikan dokumen ditetapkan ke individu bernama), dan OD-07 (kebijakan soft-delete diperluas ke 8 tabel, `ADR-046`); **revisi v1.9 disusun untuk menyinkronkan Bagian 24 poin 10 terhadap konfirmasi eksplisit Owner bahwa gate implementasi kode Modul 13 (6 Agustus 2026) dan Modul 12 (7 Agustus 2026) telah dibuka** — kedua modul kini berstatus GO penuh tanpa syarat gate tambahan, konsisten `CURRENT-PROJECT-STATE.md` rev. 8).
**Sifat dokumen:** *Living constitution* — hanya boleh diubah lewat perubahan eksplisit yang disetujui, bukan diasumsikan ulang oleh AI assistant mana pun.
**Source of Truth Hierarchy:** `architecture-decision-records.md` (mengapa & alternatif yang dipertimbangkan) → **dokumen ini, `PROJECT-CONSTITUTION.md`** (aturan mengikat turunan) → `technology-decisions.md` (katalog stack resmi, v1.5) → `SYSTEM-ARCHITECTURE.md`/`API-Specification`/`ERD` (spesifikasi teknis rinci) → kode. Jika ditemukan konflik, dokumen yang lebih ke kiri pada urutan ini menang — lihat Bagian 25 (Governance).

**Riwayat Versi Dokumen** *(disusun sebagai tabel terpisah saat konsolidasi 9 Agustus 2026 — sebelumnya hanya berupa narasi panjang di field "Disusun oleh" di atas)*:

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0 | (sebelum 26 Jul 2026) | Draf awal, belum diaudit konflik lintas dokumen |
| 1.1 | 26 Jul 2026 | Resolusi audit konflik v1.0 → v1.1, sinkron dokumen sumber v1.1 |
| 1.2 | 28 Jul 2026 | Sinkron ADR-001 (Backend Architecture — Next.js Route Handlers, BFF tipis) |
| 1.3 | 28 Jul 2026 | Sinkron ADR-005 (Search Strategy) |
| 1.4 | 29 Jul 2026 | Sinkron ADR-006 (Job Queue Strategy) |
| 1.5 | 30 Jul 2026 | Sinkron ADR-008 (Maps Provider, direvisi v3) |
| 1.6 | 31 Jul 2026 | Sinkron ADR-018 (Caching Strategy) — 25/25 ADR original Approved |
| 1.7 | 3 Agu 2026 | Sinkron ADR-026/027 (Organization) & ADR-028 (AI Assistant) — 28/28 ADR Approved |
| 1.8 | 4 Agu 2026 | Sinkron OD-02 (seed role=7), OD-06 (kepemilikan dokumen), OD-07/ADR-046 (soft-delete 8 tabel) |
| 1.9 | 7 Agu 2026 | Gate implementasi kode Modul 12 & Modul 13 dikonfirmasi terbuka |
| 1.10 | 16 Agu 2026 | D6 Global AEP1–AEP4 semantic synchronization baseline promotion. |
| 1.11 | 17 Agu 2026 | P08 canonical synchronization governance: explicit separation of decision, semantic, intended physical, executed physical, and runtime-verified state; canonical source/authority propagation; historical preservation; implementation-readiness boundary |

> **Aturan utama untuk AI Coding Assistant apa pun yang membaca dokumen ini:**
> 1. Dokumen ini **mengalahkan** asumsi default framework/library apa pun.
> 2. Jika instruksi user bertentangan dengan dokumen ini, **tanyakan konfirmasi** sebelum menyimpang — jangan diam-diam mengikuti instruksi yang melanggar *hard rule* di sini (terutama Bagian 12 — Security Rules & Bagian 5 — Authorization).
> 3. Jika sebuah keputusan belum tercakup di sini, **jangan berasumsi bebas** — ikuti pola paling dekat yang sudah ada di dokumen ini, atau tandai sebagai `// TODO: perlu keputusan arsitektur` di kode.
> 4. **Selalu rujuk dokumen sumber versi 1.1** (`PRD-RUMAHAGEN-v1.1.md`, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`, `ERD-Diagram-v1.1.mermaid`, `API-Specification-RUMAHAGEN-v1.1.md`, `User-Flow-RUMAHAGEN-v1.1.md`, `SEO-Analytics-Specification-v1.1.md`) — versi v1.0 dari dokumen-dokumen tersebut **sudah usang dan tidak berlaku lagi**, digantikan sepenuhnya oleh v1.1.

---

## RIWAYAT KEPUTUSAN ARSITEKTUR (Resolusi Audit Konflik v1.0 → v1.1)

Audit awal terhadap dokumen sumber v1.0 menemukan 7 ketidakkonsistenan lintas dokumen. **Seluruh 7 poin ini telah diperbaiki langsung di masing-masing dokumen sumber (kini v1.1)** — bagian ini didokumentasikan sebagai riwayat keputusan yang **final dan tidak perlu ditanyakan ulang** oleh AI Coding Assistant mana pun, kecuali user secara eksplisit ingin merevisinya.

| # | Area | Keputusan Final (sudah diterapkan di dokumen v1.1) |
|---|---|---|
| 1 | **Role Buyer** | Ditambahkan resmi sebagai baris `roles.code = 'buyer'` di ERD (akun terdaftar ringan, opsional, untuk simpan listing/lead pribadi). Guest tanpa akun tetap didukung penuh untuk melihat listing & CTA WhatsApp. |
| 2 | **Cakupan akses Manager** | Ditegaskan **selalu global (`granted_scope = 'all'`)** di seluruh dokumen — tidak ada dan tidak akan ada level "scoped tim/wilayah" di rilis ini. Bagian User Flow yang sebelumnya menyebut pembatasan tim/wilayah untuk Manager telah dikoreksi. |
| 3 | **Role Instructor** | Diformalkan sebagai role internal ke-5 (`roles.code = 'instructor'`) di tabel role utama PRD — setara Admin, terbatas ke Modul 4 (Learning Center) saja. |
| 4 | **Satuan Tenor KPR** | Ditetapkan **selalu bulan** (`tenor_months`) sebagai kontrak data/API. UI boleh menampilkan input dalam tahun, tapi wajib dikonversi (`tahun × 12`) di sisi client sebelum dikirim ke API. |
| 5 | **`developer_projects.city`** | Dimigrasi dari `VARCHAR` freetext menjadi `city_id` (FK → `ref_cities`), konsisten dengan `listings.city_id`. |
| 6 | **Framework SSR/SSG** | **Next.js (App Router)** ditetapkan sebagai keputusan default arsitektur di seluruh dokumen sumber (lihat Bagian 4 di bawah). |
| 7 | **Fitur review/rating agen** | **Diaktifkan di Fase 1.** Tabel `agent_reviews` ditambahkan ke ERD (dengan alur moderasi: submit oleh Buyer → status `pending` → approve/reject oleh Admin/Manager/Superadmin). Endpoint submit & moderasi ditambahkan ke API Specification. `aggregateRating` di structured data SEO kini relevan sejak awal. |
| 8 | **Backend Architecture (ADR-001)** | **Dikunci final (27 Juli 2026, via Architecture Review Board): Next.js Route Handlers sebagai BFF tipis, terintegrasi langsung dengan Supabase.** Opsi "service backend terpisah (NestJS/Express)" yang sebelumnya masih terbuka di Bagian 4 v1.1 kini **ditolak** untuk cakupan proyek saat ini — tidak ada `apps/api` terpisah. **Bolt.new** dikonfirmasi sebagai bagian toolchain resmi proyek. Detail lengkap: `architecture-decision-records.md` ADR-001; lihat Bagian 22 (Architecture Principles) & Bagian 24 (Technical Constraints). |
| 9 | **Search Strategy (ADR-005)** | **Dikunci final (28 Juli 2026, via Architecture Review Board): PostgreSQL Full-Text Search + ekstensi `pg_trgm` untuk Fase 1 (MVP), migrasi terjadwal ke Typesense di Fase 2** begitu salah satu kriteria ambang tercapai (volume listing aktif >±50.000, latensi p95 `/properties/search` >500ms, atau keluhan relevansi berulang ≥3 laporan independen/sprint). Status "belum ditentukan" pada baris Search Engine di Bagian 4 v1.2 kini **diselesaikan** — tidak ada lagi opsi terbuka Typesense/Elasticsearch sejak Fase 1. Detail lengkap: `architecture-decision-records.md` ADR-005; lihat Bagian 4 (Tech Stack), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 10 | **Job Queue Strategy (ADR-006)** | **Dikunci final (29 Juli 2026, via Architecture Review Board): Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1, migrasi terjadwal ke QStash (Upstash) di Fase 2** begitu salah satu kriteria ambang tercapai (volume job harian melampaui kapasitas batching per invocation, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval tier Vercel). **BullMQ+Redis ditolak** — worker long-running-nya tidak kompatibel dengan model serverless Vercel yang dikunci ADR-001. Status "belum final" pada baris Job Queue di Bagian 4 v1.3 kini **diselesaikan** — tidak ada lagi opsi terbuka Supabase Edge Functions/BullMQ sejak Fase 1. Detail lengkap: `architecture-decision-records.md` ADR-006; lihat Bagian 4 (Tech Stack), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 11 | **Maps Provider (ADR-008)** | **Dikunci final (30 Juli 2026, via Architecture Review Board, direvisi v3): Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider**, dilengkapi caching berbasis Postgres (`geocode_cache`, tanpa Redis), rate limiting scoped endpoint Maps, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise (termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise). Status "belum final" pada baris Maps/Geocoding di Bagian 4 v1.4 kini **diselesaikan** — dipilih atas kriteria budget-friendly, adopsi komunitas developer Indonesia, dan Bolt-friendliness (bukan akurasi data semata). Detail lengkap: `architecture-decision-records.md` ADR-008; lihat Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 12 | **Caching Strategy/Rate Limiting (ADR-018)** | **Dikunci final (31 Juli 2026, via Architecture Review Board): Supabase Postgres — tabel `rate_limit_log` (pola sliding window) — untuk Fase 1 (MVP)**, tanpa menambah infrastruktur cache/in-memory-store baru, dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu salah satu kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit gabungan, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). Status "belum final (OPEN)" pada baris Cache/Rate Limit di Bagian 4 v1.5 kini **diselesaikan** — ini adalah ADR terakhir dari kelompok 5 ADR arsitektur/teknis original, menjadikan **25 dari 25 ADR** kelompok tsb berstatus Approved (kemudian bertambah menjadi 28/28 dengan ADR-026/027/028, lihat poin #13–14). Detail lengkap: `architecture-decision-records.md` ADR-018; lihat Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 13 | **Organization Management System (ADR-026, ADR-027)** | **Dikunci final (3 Agustus 2026, via Architecture Review Board, Approved With Notes/Approved): entitas baru `organizations`/`organization_members`/`organization_invitations`**, dimensi `organization_status` (`individual`/`leader`/`member`) terpisah dari `roles.code` platform. Satu agen maksimal 1 Organization aktif; tidak ada transfer kepemimpinan. Otorisasi Organization dibangun sebagai **lapisan kedua independen** dari RBAC platform (ADR-024 **tidak diubah**) — Leader/Member scope dicek terpisah setelah gate role platform lolos. Merevisi status **ADR-023** (Multi-Tenancy Strategy) — `organization_id` adalah grouping construct ringan, **bukan** `tenant_id`/isolasi penuh. Modul 12 baru ditambahkan ke cakupan sistem (Bagian 1). Detail lengkap: `architecture-decision-records.md` ADR-026/ADR-027; sumber: `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`. **Catatan cakupan:** siklus ini murni governance/arsitektur — dokumen sumber bisnis/data v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec) belum disinkronkan, dijadwalkan paket terpisah menyusul. |
| 14 | **AI Assistant Integration / BYOK (ADR-028)** | **Dikunci final (3 Agustus 2026, via Architecture Review Board, Approved With Notes): model BYOK (Bring Your Own Key)** — agen (seluruh role internal berakun) menghubungkan API key sendiri dari provider terkurasi (**Google Gemini, Groq, Mistral, GitHub Models** — dipilih atas free tier berkelanjutan), diproksi backend, ditampilkan chat UI custom di dalam SaaS. Riwayat chat **tidak dipersist** sama sekali (transient, state browser). Berdiri independen dari ADR-026/027 (Organization) — tidak menyentuh entitas `organizations`/`listings`. Modul 13 baru ditambahkan ke cakupan sistem (Bagian 1). Detail lengkap: `architecture-decision-records.md` ADR-028; sumber: proposal yang sama, Bagian 18. **Catatan cakupan:** sama seperti poin 13, dokumen sumber bisnis/data v1.1 belum disinkronkan pada siklus ini. |

> Selain 7 poin di atas, seluruh "Hal yang Perlu Dikonfirmasi" lain yang masih tercantum di masing-masing dokumen sumber v1.1 (threshold DBR final, model monetisasi, kebijakan eksklusivitas developer per wilayah, provider payment gateway, pemegang akun GTM/GSC/GA4, dsb.) **tetap berstatus terbuka secara sah** — bukan konflik, melainkan keputusan bisnis yang memang belum diambil. AI Coding Assistant wajib membuat parameter tersebut **configurable** (lewat `system_configs`/`dbr_config`), bukan hard-code, agar tidak menimbulkan breaking change saat keputusan bisnis final turun (lihat Bagian 21 poin 4).

---

## P08 CANONICAL SYNCHRONIZATION GOVERNANCE

### Canonical-State Hierarchy

The project distinguishes the following layers:

```text
Decision Authority
        ↓
Canonical Semantic Architecture
        ↓
Intended Physical Model
        ↓
Executed Physical State
        ↓
Runtime Verified State
```

A lower layer cannot silently override a higher layer.

Actual implementation evidence may identify an implementation gap, drift, or runtime discrepancy; it does not retroactively change an approved semantic or governance decision.

### MAEP / AEP Propagation Rule

- The Cross-AEP / MAEP package is the consolidated architecture-evolution input for downstream synchronization.
- AEP #1–#4 remain governing decision/provenance inputs within their approved scope.
- D6 represents the completed global semantic synchronization state.
- Historical AEP, ADR, MADCR, and prior baseline artifacts are preserved for provenance and audit.
- Approved changes are propagated into downstream canonical documents through controlled revisions; historical artifacts are not silently rewritten.

### Implementation-Readiness Boundary

> **Semantic synchronization does not constitute physical implementation authorization.**

The following remain governed by their own applicable gates and must not be inferred as authorized merely because this Constitution has been synchronized:

- physical database schema migration;
- provider activation or production integration;
- automatic failover activation;
- unresolved authorization IDs / RLS mechanics;
- unresolved evidence contracts and physical designs;
- frontend runtime closure;
- other implementation steps explicitly held by their respective technical gates.

### Canonical Baseline Principle

The Canonical Project Baseline is a reconciled control state.

It does not replace historical documents. Historical files remain available as provenance and audit evidence.

### D6 / Version Authority Rule

D6 is a synchronization state, not an automatic replacement of this document's formal version authority.

The formal version is governed by the document lifecycle. A D6/GLOBAL-SYNCHRONIZED filename must not, by itself, cause a version bump or rewrite of historical content.

---

## 1. TUJUAN SISTEM

Platform ini mendigitalisasi operasional agensi properti Indonesia secara end-to-end:
1. Onboarding & administrasi agen properti secara mandiri (self-service registration + verifikasi dokumen).
2. Manajemen profil profesional agen sebagai "kartu nama digital" publik.
3. Manajemen listing properti per-agen (kategori Primary/Secondary, tujuan Jual/Sewa) dengan pencarian publik yang cepat & SEO-friendly.
4. Peningkatan kapabilitas agen lewat Learning Center (kursus, kuis, sertifikasi gratis).
5. Kolaborasi bisnis agen dengan developer properti lewat katalog proyek & skema komisi.
6. Membantu agen melakukan pre-screening kelayakan KPR calon pembeli lewat kalkulator DBR/DSR.
7. Memastikan seluruh halaman publik terindeks mesin pencari secepat & seakurat mungkin sejak hari pertama rilis (bukan ditambal belakangan).

**Prinsip arsitektur tertinggi:** keputusan yang mahal untuk diubah kembali (strategi rendering, struktur URL/slug, skema RBAC inti) **wajib diselesaikan di Fase 1**, bukan ditunda.

## 2. BUSINESS DOMAIN

- **Domain:** PropTech / Real Estate Agency SaaS — B2B2C (platform digunakan internal agensi & agennya, dikonsumsi publik oleh calon pembeli/penyewa).
- **Model transaksi:** platform **tidak** memproses transaksi jual-beli properti secara langsung (bukan payment gateway untuk closing properti) — nilai jual utama adalah *lead generation* (CTA WhatsApp) dan *tooling* (Learning Center, DBR Scoring, katalog developer).
- **Yurisdiksi:** Indonesia — mengacu UU PDP (Perlindungan Data Pribadi), memakai data wilayah administratif resmi Kemendagri/BPS, memakai standar perhitungan DBR/DSR perbankan Indonesia, mata uang IDR.
- **Kanal distribusi utama:** share manual link listing ke WhatsApp/Instagram/Facebook oleh agen — karena itu Open Graph/Twitter Card **wajib** berfungsi sempurna di setiap listing (lihat Bagian 9).
- **Monetisasi:** belum final (masih tercantum di "Hal Perlu Dikonfirmasi" masing-masing dokumen sumber) — kemungkinan komisi transaksi, tier keanggotaan, atau boost listing berbayar di fase lanjutan. Tidak ada logika pembayaran wajib di MVP; `POST /billing/*` hanya placeholder non-breaking.

## 3. TARGET USER & DAFTAR SELURUH ROLE

### 3.1 Hierarki Role Internal (dari tertinggi ke terendah)
```
Superadmin → Manager → Admin → Instructor → Agen
```
